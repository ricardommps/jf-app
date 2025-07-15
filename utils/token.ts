import axiosInstance from "@/config/axios";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "accessToken";

export const setAccessToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    axiosInstance.defaults.headers.common["Authorization"] = token;
  } catch (error) {
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | undefined> => {
  try {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    return token ?? undefined;
  } catch (error) {
    return undefined;
  }
};

export const removeAccessToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    throw error;
  }
};
