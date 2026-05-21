import type { AIService } from "./types.ts";
import { GeminiAdapter } from "./adapters/gemini.adapter.ts";
import { env } from "@repo/env/server";
import { LMStudioAdapter } from "./adapters/lmstudio.adapter.ts";
export * from "./utils/index.ts";

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
    case "lmstudio": {
      return new LMStudioAdapter(
        env.LMSTUDIO_BASE_URL, // e.g. "http://192.168.1.x:1234/v1"
        env.LMSTUDIO_MODEL, // e.g. "gemma-4-e4b"
      );
    }

    default:
      throw new Error(`Unknown AI provider: "${provider}"`);
  }
}

// Singleton — once the server is up
export const aiService = createAIService();
