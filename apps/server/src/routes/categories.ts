import "dotenv/config";
import { Hono } from "hono";
import { db } from "@repo/db";

export const categoriesRouter = new Hono();

// Return all categories ordered by display order
categoriesRouter.get("/", async (c) => {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
    });
    return c.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ ok: false, error: "Failed to fetch categories" }, 500);
  }
});
