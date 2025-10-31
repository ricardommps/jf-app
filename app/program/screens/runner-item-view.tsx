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
import { Workout } from "@/types/workout";
import {
  convertMetersToKilometersFormat,
  convertPaceToSpeed,
  convertSecondsToHourMinuteFormat,
} from "@/utils/convertValues";
import { moduleName } from "@/utils/module-name";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "expo-router";
import { Clock10Icon, FootprintsIcon, RouteIcon } from "lucide-react-native";

interface Props {
  isDarkMode: boolean;
  item: Workout;
}

const RunnerItemView = ({ isDarkMode, item }: Props) => {
  const router = useRouter();
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
    let day = "";
    let monthYear = "";

    if (item?.history.length > 0 && item?.history[0].executionDay) {
      try {
        const parsedDate = parse(
          item?.history[0].executionDay,
          "dd/MM/yyyy",
          new Date()
        );
        day = format(parsedDate, "dd");
        monthYear = format(parsedDate, "MMMM", { locale: ptBR });
      } catch (error) {
        console.warn("Data inválida:", item?.history[0].executionDay);
      }
    }

    const renderIconType = () => {
      if (item?.history[0].outdoor) {
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
            <HStack className="pt-2 justify-around">
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
                    item?.history[0].distanceInMeters || 0
                  )}
                </Text>
              </VStack>
              <Divider orientation="vertical" className="bg-gray-300 rounded" />
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
                  {convertPaceToSpeed(
                    item?.history[0].paceInSeconds || 0,
                    true
                  )}
                </Text>
              </VStack>
              <Divider orientation="vertical" className="bg-gray-300 rounded" />
              <VStack className="items-center">
                <Icon
                  as={Clock10Icon}
                  size="xl"
                  className="text-background-700"
                />
                <Text className="text-xs text-typography-700 mt-1">Tempo</Text>
                <Text className="text-xs text-typography-900">
                  {convertSecondsToHourMinuteFormat(
                    item?.history[0].durationInSeconds || 0
                  )}
                </Text>
              </VStack>
              <Divider orientation="vertical" className="bg-gray-300 rounded" />
              <RpeDisplay rpe={item?.history[0].rpe || 0} />
              <Divider orientation="vertical" className="bg-gray-300 rounded" />
              <VStack className="items-center">
                {renderIconType()}
                <Text className="text-xs text-typography-700 mt-1">
                  {item?.history[0].outdoor ? "Outdoor" : "Indoor"}
                </Text>
              </VStack>
            </HStack>
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
