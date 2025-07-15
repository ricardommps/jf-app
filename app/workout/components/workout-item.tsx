import { ExerciseInfo, Media } from "@/types/workout";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { WebView } from "react-native-webview"; // Importando a WebView
import { StyleSheet } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";

interface Props {
  media: Media;
  exerciseInfo: ExerciseInfo[];
}

// Função para extrair o videoId do YouTube
const getYoutubeId = (url?: string) => {
  if (!url) return null;
  const match = url.match(/(?:\?v=|\/embed\/|\.be\/|\/shorts\/)([\w\-]{11})/);
  return match ? match[1] : null;
};

const WorkoutItem = ({ media, exerciseInfo }: Props) => {
  const exerciseInfoById = exerciseInfo?.filter(
    (item) => item.id === media.id
  )[0];
  const videoId = getYoutubeId(media.videoUrl);
  return (
    <VStack className="px-0" space="md">
      <VStack className="rounded-2xl bg-background-200 gap-3 p-2 py-3 px-3 min-h-[150px]">
        <HStack className="gap-2 items-start">
          <Text className="text-typography-900 font-dm-sans-bold text-base">
            {media.title}
          </Text>
        </HStack>

        {videoId && (
          <WebView
            source={{
              uri: `https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&fs=0`,
            }}
            style={styles.webview}
          />
        )}
        <VStack className="px-2 gap-3">
          <HStack className="rounded-2xl bg-background-300 flex-row justify-between items-center p-2">
            <Text
              className="text-typography-700 font-dm-sans-bold flex-1"
              size="md"
            >
              Carga: não definida
            </Text>
            <Button variant="outline" size="sm">
              <ButtonText>Editar</ButtonText>
            </Button>
          </HStack>
          {exerciseInfoById?.method && exerciseInfoById?.method.length > 0 && (
            <VStack className="items-start">
              <Text className="text-typography-700 font-dm-sans-bold" size="md">
                MÉTODO:
              </Text>
              <Text
                className="text-typography-900 font-dm-sans-medium"
                size="md"
              >
                {exerciseInfoById?.method}
              </Text>
            </VStack>
          )}

          {exerciseInfoById?.reps && exerciseInfoById?.reps.length > 0 && (
            <VStack className="items-start">
              <Text className="text-typography-700 font-dm-sans-bold" size="md">
                RANGE DE REPETIÇÕES:
              </Text>
              <Text
                className="text-typography-900 font-dm-sans-medium"
                size="md"
              >
                {exerciseInfoById?.reps}
              </Text>
            </VStack>
          )}

          {exerciseInfoById?.reset && (
            <VStack className="items-start">
              <Text className="text-typography-700 font-dm-sans-bold" size="md">
                INTERVALO DE RECUPERAÇÃO:
              </Text>
              <Text
                className="text-typography-700 font-dm-sans-medium"
                size="md"
              >
                {exerciseInfoById?.reset}
              </Text>
            </VStack>
          )}

          {exerciseInfoById?.rir && (
            <VStack className="items-start">
              <Text className="text-typography-700 font-dm-sans-bold" size="md">
                REPETIÇÕES DE RESERVA:
              </Text>
              <Text
                className="text-typography-700 font-dm-sans-medium"
                size="md"
              >
                {exerciseInfoById?.rir}
              </Text>
            </VStack>
          )}

          {exerciseInfoById?.cadence && (
            <VStack className="items-start">
              <Text className="text-typography-700 font-dm-sans-bold" size="md">
                CADÊNCIA / VEL. DE MOV.:
              </Text>
              <Text
                className="text-typography-700 font-dm-sans-medium"
                size="md"
              >
                {exerciseInfoById?.cadence}
              </Text>
            </VStack>
          )}

          {exerciseInfoById?.comments && (
            <VStack className="items-start">
              <Text className="text-typography-700 font-dm-sans-bold" size="md">
                OBSERVAÇÕES:
              </Text>
              <Text
                className="text-typography-700 font-dm-sans-medium"
                size="md"
              >
                {exerciseInfoById?.comments}
              </Text>
            </VStack>
          )}
        </VStack>
      </VStack>
    </VStack>
  );
};

const styles = StyleSheet.create({
  webview: {
    width: "100%",
    height: 400, // Altura ajustada
    borderRadius: 12, // Bordas arredondadas
  },
});

export default WorkoutItem;
