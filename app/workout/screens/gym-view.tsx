import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import WorkoutSection from "../components/workout-section";
import { workoutGym } from "@/data/screens/workouts";
import { useCallback, useEffect, useState } from "react";
import { Media } from "@/types/workout";
import { FlatList } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { useRouter } from "expo-router";

const STRETCH_TAGS = [
  "Alongamento ativo",
  "Alongamento passivo",
  "Alongamentos",
];
const HEATING_TAGS = ["Aquecimento"];

const GymView = () => {
  const router = useRouter();
  function handleNavigateToLogin() {
    router.push(`/workout/gym-finish`);
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
          .filter((media) => !heatingOrder.includes(media.id)) // Remove mídias com IDs no array excluir
          .filter((media) => {
            const hasStretchOrHeating = media.tags.some(
              (tag) => STRETCH_TAGS.includes(tag) || HEATING_TAGS.includes(tag)
            );
            return !hasStretchOrHeating || media.tags.length > 1; // Mantém se tiver outras tags além dessas
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
    switch (item) {
      case "Aquecimento":
        return (
          <WorkoutSection
            title="Aquecimento"
            description={workout?.heating}
            medias={mediasHeating}
            mediaOrder={workout?.heatingOrder}
            exerciseInfo={workout?.exerciseInfo}
          />
        );
      case "Parte principal":
        return (
          <WorkoutSection
            title={workout.running ? "Descrição" : "Parte principal"}
            description={workout?.description}
            medias={medias}
            mediaOrder={workout?.mediaOrder}
            exerciseInfo={workout?.exerciseInfo}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <VStack className="px-0 flex-1 h-full bg-background-0" space="md">
        <FlatList
          data={["Aquecimento", "Parte principal"]}
          renderItem={renderWorkoutSection}
          keyExtractor={(item) => item} // A chave aqui pode ser a string
          contentContainerStyle={{
            paddingBottom: 16,
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
      </VStack>
    </>
  );
};

export default GymView;
