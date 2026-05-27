# Spec: User Profile

**Status:** Approved
**Author:** [you]
**Last Updated:** 2026-05-26
**Audit Ref:** Retroactive spec — documents existing implementation

---

## Problem

Users need a place to see their account identity, wardrobe stats, manage app preferences, and access account actions — all in one screen.

## Out of Scope

- Avatar image upload (initials-based avatar only for MVP)
- Social auth account linking
- Account deletion
- Notification preferences
- Dark mode toggle

## User Stories

- As a user, I want to see my name, email, and wardrobe stats so I know what's in my account.
- As a user, I want to enable or disable AI features so I can control how the app behaves.
- As a user, I want to edit my profile name so my account reflects who I am.
- As a user, I want to sign out so I can secure my account on a shared device.

---

## Requirements

### Functional

- SHALL display the user's name and email
- SHALL display an initials-based avatar derived from the user's name
- SHALL display total item count and total outfit count
- SHALL display a per-category item breakdown (stats grid)
- SHALL allow the user to toggle AI Helper on/off
- SHALL persist the AI Helper preference to the server
- SHALL navigate to Edit Profile screen
- SHALL navigate to Manage Categories screen
- SHALL allow the user to sign out via a confirmation alert before proceeding
- SHALL refetch profile data every time the screen comes into focus
- SHALL NOT require a full app reload to reflect updated stats after navigating back

### Non-Functional

- Stats refetch on focus must be non-blocking — screen should not flash or reset scroll position
- AI toggle must show a loading indicator while the preference is being persisted

---

## oRPC Procedures

### `profile.get`

**Auth:** protected

**Output**

```ts
{
  user: {
    id: string;
    name: string | null;
    email: string;
  }
  items: Array<{ id: string }>; // used for count
  outfits: Array<{ id: string }>; // used for count
  stats: Array<{
    label: string; // category name
    count: number; // items in that category
  }>;
  aiHelperEnabled: boolean;
}
```

**Error Cases**
| Code | Reason |
|------|--------|
| UNAUTHORIZED | No session |

---

### `profile.update`

**Auth:** protected

**Input**

```ts
z.object({
  name: z.string().min(1).optional(),
});
```

**Output**

```ts
{
  user: {
    id: string;
    name: string | null;
    email: string;
  }
}
```

**Error Cases**
| Code | Reason |
|------|--------|
| UNAUTHORIZED | No session |

---

### `profile.setAiHelper`

**Auth:** protected

**Input**

```ts
z.object({
  enabled: z.boolean(),
});
```

**Output**

```ts
{
  aiHelperEnabled: boolean;
}
```

**Error Cases**
| Code | Reason |
|------|--------|
| UNAUTHORIZED | No session |

---

## Screen: Profile (`app/(tabs)/profile.tsx`)

### Sections (top to bottom)

1. **Hero** — initials avatar, name, email
2. **Stats card** — total items + total outfits counts, per-category stats grid
3. **AI Helper card** — toggle with descriptive subtitle reflecting current state
4. **Actions** — Edit Profile, Manage Categories, Log Out buttons

### UI States

**Stats card**

- [ ] Loading — `ActivityIndicator` centered in card
- [ ] Error — inline error text in red
- [ ] Empty — "No items yet." message
- [ ] Success — stats grid with per-category counts

**AI Helper toggle**

- [ ] Idle — `Switch` reflects current `aiHelperEnabled` value
- [ ] Loading — `ActivityIndicator` replaces Switch while preference saves
- [ ] Toggle subtitle changes immediately to reflect new state

**Sign out**

- [ ] Tapping "Log Out" shows a confirmation `Alert` before signing out
- [ ] Cancellable — user can dismiss without signing out

### Avatar Logic

```
getInitials(name):
  if no name → "?"
  split by spaces → take first letter of each word → first 2 → uppercase
  e.g. "Jane Doe" → "JD", "Alice" → "A", null → "?"
```

---

## `useProfile` Hook Contract

The screen consumes `useProfile()` which must expose:

```ts
{
  user: { name?: string | null; email?: string } | undefined
  items: Array<unknown>          // length used for count
  outfits: Array<unknown>        // length used for count
  stats: Array<{ label: string; count: number }>
  loading: boolean
  error: string | null
  refetch: () => void            // called on screen focus
  aiHelperEnabled: boolean
  aiToggleLoading: boolean
  toggleAiHelper: (value: boolean) => void
}
```

---

## Edge Cases

- `user.name` is null or undefined — avatar shows "?", name field shows "—"
- `user.email` is undefined — email field shows "—"
- Stats grid is empty (no items) — shows "No items yet." not an empty grid
- AI toggle tapped while `aiToggleLoading` is true — Switch is replaced by ActivityIndicator, tap is not registered
- Sign out confirmation dismissed — no action taken, user stays on profile screen
- Navigation back from Edit Profile or Manage Categories — `useFocusEffect` triggers `refetch` automatically

---

## Open Questions

- [ ] Should `items` and `outfits` arrays be full objects or just counts from the server? Currently full arrays, counts derived client-side — consider returning counts directly for efficiency.
- [ ] Should AI Helper toggle failure revert the switch to its previous state, or leave it in the toggled position?

---

## Acceptance Criteria

- [ ] Name, email, and initials avatar are displayed correctly
- [ ] Total item and outfit counts are accurate
- [ ] Per-category stats grid reflects current wardrobe state
- [ ] Stats refresh when navigating back to the profile tab
- [ ] AI Helper toggle persists to the server and shows loading state while saving
- [ ] AI Helper subtitle updates to reflect enabled/disabled state
- [ ] Edit Profile navigates to `/edit-profile`
- [ ] Manage Categories navigates to `/manage-categories`
- [ ] Log Out shows confirmation alert before signing out
- [ ] Cancelled sign out leaves user on profile screen
- [ ] Loading and error states are handled in the stats card
