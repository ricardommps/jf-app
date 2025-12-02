import APICaller from "@/config/axios";
import globalEventEmitter from "@/utils/events";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createContext, PropsWithChildren, useContext, useEffect } from "react";
import { Platform } from "react-native";
import { useStorageState } from "./useStorageState";

import { UserType } from "@/types/ProfileType";
import { removeTokens, saveTokens } from "@/utils/token";

interface LoginResponseApi {
  accessToken: string;
  refreshToken?: string;
  user: UserType;
}

interface LoginProps {
  email: string;
  password: string;
}

type SessionData = {
  accessToken: string;
  refreshToken?: string;
  user: UserType;
};

type AuthType = {
  signOut: () => Promise<void>;
  session: SessionData | null;
  login: (props: LoginProps) => Promise<UserType>;
  isLoading: boolean;
  updateProfile: (updatedUser: Partial<UserType>) => Promise<void>;
  getProfile: () => UserType | null;
};

const AuthContext = createContext<AuthType>({
  signOut: async () => {},
  session: null,
  login: async () => Promise.resolve(null as any),
  isLoading: false,
  updateProfile: async () => {},
  getProfile: () => null,
});

export function useSession() {
  return useContext(AuthContext);
}

// --- Registrar push token ---
async function registerPushToken() {
  try {
    if (!Device.isDevice) return;

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return;

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    return token;
  } catch (error) {
    console.error("Erro ao registrar push token:", error);
    return undefined;
  }
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, sessionStr], setSessionStr] = useStorageState("session");
  const router = useRouter();

  let session: SessionData | null = null;
  try {
    session = sessionStr ? (JSON.parse(sessionStr) as SessionData) : null;
  } catch {
    console.warn("Erro ao parsear session");
  }

  useEffect(() => {
    const listener = () => {
      setSessionStr(null);
      setTimeout(() => {
        try {
          if (router.canDismiss()) {
            router.dismissAll();
          }
          router.replace("/(auth)/(login)");
        } catch (error) {
          router.push("/(auth)/(login)");
        }
      }, 0);
    };
    globalEventEmitter.on("logout", listener);
    return () => {
      globalEventEmitter.off("logout", listener);
    };
  }, [router, setSessionStr]);

  const signOut = async () => {
    try {
      // Marca que está fazendo logout ANTES de qualquer requisição
      APICaller.forceLogout();

      // Tenta fazer logout no backend, mas ignora completamente qualquer erro
      await APICaller.request("/logout", "POST").catch(() => {});
    } catch (error) {}

    await removeTokens();
    setSessionStr(null);
    globalEventEmitter.emit("logout");
  };

  const login = async ({ email, password }: LoginProps): Promise<UserType> => {
    // NOVO: Reseta o estado de logout ao fazer novo login
    APICaller.resetLogoutState();
    const pushToken = await registerPushToken();
    const data: LoginResponseApi = await APICaller.request(
      "/api/v2/auth/login-customer",
      "POST",
      { email, password, ...(pushToken && { pushToken }) }
    );
    if (!data.accessToken) throw new Error("Token inválido");

    await saveTokens(data.accessToken, data.refreshToken ?? "");
    const sessionData: SessionData = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    };
    setSessionStr(JSON.stringify(sessionData));
    await SecureStore.setItemAsync("session", JSON.stringify(sessionData));

    return data.user;
  };

  const updateProfile = async (
    updatedUser: Partial<UserType>
  ): Promise<void> => {
    if (!session) throw new Error("Usuário não autenticado");
    const updated = { ...session.user, ...updatedUser };
    const updatedSession = { ...session, user: updated };
    setSessionStr(JSON.stringify(updatedSession));
    await SecureStore.setItemAsync("session", JSON.stringify(updatedSession));
  };

  const getProfile = () => session?.user ?? null;

  return (
    <AuthContext.Provider
      value={{ signOut, session, login, isLoading, updateProfile, getProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
