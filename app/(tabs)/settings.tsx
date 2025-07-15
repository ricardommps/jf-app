import React, { useContext } from "react";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import RedirectCard from "@/components/screens/settings/redirect-card";
import { Settings2, User } from "lucide-react-native";
import { SettingsIcon, SunIcon, MoonIcon } from "@/components/ui/icon";
import { HStack } from "@/components/ui/hstack";
import ThemeCard from "@/components/screens/settings/theme-card";
import { ThemeContext } from "@/contexts/theme-context";
import CustomHeader from "@/components/shared/custom-header";

const Settings = () => {
  const { colorMode, setColorMode }: any = useContext(ThemeContext);

  return (
    <VStack space="md" className="bg-background-0 flex-1">
      <CustomHeader variant="general" title="Settings" />

      <VStack className="px-4" space="md">
        <Text className="font-semibold">Tema</Text>
        <HStack space="sm">
          <ThemeCard
            title="Modo escuro"
            icon={MoonIcon}
            onPress={() => setColorMode("dark")}
            active={colorMode === "dark"}
          />

          <ThemeCard
            title="Modo claro"
            icon={SunIcon}
            onPress={() => setColorMode("light")}
            active={colorMode === "light"}
          />
        </HStack>
      </VStack>
    </VStack>
  );
};

export default Settings;
