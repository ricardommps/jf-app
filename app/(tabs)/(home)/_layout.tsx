import CustomHeader from "@/components/shared/custom-header";
import { View } from "@/components/ui/view";
import { Slot } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Layout = () => {
  const insets = useSafeAreaInsets();
  const headerHeight = 100;

  // ✅ Agora considera o inset do topo do dispositivo
  const dynamicPaddingTop = insets.top + headerHeight;

  return (
    <View className="flex-1">
      {/* Header fixo no topo */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <CustomHeader variant="general" title="Home" />
      </View>

      {/* Conteúdo principal */}
      <View
        className="bg-background-0"
        style={{
          flex: 1,
          paddingTop: dynamicPaddingTop,
        }}
      >
        <Slot />
      </View>
    </View>
  );
};

export default function HomeLayout() {
  return <Layout />;
}
