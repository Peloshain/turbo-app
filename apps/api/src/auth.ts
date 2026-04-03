import { Hono } from "hono";
import { auth } from "@repo/auth/server";
import type { Context, Next } from "hono";

// ── Auth handler ──────────────────────────────────────────
// Mounts Better Auth on /api/auth/* — handles all auth routes:
// POST /api/auth/sign-in/email
// POST /api/auth/sign-up/email
// POST /api/auth/sign-in/magic-link
// GET  /api/auth/sign-in/social?provider=google
// GET  /api/auth/sign-in/social?provider=apple
// POST /api/auth/sign-out
// GET  /api/auth/get-session
export const authRouter = new Hono().on(["GET", "POST"], "/api/auth/**", (c) =>
  auth.handler(c.req.raw),
);

// ── withAuth middleware ───────────────────────────────────
// Protects routes by verifying the session cookie sent by the Expo client.
// Better Auth uses cookies (via SecureStore on native), not Bearer tokens.
// Usage:
//   itemsRouter.use('*', withAuth)
//   const user = c.get('user')   ← typed, verified user
declare module "hono" {
  interface ContextVariableMap {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
    };
  }
}

export async function withAuth(c: Context, next: Next) {
  // getSession validates the session cookie from the request headers.
  // The expoClient injects cookies automatically on every request.
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Attach verified user to context — available in all downstream handlers
  c.set("user", {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
  });

  await next();
}
