import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    AI_PROVIDER: z.string().default("gemini"),
    GEMINI_MODEL: z.string(),
    GEMINI_API_KEY: z.string(),
    AI_ENABLED: z.string().default("false"),
    STORAGE_PROVIDER: z.string(),
    LOCAL_UPLOAD_DIR: z.string(),
    LOCAL_BASE_URL: z.url(),
    R2_ACCOUNT_ID: z.string(),
    R2_ACCESS_KEY_ID: z.string(),
    R2_SECRET_ACCESS_KEY: z.string(),
    R2_BUCKET: z.string(),
    R2_PUBLIC_URL: z.url(),
    LMSTUDIO_BASE_URL: z.url().default("http://localhost:1234/v1"),
    LMSTUDIO_MODEL: z.string().default("gemma-4-e4b"),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    AI_PROVIDER: process.env.AI_PROVIDER,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    AI_ENABLED: process.env.AI_ENABLED,
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
    LOCAL_UPLOAD_DIR: process.env.LOCAL_UPLOAD_DIR,
    LOCAL_BASE_URL: process.env.LOCAL_BASE_URL,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    LMSTUDIO_BASE_URL: process.env.LMSTUDIO_BASE_URL,
    LMSTUDIO_MODEL: process.env.LMSTUDIO_MODEL,
    NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
});
