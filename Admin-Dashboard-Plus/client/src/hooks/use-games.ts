import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertGame } from "@shared/routes";

export function useGames(filters?: { search?: string; category?: string }) {
  // Construct query string manually or use URLSearchParams
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.category) queryParams.set("category", filters.category);
  const queryString = queryParams.toString();
  const path = `${api.games.list.path}${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: [api.games.list.path, filters],
    queryFn: async () => {
      const res = await fetch(path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch games");
      return api.games.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertGame) => {
      const res = await fetch(api.games.create.path, {
        method: api.games.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create game");
      return api.games.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.games.list.path] });
    },
  });
}
