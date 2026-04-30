import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { env } from "@repo/env/native";
import { authClient } from "../lib/auth-client";

const API_URL = env.EXPO_PUBLIC_SERVER_URL;

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
  const controllerRef = useRef<AbortController | null>(null);

  const { data: session } = authClient.useSession();
  const userId = session?.user.id;

  const queryClient = useQueryClient();
  const [result, setResult] = useState<GeneratedOutfit | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const generate = useMutation({
    mutationFn: async ({
      occasion,
      weather,
    }: {
      occasion?: Occasion;
      weather?: Weather;
    }) => {
      // Create a fresh controller per invocation, not per render
      controllerRef.current = new AbortController();

      const res = await fetch(`${API_URL}/outfits/generate`, {
        method: "POST",
        signal: controllerRef.current.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, occasion, weather }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      return data.outfit as GeneratedOutfit;
    },
    onSuccess: (outfit) => {
      setResult(outfit);
      setSavedId(null);
    },
    // Swallow AbortErrors so they don't surface as real errors
    onError: (error) => {
      if (error.name === "AbortError") return;
    },
  });

  const save = useMutation({
    mutationFn: async (outfit: GeneratedOutfit & { occasion?: Occasion }) => {
      const res = await fetch(`${API_URL}/outfits/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
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
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
    },
  });

  function cancelAnalysis() {
    controllerRef.current?.abort();
    generate.reset(); // ← clears isPending so isGenerating goes false
  }

  function reset() {
    setResult(null);
    setSavedId(null);
    generate.reset();
    controllerRef.current = null;
  }

  return {
    result,
    savedId,
    isGenerating: generate.isPending,
    isSaving: save.isPending,
    error:
      generate.error?.name === "AbortError" ? null : generate.error?.message,
    generate: generate.mutate,
    save: save.mutate,
    reset,
    cancelAnalysis,
  };
}
