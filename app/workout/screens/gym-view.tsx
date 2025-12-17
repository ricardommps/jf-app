import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import WorkoutSection from "../components/workout-section";

import { Workout, WorkoutItem } from "@/types/workout";
import { useRouter } from "expo-router";
import { FlatList, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  workout: Workout;
}

const GymView = ({ workout }: Props) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  function handleNavigate() {
    router.push(
      `/workout/gym-finish?id=${workout.id}&title=${workout.subtitle}` as any
    );
  }

  const ListHeader = () => (
    <Box className="rounded-1xl px-4 py-3 mt-3 mb-5">
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

  // Calcula altura do footer baseado no safe area
  const footerHeight =
    Platform.OS === "ios" ? Math.max(insets.bottom + 70, 90) : 70;

  return (
    <View style={styles.container}>
      <FlatList
        data={workout.workoutItems}
        renderItem={renderWorkoutSection}
        keyExtractor={(item: WorkoutItem) => item.id}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: footerHeight + 20,
          flexGrow: 1,
        }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={() => (
          <View style={{ marginTop: 48, alignItems: "center" }}>
            <Text style={{ color: "#999" }}>Nenhum vídeo para mostrar</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        bounces={true}
      />

      {/* Botões fixos na parte inferior */}
      <View
        style={[
          styles.fixedFooter,
          {
            paddingBottom:
              Platform.OS === "ios" ? Math.max(insets.bottom, 16) : 16,
          },
        ]}
      >
        <HStack className="gap-4 justify-end w-full px-4">
          <Button
            variant="outline"
            size="md"
            onPress={() => router.back()}
            className="min-w-[100px]"
          >
            <ButtonText>Fechar</ButtonText>
          </Button>
          <Button
            action="primary"
            size="md"
            onPress={handleNavigate}
            className="min-w-[140px]"
          >
            <ButtonText>Finalizar treino</ButtonText>
          </Button>
        </HStack>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    position: "relative",
  },
  fixedFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000",
    paddingTop: 16,
    paddingHorizontal: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 1000,
  },
});

export default GymView;
