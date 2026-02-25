import { getComments } from "@/services/comment.service";
import { useQuery } from "@tanstack/react-query";

export function useCommentsQuery(finishedId?: number, enabled = true) {
  return useQuery({
    queryKey: ["comments", finishedId],
    queryFn: () => getComments(finishedId!),
    enabled: !!finishedId && enabled,
  });
}
