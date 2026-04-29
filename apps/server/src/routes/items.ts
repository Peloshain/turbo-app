import "dotenv/config";
import { Hono } from "hono";
import { db } from "@repo/db";
import { storageService } from "@repo/storage";
// import OpenAI from "openai";
import { aiService, parseDataUrl } from "@repo/ai";
import { env } from "@repo/env/server";

export const itemsRouter = new Hono();

// const openai = new OpenAI({ apiKey: .AI_API_KEY! });

// Analize image before save
itemsRouter.post("/analyze", async (c) => {
  // Abort if client disconnects OR if it takes more than 15s
  const controller = new AbortController();
  // If the client drops the connection, abort too
  c.req.raw.signal?.addEventListener("abort", () => controller.abort());

  const { imageBase64, categoryName } = await c.req.json<{
    imageBase64: string;
    categoryName: string;
  }>();

  if (!imageBase64) {
    return c.json({ error: "imageBase64 is required" }, 400);
  }

  // ─── AI guard ─────────────────────────────────────────────
  if (env.AI_ENABLED === "false") {
    return c.json({
      result: {
        ok: true,
        name: "Mock Item",
        colorDesc: "Green",
        colorHex: "#1F8508",
      },
    });
  }

  if (!imageBase64) {
    return c.json({ error: "imageBase64 is required" }, 400);
  }

  // image analyzer
  const { mimeType, base64 } = parseDataUrl(imageBase64);

  const prompt = `
    Analyze this image of an item in the category "${categoryName}".
    Respond ONLY with a valid JSON object, no markdown, no explanation.
    Format:
    {
      "name": "short descriptive name of the item",
      "colorDesc": "human-readable color description (e.g. 'navy blue', 'forest green')",
      "colorHex": "the dominant color as hex code (e.g. '#1B3A6B')"
    }
  `;

  const { description } =
    base64 && mimeType
      ? await aiService.analyzeImage(
          base64,
          mimeType,
          prompt,
          controller.signal,
        )
      : { description: "" };

  // text analyzer
  // const textPrompt = `
  //   Imagine that I've sent you an image of an item in the category "${categoryName}".
  //   Respond ONLY with a valid JSON object, no markdown, no explanation.
  //   Format:
  //   {
  //     "name": "short descriptive name of the item",
  //     "colorDesc": "human-readable color description (e.g. 'navy blue', 'forest green')",
  //     "colorHex": "the dominant color as hex code (e.g. '#1B3A6B')"
  //   }
  // `;
  // text analyzer
  // const { description } = await aiService.analyzeText(textPrompt);

  // Clean response from ```json if the model decides to wrap it in a code block
  const clean = description.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);

  console.log(`CLEAN RESPONSE: ${clean}`);
  if (!match) return c.json({ error: "Invalid AI response" }, 500);

  try {
    const result = JSON.parse(match[0]); //  parse the extracted JSON, not the whole string
    console.log(`PARSED RESULT: ${JSON.stringify(result)}`); //  readable object log
    return c.json({ result: { ok: true, ...result } });
  } catch (e) {
    console.error("JSON parse failed:", e);
    return c.json({ error: "Failed to parse AI response" }, 500);
  }
});

itemsRouter.post("/upload-url", async (c) => {
  const { key, contentType } = await c.req.json<{
    key: string;
    contentType: string;
  }>();
  const url = await storageService.getSignedUploadUrl(key, contentType);
  const publicUrl = storageService.getUrl(key);

  return c.json({ url, publicUrl });
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
  console.log(
    `[GET /items/user/:userId] Request received with userId: ${c.req.param("userId")}`,
  );
  const { userId } = c.req.param();
  const { categorySlug } = c.req.query();

  console.log(`[item request]: ${userId} ${categorySlug}`);
  const items = await db.item.findMany({
    where: {
      userId,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  console.log(`[item request Items]`);
  console.log(items);

  return c.json({ items });
});

// Get single item by id — used by the detail screen
itemsRouter.get("/:id", async (c) => {
  const { id } = c.req.param();
  const item = await db.item.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json({ item });
});

// Delete item
itemsRouter.delete("/:id", async (c) => {
  const { id } = c.req.param();
  // await storageService.delete(item.imageKey);
  await db.item.delete({ where: { id } });
  return c.json({ ok: true });
});
