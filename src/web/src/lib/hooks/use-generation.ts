"use client";

import { useQuery } from "@tanstack/react-query";
import type { GenerationStatusResponse } from "@/types/api";

async function fetchGenerationStatus(id: string): Promise<GenerationStatusResponse> {
  const res = await fetch(`/api/generate/${id}`);
  if (!res.ok) throw new Error("Failed to fetch generation status");
  return res.json();
}

export function useGenerationStatus(generationId: string | null) {
  return useQuery({
    queryKey: ["generation", generationId],
    queryFn: () => fetchGenerationStatus(generationId!),
    enabled: !!generationId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "failed" ? false : 3000;
    },
  });
}
