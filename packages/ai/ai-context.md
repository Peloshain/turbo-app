# AI Integration Spec

## Stack

- Backend: Hono | Mobile: React Native/Expo
- Dev: LM Studio (local) | Prod: Gemini (swap via env var)

## Env

```bash
AI_PROVIDER=lmstudio|gemini
LMSTUDIO_BASE_URL=http://192.168.1.x:1234/v1
LMSTUDIO_MODEL=gemma-4-e4b
GEMINI_API_KEY=xxx
GEMINI_MODEL=gemini-1.5-flash
```

## Types

```typescript
interface AIAnalysisResult {
  description: string;
  raw: unknown;
}
interface AIService {
  analyzeText(prompt: string, signal?: AbortSignal): Promise<AIAnalysisResult>;
  analyzeImage(
    base64: string,
    mimeType: string,
    prompt: string,
    signal?: AbortSignal,
  ): Promise<AIAnalysisResult>;
}
```

## Factory

```typescript
export const aiService: AIService = (() => {
  switch (env.AI_PROVIDER ?? "gemini") {
    case "gemini":
      return new GeminiAdapter(env.GEMINI_API_KEY, env.GEMINI_MODEL);
    case "lmstudio":
      return new LMStudioAdapter(env.LMSTUDIO_BASE_URL, env.LMSTUDIO_MODEL);
    default:
      throw new Error(`Unknown provider: ${env.AI_PROVIDER}`);
  }
})();
```

## LMStudioAdapter

Uses `openai` SDK. `apiKey` is ignored by LM Studio but required by the SDK.

```typescript
constructor(baseURL = "http://localhost:1234/v1", model = "gemma-4-e4b") {
  this.client = new OpenAI({ baseURL, apiKey: "lm-studio" });
}
// analyzeText: chat.completions.create({ temperature: 0, messages: [{role:"user", content: prompt}] }, { signal })
// analyzeImage: same but content is array: [{ type:"image_url", image_url:{ url:`data:${mimeType};base64,${base64}` } }, { type:"text", text: prompt }]
// Always return: { description: response.choices[0].message.content ?? "", raw: response }
```

## GeminiAdapter

```typescript
// analyzeText: model.generateContent(prompt, { signal })
// analyzeImage: model.generateContent([prompt, { inlineData: { data: base64, mimeType } }], { signal })
// Always return: { description: result.response.text(), raw: result.response }
```

## JSON Parsing (both routes)

````typescript
const match = raw.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
if (!match) return c.json({ error: "Invalid AI response" }, 500);
const result = JSON.parse(match[0]); // always match[0], never full string
````

> Local models may add reasoning text or markdown fences — `match[0]` extracts only the JSON object.

## Route: POST /items/analyze

Prompt returns: `{ name, colorDesc, colorHex }`
Response: `{ result: { ok: true, name, colorDesc, colorHex } }`

## Route: POST /outfits/suggest

Prompt returns: `{ itemIds, outfitName, reason, styleNote }`
After parsing: filter `itemIds` against DB, fetch full items, return:
`{ ok: true, outfit: { itemIds, outfitName, reason, styleNote, items[] } }`

## Prompt tips

- Always end with: `"Start your response with { and end with }."`
- Set `temperature: 0` for all JSON tasks

## Cancellation — Backend (Hono)

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15_000);
c.req.raw.signal?.addEventListener("abort", () => controller.abort());
// pass controller.signal to aiService calls
// catch AbortError → 408, finally clearTimeout
```

## Cancellation — Mobile (Expo)

```typescript
const controllerRef = useRef<AbortController | null>(null);
// on analyze: controllerRef.current?.abort(); controllerRef.current = new AbortController();
// pass signal to fetch()
// cancel(): controllerRef.current?.abort()
// catch AbortError → setError("Cancelled")
```

Button swaps between "Analyze" / "Cancel" based on `loading` state.

## Image Preprocessing

```typescript
// npx expo install expo-image-manipulator
const resized = await ImageManipulator.manipulateAsync(
  uri,
  [{ resize: { width: 800 } }],
  { compress: 0.8, format: SaveFormat.JPEG, base64: true },
);
```

## LM Studio Setup

- Listen on `0.0.0.0` (not localhost) for device access on port `1234`
- External access: local IP (same WiFi) → Ngrok (testers) → LM Link (built-in tunnel)
- Never expose via port forwarding
