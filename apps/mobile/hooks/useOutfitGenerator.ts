import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { env } from "@repo/env/native";

const API_URL = env.EXPO_PUBLIC_SERVER_URL;
const TEMP_USER_ID = "7a761c35-bc8f-4743-a36a-9b0500906504";

export type Occasion = "casual" | "work" | "formal" | "sport";
export type Weather = "hot" | "mild" | "cold";

export interface GeneratedOutfitItem {
  id: string;
  name: string;
  imageUrl: string;
  colorDesc: string;
  colorHex: string | null;
  category: { id: string; name: string; icon: string; slug: string };
}

export interface GeneratedOutfit {
  itemIds: string[];
  outfitName: string;
  reason: string;
  styleNote: string;
  items: GeneratedOutfitItem[];
}

export function useOutfitGenerator() {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<GeneratedOutfit | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  // ── Generate
  const generate = useMutation({
    mutationFn: async ({
      occasion,
      weather,
    }: {
      occasion?: Occasion;
      weather?: Weather;
    }) => {
      const res = await fetch(`${API_URL}/outfits/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: TEMP_USER_ID, occasion, weather }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      return data.outfit as GeneratedOutfit;
    },
    onSuccess: (outfit) => {
      setResult(outfit);
      setSavedId(null); // Reset saved state when a new outfit is generated
    },
  });

  // ── Save
  const save = useMutation({
    mutationFn: async (outfit: GeneratedOutfit & { occasion?: Occasion }) => {
      const res = await fetch(`${API_URL}/outfits/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: TEMP_USER_ID,
          itemIds: outfit.itemIds,
          outfitName: outfit.outfitName,
          occasion: outfit.occasion,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error("Failed to save outfit");
      return data.outfit;
    },
    onSuccess: (saved) => {
      setSavedId(saved.id);
      // Refresh saved outfits tab
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
    },
  });

  function reset() {
    setResult(null);
    setSavedId(null);
  }

  return {
    result,
    savedId,
    isGenerating: generate.isPending,
    isSaving: save.isPending,
    error: generate.error?.message,
    generate: generate.mutate,
    save: save.mutate,
    reset,
  };
}
