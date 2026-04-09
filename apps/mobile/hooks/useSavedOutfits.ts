import { env } from "@repo/env/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = env.EXPO_PUBLIC_SERVER_URL;
const TEMP_USER_ID = "7a761c35-bc8f-4743-a36a-9b0500906504";

export interface SavedOutfitItem {
  id: string;
  item: {
    id: string;
    name: string;
    imageUrl: string;
    colorHex: string | null;
    colorDesc: string;
    category: { id: string; name: string; icon: string; slug: string };
  };
}

export interface SavedOutfit {
  id: string;
  name: string | null;
  occasion: string | null;
  aiGenerated: boolean;
  createdAt: string;
  items: SavedOutfitItem[];
}

// Fetch all saved outfits for the current user
export function useSavedOutfits() {
  return useQuery<SavedOutfit[]>({
    queryKey: ["outfits"],
    queryFn: () =>
      fetch(`${API_URL}/outfits/user/${TEMP_USER_ID}`)
        .then((r) => r.json())
        .then((d) => d.outfits),
  });
}

// Delete a saved outfit and refresh the list
export function useDeleteOutfit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (outfitId: string) =>
      fetch(`${API_URL}/outfits/${outfitId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outfits"] }),
  });
}
