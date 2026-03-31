import type { Context, Next } from "hono";
import { authAdapter } from "@repo/auth-core";
import type { AuthUser } from "@repo/auth-core";

// ─── Extend Hono context with verified user ───────────────
declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

// ─── withAuth ─────────────────────────────────────────────
// Drop-in Hono middleware. Validates Bearer token on every
// request and attaches the verified user to context.
//
// Usage:
//   app.use('/items/*', withAuth)
//   app.get('/items', (c) => {
//     const user = c.get('user')  // AuthUser — always defined here
//   })
export async function withAuth(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized — missing token" }, 401);
  }

  const token = authHeader.slice(7); // Strip "Bearer " prefix
  const user = await authAdapter.verifyToken(token);

  if (!user) {
    return c.json({ error: "Unauthorized — invalid or expired token" }, 401);
  }

  // User is now available in all downstream handlers
  c.set("user", user);
  await next();
}
