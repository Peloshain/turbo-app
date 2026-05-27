# Spec: Categories

**Status:** Approved
**Author:** [you]
**Last Updated:** 2026-05-26
**Audit Ref:** Retroactive spec — documents existing implementation

---

## Problem

Users need to organize their wardrobe items into named categories (e.g. Tops, Pants, Shoes) so they can browse and filter their wardrobe, and so the outfit generator can reason about clothing types.

## Out of Scope

- Nested / hierarchical categories
- System-defined default categories (all categories are user-created)
- Category icons or images
- Reordering categories

## User Stories

- As a user, I want to create custom categories so my wardrobe is organized the way I think about it.
- As a user, I want to rename or delete a category so I can keep my organization up to date.

---

## Requirements

### Functional

- SHALL allow authenticated users to create a category with a name
- SHALL allow users to list all their categories
- SHALL allow users to rename a category
- SHALL allow users to delete a category
- SHALL NOT delete items when a category is deleted — items must be re-categorized or uncategorized first
- SHALL NOT allow a user to access another user's categories
- SHALL NOT allow duplicate category names per user

### Non-Functional

- Category list should load fast — it's used in add-item flow and wardrobe filter

---

## oRPC Procedures

> Note: categories are currently served by the legacy Hono route `apps/server/src/routes/categories.ts`.
> These procedures represent the target state when migrated to oRPC.

### `categories.list`

**Auth:** protected

**Input**

```ts
z.object({}); // no filters — always returns all user categories
```

**Output**

```ts
{
  categories: Array<{
    id: string;
    name: string;
    itemCount: number;
  }>;
}
```

**Error Cases**
| Code | Reason |
|------|--------|
| UNAUTHORIZED | No session |

---

### `categories.create`

**Auth:** protected

**Input**

```ts
z.object({
  name: z.string().min(1).max(50),
});
```

**Output**

```ts
{
  id: string;
  name: string;
}
```

**Error Cases**
| Code | Reason |
|------|--------|
| UNAUTHORIZED | No session |
| CONFLICT | Category with this name already exists for this user |

---

### `categories.update`

**Auth:** protected

**Input**

```ts
z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
});
```

**Output**

```ts
{
  id: string;
  name: string;
}
```

**Error Cases**
| Code | Reason |
|------|--------|
| UNAUTHORIZED | No session |
| NOT_FOUND | Category does not exist or belongs to another user |
| CONFLICT | New name already used by another category |

---

### `categories.delete`

**Auth:** protected

**Input**

```ts
z.object({ id: z.string() });
```

**Output**

```ts
{
  success: true;
}
```

**Error Cases**
| Code | Reason |
|------|--------|
| UNAUTHORIZED | No session |
| NOT_FOUND | Category does not exist or belongs to another user |
| CONFLICT | Category still has items — must be empty before deletion |

---

## Screens / UI States

### Manage Categories (`app/manage-categories/index.tsx`)

- [ ] Loading — skeleton list
- [ ] Error — `ErrorCard` with retry
- [ ] Empty — empty state with "Add your first category" CTA
- [ ] Success — list of categories with rename and delete actions

### Category Picker (within add-item flow — `components/add-item/CategoryPickerStep.tsx`)

- [ ] Loading — skeleton
- [ ] Error — `ErrorCard`
- [ ] Empty — prompt to create a category first (with navigation shortcut)
- [ ] Success — selectable list of categories

---

## Edge Cases

- User tries to delete a category with items in it — block deletion, show message explaining items must be moved first
- User creates a duplicate category name — surface CONFLICT error with clear message
- Category list is empty during add-item flow — guide user to create one before continuing

---

## Open Questions

- [ ] Should deleting a category auto-uncategorize items, or block deletion until items are moved? (Current requirement: block)

---

## Acceptance Criteria

- [ ] Category creation/update lives in Profile tab
- [ ] User can create a category with a unique name
- [ ] User can list all their categories
- [ ] User can rename a category
- [ ] User cannot delete a category that still has items
- [ ] User can delete an empty category
- [ ] Duplicate category names are rejected with a clear error
- [ ] Categories are user-scoped — user cannot see another user's categories
- [ ] Category picker in add-item flow shows all user categories
