export interface AIAnalysisResult {
  description: string;
  raw?: unknown;
}

export interface AIService {
  analyzeText(prompt: string): Promise<AIAnalysisResult>;
  analyzeImage(
    base64: string,
    mimeType: string,
    prompt: string,
  ): Promise<AIAnalysisResult>;
}
