# Architecture Decision Records

<!--
Each ADR captures a significant technical decision: what was decided, why, and what alternatives were rejected.
When Claude Code or a future contributor asks "why is it done this way?" — the answer lives here.

Format: add new entries at the top (newest first).
Status: Accepted | Superseded | Deprecated
-->

---

## ADR-006 — Railway for server deployment

**Date:** 2026-05-26
**Status:** Accepted

**Decision:** Deploy the Hono server on Railway.

**Reasons:**

- Simple monorepo support with minimal config
- Automatic deploys from Git
- Built-in managed PostgreSQL available
- `start.sh` used as the production entry point

**Implications:**

- `PORT` is injected by Railway — never hardcode it
- `CORS_ORIGIN` must be set as a Railway env var for production
- Do not remove or modify `start.sh` without understanding Railway's build config

---

## ADR-005 — EAS for mobile deployment

**Date:** 2026-05-26
**Status:** Accepted

**Decision:** Use Expo Application Services (EAS) for building and distributing the mobile app.

**Reasons:**

- Native build infrastructure without managing Xcode/Android Studio CI
- OTA updates via Expo Updates
- `.easignore` controls what's excluded from builds

**Implications:**

- Secrets go in EAS Secrets, not in `app.json` or `.env`
- `.easignore` is intentional — do not modify without understanding build output

---

## ADR-004 — t3-oss/env-core for environment variable validation

**Date:** 2026-05-26
**Status:** Accepted

**Decision:** All environment variables are declared and validated in `packages/env` using `@t3-oss/env-core`.

**Reasons:**

- Type-safe env vars with runtime validation at startup
- Single source of truth for what env vars the app needs
- Fails fast at boot if a required var is missing

**Implications:**

- Never access `process.env` directly outside `packages/env`
- Import from `@repo/env/server` or `@repo/env/client`
- Adding a new env var requires updating `packages/env` first

---

## ADR-003 — oRPC for typed API communication

**Date:** 2026-05-26
**Status:** Accepted

**Decision:** Use oRPC (`@orpc/server`) as the primary API layer instead of plain REST.

**Reasons:**

- End-to-end type safety between server procedures and mobile client without codegen
- Built-in OpenAPI generation via `OpenAPIHandler` at `/api-reference`
- Middleware system (`protectedProcedure`) cleanly separates auth concern from business logic
- `RPCHandler` and `OpenAPIHandler` both mount on `/*` and match by prefix internally — no explicit Hono route registration needed

**Alternatives rejected:**

- tRPC — less flexible for non-React clients and OpenAPI generation
- Plain REST — no type safety without separate codegen step

**Implications:**

- All new features go through oRPC procedures in `packages/api/routers/`
- Legacy Hono routes in `apps/server/src/routes/` predate this decision and bypass oRPC auth — do not extend them
- `protectedProcedure` is the correct way to require auth, not manual session checks

---

## ADR-002 — Better Auth for authentication

**Date:** 2026-05-26
**Status:** Accepted

**Decision:** Use Better Auth for session management and authentication.

**Reasons:**

- Self-hosted, no per-MAU pricing
- First-class Prisma adapter
- Handles session storage, rotation, and cookie management
- Email/password supported out of the box; social providers (Google, Apple) are post-MVP

**Alternatives rejected:**

- Clerk — per-MAU pricing, less control over data
- Supabase Auth — would couple auth to a specific DB provider

**Implications:**

- Auth instance lives in `packages/auth` — never instantiate elsewhere
- Auth routes are at `/api/auth/*` on the server — do not move or replicate
- Mobile uses Better Auth client from `lib/auth-client.ts`
- Google and Apple OAuth are planned post-MVP — auth package should support this without restructuring

---

## ADR-001 — Prisma + PostgreSQL as the data layer

**Date:** 2026-05-26
**Status:** Accepted

**Decision:** Use Prisma ORM with PostgreSQL as the primary database.

**Reasons:**

- Type-safe queries with generated client
- Schema migrations with `prisma migrate`
- PostgreSQL chosen for relational data model (users → items → categories → outfits)

**Implications:**

- PrismaClient is a singleton in `packages/db` — never instantiate elsewhere
- Schema changes require a named migration: `prisma migrate dev --name <slug>`
- Never expose raw Prisma model types in API responses — map to response shape explicitly
- Schema changes that affect API contracts require a spec update first
