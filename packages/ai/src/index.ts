type AIProvider = "openai" | "anthropic";

interface AIConfig {
  provider: AIProvider;
  model?: string;
  apiKey: string;
}

export function createAIClient(config: AIConfig) {
  if (config.provider === "openai") {
    const { OpenAI } = require("openai");
    return new OpenAI({ apiKey: config.apiKey });
  }
  if (config.provider === "anthropic") {
    const Anthropic = require("@anthropic-ai/sdk");
    return new Anthropic({ apiKey: config.apiKey });
  }
  throw new Error(`Provider ${config.provider} no soportado`);
}

export async function generateText(
  config: AIConfig,
  prompt: string,
): Promise<string> {
  const client = createAIClient(config);

  if (config.provider === "openai") {
    const res = await client.chat.completions.create({
      model: config.model ?? "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    return res.choices[0].message.content ?? "";
  }

  if (config.provider === "anthropic") {
    const res = await client.messages.create({
      model: config.model ?? "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
    return res.content[0].type === "text" ? res.content[0].text : "";
  }

  return "";
}
