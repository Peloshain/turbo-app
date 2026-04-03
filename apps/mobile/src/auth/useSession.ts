import { authClient } from "./client";

// Reactive session hook — re-renders automatically when session changes.
// Uses Better Auth's built-in useSession from better-auth/react.
// Returns:
//   data       → { user, session } | null
//   isPending  → true while loading
//   error      → Error | null
export function useSession() {
  return authClient.useSession();
}

// Convenience: returns just the user or null
export function useUser() {
  const { data } = authClient.useSession();
  return data?.user ?? null;
}
