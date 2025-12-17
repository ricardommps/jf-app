import { useRouter } from "expo-router";
import { Play } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  ImageBackground,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface YearReviewProps {
  programId: number;
}

export default function YearReview({ programId }: YearReviewProps) {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;

  const handleOpen = () => {
    router.push(`/retrospective?programId=${programId}` as any);
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Centralizando e ajustando altura da imagem */}
      <View className="flex-1 justify-end items-center">
        <ImageBackground
          source={require("@/assets/images/jf_logo_full.png")}
          resizeMode="contain"
          style={{ width: screenWidth, height: 300 }}
        >
          {/* Overlay escuro */}
          <View className="flex-1 bg-black/40 justify-end px-6 pb-8 w-full">
            {/* Títulos */}
            <View className="mb-10">
              <Text className="text-white text-5xl font-bold mb-2">
                Retrospectiva
              </Text>
              <Text className="text-white text-5xl font-bold">2025</Text>
            </View>

            {/* Subtítulo */}
            <View className="mb-8">
              <Text className="text-white text-xl font-semibold mb-6">
                É hora da sua retrospectiva
              </Text>
              <Text className="text-white/90 text-base leading-6">
                Quantos dias você correu em 2025? Quantos km? Quantas horas de
                atividade? Veja e compartilhe!
              </Text>
            </View>

            {/* Botão Play */}
            <TouchableOpacity className="absolute right-6" onPress={handleOpen}>
              <View className="w-20 h-20 bg-white rounded-full items-center justify-center shadow-lg">
                <Play
                  color="#000000"
                  size={32}
                  strokeWidth={2}
                  fill="#000000"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Padrão do ano */}
          <View className="absolute top-1/2 left-0 right-0 opacity-20">
            <View className="flex-row items-center justify-around w-full px-4">
              <Text className="text-orange-500 text-2xl font-bold">2025</Text>
              <Text className="text-orange-500 text-xl">⚡</Text>
              <Text className="text-orange-500 text-2xl font-bold">2025</Text>
              <Text className="text-orange-500 text-xl">⚡</Text>
              <Text className="text-orange-500 text-2xl font-bold">2025</Text>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}
