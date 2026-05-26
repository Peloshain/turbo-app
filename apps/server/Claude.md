# Server Context — Hono API (apps/server)

> See root CLAUDE.md for project-wide rules. This file adds server-specific context.

## Stack

- **Framework:** Hono + @hono/node-server
- **API layer:** oRPC — RPCHandler (`/rpc`) + OpenAPIHandler (`/api-reference`)
- **Auth:** Better Auth via `@repo/auth`
- **ORM:** Prisma via `@repo/db`
- **Database:** PostgreSQL
- **Env:** `@repo/env/server` (t3-oss/env-core)
- **Storage:** `@repo/storage`
- **Deploy:** Railway — `start.sh` configures the production start command

## Actual Directory Structure

```
apps/server/
  src/
    routes/
      categories.ts    # Legacy Hono route — items/categories CRUD
      items.ts         # Legacy Hono route — wardrobe items
      outfits.ts       # Legacy Hono route — outfit management
    index.ts           # App entry: Hono app, middleware, oRPC handlers, route registration
  .env                 # Local env vars (never commit)
  start.sh             # Railway production start script — do not modify without intent
```

## How the Server Works (read index.ts carefully)

The server runs **two parallel API systems:**

1. **oRPC (primary, typed)** — `appRouter` from `@repo/api/routers/index`
   - Both `RPCHandler` and `OpenAPIHandler` are mounted on `/*` as Hono middleware
   - They match requests by prefix internally (`/rpc` and `/api-reference`) and fall through if unmatched
   - Do NOT register `/rpc` or `/api-reference` as explicit Hono routes — the middleware handles this
   - Context is created per-request via `createContext` from `@repo/api/context`
   - Auth is enforced inside procedures via `protectedProcedure` (uses `requireAuth` middleware)
   - **All new features must be added as oRPC procedures in `packages/api/routers/`**

2. **Legacy Hono routes (do not extend)** — `apps/server/src/routes/`
   - `items.ts`, `categories.ts`, `outfits.ts` are plain Hono routes registered after oRPC middleware
   - **These routes bypass oRPC's auth system entirely** — `requireAuth` does not protect them
   - Do not add any new logic here — these are candidates for migration to oRPC, not extension
   - If you need to fix a bug in these files, note it in a remediation spec first

### Middleware Order (matters — do not reorder)

1. `/health` — unauthenticated health check
2. CORS — applied to `/*` using `env.CORS_ORIGIN`
3. Better Auth handler — `POST/GET /api/auth/*`
4. oRPC middleware — handles `/rpc` and `/api-reference`, falls through if unmatched
5. Static file serving — `/uploads/*`
6. Upload handler — `PUT /uploads/*` (local storage only, guarded by `env.STORAGE_PROVIDER`)
7. Legacy routes — `/items`, `/categories`, `/outfits`

## Adding New Features

**Always use oRPC — never add new plain Hono routes.**

Steps:

1. Write the spec in `docs/specs/features/<name>.md` (must be Approved before coding)
2. Create `packages/api/src/routers/<name>.ts` with your procedures
3. Register the router in `packages/api/src/routers/index.ts` under `appRouter`
4. Use `protectedProcedure` for anything user-specific, `publicProcedure` for public endpoints
5. Import `prisma` from `@repo/db` for database access

```ts
// packages/api/src/routers/items.ts
import { protectedProcedure } from "../index.ts";
import { z } from "zod";

export const itemsRouter = {
  list: protectedProcedure
    .input(z.object({ categoryId: z.string().optional() }))
    .handler(async ({ input, context }) => {
      // context.session.user is guaranteed non-null here (narrowed by requireAuth)
      return [];
    }),
};

// packages/api/src/routers/index.ts — add to appRouter:
// import { itemsRouter } from "./items.ts"
// export const appRouter = { healthCheck, privateData, items: itemsRouter }
```

## Auth

- Better Auth instance imported from `@repo/auth`
- Auth routes handled at `/api/auth/*` — do not move or replicate
- Protect procedures with `protectedProcedure` (from `@repo/api`) — not manually
- `requireAuth` is already wired into `protectedProcedure` — do not call it directly
- Never re-implement session checking inside a handler body

## Environment Variables

- All env vars live in `packages/env` using t3-oss/env-core
- Import from `@repo/env/server` — never `process.env` directly
- Key server vars: `CORS_ORIGIN`, `STORAGE_PROVIDER`, `PORT`
- Railway injects production env vars — local `.env` is for development only

## Storage

- All file operations go through `storageService` from `@repo/storage`
- Upload endpoint (`PUT /uploads/*`) is only active when `STORAGE_PROVIDER=local`
- In production (Railway), storage provider will differ — check `packages/storage` adapters

## Railway Deploy Notes

- `start.sh` is the production entry point — Railway calls this
- Port is read from `process.env.PORT` (Railway injects this) with fallback to 3000
- CORS origin must be set via Railway env var `CORS_ORIGIN` for production mobile/web clients
- Do not hardcode Railway-specific values — they come from env

## Security Checklist (verify for every new oRPC procedure)

- [ ] Procedure requires auth via `requireAuth` if user-specific data is involved
- [ ] Input validated with Zod (oRPC handles this — define input schema on the procedure)
- [ ] No raw SQL — use Prisma query API from `@repo/db`
- [ ] No secrets or internal error details returned to client
- [ ] CORS origin is not wildcarded in production
