# Spec: Outfits

**Status:** Approved
**Author:** [you]
**Last Updated:** 2026-05-26
**Audit Ref:** Retroactive spec — documents existing implementation

---

## Problem

Users want outfit suggestions from their wardrobe without having to mentally combine items themselves. They also want to manually curate outfits and save combinations they like for future reference.

## Out of Scope

- Outfit sharing or social features
- Weather-based suggestions (post-MVP)
- Style preference learning over time
- Outfit scheduling / calendar

## User Stories

- As a user, I want to describe an occasion and get an AI-generated outfit from my wardrobe items so I don't have to figure out what to wear.
- As a user, I want to manually pick items from my wardrobe to build my own outfit combination.
- As a user, I want to save outfits I like so I can reference them later.
- As a user, I want to view all my saved outfits in one place.

---

## Requirements

### Functional

- SHALL allow authenticated users to generate an outfit by providing an occasion/context
- SHALL generate outfits using only items from the user's own wardrobe
- SHALL allow users to manually select wardrobe items to form an outfit
- SHALL allow users to save a generated or manual outfit
- SHALL allow users to list all their saved outfits
- SHALL allow users to delete a saved outfit
- SHALL NOT save an outfit automatically — saving must be an explicit user action
- SHALL NOT allow a user to access another user's outfits or wardrobe items

### Non-Functional

- AI generation may take several seconds — must show loading state with appropriate feedback
- If user has no wardrobe items, outfit generation should be blocked with a clear message

---

## oRPC Procedures

> Note: outfits are currently served by the legacy Hono route `apps/server/src/routes/outfits.ts`.
> These procedures represent the target state when migrated to oRPC.

### `outfits.generate`

**Auth:** protected

**Input**

```ts
z.object({
  occasion: z.string().min(1), // e.g. "casual friday", "job interview", "date night"
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
  }>;
  reasoning: string; // AI explanation of why these items work together
}
```

**Error Cases**
| Code | Reason |
|------|--------|
| UNAUTHORIZED | No session |
| BAD_REQUEST | User has no wardrobe items to generate from |
| INTERNAL_SERVER_ERROR | AI provider failure |

---

### `outfits.saveGenerated`

**Auth:** protected

**Input**

```ts
z.object({
  occasion: z.string(),
  itemIds: z.array(z.string()).min(1),
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
| NOT_FOUND | One or more itemIds do not belong to this user |

---

### `outfits.saveManual`

**Auth:** protected

**Input**

```ts
z.object({
  itemIds: z.array(z.string()).min(2), // manual outfit requires at least 2 items
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
| NOT_FOUND | One or more itemIds do not belong to this user |
| BAD_REQUEST | Fewer than 2 items provided |

---

### `outfits.list`

**Auth:** protected

**Input**

```ts
z.object({}); // no filters for MVP
```

**Output**

```ts
{
  outfits: Array<{
    id: string;
    occasion: string | null; // null for manual outfits
    items: Array<{
      id: string;
      name: string;
      imageUrl: string;
    }>;
    createdAt: string;
  }>;
}
```

**Error Cases**
| Code | Reason |
|------|--------|
| UNAUTHORIZED | No session |

---

### `outfits.delete`

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
| NOT_FOUND | Outfit does not exist or belongs to another user |

---

## Screens / UI States

### Outfit Generator Tab (`app/(tabs)/outfit.tsx`)

- [ ] Default — occasion input + generate button
- [ ] Empty wardrobe — blocked state with message "Add items to your wardrobe first" + CTA
- [ ] Loading (AI generating) — `OccasionPicker` disabled, loading indicator
- [ ] Error — `ErrorCard` with retry
- [ ] Result — `OutfitResult` displays suggested items with save action

### Manual Outfit Mode (within outfit tab)

- [ ] Item picker from wardrobe
- [ ] Selected items preview
- [ ] Save button (enabled when ≥ 2 items selected)

### Saved Outfits Tab (`app/(tabs)/saved.tsx`)

- [ ] Loading — `SkeletonOutfitCard` list
- [ ] Error — `ErrorCard` with retry
- [ ] Empty — `EmptyOutfits` with CTA to generate first outfit
- [ ] Success — `OutfitCard` / `OutfitCollage` list with delete action

---

## Edge Cases

- AI generation fails (provider timeout/error) — surface error, allow retry, do not save partial result
- User saves an outfit then deletes a wardrobe item in it — saved outfit remains intact (items are referenced, not re-fetched)
- User has items but all in one category — AI should still generate; do not block on category diversity
- Occasion input is empty — validate client-side, do not call generate procedure

---

## Open Questions

- [ ] Should manual outfit saving require a name/label, or is it anonymous?
- [ ] When a wardrobe item is deleted, should saved outfits that reference it be updated or left as-is?

---

## Acceptance Criteria

- [ ] User can enter an occasion and receive an AI-generated outfit
- [ ] Generated outfit only contains items from the user's own wardrobe
- [ ] User can save a generated outfit
- [ ] User can manually select items and save as an outfit (min 2 items)
- [ ] Saved outfits appear in the Saved tab
- [ ] User can delete a saved outfit
- [ ] Empty wardrobe blocks generation with a clear message
- [ ] AI failure surfaces a user-facing error with retry option
- [ ] All four UI states handled on outfit generator and saved tabs
- [ ] Outfits are user-scoped — user cannot access another user's outfits
