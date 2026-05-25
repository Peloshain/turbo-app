import "dotenv/config";
import { Hono } from "hono";
import { db } from "@repo/db";

export const categoriesRouter = new Hono();

// GET /categories — all categories ordered by order asc (existing)
categoriesRouter.get("/", async (c) => {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
    });
    return c.json({ ok: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ ok: false, error: "Failed to fetch categories" }, 500);
  }
});

// POST /categories — create a new category
categoriesRouter.post("/", async (c) => {
  try {
    const { name } = await c.req.json<{ name: string }>();

    if (!name?.trim()) {
      return c.json({ ok: false, error: "Name is required" }, 400);
    }

    const trimmed = name.trim();
    const slug = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Derive order from current max
    const last = await db.category.findFirst({ orderBy: { order: "desc" } });
    const order = (last?.order ?? -1) + 1;

    const category = await db.category.create({
      data: { name: trimmed, slug, order },
    });

    return c.json({ ok: true, category });
  } catch (error: any) {
    // Unique constraint violation (name or slug already exists)
    if (error?.code === "P2002") {
      return c.json(
        { ok: false, error: "A category with this name already exists" },
        409,
      );
    }
    console.error("Error creating category:", error);
    return c.json({ ok: false, error: "Failed to create category" }, 500);
  }
});

// DELETE /categories/:id — delete a category, blocked if it has items
categoriesRouter.delete("/:id", async (c) => {
  try {
    const { id } = c.req.param();

    const category = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } },
    });

    if (!category) {
      return c.json({ ok: false, error: "Category not found" }, 404);
    }

    if (category._count.items > 0) {
      return c.json(
        {
          ok: false,
          blocked: true,
          error: `Cannot delete "${category.name}" — it has ${category._count.items} item${category._count.items !== 1 ? "s" : ""}. Remove the items first.`,
        },
        409,
      );
    }

    await db.category.delete({ where: { id } });

    return c.json({ ok: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return c.json({ ok: false, error: "Failed to delete category" }, 500);
  }
});
