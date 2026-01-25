import { ActiveHomeIcon, HomeIcon } from "@/components/shared/icon";
import Loading from "@/components/shared/loading";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import {
  CalendarDaysIcon,
  CloseIcon,
  Icon,
  InfoIcon,
} from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ThemeContext } from "@/contexts/theme-context";
import { getProgram } from "@/services/program.services";
import { Workout } from "@/types/workout";
import { calendarBaseTheme } from "@/utils/calendar-base-theme";
import { fDate } from "@/utils/format-time";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import GymItemView from "./gym-item-view";

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
    const theme = {
      ...calendarBaseTheme,
      textDayFontWeight: "400" as const,
      textMonthFontWeight: "600" as const,
      textDayHeaderFontWeight: "500" as const,
    };
    return { theme };
  }, []);

  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const { data: program, isLoading } = useQuery({
    queryKey: ["programData", programId],
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => await getProgram(programId),
    enabled: !!programId,
  });

  const renderItem = useCallback(
    ({ item }: { item: Workout }) => <GymItemView item={item} />,
    [isDarkMode],
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
    999,
  );

  const historiesThisMonth = workouts
    .flatMap((workout) => workout.history || [])
    .filter(
      (item) =>
        item.executionDay &&
        new Date(item.executionDay) >= startOfMonth &&
        new Date(item.executionDay) <= endOfMonth,
    );

  const executionDates = historiesThisMonth?.map((item) =>
    dayjs(item.executionDay).startOf("day").format("YYYY-MM-DD"),
  );

  const markedDates = executionDates.reduce(
    (acc, date) => {
      acc[date] = { selected: true, marked: false, selectedColor: "#22c55e" };
      return acc;
    },
    {} as Record<string, any>,
  );

  // ================= ANIMAÇÃO DOS ÍCONES =================
  const scaleRefs = useRef<Record<TabId, Animated.Value>>({
    home: new Animated.Value(1),
    finish: new Animated.Value(1),
    info: new Animated.Value(1),
  }).current;

  useEffect(() => {
    tabItems.forEach((item) => {
      Animated.spring(scaleRefs[item.id], {
        toValue: activeTab === item.id ? 1.2 : 1,
        useNativeDriver: true,
      }).start();
    });
  }, [activeTab]);

  // ================= AÇÕES DAS ABAS =================
  useEffect(() => {
    switch (activeTab) {
      case "finish":
        setShowFinishModal(true);
        return;
      case "info":
        setShowActionsheet(true);
        return;
      case "home":
        router.replace("/(tabs)/(home)" as any);
        return;
    }
  }, [activeTab]);

  if (isLoading) return <Loading />;

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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#000" }}
      edges={["bottom"]}
    >
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
                  "dd/MM/yyyy",
                )}`}
              </Text>
            )}
          </VStack>
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
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        onScrollEndDrag={() => {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        }}
      />

      {/* ================= MENU INFERIOR ================= */}
      <View
        style={[
          styles.menuContainer,
          {
            backgroundColor:
              Platform.OS === "android"
                ? isDarkMode
                  ? "#0d0d0dcc"
                  : "#ffffffcc"
                : "transparent",
            bottom: 0,
          },
        ]}
      >
        {Platform.OS === "ios" && (
          <BlurView
            intensity={60}
            tint={isDarkMode ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        )}

        <HStack
          style={[
            styles.menuContent,
            {
              paddingBottom:
                insets.bottom > 0 ? Math.min(insets.bottom, 20) : 16,
            },
          ]}
        >
          {tabItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Pressable
                key={item.id}
                className="flex-1 items-center justify-center"
                onPress={() => setActiveTab(item.id)}
              >
                <Animated.View
                  style={{ transform: [{ scale: scaleRefs[item.id] }] }}
                >
                  <Icon
                    as={isActive ? item.icon : item.inActiveIcon}
                    size="xl"
                    className={`${
                      isActive ? "text-primary-800" : "text-background-500"
                    }`}
                  />
                </Animated.View>
              </Pressable>
            );
          })}
        </HStack>
      </View>

      {/* ================= ACTIONSHEET ================= */}
      <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="px-5 bg-[#2b2b2b]">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <HStack className="justify-between w-full mt-3">
            <Heading size="sm" className="font-semibold">
              Informações adicionais
            </Heading>
            <Pressable onPress={handleClose}>
              <Icon
                as={CloseIcon}
                size="lg"
                className="stroke-background-500"
              />
            </Pressable>
          </HStack>

          <HStack className="items-center justify-center mt-5 w-full">
            <Text
              className="text-typography-900 font-dm-sans-medium text-center"
              size="sm"
            >
              {program.additionalInformation}
            </Text>
          </HStack>
        </ActionsheetContent>
      </Actionsheet>

      {/* ================= MODAL CALENDÁRIO ================= */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignSelf: "center",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 10,
    overflow: "hidden",
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 10,
  },
});

export default GymView;
