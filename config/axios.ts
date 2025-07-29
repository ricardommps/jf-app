import axios, { isAxiosError } from "axios";
import { getAccessToken } from "@/utils/token";
import { triggerLogout } from "@/auth/authEvents";

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000,
});

// Interceptor para adicionar o token a cada requisição
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

// Interceptor para lidar com erros de resposta
axiosInstance.interceptors.response.use(
  async (response) => response,
  async (error) => {
    if (isAxiosError(error)) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 403) {
        triggerLogout(); // <-- Aciona signOut do contexto
      }

      return await Promise.reject({ status, message });
    }

    return await Promise.reject(error);
  }
);

export default axiosInstance;
