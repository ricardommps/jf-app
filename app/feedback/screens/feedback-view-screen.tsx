import Comments from "@/app/(tabs)/(history)/components/comments";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import TreadmillIcon from "@/components/ui/treadmill-icon";
import { VStack } from "@/components/ui/vstack";
import useANotifications from "@/hooks/useNotification";
import { getComments } from "@/services/comment.service";
import { CommentItem } from "@/types/commnets.type";
import { FinishedHistory } from "@/types/finished";
import { moduleName } from "@/utils/module-name";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircleIcon } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

interface Props {
  finishedItem: FinishedHistory;
  id: number;
}

const getLastWorkoutInfo = (executionDay: string) => {
  if (!executionDay) return null;

  try {
    const isoFormatted = executionDay.replace(" ", "T");
    const parsedDate = parseISO(isoFormatted);
    const day = format(parsedDate, "dd");
    const monthYear = format(parsedDate, "MMMM", { locale: ptBR });

    if (day && monthYear) return { day, monthYear };
    return null;
  } catch {
    return null;
  }
};

export default function FeedbackViewScreen({ finishedItem, id }: Props) {
  const { onReadAt } = useANotifications();

  const [openComments, setOpenComments] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const feedback =
    typeof finishedItem?.feedback === "string" ? finishedItem.feedback : null;

  const lastWorkoutInfo = getLastWorkoutInfo(finishedItem.executionDay);

  /**
   * 🔥 Função igual ao HistoryModal
   */
  const reloadComments = async () => {
    setLoadingComments(true);

    try {
      const response = await getComments(finishedItem.id);

      // 🔒 blindagem absoluta
      const safeComments = Array.isArray(response) ? response : [];

      setComments(safeComments);

      return safeComments;
    } catch {
      setComments([]);
      return [];
    } finally {
      setLoadingComments(false);
    }
  };

  /**
   * 🔥 Quando abrir comentários, já busca atualizado
   */
  const handleOpenComments = async () => {
    onReadAt(id);
    setOpenComments(true);
    await reloadComments();
  };
  /**
   * 🔥 Quando fechar, refaz também
   */
  const handleCloseComments = async () => {
    await reloadComments();
    setOpenComments(false);
  };

  const hasUnreadFromUser = comments.some((c) => c.isAdmin && !c.read);

  const renderIconType = () => {
    if (finishedItem?.outdoor) {
      return <MaterialCommunityIcons name="road" size={25} color="white" />;
    }
    return <TreadmillIcon size={25} color="#fff" strokeWidth={2.5} />;
  };

  return (
    <View className="container px-7 bg-black h-full">
      <Box className="bg-[#2b2b2b9d] rounded-xl p-4 mb-2 min-h-[100px]">
        <HStack
          className="w-full mb-4"
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <VStack style={{ flex: 1 }}>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              className="text-base font-semibold"
            >
              {moduleName(finishedItem.trainingName) || ""}
            </Text>

            <Text className="text-base">
              {finishedItem.trainingSubtitle || ""}
            </Text>

            {feedback ? (
              <HStack className="gap-6 pt-3 flex-wrap">
                <Pressable onPress={handleOpenComments}>
                  <Box className="relative">
                    <Icon
                      as={MessageCircleIcon}
                      className="text-typography-700"
                      size="xl"
                    />

                    {loadingComments ? (
                      <Box className="absolute -right-1 -top-1">
                        <ActivityIndicator size={12} color="#fff" />
                      </Box>
                    ) : comments.length > 0 ? (
                      <Box
                        className={`absolute -right-1 -top-1 rounded-full w-5 h-5 items-center justify-center ${
                          hasUnreadFromUser ? "bg-orange-500" : "bg-success-500"
                        }`}
                      >
                        <Text className="text-white text-xs font-bold">
                          {comments.length}
                        </Text>
                      </Box>
                    ) : null}
                  </Box>
                </Pressable>
              </HStack>
            ) : (
              <Text className="pt-5 text-[#e96b10]">Aguardando feedback</Text>
            )}
          </VStack>

          {lastWorkoutInfo?.day && lastWorkoutInfo?.monthYear && (
            <VStack
              className="items-center justify-center"
              style={{ minWidth: 100 }}
            >
              <Text className="text-center text-sm">Realizado em</Text>
              <Text className="text-typography-900 text-sm text-center capitalize">
                {lastWorkoutInfo.monthYear}
              </Text>
              <Text className="text-typography-900 text-xl font-bold text-center">
                {lastWorkoutInfo.day}
              </Text>
            </VStack>
          )}
        </HStack>
      </Box>

      <Comments
        open={openComments}
        onClose={handleCloseComments}
        finishedId={finishedItem.id}
        onCommentSent={reloadComments}
        content={{
          comments, // 👈 agora sempre array
          executionDay: finishedItem.executionDay || "",
          updatedAt: finishedItem.updatedAt || "",
        }}
      />
    </View>
  );
}
