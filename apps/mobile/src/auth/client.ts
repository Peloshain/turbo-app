// Single source of truth for the auth client in the mobile app.
// Import everything auth-related from here, never from @mi-app/auth/client directly.
export { authClient } from "@repo/auth/client";
export type { Session, User } from "@repo/auth/client";
