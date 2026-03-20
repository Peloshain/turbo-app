import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { itemsRouter } from "./routes/items";
import { categoriesRouter } from "./routes/categories";
import { storageService } from "@repo/storage";

const app = new Hono();

app.use("*", cors());
app.use("/uploads/*", serveStatic({ root: "./" }));

app.put("/uploads/*", async (c) => {
  console.log("[upload] path:", c.req.path);
  console.log("[upload] provider:", process.env.STORAGE_PROVIDER);

  if (process.env.STORAGE_PROVIDER !== "local") {
    return c.json({ error: "Not available" }, 404);
  }

  const key = c.req.path.replace("/uploads/", "");
  console.log("[upload] key:", key);

  const body = await c.req.arrayBuffer();
  console.log("[upload] body size:", body.byteLength);

  await storageService.upload({
    key,
    body: Buffer.from(body),
    mimeType: c.req.header("Content-Type") ?? "image/jpeg",
  });

  console.log("[upload] done");
  return c.body(null, 200);
});

app.route("/items", itemsRouter);
app.route("/categories", categoriesRouter);

// Health check
app.get("/", (c) => c.json({ status: "ok" }));

export default app;
