import React from "react";

import { useSession } from "@/contexts/Authentication";
import { Redirect, Stack } from "expo-router";

import AuthCheck from "@/components/auth/AuthCheck";

export default function RootLayout() {
  const { session, isLoading } = useSession();
  console.log("-session--", session);
  if (isLoading) {
    return <AuthCheck />;
  }

  if (session) {
    return <Redirect href={"/(tabs)/(home)" as any} />;
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
