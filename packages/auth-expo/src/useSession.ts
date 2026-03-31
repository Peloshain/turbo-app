import { _useAuthContext } from "./AuthProvider";

// ─── useSession ───────────────────────────────────────────
// Lightweight hook for components that only need to know
// if the user is authenticated — no auth actions needed.
//
// Usage:
//   const { user, isAuthenticated, isLoading } = useSession()
export function useSession() {
  const { user, session, isLoading, isAuthenticated } = _useAuthContext();
  return { user, session, isLoading, isAuthenticated };
}
