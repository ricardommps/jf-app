import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  access_denied: {
    title: "Acesso negado",
    description:
      "Você recusou a conexão com o Strava. Para sincronizar suas atividades, precisamos da sua autorização.",
  },
  token_exchange_failed: {
    title: "Falha na conexão",
    description:
      "Não foi possível concluir a autenticação com o Strava. Tente novamente em alguns instantes.",
  },
  default: {
    title: "Algo deu errado",
    description:
      "Ocorreu um erro inesperado ao conectar com o Strava. Por favor, tente novamente.",
  },
};

export default function StravaError() {
  const router = useRouter();
  const { reason } = useLocalSearchParams<{ reason: string }>();

  useEffect(() => {
    WebBrowser.dismissBrowser();
  }, []);

  const error = ERROR_MESSAGES[reason ?? ""] ?? ERROR_MESSAGES.default;

  const handleRetry = () => {
    router.replace("/stravaConnect/" as any);
  };

  const handleCancel = () => {
    router.replace("/" as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⚠️</Text>
      </View>

      <Text style={styles.title}>{error.title}</Text>
      <Text style={styles.description}>{error.description}</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={handleRetry}>
        <Text style={styles.primaryButtonText}>Tentar novamente</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel}>
        <Text style={styles.secondaryButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#fff",
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: "#FC4C02", // Strava orange
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#888",
    fontSize: 15,
  },
});
