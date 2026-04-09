import type { StorageService } from "./types";
import { LocalAdapter } from "./adapters/local.adapter";
import { R2Adapter } from "./adapters/r2.adapter";
import { env } from "@repo/env/server";

export function createStorageService(): StorageService {
  const provider = env.STORAGE_PROVIDER ?? "local";
  console.log(`[Factory] STORAGE_PROVIDER: ${provider}`);
  switch (provider) {
    case "local":
      console.log(`[Factory] LocalUpload: ${env.LOCAL_UPLOAD_DIR}`);
      console.log(`[Factory] localBaseUrl: ${env.LOCAL_BASE_URL}`);
      return new LocalAdapter(env.LOCAL_UPLOAD_DIR, env.LOCAL_BASE_URL);

    case "r2":
      return new R2Adapter({
        accountId: env.R2_ACCOUNT_ID,
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        bucket: env.R2_BUCKET,
        publicUrl: env.R2_PUBLIC_URL,
      });

    // case 's3': return new S3Adapter(...)
    default:
      throw new Error(`Unknown storage provider: "${provider}"`);
  }
}

export const storageService = createStorageService();
