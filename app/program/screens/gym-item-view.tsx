import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Badge, BadgeText } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useRouter } from "expo-router";
import { Box } from "@/components/ui/box";
import { Workout } from "@/types/workout";

interface Props {
  item: Workout;
}

const GymItemView = ({ item }: Props) => {
  const router = useRouter();

  const handleNavigate = (id: string) => {
    router.push(`/workout/view?id=${id}&type=2`);
  };

  const getLastWorkoutInfo = () => {
    if (!item?.history?.length || !item.history[0]?.executionDay) {
      return null;
    }

    const { executionDay } = item.history[0];
    try {
      const parsedDate = parseISO(executionDay);
      const day = format(parsedDate, "dd");
      const monthYear = format(parsedDate, "MMMM", { locale: ptBR });

      // Só retorna se ambos os valores são válidos (não vazios)
      if (day && monthYear) {
        return { day, monthYear };
      }
      return null;
    } catch (error) {
      console.warn("Data inválida:", executionDay);
      return null;
    }
  };

  const lastWorkoutInfo = getLastWorkoutInfo();

  return (
    <Box className="bg-[#2b2b2b9d] rounded-xl p-4 mb-2 flex-row justify-between min-h-[100px]">
      <VStack className="p-2">
        <Text className="text-typography-900 text-base font-semibold mt-1">
          {item?.subtitle || ""}
        </Text>
        <HStack className="gap-6 pt-2">
          {item?.history?.length > 0 && (
            <Box>
              <VStack>
                <Badge
                  variant="solid"
                  className="absolute -top-2 -right-3 bg-blue-500 rounded-full flex items-center justify-center z-10"
                >
                  <BadgeText className="text-white text-[10px] font-semibold">
                    {item.history.length}
                  </BadgeText>
                </Badge>
                <Button variant="outline" size="sm">
                  <ButtonText>Histórico</ButtonText>
                </Button>
              </VStack>
            </Box>
          )}
          <Button
            action="primary"
            onPress={() => handleNavigate(item.id)}
            size="sm"
          >
            <ButtonText>Ver treino</ButtonText>
          </Button>
        </HStack>
      </VStack>
      {lastWorkoutInfo && (
        <Box className="items-center mt-1">
          <Text className="text-center text-lg">Último treino</Text>
          <Text className="text-typography-900 text-sm text-center capitalize">
            {lastWorkoutInfo.monthYear}
          </Text>
          <Text className="text-typography-900 text-2xl font-bold text-center">
            {lastWorkoutInfo.day}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default GymItemView;
