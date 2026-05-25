// import { env } from "@repo/env/native";
// import { useQuery } from "@tanstack/react-query";

// const API_URL = env.EXPO_PUBLIC_SERVER_URL;

// //move to models src
// export interface Category {
//   id: string;
//   name: string;
//   slug: string;
//   icon: string;
// }

// export function useCategories() {
//   return useQuery<Category[]>({
//     queryKey: ["categories"],
//     queryFn: () =>
//       fetch(`${API_URL}/categories`)
//         .then((r) => r.json())
//         .then((d) => d.categories),
//     // Categories rarely change — cache for the whole session
//     staleTime: Infinity,
//   });
// }

import { env } from "@repo/env/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = env.EXPO_PUBLIC_SERVER_URL;

// move to models src
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export function useCategories() {
  const queryClient = useQueryClient();

  const query = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () =>
      fetch(`${API_URL}/categories`)
        .then((r) => r.json())
        .then((d) => d.categories),
    // Categories rarely change — cache for the whole session
    // Invalidated explicitly after add/delete
    staleTime: Infinity,
  });

  const add = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed to create category");
      return data.category as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed to delete category");
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["profile-items"] });
    },
  });

  return {
    ...query, // exposes data, isLoading, error, refetch, etc. as-is
    categories: query.data ?? [],
    add: add.mutate,
    isAdding: add.isPending,
    addError: add.error?.message ?? null,
    resetAddError: add.reset,
    remove: remove.mutate,
    isRemoving: remove.isPending,
    removeError: remove.error?.message ?? null,
    resetRemoveError: remove.reset,
  };
}
