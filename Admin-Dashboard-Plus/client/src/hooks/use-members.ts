import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

// We only have a lookup mutation for members
export function useMemberLookup() {
  return useMutation({
    mutationFn: async (mobile: string) => {
      // Validate input manually before sending if needed, but schema does it
      const res = await fetch(api.members.lookup.path, {
        method: api.members.lookup.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400 || res.status === 500) {
           const errorData = await res.json();
           throw new Error(errorData.message || "Failed to lookup member");
        }
        throw new Error("Network response was not ok");
      }

      // Parse response with Zod schema
      return api.members.lookup.responses[200].parse(await res.json());
    },
  });
}
