import * as ExpoLinking from "expo-linking";
import React from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";

import { StravaConnectedSuccess } from "@/components/strava/StravaConnectedSuccess";
import { StravaPairingShell } from "@/components/strava/StravaPairingShell";
import { StravaSyncIntro } from "@/components/strava/StravaSyncIntro";
import { ENV } from "@/config/env";
import { useSession } from "@/contexts/Authentication";
import {
  useConnectStrava,
  useDisconnectStrava,
  useStravaStatus,
} from "@/hooks/useConnectStrava/useConnectStrava";
import { useNavigation, useRouter } from "expo-router";

const StravaConnect = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { session } = useSession();
  const { data: stravaData, isLoading } = useStravaStatus();
  const { mutate: connectStrava, status: connectStatus } = useConnectStrava();
  const { mutate: disconnectStrava, status: disconnectStatus } =
    useDisconnectStrava();

  const isConnected = stravaData?.connected ?? false;
  const isConnecting = connectStatus === "pending";
  const isDisconnecting = disconnectStatus === "pending";

  const handleConnect = () => {
    const redirectUri =
      ENV.STRAVA_REDIRECT_URI?.trim() ||
      ExpoLinking.createURL("strava-success");

    if (__DEV__) {
      console.log("[Strava] redirectUri:", redirectUri);
    }

    connectStrava({ redirectUri });
  };

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

  if (isLoading) {
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
        {isConnected ? (
          <StravaConnectedSuccess
            userAvatar={session?.user.avatar ?? null}
            userName={session?.user.name ?? null}
            isDisconnecting={isDisconnecting}
            onDisconnect={handleDisconnect}
          />
        ) : (
          <StravaSyncIntro
            isConnecting={isConnecting}
            onConnect={handleConnect}
          />
        )}
      </ScrollView>
    </StravaPairingShell>
  );
};

export default StravaConnect;
