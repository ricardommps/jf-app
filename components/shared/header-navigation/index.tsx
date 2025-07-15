import React, { useContext } from "react";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { ArrowLeftCircleIcon } from "lucide-react-native";
import { ThemeContext } from "@/contexts/theme-context";
import GoBackButton from "../go-back-button";
import { router } from "expo-router";

const HeaderNavigation = ({
  variant = "general",
  title,
  label,
}: {
  variant: "general" | "search";
  title?: string;
  label?: string;
}) => {
  const { colorMode }: any = useContext(ThemeContext);
  const isDarkMode = colorMode === "dark";
  return (
    <Box
      className={`${
        isDarkMode ? "bg-gray-900" : "bg-gray-100"
      } rounded-b-3xl overflow-hidden items-center justify-center`}
    >
      <HStack className="pt-10 px-5 gap-2 justify-between w-full max-w-screen-lg mx-auto items-center">
        <HStack className="justify-between">
          <VStack className="gap-2 justify-between">
            <Text
              className={`${
                isDarkMode ? "text-gray-300" : "text-black"
              } font-dm-sans-medium text-xl`}
            >
              {title}
            </Text>
            <HStack space="sm">
              <GoBackButton
                title="Voltar"
                icon={ArrowLeftCircleIcon}
                onPress={() => router.back()}
                active={colorMode === "light"}
              />
            </HStack>
          </VStack>
        </HStack>
        <HStack className="gap-4">
          <VStack className="justify-end">
            <Image
              source={require("@/assets/images/logo_header.png")}
              alt="logo"
              contentFit="contain"
              className="h-9 w-9"
            />
          </VStack>
        </HStack>
      </HStack>
    </Box>
  );
};

export default HeaderNavigation;
