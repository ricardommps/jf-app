import axiosInstance from "@/config/axios";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const saveTokens = async (
  accessToken: string,
  refreshToken: string
): Promise<void> => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

    axiosInstance.defaults.headers.common["Authorization"] = `${accessToken}`;
  } catch (error) {
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | undefined> => {
  try {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    return token ?? undefined;
  } catch {
    return undefined;
  }
};

export const getRefreshToken = async (): Promise<string | undefined> => {
  try {
    const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return token ?? undefined;
  } catch {
    return undefined;
  }
};

export const removeTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    delete axiosInstance.defaults.headers.common["Authorization"];
  } catch (error) {
    throw error;
  }
};

// import axiosInstance from "@/config/axios";
// import * as SecureStore from "expo-secure-store";

// const ACCESS_TOKEN_KEY = "accessToken";

// export const setAccessToken = async (token: string): Promise<void> => {
//   try {
//     await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
//     axiosInstance.defaults.headers.common["Authorization"] = token;
//   } catch (error) {
//     throw error;
//   }
// };

// export const getAccessToken = async (): Promise<string | undefined> => {
//   try {
//     const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
//     return token ?? undefined;
//   } catch (error) {
//     return undefined;
//   }
// };

// export const removeAccessToken = async (): Promise<void> => {
//   try {
//     await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
//   } catch (error) {
//     throw error;
//   }
// };
