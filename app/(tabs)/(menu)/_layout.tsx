import { View } from "@/components/ui/view";
import { Slot } from "expo-router";
import React from "react";

const Layout = () => {
  return (
    <View className="flex-1 bg-black">
      <Slot />
    </View>
  );
};

export default function HomeLayout() {
  return <Layout />;
}
