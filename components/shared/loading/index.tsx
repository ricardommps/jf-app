import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Dimensions, StyleSheet, View } from "react-native";

const { height } = Dimensions.get("window");

const Loading = () => {
  return (
    <View style={styles.container}>
      <VStack
        className="flex items-center justify-center "
        style={styles.content}
      >
        <Image
          source={require("@/assets/images/jf_logo_full.png")}
          alt="logo"
          resizeMode="contain"
          className="w-[400px] h-[200px]"
        />
        <HStack space="sm" className="mt-3">
          <Spinner />
          <Text size="lg" className="text-white">
            Carregando...
          </Text>
        </HStack>
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: height,
    width: "100%",
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    height: "100%",
  },
});

export default Loading;
