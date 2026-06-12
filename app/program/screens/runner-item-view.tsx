import { RpeDisplay } from "@/components/rpe-display";
import { Alert, AlertText } from "@/components/ui/alert";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import TreadmillIcon from "@/components/ui/treadmill-icon";
import { VStack } from "@/components/ui/vstack";
import { useFinishedHistory } from "@/hooks/useFinished/useFinished";
import { Workout } from "@/types/workout";
import {
  convertMetersToKilometersFormat,
  convertPaceToSpeed,
  convertSecondsToHourMinuteFormat,
} from "@/utils/convertValues";
import { moduleName } from "@/utils/module-name";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { Clock10Icon, FootprintsIcon, RouteIcon } from "lucide-react-native";

interface Props {
  item: Workout;
}

const RunnerItemView = ({ item }: Props) => {
  const router = useRouter();

  const { data: finishedHistoryData } = useFinishedHistory(item.id, {
    enabled: item.finished,
  });

  const history =
    item.finished && Array.isArray(finishedHistoryData)
      ? finishedHistoryData
      : (item.history ?? []);

  const firstHistory = history[0];
  const handleNavigate = (id: string) => {
    router.push(`/workout/view?id=${id}&type=1` as any);
  };

  const statusTraining = () => {
    const today = new Date().toISOString().split("T")[0];
    const date = new Date(item.datePublished).toISOString().split("T")[0];

    // Treino atrasado
    if (!item.finished && date < today) {
      return (
        <Alert
          className="bg-red-500/60 rounded-lg flex-row items-center gap-x-2 p-2"
          variant="solid"
        >
          <AlertText className="text-white font-dm-sans-bold">
            Treino atrasado - Aguardando realização do treino
          </AlertText>
        </Alert>
      );
    }

    // Treino de hoje
    if (date === today && !item.finished) {
      return (
        <Alert
          className="bg-blue-500/60 rounded-lg flex-row items-center gap-x-2 p-2"
          variant="solid"
        >
          <AlertText className="text-white font-dm-sans-bold">
            Aguardando realização do treino
          </AlertText>
        </Alert>
      );
    }

    if (item.finished && !item.unrealized) {
      return (
        <Alert
          className="bg-green-500/60 rounded-lg flex-row items-center gap-x-2 p-2"
          variant="solid"
        >
          <AlertText className="text-white font-dm-sans-bold">
            Treino finalizado
          </AlertText>
        </Alert>
      );
    }

    // Treino não realizado
    if (item.finished && item.unrealized) {
      return (
        <Alert
          className="bg-orange-500/60 rounded-lg flex-row items-center gap-x-2 p-2"
          variant="solid"
        >
          <AlertText className="text-white font-dm-sans-bold">
            Treino não realizado
          </AlertText>
        </Alert>
      );
    }

    // Treino futuro - Nova regra
    if (
      !item.finished &&
      (item.unrealized === false || item.unrealized === null) &&
      date > today
    ) {
      return (
        <Alert
          className="bg-blue-400/60 rounded-lg flex-row items-center gap-x-2 p-2"
          variant="solid"
        >
          <AlertText className="text-white font-dm-sans-bold">
            Treino programado
          </AlertText>
        </Alert>
      );
    }
  };

  const renderCard = () => {
    const renderIconType = () => {
      if (firstHistory.outdoor) {
        return (
          <MaterialCommunityIcons
            name={"road" as any}
            size={25}
            color="white"
          />
        );
      }
      return <TreadmillIcon size={25} color="#fff" strokeWidth={2.5} />;
    };

    return (
      <Box className="w-full bg-[#2b2b2b9d] rounded-xl mb-2 flex-row justify-between min-h-[100px]">
        <VStack className="p-2 px-3 w-full">
          <Text className="text-typography-900 text-base font-semibold mt-1">
            {moduleName(item.title)}
          </Text>
          <Text className="text-typography-900 text-base font-semibold mt-1">
            {item.subtitle}
          </Text>
          {item.workoutDateOther && (
            <Text className="text-typography-900 text-base font-semibold mt-1">
              Dia alternativo :{" "}
              {format(new Date(item.workoutDateOther), "dd/MM/yyyy")}
            </Text>
          )}
          <Box className="py-5">{statusTraining()}</Box>
          {item?.finished && item?.history?.length > 0 ? (
            <>
              {/* {firstHistory.summaryPolyline && (
                <Box className="px-1 pt-1">
                  <ActivityMap encodedPolyline={firstHistory.summaryPolyline} />
                </Box>
              )} */}
              <HStack className="pt-5 justify-around">
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
                      firstHistory.distanceInMeters || 0,
                    )}
                  </Text>
                </VStack>
                <Divider
                  orientation="vertical"
                  className="bg-gray-300 rounded"
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
                    {convertPaceToSpeed(firstHistory.paceInSeconds || 0, true)}
                  </Text>
                </VStack>
                <Divider
                  orientation="vertical"
                  className="bg-gray-300 rounded"
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
                      firstHistory.durationInSeconds || 0,
                    )}
                  </Text>
                </VStack>
                <Divider
                  orientation="vertical"
                  className="bg-gray-300 rounded"
                />
                <RpeDisplay rpe={firstHistory.rpe || 0} />
                <Divider
                  orientation="vertical"
                  className="bg-gray-300 rounded"
                />
                <VStack className="items-center">
                  {renderIconType()}
                  <Text className="text-xs text-typography-700 mt-1">
                    {firstHistory.outdoor ? "Outdoor" : "Indoor"}
                  </Text>
                </VStack>
              </HStack>
            </>
          ) : (
            <HStack className="gap-4 pt-2">
              <Button
                action="primary"
                onPress={() => handleNavigate(item.id)}
                size="sm"
              >
                <ButtonText>Ver treino</ButtonText>
              </Button>
            </HStack>
          )}
        </VStack>
      </Box>
    );
  };

  return <>{renderCard()}</>;
};

export default RunnerItemView;
