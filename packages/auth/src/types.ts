// ─── Core domain types ────────────────────────────────────
// These never change regardless of which auth provider is used.

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
}

export interface AuthSession {
  user: AuthUser;
  token: string | null;
  expiresAt: Date;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export type SignInMethod =
  | { type: "email"; email: string; password: string }
  | { type: "magic-link"; email: string }
  | { type: "google" }
  | { type: "apple" };

export interface SignUpPayload {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResult {
  ok: boolean;
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
  // True when magic link is sent — no session yet, awaiting email click
  pendingVerification?: boolean;
}
