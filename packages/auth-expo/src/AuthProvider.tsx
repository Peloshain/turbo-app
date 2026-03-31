import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { authAdapter } from "@repo/auth-core";
import type {
  AuthResult,
  AuthSession,
  AuthState,
  AuthUser,
  SignInMethod,
  SignUpPayload,
} from "@repo/auth-core";
import { secureStorage } from "./storage";

// ─── Context shape ────────────────────────────────────────
interface AuthContextValue extends AuthState {
  signIn(method: SignInMethod): Promise<AuthResult>;
  signUp(payload: SignUpPayload): Promise<AuthResult>;
  signOut(): Promise<void>;
  refreshSession(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Reducer ──────────────────────────────────────────────
type Action =
  | { type: "LOADING" }
  | { type: "SET_SESSION"; session: AuthSession; user: AuthUser }
  | { type: "CLEAR" };

const INITIAL: AuthState = {
  user: null,
  session: null,
  isLoading: true, // Stays true until we check secure storage on mount
  isAuthenticated: false,
};

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case "LOADING":
      return { ...state, isLoading: true };
    case "SET_SESSION":
      return {
        isLoading: false,
        isAuthenticated: true,
        user: action.user,
        session: action.session,
      };
    case "CLEAR":
      return { ...INITIAL, isLoading: false };
  }
}

// ─── AuthProvider ─────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // On mount: check if there's an existing session persisted on device
  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const session = await authAdapter.getSession();
      if (session && session.token) {
        dispatch({ type: "SET_SESSION", session, user: session.user });
        await secureStorage.save(session.token);
      } else {
        dispatch({ type: "CLEAR" });
      }
    } catch {
      // If anything fails during restore, treat as logged out
      dispatch({ type: "CLEAR" });
    }
  }

  const signIn = useCallback(
    async (method: SignInMethod): Promise<AuthResult> => {
      dispatch({ type: "LOADING" });
      try {
        const result = await authAdapter.signIn(method);
        if (result.ok && result.session && result.session.token) {
          dispatch({
            type: "SET_SESSION",
            session: result.session,
            user: result.session.user,
          });
          await secureStorage.save(result.session.token);
        } else {
          dispatch({ type: "CLEAR" });
        }
        return result;
      } catch (err: any) {
        dispatch({ type: "CLEAR" });
        return { ok: false, error: err?.message ?? "Sign in failed" };
      }
    },
    [],
  );

  const signUp = useCallback(
    async (payload: SignUpPayload): Promise<AuthResult> => {
      dispatch({ type: "LOADING" });
      try {
        const result = await authAdapter.signUp(payload);
        if (result.ok && result.session && result.session.token) {
          dispatch({
            type: "SET_SESSION",
            session: result.session,
            user: result.session.user,
          });
          await secureStorage.save(result.session.token);
        } else {
          dispatch({ type: "CLEAR" });
        }
        return result;
      } catch (err: any) {
        dispatch({ type: "CLEAR" });
        return { ok: false, error: err?.message ?? "Sign up failed" };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    await authAdapter.signOut();
    await secureStorage.clear();
    dispatch({ type: "CLEAR" });
  }, []);

  const refreshSession = useCallback(async () => {
    const session = await authAdapter.refreshSession();
    if (session) {
      dispatch({ type: "SET_SESSION", session, user: session.user });
    } else {
      dispatch({ type: "CLEAR" });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, signIn, signUp, signOut, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Internal hook — not exported from index ──────────────
// Use useAuth or useSession from index instead
export function _useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
