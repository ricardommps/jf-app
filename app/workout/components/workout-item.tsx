import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { useWorkouut } from "@/contexts/WorkoutContext";
import {
  getWorkoutLoad,
  saveWorkoutLoad,
} from "@/services/workout-load.service";
import { Media } from "@/types/media";
import { MediaInfo } from "@/types/workout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, withSpring } from "react-native-reanimated";

// Importa o novo componente
import VideoPlayerModal from "./VideoPlayerModal";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Props {
  media: Media;
  exerciseInfo: MediaInfo[];
  isWorkoutLoad: boolean;
  debug?: boolean;
}

const getYoutubeId = (url?: string) => {
  if (!url) return null;
  const match = url.match(/(?:\?v=|\/embed\/|\.be\/|\/shorts\/)([\w\-]{11})/);
  return match ? match[1] : null;
};

const WorkoutItem = ({
  media,
  exerciseInfo,
  isWorkoutLoad,
  debug = false,
}: Props) => {
  const queryClient = useQueryClient();
  const { checkList, handleCheckList } = useWorkouut();

  const exerciseInfoById: MediaInfo = exerciseInfo?.find(
    (item) => item.mediaId === media.id
  )!;

  const videoId = useMemo(() => getYoutubeId(media.videoUrl), [media.videoUrl]);

  const [isEditing, setIsEditing] = useState(false);
  const [carga, setCarga] = useState("");
  const [showPlayer, setShowPlayer] = useState(false);

  // Novo estado para controlar o modo grande (simulando fullscreen)
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Estado para controlar o modo flutuante pequeno e arrastável
  const [minimized, setMinimized] = useState(false);

  // Valores para animação de arraste (apenas para o modo minimizado)
  const translateX = useSharedValue(SCREEN_WIDTH - 180); // Posição inicial no canto
  const translateY = useSharedValue(SCREEN_HEIGHT - 200); // Posição inicial no canto
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (minimized) {
        translateX.value = startX.value + event.translationX;
        translateY.value = startY.value + event.translationY;
      }
    })
    .onEnd(() => {
      if (!minimized) return;
      // Ajusta para "grudar" na lateral mais próxima
      if (translateX.value > SCREEN_WIDTH / 2) {
        translateX.value = withSpring(SCREEN_WIDTH - 180);
      } else {
        translateX.value = withSpring(20);
      }
      // Limita a área vertical
      if (translateY.value < 100) {
        translateY.value = withSpring(100);
      } else if (translateY.value > SCREEN_HEIGHT - 200) {
        translateY.value = withSpring(SCREEN_HEIGHT - 200);
      }
    });

  // ... (useQuery e useMutation permanecem inalterados) ...
  const {
    data: workoutLoad,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workoutLoad", media.id],
    queryFn: async () => await getWorkoutLoad(media.id),
    retry: 3,
    enabled: !!media.id,
  });

  const saveLoadMutation = useMutation({
    mutationFn: async (load: string) => await saveWorkoutLoad(media.id, load),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutLoad", media.id] });
      setIsEditing(false);
    },
  });

  useEffect(() => {
    if (workoutLoad?.length > 0) setCarga(workoutLoad[0].load);
  }, [workoutLoad]);

  const handleSave = () => saveLoadMutation.mutate(carga);
  const handleCancel = () => {
    if (workoutLoad?.length > 0) setCarga(workoutLoad[0].load);
    setIsEditing(false);
  };

  const handlePlayVideo = () => {
    setShowPlayer(true);
    setIsFullscreen(false); // Começa em modo fullscreen (grande)
    setMinimized(false); // Não começa minimizado
    // Reseta a posição do minimizado para o canto
    translateX.value = SCREEN_WIDTH - 100;
    translateY.value = SCREEN_HEIGHT - 200;
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setIsFullscreen(false);
    setMinimized(false);
  };

  const handleToggleFullscreen = () => {
    if (isFullscreen) {
      // Saindo do fullscreen para o minimizado flutuante
      setIsFullscreen(false);
      setMinimized(false);
      // Posição de transição para o canto
      translateX.value = withSpring(SCREEN_WIDTH - 180);
      translateY.value = withSpring(SCREEN_HEIGHT - 200);
    } else {
      // Saindo do minimizado flutuante para o fullscreen
      setIsFullscreen(true);
      setMinimized(false);
    }
  };

  // REMOVEMOS AQUI O animatedStyle e as variáveis de playerWidth/Height
  // Elas foram movidas para o VideoPlayerModal

  return (
    <>
      <Box
        className={`rounded-2xl bg-background-200 p-2 py-3 px-3 ${
          checkList.includes(Number(media.id)) ? "border border-green-300" : ""
        }`}
      >
        <VStack className="px-0" space="md">
          <VStack className="gap-3">
            <Text className="text-typography-900 font-dm-sans-bold text-base">
              {media.title}
            </Text>

            {media.thumbnail && (
              <Pressable
                onPress={handlePlayVideo}
                style={styles.thumbnailContainer}
              >
                <Image
                  source={{ uri: media.thumbnail }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <View style={styles.playButtonOverlay}>
                  <View style={styles.playButton}>
                    <Play color="white" size={40} />
                  </View>
                </View>
              </Pressable>
            )}

            <VStack className="px-2 gap-3">
              {/* ... (Seção de Carga, InfoItem, etc. permanecem inalterados) ... */}

              {isWorkoutLoad && (
                <HStack className="rounded-2xl bg-background-300 flex-row justify-between items-center p-2">
                  {error ? (
                    <Text
                      className="text-typography-700 font-dm-sans-bold flex-1"
                      size="md"
                    >
                      Erro ao carregar carga
                    </Text>
                  ) : isEditing ? (
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

        <Button
          size="sm"
          onPress={() => handleCheckList(Number(media.id))}
          className="mt-2"
        >
          <ButtonText>
            {!checkList.includes(Number(media.id))
              ? "Marcar como feito"
              : "Desmarcar como feito"}
          </ButtonText>
        </Button>
      </Box>

      {/* Modal Flutuante do Player - Usando o novo componente */}
      <Modal
        visible={showPlayer}
        transparent
        animationType="fade"
        onRequestClose={handleClosePlayer}
      >
        <VideoPlayerModal
          videoId={videoId}
          showPlayer={showPlayer}
          minimized={minimized}
          isFullscreen={isFullscreen}
          handleClosePlayer={handleClosePlayer}
          handleToggleFullscreen={handleToggleFullscreen}
          translateX={translateX}
          translateY={translateY}
          panGesture={panGesture}
        />
      </Modal>
    </>
  );
};

// ... (InfoItem e Styles permanecem inalterados, exceto pelos estilos do modal que foram movidos) ...

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
  thumbnailContainer: {
    width: "100%",
    height: 400,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#000",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  playButtonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Os estilos do modal foram movidos para VideoPlayerModal.tsx
});

export default WorkoutItem;
