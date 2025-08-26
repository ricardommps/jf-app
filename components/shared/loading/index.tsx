import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

const Loading = () => {
  return (
    <VStack className="flex items-center justify-center h-screen bg-[#2b2b2b9d]">
      <HStack space="sm">
        <Spinner />
        <Text size="md" className="text-white">
          Carregando...
        </Text>
      </HStack>
    </VStack>
  );
};

export default Loading;
