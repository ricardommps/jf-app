import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { createContext, PropsWithChildren, useContext, useEffect } from "react";
import { useStorageState } from "./useStorageState";
import { ProfileType, UserType } from "@/types/ProfileType";
import { removeAccessToken, setAccessToken } from "@/utils/token";
import * as SecureStore from "expo-secure-store";
import axiosInstance from "@/config/axios";
import { registerLogoutCallback } from "@/auth/authEvents";

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
  session: SessionData | null;
  isLoading: boolean;
  getProfile: () => ProfileType | null;
  login: (props: LoginProps) => Promise<any>;
};

const AuthContext = createContext<AuthType>({
  signOut: () => null,
  session: null,
  isLoading: false,
  getProfile: () => null,
  login: () => Promise.resolve(null),
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

  const signOut = () => {
    setSessionStr(null);
    removeAccessToken();
    router.replace("/(auth)");
  };

  useEffect(() => {
    registerLogoutCallback(signOut);
  }, []);

  const login = async ({ cpf, password }: LoginProps): Promise<any> => {
    try {
      const { data } = await axiosInstance.post<LoginResponseApi>(
        "/api/v2/auth/login-customer",
        {
          cpf,
          password,
        }
      );
      await setAccessToken(data.accessToken);
      const sessionData: SessionData = {
        accessToken: data.accessToken,
        user: data.user,
      };
      const sessionString = JSON.stringify(sessionData);
      await SecureStore.setItemAsync("session", sessionString);
      setSessionStr(sessionString);

      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const getProfile = () => (session ? { user: session.user } : null);

  return (
    <AuthContext.Provider
      value={{
        signOut,
        session,
        isLoading,
        getProfile,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
