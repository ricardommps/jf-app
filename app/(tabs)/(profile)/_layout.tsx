import { View } from "@/components/ui/view";
import { Slot } from "expo-router";
import React from "react";

import Header from "@/components/header";

const Layout = () => {
  return (
    <View className="flex-1 bg-black">
      <Header title="Perfil" />
      <Slot />
    </View>
  );
};

export default function HomeLayout() {
  return <Layout />;
}
