import { Hono } from "hono";
import { db } from "@repo/db";
import { aiService } from "@repo/ai";
import { env } from "@repo/env/server";

export const outfitsRouter = new Hono();

// const openai = new OpenAI({ apiKey: env.AI_API_KEY! });

// ─── Types ────────────────────────────────────────────────

interface GenerateOutfitBody {
  userId: string;
  occasion?: string; // "casual" | "work" | "formal" | "sport" | undefined
  weather?: string; // "hot" | "cold" | "mild" | undefined
}

// ─── Generate outfit with AI ──────────────────────────────
outfitsRouter.post("/generate", async (c) => {
  const { userId, occasion, weather } = await c.req.json<GenerateOutfitBody>();

  // Fetch all user items with category and color info
  const items = await db.item.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  if (items.length < 2) {
    return c.json({ error: "Add at least 2 items to generate an outfit" }, 400);
  }

  // Build a compact item list for the prompt — no images needed here,
  // just the text metadata the AI uses to reason about combinations
  const itemList = items
    .map(
      (item) =>
        `- id:${item.id} | ${item.category.name} | ${item.name} | color: ${item.colorDesc}`,
    )
    .join("\n");

  // ─── AI guard ─────────────────────────────────────────────
  if (env.AI_ENABLED !== "true") {
    const shuffled = items.sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.min(3, items.length));
    return c.json({
      ok: true,
      outfit: {
        itemIds: picked.map((i) => i.id),
        outfitName: "Mock Outfit",
        reason: "AI is disabled — random items selected for testing.",
        styleNote: "Enable AI_ENABLED=true to get real suggestions.",
        items: picked,
      },
    });
  }

  // Build context string based on optional filters
  const contextParts: string[] = [];
  if (occasion) contextParts.push(`occasion: ${occasion}`);
  if (weather) contextParts.push(`weather: ${weather}`);
  const context = contextParts.length
    ? `Context: ${contextParts.join(", ")}.`
    : "Context: everyday casual outfit.";

  const prompt = `You are a personal stylist AI. The user has these clothing items in their wardrobe:

${itemList}

${context}

Create a well-coordinated outfit using items from the list above.
Rules:
- Choose 2 to 4 items that work well together
- Prioritize color harmony and style coherence
- Only use item IDs from the list above
- Never invent items that are not in the list
- Don't combine two items of the same category

Respond ONLY with valid JSON, no extra text:
{
  "itemIds": ["id1", "id2", "id3"],
  "outfitName": "short catchy name for this outfit (max 4 words)",
  "reason": "one sentence explaining why these items work together",
  "styleNote": "one practical tip on how to wear this outfit"
}`;

  console.log("AI Prompt:", prompt);

  const { description: raw } = await aiService.analyzeText(prompt);

  // Extract JSON object — handles reasoning_content leaking in, stray text, and markdown fences
  const match = raw.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);

  if (!match) return c.json({ error: "AI response could not be parsed" }, 500);

  let parsed: {
    itemIds: string[];
    outfitName: string;
    reason: string;
    styleNote: string;
  };

  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return c.json({ error: "AI response could not be parsed" }, 500);
  }

  // Validate that all returned IDs actually exist in the user's wardrobe
  const validIds = new Set(items.map((i) => i.id));
  const safeItemIds = parsed.itemIds.filter((id) => validIds.has(id));

  // Fetch full item data for the selected pieces
  const selectedItems = await db.item.findMany({
    where: { id: { in: safeItemIds } },
    include: { category: true },
  });

  return c.json({
    ok: true,
    outfit: {
      itemIds: safeItemIds,
      outfitName: parsed.outfitName,
      reason: parsed.reason,
      styleNote: parsed.styleNote,
      items: selectedItems,
    },
  });
});

// ─── Save a generated outfit ──────────────────────────────
outfitsRouter.post("/save", async (c) => {
  const { userId, itemIds, outfitName, occasion } = await c.req.json<{
    userId: string;
    itemIds: string[];
    outfitName: string;
    occasion?: string;
  }>();

  const outfit = await db.outfit.create({
    data: {
      name: outfitName,
      occasion: occasion ?? null,
      aiGenerated: true,
      userId,
      items: {
        create: itemIds.map((itemId) => ({ itemId })),
      },
    },
    include: {
      items: { include: { item: { include: { category: true } } } },
    },
  });

  return c.json({ ok: true, outfit });
});

// ─── Get all saved outfits for a user ─────────────────────
outfitsRouter.get("/user/:userId", async (c) => {
  const { userId } = c.req.param();

  const outfits = await db.outfit.findMany({
    where: { userId },
    include: {
      items: {
        include: { item: { include: { category: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ outfits });
});

// ─── Delete a saved outfit ────────────────────────────────
outfitsRouter.delete("/:id", async (c) => {
  const { id } = c.req.param();
  await db.outfit.delete({ where: { id } });
  return c.json({ ok: true });
});
