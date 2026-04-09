import { env } from "@repo/env/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = env.EXPO_PUBLIC_SERVER_URL;

// Temporary hardcoded user — replace with real auth later
const TEMP_USER_ID = "7a761c35-bc8f-4743-a36a-9b0500906504";

//Move to models src
export interface WardrobeItem {
  id: string;
  name: string;
  imageUrl: string;
  colorDesc: string;
  colorHex: string | null;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string;
  };
}

// Fetch all items for the current user, optionally filtered by category
function fetchItems(categorySlug?: string): Promise<WardrobeItem[]> {
  const params = categorySlug ? `?categorySlug=${categorySlug}` : "";
  console.log(`[fetchItems]: ${TEMP_USER_ID} ${params}`);

  console.log(`[API URL]: ${API_URL}`);

  return fetch(`${API_URL}/items/user/${TEMP_USER_ID}${params}`)
    .then((r) => r.json())
    .then((d) => d.items);
}

export function useWardrobeItems(categorySlug?: string) {
  return useQuery({
    queryKey: ["wardrobe", categorySlug],
    queryFn: () => fetchItems(categorySlug),
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      fetch(`${API_URL}/items/${itemId}`, { method: "DELETE" }),
    // Invalidate all wardrobe queries so the grid refreshes after delete
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wardrobe"] }),
  });
}
