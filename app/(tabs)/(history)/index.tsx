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
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { RefreshControl, View } from "react-native";
import Comments from "./components/comments";

type SetSelectedItem = React.Dispatch<
  React.SetStateAction<FinishedHistory | null>
>;

/* =========================================================
   GYM CARD
========================================================= */

const renderCardGym = (
  setSelectedItem: SetSelectedItem,
  onOpenDetails: (item: FinishedHistory) => void,
  item: FinishedHistory,
  day: string,
  month: string,
) => {
  return (
    <HistoryGymItem
      item={item}
      setSelectedItem={setSelectedItem}
      onOpenDetails={onOpenDetails}
      day={day}
      month={month}
    />
  );
};

/* =========================================================
   RUNNER CARD
========================================================= */

const renderCardRunner = (
  setSelectedItem: SetSelectedItem,
  onOpenDetails: (item: FinishedHistory) => void,
  item: FinishedHistory,
  day: string,
  month: string,
) => {
  const renderIconType = () => {
    if (item?.outdoor) {
      return <MaterialCommunityIcons name="road" size={25} color="white" />;
    }
    return <TreadmillIcon size={25} color="#fff" strokeWidth={2.5} />;
  };

  const feedback = typeof item?.feedback === "string" ? item.feedback : null;

  const cardContent = (
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

      {!item.unrealized && (
        <>
          <HStack className="justify-around items-center pt-5">
            <VStack className="items-center">
              <Icon as={RouteIcon} size="xl" />
              <Text className="text-xs mt-1">Distância</Text>
              <Text className="text-xs">
                {convertMetersToKilometersFormat(item?.distanceInMeters || 0)}
              </Text>
            </VStack>

            <Divider orientation="vertical" className="h-12" />

            <VStack className="items-center">
              <Icon as={FootprintsIcon} size="xl" />
              <Text className="text-xs mt-1">Pace Médio</Text>
              <Text className="text-xs">
                {convertPaceToSpeed(item?.paceInSeconds || 0, true)}
              </Text>
            </VStack>

            <Divider orientation="vertical" className="h-12" />

            <VStack className="items-center">
              <Icon as={Clock10Icon} size="xl" />
              <Text className="text-xs mt-1">Tempo</Text>
              <Text className="text-xs">
                {convertSecondsToHourMinuteFormat(item?.durationInSeconds || 0)}
              </Text>
            </VStack>

            <Divider orientation="vertical" className="h-12" />

            <VStack className="items-center">
              <RpeDisplay rpe={item.rpe || 0} />
            </VStack>

            <Divider orientation="vertical" />

            <VStack className="items-center">
              {renderIconType()}
              <Text className="text-xs mt-1">
                {item?.outdoor ? "Outdoor" : "Indoor"}
              </Text>
            </VStack>
          </HStack>
        </>
      )}
    </Box>
  );

  if (item.unrealized) {
    return cardContent;
  }

  return <Pressable onPress={() => onOpenDetails(item)}>{cardContent}</Pressable>;
};

/* =========================================================
   SCREEN
========================================================= */

const HistoryScreen = () => {
  const [selectedItem, setSelectedItem] = useState<FinishedHistory | null>(
    null,
  );

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<FinishedHistory[]>({
    queryKey: ["history"],
    queryFn: history,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  /* =========================================================
     🔥 SINCRONIZA selectedItem COM NOVO DATA
  ========================================================= */

  useEffect(() => {
    if (!selectedItem || !data) return;

    const updatedItem = data.find((item) => item.id === selectedItem.id);

    if (updatedItem) {
      setSelectedItem(updatedItem);
    }
  }, [data]);

  const onRefresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["history"],
    });
  };

  const handleOpenDetails = (item: FinishedHistory) => {
    router.push(`/activitie-details?finishedId=${item.id}&source=history` as any);
  };

  if (isLoading) {
    return (
      <View className="flex-1">
        <Loading />
      </View>
    );
  }
  const renderItem: ListRenderItem<FinishedHistory> = ({ item }) => {
    const parsedDate = parseISO(item.executionDay);
    const day = format(parsedDate, "dd");
    const month = format(parsedDate, "MMMM", { locale: ptBR });
    return (
      <View>
        {item.trainingRunning
          ? renderCardRunner(setSelectedItem, handleOpenDetails, item, day, month)
          : renderCardGym(setSelectedItem, handleOpenDetails, item, day, month)}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#000] pt-3">
      <Text size="2xl" className="text-typography-900 text-center mb-5">
        Histórico dos últimos 30 dias
      </Text>

      <FlashList
        data={data ?? []}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={{ marginTop: 48, alignItems: "center" }}>
            <Text style={{ color: "#999" }}>Nenhum item encontrado</Text>
          </View>
        )}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: 32,
        }}
      />

      <Comments
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        finishedId={selectedItem?.id ?? null}
        content={
          selectedItem
            ? {
                executionDay: selectedItem.executionDay,
                updatedAt: selectedItem.updatedAt,
                comments: selectedItem.comments ?? [],
              }
            : null
        }
      />
    </View>
  );
};

export default HistoryScreen;
