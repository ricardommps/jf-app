import React, { useEffect, useState } from "react";
import { View, Text, Alert, Button, StyleSheet } from "react-native";
import * as Linking from "expo-linking";

interface SharingHandlerProps {
  onSharedLink?: (url: string, activityId?: string) => void;
}

interface ParsedUrl {
  url: string;
  activityId?: string;
  platform?: "garmin" | "strava" | "other";
}

const SharingHandler: React.FC<SharingHandlerProps> = ({ onSharedLink }) => {
  const [sharedData, setSharedData] = useState<ParsedUrl | null>(null);

  useEffect(() => {
    // Capturar URL inicial quando o app é aberto por um link
    const handleInitialURL = async (): Promise<void> => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          handleSharedLink(initialUrl);
        }
      } catch (error) {
        console.error("Erro ao capturar URL inicial:", error);
      }
    };

    // Listener para quando o app já está aberto e recebe um novo link
    const handleUrlChange = (event: { url: string }): void => {
      handleSharedLink(event.url);
    };

    // Configurar listeners
    handleInitialURL();
    const subscription = Linking.addEventListener("url", handleUrlChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleSharedLink = (url: string): void => {
    const parsedUrl = parseSharedUrl(url);
    setSharedData(parsedUrl);
    if (onSharedLink) {
      onSharedLink(parsedUrl.url, parsedUrl.activityId);
    }
    Alert.alert(
      "Link Compartilhado",
      `Platform: ${parsedUrl.platform}\nActivity ID: ${
        parsedUrl.activityId || "N/A"
      }\nURL: ${parsedUrl.url}`
    );
  };

  const parseSharedUrl = (url: string): ParsedUrl => {
    const result: ParsedUrl = { url };

    // Garmin Connect
    if (url.includes("connect.garmin.com")) {
      result.platform = "garmin";
      const activityMatch = url.match(/\/activity\/(\d+)/);
      if (activityMatch) {
        result.activityId = activityMatch[1];
      }
    }
    // Strava
    else if (url.includes("strava.com")) {
      result.platform = "strava";
      const activityMatch = url.match(/\/activities\/(\d+)/);
      if (activityMatch) {
        result.activityId = activityMatch[1];
      }
    }
    // Outros
    else {
      result.platform = "other";
    }

    return result;
  };

  const testSharing = (): void => {
    // Simular um link compartilhado para teste
    const testUrl = "https://connect.garmin.com/modern/activity/123456789";
    handleSharedLink(testUrl);
  };

  const testStravaSharing = (): void => {
    // Simular um link do Strava para teste
    const testUrl = "https://www.strava.com/activities/987654321";
    handleSharedLink(testUrl);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JF App - Compartilhamento</Text>

      {sharedData && (
        <View style={styles.sharedDataContainer}>
          <Text style={styles.label}>Link Compartilhado:</Text>
          <Text style={styles.platform}>Plataforma: {sharedData.platform}</Text>
          {sharedData.activityId && (
            <Text style={styles.activityId}>
              Activity ID: {sharedData.activityId}
            </Text>
          )}
          <Text style={styles.url} numberOfLines={3}>
            {sharedData.url}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Testar Garmin" onPress={testSharing} />
        <Button title="Testar Strava" onPress={testStravaSharing} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
  },
  sharedDataContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    width: "100%",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
  },
  platform: {
    marginBottom: 5,
    fontSize: 14,
    color: "#666",
  },
  activityId: {
    marginBottom: 5,
    fontSize: 14,
    color: "#666",
  },
  url: {
    textAlign: "center",
    fontSize: 12,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
});

export default SharingHandler;
