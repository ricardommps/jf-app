import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import Logo from "@/assets/images/logo.svg";

export default function Authentication() {
  const router = useRouter();
  function handleNavigateToLogin() {
    router.push("/(auth)/(login)");
  }

  return (
    <SafeAreaView className="container px-7 bg-black h-full">
      <View className="flex justify-center items-center mt-24">
        <Logo />
      </View>
      <View className="flex justify-center items-center pt-20">
        <Text className="text-3xl font-extrabold text-white text-center">
          BEM-VINDO!
        </Text>
      </View>
      <View className="flex justify-center items-center pt-20">
        <Button
          action="primary"
          size="lg"
          className="w-full"
          onPress={handleNavigateToLogin}
        >
          <ButtonText>Acessar conta</ButtonText>
        </Button>
      </View>
    </SafeAreaView>
  );
}
