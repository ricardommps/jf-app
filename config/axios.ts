import * as Sentry from "@sentry/react-native";
import axios, { AxiosError, CancelTokenSource } from "axios";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { ENV } from "@/config/env";
import globalEventEmitter from "@/utils/events";

const TIMEOUT = 30000;

console.log("--- ENV.API_URL--", ENV.API_URL);

class APICaller {
  static instance: APICaller | null = null;
  private client;
  private isRefreshing = false;
  private refreshQueue: ((token: string) => void)[] = [];
  private isLoggingOut = false;
  private isNavigatingToError = false;
  private cancelTokenSources: CancelTokenSource[] = [];
  private hasLoggedOut = false;

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
    // ✅ Usando ENV.API_URL ao invés de Constants
    this.client = axios.create({
      baseURL: ENV.API_URL,
      timeout: TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  private cancelAllRequests() {
    this.cancelTokenSources.forEach((source) => {
      try {
        source.cancel("Logout realizado");
      } catch (error) {
        // Ignora erros ao cancelar
      }
    });
    this.cancelTokenSources = [];
  }

  private setupInterceptors() {
    // Request
    this.client.interceptors.request.use(
      async (config) => {
        if (this.isLoggingOut || this.hasLoggedOut) {
          return Promise.reject(new axios.Cancel("Logging out"));
        }

        const cancelTokenSource = axios.CancelToken.source();
        config.cancelToken = cancelTokenSource.token;
        this.cancelTokenSources.push(cancelTokenSource);

        const token = await SecureStore.getItemAsync("access_token");
        if (token && config.headers) config.headers.Authorization = `${token}`;
        return config;
      },
      (error) => {
        Sentry.captureException(error);
        return Promise.reject(error);
      },
    );

    // Response
    this.client.interceptors.response.use(
      (response) => {
        this.removeCancelTokenSource(response.config.cancelToken);
        return response;
      },
      async (error: AxiosError) => {
        if (error.config?.cancelToken) {
          this.removeCancelTokenSource(error.config.cancelToken);
        }

        if (this.hasLoggedOut || this.isLoggingOut) {
          return Promise.reject(new axios.Cancel("Already logged out"));
        }

        if (axios.isCancel(error)) {
          return Promise.reject(error);
        }

        if (!this.isLoggingOut) {
          Sentry.captureException(error);
        }

        if (error.message === "Network Error" || !error.response) {
          const errorDetails = {
            code: "NETWORK_ERROR",
            message:
              "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.",
            url: error.config?.url || "",
            method: error.config?.method?.toUpperCase() || "",
          };

          Sentry.captureMessage("Network Error", {
            level: "error",
            extra: errorDetails,
          });
          this.handleNetworkError(errorDetails);

          const networkError = new Error(errorDetails.message);
          (networkError as any).isNetworkError = true;
          (networkError as any).originalError = error;
          (networkError as any).details = errorDetails;

          return Promise.reject(networkError);
        }

        const originalRequest = error.config as any;
        const status = error.response?.status;

        if (status === 403) {
          this.handleLogout();
          return Promise.reject(error);
        }

        if (status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          return this.handleTokenRefresh(originalRequest);
        }

        return Promise.reject(error);
      },
    );
  }

  private removeCancelTokenSource(cancelToken: any) {
    this.cancelTokenSources = this.cancelTokenSources.filter(
      (source) => source.token !== cancelToken,
    );
  }

  private handleNetworkError(errorDetails: {
    code: string;
    message: string;
    url: string;
    method: string;
  }) {
    if (this.isNavigatingToError || this.hasLoggedOut) return;

    this.isNavigatingToError = true;
    globalEventEmitter.emit("network-error", errorDetails);

    try {
      const errorParam = encodeURIComponent(JSON.stringify(errorDetails));
      router.push(`/error/screens/error-view?error=${errorParam}`);
    } catch {
      try {
        router.replace("/error/screens/error-view");
      } catch {}
    }

    setTimeout(() => {
      this.isNavigatingToError = false;
    }, 2000);
  }

  private async handleTokenRefresh(originalRequest: any) {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshQueue.push((token) => {
          originalRequest.headers.Authorization = `${token}`;
          resolve(this.client(originalRequest));
        });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync("refresh_token");
      if (!refreshToken) throw new Error("No refresh token found");

      const pushToken = await this.getPushToken();

      // ✅ Usando ENV.API_URL ao invés de BASE_URL
      const response = await axios.post(
        `${ENV.API_URL}/api/v2/auth/refresh-customer`,
        { refreshToken, ...(pushToken && { pushToken }) },
        { timeout: 10000 },
      );

      const newAccessToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken || refreshToken;

      await SecureStore.setItemAsync("access_token", newAccessToken);
      await SecureStore.setItemAsync("refresh_token", newRefreshToken);

      this.refreshQueue.forEach((cb) => cb(newAccessToken));
      this.refreshQueue = [];

      originalRequest.headers.Authorization = `${newAccessToken}`;
      return this.client(originalRequest);
    } catch (error: any) {
      if (error.message === "Network Error" || error.code === "ECONNABORTED") {
        const errorDetails = {
          code: error.code === "ECONNABORTED" ? "TIMEOUT" : "NETWORK_ERROR",
          message:
            error.code === "ECONNABORTED"
              ? "Tempo de resposta excedido. Verifique sua conexão."
              : "Não foi possível conectar ao servidor.",
          url: `${ENV.API_URL}/api/v2/auth/refresh-customer`,
          method: "POST",
        };
        this.handleNetworkError(errorDetails);
        this.refreshQueue = [];
        return Promise.reject(error);
      }

      await this.handleLogout();
      return Promise.reject(error);
    } finally {
      this.isRefreshing = false;
    }
  }

  private async handleLogout() {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;
    this.hasLoggedOut = true;

    this.cancelAllRequests();

    try {
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      await SecureStore.deleteItemAsync("session");
    } catch {}

    this.refreshQueue = [];
    this.isRefreshing = false;

    globalEventEmitter.emit("logout");

    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      if (router.canGoBack()) router.dismissAll();
      router.replace("/(auth)/(login)");
    } catch {
      try {
        router.push("/(auth)/(login)");
      } catch {}
    }

    setTimeout(() => {
      this.isLoggingOut = false;
    }, 1000);
  }

  public forceLogout() {
    this.hasLoggedOut = true;
    this.cancelAllRequests();
  }

  public resetLogoutState() {
    this.hasLoggedOut = false;
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
      if (axios.isCancel(error)) {
        throw error;
      }

      if (!this.hasLoggedOut && !this.isLoggingOut) {
        Sentry.captureException(error);
      }

      if (error.isNetworkError) throw error;
      if (error.response) {
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
