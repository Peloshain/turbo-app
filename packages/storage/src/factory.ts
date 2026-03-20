import type { StorageService } from "./types";
import { LocalAdapter } from "./adapters/local.adapter";
import { R2Adapter } from "./adapters/r2.adapter";

export function createStorageService(): StorageService {
  const provider = process.env.STORAGE_PROVIDER ?? "local";

  switch (provider) {
    case "local":
      // const LocalUpload = process.env["LOCAL_UPLOAD_DIR"];
      // const localBaseUrl = process.env["LOCAL_BASE_URL"];
      const LocalUpload = "./uploads";
      const localBaseUrl = "http://10.0.2.2:3000/uploads";

      return new LocalAdapter(LocalUpload, localBaseUrl);

    case "r2":
      return new R2Adapter({
        accountId: process.env.R2_ACCOUNT_ID!,
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        bucket: process.env.R2_BUCKET!,
        publicUrl: process.env.R2_PUBLIC_URL!,
      });

    // case 's3': return new S3Adapter(...)
    default:
      throw new Error(`Unknown storage provider: "${provider}"`);
  }
}

export const storageService = createStorageService();
