import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import WorkoutSection from "../components/workout-section";
import { workoutGym } from "@/data/screens/workouts";
import { useCallback, useEffect, useState } from "react";
import { Media } from "@/types/workout";
import { FlatList, StyleSheet, StatusBar } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Box } from "@/components/ui/box";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

const STRETCH_TAGS = [
  "Alongamento ativo",
  "Alongamento passivo",
  "Alongamentos",
];
const HEATING_TAGS = ["Aquecimento"];

const RunnerView = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  function handleNavigateToLogin() {
    router.push(`/workout/runner-finish`);
  }
  const workout = workoutGym;
  const [mediasHeating, setMediasHeating] = useState<Media[]>([]);
  const [mediasStretches, setMediasStretches] = useState<Media[]>([]);
  const [medias, setMedias] = useState<Media[]>([]);

  const handleFilterMedias = useCallback(() => {
    if (!workout) return;

    const { medias, stretchesOrder, heatingOrder, mediaOrder } = workout;

    if (stretchesOrder?.length && medias?.length) {
      setMediasStretches(
        medias.filter((item) =>
          item.tags.some((tag) => STRETCH_TAGS.includes(tag))
        )
      );
    }

    if (heatingOrder?.length && medias?.length) {
      setMediasHeating(
        medias.filter((item) =>
          item.tags.some((tag) => HEATING_TAGS.includes(tag))
        )
      );
    }

    if (mediaOrder?.length && medias?.length) {
      const FILTER_TAGS = [...STRETCH_TAGS, ...HEATING_TAGS];
      if (heatingOrder?.length > 0) {
        const filteredMedias = medias
          .filter((media) => !heatingOrder.includes(media.id))
          .filter((media) => {
            const hasStretchOrHeating = media.tags.some(
              (tag) => STRETCH_TAGS.includes(tag) || HEATING_TAGS.includes(tag)
            );
            return !hasStretchOrHeating || media.tags.length > 1;
          });
        setMedias(filteredMedias);
      } else {
        const filteredMedias = medias.filter((media) =>
          media.tags.some((tag) => !FILTER_TAGS.includes(tag))
        );
        setMedias(filteredMedias);
      }
    }
  }, [workout]);

  useEffect(() => {
    handleFilterMedias();
  }, [workout, handleFilterMedias]);

  const renderWorkoutSection = ({ item }: { item: string }) => {
    let title = "";
    let description = "";
    let mediasToShow: Media[] = [];
    let mediaOrder = [];
    let exerciseInfo = workout?.exerciseInfo;

    switch (item) {
      case "Aquecimento":
        title = "Aquecimento";
        description = workout?.heating || "";
        mediasToShow = mediasHeating;
        mediaOrder = workout?.heatingOrder || [];
        break;
      case "Parte principal":
        title = workout.running ? "Descrição" : "Parte principal";
        description = workout?.description || "";
        mediasToShow = medias;
        mediaOrder = workout?.mediaOrder || [];
        break;
      default:
        return null;
    }

    // Scroll interno para cada seção
    return (
      <WorkoutSection
        title={title}
        description={description}
        medias={mediasToShow}
        mediaOrder={mediaOrder}
        exerciseInfo={exerciseInfo}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={["Aquecimento", "Parte principal"]}
          renderItem={renderWorkoutSection}
          keyExtractor={(item) => item}
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
              <Button
                action="positive"
                size="md"
                onPress={handleNavigateToLogin}
              >
                <ButtonText>Finalizar treino</ButtonText>
              </Button>
            </HStack>
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
});

export default RunnerView;
