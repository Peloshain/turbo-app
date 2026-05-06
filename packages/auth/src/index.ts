import { db } from "@repo/db";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import "dotenv/config";
import { env } from "@repo/env/server";

export function createAuth() {
  return betterAuth({
    database: prismaAdapter(db, {
      provider: "postgresql",
    }),

    trustedOrigins: [
      env.CORS_ORIGIN,
      ...[
        "exp://",
        "exp://**",
        "exp://192.168.*.*:*/**",
        "http://localhost:8081",
      ],
    ],
    emailAndPassword: {
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
    plugins: [expo()],
    user: {
      changeEmail: { enabled: true },
      additionalFields: {
        aiHelperEnabled: {
          type: "boolean",
          defaultValue: true,
          required: false,
          input: true,
        },
      },
    },
  });
}

export const auth = createAuth();
