import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { VStack } from "@/components/ui/vstack";
import { setIsOnErrorPage } from "@/config/navigationState"; // ✅ IMPORTA A FLAG GLOBAL
import { useSession } from "@/contexts/Authentication";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { Linking, Platform } from "react-native";
import {
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

interface ErrorDetails {
  code?: string;
  message?: string;
  url?: string;
  method?: string;
}

const ErrorScreen = () => {
  const { getProfile } = useSession();
  const profile = getProfile();
  const router = useRouter();
  const params = useLocalSearchParams();
  const retryScale = useSharedValue(1);

  // ✅ Marca que está na tela de erro (evita loops)
  useEffect(() => {
    setIsOnErrorPage(true);
    return () => {
      setIsOnErrorPage(false);
    };
  }, []);

  // Parse error from URL params
  const errorDetails = useMemo<ErrorDetails>(() => {
    try {
      if (params.error && typeof params.error === "string") {
        return JSON.parse(decodeURIComponent(params.error));
      }
    } catch (e) {
      console.warn("Failed to parse error details:", e);
    }
    return {};
  }, [params.error]);

  const handleRetryPress = () => {
    retryScale.value = withSequence(
      withSpring(0.95, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );
    // Add a small delay to allow animation to complete
    setTimeout(() => {
      router.back();
    }, 200);
  };

  const handleReportError = async () => {
    try {
      const errorReport = [
        "🚨 *Relatório de Erro - Foltz App*",
        "",
        `- Nome:* ${profile?.name}`,
        `- E-mail:* ${profile?.email}`,
        "",
        `- Plataforma:* ${Platform.OS}`,
        `- Data:* ${new Date().toLocaleString("pt-BR")}`,
        "",
        "- Detalhes do Erro:*",
        `• Código: ${errorDetails.code || "N/A"}`,
        `• Mensagem: ${errorDetails.message || "N/A"}`,
        "",
        "- Requisição:*",
        `• Método: ${errorDetails.method || "N/A"}`,
        `• URL: ${errorDetails.url || "N/A"}`,
        "",
        "---",
        "Por favor, descreva o que você estava fazendo quando o erro ocorreu:",
      ].join("\n");

      const whatsappNumber = "5548991781646";
      const encodedMessage = encodeURIComponent(errorReport);
      const whatsappUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encodedMessage}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        const webWhatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        await Linking.openURL(webWhatsappUrl);
      }
    } catch (error) {
      console.error("Erro ao abrir WhatsApp:", error);
      const fallbackNumber = "5548999999999";
      const fallbackMsg = encodeURIComponent(
        "Erro ao reportar problema pelo app"
      );
      Linking.openURL(`https://wa.me/${fallbackNumber}?text=${fallbackMsg}`);
    }
  };

  const getUserFriendlyMessage = () => {
    const code = errorDetails.code;
    switch (code) {
      case "NETWORK_ERROR":
        return (
          errorDetails.message ||
          "Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
        );
      case "TIMEOUT":
        return (
          errorDetails.message ||
          "A requisição demorou muito para responder. Verifique sua conexão."
        );
      case "400":
        return "Requisição inválida. Verifique os dados e tente novamente.";
      case "404":
        return "Recurso não encontrado. O item solicitado pode não existir mais.";
      case "500":
        return "Erro interno do servidor. Estamos trabalhando para resolver isso.";
      case "502":
      case "503":
        return "Serviço temporariamente indisponível. Tente novamente em alguns instantes.";
      case "504":
        return "Tempo de resposta excedido. Verifique sua conexão e tente novamente.";
      default:
        return (
          errorDetails.message ||
          "Ocorreu um erro inesperado. Tente novamente mais tarde."
        );
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 justify-center items-center pb-12 px-6">
        <VStack space="lg" className="items-center max-w-[320px]">
          <View className="mb-4">
            <Image
              source={require("@/assets/images/jf_logo_full.png")}
              alt="logo"
              resizeMode="contain"
              className="w-[500px] h-[300px]"
            />
          </View>

          {errorDetails.code && (
            <View
              className={`px-4 py-2 rounded-full mb-2 ${
                errorDetails.code === "NETWORK_ERROR" ||
                errorDetails.code === "TIMEOUT"
                  ? "bg-orange-100 dark:bg-orange-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              }`}
            >
              <Text
                size="md"
                className={`font-bold ${
                  errorDetails.code === "NETWORK_ERROR" ||
                  errorDetails.code === "TIMEOUT"
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {errorDetails.code === "NETWORK_ERROR"
                  ? "⚠️ Sem Conexão"
                  : errorDetails.code === "TIMEOUT"
                  ? "⏱️ Timeout"
                  : `Erro ${errorDetails.code}`}
              </Text>
            </View>
          )}

          <Text
            size="lg"
            className="font-semibold text-gray-900 dark:text-white text-center mb-2"
          >
            Ops! Algo deu errado.
          </Text>

          <Text
            size="md"
            className="text-gray-600 dark:text-gray-400 text-center leading-5 mb-4"
          >
            {getUserFriendlyMessage()}
          </Text>

          <VStack space="sm" className="w-full">
            <Button onPress={handleRetryPress} size="lg" action="primary">
              <ButtonText>Tentar Novamente</ButtonText>
            </Button>

            <Button onPress={handleReportError} size="lg" action="positive">
              <ButtonIcon
                as={() => (
                  <FontAwesome name="whatsapp" size={20} color="white" />
                )}
              />
              <ButtonText className="text-white">Reportar Erro</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </View>
    </View>
  );
};

export default ErrorScreen;
