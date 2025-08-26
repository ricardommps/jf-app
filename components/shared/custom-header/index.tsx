import React, { useContext } from "react";
import { HStack } from "@/components/ui/hstack";
import { SearchIcon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Mic, LogOut } from "lucide-react-native";
import { ThemeContext } from "@/contexts/theme-context";
import { useSession } from "@/contexts/Authentication";

const CustomHeader = ({
  variant = "general",
  title,
  label,
}: {
  variant: "general" | "search";
  title?: string;
  label?: string;
}) => {
  const { signOut, getProfile } = useSession();
  const { colorMode }: any = useContext(ThemeContext);
  const isDarkMode = colorMode === "dark";
  const profile = getProfile();

  return (
    <Box
      className={`${
        isDarkMode ? "bg-[#2b2b2b9d] " : "bg-gray-100"
      } rounded-b-3xl overflow-hidden mb-3 items-center justify-center`}
    >
      <HStack className="p-5 pt-16 gap-6 justify-between w-full max-w-screen-lg mx-auto items-center">
        <HStack className="items-center gap-3">
          <Image
            source={require("@/assets/images/jf_icone_v1.png")}
            alt="image"
            className="h-10 w-10"
            resizeMode="contain"
          />
          <Text
            className={`${
              isDarkMode ? "text-gray-300" : "text-black"
            } font-dm-sans-medium text-lg`}
          >
            Olá {profile?.name}!
          </Text>
        </HStack>
        <HStack className="items-center gap-3">
          <LogOut
            size={24}
            color={isDarkMode ? "#D1D5DB" : "#1F2937"}
            onPress={() => signOut()}
          />
        </HStack>
      </HStack>
      {variant === "search" && (
        <Input
          variant="outline"
          className={`border-0 ${
            isDarkMode ? "bg-gray-800" : "bg-background-50"
          } rounded-xl py-1 px-4 mt-2 mb-5 mx-auto w-full max-w-screen-md`}
          size="lg"
        >
          <InputSlot>
            <InputIcon
              as={SearchIcon}
              className={isDarkMode ? "text-gray-400" : "text-black"}
            />
          </InputSlot>
          <InputField
            placeholder={label}
            className={`placeholder:$
              {isDarkMode ? "text-gray-400" : "text-black"}
            `}
          />
          <InputSlot>
            <InputIcon
              as={Mic}
              className={isDarkMode ? "text-gray-400" : "text-black"}
            />
          </InputSlot>
        </Input>
      )}
    </Box>
  );
};

export default CustomHeader;
