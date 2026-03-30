// ─── Public surface of auth-core ─────────────────────────
// auth-server and auth-expo import from here — never from subpaths.

// Types
export type {
  AuthUser,
  AuthSession,
  AuthState,
  AuthResult,
  SignInMethod,
  SignUpPayload,
} from "./types";

// Adapter contract + singleton
export type { IAuthAdapter } from "./adapters/IAuthAdapter";
export { authAdapter } from "./adapters/better-auth";

// Validators
export { validateEmail, validatePassword } from "./providers/email";
export { validateMagicLinkEmail } from "./providers/magic-link";

// Provider configs
export { GOOGLE_CONFIG } from "./providers/google";
export { APPLE_CONFIG } from "./providers/apple";
