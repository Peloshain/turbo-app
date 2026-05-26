# Project Context

## Overview

Consumer mobile app (wardrobe/outfit manager) — Expo (mobile) + Hono (server) monorepo.

## Monorepo Structure

```
apps/
  mobile/        # Expo app — see apps/mobile/CLAUDE.md
  server/        # Hono API server — see apps/server/CLAUDE.md
packages/
  db/            # Prisma config + PrismaClient export
  ai/            # AI factory with adapters
  api/           # oRPC router, HonoContext, requireAuth export
  auth/          # Better Auth instance (createAuth)
  config/        # Shared tsconfig
  env/           # t3-oss/env-core environment variable validation
  storage/       # Storage factory + adapters (local, cloud)
docs/
  specs/
    _template.md          # Spec template — always use this
    _decisions.md         # Architecture Decision Records
    features/             # One file per feature
    remediation/          # Audit findings and fix plans
```

## Stack

| Layer         | Technology                               |
| ------------- | ---------------------------------------- |
| Mobile        | Expo (React Native), Expo Router         |
| Server        | Hono + @hono/node-server                 |
| API layer     | oRPC (RPCHandler + OpenAPIHandler)       |
| Auth          | Better Auth (`packages/auth`)            |
| Database      | PostgreSQL + Prisma ORM (`packages/db`)  |
| Validation    | Zod (shared via `packages/api` / `lib/`) |
| Data fetching | TanStack Query (React Query) on mobile   |
| AI            | Adapter factory in `packages/ai`         |
| Storage       | Adapter factory in `packages/storage`    |
| Deploy        | Railway (server), EAS (mobile)           |

## Key Architectural Decisions

- **oRPC over plain REST:** All typed API communication goes through oRPC (`/rpc` prefix).
  The `/api-reference` prefix serves OpenAPI docs. Do not add plain REST routes for new features.

- **packages/api is the API boundary:** The `appRouter` lives in `packages/api/routers/index`.
  Route files in `apps/server/src/routes/` are legacy — new features go through oRPC in `packages/api`.

- **packages/env owns all env vars:** Use `@repo/env/server` or `@repo/env/client`.
  Never access `process.env` directly outside of `packages/env`.

- **packages/storage handles all file I/O:** Never write file system or S3 logic in app code.
  Use `storageService` from `@repo/storage`.

- **Railway deploy constraints:** `start.sh` and any Railway-specific config are intentional.
  Do not remove or modify deployment scripts without understanding the Railway setup.

## Spec-Driven Development (SDD) — Non-Negotiable Rules

1. **Spec before code.** Every feature starts with a spec in `docs/specs/features/<name>.md`.
   Use `docs/specs/_template.md`. Do not write implementation code without an Approved spec.

2. **Spec is the source of truth.** If code and spec disagree, one of them is wrong.
   Update the spec first, then the code — never silently drift.

3. **Data contracts live in the spec.** oRPC procedure input/output shapes defined in a spec
   are canonical. Types in `packages/` flow from them.

4. **Tests reference the spec.** Add a comment to each test block:
   `// spec: <feature>.md#<section>` (e.g. `// spec: outfits.md#3.2`)

5. **Remediation plans live in `docs/specs/remediation/`.** Format: `YYYY-MM-DD-<slug>.md`.
   Never fix a found issue silently — document it first.

6. **Spec statuses:**
   - `Draft` — being written, do not implement
   - `RFC` — open for review, do not implement
   - `Approved` — implementation may begin
   - `Deprecated` — feature removed or superseded

## Error Handling Convention

- oRPC errors use oRPC's error primitives — do not throw plain `Error` in procedures
- Never expose internal error messages, Prisma internals, or stack traces to clients
- Mobile: every TanStack Query error state must be handled in UI — no silent failures

## What NOT to Do

- Do not add new plain Hono routes for features — use oRPC procedures in `packages/api`
- Do not access `process.env` directly — always go through `@repo/env`
- Do not write auth logic manually — use `requireAuth` from `@repo/api/context` or Better Auth
- Do not instantiate PrismaClient outside `packages/db`
- Do not write storage/file logic outside `packages/storage`
- Do not remove Railway deploy config (`start.sh`, Railway env vars) without explicit intent
