import React, { useContext } from "react";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import ThemeCard from "@/components/screens/settings/theme-card";
import { ThemeContext } from "@/contexts/theme-context";
import CustomHeader from "@/components/shared/custom-header";
import { Button, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";

const Settings = () => {
  const router = useRouter();

  const handeTeste = () => {
    const payload = {
      distanceInMeters: "1202.00",
      durationInSeconds: "4440.00",
      paceInSeconds: "610.00",
      executionDay: "2025-06-15 12:00:00.00",
      rpe: 8,
    };
    router.push(
      `/finished?distanceInMeters=${payload.distanceInMeters}&durationInSeconds=${payload.durationInSeconds}
      &paceInSeconds=${payload.paceInSeconds}&executionDay=${payload.executionDay}&rpe=${payload.rpe}`
    );
  };
  return (
    <VStack space="md" className="bg-background-0 flex-1">
      <CustomHeader variant="general" title="Settings" />

      <VStack className="px-4" space="md">
        <Text className="font-semibold">Tema</Text>
      </VStack>
      <Button action="primary" className="w-full" onPress={handeTeste}>
        <ButtonText>Acessar conta</ButtonText>
      </Button>
    </VStack>
  );
};

export default Settings;
