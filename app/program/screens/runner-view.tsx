import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { ThemeContext } from "@/contexts/theme-context";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { CloseIcon, Icon, InfoIcon, VolumeIcon } from "@/components/ui/icon";
import { CalendarDays } from "lucide-react-native";
import {
  Dimensions,
  FlatList,
  FlatListProps,
  ScrollView,
  View,
  Platform,
} from "react-native";
import { Box } from "@/components/ui/box";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Heading } from "@/components/ui/heading";
import { Pressable } from "@/components/ui/pressable";
import { Workout } from "@/types/workout";
import RunnerItemView from "./runner-item-view";
import { fDate } from "@/utils/format-time";
import CalendarModalScreen from "@/components/calendar-modal";
import { useCalendar } from "@/hooks/useCalendar";
import { HomeIcon, ActiveHomeIcon } from "@/components/shared/icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RFValue } from "react-native-responsive-fontsize";
import VolumeModalScreen from "../components/volume-modal";
import ExtrapolativeValidity from "@/components/extrapolative-validity";
import TablePace from "@/components/table-pace";
import ExertionZone from "@/components/exertion-zone/indx";
import { useQuery } from "@tanstack/react-query";
import { getProgram } from "@/services/program.services";
import { useRouter } from "expo-router";
import Loading from "@/components/shared/loading";
import { extrapolation } from "@/utils/extrapolation";
import { ExtrapolationEntry } from "@/types/extrapolation";

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
    inActiveIcon: VolumeIcon,
    icon: VolumeIcon,
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
      return targetDate === datePublished;
    });
  }

  const generateMarkedDatesConfig = useCallback((workouts: Workout[]) => {
    const config: { [key: string]: { color: string; textColor: string } } = {};
    const today = toISOStringWithTimezone(new Date());

    workouts.forEach((workout) => {
      const workoutDate = toISOStringWithTimezone(
        new Date(workout.datePublished)
      );
      if (workoutDate === today) {
        config[workoutDate] = { color: "#1E40AF", textColor: "#ffffff" };
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
        config[workoutDate] = { color: "#4ADE80", textColor: "#ffffff" };
      } else if (workout.finished && workout.unrealized) {
        config[workoutDate] = { color: "#FB923C", textColor: "#ffffff" };
      } else if (!workout.finished && workoutDate < today) {
        config[workoutDate] = { color: "#EF4444", textColor: "#ffffff" };
      } else if (
        !workout.finished &&
        (workout.unrealized === false || workout.unrealized === null) &&
        workoutDate > today
      ) {
        config[workoutDate] = { color: "#60A5FA", textColor: "#ffffff" };
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

  // Atualizar a configuração quando os workouts mudarem
  // useEffect(() => {
  //   const newConfig = generateMarkedDatesConfig(workouts);
  //   calendar.setMarkedDatesConfig(newConfig);
  // }, [workouts, generateMarkedDatesConfig, calendar]);

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
  useEffect(() => {
    switch (activeTab) {
      case "volume":
        setShowVolumeModal(true);
        return;
      case "info":
        setShowActionsheet(true);
        return;
    }
  }, [activeTab]);

  useEffect(() => {
    if (data?.pv) {
      getExtrapolationByPv(data.pv);
    }
  }, [data]);

  if (error) {
    router.push(`/error/view`);
  }
  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
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
        <ActionsheetContent className="px-5">
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
              Tabela Pace km-h
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
        onDateSelect={(date) => {
          const filtered = getFilteredWorkoutsByDate(workouts, date);
          setFilteredWorkouts(filtered);
          setSelectedDate(date);
          calendar.selectDate(date);
          calendar.closeModal();
        }}
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
    </>
  );
};

export default RunnerView;
