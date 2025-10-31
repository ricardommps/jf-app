// auth/authEvents.ts
import { removeTokens } from "@/utils/token";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

/**
 * Função centralizada para fazer logout
 * Limpa todos os tokens e redireciona para a tela de login
 */
export const triggerLogout = async () => {
  try {
    console.warn("🚪 Fazendo logout...");

    // Limpa todos os dados de autenticação
    await removeTokens();
    await SecureStore.deleteItemAsync("refresh_token");
    await SecureStore.deleteItemAsync("session");

    // Redireciona para a tela de login
    router.replace("/");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    // Garante redirecionamento mesmo com erro
    router.replace("/");
  }
};

// Não precisa mais de registerLogoutCallback!
// O triggerLogout agora faz tudo diretamente
