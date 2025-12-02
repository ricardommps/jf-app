import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ThemeContext } from "@/contexts/theme-context";
import { router, useNavigation } from "expo-router";
import { ArrowLeftCircleIcon } from "lucide-react-native";
import React, { useContext } from "react";
import GoBackButton from "../go-back-button";

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
        "bg-[#2b2b2b] rounded-t-3xl overflow-hidden items-center justify-center"
      }
    >
      <HStack className="pt-5 px-5 gap-2 justify-between w-full max-w-screen-lg mx-auto items-center mt-2">
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
            resizeMode="contain"
            className="h-9 w-9"
          />
        </VStack>
      </HStack>
    </Box>
  );
};

export default HeaderNavigation;
