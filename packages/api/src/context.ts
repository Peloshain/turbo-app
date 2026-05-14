import { auth } from "@repo/auth";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  console.log("Creating context for request:", context.req.raw.url);
  try {
    const session = await auth.api.getSession({
      headers: context.req.raw.headers,
    });
    return {
      auth: null,
      session,
    };
  } catch (error) {
    console.error("Error during context creation:", error);
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>;
