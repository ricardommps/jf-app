import { HistoryGymItem } from "@/components/history-gym-item";
import { RpeDisplay } from "@/components/rpe-display";
import Loading from "@/components/shared/loading";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import TreadmillIcon from "@/components/ui/treadmill-icon";
import { VStack } from "@/components/ui/vstack";
import { history } from "@/services/finished.service";
import { FinishedHistory } from "@/types/finished";
import {
  convertMetersToKilometersFormat,
  convertPaceToSpeed,
  convertSecondsToHourMinuteFormat,
} from "@/utils/convertValues";
import { moduleName } from "@/utils/module-name";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock10Icon,
  FootprintsIcon,
  MessageCircleIcon,
  RouteIcon,
} from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, View } from "react-native";
import Comments from "./components/comments";

const renderCardGym = (
  setComments: (comments: {
    feedback: string;
    comments: string;
    executionDay: string;
    updatedAt: string;
  }) => void,
  item: FinishedHistory,
  day: string,
  month: string
) => {
  return (
    <HistoryGymItem
      item={item}
      setComments={setComments}
      day={day}
      month={month}
    />
  );
};

const renderCardRunner = (
  setComments: (comments: {
    feedback: string;
    comments: string;
    executionDay: string;
    updatedAt: string;
  }) => void,
  item: FinishedHistory,
  day: string,
  month: string
) => {
  const renderIconType = () => {
    if (item?.outdoor) {
      return <MaterialCommunityIcons name="road" size={25} color="white" />;
    }
    return <TreadmillIcon size={25} color="#fff" strokeWidth={2.5} />;
  };

  const feedback = typeof item?.feedback === "string" ? item.feedback : null;

  return (
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
            numberOfLines={3}
            ellipsizeMode="tail"
            className="text-typography-900 text-base font-semibold"
          >
            {moduleName(item.trainingName) || ""}
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
            <Text className="text-center text-sm">
              {item.unrealized ? "Finalizado em" : "Realizado em"}
            </Text>
            <Text className="text-typography-900 text-sm text-center capitalize">
              {month}
            </Text>
            <Text className="text-typography-900 text-xl font-bold text-center">
              {day}
            </Text>
          </VStack>
        )}
      </HStack>
      {item.unrealized ? (
        <Box>
          <Text className="text-red-700 font-bold">Treino não realizado</Text>
        </Box>
      ) : (
        <HStack className="justify-around items-center pt-2">
          <VStack className="items-center">
            <Icon as={RouteIcon} size="xl" className="text-background-700" />
            <Text className="text-xs text-typography-700 mt-1">Distância</Text>
            <Text className="text-xs text-typography-900">
              {convertMetersToKilometersFormat(item?.distanceInMeters || 0)}
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
            <Text className="text-xs text-typography-700 mt-1">Pace Médio</Text>
            <Text className="text-xs text-typography-900">
              {convertPaceToSpeed(item?.paceInSeconds || 0, true)}
            </Text>
          </VStack>

          <Divider
            orientation="vertical"
            className="bg-gray-300 rounded h-12"
          />

          <VStack className="items-center">
            <Icon as={Clock10Icon} size="xl" className="text-background-700" />
            <Text className="text-xs text-typography-700 mt-1">Tempo</Text>
            <Text className="text-xs text-typography-900">
              {convertSecondsToHourMinuteFormat(item?.durationInSeconds || 0)}
            </Text>
          </VStack>

          <Divider
            orientation="vertical"
            className="bg-gray-300 rounded h-12"
          />

          <VStack className="items-center">
            <RpeDisplay rpe={item.rpe || 0} />
          </VStack>

          <Divider orientation="vertical" className="bg-gray-300 rounded" />

          <VStack className="items-center">
            {renderIconType()}
            <Text className="text-xs text-typography-700 mt-1">
              {item?.outdoor ? "Outdoor" : "Indoor"}
            </Text>
          </VStack>
        </HStack>
      )}
    </Box>
  );
};

const createRenderItem = (
  setComments: React.Dispatch<
    React.SetStateAction<{
      feedback: string;
      comments: string;
      executionDay: string;
      updatedAt: string;
    } | null>
  >
): ListRenderItem<FinishedHistory> => {
  return ({ item, index }) => {
    const parsedDate = parseISO(item.executionDay);
    const day = format(parsedDate, "dd");
    const month = format(parsedDate, "MMMM", { locale: ptBR });

    return (
      <View>
        {item.trainingRunninge
          ? renderCardRunner(setComments, item, day, month)
          : renderCardGym(setComments, item, day, month)}
      </View>
    );
  };
};

const History = () => {
  const [comments, setComments] = useState<{
    feedback: string;
    comments: string;
    executionDay: string;
    updatedAt: string;
  } | null>(null);
  const [refreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: history,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const onRefresh = async () => {
    try {
      queryClient.removeQueries({ queryKey: ["history"] });
      await queryClient.invalidateQueries({ queryKey: ["history"] });
    } catch (error) {
      console.warn(error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1">
        <Loading />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#000] pt-3">
      <Text
        size="2xl"
        className="text-typography-900 font-roboto text-center mb-5"
      >
        Histórico dos últimos 30 dias
      </Text>

      <FlashList<FinishedHistory>
        data={data || []}
        renderItem={createRenderItem(setComments)}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2b2b2b9d"]}
            tintColor="#2b2b2b9d"
          />
        }
        ListEmptyComponent={() => (
          <View style={{ marginTop: 48, alignItems: "center" }}>
            <Text style={{ color: "#999" }}>Nenhum item encontrado</Text>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 32 }}
      />

      <Comments
        open={Boolean(comments)}
        onClose={() => setComments(null)}
        content={comments}
      />
    </View>
  );
};

export default History;
