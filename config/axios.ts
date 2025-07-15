import { getAccessToken } from "@/utils/token";
import axios, { isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";

type SessionData = {
  accessToken: string;
  userId: string;
};

// Função de logout - você pode ajustar conforme sua implementação
const logout = async () => {
  try {
    // Limpar token do SecureStore
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("userId");

    // Aqui você pode adicionar outras limpezas necessárias
    // Por exemplo: limpar AsyncStorage, resetar estado global, etc.

    // Redirecionar para tela de login ou resetar navigation
    // Exemplo: navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
};

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000,
});

axiosInstance.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    if (isAxiosError(error)) {
      const errorHandler = {
        message: error?.response?.data?.message,
        status: error?.response?.status,
      };

      // Verificar se é erro 403 (Forbidden/Unauthorized)
      if (error?.response?.status === 403) {
        await logout();
      }

      return await Promise.reject(errorHandler);
    }

    return await Promise.reject(error);
  }
);

axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = await getAccessToken();
    if (accessToken) {
      config.headers.Authorization = accessToken;
    }

    return config;
  },
  async (error) => {
    if (isAxiosError(error)) {
      return await Promise.reject(error.response?.data);
    }

    return await Promise.reject(error);
  }
);

export default axiosInstance;
