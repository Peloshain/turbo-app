import { useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import { env } from "@repo/env/native";

const API_URL = env.EXPO_PUBLIC_SERVER_URL;

type Category = { id: string; name: string; slug: string };
type Item = { id: string; category: Category };
export type StatRow = { label: string; count: number };

export function useProfile() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [itemsRes, catsRes] = await Promise.all([
          fetch(`${API_URL}/items/user/${user!.id}`).then((r) => r.json()),
          fetch(`${API_URL}/categories`).then((r) => r.json()),
        ]);
        setItems(itemsRes.items ?? []);
        setCategories(catsRes.categories ?? []);
      } catch (e: any) {
        setError("Failed to load stats.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user?.id]);

  const stats: StatRow[] = categories
    .map((cat) => ({
      label: cat.name,
      count: items.filter((i) => i.category?.slug === cat.slug).length,
    }))
    .filter((s) => s.count > 0);

  return { user, items, stats, loading, error };
}
