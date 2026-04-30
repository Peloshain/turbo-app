import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { itemsRouter } from "./routes/items";
import { categoriesRouter } from "./routes/categories";
import { storageService } from "@repo/storage";
import { createContext } from "@repo/api/context";
import { outfitsRouter } from "./routes/outfits";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { env } from "@repo/env/server";
import { auth } from "@repo/auth";
import { appRouter } from "@repo/api/routers/index";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export const apiHandler = new OpenAPIHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  console.log("HERE");

  const context = await createContext({ context: c });
  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.use("/uploads/*", serveStatic({ root: "./" }));

app.put("/uploads/*", async (c) => {
  console.log("[upload] received request");
  console.log("[upload] path:", c.req.path);
  console.log("[upload] provider:", env.STORAGE_PROVIDER);

  if (env.STORAGE_PROVIDER !== "local") {
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
app.route("/outfits", outfitsRouter);

// Health check
app.get("/", (c) => c.json({ status: "ok" }));

export default app;
