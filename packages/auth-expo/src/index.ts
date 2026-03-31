// ─── Public surface of auth-expo ─────────────────────────
// Only import from here in apps/mobile — never from subpaths.

export { AuthProvider } from "./AuthProvider";
export { useAuth } from "./useAuth";
export { useSession } from "./useSession";
export { secureStorage } from "./storage";

// Re-export types so mobile screens don't need auth-core directly
export type {
  AuthUser,
  AuthSession,
  AuthState,
  AuthResult,
  SignInMethod,
  SignUpPayload,
} from "@repo/auth-core";
