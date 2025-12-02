import CalendarModalScreen from "@/components/calendar-modal";
import ExertionZone from "@/components/exertion-zone/indx";
import ExtrapolativeValidity from "@/components/extrapolative-validity";
import { ActiveHomeIcon, HomeIcon } from "@/components/shared/icon";
import Loading from "@/components/shared/loading";
import TablePace from "@/components/table-pace";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { CloseIcon, Icon, InfoIcon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ThemeContext } from "@/contexts/theme-context";
import { useCalendar } from "@/hooks/useCalendar";
import { getProgram } from "@/services/program.services";
import { ExtrapolationEntry } from "@/types/extrapolation";
import { Workout } from "@/types/workout";
import { extrapolation } from "@/utils/extrapolation";
import { fDate } from "@/utils/format-time";
import { useQuery } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { CalendarDays, FootprintsIcon } from "lucide-react-native";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  FlatListProps,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import VolumeModalScreen from "../components/volume-modal";
import RunnerItemView from "./runner-item-view";

interface Props {
  workouts: Workout[];
  programId: string;
}

type TabId = "home" | "volume" | "info";

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
    id: "volume",
    label: "Volume",
    inActiveIcon: FootprintsIcon,
    icon: FootprintsIcon,
  },
  {
    id: "info",
    label: "Informações",
    inActiveIcon: InfoIcon,
    icon: InfoIcon,
  },
];

const RunnerView = ({ workouts, programId }: Props) => {
  const router = useRouter();
  const today = new Date();
  const flashListRef = useRef<FlatList<Workout>>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { width } = Dimensions.get("window");
  const cardWidth = width - 24;

  const { data, isLoading, error } = useQuery({
    queryKey: ["programData", programId],
    queryFn: async () => await getProgram(programId),
    enabled: !!programId,
    staleTime: 0,
    gcTime: 0,
  });

  const { colorMode }: any = useContext(ThemeContext);
  const isDarkMode = colorMode === "dark";

  const [showActionsheet, setShowActionsheet] = useState(false);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[] | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    toISOStringWithTimezone(today)
  );
  const [activeTab, setActiveTab] = useState<TabId | null>(null);

  const [showExtrapolativeValidity, setShowExtrapolativeValidity] =
    useState(false);
  const [showTablePace, setShowTablePace] = useState(false);
  const [showExertionZone, setShowExertionZone] = useState(false);

  const [currentExtrapolation, setCurrentExtrapolation] =
    useState<ExtrapolationEntry | null>(null);

  const getExtrapolationByPv = (pv: number | string) => {
    const resultValue = extrapolation[pv as keyof typeof extrapolation];
    if (resultValue) {
      setCurrentExtrapolation(resultValue);
    } else {
      setCurrentExtrapolation(null);
    }
  };

  const insets = useSafeAreaInsets();

  const handleClose = () => {
    setShowActionsheet(false);
    setActiveTab(null);
  };

  const handleCloseVolume = () => {
    setShowVolumeModal(false);
    setActiveTab(null);
  };
  function toISOStringWithTimezone(date: Date): string {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const localTime = new Date(date.getTime() - offsetMs);
    return localTime.toISOString().split("T")[0];
  }

  function getFilteredWorkoutsByDate(
    workouts_: Workout[],
    targetDate: string
  ): Workout[] {
    return workouts_.filter((workout) => {
      const datePublished = toISOStringWithTimezone(
        new Date(workout.datePublished)
      );
      const workoutDateOther = workout.workoutDateOther
        ? toISOStringWithTimezone(new Date(workout.workoutDateOther))
        : null;

      if (targetDate === datePublished) {
        return true;
      }

      if (workoutDateOther && targetDate === workoutDateOther) {
        return true;
      }

      return false;
    });
  }

  const generateMarkedDatesConfig = useCallback((workouts: Workout[]) => {
    const config: {
      [key: string]: {
        color: string;
        textColor: string;
        startingDay?: boolean;
        endingDay?: boolean;
        selected?: boolean;
      };
    } = {};
    const today = toISOStringWithTimezone(new Date());

    workouts.forEach((workout) => {
      const workoutDate = toISOStringWithTimezone(
        new Date(workout.datePublished)
      );
      const workoutDateOther = workout.workoutDateOther
        ? toISOStringWithTimezone(new Date(workout.workoutDateOther))
        : null;

      if (workoutDate === today) {
        config[workoutDate] = {
          color: "#1E40AF",
          textColor: "#ffffff",
          selected: true,
          startingDay: true,
          endingDay: true,
        };
        return;
      }
      if (config[workoutDate]) {
        if (config[workoutDate].color === "#4ADE80") {
          return;
        }
        if (
          config[workoutDate].color === "#FB923C" &&
          !(workout.finished && !workout.unrealized)
        ) {
          return;
        }
        if (
          config[workoutDate].color === "#EF4444" &&
          !(workout.finished && !workout.unrealized) &&
          !(workout.finished && workout.unrealized)
        ) {
          return;
        }
      }
      if (workout.finished && !workout.unrealized) {
        config[workoutDate] = {
          color: "#4ADE80",
          textColor: "#ffffff",
          startingDay: true,
          endingDay: true,
        };
      } else if (workout.finished && workout.unrealized) {
        config[workoutDate] = {
          color: "#FB923C",
          textColor: "#ffffff",
          startingDay: true,
          endingDay: true,
        };
      } else if (!workout.finished && workoutDate < today) {
        config[workoutDate] = {
          color: "#EF4444",
          textColor: "#ffffff",
          startingDay: true,
          endingDay: true,
        };
      } else if (
        !workout.finished &&
        (workout.unrealized === false || workout.unrealized === null) &&
        workoutDate > today
      ) {
        if (workoutDateOther) {
          config[workoutDateOther] = {
            color: "#60A5FA",
            textColor: "#ffffff",
            endingDay: true,
          };
        }
        config[workoutDate] = {
          color: "#60A5FA",
          textColor: "#ffffff",
          startingDay: true,
          ...(!workoutDateOther && {
            startingDay: true,
            endingDay: true,
          }),
        };
      }
    });
    return config;
  }, []);

  const calendar = useCalendar({
    initialDate: selectedDate,
    onDateChange: (date: string | string[]) => {
      const selected = Array.isArray(date) ? date[0] : date;
      setSelectedDate(selected);
      const filtered = getFilteredWorkoutsByDate(workouts, selected);
      setFilteredWorkouts(filtered);
    },
    markedDatesConfig: generateMarkedDatesConfig(workouts),
  });

  const handleDateSelect = (date: string) => {
    const filtered = getFilteredWorkoutsByDate(workouts, date);
    setFilteredWorkouts(filtered);
    setSelectedDate(date);
    calendar.selectDate(date);
    calendar.closeModal();
  };

  useEffect(() => {
    if (workouts?.length > 0) {
      const filtered = getFilteredWorkoutsByDate(workouts, selectedDate);
      setFilteredWorkouts(filtered);
    } else {
      setFilteredWorkouts([]);
    }
  }, [workouts, selectedDate]);

  const renderItem = useCallback<
    NonNullable<FlatListProps<Workout>["renderItem"]>
  >(
    ({ item }) => <RunnerItemView isDarkMode={isDarkMode} item={item} />,
    [isDarkMode]
  );

  // ================= ANIMAÇÃO DOS ÍCONES =================
  const scaleRefs = useRef<Record<TabId, Animated.Value>>({
    home: new Animated.Value(1),
    volume: new Animated.Value(1),
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

  useEffect(() => {
    switch (activeTab) {
      case "volume":
        setShowVolumeModal(true);
        return;
      case "info":
        setShowActionsheet(true);
        return;

      case "home":
        router.replace("/(tabs)/(home)" as any);
        return;
    }
  }, [activeTab]);

  useEffect(() => {
    if (data?.pv) {
      getExtrapolationByPv(data?.pv);
    }
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }
  if (data?.message) {
    return (
      <VStack className="px-0" space="md">
        <VStack className="rounded-1xl bg-[#2b2b2b9d] gap-3 p-3">
          <Text className="text-red-700 font-bold">{data.message}</Text>
        </VStack>
      </VStack>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#000" }}
      edges={["bottom"]}
    >
      <HStack className="px-0 rounded-1xl gap-3 p-3" space="md">
        <Text
          className="text-typography-900 font-dm-sans-bold flex-1"
          size="md"
        >
          {fDate(selectedDate, "dd 'de' MMMM, yyyy")}
        </Text>
        <Pressable
          className="p-3 rounded-lg items-center justify-center"
          onPress={calendar.openModal}
        >
          <Icon
            as={CalendarDays}
            size="md"
            className="text-typography-900 font-dm-sans-bold"
          />
        </Pressable>
      </HStack>

      <FlatList
        ref={flashListRef}
        data={filteredWorkouts ?? []}
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
          <View className="flex items-center justify-center">
            <Text>Nenhum treino encontrado para esta data</Text>
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 16, padding: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
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

      <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="px-5 bg-[#2b2b2b]">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <HStack className="justify-between w-full mt-3">
            <VStack>
              <Heading size="sm" className="font-semibold">
                Informações sobre seu programa de treino
              </Heading>
              <Text size="md">Desenvolvimento 1 - 2025</Text>
            </VStack>
            <Pressable onPress={handleClose}>
              <Icon
                as={CloseIcon}
                size="lg"
                className="stroke-background-500"
              />
            </Pressable>
          </HStack>

          <HStack className="items-center w-full mt-5 gap-3">
            <Text size="lg" className="font-semibold">
              Validade Extrapolativa
            </Text>
            <Pressable onPress={() => setShowExtrapolativeValidity(true)}>
              <Icon as={InfoIcon} size="lg" />
            </Pressable>
          </HStack>

          <HStack className="items-center w-full mt-5 gap-3">
            <Text size="lg" className="font-semibold">
              Tabela - Pace X Km/h
            </Text>
            <Pressable onPress={() => setShowTablePace(true)}>
              <Icon as={InfoIcon} size="lg" />
            </Pressable>
          </HStack>

          <HStack className="items-center w-full mt-5 gap-3">
            <Text size="lg" className="font-semibold">
              Zona de esforço
            </Text>
            <Pressable onPress={() => setShowExertionZone(true)}>
              <Icon as={InfoIcon} size="lg" />
            </Pressable>
          </HStack>
          {data && (
            <>
              <HStack className="items-center w-full mt-5 gap-3">
                <Text size="lg" className="font-semibold">
                  Vo2 Max: {currentExtrapolation?.VO2 || 0}
                </Text>
              </HStack>

              <HStack className="items-center w-full mt-5 gap-3">
                <Text size="lg" className="font-semibold flex-1">
                  PV: {data?.pv || 0}
                </Text>
                <Text size="lg" className="font-semibold">
                  Pace do PV Max: {data?.pace || 0}
                </Text>
              </HStack>

              <HStack className="items-center w-full mt-5 gap-3">
                <Text size="lg" className="font-semibold flex-1">
                  VLA: {data?.vla || 0}
                </Text>
                <Text size="lg" className="font-semibold">
                  Pace VLA: {data?.paceVla || 0}
                </Text>
              </HStack>

              <HStack className="items-center w-full mt-5 gap-3">
                <Text size="lg" className="font-semibold flex-1">
                  VLAN: {data?.vlan || 0}
                </Text>
                <Text size="lg" className="font-semibold">
                  Pace VLAN: {data?.paceVlan || 0}
                </Text>
              </HStack>
            </>
          )}
        </ActionsheetContent>
      </Actionsheet>

      <CalendarModalScreen
        visible={calendar.isModalVisible}
        onRequestClose={calendar.closeModal}
        onDateSelect={handleDateSelect}
        initialDate={selectedDate}
        customMarkedDates={calendar.getMarkedDates()}
      />

      <VolumeModalScreen
        visible={showVolumeModal}
        onRequestClose={handleCloseVolume}
        programId={programId}
      />

      <ExtrapolativeValidity
        visible={showExtrapolativeValidity}
        onRequestClose={() => setShowExtrapolativeValidity(false)}
        currentExtrapolation={currentExtrapolation}
      />
      <TablePace
        visible={showTablePace}
        onRequestClose={() => setShowTablePace(false)}
      />
      <ExertionZone
        visible={showExertionZone}
        onRequestClose={() => setShowExertionZone(false)}
        data={{
          pv: data?.pv,
          pace: data?.pace,
          vla: data?.vla,
          paceVla: data?.paceVla,
          vlan: data?.vlan,
          paceVlan: data?.paceVlan,
        }}
      />
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

export default RunnerView;
