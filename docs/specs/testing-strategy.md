# Testing Strategy

**Last Updated:** 2026-05-26

This document defines the testing approach for the monorepo. Tests are derived from specs — every acceptance criterion in `docs/specs/features/` should have a corresponding test.

---

## Stack

| Layer                                | Tool                                | Why                                              |
| ------------------------------------ | ----------------------------------- | ------------------------------------------------ |
| Unit + Integration (server/packages) | Vitest                              | Fast, TypeScript-native, monorepo-friendly       |
| Mobile unit + hook tests             | Jest + React Native Testing Library | Expo-compatible, hooks and component testing     |
| Mobile E2E                           | Maestro                             | Simple YAML flows, works with Expo Go and builds |
| Test database                        | PostgreSQL (separate DB)            | Real queries, no mocking ORM behavior            |
| Seed / teardown                      | Prisma + custom helpers             | Consistent test data, clean state per test       |

---

## The Three Layers

### 1. Unit Tests

Test a single function in isolation. No database, no network, no filesystem.

**What to unit test:**

- `requireAuth` middleware behavior
- `getInitials` and other pure utility functions
- Zod schema validation (valid and invalid inputs)
- `packages/env` — missing required vars throw at startup
- Storage adapter interface contracts

**Where they live:** `*.test.ts` alongside the file they test, or `__tests__/` folder.

**Speed target:** entire unit suite < 5 seconds.

---

### 2. Integration Tests

Test how pieces work together. Uses a real test database, real Prisma, real oRPC procedures — no HTTP layer.

**What to integration test:**

- Every oRPC procedure (the highest value tests in this codebase)
- Auth boundaries — does `protectedProcedure` block unauthenticated callers?
- User data scoping — can user A access user B's data?
- Database constraint behavior — duplicate categories, cascading deletes, etc.

**Where they live:** `packages/api/src/__tests__/` and `apps/server/src/__tests__/`

**Speed target:** full integration suite < 30 seconds with a local test DB.

---

### 3. End-to-End Tests (Mobile)

Test full user flows from UI through to the server. Slowest, highest confidence.

**What to E2E test:**

- Auth flow: register → sign in → sign out
- Add item flow: image → category → details → confirm
- Outfit generation: enter occasion → view result → save
- Critical paths only — not every screen

**Where they live:** `apps/mobile/e2e/`

**Speed target:** full E2E suite < 5 minutes on CI.

---

## Setting Up the Test Database

Never run tests against your development or production database.

### 1. Add test env file

```bash
# apps/server/.env.test
DATABASE_URL="postgresql://user:password@localhost:5432/myapp_test"
```

### 2. Add test DB scripts to root `package.json`

```json
{
  "scripts": {
    "test:db:setup": "DATABASE_URL=$TEST_DATABASE_URL prisma migrate deploy",
    "test:db:reset": "DATABASE_URL=$TEST_DATABASE_URL prisma migrate reset --force"
  }
}
```

### 3. Vitest config (`packages/api/vitest.config.ts`)

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/__tests__/setup.ts"],
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? "",
    },
  },
});
```

### 4. Test setup file (`packages/api/src/__tests__/setup.ts`)

```ts
import { prisma } from "@repo/db";
import { beforeEach, afterAll } from "vitest";

beforeEach(async () => {
  // Clean all tables before each test — order matters for foreign keys
  await prisma.$transaction([
    prisma.outfit.deleteMany(),
    prisma.item.deleteMany(),
    prisma.category.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

---

## Test Caller Pattern (oRPC)

Bypass HTTP entirely — call procedures directly with a fabricated context. This is the core pattern for integration testing oRPC procedures.

```ts
// packages/api/src/__tests__/helpers.ts
import { createRouterClient } from "@orpc/server";
import { appRouter } from "../routers/index.ts";
import { prisma } from "@repo/db";

type Session = { user: { id: string; email: string; name: string | null } };

// Authenticated caller — pass a real or fabricated session
export function createCaller(session: Session) {
  return createRouterClient(appRouter, {
    context: { auth: null, session },
  });
}

// Unauthenticated caller
export const anonCaller = createRouterClient(appRouter, {
  context: { auth: null, session: null },
});

// Seed helpers
export async function seedUser(
  overrides?: Partial<{ email: string; name: string }>,
) {
  return prisma.user.create({
    data: {
      email: overrides?.email ?? `test-${Date.now()}@example.com`,
      name: overrides?.name ?? "Test User",
    },
  });
}

export async function seedCategory(userId: string, name = "Tops") {
  return prisma.category.create({
    data: { name, userId },
  });
}

export async function seedItem(
  userId: string,
  categoryId: string,
  overrides?: object,
) {
  return prisma.item.create({
    data: {
      name: "White T-Shirt",
      color: "white",
      imageKey: "uploads/test.jpg",
      userId,
      categoryId,
      ...overrides,
    },
  });
}
```

---

## Writing Tests — Spec to Test Mapping

Every acceptance criterion in a spec maps to one or more tests. Use the spec reference comment so broken tests trace back to the spec.

### Example: `wardrobe-items.md` → `items.test.ts`

```ts
// packages/api/src/__tests__/items.test.ts
import { describe, it, expect } from "vitest";
import {
  createCaller,
  anonCaller,
  seedUser,
  seedCategory,
  seedItem,
} from "./helpers";
import { prisma } from "@repo/db";

describe("items.list", () => {
  // spec: wardrobe-items.md — SHALL allow filtering items by category
  it("filters items by categoryId", async () => {
    const user = await seedUser();
    const tops = await seedCategory(user.id, "Tops");
    const pants = await seedCategory(user.id, "Pants");
    await seedItem(user.id, tops.id, { name: "White Tee" });
    await seedItem(user.id, pants.id, { name: "Black Jeans" });

    const caller = createCaller({ user });
    const result = await caller.items.list({ categoryId: tops.id });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe("White Tee");
  });

  // spec: wardrobe-items.md — SHALL NOT allow a user to access another user's items
  it("returns only items belonging to the authenticated user", async () => {
    const userA = await seedUser({ email: "a@test.com" });
    const userB = await seedUser({ email: "b@test.com" });
    const cat = await seedCategory(userA.id);
    await seedItem(userA.id, cat.id);

    const callerB = createCaller({ user: userB });
    const result = await callerB.items.list({});

    expect(result.items).toHaveLength(0);
  });

  // spec: wardrobe-items.md — AUTH
  it("throws UNAUTHORIZED when called without a session", async () => {
    await expect(anonCaller.items.list({})).rejects.toThrow("UNAUTHORIZED");
  });
});

describe("items.delete", () => {
  // spec: wardrobe-items.md — SHALL allow deleting an item
  it("deletes an item owned by the user", async () => {
    const user = await seedUser();
    const cat = await seedCategory(user.id);
    const item = await seedItem(user.id, cat.id);

    const caller = createCaller({ user });
    await caller.items.delete({ id: item.id });

    const found = await prisma.item.findUnique({ where: { id: item.id } });
    expect(found).toBeNull();
  });

  // spec: wardrobe-items.md — NOT_FOUND for other user's items
  it("throws NOT_FOUND when deleting another user's item", async () => {
    const userA = await seedUser({ email: "a@test.com" });
    const userB = await seedUser({ email: "b@test.com" });
    const cat = await seedCategory(userA.id);
    const item = await seedItem(userA.id, cat.id);

    const callerB = createCaller({ user: userB });
    await expect(callerB.items.delete({ id: item.id })).rejects.toThrow(
      "NOT_FOUND",
    );
  });
});
```

---

## Test File Locations

```
packages/
  api/
    src/
      __tests__/
        setup.ts               # beforeEach cleanup, afterAll disconnect
        helpers.ts             # createCaller, anonCaller, seed helpers
        context.test.ts        # createContext unit tests
        items.test.ts          # items procedures
        categories.test.ts     # categories procedures
        outfits.test.ts        # outfits procedures
        profile.test.ts        # profile procedures
  env/
    src/
      __tests__/
        env.test.ts            # missing vars throw, valid vars parse correctly

apps/
  mobile/
    __tests__/
      hooks/
        useWardrobe.test.ts
        useProfile.test.ts
        useOutfitGenerator.test.ts
    e2e/
      auth.yaml                # register → sign in → sign out
      add-item.yaml            # full add item flow
      outfit-generation.yaml   # occasion → generate → save
```

---

## Priority Order — What to Write First

Write tests in this order. Each layer builds on the one before.

```
1. context.test.ts
   — createContext returns { auth: null, session: null } on error (the known bug)
   — createContext returns session when Better Auth resolves successfully

2. Auth boundary tests (one per router)
   — anonCaller.items.list throws UNAUTHORIZED
   — anonCaller.categories.list throws UNAUTHORIZED
   — anonCaller.outfits.list throws UNAUTHORIZED

3. User scoping tests (highest security value)
   — user A cannot read user B's items
   — user A cannot delete user B's items
   — user A cannot read user B's categories
   — user A cannot read user B's outfits

4. Happy path per procedure
   — items CRUD
   — categories CRUD (including delete-with-items blocked)
   — outfits save + list + delete
   — profile get + update

5. Mobile hook unit tests
   — useProfile exposes correct shape
   — useWardrobe filters correctly client-side

6. E2E (after procedures are stable)
   — auth flow
   — add item flow
```

---

## TDD Workflow Going Forward

For every new feature, follow this order:

```
1. Spec approved (docs/specs/features/<name>.md)
      ↓
2. Write failing tests from acceptance criteria
      ↓  (RED — all tests fail, nothing implemented yet)
3. Implement the procedure / hook / screen
      ↓  (GREEN — tests pass with minimum code)
4. Refactor without breaking tests
      ↓  (REFACTOR)
5. PR — spec + tests + implementation in one commit
```

**Rule:** if you can't write a test for an acceptance criterion, the criterion is too vague. Go back to the spec and make it concrete.

---

## Adding Vitest to the Monorepo

```bash
# From repo root
pnpm add -D vitest @vitest/coverage-v8 -w

# In packages/api
pnpm add -D vitest --filter @repo/api
```

Add to `packages/api/package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

Add to root `package.json`:

```json
{
  "scripts": {
    "test": "turbo run test",
    "test:watch": "turbo run test:watch"
  }
}
```

---

## Coverage Goals

Don't chase 100% — chase coverage of what matters.

| Area               | Target | Why                                  |
| ------------------ | ------ | ------------------------------------ |
| oRPC procedures    | 90%+   | Core business logic, clear contracts |
| Auth boundaries    | 100%   | Security-critical                    |
| User data scoping  | 100%   | Security-critical                    |
| Utility functions  | 80%+   | Pure functions, easy to test         |
| UI components      | 40%+   | Test behavior, not markup            |
| E2E critical paths | 100%   | Auth, add item, outfit generation    |
