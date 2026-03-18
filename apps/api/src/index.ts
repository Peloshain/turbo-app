import { Hono } from "hono";
import { cors } from "hono/cors";
// import { generateText } from "@repo/ai";
// import { getUploadUrl, getPublicUrl } from "@repo/storage";
// import { itemsRouter } from "./routes/items";
import { categoriesRouter } from "./routes/categories";

const app = new Hono();

app.use("*", cors());

// app.route("/items", itemsRouter);
app.route("/categories", categoriesRouter);

// Health check
app.get("/", (c) => c.json({ status: "ok" }));

// // Get upload URL for storage
// app.post("/storage/upload-url", async (c) => {
//   const { key, contentType } = await c.req.json();
//   const url = await getUploadUrl(key, contentType);
//   return c.json({ url, publicUrl: getPublicUrl(key) });
// });

// // AI generation
// app.post("/ai/generate", async (c) => {
//   const { prompt } = await c.req.json();
//   const text = await generateText(
//     {
//       provider: (process.env.AI_PROVIDER as any) ?? "openai",
//       apiKey: process.env.AI_API_KEY!,
//     },
//     prompt,
//   );
//   return c.json({ text });
// });

export default app;
