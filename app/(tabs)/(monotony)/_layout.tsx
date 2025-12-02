import { View } from "@/components/ui/view";
import { Slot } from "expo-router";
import React from "react";

import CustomHeader from "@/components/shared/custom-header";

const Layout = () => {
  return (
    <View className="flex-1 bg-[#000]">
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <CustomHeader variant="general" title="Monotonia" />
      </View>

      {/* Conteúdo estático */}
      <View className="flex-1 bg-[#000] pt-[100px]">
        <Slot />
      </View>
    </View>
  );
};

export default function HomeLayout() {
  return <Layout />;
}
