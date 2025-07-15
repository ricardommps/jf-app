import { ExerciseInfo, Media } from "@/types/workout";
import { useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { WebView } from "react-native-webview";
import { Image, StyleSheet, View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";

interface Props {
  media: Media;
  exerciseInfo: ExerciseInfo[];
}

const getYoutubeId = (url?: string) => {
  if (!url) return null;
  const match = url.match(/(?:\?v=|\/embed\/|\.be\/|\/shorts\/)([\w\-]{11})/);
  return match ? match[1] : null;
};

const WorkoutItemGroup = ({ media, exerciseInfo }: Props) => {
  const exerciseInfoById = exerciseInfo?.find((item) => item.id === media.id);
  const videoId = getYoutubeId(media.videoUrl);

  return (
    <VStack space="md">
      <VStack className="rounded-2xl bg-background-200 gap-3 p-2 py-3 px-3 min-h-[150px]">
        <HStack className="gap-2 items-start">
          <Text className="text-typography-900 font-dm-sans-bold text-base">
            {media.title}
          </Text>
        </HStack>

        {/* WebView para o vídeo */}
        {videoId && (
          <>
            <View
              style={{
                width: "100%",
                height: 400,
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <WebView
                source={{
                  uri: `https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&fs=0`,
                }}
                style={styles.webview}
              />
            </View>
          </>
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

          {exerciseInfoById?.method && (
            <InfoItem label="MÉTODO:" value={exerciseInfoById.method} />
          )}
          {exerciseInfoById?.reps && (
            <InfoItem
              label="RANGE DE REPETIÇÕES:"
              value={exerciseInfoById.reps}
            />
          )}
          {exerciseInfoById?.reset && (
            <InfoItem
              label="INTERVALO DE RECUPERAÇÃO:"
              value={exerciseInfoById.reset}
            />
          )}
          {exerciseInfoById?.rir && (
            <InfoItem
              label="REPETIÇÕES DE RESERVA:"
              value={exerciseInfoById.rir}
            />
          )}
          {exerciseInfoById?.cadence && (
            <InfoItem
              label="CADÊNCIA / VEL. DE MOV.:"
              value={exerciseInfoById.cadence}
            />
          )}
          {exerciseInfoById?.comments && (
            <InfoItem label="OBSERVAÇÕES:" value={exerciseInfoById.comments} />
          )}
        </VStack>
      </VStack>
    </VStack>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <VStack className="items-start">
    <Text className="text-typography-700 font-dm-sans-bold" size="md">
      {label}
    </Text>
    <Text className="text-typography-700 font-dm-sans-medium" size="md">
      {value}
    </Text>
  </VStack>
);

const styles = StyleSheet.create({
  webViewContainer: {
    width: "100%",
    alignItems: "center", // Centraliza o WebView
    marginBottom: 20,
  },
  webview: {
    width: "100%",
    height: 400,
    borderRadius: 12,
    marginBottom: 12,
  },
});

export default WorkoutItemGroup;
