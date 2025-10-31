import APICaller from "@/config/axios"; // importa o singleton da classe APICaller
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const saveTokens = async (
  accessToken: string,
  refreshToken?: string
): Promise<void> => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }

    // ✅ Atualiza header global da instância axios dentro do APICaller
    (APICaller as any).client.defaults.headers.common[
      "Authorization"
    ] = `${accessToken}`;
  } catch (error) {
    console.error("Erro ao salvar tokens:", error);
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

    // ✅ Remove header global
    delete (APICaller as any).client.defaults.headers.common["Authorization"];
  } catch (error) {
    console.error("Erro ao remover tokens:", error);
    throw error;
  }
};
