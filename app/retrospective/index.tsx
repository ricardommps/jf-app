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
  Animated,
  Image,
  ImageBackground,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import { ScaleSlider } from "./scale-slider";

/* ===============================
   ⏱️ Utils
================================ */
const formatDurationParts = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return { hours, minutes };
};

export default function ActivitySummary() {
  const router = useRouter();
  const { programId } = useLocalSearchParams();
  const shareViewRef = useRef<View>(null);

  const [backgroundImage, setBackgroundImage] =
    useState<any>(JFDefaultBackground);
  const [showButtons, setShowButtons] = useState(true);
  const [isEditingText, setIsEditingText] = useState(false);

  const hideSliderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startDate = "2025-01-01";
  const endDate = "2025-12-31";

  const { data: review, isLoading } = useQuery({
    queryKey: ["programData", programId],
    queryFn: async () => await getReview(String(programId), startDate, endDate),
    enabled: !!programId,
  });

  /* ===============================
     🔀 POSITION
  =============================== */
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  /* ===============================
     🔠 SCALE (SEM useState)
  =============================== */
  const scale = useRef(new Animated.Value(1)).current;
  const scaleValue = useRef(1);

  const activateEditing = () => {
    setIsEditingText(true);
    //Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (hideSliderTimeout.current) {
      clearTimeout(hideSliderTimeout.current);
    }

    hideSliderTimeout.current = setTimeout(() => {
      setIsEditingText(false);
    }, 2000);
  };

  const moveResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => !isEditingText,
      onPanResponderGrant: activateEditing,
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
     🖼️ Actions
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

  const handleShare = async () => {
    if (!shareViewRef.current) return;

    try {
      setShowButtons(false);
      setIsEditingText(false);
      await new Promise((r) => setTimeout(r, 400));

      const uri = await captureRef(shareViewRef.current, {
        format: "png",
        quality: 1,
      });

      setShowButtons(true);

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
        <Loading />
      ) : (
        <>
          <ImageBackground
            source={backgroundImage}
            resizeMode="cover"
            className="flex-1 p-2"
          >
            <View className="flex-1">
              <Animated.View
                {...moveResponder.panHandlers}
                style={{
                  transform: [...position.getTranslateTransform(), { scale }],
                }}
              >
                <Box className="mt-[250] ml-[60]">
                  {review && (
                    <View className="gap-5">
                      <View>
                        <Text className="text-white text-lg font-baloo-bold">
                          Total de dias
                        </Text>
                        <Text className="text-white text-5xl font-black">
                          {review.totalDays}
                        </Text>
                      </View>

                      <View>
                        <Text className="text-white text-lg font-baloo-bold">
                          Distância total
                        </Text>
                        <View className="flex-row items-baseline gap-2">
                          <Text className="text-white text-5xl font-black">
                            {review.totalDistanceInKm}
                          </Text>
                          <Text className="text-3xl text-zinc-300">km</Text>
                        </View>
                      </View>

                      <View>
                        <Text className="text-white text-lg font-baloo-bold">
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
                                    <Text className="text-white text-5xl font-black">
                                      {hours}
                                    </Text>
                                    <Text className="text-3xl text-zinc-300">
                                      h
                                    </Text>
                                  </>
                                )}
                                {minutes > 0 && (
                                  <>
                                    <Text className="text-white text-5xl font-black">
                                      {minutes}
                                    </Text>
                                    <Text className="text-3xl text-zinc-300">
                                      min
                                    </Text>
                                  </>
                                )}
                              </>
                            );
                          })()}
                        </View>
                      </View>

                      {review.totalRunningRaces > 0 && (
                        <View>
                          <Text className="text-white text-lg font-baloo-bold">
                            Total de provas
                          </Text>
                          <Text className="text-white text-5xl font-black">
                            {review.totalRunningRaces}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </Box>
              </Animated.View>
            </View>
            {backgroundImage !== JFDefaultBackground && (
              <View className="absolute bottom-10 left-0 right-0 items-center">
                <Image
                  source={JFHorizontal}
                  style={{ width: 120, height: 50 }}
                />
                <Text className="text-red-600 font-bold">
                  Retrospectiva 2025
                </Text>
              </View>
            )}
          </ImageBackground>

          {/* 🎚️ SLIDER */}
          {isEditingText && (
            <ScaleSlider
              scale={scaleValue.current}
              onChange={(value) => {
                scale.setValue(value);
                scaleValue.current = value;
                activateEditing();
              }}
            />
          )}

          {/* 🔘 BOTÕES */}
          {showButtons && (
            <View className="absolute top-1/3 right-4 items-center gap-5">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={22} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={handlePickImage}>
                <Ionicons name="image-outline" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleShare}>
                <Ionicons name="share-social-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}
