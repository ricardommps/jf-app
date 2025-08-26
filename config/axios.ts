import axios, {
  isAxiosError,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken, getRefreshToken, saveTokens } from "@/utils/token";
import { triggerLogout } from "@/auth/authEvents";
import { ApiError } from "@/types/api";

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function refreshTokenCustomer(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error("Refresh token não encontrado");

  const response = await axios.post(
    `${process.env.EXPO_PUBLIC_API_URL}/auth/loginCustomer/refresh`,
    { refreshToken }
  );

  const { accessToken, refreshToken: newRefresh } = response.data;
  await saveTokens(accessToken, newRefresh);

  return accessToken;
}

axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = await getAccessToken();
    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `${accessToken}`;
    }
    return config;
  },
  async (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  async (response) => response,
  async (error: AxiosError) => {
    if (!isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes("/api/v2/auth/refresh-customer")) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers.Authorization = `${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshTokenCustomer();
          processQueue(null, newToken);

          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          triggerLogout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        triggerLogout();
      }
    }

    const message = (error.response?.data as any)?.message || error.message;
    const customError = new Error(message) as ApiError;
    customError.status = status;
    customError.customMessage = message;
    customError.customCode = error.code;

    if (status === 403) {
      triggerLogout();
    }

    return Promise.reject(customError);
  }
);

export default axiosInstance;

// import axios, { isAxiosError } from "axios";
// import { getAccessToken } from "@/utils/token";
// import { triggerLogout } from "@/auth/authEvents";
// import { ApiError } from "@/types/api";

// const axiosInstance = axios.create({
//   baseURL: process.env.EXPO_PUBLIC_API_URL,
//   timeout: 30000,
// });

// axiosInstance.interceptors.request.use(
//   async (config) => {
//     const accessToken = await getAccessToken();
//     if (accessToken) {
//       config.headers.Authorization = accessToken;
//     }
//     return config;
//   },
//   async (error) => {
//     return await Promise.reject(error);
//   }
// );

// axiosInstance.interceptors.response.use(
//   async (response) => response,
//   async (error) => {
//     if (isAxiosError(error)) {
//       const status = error.response?.status;
//       const message = error.response?.data?.message || error.message;
//       const code = error.code;

//       const customError = new Error(message) as ApiError;
//       customError.status = status;
//       customError.customMessage = message;
//       customError.customCode = code;
//       customError.response = error.response;

//       if (status === 403) {
//         triggerLogout();
//       }

//       return await Promise.reject(customError);
//     }

//     return await Promise.reject(error);
//   }
// );

// export default axiosInstance;
