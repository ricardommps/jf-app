import React, { useRef, useState } from "react";
import { View, ImageBackground, Alert } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Icon } from "@/components/ui/icon";
import { Clock10Icon, FootprintsIcon, RouteIcon } from "lucide-react-native";
import {
  convertMetersToKilometersFormat,
  convertPaceToSpeed,
  convertSecondsToHourMinuteFormat,
} from "@/utils/convertValues";
import { RpeDisplay } from "@/components/rpe-display";

export default function CongratulationScreen() {
  const router = useRouter();
  const { distanceInMeters, durationInSeconds, paceInSeconds, rpe } =
    useLocalSearchParams();
  const shareViewRef = useRef(null);
  const [showButtons, setShowButtons] = useState(true);

  function handleNavigate() {
    router.replace("/(tabs)/(home)");
  }

  async function handleShare() {
    try {
      // Esconde os botões
      setShowButtons(false);

      // Espera a UI atualizar antes de capturar (150ms funciona bem na maioria dos casos)
      await new Promise((resolve) => setTimeout(resolve, 150));

      const uri = await captureRef(shareViewRef, {
        format: "png",
        quality: 1,
      });

      // Volta a mostrar os botões
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
      setShowButtons(true); // garante que volte se erro acontecer
    }
  }

  return (
    <View className="flex-1" ref={shareViewRef} collapsable={false}>
      <ImageBackground
        source={require("@/assets/images/foltz_tela.png")}
        resizeMode="cover"
        className="flex-1 p-2"
      >
        <SafeAreaView className="flex-1 px-7">
          {/* Botões fora da captura, só mostra se showButtons for true */}
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
                <Button
                  action="secondary"
                  size="md"
                  className="flex-1"
                  onPress={handleShare}
                >
                  <ButtonText>Compartilhar</ButtonText>
                </Button>
              </HStack>
            </Box>
          )}

          {/* View capturada */}
          <View
            className="flex-1 p-12" // p-12 pra substituir mt-[-50px]
          >
            <VStack className="flex-1 justify-center items-center">
              <Box className="mt-0">
                <Text className="text-3xl font-extrabold text-white text-center">
                  Parabéns!
                </Text>
                <Text className="text-2xl font-extrabold text-white text-center">
                  Mais um treino concluído com sucesso.
                </Text>
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
              </Box>
            </VStack>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
