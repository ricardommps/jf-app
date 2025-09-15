import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { useQuery } from "@tanstack/react-query";
import { getProgram } from "@/services/program.services";
import { ThemeContext } from "@/contexts/theme-context";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "expo-router";
import GymItemView from "./gym-item-view";
import {
  Dimensions,
  FlatList,
  ScrollView,
  View,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Button, ButtonText } from "@/components/ui/button";
import Loading from "@/components/shared/loading";
import { fDate } from "@/utils/format-time";
import { Workout } from "@/types/workout";
import { HomeIcon, ActiveHomeIcon } from "@/components/shared/icon";
import {
  CloseIcon,
  Icon,
  InfoIcon,
  CalendarDaysIcon,
} from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RFValue } from "react-native-responsive-fontsize";
import { Pressable } from "@/components/ui/pressable";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Heading } from "@/components/ui/heading";
import dayjs from "dayjs";
import { calendarBaseTheme } from "@/utils/calendar-base-theme";

interface Props {
  workouts: Workout[];
  programId: string;
}

type TabId = "home" | "finish" | "info";

interface TabItem {
  id: TabId;
  label: string;
  inActiveIcon: React.ElementType;
  icon: React.ElementType;
}

const tabItems: TabItem[] = [
  {
    id: "home",
    label: "Home",
    inActiveIcon: HomeIcon,
    icon: ActiveHomeIcon,
  },
  {
    id: "finish",
    label: "Finalizados",
    inActiveIcon: CalendarDaysIcon,
    icon: CalendarDaysIcon,
  },
  {
    id: "info",
    label: "Informações",
    inActiveIcon: InfoIcon,
    icon: InfoIcon,
  },
];

const GymView = ({ workouts, programId }: Props) => {
  const router = useRouter();
  const { colorMode }: any = useContext(ThemeContext);
  const isDarkMode = colorMode === "dark";
  const toUpperCaseSafe = (text: string) => text?.toUpperCase() || "";
  const flashListRef = useRef<FlatList<any>>(null);
  const { width } = Dimensions.get("window");
  const scrollRef = useRef<ScrollView>(null);
  const cardWidth = width - 24;
  const insets = useSafeAreaInsets();

  const calendarProps = useMemo(() => {
    const baseTheme = { ...calendarBaseTheme };
    return {
      theme: { ...baseTheme },
    };
  }, []);

  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const {
    data: program,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["programData", programId],
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => await getProgram(programId),
    enabled: !!programId,
  });

  const renderItem = useCallback(
    ({ item }: { item: Workout }) => {
      return <GymItemView item={item} />;
    },
    [isDarkMode]
  );

  const handleClose = () => {
    setShowActionsheet(false);
    setActiveTab(null);
  };

  const handleCloseCalendar = () => {
    setShowFinishModal(false);
    setActiveTab(null);
  };

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const historiesThisMonth = workouts
    .flatMap((workout) => workout.history || [])
    .filter((item) => {
      if (!item.executionDay) return false;
      const execDate = new Date(item.executionDay);
      return execDate >= startOfMonth && execDate <= endOfMonth;
    });

  const executionDates = historiesThisMonth?.map((item) =>
    dayjs(item.executionDay).startOf("day").format("YYYY-MM-DD")
  );

  const markedDates = executionDates.reduce((acc, date) => {
    acc[date] = {
      selected: true,
      marked: false,
      selectedColor: "#22c55e",
    };
    return acc;
  }, {} as Record<string, any>);

  useEffect(() => {
    switch (activeTab) {
      case "finish":
        setShowFinishModal(true);
        return;
      case "info":
        setShowActionsheet(true);
        return;

      case "home":
        router.replace("/(tabs)/(home)");
        return;
    }
  }, [activeTab]);

  if (error) {
    router.push(`/error/view`);
  }
  if (isLoading) {
    return <Loading />;
  }

  if (program?.message) {
    return (
      <VStack className="px-0" space="md">
        <VStack className="rounded-1xl bg-[#2b2b2b9d] gap-3 p-3">
          <Text className="text-red-700 font-bold">{program.message}</Text>
        </VStack>
      </VStack>
    );
  }

  return (
    <>
      <VStack className="px-0" space="md">
        <VStack className="rounded-1xl bg-[#2b2b2b9d] gap-3 p-3">
          <VStack className="gap-2 items-center">
            <Text className="text-typography-900 font-dm-sans-bold" size="lg">
              {toUpperCaseSafe(program?.name)}
            </Text>
            {program?.startDate && program?.endDate && (
              <Text
                className="text-typography-900 font-dm-sans-medium"
                size="sm"
              >
                {`${fDate(program.startDate, "dd/MM/yyyy")} - ${fDate(
                  program.endDate,
                  "dd/MM/yyyy"
                )}`}
              </Text>
            )}
          </VStack>
          {program?.message && <Text>{program.message}</Text>}
        </VStack>
      </VStack>

      <FlatList
        ref={flashListRef}
        data={workouts || []}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        snapToAlignment="center"
        decelerationRate="fast"
        snapToInterval={cardWidth}
        onScrollEndDrag={() => {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        }}
        viewabilityConfig={{
          waitForInteraction: true,
          itemVisiblePercentThreshold: 100,
        }}
        ListEmptyComponent={() => (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <Text className="text-typography-900">
              Nenhum treino encontrado
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
      <Box className="bg-background-0">
        <HStack
          className="bg-background-0 pt-4 px-7 rounded-t-3xl min-h-[78px]"
          style={{
            paddingBottom: Platform.OS === "ios" ? insets.bottom : 16,
            boxShadow: "0px -10px 12px 0px rgba(0, 0, 0, 0.04)",
          }}
          space="sm"
        >
          {tabItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Pressable
                key={item.id}
                className="flex-1 items-center justify-center"
                onPress={() => setActiveTab(item.id)}
              >
                <Icon
                  as={isActive ? item.icon : item.inActiveIcon}
                  size="xl"
                  className={`${
                    isActive ? "text-primary-800" : "text-background-500"
                  }`}
                />
                <Text
                  style={{ fontSize: RFValue(8) }}
                  className={`mt-1 font-medium text-center ${
                    isActive ? "text-primary-800" : "text-background-500"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </HStack>
      </Box>

      <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="px-5 bg-[#2b2b2b]">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <HStack className="justify-between w-full mt-3">
            <VStack>
              <Heading size="sm" className="font-semibold">
                Informações adicionais
              </Heading>
            </VStack>
            <Pressable onPress={handleClose}>
              <Icon
                as={CloseIcon}
                size="lg"
                className="stroke-background-500"
              />
            </Pressable>
          </HStack>

          <HStack className="items-center justify-center mt-5 w-full">
            <VStack className="gap-5 items-center">
              <Text
                className="text-typography-900 font-dm-sans-medium text-center"
                size="sm"
              >
                {program.additionalInformation}
              </Text>
            </VStack>
          </HStack>
        </ActionsheetContent>
      </Actionsheet>

      {/* Modal do calendário */}
      <Modal visible={showFinishModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowFinishModal(false)}>
          <Box className="flex-1 justify-center items-center bg-black/70">
            <TouchableWithoutFeedback>
              <Box className="bg-slate-700 m-6 rounded-2xl w-11/12 max-w-md shadow-2xl">
                <Calendar markedDates={markedDates} {...calendarProps} />
                <HStack className="justify-end mt-4 gap-2 p-5">
                  <Button onPress={handleCloseCalendar} size="sm">
                    <ButtonText>Fechar</ButtonText>
                  </Button>
                </HStack>
              </Box>
            </TouchableWithoutFeedback>
          </Box>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default GymView;
