import type {
  AuthResult,
  AuthSession,
  AuthUser,
  SignInMethod,
  SignUpPayload,
} from "../types";

// ─── Provider contract ────────────────────────────────────
// Any auth provider (Better Auth, Cognito, Clerk, Auth0…)
// must implement every method below. auth-server and auth-expo
// depend only on this interface — never on a concrete provider.
export interface IAuthAdapter {
  signIn(method: SignInMethod): Promise<AuthResult>;
  signUp(payload: SignUpPayload): Promise<AuthResult>;
  signOut(): Promise<void>;

  getSession(): Promise<AuthSession | null>;
  refreshSession(): Promise<AuthSession | null>;

  getUser(): Promise<AuthUser | null>;
  updateUser(
    data: Partial<Pick<AuthUser, "name" | "image">>,
  ): Promise<AuthUser>;

  // Used by auth-server middleware to validate Bearer tokens
  verifyToken(token: string): Promise<AuthUser | null>;
}
