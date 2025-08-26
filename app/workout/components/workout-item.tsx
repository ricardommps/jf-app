import { MediaInfo } from "@/types/workout";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { WebView } from "react-native-webview";
import { StyleSheet, View } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button, ButtonText } from "@/components/ui/button";
import { Media } from "@/types/media";
import { useEffect, useState } from "react";
import {
  getWorkoutLoad,
  saveWorkoutLoad,
} from "@/services/workout-load.service";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { useWorkouut } from "@/contexts/WorkoutContext";

interface Props {
  media: Media;
  exerciseInfo: MediaInfo[];
  isWorkoutLoad: boolean;
}

const getYoutubeId = (url?: string) => {
  if (!url) return null;
  const match = url.match(/(?:\?v=|\/embed\/|\.be\/|\/shorts\/)([\w\-]{11})/);
  return match ? match[1] : null;
};

const WorkoutItem = ({ media, exerciseInfo, isWorkoutLoad }: Props) => {
  const queryClient = useQueryClient();
  const { checkList, handleCheckList } = useWorkouut();
  const exerciseInfoById: MediaInfo = exerciseInfo?.filter(
    (item) => item.mediaId === media.id
  )[0];
  const videoId = getYoutubeId(media.videoUrl);

  const [isEditing, setIsEditing] = useState(false);
  const [carga, setCarga] = useState("");

  const {
    data: workoutLoad,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workoutLoad", media.id],
    queryFn: async () => await getWorkoutLoad(media.id),
    retry: 3,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!media.id,
  });

  // Mutation para salvar a carga
  const saveLoadMutation = useMutation({
    mutationFn: async (load: string) => await saveWorkoutLoad(media.id, load),
    onSuccess: () => {
      // Atualiza o cache do React Query após salvar
      queryClient.invalidateQueries({
        queryKey: ["workoutLoad", media.id],
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Erro ao salvar carga:", error);
      // Aqui você pode adicionar um toast ou alert para mostrar o erro
    },
  });

  useEffect(() => {
    if (workoutLoad?.length > 0) {
      setCarga(workoutLoad[0].load);
    }
  }, [workoutLoad]);

  const handleSave = () => {
    saveLoadMutation.mutate(carga);
  };

  const handleCancel = () => {
    // Reverte para o valor original caso cancele
    if (workoutLoad?.length > 0) {
      setCarga(workoutLoad[0].load);
    }
    setIsEditing(false);
  };

  const renderWebView = () => {
    if (videoId) {
      return (
        <View style={styles.webviewContainer}>
          <WebView
            source={{
              uri: `https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&fs=0`,
            }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            mixedContentMode="compatibility"
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
          />
        </View>
      );
    }
    return null;
  };
  return (
    <Box
      className={`rounded-2xl bg-background-200 p-2 py-3 px-3 ${
        checkList.includes(Number(media.id)) && "border border-green-300"
      }`}
    >
      <VStack className="px-0" space="md">
        <VStack className="gap-3 ">
          <HStack className="gap-2 items-start">
            <Text className="text-typography-900 font-dm-sans-bold text-base">
              {media.title}
            </Text>
          </HStack>

          {renderWebView()}

          <VStack className="px-2 gap-3">
            {isWorkoutLoad && (
              <HStack className="rounded-2xl bg-background-300 flex-row justify-between items-center p-2">
                {error ? (
                  <Text
                    className="text-typography-700 font-dm-sans-bold flex-1"
                    size="md"
                  >
                    Erro ao carregar carga
                  </Text>
                ) : (
                  <>
                    {isEditing ? (
                      <VStack className="w-full">
                        <Text className="text-typography-600 text-base mb-1">
                          Digite a carga
                        </Text>
                        <Textarea className="h-24 border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full">
                          <TextareaInput
                            value={carga}
                            onChangeText={setCarga}
                            placeholder="Adicione a carga do exercício..."
                            className="placeholder:text-typography-400"
                          />
                        </Textarea>
                        <HStack className="gap-2 mt-2">
                          <Button
                            size="sm"
                            onPress={handleSave}
                            disabled={saveLoadMutation.isPending}
                            className="flex-1"
                            action="primary"
                          >
                            <ButtonText>
                              {saveLoadMutation.isPending
                                ? "Salvando..."
                                : "Salvar"}
                            </ButtonText>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={handleCancel}
                            disabled={saveLoadMutation.isPending}
                            className="flex-1"
                          >
                            <ButtonText>Cancelar</ButtonText>
                          </Button>
                        </HStack>
                      </VStack>
                    ) : (
                      <>
                        <Text
                          className="text-typography-700 font-dm-sans-bold flex-1"
                          size="md"
                        >
                          Carga:{" "}
                          {isLoading
                            ? "Carregando..."
                            : carga
                            ? carga
                            : "não definida"}
                        </Text>
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => setIsEditing(true)}
                        >
                          <ButtonText>Editar</ButtonText>
                        </Button>
                      </>
                    )}
                  </>
                )}
              </HStack>
            )}

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
              <InfoItem
                label="OBSERVAÇÕES:"
                value={exerciseInfoById.comments}
              />
            )}
          </VStack>
        </VStack>
      </VStack>
      <Box className="mt-3 items-start">
        <Button size="sm" onPress={() => handleCheckList(Number(media.id))}>
          <ButtonText>
            {!checkList.includes(Number(media.id))
              ? "Marcar como feito"
              : "Desmarcar como feito"}
          </ButtonText>
        </Button>
      </Box>
    </Box>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <VStack className="items-start">
    <Text className="font-dm-sans-bold" size="sm">
      {label}
    </Text>
    <Text className="font-dm-sans-medium" size="sm">
      {value}
    </Text>
  </VStack>
);

const styles = StyleSheet.create({
  webviewContainer: {
    width: "100%",
    height: 400,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  webview: {
    flex: 1,
    borderRadius: 12,
  },
});

export default WorkoutItem;
