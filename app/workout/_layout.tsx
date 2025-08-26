import { WorkoutProvider } from "@/contexts/WorkoutContext";
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <WorkoutProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="view" options={{ headerShown: false }} />
      </Stack>
    </WorkoutProvider>
  );
}
