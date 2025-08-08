import React, { useContext, useState, useEffect, useRef } from "react";
import { Slot } from "expo-router";
import { View } from "@/components/ui/view";
import Animated from "react-native-reanimated";
import CustomHeader from "@/components/shared/custom-header";

const Layout = () => {
  return (
    <View className="flex-1">
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <Animated.View>
          <CustomHeader variant="general" title="Home" />
        </Animated.View>
      </View>
      <View className="flex-1 bg-background-0" style={{ paddingTop: 150 }}>
        <Slot />
      </View>
    </View>
  );
};

export default function HomeLayout() {
  return <Layout />;
}
