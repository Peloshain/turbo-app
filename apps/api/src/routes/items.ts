import { Hono } from "hono";
import { db } from "@repo/db";
import { getUploadUrl, getPublicUrl } from "@repo/storage";
import OpenAI from "openai";

export const itemsRouter = new Hono();
const prompt = `Analiza esta prenda de ropa. Es de la categoría: ${categoryName}.
                    Responde ÚNICAMENTE con un JSON válido, sin texto extra, con esta estructura:
                    {
                    "name": "nombre descriptivo corto de la prenda (máx 5 palabras)",
                    "colorDesc": "descripción del color o patrón principal (máx 8 palabras)",
                    "colorHex": "color HEX dominante de la prenda, ej: #2563EB"
                    }`;

const openai = new OpenAI({ apiKey: process.env.AI_API_KEY! });

// Analize image before save
itemsRouter.post("/analyze", async (c) => {
  const { imageBase64, categoryName } = await c.req.json<{
    imageBase64: string; // "data:image/jpeg;base64,..."
    categoryName: string; // "Shirts"
  }>();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // vision + cheap for mvp
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: imageBase64, detail: "low" }, // 'low' = even cheaper
          },
          {
            type: "text",
            text: prompt.replace("${categoryName}", categoryName),
          },
        ],
      },
    ],
  });

  const raw = response.choices[0].message.content ?? "{}";

  // Limpiamos por si GPT agrega backticks
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const result = JSON.parse(cleaned);
    return c.json({ ok: true, ...result });
  } catch {
    return c.json(
      { ok: false, error: "No se pudo parsear respuesta de IA" },
      500,
    );
  }
});

// Get url to upload image
itemsRouter.post("/upload-url", async (c) => {
  const { key, contentType } = await c.req.json<{
    key: string;
    contentType: string;
  }>();
  const url = await getUploadUrl(key, contentType);
  return c.json({ url, publicUrl: getPublicUrl(key) });
});

// Save analized item
itemsRouter.post("/", async (c) => {
  const { name, imageUrl, imageKey, colorDesc, colorHex, categoryId, userId } =
    await c.req.json();

  const item = await db.item.create({
    data: { name, imageUrl, imageKey, colorDesc, colorHex, categoryId, userId },
    include: { category: true },
  });

  return c.json({ ok: true, item });
});

// User items by user
itemsRouter.get("/user/:userId", async (c) => {
  const { userId } = c.req.param();
  const { categorySlug } = c.req.query();

  const items = await db.item.findMany({
    where: {
      userId,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ items });
});

// Delete item
itemsRouter.delete("/:id", async (c) => {
  const { id } = c.req.param();
  await db.item.delete({ where: { id } });
  return c.json({ ok: true });
});
