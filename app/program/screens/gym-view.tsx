import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { ThemeContext } from "@/contexts/theme-context";
import { useCallback, useContext, useRef } from "react";
import { Box } from "@/components/ui/box";
import GymItemView from "./gym-item-view";
import { Dimensions, FlatList, ScrollView, View } from "react-native";

const workouts = [
  {
    id: 449,
    programId: 154,
    subtitle: "Peitoral e dorsais",
    executionDay: "22/04/2025",
  },
  {
    id: 450,
    programId: 154,
    subtitle: "Deltoides e membros",
    executionDay: "23/04/2025",
  },
  {
    id: 451,
    programId: 154,
    subtitle: "Complex",
    executionDay: null,
  },
  {
    id: 14,
    programId: 154,
    subtitle: "Complementar - inferiores",
    executionDay: null,
  },
];

type Workout = {
  id: number;
  programId: number;
  subtitle: string;
  executionDay: string | null;
};

const GymView = () => {
  const { colorMode }: any = useContext(ThemeContext);
  const isDarkMode = colorMode === "dark";
  const toUpperCaseSafe = (text: string) => text.toUpperCase();
  const flashListRef = useRef<FlatList<any>>(null);
  const { width } = Dimensions.get("window");
  const scrollRef = useRef<ScrollView>(null);
  const cardWidth = width - 24;

  const renderItem = useCallback(
    ({ item }: { item: Workout }) => {
      return <GymItemView isDarkMode={isDarkMode} item={item} />;
    },
    [isDarkMode]
  );

  return (
    <>
      <VStack className="px-0" space="md">
        <VStack className="rounded-1xl bg-gray-900 gap-3 p-3">
          <VStack className="gap-2 items-center">
            <Text className="text-typography-900 font-dm-sans-bold" size="lg">
              {toUpperCaseSafe("Março - Abril")}
            </Text>
            <Text className="text-typography-900 font-dm-sans-medium" size="sm">
              23/02/2025 - 03/05/2025
            </Text>
          </VStack>
        </VStack>
      </VStack>

      <FlatList
        ref={flashListRef}
        data={workouts}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        snapToAlignment="center"
        decelerationRate="fast"
        snapToInterval={cardWidth}
        onScrollEndDrag={() => {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        }}
        viewabilityConfig={{
          waitForInteraction: true,
          itemVisiblePercentThreshold: 100,
        }}
        ListEmptyComponent={() => <View>Nenhum treino encontrado</View>}
        contentContainerStyle={{ paddingVertical: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={() => (
          <VStack className="px-7 pb-3" space="md">
            <VStack className="py-3 rounded-2xl bg-gray-900 gap-3 p-3">
              <VStack className="gap-5 items-center">
                <Text className="text-typography-900 font-dm-sans-bold text-base">
                  Informações adicionais
                </Text>
                <Text
                  className="text-typography-900 font-dm-sans-medium"
                  size="sm"
                >
                  Seg 7hr Ter 7hr Qui 7hr - COMPLEX Sex 18hr Sáb - COMPLEMENTAR
                </Text>
              </VStack>
            </VStack>
          </VStack>
        )}
      />
    </>
  );
};

export default GymView;
