import { useCallback, useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import { env } from "@repo/env/native";
import { useQueries } from "@tanstack/react-query";

const API_URL = env.EXPO_PUBLIC_SERVER_URL;

type Category = { id: string; name: string; slug: string };
type Item = { id: string; category: Category };
export type StatRow = { label: string; count: number };

export function useProfile() {
  const { data: session, refetch: refetchSession } = authClient.useSession();
  const user = session?.user;

  const [aiToggleLoading, setAiToggleLoading] = useState(false);

  const [itemsQuery, categoriesQuery] = useQueries({
    queries: [
      {
        queryKey: ["profile-items", user?.id],
        queryFn: () =>
          fetch(`${API_URL}/items/user/${user!.id}`)
            .then((r) => r.json())
            .then((d) => d.items ?? []),
        enabled: !!user?.id,
        staleTime: 0,
      },
      {
        queryKey: ["categories"],
        queryFn: () =>
          fetch(`${API_URL}/categories`)
            .then((r) => r.json())
            .then((d) => d.categories ?? []),
        enabled: !!user?.id,
        staleTime: 0,
      },
    ],
  });

  const items: Item[] = itemsQuery.data ?? [];
  const categories: Category[] = categoriesQuery.data ?? [];

  const stats: StatRow[] = categories
    .map((cat) => ({
      label: cat.name,
      count: items.filter((i) => i.category?.slug === cat.slug).length,
    }))
    .filter((s) => s.count > 0);

  const refetch = useCallback(() => {
    itemsQuery.refetch();
    categoriesQuery.refetch();
  }, [itemsQuery.refetch, categoriesQuery.refetch]);

  // aiHelperEnabled falls back to true for existing users without the field
  const aiHelperEnabled = (user as any)?.aiHelperEnabled ?? true;

  async function toggleAiHelper() {
    setAiToggleLoading(true);
    try {
      const { error } = await authClient.updateUser({
        // @ts-expect-error — additionalFields not typed by default; see packages/auth/src/types.ts
        aiHelperEnabled: !aiHelperEnabled,
      });
      if (!error) await refetchSession();
    } finally {
      setAiToggleLoading(false);
    }
  }

  return {
    user,
    items,
    stats,
    loading: itemsQuery.isLoading || categoriesQuery.isLoading,
    error:
      itemsQuery.isError || categoriesQuery.isError
        ? "Failed to load stats."
        : null,
    refetch,
    aiHelperEnabled,
    aiToggleLoading,
    toggleAiHelper,
  };
}
