import { RpeDisplay } from "@/components/rpe-display";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  convertMetersToKilometersFormat,
  convertPaceToSpeed,
  convertSecondsToHourMinuteFormat,
} from "@/utils/convertValues";
import { moduleName } from "@/utils/module-name";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  Clock10Icon,
  FootprintsIcon,
  RouteIcon,
  Share2,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Alert, ImageBackground, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

export default function CongratulationScreen() {
  const router = useRouter();
  const {
    distanceInMeters,
    durationInSeconds,
    paceInSeconds,
    rpe,
    title,
    subtitle,
    unrealizedTraining,
  } = useLocalSearchParams();
  const shareViewRef = useRef(null);
  const [showButtons, setShowButtons] = useState(true);

  const isGym =
    !distanceInMeters && !durationInSeconds && !paceInSeconds && !rpe;

  function handleNavigate() {
    router.replace("/(tabs)/(home)" as any);
  }

  async function handleShare() {
    try {
      // Esconde os botões
      setShowButtons(false);

      await new Promise((resolve) => setTimeout(resolve, 150));

      const uri = await captureRef(shareViewRef, {
        format: "png",
        quality: 1,
      });

      setShowButtons(true);

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert(
          "Compartilhamento não disponível",
          "O recurso de compartilhamento não está disponível nesse dispositivo."
        );
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Compartilhar treino",
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      setShowButtons(true);
    }
  }

  const renderUnrealizedTraining = () => (
    <>
      <VStack className="w-full max-w-[300px] self-center">
        <Text className="text-3xl font-extrabold text-white text-center">
          Treino não realizado.
        </Text>
        <Text className="text-2xl font-extrabold text-white text-center">
          Pace perfeito pra hoje: 0 km, 0 batimentos, 100% preguiça 😴
        </Text>
      </VStack>
    </>
  );

  return (
    <View className="flex-1" ref={shareViewRef} collapsable={false}>
      <ImageBackground
        source={require("@/assets/images/foltz_tela.png")}
        resizeMode="cover"
        className="flex-1 p-2"
      >
        <SafeAreaView className="flex-1 px-7">
          <View className="flex-1 p-12">
            <VStack className="flex-1 justify-center items-center">
              <Box className="mt-[150]">
                {unrealizedTraining ? (
                  renderUnrealizedTraining()
                ) : (
                  <>
                    <VStack className="w-full max-w-[300px] self-center">
                      <Text className="text-3xl font-extrabold text-white text-center">
                        Parabéns!
                      </Text>
                      {String(title) === "COMPETICAO" && subtitle ? (
                        <Text className="text-2xl font-extrabold text-white text-center">
                          Mais uma prova concluída com sucesso.
                        </Text>
                      ) : (
                        <Text className="text-2xl font-extrabold text-white text-center">
                          Mais um treino concluído com sucesso.
                        </Text>
                      )}
                    </VStack>

                    {!isGym && (
                      <VStack>
                        {String(title) === "COMPETICAO" && subtitle ? (
                          <Text className="text-xl font-extrabold text-white text-center">
                            {String(subtitle)}
                          </Text>
                        ) : (
                          <Text className="text-2xl font-extrabold text-white text-center">
                            {moduleName(String(title))}
                          </Text>
                        )}

                        <HStack className="pt-8 justify-around gap-5">
                          {Number(distanceInMeters) > 0 && (
                            <>
                              <VStack className="items-center">
                                <Icon
                                  as={RouteIcon}
                                  size="xl"
                                  className="text-background-700"
                                />
                                <Text className="text-xs text-typography-700 mt-1">
                                  Distância
                                </Text>
                                <Text className="text-xs text-typography-900">
                                  {convertMetersToKilometersFormat(
                                    Number(distanceInMeters)
                                  )}
                                </Text>
                              </VStack>
                              <Divider
                                orientation="vertical"
                                className="bg-gray-300 rounded"
                              />
                            </>
                          )}
                          {Number(paceInSeconds) > 0 && (
                            <>
                              <VStack className="items-center">
                                <Icon
                                  as={FootprintsIcon}
                                  size="xl"
                                  className="text-background-700"
                                />
                                <Text className="text-xs text-typography-700 mt-1">
                                  Pace Médio
                                </Text>
                                <Text className="text-xs text-typography-900">
                                  {convertPaceToSpeed(Number(paceInSeconds))}
                                </Text>
                              </VStack>
                              <Divider
                                orientation="vertical"
                                className="bg-gray-300 rounded"
                              />
                            </>
                          )}
                          {Number(durationInSeconds) > 0 && (
                            <>
                              <VStack className="items-center">
                                <Icon
                                  as={Clock10Icon}
                                  size="xl"
                                  className="text-background-700"
                                />
                                <Text className="text-xs text-typography-700 mt-1">
                                  Tempo
                                </Text>
                                <Text className="text-xs text-typography-900">
                                  {convertSecondsToHourMinuteFormat(
                                    Number(durationInSeconds)
                                  )}
                                </Text>
                              </VStack>
                              <Divider
                                orientation="vertical"
                                className="bg-gray-300 rounded"
                              />
                            </>
                          )}
                          {Number(rpe) > 0 && <RpeDisplay rpe={Number(rpe)} />}
                        </HStack>
                      </VStack>
                    )}
                  </>
                )}
              </Box>
            </VStack>
          </View>

          {showButtons && (
            <Box className="pt-4 pb-4">
              <HStack className="gap-2">
                <Button
                  action="primary"
                  size="md"
                  className="flex-1"
                  onPress={handleNavigate}
                >
                  <ButtonText>Fechar</ButtonText>
                </Button>
                {!isGym && !unrealizedTraining && (
                  <Button
                    action="secondary"
                    size="md"
                    className="flex-1"
                    onPress={handleShare}
                  >
                    <ButtonIcon as={Share2} />
                    <ButtonText>Compartilhar</ButtonText>
                  </Button>
                )}
              </HStack>
            </Box>
          )}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
