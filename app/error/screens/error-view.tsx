import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { VStack } from "@/components/ui/vstack";
import { ENV } from "@/config/env";
import { setIsOnErrorPage } from "@/config/navigationState";
import { useSession } from "@/contexts/Authentication";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { Linking, Platform } from "react-native";

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

  useEffect(() => {
    setIsOnErrorPage(true);
    return () => setIsOnErrorPage(false);
  }, []);

  const errorDetails = useMemo<ErrorDetails>(() => {
    try {
      if (params.error && typeof params.error === "string") {
        return JSON.parse(decodeURIComponent(params.error));
      }
    } catch {
      return {};
    }
    return {};
  }, [params.error]);

  const handleRetry = () => router.back();

  const handleReportError = async () => {
    // ✅ Usando ENV.PHONE_NUMBER ao invés de process.env
    const phoneNumber = ENV.PHONE_NUMBER;

    const message = encodeURIComponent(
      `🚨 Relatório de erro\n\nUsuário: ${profile?.name}\nE-mail: ${profile?.email}\nPlataforma: ${Platform.OS}\nCódigo: ${errorDetails.code}\nMensagem: ${errorDetails.message}`,
    );
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    await Linking.openURL(url);
  };

  // ✅ Usando ENV.URL_APP ao invés de process.env
  const handleOpenWeb = () => Linking.openURL(ENV.URL_APP);

  const friendlyMsg = (() => {
    switch (errorDetails.code) {
      case "NETWORK_ERROR":
        return "Parece que você está sem conexão com a internet.";
      case "TIMEOUT":
        return "A conexão demorou demais para responder.";
      case "500":
        return "Estamos enfrentando um problema no servidor.";
      default:
        return "Algo inesperado aconteceu. Tente novamente.";
    }
  })();

  const getIcon = () => {
    switch (errorDetails.code) {
      case "NETWORK_ERROR":
        return "wifi";
      case "TIMEOUT":
        return "clock-o";
      default:
        return "exclamation-circle";
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950 justify-center items-center px-6">
      <VStack space="lg" className="w-full max-w-[340px] items-center">
        {/* Ícone de erro grande */}
        <FontAwesome
          name={getIcon()}
          size={64}
          color="#EF4444"
          style={{ marginBottom: 8 }}
        />

        {/* Mensagem principal */}
        <Text
          size="xl"
          className="font-bold text-gray-900 dark:text-white text-center"
        >
          Ops! Algo deu errado.
        </Text>

        {/* Mensagem amigável */}
        <Text
          size="md"
          className="text-center text-gray-600 dark:text-gray-400 leading-5"
        >
          {friendlyMsg}
        </Text>

        {/* Detalhes técnicos opcionais */}
        {errorDetails.code && (
          <View className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2 mt-2">
            <Text
              size="sm"
              className="text-gray-500 dark:text-gray-300 text-center"
            >
              Código do erro: {errorDetails.code}
            </Text>
          </View>
        )}

        {/* Botões de ação */}
        <VStack space="sm" className="w-full mt-4">
          <Button size="lg" action="primary" onPress={handleRetry}>
            <ButtonText>Tentar Novamente</ButtonText>
          </Button>

          <Button size="lg" action="positive" onPress={handleReportError}>
            <ButtonIcon
              as={() => <FontAwesome name="whatsapp" size={20} color="white" />}
            />
            <ButtonText className="text-white">Reportar Erro</ButtonText>
          </Button>
        </VStack>

        {/* Mensagem adicional */}
        <Text
          size="lg"
          className="text-center text-gray-500 dark:text-gray-400 mt-3"
        >
          Caso o erro persista, acesse a versão web{" "}
          <Text
            className="text-blue-600 dark:text-blue-400 underline"
            onPress={handleOpenWeb}
          >
            clicando aqui
          </Text>
          .
        </Text>

        {/* Logo no rodapé */}
        <View className="mt-8 opacity-80">
          <Image
            source={require("@/assets/images/jf_logo_full.png")}
            alt="logo"
            resizeMode="contain"
            className="w-[180px] h-[100px]"
          />
        </View>
      </VStack>
    </View>
  );
};

export default ErrorScreen;
