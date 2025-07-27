import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLocalSearchParams } from "expo-router";
import { Button, ButtonText } from "@/components/ui/button";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function CongratulationScreen() {
  const router = useRouter();
  const { distanceInMeters, durationInSeconds, paceInSeconds } =
    useLocalSearchParams();
  function handleNavigate() {
    router.replace("/(tabs)/(home)");
  }
  return (
    <SafeAreaView className="container px-7 bg-black h-full">
      <VStack className="space-y-6 items-center">
        {/* Medal Icon */}
        <Box className="flex justify-center items-center mt-24">
          <Image
            source={require("@/assets/images/jf_icone_v1.png")} // Substitua pela sua imagem de medalha
            style={{ width: 250, height: 250 }}
            resizeMode="contain"
          />
        </Box>
        <Box className="pt-5">
          <Text className="text-3xl font-extrabold text-white text-center">
            Parabéns!
          </Text>

          <Text className="text-2xl font-extrabold text-white text-center">
            Mais um treino concluído com sucesso.
          </Text>
        </Box>

        {/* Buttons */}
      </VStack>
      <Box className="flex justify-center items-center pt-20">
        <Button
          action="primary"
          size="lg"
          className="w-full"
          onPress={handleNavigate}
        >
          <ButtonText>Fechar</ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
}
