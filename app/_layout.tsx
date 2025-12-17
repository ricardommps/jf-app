import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Image } from "@/components/ui/image";
import { SessionProvider } from "@/contexts/Authentication";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeContext, ThemeProvider } from "@/contexts/theme-context";
import "@/global.css";
import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Slot, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as TaskManager from "expo-task-manager";
import * as Updates from "expo-updates";
import { useContext, useEffect, useRef, useState } from "react";
import { Dimensions, Modal, StyleSheet, Text, View } from "react-native";
import { LocaleConfig } from "react-native-calendars";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Button, ButtonText } from "@/components/ui/button";
import {
  Baloo2_400Regular,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from "@expo-google-fonts/baloo-2";

Sentry.init({
  dsn: "https://27e9f134adac50771e411adb586a9183@o585732.ingest.us.sentry.io/4510285316292608",
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

  const handleNotificationData = (data: any) => {
    if (!data) return;
    if (data.url && typeof data.url === "string") {
      const url = data.url;
      const prefix = "jfapp://";
      if (url.startsWith(prefix)) {
        const path = url.slice(prefix.length);
        safeNavigate(`/${path}` as any);
      }
    }
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
            lastNotification.notification.request.content.data
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
      }
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
      setTimeout(() => onFinish(), 2000);
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
          paddingLeft: insets.left + 28,
          paddingRight: insets.right + 28,
        },
      ]}
    >
      <StatusBar style="light" backgroundColor="#000000" translucent={false} />
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/jf_logo_full.png")}
          alt="logo"
          resizeMode="contain"
          style={styles.logoImage}
        />
      </View>
      <Text style={styles.loadingText}>Carregando...</Text>
      <View style={styles.loadingDot} />
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
  const [updateVisible, setUpdateVisible] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      setTimeout(() => setAppReady(true), 500);
    }
  }, [fontsLoaded]);

  const handleSplashFinish = () => setShowSplash(false);

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) setUpdateVisible(true);
      } catch (error) {
        console.error("Erro ao checar atualização:", error);
      }
    };
    if (appReady && !showSplash) checkUpdate();
  }, [appReady, showSplash]);

  const handleUpdateNow = async () => {
    setUpdateVisible(false);
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  if (!appReady || showSplash) {
    return <SplashScreenView onFinish={handleSplashFinish} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      <GluestackUIProvider mode={colorMode}>
        <NotificationProvider>
          <SessionProvider>
            <StatusBar
              style="light"
              translucent={false}
              backgroundColor="#000000"
            />
            <Slot />
            <IntegratedNotificationHandler />

            <Modal transparent visible={updateVisible} animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Nova versão disponível!</Text>
                  <Text style={styles.modalMessage}>
                    Uma atualização do app está disponível. Por favor, atualize
                    para continuar usando.
                  </Text>
                  <Button onPress={handleUpdateNow} size="xl" className="mb-5">
                    <ButtonText>Atualizar agora</ButtonText>
                  </Button>

                  <Button
                    onPress={() => setUpdateVisible(false)}
                    size="xl"
                    variant="outline"
                  >
                    <ButtonText>Mais tarde</ButtonText>
                  </Button>
                </View>
              </View>
            </Modal>
          </SessionProvider>
        </NotificationProvider>
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
    marginBottom: 80,
  },
  logoImage: {
    width: Math.min(Dimensions.get("window").width * 0.8, 400),
    height: Math.min(Dimensions.get("window").height * 0.25, 200),
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 30,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#1C1C1C",
    padding: 24,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#FF6B00",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonSecondary: {
    backgroundColor: "#2C2C2C",
  },
  buttonTextSecondary: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
