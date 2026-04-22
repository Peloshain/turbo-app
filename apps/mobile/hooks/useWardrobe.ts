import { env } from "@repo/env/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client";

const API_URL = env.EXPO_PUBLIC_SERVER_URL;

// Temporary hardcoded user — replace with real auth later
const TEMP_USER_ID = "E1THse2CuoGR5kiUpPKL4XRSKTFZgvBJ";

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
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;
  console.log("fetchItems - userId:", userId);
  if (!userId) {
    throw new Error("User must be signed in to view wardrobe");
  }

  const params = categorySlug ? `?categorySlug=${categorySlug}` : "";
  console.log(`[fetchItems]: ${userId} ${params}`);

  console.log(`[API URL]: ${API_URL}`);

  return fetch(`${API_URL}/items/user/${userId}${params}`)
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
