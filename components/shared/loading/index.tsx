import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

const Loading = () => {
  return (
    <VStack className="flex items-center justify-center h-screen bg-[#2b2b2b]">
      <Image
        source={require("@/assets/images/jf_logo_full.png")}
        alt="logo"
        resizeMode="contain"
        className="w-[400px] h-[200px]"
      />
      <HStack space="sm" className="mt-3">
        <Spinner />
        <Text size="md" className="text-white">
          Carregando...
        </Text>
      </HStack>
    </VStack>
  );
};

export default Loading;
