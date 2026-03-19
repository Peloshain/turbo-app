import type { AIService } from "./types";
import { GeminiAdapter } from "./gemini.adapter";

export function createAIService(): AIService {
  //post mvp read this from BD instead env
  const provider = process.env.AI_PROVIDER ?? "gemini";

  switch (provider) {
    case "gemini": {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is required");
      return new GeminiAdapter(apiKey, process.env.GEMINI_MODEL);
    }
    // case 'openai': return new OpenAIAdapter(...)
    // case 'anthropic': return new AnthropicAdapter(...)
    default:
      throw new Error(`Unknown AI provider: "${provider}"`);
  }
}

// Singleton — once the server is up
export const aiService = createAIService();
