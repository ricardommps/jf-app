import Header from "@/components/header";
import { Slot } from "expo-router";
import React from "react";
import { View } from "react-native";

const Layout = () => {
  return (
    <View className="flex-1 bg-black">
      <Header />
      <Slot />
    </View>
  );
};

export default function HomeLayout() {
  return <Layout />;
}
