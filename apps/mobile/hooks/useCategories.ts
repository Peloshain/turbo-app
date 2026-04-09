import { env } from "@repo/env/native";
import { useQuery } from "@tanstack/react-query";

const API_URL = env.EXPO_PUBLIC_SERVER_URL;

//move to models src
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () =>
      fetch(`${API_URL}/categories`)
        .then((r) => r.json())
        .then((d) => d.categories),
    // Categories rarely change — cache for the whole session
    staleTime: Infinity,
  });
}
