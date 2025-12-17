import JFDefaultBackground from "@/assets/images/foltz_tela.png";
import JFHorizontal from "@/assets/images/jf_branding.png";
import Loading from "@/components/shared/loading";
import { Box } from "@/components/ui/box";
import { getReview } from "@/services/review.service";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ImageBackground,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";

const formatDurationParts = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return {
    hours,
    minutes,
  };
};

export default function ActivitySummary() {
  const router = useRouter();
  const { programId } = useLocalSearchParams();
  const shareViewRef = useRef<View>(null);

  const [backgroundImage, setBackgroundImage] =
    useState<any>(JFDefaultBackground);
  const [showButtons, setShowButtons] = useState(true);
  const startDate = "2025-01-01";
  const endDate = "2025-12-31";

  const { data: review, isLoading } = useQuery({
    queryKey: ["programData", programId],
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => await getReview(String(programId), startDate, endDate),
    enabled: !!programId,
  });

  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        position.extractOffset();
      },
    })
  ).current;

  /* ===============================
     🖼️ Ações
  =============================== */
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setBackgroundImage({ uri: result.assets[0].uri });
    }
  };

  const handleResetImage = () => setBackgroundImage(JFDefaultBackground);

  const handleShare = async () => {
    if (!shareViewRef.current) return;

    try {
      setShowButtons(false);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const uri = await captureRef(shareViewRef.current, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      setShowButtons(true);

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert(
          "Compartilhamento não disponível",
          "O recurso não está disponível nesse dispositivo."
        );
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Compartilhar retrospectiva",
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      setShowButtons(true);
    }
  };

  /* ===============================
     🧱 UI
  =============================== */
  return (
    <View ref={shareViewRef} collapsable={false} className="flex-1">
      {isLoading ? (
        <View className="flex-1">
          <Loading />
        </View>
      ) : (
        <>
          <ImageBackground
            source={backgroundImage}
            resizeMode="cover"
            className="flex-1 p-2"
          >
            {/* Estatísticas (ARRASTÁVEL) */}
            <View className="flex-1">
              <Animated.View
                {...panResponder.panHandlers}
                style={{
                  transform: position.getTranslateTransform(),
                }}
              >
                <Box className="mt-[250] ml-[60]">
                  {backgroundImage === JFDefaultBackground && (
                    <Text className="text-red-600 font-baloo-bold text-2xl uppercase pb-5">
                      Retrospectiva 2025
                    </Text>
                  )}
                  {review && (
                    <View className="flex flex-col gap-5">
                      <View className="flex-row justify-between items-start">
                        <View>
                          <Text className="text-white text-lg font-medium mb-1 tracking-wide font-baloo-bold">
                            Total de dias de atividade
                          </Text>
                          <View className="flex-row items-baseline gap-2">
                            <Text className="text-white text-5xl font-black tracking-tight">
                              {review.totalDays}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View className="flex-row justify-between items-start">
                        <View>
                          <Text className="text-white text-lg font-medium mb-1 tracking-wide font-baloo-bold">
                            Distância total
                          </Text>
                          <View className="flex-row items-baseline gap-2">
                            <Text className="text-white text-5xl font-black tracking-tight">
                              {review.totalDistanceInKm}
                            </Text>
                            <Text className="text-3xl font-bold text-zinc-300">
                              {" "}
                              Km
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View className="flex-row justify-between items-start">
                        <View>
                          <Text className="text-white text-lg font-medium mb-1 tracking-wide font-baloo-bold">
                            Tempo total
                          </Text>
                          <View className="flex-row items-baseline gap-2">
                            {(() => {
                              const { hours, minutes } = formatDurationParts(
                                review.totalDurationInSeconds
                              );

                              return (
                                <>
                                  {hours > 0 && (
                                    <>
                                      <Text className="text-white text-5xl font-black tracking-tight">
                                        {hours}
                                      </Text>
                                      <Text className="text-3xl font-bold text-zinc-300">
                                        h
                                      </Text>
                                    </>
                                  )}

                                  {minutes > 0 && (
                                    <>
                                      <Text className="text-white text-5xl font-black tracking-tight">
                                        {minutes}
                                      </Text>
                                      <Text className="text-3xl font-bold text-zinc-300">
                                        min
                                      </Text>
                                    </>
                                  )}
                                </>
                              );
                            })()}
                          </View>
                        </View>
                      </View>
                      {review.totalRunningRaces > 0 && (
                        <View className="flex-row justify-between items-start">
                          <View>
                            <Text className="text-white text-lg font-medium mb-1 tracking-wide font-baloo-bold">
                              Total de provas
                            </Text>
                            <View className="flex-row items-baseline gap-2">
                              <Text className="text-white text-5xl font-black tracking-tight">
                                {review.totalRunningRaces}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </Box>
              </Animated.View>
            </View>

            {/* Footer */}
            {backgroundImage !== JFDefaultBackground && (
              <View className="absolute bottom-10 left-0 right-0 items-center">
                <View className="items-center">
                  <Image
                    source={JFHorizontal}
                    style={{ width: 120, height: 50 }}
                    resizeMode="contain"
                  />
                  <Text className="text-red-600 font-baloo-bold text-sm uppercase -mt-1">
                    @foltz.assesportiva
                  </Text>
                  <Text className="text-red-600 font-baloo-bold text-xl uppercase">
                    Retrospectiva 2025
                  </Text>
                </View>
              </View>
            )}
          </ImageBackground>

          {/* Botões laterais */}
          {showButtons && (
            <View className="absolute top-1/3 right-4 items-center gap-5">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-black/60 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePickImage}
                className="w-12 h-12 rounded-full bg-black/60 items-center justify-center"
              >
                <Ionicons name="image-outline" size={24} color="white" />
              </TouchableOpacity>

              {backgroundImage !== JFDefaultBackground && (
                <TouchableOpacity
                  onPress={handleResetImage}
                  className="w-12 h-12 rounded-full bg-black/60 items-center justify-center"
                >
                  <Ionicons name="close-outline" size={24} color="white" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleShare}
                className="w-12 h-12 rounded-full bg-black/60 items-center justify-center"
              >
                <Ionicons name="share-social-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}
