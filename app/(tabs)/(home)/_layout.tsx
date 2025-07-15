import React, { useContext, useState, useEffect, useRef } from "react";
import { Slot } from "expo-router";
import { View } from "@/components/ui/view";
import Animated, {
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import { useSession } from "@/contexts/Authentication";
import CustomHeader from "@/components/shared/custom-header";

const Layout = () => {
  const scrollY = useSharedValue(0);
  const animatedHeight = useSharedValue(340);
  const isHeaderShrunk = useSharedValue(false);
  const { signOut } = useSession();

  // You can pass this handler to child components if needed
  const handleScrollWithPosition = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollY.value = y;

    isHeaderShrunk.value = y >= 200;

    animatedHeight.value = interpolate(
      y,
      [0, 200],
      [340, 140],
      Extrapolation.CLAMP
    );
  };

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

      {/* Remove ScrollView and let FlatList handle scrolling */}
      <View className="flex-1 bg-background-0" style={{ paddingTop: 150 }}>
        <Slot />
      </View>
    </View>
  );
};

export default function HomeLayout() {
  return <Layout />;
}
