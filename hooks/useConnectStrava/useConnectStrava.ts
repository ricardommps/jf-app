import {
  disconnectStrava,
  getStravaActivities,
  getStravaConnectUrl,
  getStravaStatus,
} from "@/services/strava.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

export function useConnectStrava() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { redirectUri: string }) => {
      // 1. Busca a URL de autorização
      const data = await getStravaConnectUrl(params.redirectUri);
      if (!data?.url) throw new Error("URL de autorização não recebida");

      // 2. ✅ Abre DENTRO do mutationFn — ainda no contexto do gesto do usuário
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        params.redirectUri, // usa o redirectUri dinâmico, não hardcoded
      );

      if (result.type === "cancel" || result.type === "dismiss") {
        throw new Error("Autorização cancelada");
      }

      if (result.type !== "success" || !result.url) {
        throw new Error("Falha na autorização");
      }

      // 3. Valida o retorno tanto no Expo Go quanto no app publicado
      const { path, hostname } = Linking.parse(result.url);
      const normalizedTarget = (
        path?.replace(/^\/+/, "") ??
        hostname?.replace(/^\/+/, "")
      )?.trim();

      if (normalizedTarget !== "strava-success") {
        throw new Error("Redirect inesperado: " + (path || hostname));
      }

      return true;
    },

    onSuccess: async () => {
      await queryClient.removeQueries({ queryKey: ["strava-status"] }); // ✅ remove do cache
      await queryClient.refetchQueries({ queryKey: ["strava-status"] });
    },

    onError: (error) => {
      // Ignora erro de cancelamento se quiser
      console.warn("Strava connect:", error.message);
    },
  });
}

export function useStravaStatus(options?: { enabled?: boolean }) {
  const { enabled = true } = options ?? {};

  return useQuery({
    queryKey: ["strava-status"],
    queryFn: getStravaStatus,
    enabled,
    staleTime: 0,
    gcTime: 0, // ✅ não mantém no cache
    refetchOnMount: true, // ✅ refaz ao montar o componente
    refetchOnWindowFocus: true, // ✅ refaz ao voltar para a tela
  });
}

export function useStravaActivities(date?: string) {
  return useQuery({
    queryKey: ["strava-activities", date],
    queryFn: () => {
      if (!date) throw new Error("date is required");
      return getStravaActivities(date);
    },
    enabled: false, // mantém disabled, usa refetch() manual
  });
}

export function useDisconnectStrava() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectStrava,
    onSuccess: async () => {
      await queryClient.removeQueries({ queryKey: ["strava-status"] });
      await queryClient.removeQueries({ queryKey: ["strava-activities"] });
      await queryClient.refetchQueries({ queryKey: ["strava-status"] });
    },
    onError: (error) => {
      console.warn("Strava disconnect:", error.message);
    },
  });
}
