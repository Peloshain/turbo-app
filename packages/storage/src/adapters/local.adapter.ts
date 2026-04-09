import { mkdir, writeFile, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { StorageService, UploadResult } from "../types";

export class LocalAdapter implements StorageService {
  private uploadDir: string;
  private baseUrl: string;

  constructor(uploadDir = "./uploads", baseUrl: string) {
    console.log(`[LocalAdapter] uploadDir: ${uploadDir}`);
    console.log(`[LocalAdapter] baseUrl: ${baseUrl}`);

    this.uploadDir = uploadDir;
    this.baseUrl = baseUrl;
    console.log("running local storage");
  }

  async upload({
    key,
    body,
    mimeType: _,
  }: {
    key: string;
    body: Buffer | Uint8Array;
    mimeType: string;
  }): Promise<UploadResult> {
    const filePath = join(this.uploadDir, key);
    const dir = dirname(filePath);

    console.log("[LocalAdapter] filePath:", filePath);
    console.log("[LocalAdapter] dir:", dir);

    await mkdir(dir, { recursive: true });
    await writeFile(filePath, body);

    return { key, url: this.getUrl(key) };
  }

  async delete(key: string): Promise<void> {
    await unlink(join(this.uploadDir, key));
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }

  async getSignedUploadUrl(key: string, _mimeType: string): Promise<string> {
    console.log(`[baseUrl]: ${this.baseUrl}`);
    return `${this.baseUrl}/${key}`;
  }
}
