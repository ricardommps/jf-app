import { StravaConnectedSuccess } from "@/components/strava/StravaConnectedSuccess";
import { StravaPairingShell } from "@/components/strava/StravaPairingShell";
import { useSession } from "@/contexts/Authentication";
import {
  useDisconnectStrava,
  useStravaStatus,
} from "@/hooks/useConnectStrava/useConnectStrava";
import { useNavigation, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";

export default function StravaSuccess() {
  const navigation = useNavigation();
  const router = useRouter();
  const { session } = useSession();
  const { data, refetch } = useStravaStatus();
  const { mutate: disconnectStrava, status: disconnectStatus } =
    useDisconnectStrava();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const isDisconnecting = disconnectStatus === "pending";

  useEffect(() => {
    let isMounted = true;

    WebBrowser.dismissBrowser();

    refetch().finally(() => {
      if (isMounted) {
        setIsRefreshing(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [refetch]);

  useEffect(() => {
    if (!isRefreshing && !data?.connected) {
      router.replace("/stravaConnect/" as any);
    }
  }, [data?.connected, isRefreshing, router]);

  const handleClose = () => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/(home)" as any);
  };

  const handleDisconnect = () => {
    Alert.alert(
      "Desconectar do Strava",
      "Você deseja desconectar sua conta do Strava?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Desconectar",
          style: "destructive",
          onPress: () => disconnectStrava(),
        },
      ],
    );
  };

  if (isRefreshing || !data?.connected) {
    return (
      <StravaPairingShell onClose={handleClose}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FC5200" />
        </View>
      </StravaPairingShell>
    );
  }

  return (
    <StravaPairingShell onClose={handleClose}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <StravaConnectedSuccess
          userAvatar={session?.user.avatar ?? null}
          userName={session?.user.name ?? null}
          isDisconnecting={isDisconnecting}
          onDisconnect={handleDisconnect}
        />
      </ScrollView>
    </StravaPairingShell>
  );
}
