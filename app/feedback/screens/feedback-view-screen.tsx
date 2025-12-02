import Comments from "@/components/comments";
import { RpeDisplay } from "@/components/rpe-display";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import TreadmillIcon from "@/components/ui/treadmill-icon";
import { VStack } from "@/components/ui/vstack";
import useANotifications from "@/hooks/useNotification";
import { FinishedHistory } from "@/types/finished";
import {
  convertMetersToKilometersFormat,
  convertPaceToSpeed,
  convertSecondsToHourMinuteFormat,
} from "@/utils/convertValues";
import { moduleName } from "@/utils/module-name";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock10Icon,
  FootprintsIcon,
  MessageCircleIcon,
  RouteIcon,
} from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

interface Props {
  finishedItem: FinishedHistory;
  id: number;
}

const getLastWorkoutInfo = (executionDay: string) => {
  if (!executionDay) {
    return null;
  }

  try {
    const isoFormatted = executionDay.replace(" ", "T"); // "2025-07-26T12:00:00.00"
    const parsedDate = parseISO(isoFormatted);
    const day = format(parsedDate, "dd");
    const monthYear = format(parsedDate, "MMMM", { locale: ptBR });

    if (day && monthYear) {
      return { day, monthYear };
    }
    return null;
  } catch (error) {
    return null;
  }
};

export default function FeedbackViewScreen({ finishedItem, id }: Props) {
  const { onReadAt } = useANotifications();
  const [openComments, setOpenComments] = useState<boolean>(false);
  const feedback =
    typeof finishedItem?.feedback === "string" ? finishedItem.feedback : null;
  const lastWorkoutInfo = getLastWorkoutInfo(finishedItem.executionDay);
  const renderIconType = () => {
    if (finishedItem?.outdoor) {
      return <MaterialCommunityIcons name="road" size={25} color="white" />;
    }
    return <TreadmillIcon size={25} color="#fff" strokeWidth={2.5} />;
  };

  const handleOpenComments = () => {
    onReadAt(id);
    setOpenComments(true);
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
          {lastWorkoutInfo?.day && lastWorkoutInfo?.monthYear && (
            <VStack
              className="items-center justify-center"
              style={{ minWidth: 100 }}
            >
              <Text className="text-center text-sm">Realizado em</Text>
              <Text className="text-typography-900 text-sm text-center capitalize">
                {lastWorkoutInfo?.monthYear}
              </Text>
              <Text className="text-typography-900 text-xl font-bold text-center">
                {lastWorkoutInfo?.day}
              </Text>
            </VStack>
          )}
          {finishedItem.type === 1 && (
            <Box className="w-full max-w-[400px] self-center">
              <HStack className="justify-around items-center pt-2">
                <VStack className="items-center">
                  <Icon
                    as={RouteIcon}
                    size="xl"
                    className="text-background-700"
                  />
                  <Text className="text-xs text-typography-700 mt-1">
                    Distância
                  </Text>
                  <Text className="text-xs text-typography-900">
                    {convertMetersToKilometersFormat(
                      finishedItem?.distanceInMeters || 0
                    )}
                  </Text>
                </VStack>

                <Divider
                  orientation="vertical"
                  className="bg-gray-300 rounded h-12"
                />

                <VStack className="items-center">
                  <Icon
                    as={FootprintsIcon}
                    size="xl"
                    className="text-background-700"
                  />
                  <Text className="text-xs text-typography-700 mt-1">
                    Pace Médio
                  </Text>
                  <Text className="text-xs text-typography-900">
                    {convertPaceToSpeed(finishedItem?.paceInSeconds || 0, true)}
                  </Text>
                </VStack>

                <Divider
                  orientation="vertical"
                  className="bg-gray-300 rounded h-12"
                />

                <VStack className="items-center">
                  <Icon
                    as={Clock10Icon}
                    size="xl"
                    className="text-background-700"
                  />
                  <Text className="text-xs text-typography-700 mt-1">
                    Tempo
                  </Text>
                  <Text className="text-xs text-typography-900">
                    {convertSecondsToHourMinuteFormat(
                      finishedItem?.durationInSeconds || 0
                    )}
                  </Text>
                </VStack>

                <Divider
                  orientation="vertical"
                  className="bg-gray-300 rounded h-12"
                />

                <VStack className="items-center">
                  <RpeDisplay rpe={finishedItem.rpe || 0} />
                </VStack>

                <Divider
                  orientation="vertical"
                  className="bg-gray-300 rounded"
                />

                <VStack className="items-center">
                  {renderIconType()}
                  <Text className="text-xs text-typography-700 mt-1">
                    {finishedItem?.outdoor ? "Outdoor" : "Indoor"}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}
        </HStack>
      </Box>
      <Comments
        open={openComments}
        onClose={() => setOpenComments(false)}
        content={{
          feedback: finishedItem.feedback || "",
          comments: finishedItem.comments || "",
          executionDay: finishedItem.executionDay || "",
          updatedAt: finishedItem.updatedAt || "",
        }}
      />
    </View>
  );
}
