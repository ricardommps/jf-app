// Authentication.tsx

import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { createContext, PropsWithChildren, useContext, useEffect } from "react";
import { useStorageState } from "./useStorageState";
import { UserType } from "@/types/ProfileType";
import { removeTokens, saveTokens } from "@/utils/token";
import * as SecureStore from "expo-secure-store";
import axiosInstance from "@/config/axios";
import { registerLogoutCallback } from "@/auth/authEvents";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

interface LoginResponseApi {
  accessToken: string;
  refreshToken?: string; // caso backend retorne
  user: UserType;
}

interface LoginProps {
  cpf: string;
  password: string;
}

type SessionData = {
  accessToken: string;
  refreshToken?: string;
  user: UserType;
};

type AuthType = {
  signOut: () => void;
  signOutResetPassword: () => void;
  session: SessionData | null;
  isLoading: boolean;
  getProfile: () => UserType | null;
  login: (props: LoginProps) => Promise<UserType>;
  updateProfile: (updatedUser: Partial<UserType>) => Promise<void>;
  loginWithBiometrics: () => Promise<UserType | null>;
};

const AuthContext = createContext<AuthType>({
  signOut: () => null,
  signOutResetPassword: () => null,
  session: null,
  isLoading: false,
  getProfile: () => null,
  login: () => Promise.resolve(null as any),
  updateProfile: () => Promise.resolve(),
  loginWithBiometrics: async () => null,
});

export function useSession() {
  return useContext(AuthContext);
}

function useProtectedRoute(session: SessionData | null) {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";
    if (!session && !inAuthGroup) {
      router.replace("/(auth)");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)/(home)");
    }
  }, [session, segments, navigationState]);
}

// Função para registrar push token
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
    throw error;
  }
}

const BIOMETRIC_TOKEN_KEY = "biometric_access_token";
const BIOMETRIC_CPF_KEY = "biometric_cpf";

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, sessionStr], setSessionStr] = useStorageState("session");
  const router = useRouter();

  let session: SessionData | null = null;
  try {
    session = sessionStr ? (JSON.parse(sessionStr) as SessionData) : null;
  } catch (error) {
    console.warn("Erro ao parsear session:", error);
  }

  useProtectedRoute(session);

  const signOut = async () => {
    try {
      setSessionStr(null);
      await removeTokens();
      router.replace("/(auth)");
    } catch (error) {
      console.error("Erro no signOut:", error);
      router.replace("/(auth)");
    }
  };

  const signOutResetPassword = async () => {
    setSessionStr(null);
    await removeTokens();
    await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_CPF_KEY);
  };

  useEffect(() => {
    registerLogoutCallback(signOut);
  }, []);

  // Login tradicional
  const login = async ({ cpf, password }: LoginProps): Promise<UserType> => {
    try {
      const pushToken = await registerPushToken();
      const { data } = await axiosInstance.post<LoginResponseApi>(
        "/api/v2/auth/login-customer",
        { cpf, password, ...(pushToken && { pushToken }) }
      );

      if (!data.accessToken) {
        throw new Error("Token recebido inválido");
      }

      // salva no SecureStore e headers
      await saveTokens(data.accessToken, data.refreshToken ?? "");

      const sessionData: SessionData = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      };

      const sessionString = JSON.stringify(sessionData);
      await SecureStore.setItemAsync("session", sessionString);
      setSessionStr(sessionString);

      // para biometria
      await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, data.accessToken);
      await SecureStore.setItemAsync(BIOMETRIC_CPF_KEY, cpf);

      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const loginWithBiometrics = async (): Promise<UserType | null> => {
    try {
      const storedToken = await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
      const storedCpf = await SecureStore.getItemAsync(BIOMETRIC_CPF_KEY);

      if (!storedToken || !storedCpf) {
        return null;
      }

      const user = await fetchUserProfileWithToken(storedToken);
      if (user) {
        const sessionData: SessionData = {
          accessToken: storedToken,
          user,
        };

        const sessionString = JSON.stringify(sessionData);
        await SecureStore.setItemAsync("session", sessionString);
        setSessionStr(sessionString);
        await saveTokens(storedToken, "");

        return user;
      } else {
        await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
        await SecureStore.deleteItemAsync(BIOMETRIC_CPF_KEY);
        return null;
      }
    } catch {
      await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_CPF_KEY);
      return null;
    }
  };

  async function fetchUserProfileWithToken(
    token: string
  ): Promise<UserType | null> {
    try {
      const originalAuth =
        axiosInstance.defaults.headers.common["Authorization"];
      axiosInstance.defaults.headers.common["Authorization"] = `${token}`;

      const { data } = await axiosInstance.get<{ user: UserType }>(
        "/api/v2/auth/login-biometrics"
      );

      if (originalAuth) {
        axiosInstance.defaults.headers.common["Authorization"] = originalAuth;
      } else {
        delete axiosInstance.defaults.headers.common["Authorization"];
      }

      return data.user;
    } catch (error) {
      delete axiosInstance.defaults.headers.common["Authorization"];
      return null;
    }
  }

  const updateProfile = async (
    updatedUser: Partial<UserType>
  ): Promise<void> => {
    if (!session) throw new Error("Usuário não autenticado");

    const updatedUserData: UserType = {
      ...session.user,
      ...updatedUser,
    };

    const updatedSessionData: SessionData = {
      ...session,
      user: updatedUserData,
    };

    const sessionString = JSON.stringify(updatedSessionData);
    await SecureStore.setItemAsync("session", sessionString);
    setSessionStr(sessionString);
  };

  const getProfile = () => (session ? session.user : null);

  return (
    <AuthContext.Provider
      value={{
        signOut,
        signOutResetPassword,
        session,
        isLoading,
        getProfile,
        login,
        updateProfile,
        loginWithBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
