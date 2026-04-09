import type { AIService } from "./types";
import { GeminiAdapter } from "./gemini.adapter";
import { env } from "@repo/env/server";

export function createAIService(): AIService {
  //post mvp read this from BD instead env
  const provider = env.AI_PROVIDER ?? "gemini";

  switch (provider) {
    case "gemini": {
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is required");
      return new GeminiAdapter(apiKey, env.GEMINI_MODEL);
    }
    // case 'openai': return new OpenAIAdapter(...)
    // case 'anthropic': return new AnthropicAdapter(...)
    default:
      throw new Error(`Unknown AI provider: "${provider}"`);
  }
}

// Singleton — once the server is up
export const aiService = createAIService();
