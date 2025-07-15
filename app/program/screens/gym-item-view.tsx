import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useRouter } from "expo-router";
import { Box } from "@/components/ui/box";
import { Image, ScrollView } from "react-native";

type Workout = {
  id: number;
  programId: number;
  subtitle: string;
  executionDay: string | null;
};

interface Props {
  isDarkMode: boolean;
  item: Workout;
}

const GymItemView = ({ isDarkMode, item }: Props) => {
  const router = useRouter();
  const handleNavigate = (id: number) => {
    router.push(`/workout/view?id=${item.id}`);
  };

  const renderCard = () => {
    let day = "";
    let monthYear = "";

    if (item?.executionDay) {
      try {
        const parsedDate = parse(item?.executionDay, "dd/MM/yyyy", new Date());
        day = format(parsedDate, "dd");
        monthYear = format(parsedDate, "MMMM", { locale: ptBR });
      } catch (error) {
        console.warn("Data inválida:", item?.executionDay);
      }
    }

    return (
      <Box className="bg-gray-900 rounded-xl p-4 mb-2 flex-row justify-between min-h-[100px]">
        <VStack className="p-2">
          <Text className="text-typography-900 text-base font-semibold mt-1">
            {item.subtitle}
          </Text>
          <HStack className="gap-4 pt-2">
            <Button variant="outline" size="sm">
              <ButtonText>Histórico</ButtonText>
            </Button>
            <Button
              action="positive"
              onPress={() => handleNavigate(item.id)}
              size="sm"
            >
              <ButtonText>Ver treino</ButtonText>
            </Button>
          </HStack>
        </VStack>
        {item?.executionDay && (
          <Box className="items-center mt-1 text-lg">
            <Text className="text-center">Último treino</Text>
            <Text className="text-typography-900 text-sm text-center capitalize">
              {monthYear}
            </Text>
            <Text className="text-typography-900 text-2xl font-bold text-center">
              {day}
            </Text>
          </Box>
        )}
      </Box>
    );
  };

  return <>{renderCard()}</>;
};

export default GymItemView;
