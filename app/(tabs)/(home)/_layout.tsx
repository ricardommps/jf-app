import CustomHeader from "@/components/shared/custom-header";
import { View } from "@/components/ui/view";
import { Slot } from "expo-router";
import React from "react";

const Layout = () => {
  const headerHeight = 100;

  // ❌ Antes: const dynamicPaddingTop = insets.top + headerHeight;
  // ✅ Agora só consideramos a altura do header, pois o CustomHeader já usa insets.top internamente
  const dynamicPaddingTop = headerHeight;

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
