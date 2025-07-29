import React from "react";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { ImageBackground } from "@/components/ui/image-background";
import { VStack } from "@/components/ui/vstack";
import { View } from "@/components/ui/view";
import { Pressable } from "@/components/ui/pressable";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";

const getImageSource = (type: number) => {
  return type === 2
    ? require("@/assets/images/banner-gym.jpg")
    : require("@/assets/images/banner-run.jpg");
};

interface IProgramCard {
  id: number;
  name: string;
  pv: string | null;
  pace: string | null;
  type: number;
  startDate: string | null;
  endDate: string | null;
}

const ProgramCard = ({
  id,
  name,
  type,
  pv,
  pace,
  startDate,
  endDate,
}: IProgramCard) => {
  const router = useRouter();
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleNavigate = (id: number) => {
    router.push(`/program/view?id=${id}&type=${type}`);
  };

  return (
    <AnimatedPressable
      style={[animatedStyle, { overflow: "hidden", borderRadius: 18 }]} // Garante bordas arredondadas
      className="flex-1 min-h-[120px]" // Garante que tenha altura suficiente
      onPress={() => handleNavigate(id)}
    >
      <ImageBackground
        source={getImageSource(type)}
        style={{
          flex: 1,
          justifyContent: "space-between",
          position: "relative",
        }}
        className="p-4 rounded-[18px]"
        resizeMode="cover"
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "black",
            opacity: 0.6, // Ajuste a intensidade do escurecimento
          }}
        />
        <HStack className="items-center">
          <VStack className="flex-1">
            <Text size="lg" className="font-bold text-gray-50 dark:text-white">
              {name}
            </Text>
            {startDate && endDate && (
              <Text
                size="sm"
                className="font-medium text-gray-50 dark:text-white"
              >
                {`${format(new Date(startDate), "dd/MM/yyyy")} - ${format(
                  new Date(endDate),
                  "dd/MM/yyyy"
                )}`}
              </Text>
            )}
          </VStack>
        </HStack>

        {type === 1 && (
          <HStack className="justify-start gap-10">
            <HStack space="xs">
              <Text
                className="text-gray-50 dark:text-white font-medium"
                size="md"
              >
                PV: {pv}
              </Text>
            </HStack>

            <HStack space="xs">
              <Text
                className="text-gray-50 dark:text-white font-medium"
                size="md"
              >
                Pace do PV: {pace}
              </Text>
            </HStack>
          </HStack>
        )}
      </ImageBackground>
    </AnimatedPressable>
  );
};

export default ProgramCard;
