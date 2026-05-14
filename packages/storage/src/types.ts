export interface UploadResult {
  key: string; // file key
  url: string; // url to show the file
}

export interface StorageService {
  upload(params: {
    key: string;
    body: Buffer | Uint8Array;
    mimeType: string;
  }): Promise<UploadResult>;

  delete(key: string): Promise<void>;

  getUrl(key: string): string;

  getSignedUploadUrl(key: string, mimeType: string): Promise<string>;
}
