import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import WorkoutSection from "../components/workout-section";

import { FlatList, View } from "react-native";
import { useRouter } from "expo-router";
import { Workout, WorkoutItem } from "@/types/workout";
import { SafeAreaProvider } from "react-native-safe-area-context";

interface Props {
  workout: Workout;
}

const GymView = ({ workout }: Props) => {
  const router = useRouter();
  function handleNavigate() {
    router.push(`/workout/gym-finish?id=${workout.id}`);
  }

  const ListHeader = () => (
    <Box className="rounded-2xl px-4 py-3 bg-[#2b2b2bbe] mt-3">
      <Text className="text-xl font-bold text-gray-800 dark:text-white">
        {workout.subtitle}
      </Text>
    </Box>
  );

  const renderWorkoutSection = ({ item }: { item: WorkoutItem }) => {
    return (
      <WorkoutSection
        title={item.category}
        description={item?.description}
        medias={item.medias}
        mediaOrder={item.mediaOrder}
        exerciseInfo={item.mediaInfo}
        isWorkoutLoad={item.isWorkoutLoad}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <FlatList
        data={workout.workoutItems}
        renderItem={renderWorkoutSection}
        keyExtractor={(item: WorkoutItem) => item.id}
        contentContainerStyle={{
          paddingBottom: 80, // aumenta para compensar botões no final
          paddingTop: 16,
        }}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={() => (
          <HStack className="gap-4 pt-2 justify-end w-full px-4 mb-1">
            <Button variant="outline" size="md" onPress={() => router.back()}>
              <ButtonText>Fechar</ButtonText>
            </Button>
            <Button action="primary" size="md" onPress={handleNavigate}>
              <ButtonText>Finalizar treino</ButtonText>
            </Button>
          </HStack>
        )}
        ListEmptyComponent={() => (
          <View style={{ marginTop: 48, alignItems: "center" }}>
            <Text style={{ color: "#999" }}>Nenhum item encontrado</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaProvider>
  );
};

export default GymView;
