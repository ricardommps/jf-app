import React from "react";
import { VStack } from "@/components/ui/vstack";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import Logo from "@/assets/images/logo.svg";
import { Pressable } from "@/components/ui/pressable";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";

const ErrorScreen = () => {
  const router = useRouter();
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
  const retryScale = useSharedValue(1);

  const retryAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: retryScale.value }],
    };
  });

  const handleRetryPress = () => {
    retryScale.value = withSequence(
      withSpring(0.95, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );
    // Add a small delay to allow animation to complete
    setTimeout(() => {
      router.back();
    }, 200);
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Main content */}
      <View className="flex-1 justify-center items-center pb-12">
        <VStack space="lg" className="items-center max-w-[280px]">
          {/* Logo illustration */}
          <View className="mb-4">
            <Logo />
          </View>

          {/* Title */}
          <Text
            size="lg"
            className="font-semibold text-gray-900 dark:text-white text-center mb-2"
          >
            Ops! Algo deu errado.
          </Text>

          {/* Error message */}
          <Text
            size="sm"
            className="text-gray-400 dark:text-gray-500 text-center leading-5 mb-8"
          >
            Desculpe pelo transtorno mas ocorreu um erro interno, tente
            novamente mais tarde.
          </Text>

          {/* Action buttons */}
          <VStack space="sm" className="w-full">
            <AnimatedPressable
              style={retryAnimatedStyle}
              className="w-full bg-blue-500 dark:bg-blue-600 rounded-lg py-3 px-6"
              onPress={handleRetryPress}
            >
              <Text size="sm" className="font-medium text-white text-center">
                Tentar Novamente
              </Text>
            </AnimatedPressable>
          </VStack>
        </VStack>
      </View>
    </View>
  );
};

export default ErrorScreen;
