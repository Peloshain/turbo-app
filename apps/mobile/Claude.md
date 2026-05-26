# Mobile Context — Expo App (apps/mobile)

> See root CLAUDE.md for project-wide rules. This file adds mobile-specific context.

## Stack

- **Framework:** Expo (React Native), Expo Router (file-based routing)
- **Auth:** Better Auth client via `lib/auth-client.ts`
- **Data fetching:** TanStack Query (React Query)
- **Validation:** Zod via `lib/validators.ts`
- **Deploy:** EAS (Expo Application Services) — `.easignore` is intentional

## Actual Directory Structure

```
apps/mobile/
  app/
    (auth)/
      sign-in.tsx
      sign-up.tsx
      _layout.tsx        # Auth group layout
    (tabs)/
      index.tsx          # Wardrobe tab
      outfit.tsx         # Outfit generator tab
      profile.tsx        # Profile tab
      saved.tsx          # Saved outfits tab
      _layout.tsx        # Tab bar layout
    add-item/
      index.tsx          # Multi-step add item flow
    edit-profile/
      index.tsx
    item/
      [id].tsx           # Item detail (dynamic route)
    manage-categories/
      index.tsx
    _layout.tsx          # Root layout — auth gate lives here
  components/
    add-item/            # CategoryPickerStep, ConfirmStep, DetailStep, ImagePickerStep
    auth/                # AuthDivider, AuthErrorBar, AuthInput, SocialButtons
    outfit/              # OccasionPicker, OutfitResult
    saved/               # EmptyOutfits, OutfitCard, OutfitCollage
    ui/                  # ErrorCard, Icon, Skeleton, SkeletonCard, SkeletonOutfitCard
    wardrobe/            # CategoryFilter, EmptyState, ItemCard, SearchBar
  hooks/
    useAddItem.ts
    useCategories.ts
    useManualOutfit.ts
    useOutfitGenerator.ts
    useProfile.ts
    useSavedOutfits.ts
    useToast.ts
    useWardrobe.ts
  lib/
    auth-client.ts       # Better Auth client config
    validators.ts        # Zod schemas for mobile forms
  assets/
  .env                   # Local env vars (never commit)
  app.json               # Expo config
  index.ts               # Entry point
  App.tsx
```

## Routing (Expo Router)

- `(auth)/` — unauthenticated screens; auth gate in `app/_layout.tsx` redirects here when no session
- `(tabs)/` — main authenticated tab navigation
- `add-item/`, `edit-profile/`, `item/[id]`, `manage-categories/` — modal/stack screens
- Auth redirects are handled exclusively in `app/_layout.tsx` — never do auth redirects inside screen components

## Domain Overview

This is a **wardrobe + outfit management app**. Key domains:

- **Wardrobe** — clothing items with categories, images (`useWardrobe`, `useAddItem`, `useCategories`)
- **Outfits** — AI-generated or manual outfits from wardrobe items (`useOutfitGenerator`, `useManualOutfit`)
- **Saved** — persisted outfit combinations (`useSavedOutfits`)
- **Profile** — user profile management (`useProfile`)

## Auth (Better Auth)

- Client initialized in `lib/auth-client.ts` — import from here, never re-instantiate
- Session state drives the auth gate in `app/_layout.tsx`
- Never store tokens manually — Better Auth client manages session storage
- Auth UI components live in `components/auth/`

## Data Fetching (TanStack Query)

- Every server resource has a dedicated hook in `hooks/`
- All hooks handle loading, error, empty, and success states
- Mutations invalidate relevant queries on success
- Never fetch data directly in a component — always go through a hook

```ts
// Good
const { data, isLoading, error } = useWardrobe();

// Bad
useEffect(() => {
  fetch("/rpc/items.list");
}, []);
```

## Validation

- Form validation schemas live in `lib/validators.ts`
- Use these schemas in hooks before sending data to the server
- Do not duplicate validation logic that already exists in `packages/api`

## UI Component Conventions

- Generic/reusable components → `components/ui/`
- Feature-specific components → `components/<feature>/`
- Skeleton components exist for loading states — use them (`Skeleton`, `SkeletonCard`, `SkeletonOutfitCard`)
- `ErrorCard` is the standard error display component — use it, don't create one-off error UIs

## UI State Rules

Every screen that loads remote data must handle all four states:

- **Loading** — use existing Skeleton components from `components/ui/`
- **Error** — use `ErrorCard` from `components/ui/`
- **Empty** — meaningful empty state (see `EmptyState`, `EmptyOutfits` for reference)
- **Success** — the happy path

Never ship a screen with only the success state handled.

## Multi-Step Flow Pattern

The `add-item` flow (`components/add-item/`) is the reference pattern for multi-step flows:

- `ImagePickerStep` → `CategoryPickerStep` → `DetailStep` → `ConfirmStep`
- State managed in `useAddItem` hook — not inside step components
- Follow this pattern for any future multi-step flows

## EAS / Deploy Notes

- `.easignore` controls what gets excluded from EAS builds — do not modify casually
- `app.json` holds Expo config including EAS project ID — changes here affect builds
- Never embed secrets in `app.json` or bundle — use Expo's env var system
- `.env` is for local development only; production values come from EAS Secrets

## Security Checklist (verify for every new screen)

- [ ] No tokens or secrets stored manually (Better Auth handles this)
- [ ] No sensitive data logged to console in production paths
- [ ] All four UI states handled (loading, error, empty, success)
- [ ] User input validated with Zod via `lib/validators.ts` before submission
- [ ] Dynamic routes (`[id]`) validate the param before using it in a query
