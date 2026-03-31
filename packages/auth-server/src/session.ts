import { authAdapter } from "@repo/auth-core";
import type { AuthUser } from "@repo/auth-core";

// ─── getSessionUser ───────────────────────────────────────
// Use in routes where auth is optional — you want the user if
// they're logged in, but don't block unauthenticated requests.
//
// Usage:
//   const user = await getSessionUser(c.req.header('Authorization'))
//   if (user) { /* personalized response */ }
export async function getSessionUser(
  authHeader: string | undefined,
): Promise<AuthUser | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return authAdapter.verifyToken(token);
}
