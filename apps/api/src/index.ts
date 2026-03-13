import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "@repo/db";
import { generateText } from "@repo/ai";
import { getUploadUrl, getPublicUrl } from "@repo/storage";

const app = new Hono();

app.use("*", cors());

// Health check
app.get("/", (c) => c.json({ status: "ok" }));

// Obtener URL para subir imagen directo desde el cliente
app.post("/storage/upload-url", async (c) => {
  const { key, contentType } = await c.req.json();
  const url = await getUploadUrl(key, contentType);
  return c.json({ url, publicUrl: getPublicUrl(key) });
});

// Endpoint de AI
app.post("/ai/generate", async (c) => {
  const { prompt } = await c.req.json();
  const text = await generateText(
    {
      provider: (process.env.AI_PROVIDER as any) ?? "openai",
      apiKey: process.env.AI_API_KEY!,
    },
    prompt,
  );
  return c.json({ text });
});

export default app;
