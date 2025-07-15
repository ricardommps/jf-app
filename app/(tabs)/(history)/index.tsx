import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useState } from "react";
import { ScrollView } from "@/components/ui/scroll-view";
import { Icon, SadIcon } from "@/components/ui/icon";
import {
  Clock10Icon,
  FootprintsIcon,
  MessageCircleIcon,
  RouteIcon,
} from "lucide-react-native";
import { Divider } from "@/components/ui/divider";
import { Pressable } from "@/components/ui/pressable";
import Comments from "./components/comments";

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

const renderCardGym = (setShowComments: (show: boolean) => void) => (
  <Box className="bg-gray-900 rounded-xl p-4 mb-2 flex-row justify-between min-h-[100px]">
    <VStack className="p-2">
      <Text className="text-typography-900 text-base font-semibold mt-1">
        Peitoral e dorsais
      </Text>
      <HStack className="pt-4 relative gap-4">
        <Pressable onPress={() => setShowComments(true)}>
          <Box className="pt-2 relative">
            <Icon
              as={MessageCircleIcon}
              className="text-typography-700"
              size="xl"
            />
            <Box className="absolute -right-1 bg-warning-500 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">2</Text>
            </Box>
          </Box>
        </Pressable>
        <VStack className="items-center">
          <Icon as={SadIcon} size="xl" className="text-background-700" />
          <Text className="text-xs text-typography-700 mt-1">Esforço</Text>
          <Text className="text-xs text-typography-900">8</Text>
        </VStack>
      </HStack>
    </VStack>
    <Box className="items-center mt-1 text-lg">
      <Text className="text-center">Realizado em</Text>
      <Text className="text-typography-900 text-sm text-center capitalize">
        {"Abril"}
      </Text>
      <Text className="text-typography-900 text-2xl font-bold text-center">
        {"22"}
      </Text>
    </Box>
  </Box>
);

const renderCardRunner = (setShowComments: (show: boolean) => void) => (
  <Box className="bg-gray-900 rounded-xl p-4 mb-2 min-h-[100px] justify-between">
    <HStack className="justify-between">
      <VStack className="p-2">
        <Text className="text-typography-900 text-base font-semibold mt-1">
          Rodagem
        </Text>
        <HStack className="pt-2 relative w-[32px] h-[32px] gap-4">
          <Pressable onPress={() => setShowComments(true)}>
            <Box className="pt-2 relative w-[32px] h-[32px]">
              <Icon
                as={MessageCircleIcon}
                className="text-typography-700"
                size="xl"
              />
              <Box className="absolute -right-1 bg-success-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">1</Text>
              </Box>
            </Box>
          </Pressable>
        </HStack>
      </VStack>
      <Box className="items-center mt-1 text-lg">
        <Text className="text-center">Realizado em</Text>
        <Text className="text-typography-900 text-sm text-center capitalize">
          Abril
        </Text>
        <Text className="text-typography-900 text-2xl font-bold text-center">
          19
        </Text>
      </Box>
    </HStack>

    {/* Footer com ícones e textos */}
    <HStack className="pt-6 justify-around">
      <VStack className="items-center">
        <Icon as={RouteIcon} size="xl" className="text-background-700" />
        <Text className="text-xs text-typography-700 mt-1">Distância</Text>
        <Text className="text-xs text-typography-900">5.03 km</Text>
      </VStack>
      <Divider orientation="vertical" className="bg-gray-300 rounded" />
      <VStack className="items-center">
        <Icon as={FootprintsIcon} size="xl" className="text-background-700" />
        <Text className="text-xs text-typography-700 mt-1">Pace Médio</Text>
        <Text className="text-xs text-typography-900">5.58</Text>
      </VStack>
      <Divider orientation="vertical" className="bg-gray-300 rounded" />
      <VStack className="items-center">
        <Icon as={Clock10Icon} size="xl" className="text-background-700" />
        <Text className="text-xs text-typography-700 mt-1">Tempo</Text>
        <Text className="text-xs text-typography-900">30min</Text>
      </VStack>
      <Divider orientation="vertical" className="bg-gray-300 rounded" />
      <VStack className="items-center">
        <Icon as={SadIcon} size="xl" className="text-background-700" />
        <Text className="text-xs text-typography-700 mt-1">Esforço</Text>
        <Text className="text-xs text-typography-900">8</Text>
      </VStack>
    </HStack>
  </Box>
);

interface MainContentProps {
  setShowComments: (show: boolean) => void;
}

const MainContent = ({ setShowComments }: MainContentProps) => {
  return (
    <VStack className="h-full w-full mb-16 px-2 pt-8">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 160,
          flexGrow: 1,
        }}
      >
        <VStack className="h-full w-full pb-8" space="2xl">
          {renderCardGym(setShowComments)}
          {renderCardRunner(setShowComments)}
        </VStack>
      </ScrollView>
    </VStack>
  );
};

const History = () => {
  const [showComments, setShowComments] = useState(false);
  return (
    <SafeAreaView className="h-full w-full">
      <DashboardLayout title="Histórico">
        <VStack className="h-full w-full items-center justify-center py-12">
          <Text size="2xl" className="text-typography-900 font-roboto">
            Histórico do mês atual
          </Text>
          <MainContent setShowComments={setShowComments} />
        </VStack>
      </DashboardLayout>
      <Comments open={showComments} onClose={() => setShowComments(false)} />
    </SafeAreaView>
  );
};

export default History;
