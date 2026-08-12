import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { X } from "lucide-react-native";
import React, { PropsWithChildren } from "react";
import { ImageBackground, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type StravaPairingShellProps = PropsWithChildren<{
  onClose: () => void;
}>;

export function StravaPairingShell({
  children,
  onClose,
}: StravaPairingShellProps) {
  return (
    <ImageBackground
      source={require("@/assets/images/foltz_tela.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <StatusBar style="light" />

      <LinearGradient
        colors={[
          "rgba(3, 7, 15, 0.98)",
          "rgba(8, 12, 20, 0.95)",
          "rgba(11, 15, 24, 0.98)",
        ]}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
          <View className="flex-1 px-8 pb-8 pt-1">
            <View className="items-end">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onClose}
                className="h-12 w-12 items-center justify-center"
              >
                <X color="#F4F5F7" size={34} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            <View className="flex-1">{children}</View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}
