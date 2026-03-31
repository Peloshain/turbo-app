import { useCallback } from "react";
import { _useAuthContext } from "./AuthProvider";
import type { SignInMethod, SignUpPayload, AuthResult } from "@repo/auth-core";
import { GOOGLE_CONFIG, APPLE_CONFIG } from "@repo/auth-core";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

// Ensure the browser session closes properly after OAuth on Android
WebBrowser.maybeCompleteAuthSession();

// ─── useAuth ──────────────────────────────────────────────
// Main hook for auth actions. Handles email, magic link,
// and OAuth (Google/Apple) native flows.
export function useAuth() {
  const { signIn, signUp, signOut, refreshSession, ...state } =
    _useAuthContext();

  // ── OAuth sign-in — opens native browser, handles redirect
  const signInWithOAuth = useCallback(
    async (provider: "google" | "apple"): Promise<AuthResult> => {
      const config = provider === "google" ? GOOGLE_CONFIG : APPLE_CONFIG;
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: config.scheme,
        path: config.path,
      });

      // Opens the OAuth consent screen in a system browser
      const result = await WebBrowser.openAuthSessionAsync(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/${provider}?redirectUri=${redirectUri}`,
        redirectUri,
      );

      if (result.type !== "success") {
        return { ok: false, error: "OAuth cancelled or failed" };
      }

      // Extract token from the deep link callback URL
      const url = new URL(result.url);
      const token = url.searchParams.get("token");

      if (!token) return { ok: false, error: "No token in callback" };

      // Use the token to sign in via the core adapter
      return signIn({ type: provider });
    },
    [signIn],
  );

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshSession,
    signInWithOAuth,
  };
}
