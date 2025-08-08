import React, { useEffect, useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { Badge, BadgeText } from "@/components/ui/badge";
import {
  ChevronRightIcon,
  CircleDollarSignIcon,
  SquareAsteriskIcon,
  type LucideIcon,
} from "lucide-react-native";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { MailIcon } from "lucide-react-native";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { Divider } from "@/components/ui/divider";
import { Image as RNImage } from "react-native";
import { Center } from "@/components/ui/center";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Notifications from "./components/notifications";
import { useSession } from "@/contexts/Authentication";
import { ProfileType } from "@/types/ProfileType";
import useANotifications from "@/hooks/useNotification";
import { useRouter } from "expo-router";

const DashboardLayout = (props: any) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(
    props.isSidebarVisible
  );

  function toggleSidebar() {
    setIsSidebarVisible(!isSidebarVisible);
  }

  return (
    <VStack className="h-full w-full bg-background-0">
      <Box className="md:hidden"></Box>
      <VStack className="h-full w-full">
        <HStack className="h-full w-full">
          <VStack className="w-full flex-1">{props.children}</VStack>
        </HStack>
      </VStack>
    </VStack>
  );
};

interface MainContentProps {
  setShowNotifications: (show: boolean) => void;
  profile: ProfileType | null;
  handleInvoice: () => void;
}

const MainContent = ({
  setShowNotifications,
  profile,
  handleInvoice,
}: MainContentProps) => {
  const { notifications } = useANotifications();
  return (
    <VStack className="h-full w-full mb-16 md:mb-0">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 160,
          flexGrow: 1,
        }}
      >
        <VStack className="h-full w-full pb-8" space="2xl">
          <Box className="relative w-full md:h-[478px] h-[250px] bg-[#2b2b2b3b]" />
          <HStack className="absolute pt-6 px-10 hidden md:flex">
            <Text className="text-typography-900 font-roboto">
              home &gt; {` `}
            </Text>
            <Text className="font-semibold text-typography-900 ">profile</Text>
          </HStack>
          <Center className="absolute md:mt-14 mt-6 w-full md:px-10 md:pt-6 pb-4">
            <VStack space="lg" className="items-center">
              <Avatar
                size="2xl"
                className="bg-[#2b2b2b9d] items-center justify-center"
              >
                {profile?.user.avatar ? (
                  <AvatarImage
                    source={{
                      uri: profile.user.avatar,
                    }}
                  />
                ) : (
                  <Text className="text-white font-bold text-3xl">
                    {(profile?.user.name || profile?.user.email || "User")
                      .split(" ")
                      .map((n) => n.charAt(0))
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </Text>
                )}
              </Avatar>
              <VStack className="gap-1 w-full items-center">
                <Text size="2xl" className="font-roboto text-white">
                  {profile?.user.name}
                </Text>
                <Text className="font-roboto text-sm text-typograpphy-700 text-white">
                  {profile?.user.email}
                </Text>
              </VStack>
            </VStack>
          </Center>
          <VStack className="mx-2" space="2xl">
            <VStack className="py-2 px-4 border border-primary-100 rounded-xl border-border-300 justify-between items-center bg-[#2b2b2b9d]">
              <Pressable
                onPress={() => setShowNotifications(true)}
                className="w-full"
              >
                <HStack
                  space="2xl"
                  className="justify-between items-center w-full py-3 px-2"
                >
                  <Box className="relative">
                    {notifications && notifications?.length > 0 && (
                      <Badge
                        variant="solid"
                        className="absolute -top-2 -right-3 bg-red-500 rounded-full z-10 px-[6px] py-[2px]"
                      >
                        <BadgeText className="text-white text-[10px] font-semibold">
                          {notifications?.length}
                        </BadgeText>
                      </Badge>
                    )}
                    <HStack className="items-center" space="md">
                      <Icon as={MailIcon} className="text-typography-700" />
                      <Text size="lg" className="text-typography-700">
                        Notificações
                      </Text>
                    </HStack>
                  </Box>
                  <Icon as={ChevronRightIcon} className="text-typography-700" />
                </HStack>
              </Pressable>
              <Divider orientation="horizontal" />
              <HStack
                space="2xl"
                className="justify-between items-center w-full flex-1 py-3 px-2"
              >
                <HStack className="items-center" space="md">
                  <Icon
                    as={SquareAsteriskIcon}
                    className="text-typography-700"
                  />
                  <Text size="lg" className="text-typography-700">
                    Senha
                  </Text>
                </HStack>
                <Icon as={ChevronRightIcon} className="text-typography-700" />
              </HStack>
              <Divider orientation="horizontal" />
              <Pressable onPress={handleInvoice} className="w-full">
                <HStack
                  space="2xl"
                  className="justify-between items-center w-full flex-1 py-3 px-2"
                >
                  <HStack className="items-center" space="md">
                    <Icon
                      as={CircleDollarSignIcon}
                      className="text-typography-700"
                    />
                    <Text size="lg" className="text-typography-700">
                      Financeiro
                    </Text>
                  </HStack>
                  <Icon as={ChevronRightIcon} className="text-typography-700" />
                </HStack>
              </Pressable>
            </VStack>
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  );
};

const Profile = () => {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const { getProfile } = useSession();
  const { onGetNotifications } = useANotifications();
  const profile = getProfile();

  useEffect(() => {
    onGetNotifications();
  }, []);

  const handleInvoice = () => {
    router.push(`/invoice`);
  };

  return (
    <SafeAreaView className="h-full w-full">
      <DashboardLayout title="Perfil">
        <MainContent
          setShowNotifications={setShowNotifications}
          profile={profile}
          handleInvoice={handleInvoice}
        />
      </DashboardLayout>
      <Notifications
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        profile={profile}
      />
    </SafeAreaView>
  );
};

export default Profile;
