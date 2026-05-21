# Project Context

## Stack
- **Monorepo** managed with `pnpm` workspaces
- **Expo app** deployed via EAS (preview)
- **Hono server** deployed on Railway
- **Database**: PostgreSQL on Railway
- **Storage**: Cloudflare R2 (migrating from local)
- **ORM**: Prisma 7.x with multi-file schema
- **Auth**: Better Auth
- **API layer**: oRPC (`@orpc/server`, `@orpc/openapi`)

## Monorepo Structure
```
apps/
  server/          # Hono API server (package name: "api")
packages/
  ai/              # AI adapters (Gemini, LMStudio, OpenAI, Anthropic)
  api/             # oRPC routers and context
  auth/            # Better Auth setup
  config/          # Shared config
  db/              # Prisma client and schema
  env/             # @t3-oss/env-core environment validation
  storage/         # Storage factory + adapters (local, R2)
```

## Server (`apps/server`)
- **Runtime**: Bun (dev and production)
- **Entry point**: `src/index.ts`
- **Build**: `tsup src/index.ts --format cjs --outDir dist --no-splitting --target node22`
- **Start**: `bun apps/server/src/index.ts` (via `start.sh`)
- **Package name**: `"api"` — use `--filter api` in pnpm commands

### Key files
- `apps/server/tsconfig.json` — `moduleResolution: bundler`, `noEmit: true`, `allowImportingTsExtensions: true`
- `apps/server/start.sh` — runs migrations, seed, then starts server
- `Dockerfile` — at monorepo root
- `railway.toml` — at monorepo root

## Database (`packages/db`)
- **Prisma config**: `packages/db/prisma.config.ts` (multi-file schema)
- **Schemas**: `packages/db/prisma/schema.prisma` + `packages/db/prisma/auth.prisma`
- **Generated client**: `packages/db/generated/prisma/client.ts`
- **Generate command**: `prisma generate --config=prisma.config.ts`
- **Migrate command**: `prisma migrate deploy --config=prisma.config.ts`
- **Adapter**: `@prisma/adapter-pg` (PrismaPg)

### Important
- Import generated client as `../generated/prisma/client.ts` (with `.ts` extension)
- `packages/db/tsconfig.json` needs `allowImportingTsExtensions: true` and `noEmit: true`

## ESM Import Rules
All relative imports across all packages **must include `.ts` extension**:
```ts
// Correct
import { Foo } from "./foo.ts"
export * from "./bar.ts"

// Wrong — breaks at runtime on Node/Bun ESM
import { Foo } from "./foo"
```

## Storage (`packages/storage`)
- Factory pattern in `factory.ts` — reads `STORAGE_PROVIDER` env var
- Adapters: `local.adapter.ts`, `r2.adapter.ts`
- R2 adapter uses `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`

## Environment Variables (Railway)
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3000
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=
CORS_ORIGIN=
NODE_ENV=production
```

## Railway Setup
- **Project**: monorepo root with `Dockerfile` and `railway.toml`
- **Services**: `api` (server) + `PostgreSQL`
- **Dockerfile**: at repo root (not in `apps/server`)
- **Filter commands**: always use `--filter api` (not `--filter server`)
- **Postgres internal host**: `postgres.railway.internal` (only reachable inside Railway)
- **Postgres public host**: enabled via Networking tab → TCP Proxy (custom port, not 5432)

## `start.sh`
```sh
#!/bin/sh
set -e
cd /app/packages/db
bunx prisma migrate deploy --config=prisma.config.ts
bunx tsx prisma/seed.ts
cd /app
exec bun /app/apps/server/src/index.ts
```

## Seed
- Located at `packages/db/prisma/seed.ts`
- Run via: `pnpm --filter @repo/db run db:seed`
- Uses `skipDuplicates: true` to be idempotent on every deploy
- To run against Railway DB locally: `railway run pnpm --filter @repo/db run db:seed` (from monorepo root)

## Dockerfile (summary)
```dockerfile
FROM node:22-alpine AS base
RUN npm i -g pnpm
WORKDIR /app

# Copy manifests first (layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/*/package.json ./packages/*/   # one line per package

RUN pnpm install --frozen-lockfile

COPY apps/server ./apps/server
COPY packages ./packages

RUN pnpm --filter @repo/db exec prisma generate --config=prisma.config.ts
RUN pnpm --filter api add -D tsup
RUN pnpm --filter api build && ls /app/apps/server/dist

EXPOSE 3000
CMD ["sh", "/app/apps/server/start.sh"]
```

## Known Gotchas
- `hono/bun` is incompatible with Node — use `hono/node-server` or Bun native export
- `serveStatic` must be wrapped in `if (env.STORAGE_PROVIDER === "local")`
- `/health` route must be defined **before** the catch-all `app.use("/*")` middleware
- `prisma.config.ts` loads `.env` from `../../apps/server/.env` — this overrides Railway's injected env when running `railway run` locally; use the public `DATABASE_URL` directly instead
- Local storage on Railway is ephemeral — files are lost on redeploy
- `railway run` must be executed from the monorepo root directory
