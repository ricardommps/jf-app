import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import WorkoutSection from "../components/workout-section";
import { workoutGym } from "@/data/screens/workouts";
import { useCallback, useEffect, useState } from "react";
import { FlatList } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { useRouter } from "expo-router";
import { Workout, WorkoutItem } from "@/types/workout";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

interface Props {
  workout: Workout;
}

const GymView = ({ workout }: Props) => {
  const router = useRouter();
  function handleNavigate() {
    router.push(`/workout/gym-finish?id=${workout.id}`);
  }

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
          flexGrow: 1,
          gap: 16,
          paddingBottom: 50,
        }}
        ListFooterComponent={() => (
          <HStack className="gap-4 pt-2 justify-end w-full px-4">
            <Button variant="outline" size="md" onPress={() => router.back()}>
              <ButtonText>Fechar</ButtonText>
            </Button>
            <Button action="primary" size="md" onPress={handleNavigate}>
              <ButtonText>Finalizar treino</ButtonText>
            </Button>
          </HStack>
        )}
      />
    </SafeAreaProvider>
  );
};

export default GymView;
