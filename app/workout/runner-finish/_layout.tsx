import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Platform } from "react-native";

export default function RootLayout() {
  const backIcon = Platform.OS === "ios" ? "chevron-back" : "arrow-back-sharp";
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Finalizar treino",
        }}
      />
    </Stack>
  );
}
