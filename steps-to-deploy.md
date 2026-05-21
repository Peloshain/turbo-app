# Railway Deployment Notes

## Dockerfile

- Build from monorepo root (not `apps/server`) so workspace packages resolve
- Copy each `package.json` manifest individually before `pnpm install` for layer caching
- Run `prisma generate --config=prisma.config.ts` (not `--schema`) to handle multi-file schemas
- Use `tsup` instead of raw `tsc` to handle `bundler` moduleResolution
- Use absolute paths everywhere in CMD

## TypeScript / Build

- Added `tsconfig.json` to `apps/server` (it didn't exist)
- Switched to `moduleResolution: bundler` + `noEmit: true` since tsup handles compilation
- Added `allowImportingTsExtensions: true` to `packages/db/tsconfig.json`

## ESM Imports

- Added `.ts` extensions to every relative import across all packages:
  - `packages/db/src/index.ts`
  - `packages/storage/src/index.ts`, `factory.ts`, `adapters/*.ts`
  - `packages/ai/src/index.ts`, `adapters/*.ts`, `utils/index.ts`
  - `packages/api/src/index.ts`, `routers/index.ts`
- Prisma generated client import changed to `../generated/prisma/client.ts`

## Runtime

- Replaced `hono/bun` → `hono/node-server` (then removed entirely in favor of Bun native)
- Added `serve()` call with `process.env.PORT` — server wasn't starting at all
- Moved `/health` route above all middleware so it isn't intercepted by the catch-all
- Wrapped `serveStatic` in `if (env.STORAGE_PROVIDER === "local")`

## Railway Config

- Renamed `Dockerfile.yml` → `Dockerfile`
- Package name was `"api"` not `"server"` — fixed `--filter api` in all commands
- Added `${{Postgres.DATABASE_URL}}` reference in server service variables
- Used `prisma migrate deploy` in `start.sh` with absolute paths
- Added `skipDuplicates: true` to seed to make it idempotent on every deploy
- Enabled public TCP proxy in Networking tab to connect pgAdmin externally
