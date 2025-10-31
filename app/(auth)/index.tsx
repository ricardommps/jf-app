import { Button, ButtonText } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Authentication() {
  const router = useRouter();
  const { height } = Dimensions.get("window");

  const deviceSize = height < 600 ? "xs" : height < 700 ? "sm" : "lg";

  const classes = {
    xs: {
      container: "flex-1 justify-evenly py-4",
      logo: "w-60 h-20",
      text: "text-xl",
      spacing: "space-y-4",
      button: "md",
    },
    sm: {
      container: "flex-1 justify-center space-y-8 py-6",
      logo: "w-72 h-28",
      text: "text-2xl",
      spacing: "space-y-6",
      button: "md",
    },
    lg: {
      container: "flex-1 justify-center space-y-16 py-10",
      logo: "w-96 h-48",
      text: "text-3xl",
      spacing: "space-y-12",
      button: "lg",
    },
  };

  const currentClasses = classes[deviceSize as keyof typeof classes];
  function handleNavigateToLogin() {
    router.push("/(auth)/(login)" as any);
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#000000" />
      <SafeAreaView className="flex-1 bg-black px-5">
        <View className={`${currentClasses.container} items-center`}>
          {/* Logo */}
          <View className="items-center">
            <Image
              source={require("@/assets/images/jf_logo_full.png")}
              alt="logo"
              resizeMode="contain"
              className={`${currentClasses.logo} max-w-[400px] max-h-[200px]`}
            />
          </View>

          <Text
            className={`${currentClasses.text} font-extrabold text-white text-center tracking-wide`}
          >
            BEM-VINDO!
          </Text>

          <View className="w-full max-w-sm pt-12">
            <Button
              action="primary"
              size={currentClasses.button as "sm" | "md" | "lg"}
              className="w-full"
              onPress={handleNavigateToLogin}
            >
              <ButtonText>Acessar conta</ButtonText>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
