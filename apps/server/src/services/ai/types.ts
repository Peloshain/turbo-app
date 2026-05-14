export interface AIAnalysisResult {
  description: string;
  raw?: unknown;
}

export interface AIService {
  analyzeText(prompt: string, signal?: AbortSignal): Promise<AIAnalysisResult>;
  analyzeImage(
    base64: string,
    mimeType: string,
    prompt: string,
    signal?: AbortSignal,
  ): Promise<AIAnalysisResult>;
}
