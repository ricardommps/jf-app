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
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
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

const tabItems = [
  { id: "home", inActiveIcon: HomeIcon, icon: ActiveHomeIcon },
  { id: "finish", inActiveIcon: CalendarDaysIcon, icon: CalendarDaysIcon },
  { id: "info", inActiveIcon: InfoIcon, icon: InfoIcon },
] as const;

const GymView = ({ workouts, programId }: Props) => {
  const router = useRouter();
  const { colorMode }: any = useContext(ThemeContext);
  const isDarkMode = colorMode === "dark";
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");
  const cardWidth = width - 24;

  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const { data: program, isLoading } = useQuery({
    queryKey: ["programData", programId],
    queryFn: () => getProgram(programId),
    enabled: !!programId,
  });

  // ================= CALENDÁRIO OTIMIZADO =================

  const markedDates = useMemo(() => {
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

    const historiesThisMonth =
      workouts
        ?.flatMap((w) => w.history || [])
        .filter(
          (item) =>
            item.executionDay &&
            new Date(item.executionDay) >= startOfMonth &&
            new Date(item.executionDay) <= endOfMonth,
        ) ?? [];

    return historiesThisMonth.reduce(
      (acc, item) => {
        const date = dayjs(item.executionDay)
          .startOf("day")
          .format("YYYY-MM-DD");

        acc[date] = {
          selected: true,
          marked: false,
          selectedColor: "#22c55e",
        };

        return acc;
      },
      {} as Record<string, any>,
    );
  }, [workouts]);

  const calendarProps = useMemo(() => {
    const theme = {
      ...calendarBaseTheme,
      textDayFontWeight: "400" as const,
      textMonthFontWeight: "600" as const,
      textDayHeaderFontWeight: "500" as const,
    };
    return { theme };
  }, []);

  // ================= RENDER ITEM ESTÁVEL =================

  const renderItem = useCallback(
    ({ item }: { item: Workout }) => <GymItemView item={item} />,
    [],
  );

  // ================= TROCA DE ABA OTIMIZADA =================

  const handleTabPress = useCallback(
    (tab: TabId) => {
      setActiveTab(tab);

      if (tab === "finish") {
        setShowFinishModal(true);
      }

      if (tab === "info") {
        setShowActionsheet(true);
      }

      if (tab === "home") {
        router.replace("/(tabs)/(home)" as any);
      }
    },
    [router],
  );

  // ================= ANIMAÇÃO =================

  const scaleRefs = useRef<Record<TabId, Animated.Value>>({
    home: new Animated.Value(1),
    finish: new Animated.Value(1),
    info: new Animated.Value(1),
  }).current;

  useMemo(() => {
    tabItems.forEach((item) => {
      Animated.spring(scaleRefs[item.id], {
        toValue: activeTab === item.id ? 1.2 : 1,
        useNativeDriver: true,
      }).start();
    });
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
              {program?.name?.toUpperCase()}
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

      {/* ================= FLASHLIST ================= */}

      <FlashList
        data={workouts ?? []}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        snapToInterval={cardWidth + 16}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        drawDistance={250}
        contentContainerStyle={{
          paddingBottom: 80,
          paddingTop: 16,
          paddingHorizontal: 12,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
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
                onPress={() => handleTabPress(item.id)}
              >
                <Animated.View
                  style={{ transform: [{ scale: scaleRefs[item.id] }] }}
                >
                  <Icon
                    as={isActive ? item.icon : item.inActiveIcon}
                    size="xl"
                    className={
                      isActive ? "text-primary-800" : "text-background-500"
                    }
                  />
                </Animated.View>
              </Pressable>
            );
          })}
        </HStack>
      </View>

      {/* ================= ACTIONSHEET ================= */}

      <Actionsheet
        isOpen={showActionsheet}
        onClose={() => setShowActionsheet(false)}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="px-5 bg-[#2b2b2b]">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <HStack className="justify-between w-full mt-3">
            <Heading size="sm">Informações adicionais</Heading>
            <Pressable onPress={() => setShowActionsheet(false)}>
              <Icon as={CloseIcon} size="lg" />
            </Pressable>
          </HStack>

          <HStack className="items-center justify-center mt-5 w-full">
            <Text
              className="text-typography-900 font-dm-sans-medium text-center"
              size="sm"
            >
              {program?.additionalInformation}
            </Text>
          </HStack>
        </ActionsheetContent>
      </Actionsheet>

      {/* ================= MODAL CALENDÁRIO ================= */}

      <Modal visible={showFinishModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowFinishModal(false)}>
          <Box className="flex-1 justify-center items-center bg-black/70">
            <TouchableWithoutFeedback>
              <Box className="bg-slate-700 m-6 rounded-2xl w-11/12 max-w-md">
                <Calendar markedDates={markedDates} {...calendarProps} />
                <HStack className="justify-end mt-4 gap-2 p-5">
                  <Button onPress={() => setShowFinishModal(false)} size="sm">
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
