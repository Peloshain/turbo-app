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
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
