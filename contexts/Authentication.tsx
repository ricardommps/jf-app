// Authentication.tsx - Context atualizado com as mesmas chaves

import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { createContext, PropsWithChildren, useContext, useEffect } from "react";
import { useStorageState } from "./useStorageState";
import { ProfileType, UserType } from "@/types/ProfileType";
import { removeAccessToken, setAccessToken } from "@/utils/token";
import * as SecureStore from "expo-secure-store";
import axiosInstance from "@/config/axios";
import { registerLogoutCallback } from "@/auth/authEvents";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

interface LoginResponseApi {
  accessToken: string;
  user: UserType;
}

interface LoginProps {
  cpf: string;
  password: string;
}

type SessionData = {
  accessToken: string;
  user: UserType;
};

type AuthType = {
  signOut: () => void;
  signOutResetPassword: () => void;
  session: SessionData | null;
  isLoading: boolean;
  getProfile: () => ProfileType | null;
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
  const value = useContext(AuthContext);

  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
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

// Função para registrar o Push Token
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

// Chaves padronizadas (mesmas do LoginScreen)
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
      removeAccessToken();

      router.replace("/(auth)");
    } catch (error) {
      console.error("Erro no signOut:", error);
      router.replace("/(auth)");
    }
  };

  const signOutResetPassword = async () => {
    setSessionStr(null);
    removeAccessToken();
    await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_CPF_KEY);
  };

  useEffect(() => {
    registerLogoutCallback(signOut);
  }, []);

  // Login tradicional com API e salvar sessão + biometria
  const login = async ({ cpf, password }: LoginProps): Promise<UserType> => {
    try {
      const pushToken = await registerPushToken();
      const { data } = await axiosInstance.post<LoginResponseApi>(
        "/api/v2/auth/login-customer",
        {
          cpf,
          password,
          ...(pushToken && { pushToken }),
        }
      );

      if (typeof data.accessToken !== "string") {
        throw new Error("Token recebido do backend não é uma string válida");
      }

      await setAccessToken(data.accessToken);

      const sessionData: SessionData = {
        accessToken: data.accessToken,
        user: data.user,
      };

      const sessionString = JSON.stringify(sessionData);
      await SecureStore.setItemAsync("session", sessionString);
      setSessionStr(sessionString);

      // Salva token e cpf para login biométrico futuro
      await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, data.accessToken);
      await SecureStore.setItemAsync(BIOMETRIC_CPF_KEY, cpf);

      return data.user;
    } catch (error) {
      throw error;
    }
  };

  // Login via biometria: valida token salvo e restaura sessão
  const loginWithBiometrics = async (): Promise<UserType | null> => {
    try {
      // Recupera token e cpf salvos
      const storedToken = await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
      const storedCpf = await SecureStore.getItemAsync(BIOMETRIC_CPF_KEY);

      if (!storedToken || !storedCpf) {
        console.warn("Credenciais biométricas não encontradas");
        return null;
      }
      // Busca usuário com token salvo para validar se ainda é válido
      const user = await fetchUserProfileWithToken(storedToken);
      if (user) {
        // Token válido, restaura sessão
        const sessionData: SessionData = {
          accessToken: storedToken,
          user,
        };

        const sessionString = JSON.stringify(sessionData);
        await SecureStore.setItemAsync("session", sessionString);
        setSessionStr(sessionString);
        await setAccessToken(storedToken);

        return user;
      } else {
        // Token inválido, limpa credenciais
        await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
        await SecureStore.deleteItemAsync(BIOMETRIC_CPF_KEY);
        return null;
      }
    } catch (error) {
      // Em caso de erro, limpa credenciais para evitar loops
      await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_CPF_KEY);
      return null;
    }
  };

  // Função para buscar perfil do usuário no backend usando token salvo
  async function fetchUserProfileWithToken(
    token: string
  ): Promise<UserType | null> {
    try {
      // Temporariamente define o token no axios para fazer a requisição
      const originalAuth =
        axiosInstance.defaults.headers.common["Authorization"];
      axiosInstance.defaults.headers.common["Authorization"] = `${token}`;
      const { data } = await axiosInstance.get<{ user: UserType }>(
        "/api/v2/auth/login-biometrics"
      );
      // Restaura o header original
      if (originalAuth) {
        axiosInstance.defaults.headers.common["Authorization"] = originalAuth;
      } else {
        delete axiosInstance.defaults.headers.common["Authorization"];
      }

      return data.user;
    } catch (error) {
      // Restaura o header original em caso de erro
      delete axiosInstance.defaults.headers.common["Authorization"];
      console.error("Erro ao validar token biométrico:", error);
      return null;
    }
  }

  // Atualiza perfil local e opcionalmente no backend
  const updateProfile = async (
    updatedUser: Partial<UserType>
  ): Promise<void> => {
    try {
      if (!session) {
        throw new Error("Usuário não autenticado");
      }

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

      // Atualizar backend se necessário
      // await axiosInstance.put("/api/v2/user/profile", updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    }
  };

  const getProfile = () => (session ? { user: session.user } : null);

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
