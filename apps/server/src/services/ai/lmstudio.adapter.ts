import OpenAI from "openai";
import type { AIService, AIAnalysisResult } from "./types";

export class LMStudioAdapter implements AIService {
  private client: OpenAI;
  private model: string;

  constructor(baseURL = "http://localhost:1234/v1", model = "gemma-4-e4b") {
    this.client = new OpenAI({
      baseURL,
      apiKey: "lm-studio", // required by the SDK but LM Studio ignores it
    });
    this.model = model;
  }

  async analyzeText(prompt: string): Promise<AIAnalysisResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message.content ?? "";

    return { description: text, raw: response };
  }

  async analyzeImage(
    base64: string,
    mimeType: string,
    prompt: string,
  ): Promise<AIAnalysisResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message.content ?? "";

    return { description: text, raw: response };
  }
}
