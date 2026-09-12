import { LoadingOverlayProvider } from "@/components/shared/loading";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Image } from "@/components/ui/image";
import { ENV } from "@/config/env";
import { SessionProvider } from "@/contexts/Authentication";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeContext, ThemeProvider } from "@/contexts/theme-context";
import "@/global.css";
import {
  fetchAppVersionStatus,
  type AppVersionStatus,
} from "@/services/app-version.service";
import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Baloo2_400Regular,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from "@expo-google-fonts/baloo-2";
import { Audio } from "expo-av";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Slot, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as TaskManager from "expo-task-manager";
import * as Updates from "expo-updates";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LocaleConfig } from "react-native-calendars";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

Sentry.init({
  dsn: ENV.SENTRY_DSN,
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],
});

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {});
Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

function IntegratedNotificationHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const hasProcessedInitial = useRef(false);

  const safeNavigate = (path: string, delay: number = 300) => {
    setTimeout(() => {
      try {
        if (pathname !== undefined) {
          router.replace(path as any);
        } else if (delay < 3000) {
          safeNavigate(path, delay + 300);
        }
      } catch (error) {
        console.error("Navigation error:", error);
      }
    }, delay);
  };

  const handleNotificationData = (_data: any) => {
    safeNavigate("/(tabs)/(home)");
  };

  useEffect(() => {
    const checkInitialNotification = async () => {
      if (hasProcessedInitial.current) return;
      hasProcessedInitial.current = true;

      try {
        const lastNotification =
          await Notifications.getLastNotificationResponseAsync();
        if (lastNotification?.notification?.request?.content?.data) {
          handleNotificationData(
            lastNotification.notification.request.content.data,
          );
        }
      } catch (error) {
        console.error("Notification error:", error);
      }
    };

    const timer = setTimeout(checkInitialNotification, 2000);
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleNotificationData(response.notification.request.content.data);
      },
    );

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  return null;
}

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreenView: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const start = async () => {
      await SplashScreen.hideAsync();
      setTimeout(() => onFinish(), 6000);
    };
    start();
  }, []);

  return (
    <View
      style={[
        styles.splashContainer,
        {
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
        },
      ]}
    >
      <StatusBar style="light" backgroundColor="#000000" translucent={false} />
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/logo_inicial.png")}
          alt="logo"
          size="none"
          resizeMode="contain"
          style={styles.logoImage}
        />
      </View>
    </View>
  );
};

const MainLayout = () => {
  LocaleConfig.locales["pt-br"] = {
    monthNames: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
    monthNamesShort: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    dayNames: [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ],
    dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    today: "Hoje",
  };
  LocaleConfig.defaultLocale = "pt-br";

  const { colorMode }: any = useContext(ThemeContext);
  const [fontsLoaded] = useFonts({
    "baloo-regular": Baloo2_400Regular,
    "baloo-semibold": Baloo2_600SemiBold,
    "baloo-bold": Baloo2_700Bold,
    "baloo-extrabold": Baloo2_800ExtraBold,
  });
  const [appReady, setAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [forceUpdateStatus, setForceUpdateStatus] =
    useState<AppVersionStatus | null>(null);
  const [isOpeningStore, setIsOpeningStore] = useState(false);
  const startupChecksExecutedRef = useRef(false);

  useEffect(() => {
    if (fontsLoaded) {
      setTimeout(() => setAppReady(true), 500);
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!appReady || showSplash || startupChecksExecutedRef.current) {
      return;
    }

    startupChecksExecutedRef.current = true;
    let isMounted = true;

    const runStartupChecks = async () => {
      try {
        if (ENV.isProd) {
          try {
            const update = await Updates.checkForUpdateAsync();

            if (update.isAvailable) {
              await Updates.fetchUpdateAsync();

              setTimeout(() => {
                Updates.reloadAsync();
              }, 800);
              return;
            }
          } catch (error) {
            console.error("Erro no OTA automático:", error);
          }
        }

        try {
          const status = await fetchAppVersionStatus();

          if (isMounted && status?.forceUpdate) {
            setForceUpdateStatus(status);
          }
        } catch (error) {
          console.error("Erro ao verificar versao minima do app:", error);
        }
      } catch (error) {
        console.error("Erro ao executar checagens iniciais:", error);
      }
    };

    runStartupChecks();

    return () => {
      isMounted = false;
    };
  }, [appReady, showSplash]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
    });
  }, []);

  useEffect(() => {
    if (!forceUpdateStatus) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );

    return () => subscription.remove();
  }, [forceUpdateStatus]);

  const handleSplashFinish = () => setShowSplash(false);

  const handleOpenStore = async () => {
    if (!forceUpdateStatus?.storeUrl || isOpeningStore) {
      return;
    }

    try {
      setIsOpeningStore(true);
      await Linking.openURL(forceUpdateStatus.storeUrl);
    } catch (error) {
      console.error("Erro ao abrir loja do app:", error);
    } finally {
      setIsOpeningStore(false);
    }
  };

  const currentVersionLabel = forceUpdateStatus
    ? [
        forceUpdateStatus.currentVersion
          ? `Versão atual ${forceUpdateStatus.currentVersion}`
          : null,
        forceUpdateStatus.currentBuild
          ? `build ${forceUpdateStatus.currentBuild}`
          : null,
      ]
        .filter(Boolean)
        .join(" • ")
    : "";

  const minimumVersionLabel = forceUpdateStatus
    ? [
        forceUpdateStatus.latestVersion || forceUpdateStatus.minimumVersion
          ? `Versão requerida ${
              forceUpdateStatus.latestVersion ||
              forceUpdateStatus.minimumVersion
            }`
          : null,
        forceUpdateStatus.minimumBuild
          ? `build ${forceUpdateStatus.minimumBuild}`
          : null,
      ]
        .filter(Boolean)
        .join(" • ")
    : "";

  if (!appReady || showSplash) {
    return <SplashScreenView onFinish={handleSplashFinish} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      <GluestackUIProvider mode={colorMode}>
        <LoadingOverlayProvider>
          <NotificationProvider>
            <SessionProvider>
              <StatusBar
                style="light"
                translucent={false}
                backgroundColor="#000000"
              />
              <Slot />
              <IntegratedNotificationHandler />
              {forceUpdateStatus ? (
                <View style={styles.forceUpdateOverlay}>
                  <View style={styles.forceUpdateCard}>
                    <Text style={styles.forceUpdateTitle}>
                      {forceUpdateStatus.title}
                    </Text>
                    <Text style={styles.forceUpdateMessage}>
                      {forceUpdateStatus.message}
                    </Text>

                    {currentVersionLabel ? (
                      <Text style={styles.forceUpdateMetaText}>
                        {currentVersionLabel}
                      </Text>
                    ) : null}

                    {minimumVersionLabel ? (
                      <Text style={styles.forceUpdateMetaTextStrong}>
                        {minimumVersionLabel}
                      </Text>
                    ) : null}

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={handleOpenStore}
                      disabled={!forceUpdateStatus.storeUrl || isOpeningStore}
                      style={[
                        styles.forceUpdateButton,
                        !forceUpdateStatus.storeUrl &&
                          styles.forceUpdateButtonDisabled,
                      ]}
                    >
                      {isOpeningStore ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.forceUpdateButtonText}>
                          Atualizar agora
                        </Text>
                      )}
                    </TouchableOpacity>

                    {!forceUpdateStatus.storeUrl ? (
                      <Text style={styles.forceUpdateSupportText}>
                        Link da loja não configurado. Defina APP_STORE_URL_
                        {forceUpdateStatus.platform.toUpperCase()} na API.
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </SessionProvider>
          </NotificationProvider>
        </LoadingOverlayProvider>
      </GluestackUIProvider>
    </SafeAreaView>
  );
};

export default Sentry.wrap(function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MainLayout />
      </ThemeProvider>
    </QueryClientProvider>
  );
});

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoImage: {
    width: Math.min(Dimensions.get("window").width * 1.18, 640),
    height: Math.min(Dimensions.get("window").height * 0.5, 380),
  },
  forceUpdateOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 999,
    elevation: 999,
  },
  forceUpdateCard: {
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 22,
  },
  forceUpdateTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  forceUpdateMessage: {
    color: "#D4D4D8",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 18,
  },
  forceUpdateMetaText: {
    color: "#A1A1AA",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 6,
  },
  forceUpdateMetaTextStrong: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },
  forceUpdateButton: {
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: "#FF6B00",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  forceUpdateButtonDisabled: {
    opacity: 0.45,
  },
  forceUpdateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  forceUpdateSupportText: {
    color: "#A1A1AA",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 16,
  },
});
