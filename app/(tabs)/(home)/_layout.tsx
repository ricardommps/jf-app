import Header from "@/components/header";
import { Slot } from "expo-router";
import React from "react";
import { View } from "react-native";

const Layout = () => {
  return (
    <View className="flex-1 bg-black">
      <Header
        showNotifications
        showProfileShortcut
        profileShortcutSize={40}
      />
      <Slot />
    </View>
  );
};

export default function HomeLayout() {
  return <Layout />;
}
