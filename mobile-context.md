# Wardrobe App — Mobile Context

## Project Structure

```
wardrobe/
├── apps/
│   ├── mobile/      # React Native, Expo (Expo Router)
│   └── server/      # Backend API (Hono)
├── packages/
│   ├── api/         # API layer / business logic
│   ├──  ai/         # AI adapters (Gemini, LMStudio, OpenAI, Anthropic)
│   ├── auth/        # Authentication (better-auth)
│   ├── config/      # Shared config
│   ├── env/         # @t3-oss/env-core environment validation
│   ├── storage/     # Storage factory + adapters (local, R2)
│   └── db/          # Database schema & queries (Prisma / Postgres)
```

## Key Libraries

- **Routing**: Expo Router (file-based)
- **Auth**: better-auth (`authClient` from `mobile/lib/auth-client`)
- **Data fetching**: `@tanstack/react-query` (`useQuery`, `useQueries`, `useMutation`)
- **Safe area**: `react-native-safe-area-context`
- **Image picker**: `expo-image-picker`
- **File upload**: `expo-file-system/legacy` (`FileSystem.uploadAsync`)
- **Environment**: `@repo/env/native` (`env.EXPO_PUBLIC_SERVER_URL`)

---

## Auth

### better-auth client usage

```ts
const { data: session, refetch } = authClient.useSession();
const user = session?.user;
```

### Sign in / Sign up

```ts
await authClient.signIn.email({ email, password });
await authClient.signUp.email({ name, email, password });
```

### Sign out

```ts
await authClient.signOut();
// Session clears → root _layout useEffect redirects to (auth)/sign-in
```

### Update user

```ts
await authClient.updateUser({ name });
await authClient.changeEmail({ newEmail, callbackURL: "/" });
await authClient.changePassword({
  currentPassword,
  newPassword,
  revokeOtherSessions: true,
});
```

### Session-driven routing (`app/_layout.tsx`)

```ts
const { data: session, isPending } = authClient.useSession();
useEffect(() => {
  if (isPending) return;
  const inAuthGroup = segments[0] === "(auth)";
  if (!session && !inAuthGroup) router.replace("/(auth)/sign-in");
  else if (session && inAuthGroup) router.replace("/(tabs)");
}, [session, isPending, segments]);
```

### Trusted origins (server `packages/auth/src/index.ts`)

```ts
trustedOrigins: ["mobile://", "exp://", "http://localhost:8081", "wardrobe://"];
```

---

## User Model

### `packages/auth/src/index.ts`

`aiHelperEnabled` is stored as a better-auth `additionalField`:

```ts
user: {
  changeEmail: { enabled: true },
  additionalFields: {
    aiHelperEnabled: {
      type: "boolean",
      required: false,
      defaultValue: true,
      input: true, // allows authClient.updateUser() to write it
    },
  },
},
```

### Prisma schema (`packages/db`)

```prisma
model User {
  // ...existing fields...
  aiHelperEnabled Boolean @default(true)
}
```

After adding: `npx prisma generate` (no migration needed if column already exists in DB).

### Reading `aiHelperEnabled` in mobile

```ts
const aiHelperEnabled = (session?.user as any)?.aiHelperEnabled ?? true;
```

Remove `as any` by adding to `packages/auth/src/types.ts`:

```ts
declare module "better-auth" {
  interface UserAdditionalFields {
    aiHelperEnabled: boolean;
  }
}
```

---

## App Routes

```
app/
├── _layout.tsx           # Root layout — session guard + Stack screens
├── (auth)/
│   ├── _layout.tsx
│   ├── sign-in.tsx
│   └── sign-up.tsx
├── (tabs)/
│   ├── _layout.tsx       # Tab layout — logout button in headerRight
│   ├── index.tsx
│   ├── profile.tsx
│   ├── saved.tsx
│   └── outfit.tsx
├── add-item/
│   └── index.tsx         # Modal screen
├── item/[id].tsx
└── edit-profile.tsx
```

### `(tabs)/_layout.tsx` — logout in header

```tsx
screenOptions={{
  headerRight: () => <LogOutButton />,
}}
```

---

## Hooks

### `hooks/useProfile.ts`

- Uses `useQueries` for `["profile-items", userId]` and `["categories"]`
- Derives `stats: StatRow[]` (per-category item counts, only categories with >0 items)
- Exposes `aiHelperEnabled`, `aiToggleLoading`, `toggleAiHelper`
- `toggleAiHelper` calls `authClient.updateUser({ aiHelperEnabled: !aiHelperEnabled })` then `refetchSession()`

```ts
const {
  user,
  items,
  stats,
  loading,
  error,
  refetch,
  aiHelperEnabled,
  aiToggleLoading,
  toggleAiHelper,
} = useProfile();
```

### `hooks/useOutfitGenerator.ts`

- AI outfit generation via `POST /outfits/generate`
- Save via `POST /outfits/save` with `aiGenerated: boolean`
- Supports abort via `AbortController` (`cancelAnalysis()`)
- `reset()` clears result/savedId

```ts
const {
  result,
  savedId,
  isGenerating,
  isSaving,
  error,
  generate,
  save,
  reset,
  cancelAnalysis,
} = useOutfitGenerator();
// save requires aiGenerated field:
save({ ...result, occasion, aiGenerated: true });
```

### `hooks/useManualOutfit.ts`

- Reuses `["profile-items", userId]` query key (shared cache with profile)
- `toggleItem(id)` enforces: max 10 items, 1 item per category
- `getItemStatus(id)` returns `"selected" | "blocked-category" | "blocked-limit" | "available"`
- `validationError` is a human-readable string explaining why an item can't be selected
- Save via `POST /outfits/save` with `aiGenerated: false` (hardcoded)

```ts
const {
  items,
  isLoadingItems,
  selectedIds,
  selectedItems,
  outfitName,
  setOutfitName,
  toggleItem,
  getItemStatus,
  validationError,
  save,
  isSaving,
  savedId,
  saveError,
  reset,
} = useManualOutfit();
```

### `hooks/useAddItem.ts`

- Step machine: `"pick" | "category" | "details" | "confirm" | "done"`
- Reads `aiHelperEnabled` from session internally
- **AI on**: Photo → Category → _(AI analyzes)_ → Confirm
- **AI off**: Photo → Category → Details (manual name/color) → Confirm
- `analyzeWithCategory()` branches on `aiHelperEnabled` — skips fetch and goes to `"details"` if disabled
- `confirmManualDetails()` packages manual fields into `AnalysisResult` and advances to `"confirm"`
- Image upload: gets signed URL from `POST /items/upload-url`, uploads via `FileSystem.uploadAsync`, saves via `POST /items`

```ts
const {
  image,
  analysis,
  loading,
  step,
  aiHelperEnabled,
  manualName,
  manualColorDesc,
  manualColorHex,
  setManualName,
  setManualColorDesc,
  setManualColorHex,
  pickImage,
  analyzeWithCategory,
  confirmManualDetails,
  saveItem,
  reset,
  cancelAnalysis,
} = useAddItem();
```

---

## Screens

### `profile.tsx`

- Avatar: initials from `user.name` (2 chars max, dark circle)
- Stats card: total item count + per-category grid (from `useProfile`)
- AI Helper toggle: `Switch` component, calls `toggleAiHelper()`, shows `ActivityIndicator` while saving
- Actions: Edit Profile (pushes `/edit-profile`) + Log Out (with `Alert.alert` confirmation)

### `edit-profile.tsx`

- Three independent sections: Name, Email, Password
- Name: `authClient.updateUser({ name })` + `refetch()`
- Email: `authClient.changeEmail({ newEmail, callbackURL })` — requires `changeEmail.enabled: true` on server
- Password: `authClient.changePassword(...)` with client-side validation (match + min 8 chars)
- Each section has its own `loading` / `error` / `success` state

### `outfit.tsx`

Root component reads `aiHelperEnabled` and renders either `<AIOutfitScreen>` or `<ManualOutfitScreen>`.

**AI mode**: OccasionPicker (with weather) → Generate button → OutfitResult
**Manual mode**: OccasionPicker (no weather) → item grid picker → Save button

Both screens use `useFocusEffect` to reset on blur:

```ts
const resetRef = useRef(reset);
resetRef.current = reset;
useFocusEffect(
  useCallback(() => {
    return () => resetRef.current();
  }, []),
);
```

### `add-item/index.tsx`

- Progress bar is dynamic: 3 steps (AI) or 4 steps (manual)
- Progress bar uses `flex: 1` connector lines (not fixed width) to avoid clipping
- Step labels sit below circles in a column layout (`progressStepInner`)

---

## Components

### `components/outfit/OccasionPicker.tsx`

```tsx
<OccasionPicker
  occasion={occasion}
  weather={weather}
  onOccasionChange={setOccasion}
  onWeatherChange={setWeather}
  showWeather={true} // controls weather row visibility — NOT derived from weather value
/>
```

`showWeather` defaults to `true`. Pass `showWeather={false}` in manual outfit mode.

### `components/add-item/DetailsStep.tsx`

Manual item details entry:

- Name text input
- Color description text input
- Hex input with live color preview swatch
- 28-color preset palette (tapping sets both hex + description label)
- Continue button disabled until name + colorDesc filled

---

## API Endpoints (server)

| Method | Path                  | Description                                                           |
| ------ | --------------------- | --------------------------------------------------------------------- |
| GET    | `/items/user/:userId` | Fetch user items, optional `?categorySlug=`                           |
| POST   | `/items/analyze`      | AI analysis `{ imageBase64, categoryName }`                           |
| POST   | `/items/upload-url`   | Get signed R2 upload URL `{ key, contentType }`                       |
| POST   | `/items`              | Save item to DB                                                       |
| GET    | `/categories`         | All categories ordered by `order` asc                                 |
| POST   | `/outfits/generate`   | AI outfit `{ userId, occasion?, weather? }`                           |
| POST   | `/outfits/save`       | Save outfit `{ userId, itemIds, outfitName, occasion?, aiGenerated }` |

---

## Patterns & Conventions

### Query keys

- `["profile-items", userId]` — user's wardrobe items (shared between profile stats and manual outfit picker)
- `["categories"]` — all categories
- `["outfits"]` — invalidated on outfit save

### Android API URL workaround

```ts
const API_URL = Platform.select({
  android: "http://10.0.2.2:3000",
  ios: env.EXPO_PUBLIC_SERVER_URL,
});
```

### Stable refs for focus effects (avoid infinite loops)

```ts
const resetRef = useRef(reset);
resetRef.current = reset;
useFocusEffect(useCallback(() => () => resetRef.current(), []));
```

### `aiHelperEnabled` gates

- `outfit.tsx`: switches between `<AIOutfitScreen>` / `<ManualOutfitScreen>`
- `add-item/index.tsx`: 3-step vs 4-step flow, `analyzeWithCategory` skips AI fetch
- `OccasionPicker`: `showWeather` prop
- Profile: `Switch` toggle persisted to DB via better-auth `additionalFields`
