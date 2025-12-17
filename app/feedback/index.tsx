import Header from "@/components/header";
import Loading from "@/components/shared/loading";
import { getFinishedById } from "@/services/finished.service";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import FeedbackViewScreen from "./screens/feedback-view-screen";

export default function FeedbackView() {
  const { feedbackId, notificationId } = useLocalSearchParams();
  const feedbackIdStr = feedbackId ?? "";
  const notificationIdStr = notificationId ?? "";
  const { data: finishedItem, isLoading } = useQuery({
    queryKey: ["finished", feedbackIdStr],
    queryFn: async () => await getFinishedById(feedbackIdStr as string),
    staleTime: 0,
    gcTime: 0,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!feedbackIdStr,
  });

  return (
    <View className="flex-1 bg-black">
      <Header title="Detalhes do treino" />
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {finishedItem?.length > 0 && (
            <FeedbackViewScreen
              finishedItem={finishedItem[0]}
              id={Number(notificationIdStr)}
            />
          )}
        </>
      )}
    </View>
  );
}
