import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { StravaBrandBridge } from "./StravaBrandBridge";

type StravaConnectedSuccessProps = {
  userAvatar?: string | null;
  userName?: string | null;
  isDisconnecting?: boolean;
  onDisconnect?: () => void;
};

export function StravaConnectedSuccess({
  userAvatar,
  userName,
  isDisconnecting = false,
  onDisconnect,
}: StravaConnectedSuccessProps) {
  return (
    <View className="flex-1 pt-5">
      <View className="items-center px-1">
        <Text className="text-center text-[25px] font-extrabold leading-[49px] text-white">
          Emparelhamento com o Strava feito com sucesso
        </Text>
      </View>

      <View className="mt-[58px] items-center">
        <StravaBrandBridge
          connected
          userAvatar={userAvatar}
          userName={userName}
        />
      </View>

      <View className="mt-[38px] items-center px-4">
        <Text className="text-center text-[28px] font-extrabold text-white">
          {userName || "Sua conta"}
        </Text>

        <Text className="mt-3 text-center text-[15px] leading-[22px] text-[#A7AEBB]">
          corridas registradas no Strava
        </Text>
      </View>

      <View className="mt-[18px] self-center w-full max-w-[332px] px-1">
        <Text className="text-left text-[16px] leading-[28px] text-white">
          Sua conta do Strava agora está emparelhada.{"\n"}
          Esta é a experiência definitiva de treinamento
        </Text>
      </View>

      {onDisconnect ? (
        <View className="mt-10 w-full px-1">
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isDisconnecting}
            onPress={onDisconnect}
            className="self-center min-h-[58px] w-full max-w-[332px] items-center justify-center rounded-full border border-[#FC5200] px-6"
          >
            {isDisconnecting ? (
              <ActivityIndicator size="small" color="#FC5200" />
            ) : (
              <Text className="text-[18px] font-bold text-[#FC5200]">
                Desconectar do Strava
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}
