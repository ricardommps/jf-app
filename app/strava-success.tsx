// app/strava-success.tsx

import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { useStravaStatus } from "@/hooks/useConnectStrava/useConnectStrava";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function StravaSuccess() {
  const router = useRouter();
  const toast = useToast();
  const { refetch } = useStravaStatus();

  const showNewToast = (
    message: string,
    type: "success" | "error" = "error",
  ) => {
    const newId = Math.random().toString();
    toast.show({
      id: newId,
      placement: "top",
      duration: 9000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast nativeID={uniqueToastId} action={type} variant="solid">
            <ToastTitle>{type === "success" ? "Sucesso" : "Erro"}</ToastTitle>
            <ToastDescription>{message}</ToastDescription>
          </Toast>
        );
      },
    });
  };

  useEffect(() => {
    // No Android, o deep link cai aqui — só refaz o fetch e redireciona
    refetch().finally(() => {
      //router.replace("/stravaConnect/" as any);
      showNewToast("Strava conectado com sucesso!", "success");
      router.replace("/" as any);
    });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
