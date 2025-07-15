import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Alert, AlertText, AlertIcon } from "@/components/ui/alert";

import { useRouter } from "expo-router";
import { Box } from "@/components/ui/box";
import { Workout, WorkoutRunner } from "@/types/workout";

interface Props {
  isDarkMode: boolean;
  item: Workout;
}

const RunnerItemView = ({ isDarkMode, item }: Props) => {
  const router = useRouter();
  const handleNavigate = (id: string) => {
    router.push(`/workout/view?id=${item.id}`);
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

    // Treino finalizado
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

    return (
      <Box className="bg-gray-900 rounded-xl p-4 mb-2 flex-row justify-between min-h-[100px]">
        <VStack className="p-2">
          <Text className="text-typography-900 text-base font-semibold mt-1">
            {item.title}
          </Text>
          <Text className="text-typography-900 text-base font-semibold mt-1">
            {item.subtitle}
          </Text>
          <Box className="py-5">{statusTraining()}</Box>
          <HStack className="gap-4 pt-2">
            <Button variant="outline" size="sm">
              <ButtonText>Histórico</ButtonText>
            </Button>
            <Button
              action="primary"
              onPress={() => handleNavigate(item.id)}
              size="sm"
            >
              <ButtonText>Ver treino</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  };

  return <>{renderCard()}</>;
};

export default RunnerItemView;
