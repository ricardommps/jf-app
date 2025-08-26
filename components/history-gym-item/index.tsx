import { FinishedHistory } from "@/types/finished";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Pressable } from "@/components/ui/pressable";
import { Icon } from "@/components/ui/icon";
import { MessageCircleIcon } from "lucide-react-native";

interface Props {
  item: FinishedHistory;
  setComments: (comments: {
    feedback: string;
    comments: string;
    executionDay: string;
    updatedAt: string;
  }) => void;
  day: string;
  month: string;
}

export const HistoryGymItem = ({ item, setComments, day, month }: Props) => {
  const feedback = typeof item?.feedback === "string" ? item.feedback : null;
  return (
    <Box className="bg-[#2b2b2b9d] rounded-xl p-4 mb-2 min-h-[100px]">
      <HStack
        className="w-full"
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
            className="text-typography-900 text-base font-semibold"
          >
            {item?.trainingSubtitle || ""}
          </Text>

          {feedback ? (
            <HStack className="gap-6 pt-2 flex-wrap">
              <Pressable
                hitSlop={10}
                onPress={() =>
                  setComments({
                    feedback: item.feedback || "",
                    comments: item.comments || "",
                    executionDay: item.executionDay || "",
                    updatedAt: item.updatedAt || "",
                  })
                }
              >
                <Box className="relative">
                  <Icon
                    as={MessageCircleIcon}
                    className="text-typography-700"
                    size="xl"
                  />
                  <Box className="absolute -right-1 -top-1 bg-success-500 rounded-full w-5 h-5 items-center justify-center">
                    <Text className="text-white text-xs font-bold">1</Text>
                  </Box>
                </Box>
              </Pressable>
            </HStack>
          ) : (
            <Text className="pt-5 text-[#e96b10]">Aguardando feedback</Text>
          )}
        </VStack>

        {day && month && (
          <VStack
            className="items-center justify-center"
            style={{ minWidth: 100 }}
          >
            <Text className="text-center text-sm">Realizado em</Text>
            <Text className="text-typography-900 text-sm text-center capitalize">
              {month}
            </Text>
            <Text className="text-typography-900 text-xl font-bold text-center">
              {day}
            </Text>
          </VStack>
        )}
      </HStack>
    </Box>
  );
};
