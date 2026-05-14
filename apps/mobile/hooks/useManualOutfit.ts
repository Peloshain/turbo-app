import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { env } from "@repo/env/native";
import { authClient } from "../lib/auth-client";
import type { GeneratedOutfitItem, Occasion } from "./useOutfitGenerator";

const API_URL = env.EXPO_PUBLIC_SERVER_URL;

export function useManualOutfit() {
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [outfitName, setOutfitName] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reuse the profile-items cache key so we don't refetch if already loaded
  const itemsQuery = useQuery<GeneratedOutfitItem[]>({
    queryKey: ["profile-items", userId],
    queryFn: () =>
      fetch(`${API_URL}/items/user/${userId}`)
        .then((r) => r.json())
        .then((d) => d.items ?? []),
    enabled: !!userId,
    staleTime: 0,
  });

  function toggleItem(id: string) {
    setValidationError(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);

      // Deselect — always allowed
      if (next.has(id)) {
        next.delete(id);
        return next;
      }

      // Cap at 10 items
      if (next.size >= 10) {
        setValidationError("You can only add up to 10 items.");
        return prev;
      }

      // One item per category
      const incoming = itemsQuery.data?.find((i) => i.id === id);
      const alreadySelected =
        itemsQuery.data?.filter((i) => next.has(i.id)) ?? [];
      const categoryTaken = alreadySelected.some(
        (i) => i.category?.slug === incoming?.category?.slug,
      );
      if (categoryTaken) {
        setValidationError(
          `You already have a ${incoming?.category?.name ?? "item from this category"} selected.`,
        );
        return prev;
      }

      next.add(id);
      return next;
    });
  }

  const selectedItems =
    itemsQuery.data?.filter((i) => selectedIds.has(i.id)) ?? [];

  const save = useMutation({
    mutationFn: async ({ occasion }: { occasion?: Occasion }) => {
      const res = await fetch(`${API_URL}/outfits/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          itemIds: Array.from(selectedIds),
          outfitName: outfitName.trim() || "My Outfit",
          occasion,
          aiGenerated: false,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error("Failed to save outfit");
      return data.outfit;
    },
    onSuccess: (saved) => {
      setSavedId(saved.id);
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
    },
  });

  function reset() {
    setSelectedIds(new Set());
    setOutfitName("");
    setSavedId(null);
    setValidationError(null);
    save.reset();
  }

  type ItemStatus =
    | "selected"
    | "blocked-category"
    | "blocked-limit"
    | "available";

  function getItemStatus(id: string): ItemStatus {
    if (selectedIds.has(id)) return "selected";
    if (selectedIds.size >= 10) return "blocked-limit";
    const item = itemsQuery.data?.find((i) => i.id === id);
    const alreadySelected =
      itemsQuery.data?.filter((i) => selectedIds.has(i.id)) ?? [];
    const categoryTaken = alreadySelected.some(
      (i) => i.category?.slug === item?.category?.slug,
    );
    if (categoryTaken) return "blocked-category";
    return "available";
  }

  return {
    items: itemsQuery.data ?? [],
    isLoadingItems: itemsQuery.isLoading,
    selectedIds,
    selectedItems,
    outfitName,
    setOutfitName,
    toggleItem,
    getItemStatus,
    validationError,
    save: save.mutate,
    isSaving: save.isPending,
    savedId,
    saveError: save.error?.message ?? null,
    reset,
  };
}
