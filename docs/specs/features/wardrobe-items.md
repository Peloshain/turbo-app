# Spec: Wardrobe Items

**Status:** Approved
**Author:** [you]
**Last Updated:** 2026-05-26
**Audit Ref:** Retroactive spec — documents existing implementation

---

## Problem

Users need to build a digital wardrobe by adding clothing items with photos and metadata so the AI and manual outfit tools can suggest combinations.

## Out of Scope

- Bulk import of items
- Item sharing between users
- Item tagging / notes (post-MVP)
- Brand tracking (post-MVP)

## User Stories

- As a user, I want to add a clothing item with a photo, name, color, and category so my wardrobe reflects what I own.
- As a user, I want to view all my items filtered by category so I can browse my wardrobe easily.
- As a user, I want to view the detail of a single item so I can review or delete it.

---

## Requirements

### Functional

- SHALL allow authenticated users to add a new item with: image, name, color, category
- SHALL upload the item image to storage and persist the storage key
- SHALL allow users to view all their items (scoped to their account)
- SHALL allow filtering items by category
- SHALL allow searching items by name
- SHALL allow viewing a single item by ID
- SHALL allow deleting an item
- SHALL NOT allow a user to access another user's items
- MAY show item count per category

### Non-Functional

- Image upload must give user feedback (progress or loading state)
- Item list must handle large wardrobes without performance degradation (use FlatList)

---

## oRPC Procedures

> Note: items are currently served by the legacy Hono route `apps/server/src/routes/items.ts`.
> These procedures represent the target state when migrated to oRPC.
> Do not add new logic to the legacy route — add it here as oRPC procedures instead.

### `items.list`

**Auth:** protected

**Input**

```ts
z.object({
  categoryId: z.string().optional(),
  search: z.string().optional(),
});
```

**Output**

```ts
{
  items: Array<{
    id: string;
    name: string;
    color: string;
    imageUrl: string;
    category: { id: string; name: string };
    createdAt: string;
  }>;
}
```

**Error Cases**
| Code | Reason |
|------|--------|
| UNAUTHORIZED | No session |

---

### `items.getById`

**Auth:** protected

**Input**

```ts
z.object({ id: z.string() });
```

**Output**

```ts
{
  id: string;
  name: string;
  color: string;
  imageUrl: string;
  category: {
    id: string;
    name: string;
  }
  createdAt: string;
}
```

**Error Cases**
| Code | Reason |
|------|--------|
| UNAUTHORIZED | No session |
| NOT_FOUND | Item does not exist or belongs to another user |

---

### `items.create`

**Auth:** protected

**Input**

```ts
z.object({
  name: z.string().min(1),
  color: z.string().min(1),
  categoryId: z.string(),
  imageKey: z.string(), // storage key from upload — image uploaded separately
});
```

**Output**

```ts
{
  id: string;
}
```

**Error Cases**
| Code | Reason |
|------|--------|
| UNAUTHORIZED | No session |
| NOT_FOUND | categoryId does not exist or belongs to another user |

---

### `items.delete`

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
| NOT_FOUND | Item does not exist or belongs to another user |

---

## Screens / UI States

### Wardrobe Tab (`app/(tabs)/index.tsx`)

- [ ] Loading — `SkeletonCard` grid
- [ ] Error — `ErrorCard` with retry
- [ ] Empty — `EmptyState` with "Add your first item" CTA
- [ ] Success — item grid with `ItemCard`, `CategoryFilter`, `SearchBar`

### Item Detail (`app/item/[id].tsx`)

- [ ] Loading — skeleton
- [ ] Error — `ErrorCard`
- [ ] Success — item image, name, color, category + delete action

### Add Item Flow (`app/add-item/index.tsx`)

Multi-step flow — each step is a component in `components/add-item/`:

1. `ImagePickerStep` — pick or capture photo
2. `CategoryPickerStep` — select existing category
3. `DetailStep` — enter name and color
4. `ConfirmStep` — review and submit

- [ ] Each step validates its input before allowing progression
- [ ] Upload progress shown during image upload
- [ ] On success: navigate back to wardrobe tab and invalidate items query

---

## Edge Cases

- User navigates away mid-add-item flow — state is lost, no partial item saved
- Image upload fails — surface error on `ImagePickerStep`, allow retry
- Category has no items — shows empty state in filtered view, not an error
- Item deletion while offline — queue or fail gracefully with error message

---

## Open Questions

- [ ] Should deleted items remove the image from storage, or is cleanup handled separately?

---

## Acceptance Criteria

- [ ] User can add an item with image, name, color, and category
- [ ] Item appears in wardrobe list after creation
- [ ] Items are filterable by category
- [ ] Items are searchable by name
- [ ] Item detail screen shows all fields
- [ ] User can delete an item
- [ ] Deleted item no longer appears in the list
- [ ] User cannot see or access another user's items
- [ ] All four UI states handled on wardrobe tab and item detail
