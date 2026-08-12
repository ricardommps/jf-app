import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { FinishedHistory } from "@/types/finished";
import { convertSecondsToHourMinuteFormat } from "@/utils/convertValues";
import { Clock10Icon, MessageCircleIcon } from "lucide-react-native";
import { RpeDisplay } from "../rpe-display";
import { Divider } from "../ui/divider";

interface Props {
  item: FinishedHistory;
  setSelectedItem: (item: FinishedHistory) => void;
  onOpenDetails: (item: FinishedHistory) => void;
  day: string;
  month: string;
}

export const HistoryGymItem = ({
  item,
  setSelectedItem,
  onOpenDetails,
  day,
  month,
}: Props) => {
  const feedback = typeof item?.feedback === "string" ? item.feedback : null;

  const cardContent = (
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

          {item.unrealized ? (
            <HStack className="gap-6 pt-2 flex-wrap">
              <Pressable hitSlop={10} onPress={() => setSelectedItem(item)}>
                <Box className="relative">
                  <Icon
                    as={MessageCircleIcon}
                    className="text-typography-700"
                    size="xl"
                  />

                  {item.comments?.length ? (
                    <Box className="absolute -right-1 -top-1 bg-success-500 rounded-full w-5 h-5 items-center justify-center">
                      <Text className="text-white text-xs font-bold">
                        {item.comments.length}
                      </Text>
                    </Box>
                  ) : null}
                </Box>
              </Pressable>
            </HStack>
          ) : !feedback ? (
            <Text className="pt-5 text-[#e96b10]">Aguardando feedback</Text>
          ) : null}
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

      <HStack className="items-start pt-2 pl-3 gap-5">
        {item?.durationInSeconds ? (
          <>
            <VStack className="items-center">
              <Icon
                as={Clock10Icon}
                size="xl"
                className="text-background-700"
              />
              <Text className="text-xs mt-1">Tempo</Text>
              <Text className="text-xs">
                {convertSecondsToHourMinuteFormat(item.durationInSeconds || 0)}
              </Text>
            </VStack>

            <Divider orientation="vertical" className="h-12" />
          </>
        ) : null}

        <VStack className="items-center">
          <RpeDisplay rpe={item.rpe || 0} />
        </VStack>
      </HStack>
    </Box>
  );

  if (item.unrealized) {
    return cardContent;
  }

  return <Pressable onPress={() => onOpenDetails(item)}>{cardContent}</Pressable>;
};
