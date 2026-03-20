import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageService, UploadResult } from "../types";

export class R2Adapter implements StorageService {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(config: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicUrl: string; // https://pub-xxx.r2.dev  or any custom domain
  }) {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl;
  }

  async upload({
    key,
    body,
    mimeType,
  }: {
    key: string;
    body: Buffer | Uint8Array;
    mimeType: string;
  }): Promise<UploadResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: mimeType,
      }),
    );

    return { key, url: this.getUrl(key) };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  getUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  async getSignedUploadUrl(key: string, mimeType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });
    return getSignedUrl(this.client, command, { expiresIn: 60 }); // 60 seconds
  }
}
