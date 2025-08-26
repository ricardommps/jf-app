import React, { useContext } from "react";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { ArrowLeftCircleIcon } from "lucide-react-native";
import { ThemeContext } from "@/contexts/theme-context";
import GoBackButton from "../go-back-button";
import { router, useNavigation } from "expo-router";

const HeaderNavigation = ({ title }: { title?: string }) => {
  const { colorMode }: any = useContext(ThemeContext);
  const navigation = useNavigation();
  const isDarkMode = colorMode === "dark";
  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/(home)");
    }
  };
  return (
    <Box
      className={
        "bg-[#2b2b2b9d] rounded-b-3xl overflow-hidden items-center justify-center"
      }
    >
      <HStack className="pt-10 px-5 gap-2 justify-between w-full max-w-screen-lg mx-auto items-center">
        <VStack className="gap-1 flex-1 min-w-0">
          <Text
            className={`${
              isDarkMode ? "text-gray-300" : "text-black"
            } font-dm-sans-medium text-xl`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          <HStack space="sm" className="flex-shrink-0">
            <GoBackButton
              title="Voltar"
              icon={ArrowLeftCircleIcon}
              onPress={handleBack}
              active={colorMode === "light"}
            />
          </HStack>
        </VStack>

        <VStack className="justify-end flex-shrink-0 ml-2">
          <Image
            source={require("@/assets/images/jf_icone_v1.png")}
            alt="logo"
            contentFit="contain"
            className="h-9 w-9"
          />
        </VStack>
      </HStack>
    </Box>
  );
};

export default HeaderNavigation;
