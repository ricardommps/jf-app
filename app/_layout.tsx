import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Image } from "@/components/ui/image";
import { SessionProvider } from "@/contexts/Authentication";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeContext, ThemeProvider } from "@/contexts/theme-context";
import "@/global.css";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Slot, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as TaskManager from "expo-task-manager";
import { useContext, useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { LocaleConfig } from "react-native-calendars";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

Sentry.init({
  dsn: "https://27e9f134adac50771e411adb586a9183@o585732.ingest.us.sentry.io/4510285316292608",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
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
    "dm-sans-regular": DMSans_400Regular,
    "dm-sans-medium": DMSans_500Medium,
    "dm-sans-bold": DMSans_700Bold,
  });

  const [appReady, setAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded) {
      setTimeout(() => setAppReady(true), 500);
    }
  }, [fontsLoaded]);

  const handleSplashFinish = () => setShowSplash(false);

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
});
