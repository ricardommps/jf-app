import axios, { AxiosError } from "axios";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import globalEventEmitter from "@/utils/events";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const TIMEOUT = 30000;

class APICaller {
  static instance: APICaller | null = null;
  private client;
  private isRefreshing = false;
  private refreshQueue: ((token: string) => void)[] = [];
  private isLoggingOut = false;
  private isNavigatingToError = false;

  static getInstance() {
    if (!APICaller.instance) {
      APICaller.instance = new APICaller();
    }
    return APICaller.instance;
  }

  static resetInstance() {
    APICaller.instance = null;
  }

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request
    this.client.interceptors.request.use(
      async (config) => {
        if (this.isLoggingOut) {
          return Promise.reject(new axios.Cancel("Logging out"));
        }
        const token = await SecureStore.getItemAsync("access_token");
        if (token && config.headers) config.headers.Authorization = `${token}`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Ignorar erros de cancelamento
        if (axios.isCancel(error)) {
          console.log("📛 Requisição cancelada");
          return Promise.reject(error);
        }

        if (this.isLoggingOut) {
          console.log("🚫 Ignorando erro durante logout");
          return Promise.reject(error);
        }

        // Tratar Network Error
        if (error.message === "Network Error" || !error.response) {
          console.error("🌐 Erro de rede detectado:", error.message);

          const errorDetails = {
            code: "NETWORK_ERROR",
            message:
              "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.",
            url: error.config?.url || "",
            method: error.config?.method?.toUpperCase() || "",
          };

          this.handleNetworkError(errorDetails);

          // Criar erro customizado
          const networkError = new Error(errorDetails.message);
          (networkError as any).isNetworkError = true;
          (networkError as any).originalError = error;
          (networkError as any).details = errorDetails;

          return Promise.reject(networkError);
        }

        const originalRequest = error.config as any;
        const status = error.response?.status;

        console.log("📡 Status da resposta:", status);

        // Tratar 403 - Forbidden (usuário sem permissão ou token inválido)
        if (status === 403) {
          console.log("🚫 Erro 403 detectado - Iniciando logout");
          this.handleLogout();
          return Promise.reject(error);
        }

        // Tratar 401 - Unauthorized (token expirado)
        if (status === 401 && !originalRequest._retry) {
          console.log("🔄 Erro 401 detectado - Tentando refresh token");
          originalRequest._retry = true;
          return this.handleTokenRefresh(originalRequest);
        }

        // Outros erros HTTP
        if (status) {
          console.error(`❌ Erro HTTP ${status}:`, error.response?.data);
        }

        return Promise.reject(error);
      }
    );
  }

  private handleNetworkError(errorDetails: {
    code: string;
    message: string;
    url: string;
    method: string;
  }) {
    if (this.isNavigatingToError) {
      console.log("🚫 Já está navegando para página de erro");
      return;
    }

    this.isNavigatingToError = true;
    console.log("🌐 Redirecionando para página de erro de rede...");

    // Emitir evento global de erro de rede
    globalEventEmitter.emit("network-error", errorDetails);

    try {
      // Serializar os dados do erro para passar na URL
      const errorParam = encodeURIComponent(JSON.stringify(errorDetails));

      // Redirecionar para página de erro com os detalhes
      router.push(`/error/screens/error-view?error=${errorParam}`);
      console.log("✅ Redirecionado para página de erro de rede");
    } catch (error) {
      console.error("❌ Erro ao redirecionar para página de erro:", error);
      // Fallback sem parâmetros
      try {
        router.replace("/error/screens/error-view");
        console.log("✅ Redirecionado (fallback) para página de erro");
      } catch (e) {
        console.error("❌ Erro no fallback:", e);
      }
    }

    // Resetar flag após 2 segundos
    setTimeout(() => {
      this.isNavigatingToError = false;
    }, 2000);
  }

  private async handleTokenRefresh(originalRequest: any) {
    if (this.isRefreshing) {
      console.log("⏳ Refresh token já em andamento, adicionando à fila");
      return new Promise((resolve) => {
        this.refreshQueue.push((token) => {
          originalRequest.headers.Authorization = `${token}`;
          resolve(this.client(originalRequest));
        });
      });
    }

    this.isRefreshing = true;
    console.log("🔄 Iniciando refresh token...");

    try {
      const refreshToken = await SecureStore.getItemAsync("refresh_token");
      if (!refreshToken) {
        console.error("❌ Refresh token não encontrado");
        throw new Error("No refresh token found");
      }

      const pushToken = await this.getPushToken();
      const response = await axios.post(
        `${BASE_URL}/api/v2/auth/refresh-customer`,
        {
          refreshToken,
          ...(pushToken && { pushToken }),
        },
        {
          timeout: 10000, // Timeout menor para refresh
        }
      );

      const newAccessToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken || refreshToken;

      await SecureStore.setItemAsync("access_token", newAccessToken);
      await SecureStore.setItemAsync("refresh_token", newRefreshToken);

      console.log("✅ Refresh token bem-sucedido");

      // Executa fila pendente
      this.refreshQueue.forEach((cb) => cb(newAccessToken));
      this.refreshQueue = [];

      originalRequest.headers.Authorization = `${newAccessToken}`;
      return this.client(originalRequest);
    } catch (error: any) {
      console.error("❌ Falha no refresh token:", error.message);

      // Se for erro de rede ou timeout, redirecionar para página de erro
      if (error.message === "Network Error" || error.code === "ECONNABORTED") {
        console.log("🌐 Erro de rede no refresh");

        const errorDetails = {
          code: error.code === "ECONNABORTED" ? "TIMEOUT" : "NETWORK_ERROR",
          message:
            error.code === "ECONNABORTED"
              ? "Tempo de resposta excedido. Verifique sua conexão."
              : "Não foi possível conectar ao servidor.",
          url: `${BASE_URL}/api/v2/auth/refresh-customer`,
          method: "POST",
        };

        this.handleNetworkError(errorDetails);
        this.refreshQueue = [];
        return Promise.reject(error);
      }

      // Outros erros: fazer logout
      await this.handleLogout();
      return Promise.reject(error);
    } finally {
      this.isRefreshing = false;
    }
  }

  private async handleLogout() {
    if (this.isLoggingOut) {
      console.log("🔒 Logout já em andamento");
      return;
    }
    this.isLoggingOut = true;

    console.log("🚪 Iniciando logout...");

    try {
      // Limpar tokens primeiro
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      await SecureStore.deleteItemAsync("session");
      console.log("✅ Tokens removidos");
    } catch (e) {
      console.error("❌ Erro ao limpar SecureStore:", e);
    }

    // Limpar fila de refresh
    this.refreshQueue = [];
    this.isRefreshing = false;

    // Resetar flag ANTES de emitir evento e redirecionar
    this.isLoggingOut = false;
    console.log("🔓 Flag de logout resetado ANTES do redirecionamento");

    // Emitir evento global
    globalEventEmitter.emit("logout");
    console.log("📢 Evento de logout emitido");

    // Pequeno delay para garantir que o evento seja processado
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Tentar redirecionar
    try {
      if (router.canGoBack()) {
        router.dismissAll();
      }
      router.replace("/(auth)/(login)");
      console.log("✅ Redirecionamento executado");
    } catch (error) {
      console.error("❌ Erro ao redirecionar:", error);
      try {
        router.push("/(auth)/(login)");
        console.log("✅ Redirecionamento (fallback) executado");
      } catch (e) {
        console.error("❌ Erro no fallback:", e);
      }
    }
  }

  private async getPushToken(): Promise<string | undefined> {
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

  // ========================================
  // Métodos HTTP
  // ========================================
  async request(endpoint: string, method = "GET", body: any = null) {
    try {
      const response = await this.client.request({
        url: endpoint,
        method,
        data: body,
      });
      return response.data;
    } catch (error: any) {
      // Network Error já foi tratado no interceptor
      if (error.isNetworkError) {
        throw error;
      }

      if (error.response) {
        // Erro com resposta do servidor
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          `Erro ${error.response.status}`;
        throw new Error(message);
      }

      throw error;
    }
  }

  get(url: string, config?: any) {
    return this.client.get(url, config);
  }

  post(url: string, data?: any, config?: any) {
    return this.client.post(url, data, config);
  }

  put(url: string, data?: any, config?: any) {
    return this.client.put(url, data, config);
  }

  patch(url: string, data?: any, config?: any) {
    return this.client.patch(url, data, config);
  }

  delete(url: string, config?: any) {
    return this.client.delete(url, config);
  }
}

export default APICaller.getInstance();
