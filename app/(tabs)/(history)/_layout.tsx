import { ScrollView } from "@/components/ui/scroll-view";
import { View } from "@/components/ui/view";
import { Slot } from "expo-router";
import React from "react";
import {
  Extrapolation,
  interpolate,
  useSharedValue,
} from "react-native-reanimated";

import CustomHeader from "@/components/shared/custom-header";

const Layout = () => {
  const scrollY = useSharedValue(0);
  const animatedHeight = useSharedValue(340);
  const isHeaderShrunk = useSharedValue(false);

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
        <View>
          <CustomHeader variant="general" title="Perfil" />
        </View>
      </View>

      <ScrollView
        onScroll={handleScrollWithPosition}
        scrollEventThrottle={16}
        className="bg-background-0"
        contentContainerClassName="pt-[140px]"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <Slot />
      </ScrollView>
    </View>
  );
};

export default function HomeLayout() {
  return <Layout />;
}
