import { useSession } from "@/contexts/Authentication";
import { getMyLessonPackages } from "@/services/lesson-packages.service";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export function useMyLessonPackages() {
  const { session, isLoading: isSessionLoading } = useSession();
  const customerId = session?.user.id;
  const query = useQuery({
    queryKey: ["my-lesson-packages", customerId ?? null],
    queryFn: getMyLessonPackages,
    enabled: !!customerId,
    staleTime: 30_000,
    retry: 1,
  });
  const { refetch } = query;

  useFocusEffect(
    useCallback(() => {
      if (customerId) void refetch();
    }, [customerId, refetch]),
  );

  return { ...query, isAuthenticated: !!customerId, isSessionLoading };
}
