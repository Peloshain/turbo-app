import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIService, AIAnalysisResult } from "../types";

export class GeminiAdapter implements AIService {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model = "gemini-1.5-flash") {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }
  async analyzeText(
    prompt: string,
    signal?: AbortSignal,
  ): Promise<AIAnalysisResult> {
    const model = this.client.getGenerativeModel({ model: this.model });

    const result = await model.generateContent(prompt, { signal });

    return {
      description: result.response.text(),
      raw: result.response,
    };
  }

  async analyzeImage(
    base64: string,
    mimeType: string,
    prompt: string,
    signal?: AbortSignal,
  ): Promise<AIAnalysisResult> {
    const model = this.client.getGenerativeModel({ model: this.model });

    const result = await model.generateContent(
      [prompt, { inlineData: { data: base64, mimeType } }],
      { signal },
    );

    return {
      description: result.response.text(),
      raw: result.response,
    };
  }
}
