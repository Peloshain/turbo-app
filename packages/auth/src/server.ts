import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { expo } from "@better-auth/expo";
import { magicLink } from "better-auth/plugins";
import { db } from "@repo/db";
import { serverEnv } from "./env";

export const auth = betterAuth({
  // ── Core config ───────────────────────────────────────
  secret: serverEnv.AUTH_SECRET,
  baseURL: serverEnv.AUTH_BASE_URL,

  // ── Database via Prisma ───────────────────────────────
  database: prismaAdapter(db, { provider: "postgresql" }),

  // ── Email + password ──────────────────────────────────
  emailAndPassword: {
    enabled: true,
    // Set true in production — requires email provider setup
    requireEmailVerification: false,
  },

  // ── Magic link ────────────────────────────────────────
  plugins: [
    // Expo plugin: handles deep link redirects + cookie injection for native
    expo(),

    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // TODO: swap with Resend / SendGrid in production
        console.log(`[magic-link] ${email} → ${url}`);
      },
    }),
  ],

  // ── OAuth providers ───────────────────────────────────
  socialProviders: {
    google: {
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    },
    apple: {
      clientId: serverEnv.APPLE_CLIENT_ID,
      clientSecret: serverEnv.APPLE_CLIENT_SECRET,
    },
  },

  // ── Trusted origins ───────────────────────────────────
  // Must include the app scheme for deep links to work after OAuth
  trustedOrigins: [
    "wardrobe://", // Production deep link scheme (matches app.json)
    ...(process.env.NODE_ENV === "development"
      ? [
          "exp://", // Expo Go — prefix match
          "exp://**", // Expo Go — wildcard
          "exp://192.168.*.*:*/**", // Common local IP range
          "exp://10.0.0.*:*/**", // Common local IP range
          "exp://localhost:*/**", // Simulator
        ]
      : []),
  ],
});

// Export the inferred type — used in apps/mobile to type the authClient
export type Auth = typeof auth;
