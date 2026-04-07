// Shared types only — safe to import from anywhere
export type { Session, User } from "./client";

// env helpers
export { serverEnv, clientEnv } from "./env";

// ─── Validation helpers — safe to use in mobile and api ──
// Inline here to avoid adding provider files to the simplified structure.

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
}

export function validateMagicLinkEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
  return null;
}

// NOTE: Do NOT re-export server.ts or client.ts here.
// Import them directly with their subpath:
//   import { auth }       from '@mi-app/auth/server'
//   import { authClient } from '@mi-app/auth/client'
// This prevents bundling server code into the mobile app.
