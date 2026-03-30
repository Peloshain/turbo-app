// Google OAuth config shared between auth-expo and auth-server.
// auth-expo reads redirectUri for the native flow.
// auth-server reads scopes for token validation.

export const GOOGLE_CONFIG = {
  scopes: ["openid", "email", "profile"],
  // Deep link scheme — must match app.json
  scheme: "wardrobe",
  path: "auth/callback/google",
};
