import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { VStack } from "@/components/ui/vstack";
import FeedbackViewScreen from "./screens/feedback-view-screen";
import HeaderNavigation from "@/components/shared/header-navigation";
import { useQuery } from "@tanstack/react-query";
import { getFinishedById } from "@/services/finished.service";
import Loading from "@/components/shared/loading";

export default function FeedbackView() {
  const router = useRouter();
  const { link, id } = useLocalSearchParams();

  const {
    data: finishedItem,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["finished", link],
    queryFn: async () => await getFinishedById(link as string),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!link,
  });
  if (error) {
    router.push(`/error/view`);
  }
  return (
    <VStack space="md" className="flex-1 bg-background-0">
      <HeaderNavigation title="Detalhes do treino" />
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {finishedItem.length > 0 && (
            <FeedbackViewScreen
              finishedItem={finishedItem[0]}
              id={Number(id)}
            />
          )}
        </>
      )}
    </VStack>
  );
}
