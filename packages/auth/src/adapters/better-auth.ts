import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@repo/db";
import type { IAuthAdapter } from "./IAuthAdapter";
import type {
  AuthResult,
  AuthSession,
  AuthUser,
  SignInMethod,
  SignUpPayload,
} from "../types";
import { magicLink } from "better-auth/plugins";

// ─── Better Auth server instance ─────────────────────────
// Only instantiated here — nowhere else in the codebase.
export const betterAuthInstance = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  baseURL: process.env.AUTH_BASE_URL ?? "http://localhost:3000",

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Enable in production
  },

  //   magicLink: {
  //     enabled: true,
  //     sendMagicLink: async ({ email, url }: { email: string; url: string }) => {
  //       // TODO: plug in Resend, SendGrid, etc.
  //       console.log(`[magic-link] ${email} → ${url}`);
  //     },
  //   },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
  },

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }: { email: string; url: string }) => {
        console.log(`Magic link for ${email}: ${url}`);
      },
    }),
  ],
});

// ─── Internal mappers ─────────────────────────────────────
function mapUser(raw: any): AuthUser {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name ?? null,
    image: raw.image ?? null,
    createdAt: new Date(raw.createdAt),
  };
}

function mapSession(rawSession: any, rawUser: any): AuthSession {
  return {
    user: mapUser(rawUser),
    token: rawSession.token,
    expiresAt: new Date(rawSession.expiresAt),
  };
}

// ─── BetterAuthAdapter ────────────────────────────────────
// The only class that knows about Better Auth internals.
// Swap this class out to change providers — nothing else changes.
export class BetterAuthAdapter implements IAuthAdapter {
  private client = betterAuthInstance;

  async signIn(method: SignInMethod): Promise<AuthResult> {
    try {
      if (method.type === "email") {
        const result = await this.client.api.signInEmail({
          body: { email: method.email, password: method.password },
        });
        if (!result?.user) return { ok: false, error: "Invalid credentials" };
        return {
          ok: true,
          user: mapUser(result.user),
          session: {
            user: mapUser(result.user),
            token: result.token, // ← viene directo en result
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
          },
        };
      }

      //   if (method.type === "magic-link") {
      //     await this.client.api.sendMagicLink({ body: { email: method.email } });
      //     return { ok: true, pendingVerification: true };
      //   }

      // Google and Apple complete their OAuth flow client-side —
      // the adapter just acknowledges the intent here
      if (method.type === "google" || method.type === "apple") {
        return { ok: true };
      }

      return { ok: false, error: "Unsupported method" };
    } catch (err: any) {
      return { ok: false, error: err?.message ?? "Sign in failed" };
    }
  }

  async signUp(payload: SignUpPayload): Promise<AuthResult> {
    try {
      const result = await this.client.api.signUpEmail({
        body: {
          email: payload.email,
          password: payload.password,
          name: payload.name ?? "",
        },
      });
      if (!result?.user) return { ok: false, error: "Sign up failed" };
      return {
        ok: true,
        user: mapUser(result.user),
        session: {
          user: mapUser(result.user),
          token: result.token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      };
    } catch (err: any) {
      return { ok: false, error: err?.message ?? "Sign up failed" };
    }
  }

  async signOut(): Promise<void> {
    await this.client.api.signOut();
  }

  async getSession(): Promise<AuthSession | null> {
    try {
      const res = await this.client.api.getSession();
      if (!res?.session || !res?.user) return null;
      return mapSession(res.session, res.user);
    } catch {
      return null;
    }
  }

  async refreshSession(): Promise<AuthSession | null> {
    return this.getSession();
  }

  async getUser(): Promise<AuthUser | null> {
    const session = await this.getSession();
    return session?.user ?? null;
  }

  async updateUser(
    data: Partial<Pick<AuthUser, "name" | "image">>,
  ): Promise<AuthUser> {
    await this.client.api.updateUser({
      body: data as { name?: string; image?: string | null },
    });

    const result = await this.client.api.getSession();
    if (!result?.user) throw new Error("Failed to get updated user");
    return mapUser(result.user);
  }

  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const res = await this.client.api.getSession({
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res?.user) return null;
      return mapUser(res.user);
    } catch {
      return null;
    }
  }
}

// ─── Singleton ────────────────────────────────────────────
// This is the ONE place you change when swapping providers:
// export const authAdapter: IAuthAdapter = new CognitoAdapter()
export const authAdapter: IAuthAdapter = new BetterAuthAdapter();
