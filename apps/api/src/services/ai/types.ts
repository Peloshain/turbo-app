export interface AIAnalysisResult {
  description: string;
  raw?: unknown;
}

export interface AIService {
  analyzeImage(
    base64: string,
    mimeType: string,
    prompt: string,
  ): Promise<AIAnalysisResult>;
}
