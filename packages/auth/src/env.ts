// Validate all auth-related env vars at startup.
// Import this file first in both apps/api and apps/mobile.

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

// ── Server-only vars (apps/api) ───────────────────────────
export const serverEnv = {
  get AUTH_SECRET() {
    return requireEnv("AUTH_SECRET");
  },
  get AUTH_BASE_URL() {
    return requireEnv("AUTH_BASE_URL");
  },
  get DATABASE_URL() {
    return requireEnv("DATABASE_URL");
  },
  get GOOGLE_CLIENT_ID() {
    return requireEnv("GOOGLE_CLIENT_ID");
  },
  get GOOGLE_CLIENT_SECRET() {
    return requireEnv("GOOGLE_CLIENT_SECRET");
  },
  get APPLE_CLIENT_ID() {
    return requireEnv("APPLE_CLIENT_ID");
  },
  get APPLE_CLIENT_SECRET() {
    return requireEnv("APPLE_CLIENT_SECRET");
  },
};

// ── Client-only vars (apps/mobile) ────────────────────────
// EXPO_PUBLIC_ prefix is required by Expo to expose vars to the client bundle
export const clientEnv = {
  get API_URL() {
    return requireEnv("EXPO_PUBLIC_API_URL");
  },
};
