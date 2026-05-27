# Package Contract: @repo/api

**Last Updated:** 2026-05-26

This document defines what `packages/api` exports, what consuming code may depend on, and what must never change without a spec update.

---

## What This Package Does

`packages/api` is the API boundary of the entire application. It owns:

- The oRPC procedure definitions (`appRouter`)
- The per-request context shape (`Context`)
- The auth middleware (`protectedProcedure`)
- The typed client interface (`AppRouterClient`)

Both the server (`apps/server`) and the mobile app (`apps/mobile`) depend on this package. Changes here can break both simultaneously.

---

## Exports

### `appRouter` — `src/routers/index.ts`

The root oRPC router. All procedures live here or are nested under it.

```ts
import { appRouter } from "@repo/api/routers/index";
```

**Consumers:** `apps/server/src/index.ts` (RPCHandler + OpenAPIHandler)

**Rules:**

- Every new feature router must be registered here
- Procedure names are part of the public API — renaming breaks the mobile client
- Do not remove or rename existing procedures without a deprecation spec

---

### `AppRouter` / `AppRouterClient` — `src/routers/index.ts`

TypeScript types for the router and its client.

```ts
import type { AppRouter, AppRouterClient } from "@repo/api/routers/index";
```

**Consumers:** `apps/mobile` (typed oRPC client)

---

### `publicProcedure` / `protectedProcedure` — `src/index.ts`

The two base procedure builders. All procedures in `src/routers/` are built from one of these.

```ts
import { publicProcedure, protectedProcedure } from "@repo/api";
```

**Rules:**

- `publicProcedure` — no auth check, any request
- `protectedProcedure` — requires `context.session.user`, throws `UNAUTHORIZED` if absent
- Never re-implement auth checking inside a handler body — use `protectedProcedure`
- Never export `requireAuth` middleware directly — it is an internal implementation detail

---

### `createContext` — `src/context.ts`

Creates the per-request context by resolving the Better Auth session from request headers.

```ts
import { createContext } from "@repo/api/context";
```

**Consumers:** `apps/server/src/index.ts`

**Current context shape:**

```ts
{
  auth: null; // always null — unused, candidate for removal
  session: Session | null;
}
```

**Known issues (see remediation specs):**

- The `catch` block returns `undefined` instead of `{ auth: null, session: null }` — this causes runtime errors in procedures if session resolution throws
- `auth: null` is a dead field — never set, never read

**Rules:**

- `createContext` must always return a valid `Context` shape — never `undefined`
- Do not access `context.session` without a null check in `publicProcedure` handlers
- In `protectedProcedure` handlers, `context.session` is guaranteed non-null by `requireAuth`

---

### `Context` type — `src/context.ts`

```ts
import type { Context } from "@repo/api/context";
```

The TypeScript type of the resolved context. Procedures are typed against this.

---

## Adding a New Procedure

1. Write a spec in `docs/specs/features/<name>.md` (must be Approved)
2. Create `src/routers/<name>.ts`
3. Use `protectedProcedure` for user-scoped operations, `publicProcedure` for open endpoints
4. Define input with Zod — oRPC validates automatically
5. Register the router in `src/routers/index.ts` under `appRouter`

```ts
// src/routers/items.ts
import { protectedProcedure } from "../index.ts";
import { z } from "zod";

export const itemsRouter = {
  list: protectedProcedure
    .input(z.object({ categoryId: z.string().optional() }))
    .handler(async ({ input, context }) => {
      // context.session.user is non-null here — guaranteed by protectedProcedure
    }),
};

// src/routers/index.ts
import { itemsRouter } from "./items.ts";
export const appRouter = {
  healthCheck,
  privateData,
  items: itemsRouter, // ← nested router
};
```

---

## What Must Never Change Without a Spec

| Thing                              | Why                                                                   |
| ---------------------------------- | --------------------------------------------------------------------- |
| Procedure names in `appRouter`     | Mobile client uses these as typed references — rename = runtime break |
| Procedure input/output shapes      | Both server and mobile depend on these as the data contract           |
| `Context` type shape               | Every procedure is typed against this                                 |
| `protectedProcedure` auth behavior | Changing this could silently remove auth from all protected routes    |
| `createContext` return shape       | Server mounts this on every request                                   |

---

## Known Technical Debt

| Issue                                                                                       | Severity | Remediation spec                                         |
| ------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------- |
| `createContext` catch block returns `undefined`                                             | High     | `docs/specs/remediation/fix-context-undefined-return.md` |
| `context.auth` is always `null` — dead field                                                | Low      | Include in same fix                                      |
| `console.log` on every request in `createContext` and `requireAuth`                         | Low      | Remediation audit                                        |
| `healthCheck` and `privateData` in root router are scaffolding — should be removed or moved | Low      | Spec before removing                                     |
