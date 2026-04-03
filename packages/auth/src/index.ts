// Shared types only — safe to import from anywhere
export type { Session, User } from "./client";

// env helpers
export { serverEnv, clientEnv } from "./env";

// NOTE: Do NOT re-export server.ts or client.ts here.
// Import them directly with their subpath:
//   import { auth }       from '@mi-app/auth/server'
//   import { authClient } from '@mi-app/auth/client'
// This prevents bundling server code into the mobile app.
