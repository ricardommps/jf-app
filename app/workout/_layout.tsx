import { VideoCacheProvider } from "@/contexts/video-cache-context";
import { VisibilityProvider } from "@/contexts/visibility-context";
import { WorkoutProvider } from "@/contexts/WorkoutContext";
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <VideoCacheProvider>
      <VisibilityProvider>
        <WorkoutProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="view" options={{ headerShown: false }} />
          </Stack>
        </WorkoutProvider>
      </VisibilityProvider>
    </VideoCacheProvider>
  );
}
