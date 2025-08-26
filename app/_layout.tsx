import "@/global.css";
import { useContext, useEffect, useState, useRef } from "react";
import { Slot, useRouter, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { StatusBar } from "expo-status-bar";
import { ThemeContext, ThemeProvider } from "@/contexts/theme-context";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { SessionProvider } from "@/contexts/Authentication";
import { LocaleConfig } from "react-native-calendars";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import {
  View,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  SafeAreaView,
} from "react-native";
import { Image } from "@/components/ui/image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function IntegratedNotificationHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const hasProcessedInitial = useRef(false);

  const safeNavigate = (path: string, delay: number = 300) => {
    setTimeout(() => {
      try {
        if (pathname !== undefined) {
          router.replace(path as any);
        } else {
          if (delay < 3000) {
            safeNavigate(path, delay + 300);
          }
        }
      } catch (error) {
        throw error;
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
        return;
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
        throw error;
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
  }, []); // Sem dependências para executar apenas uma vez

  return null;
}

interface AnimatedSplashScreenProps {
  onFinish: () => void;
}

// Previne que a splash screen nativa desapareça automaticamente
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error, executionInfo }) => {}
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

// Componente da Splash Screen Animada
const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onFinish,
}) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    const startAnimation = async () => {
      await SplashScreen.hideAsync();

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            onFinish();
          });
        }, 1500);
      });
    };

    startAnimation();
  }, []);

  return (
    <View style={styles.splashContainer}>
      <StatusBar style="light" backgroundColor="#000000" translucent />

      <Animated.View
        style={[
          styles.splashContent,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
            paddingLeft: Math.max(insets.left, 28),
            paddingRight: Math.max(insets.right, 28),
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/jf_logo_full.png")}
            alt="logo"
            contentFit="contain"
            style={styles.logoImage}
          />
        </View>

        <Text style={styles.loadingText}>Carregando...</Text>

        <Animated.View
          style={[
            styles.loadingDot,
            {
              opacity: fadeAnim,
            },
          ]}
        />
      </Animated.View>
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
      // Delay maior para garantir que tudo está carregado
      setTimeout(() => {
        setAppReady(true);
      }, 800); // Aumentei para 800ms
    }
  }, [fontsLoaded]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (!appReady || showSplash) {
    return <AnimatedSplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <NotificationProvider>
      <GluestackUIProvider mode={colorMode}>
        <SessionProvider>
          <StatusBar translucent />
          <Slot />
          <IntegratedNotificationHandler />
        </SessionProvider>
      </GluestackUIProvider>
    </NotificationProvider>
  );
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MainLayout />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  splashContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 80,
  },
  logoImage: {
    width: Math.min(Dimensions.get("window").width * 0.8, 400),
    height: Math.min(Dimensions.get("window").height * 0.25, 200),
    maxWidth: 400,
    maxHeight: 200,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 30,
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "Roboto",
      },
    }),
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    opacity: 0.7,
  },
});
