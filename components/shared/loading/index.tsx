import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { VStack } from "@/components/ui/vstack";
import { ActivityIndicator } from "react-native";

const Loading = () => {
  return (
    <VStack className="flex items-center justify-center h-screen">
      <HStack space="sm">
        <Spinner />
        <Text size="md">Carregando...</Text>
      </HStack>
    </VStack>
  );
};

export default Loading;
