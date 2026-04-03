import { useRouter } from "expo-router";
import { authClient } from "./client";

// Auth actions hook — wraps Better Auth client methods with
// navigation and error handling for the mobile app.
export function useAuth() {
  const router = useRouter();

  // ── Email + password ────────────────────────────────────
  async function signInWithEmail(email: string, password: string) {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/(tabs)", // Redirect after successful sign in
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, data };
  }

  async function signUpWithEmail(
    email: string,
    password: string,
    name: string,
  ) {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: "/(tabs)",
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, data };
  }

  // ── Magic link ──────────────────────────────────────────
  // Sends an email — no password needed. User taps link and is logged in.
  async function signInWithMagicLink(email: string) {
    const { data, error } = await authClient.signIn.magicLink({
      email,
      // Deep link back to the app after clicking the email link
      callbackURL: "wardrobe://auth/verify",
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, data };
  }

  // ── Social providers ────────────────────────────────────
  // Opens the browser for OAuth — expoClient handles the deep link callback
  async function signInWithGoogle() {
    const { data, error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/(tabs)", // Converted to wardrobe://tabs deep link on native
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, data };
  }

  async function signInWithApple() {
    const { data, error } = await authClient.signIn.social({
      provider: "apple",
      callbackURL: "/(tabs)",
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, data };
  }

  // ── Sign out ────────────────────────────────────────────
  async function signOut() {
    await authClient.signOut();
    router.replace("/auth/sign-in");
  }

  return {
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    signInWithGoogle,
    signInWithApple,
    signOut,
  };
}
