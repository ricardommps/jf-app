import { getFinishedHistory } from "@/services/finished.service";
import { useQuery } from "@tanstack/react-query";

export function useFinishedHistory(
  id?: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["finishedHistory", id],
    queryFn: () => getFinishedHistory(id!),
    enabled: !!id && (options?.enabled ?? true),
  });
}
