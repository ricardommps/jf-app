import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { FinishedShareData } from "@/services/finished.service";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

type Layout2Props = {
  data?: FinishedShareData | null;
  unrealizedTraining?: boolean;
};

const Layout2 = ({ unrealizedTraining }: Layout2Props) => {
  const router = useRouter();

  const handleClose = () => {
    router.replace("/(tabs)/(home)" as any);
  };

  if (!unrealizedTraining) {
    return <View style={styles.emptyContainer} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require("@/assets/images/foltz_tela.png")}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.content}>
          <VStack style={styles.messageContainer}>
            <Box>
              <Text style={styles.title}>Treino não realizado.</Text>
              <Text style={styles.subtitle}>
                Pace perfeito pra hoje: 0 km, 0 batimentos, 100% preguiça 😴
              </Text>
            </Box>
          </VStack>

          <HStack style={styles.actions}>
            <Button action="primary" size="md" style={styles.closeButton} onPress={handleClose}>
              <ButtonText>Fechar</ButtonText>
            </Button>
          </HStack>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    flex: 1,
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 48,
    justifyContent: "space-between",
  },
  messageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    maxWidth: 300,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
    textAlign: "center",
  },
  actions: {
    width: "100%",
  },
  closeButton: {
    flex: 1,
  },
});

export default Layout2;
