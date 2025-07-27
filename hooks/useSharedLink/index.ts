import { useEffect, useState, useCallback } from "react";
import * as Linking from "expo-linking";

interface ParsedLink {
  url: string;
  activityId?: string;
  platform: "garmin" | "strava" | "other";
}

interface UseSharedLinkOptions {
  onLinkReceived?: (parsedLink: ParsedLink) => void;
  autoProcess?: boolean;
}

interface UseSharedLinkReturn {
  sharedLink: ParsedLink | null;
  isProcessing: boolean;
  clearSharedLink: () => void;
  processLink: (url: string) => ParsedLink;
}

export const useSharedLink = (
  options: UseSharedLinkOptions = {}
): UseSharedLinkReturn => {
  const { onLinkReceived, autoProcess = true } = options;
  const [sharedLink, setSharedLink] = useState<ParsedLink | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processLink = useCallback((url: string): ParsedLink => {
    const parsedLink: ParsedLink = {
      url,
      platform: "other",
    };

    // Garmin Connect
    if (url.includes("connect.garmin.com")) {
      parsedLink.platform = "garmin";
      const activityMatch = url.match(/\/activity\/(\d+)/);
      if (activityMatch) {
        parsedLink.activityId = activityMatch[1];
      }
    }
    // Strava
    else if (url.includes("strava.com")) {
      parsedLink.platform = "strava";
      const activityMatch = url.match(/\/activities\/(\d+)/);
      if (activityMatch) {
        parsedLink.activityId = activityMatch[1];
      }
    }

    return parsedLink;
  }, []);

  const handleSharedLink = useCallback(
    (url: string): void => {
      // Ignora links inválidos
      if (
        !url ||
        (!url.includes("connect.garmin.com") && !url.includes("strava.com"))
      ) {
        return;
      }

      setIsProcessing(true);

      try {
        const parsedLink = processLink(url);
        setSharedLink(parsedLink);

        if (onLinkReceived) {
          onLinkReceived(parsedLink);
        }
      } catch (error) {
        console.error("Erro ao processar link compartilhado:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [processLink, onLinkReceived]
  );

  const clearSharedLink = useCallback((): void => {
    setSharedLink(null);
  }, []);

  useEffect(() => {
    if (!autoProcess) return;

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
  }, [autoProcess, handleSharedLink]);

  return {
    sharedLink,
    isProcessing,
    clearSharedLink,
    processLink,
  };
};
