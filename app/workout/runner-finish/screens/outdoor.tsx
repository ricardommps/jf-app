import { DistancePicker, TimePicker } from "@/components/picker-modal";
import Loading from "@/components/shared/loading";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import {
  HappyIcon,
  Icon,
  NeutralIcon,
  SadIcon,
  VeryHappyIcon,
  VerySadIcon,
} from "@/components/ui/icon";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { ThemeContext } from "@/contexts/theme-context";
import {
  convertMetersToKilometersFormat,
  convertPaceToSpeed,
  convertSecondsToHourMinuteFormat,
} from "@/utils/convertValues";
import { convertDate } from "@/utils/format-time";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { CalendarDays } from "lucide-react-native";
import { useContext, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { z } from "zod";

import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";

import { ActivityMap } from "@/components/activity-map";
import Header from "@/components/header";
import {
  useStravaActivities,
  useStravaStatus,
} from "@/hooks/useConnectStrava/useConnectStrava";
import { finishedWorkout } from "@/services/finished.service";
import { calendarBaseTheme } from "@/utils/calendar-base-theme";
import { FontAwesome5 } from "@expo/vector-icons";

interface FormData {
  activityUrl: string;
  activityId: string;
  platform: string;
  notes: string;
}

const workoutSchema = z.object({
  workoutsId: z.string(),
  rpe: z.number(),
  trimp: z.number(),
  link: z.string(),
  linkstrava: z.string(),
  comments: z.string(),
  outdoor: z.boolean(),
  source: z.string().optional(),
  externalId: z.number().nullable().optional(),
  summaryPolyline: z.string().nullable().optional(),
  stravaActivityName: z.string().nullable().optional(),
  stravaActivityType: z.string().nullable().optional(),
  stravaSportType: z.string().nullable().optional(),
  stravaWorkoutType: z.number().nullable().optional(),
  stravaDeviceName: z.string().nullable().optional(),
  stravaTimezone: z.string().nullable().optional(),
  stravaStartDate: z.string().nullable().optional(),
  stravaStartDateLocal: z.string().nullable().optional(),
  elapsedTimeInSeconds: z.number().nullable().optional(),
  totalElevationGain: z.number().nullable().optional(),
  averageHeartrate: z.number().nullable().optional(),
  maxHeartrate: z.number().nullable().optional(),
  averageCadence: z.number().nullable().optional(),
  calories: z.number().nullable().optional(),
  startLatitude: z.number().nullable().optional(),
  startLongitude: z.number().nullable().optional(),
  endLatitude: z.number().nullable().optional(),
  endLongitude: z.number().nullable().optional(),
  locationLabel: z.string().nullable().optional(),
  locationCity: z.string().nullable().optional(),
  locationState: z.string().nullable().optional(),
  locationCountry: z.string().nullable().optional(),
  distanceInMeters: z
    .number()
    .min(1, "A distância deve ser maior que 0")
    .refine((val) => val > 0, { message: "Campo distância obrigatório" }),
  durationInSeconds: z
    .number()
    .min(1, "O tempo deve ser maior que 0")
    .refine((val) => val > 0, { message: "Campo tempo total obrigatório" }),
  paceInSeconds: z.number(),
  executionDay: z
    .string()
    .min(1, "Data de realização do treino obrigatório")
    .refine((val) => val !== null && val !== "", {
      message: "Data de realização do treino obrigatório",
    }),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

interface Props {
  safeId: string;
  titleStr?: string;
  subtitle?: string;
}

type StravaImportedActivity = {
  id?: number;
  name?: string | null;
  type?: string | null;
  sport_type?: string | null;
  workout_type?: number | null;
  device_name?: string | null;
  timezone?: string | null;
  start_date?: string | null;
  start_date_local?: string | null;
  moving_time?: number | null;
  elapsed_time?: number | null;
  total_elevation_gain?: number | null;
  average_heartrate?: number | null;
  max_heartrate?: number | null;
  average_cadence?: number | null;
  calories?: number | null;
  distance?: number | null;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  map?: {
    summary_polyline?: string | null;
  } | null;
  start_latlng?: [number, number] | null;
  end_latlng?: [number, number] | null;
};

const formatIntegerMetricLabel = (
  value?: number | null,
  suffix?: string,
): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  const formattedValue = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));

  return suffix ? `${formattedValue} ${suffix}` : formattedValue;
};

function ImportedMetricLabel({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="mb-3 w-1/2 pr-2">
      <Text className="text-[12px] font-semibold tracking-[0.4px] text-[#818898]">
        {label}
      </Text>
      <Text className="mt-1 text-[20px] font-bold text-white">{value}</Text>
    </View>
  );
}

const OutdoorScreen = ({
  safeId,
  titleStr,
  subtitle,
}: Props) => {
  const router = useRouter();
  const toast = useToast();

  const { colorMode }: any = useContext(ThemeContext);
  const isDarkMode = colorMode === "dark";

  const { data: stravaData } = useStravaStatus();
  const isConnected = stravaData?.connected ?? false;

  const [modalVisible, setModalVisible] = useState(false);

  const [showDistancePicker, setDistanceShowPicker] = useState(false);
  const [showTimePicker, setTimeShowPicker] = useState(false);
  const [showPacePicker, setPaceShowPicker] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [toastId, setToastId] = useState<string>("");

  const [isImporting, setIsImporting] = useState(false);
  const [stravaImportMessage, setStravaImportMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [activityPolyline, setActivityPolyline] = useState<string | null>(null);

  const defaultValues = useMemo(
    () => ({
      rpe: 0,
      trimp: 0,
      link: "",
      linkstrava: "",
      comments: "",
      workoutsId: safeId,
      outdoor: true,
      source: "",
      externalId: null,
      summaryPolyline: null,
      stravaActivityName: null,
      stravaActivityType: null,
      stravaSportType: null,
      stravaWorkoutType: null,
      stravaDeviceName: null,
      stravaTimezone: null,
      stravaStartDate: null,
      stravaStartDateLocal: null,
      elapsedTimeInSeconds: null,
      totalElevationGain: null,
      averageHeartrate: null,
      maxHeartrate: null,
      averageCadence: null,
      calories: null,
      startLatitude: null,
      startLongitude: null,
      endLatitude: null,
      endLongitude: null,
      locationLabel: null,
      locationCity: null,
      locationState: null,
      locationCountry: null,
      distanceInMeters: 0,
      durationInSeconds: 0,
      paceInSeconds: 0,
      executionDay: "",
    }),
    [safeId],
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues,
  });

  const values = watch();
  const watchedExecutionDay = watch("executionDay");
  const distanceInMeters = watch("distanceInMeters");
  const durationInSeconds = watch("durationInSeconds");
  const paceInSeconds = watch("paceInSeconds");
  const watchedRpe = watch("rpe");
  const trimp = watch("trimp");
  const watchedLinkStrava = watch("linkstrava");
  const watchedTotalElevationGain = watch("totalElevationGain");
  const watchedAverageHeartrate = watch("averageHeartrate");
  const watchedAverageCadence = watch("averageCadence");
  const watchedCalories = watch("calories");

  const { refetch: refetchStravaActivities } =
    useStravaActivities(watchedExecutionDay);

  const calendarProps = useMemo(() => {
    const baseTheme = { ...calendarBaseTheme };
    return {
      theme: { ...baseTheme },
    };
  }, []);

  const handleDayPress = (day: { dateString: string }) => {
    setValue("executionDay", day.dateString);
    setModalVisible(false);
  };

  const clearStravaFields = () => {
    setValue("distanceInMeters", 0);
    setValue("durationInSeconds", 0);
    setValue("paceInSeconds", 0);
    setValue("linkstrava", "");
    setValue("source", "");
    setValue("externalId", null);
    setValue("summaryPolyline", null);
    setValue("stravaActivityName", null);
    setValue("stravaActivityType", null);
    setValue("stravaSportType", null);
    setValue("stravaWorkoutType", null);
    setValue("stravaDeviceName", null);
    setValue("stravaTimezone", null);
    setValue("stravaStartDate", null);
    setValue("stravaStartDateLocal", null);
    setValue("elapsedTimeInSeconds", null);
    setValue("totalElevationGain", null);
    setValue("averageHeartrate", null);
    setValue("maxHeartrate", null);
    setValue("averageCadence", null);
    setValue("calories", null);
    setValue("startLatitude", null);
    setValue("startLongitude", null);
    setValue("endLatitude", null);
    setValue("endLongitude", null);
    setValue("locationLabel", null);
    setValue("locationCity", null);
    setValue("locationState", null);
    setValue("locationCountry", null);
    setActivityPolyline(null); // 👈 importante
  };

  // Atualize o handleImportFromStrava
  const handleImportFromStrava = async (event?: any) => {
    event?.stopPropagation?.();
    event?.preventDefault?.();

    if (!watchedExecutionDay) return;

    setIsImporting(true); // ✅ controle manual
    setStravaImportMessage(null);

    try {
      const { data } = await refetchStravaActivities();
      const importedActivity = data as StravaImportedActivity | null;

      if (!importedActivity || importedActivity.type !== "Run") {
        clearStravaFields();
        setStravaImportMessage({
          type: "error",
          text: "Nenhum treino de corrida encontrado para o dia informado.",
        });
        return;
      }

      const adjustedDistance = Math.round(
        Number(importedActivity.distance ?? 0) / 10,
      );

      let paceForPicker = 0;
      if (
        Number(importedActivity.moving_time ?? 0) > 0 &&
        Number(importedActivity.distance ?? 0) > 0
      ) {
        const distanceKm = Number(importedActivity.distance) / 1000;
        const totalPaceSeconds = Math.round(
          Number(importedActivity.moving_time) / distanceKm,
        );
        const paceMinutes = Math.floor(totalPaceSeconds / 60);
        const paceSeconds = totalPaceSeconds % 60;
        paceForPicker = paceMinutes * 100 + paceSeconds;
      }

      const locationParts = [
        importedActivity.location_city?.trim(),
        importedActivity.location_state?.trim(),
        importedActivity.location_country?.trim(),
      ].filter(Boolean);

      const locationLabel = locationParts.length
        ? locationParts.join(", ")
        : null;

      setValue("distanceInMeters", adjustedDistance);
      setValue("durationInSeconds", Number(importedActivity.moving_time ?? 0));
      setValue("paceInSeconds", paceForPicker);
      setValue(
        "linkstrava",
        `https://www.strava.com/activities/${importedActivity.id}`,
      );
      setValue("source", "strava");
      setValue("externalId", importedActivity.id ?? null);
      setValue(
        "summaryPolyline",
        importedActivity.map?.summary_polyline?.trim() ?? null,
      );
      setValue("stravaActivityName", importedActivity.name?.trim() ?? null);
      setValue("stravaActivityType", importedActivity.type?.trim() ?? null);
      setValue("stravaSportType", importedActivity.sport_type?.trim() ?? null);
      setValue("stravaWorkoutType", importedActivity.workout_type ?? null);
      setValue(
        "stravaDeviceName",
        importedActivity.device_name?.trim() ?? null,
      );
      setValue("stravaTimezone", importedActivity.timezone?.trim() ?? null);
      setValue("stravaStartDate", importedActivity.start_date ?? null);
      setValue(
        "stravaStartDateLocal",
        importedActivity.start_date_local ?? null,
      );
      setValue("elapsedTimeInSeconds", importedActivity.elapsed_time ?? null);
      setValue(
        "totalElevationGain",
        importedActivity.total_elevation_gain ?? null,
      );
      setValue("averageHeartrate", importedActivity.average_heartrate ?? null);
      setValue("maxHeartrate", importedActivity.max_heartrate ?? null);
      setValue("averageCadence", importedActivity.average_cadence ?? null);
      setValue("calories", importedActivity.calories ?? null);
      setValue("startLatitude", importedActivity.start_latlng?.[0] ?? null);
      setValue("startLongitude", importedActivity.start_latlng?.[1] ?? null);
      setValue("endLatitude", importedActivity.end_latlng?.[0] ?? null);
      setValue("endLongitude", importedActivity.end_latlng?.[1] ?? null);
      setValue("locationLabel", locationLabel);
      setValue("locationCity", importedActivity.location_city?.trim() ?? null);
      setValue(
        "locationState",
        importedActivity.location_state?.trim() ?? null,
      );
      setValue(
        "locationCountry",
        importedActivity.location_country?.trim() ?? null,
      );

      setActivityPolyline(importedActivity.map?.summary_polyline ?? null);

      setStravaImportMessage({
        type: "success",
        text: "Dados importados do Strava com sucesso ✅",
      });
    } catch (error) {
      clearStravaFields(); // ✅ limpa quando der erro na requisição

      setStravaImportMessage({
        type: "error",
        text: "Erro ao importar dados do Strava.",
      });
    } finally {
      setIsImporting(false); // ✅ sempre limpa ao terminar
    }
  };
  async function onSubmit(data: WorkoutFormData) {
    setIsLoading(true);
    try {
      const payload = Object.assign({}, data);
      payload.workoutsId = safeId;
      payload.distanceInMeters = Number(payload.distanceInMeters);
      payload.durationInSeconds = Number(payload.durationInSeconds);
      payload.rpe = Number(payload.rpe);
      payload.link = payload.link;
      payload.linkstrava = payload.linkstrava;
      payload.paceInSeconds = Number(payload.paceInSeconds);
      payload.executionDay = convertDate(payload.executionDay);
      await finishedWorkout(payload);

      router.push(
        {
          pathname: "/finished",
          params: {
            distanceInMeters: String(payload.distanceInMeters),
            durationInSeconds: String(payload.durationInSeconds),
            paceInSeconds: String(payload.paceInSeconds),
            rpe: String(payload.rpe),
            title: titleStr ?? "",
            subtitle: subtitle ?? "",
            trimp: String(payload.trimp ?? 0),
          },
        } as any,
      );
    } catch (err) {
      const parsedError = err as Error;
      if (!toast.isActive(toastId)) {
        showNewToast(parsedError.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const showNewToast = (message: string) => {
    const newId = Math.random().toString();
    setToastId(newId);
    toast.show({
      id: newId,
      placement: "top",
      duration: 9000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Box className="mt-12">
            <Toast nativeID={uniqueToastId} action="error" variant="solid">
              <ToastTitle>Erro ao finalizar treino</ToastTitle>
              <ToastDescription>{message}</ToastDescription>
            </Toast>
          </Box>
        );
      },
    });
  };

  const colors = [
    {
      value: 10,
      color: "bg-red-600/60",
      label: "Extremamente pesado",
      icon: VerySadIcon,
    },
    { value: 9, color: "bg-orange-800/60", label: "", icon: SadIcon },
    { value: 8, color: "bg-orange-700/60", label: "", icon: SadIcon },
    {
      value: 7,
      color: "bg-orange-600/60",
      label: "Muito pesado",
      icon: SadIcon,
    },
    { value: 6, color: "bg-orange-500/60", label: "", icon: NeutralIcon },
    { value: 5, color: "bg-amber-400/60", label: "Pesado", icon: NeutralIcon },
    {
      value: 4,
      color: "bg-yellow-400/60",
      label: "Um pouquinho pesado",
      icon: NeutralIcon,
    },
    { value: 3, color: "bg-yellow-300/60", label: "Moderado", icon: HappyIcon },
    { value: 2, color: "bg-lime-400/60", label: "Leve", icon: VeryHappyIcon },
    {
      value: 1,
      color: "bg-green-500/60",
      label: "Muito Leve",
      icon: VeryHappyIcon,
    },
    {
      value: 0,
      color: "bg-green-600/60",
      label: "Repouso",
      icon: VeryHappyIcon,
    },
  ];

  const getTrimp = () => {
    const durationInSeconds = Number(values.durationInSeconds);
    if (durationInSeconds > 0) {
      const durationInMinutes = durationInSeconds / 60;
      const trimp = durationInMinutes * values.rpe;
      const formattedTrimp = trimp.toFixed(2);
      setValue("trimp", Number(formattedTrimp));
      return formattedTrimp;
    }
    return 0;
  };

  useEffect(() => {
    getTrimp();
  }, [values.durationInSeconds, values.rpe]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-black">
      <Header title="Finalizar treino outdoor" />
      <ScrollView>
        <Box className="px-4 pt-2">
          <Pressable onPress={() => setModalVisible(true)} className="w-full">
            <Box pointerEvents="none">
              <Text className="text-typography-600 text-base">
                Data de realização do treino
              </Text>
              <Input
                variant="rounded"
                className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                size="lg"
              >
                <InputField
                  editable={false}
                  value={
                    watchedExecutionDay
                      ? dayjs(watchedExecutionDay).format("DD/MM/YYYY")
                      : ""
                  }
                  placeholder="DD/MM/YYYY"
                  className="placeholder:text-typography-400"
                />
                <InputSlot className="pr-3">
                  <CalendarDays color="#4B5563" size={20} />
                </InputSlot>
              </Input>
            </Box>
          </Pressable>
          {errors.executionDay && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.executionDay.message}
            </Text>
          )}
        </Box>
        {isConnected && watchedExecutionDay && (
          <>
            <Box className="px-4 pt-2">
              <TouchableOpacity
                activeOpacity={0.8}
                className="flex-row items-center justify-center bg-[#FC4C02] py-3 rounded-xl gap-2"
                onPress={(e) => handleImportFromStrava(e)}
                disabled={isImporting} // ✅ aqui
              >
                <FontAwesome5 name="strava" size={18} color="#fff" />
                <Text className="text-white font-semibold text-sm">
                  {isImporting ? "Importando..." : "Importar treino do Strava"}
                </Text>
              </TouchableOpacity>

              {stravaImportMessage && (
                <Text
                  className={`text-sm mt-2 text-center ${
                    stravaImportMessage.type === "success"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {stravaImportMessage.text}
                </Text>
              )}
            </Box>
            {activityPolyline && (
              <Box className="px-4 pt-4">
                <ActivityMap encodedPolyline={activityPolyline} />
              </Box>
            )}
            {watchedLinkStrava && (
              <Box className="px-4 pt-2">
                <Text className="text-typography-600 text-base mb-1">
                  Link do Strava
                </Text>
                <Controller
                  control={control}
                  name="linkstrava"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      variant="rounded"
                      className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                      size="lg"
                      isDisabled
                    >
                      <InputField
                        editable
                        value={value}
                        onChangeText={onChange}
                        placeholder="Link do Strava"
                        className="placeholder:text-typography-400"
                        autoComplete="off"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </Input>
                  )}
                />
              </Box>
            )}
            {watchedLinkStrava && (
              <Box className="px-4 pt-3">
                <Text className="text-typography-600 text-base mb-2">
                  Dados importados do Strava
                </Text>
                <View className="rounded-xl bg-[#191b20] px-4 py-4">
                  <View className="flex-row flex-wrap">
                    <ImportedMetricLabel
                      label="GANHO DE ELEVAÇÃO"
                      value={formatIntegerMetricLabel(
                        watchedTotalElevationGain,
                        "m",
                      )}
                    />
                    <ImportedMetricLabel
                      label="FC MÉDIA"
                      value={formatIntegerMetricLabel(
                        watchedAverageHeartrate,
                        "bpm",
                      )}
                    />
                    <ImportedMetricLabel
                      label="CADÊNCIA"
                      value={formatIntegerMetricLabel(
                        typeof watchedAverageCadence === "number"
                          ? watchedAverageCadence * 2
                          : null,
                        "spm",
                      )}
                    />
                    <ImportedMetricLabel
                      label="CALORIAS"
                      value={formatIntegerMetricLabel(watchedCalories)}
                    />
                  </View>
                </View>
              </Box>
            )}
          </>
        )}
        <Box className="px-4 pt-5">
          <Text className="text-typography-600 text-base mb-1">
            Link do relógio
          </Text>
          <Controller
            control={control}
            name="link"
            render={({ field: { onChange, value } }) => (
              <Input
                variant="rounded"
                className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                size="lg"
              >
                <InputField
                  editable
                  value={value}
                  onChangeText={onChange}
                  placeholder="Cole o link da atividade"
                  className="placeholder:text-typography-400"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Input>
            )}
          />
        </Box>
        {/* Campo de distância */}
        <Box className="px-4 pt-2">
          <Pressable
            className="w-full"
            onPress={() => setDistanceShowPicker(true)}
            disabled={isImporting}
          >
            <Box pointerEvents="none">
              <Text className="text-typography-600 text-base">
                Distância (km)
              </Text>
              <Input
                variant="rounded"
                className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                size="lg"
              >
                <InputField
                  editable={false}
                  value={convertMetersToKilometersFormat(distanceInMeters)}
                  className="placeholder:text-typography-400"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Input>
            </Box>
          </Pressable>
          {errors.distanceInMeters && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.distanceInMeters.message}
            </Text>
          )}
        </Box>
        {/* Campo de duração */}
        <Box className="px-4 pt-2">
          <Pressable
            className="w-full"
            onPress={() => setTimeShowPicker(true)}
            disabled={isImporting}
          >
            <Box pointerEvents="none">
              <Text className="text-typography-600 text-base">
                Duração (hh:mm:ss)
              </Text>
              <Input
                variant="rounded"
                className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                size="lg"
              >
                <InputField
                  editable={false}
                  value={convertSecondsToHourMinuteFormat(durationInSeconds)}
                  className="placeholder:text-typography-400"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Input>
            </Box>
          </Pressable>
          {errors.durationInSeconds && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.durationInSeconds.message}
            </Text>
          )}
        </Box>
        {/* Campo de pace */}
        <Box className="px-4 pt-2">
          <Pressable
            className="w-full"
            onPress={() => setPaceShowPicker(true)}
            disabled={isImporting}
          >
            <Box pointerEvents="none">
              <Text className="text-typography-600 text-base">Pace (km)</Text>
              <Input
                variant="rounded"
                className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                size="lg"
              >
                <InputField
                  editable={false}
                  value={convertPaceToSpeed(paceInSeconds)}
                  className="placeholder:text-typography-400"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Input>
            </Box>
          </Pressable>
          {errors.paceInSeconds && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.paceInSeconds.message}
            </Text>
          )}
        </Box>
        {/* Comentários */}
        <Box className="px-4 pt-2">
          <Text className="text-typography-600 text-base mb-1">
            Comentários
          </Text>
          <Controller
            control={control}
            name="comments"
            render={({ field: { onChange, value } }) => (
              <Textarea className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full">
                <TextareaInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Adicione suas observações sobre o treino..."
                  className="placeholder:text-typography-400"
                />
              </Textarea>
            )}
          />
        </Box>
        {/* Escala de esforço */}
        <VStack className="justify-center items-center pt-6">
          <VStack className="items-center mb-5 gap-2">
            <Text className="text-typography-700 font-semibold">
              Escala CR-10
            </Text>
            <Text className="text-typography-700 font-semibold">
              Percepção Subjetiva de Esforço(PSE)
            </Text>
          </VStack>
          <VStack space="sm" className="items-start gap-1">
            {colors.map(({ value, color, label, icon }) => {
              const isSelected = watchedRpe === value;
              const baseStyle = `${color}/60 rounded-md w-16 h-10 justify-center items-center`;
              const selectedStyle = isSelected
                ? "border-2 border-black dark:border-white p-1"
                : "";

              return (
                <Pressable key={value} onPress={() => setValue("rpe", value)}>
                  <HStack
                    className={`items-center gap-2 ${selectedStyle} ${color}`}
                  >
                    <Box className={`${baseStyle}`}>
                      <Text
                        className={`${
                          isDarkMode ? "text-white" : "text-typography-900"
                        } font-bold`}
                      >
                        {value}
                      </Text>
                    </Box>

                    <Text
                      className={`${
                        isDarkMode ? "text-white" : "text-typography-900"
                      } font-medium w-[210px]`}
                    >
                      {label}
                    </Text>
                    <Icon
                      as={icon}
                      size="xl"
                      className="text-background-700 mr-4"
                    />
                  </HStack>
                </Pressable>
              );
            })}
          </VStack>
        </VStack>
        <Box className="px-4 pt-5">
          <Text className="text-typography-600 text-base">Trimp</Text>
          <Input
            variant="rounded"
            className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
            size="lg"
          >
            <InputField
              editable={false}
              value={String(trimp)}
              className="placeholder:text-typography-400"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Input>
        </Box>
        <HStack className="gap-4 py-10 justify-end w-full px-4">
          <Button variant="outline" size="md" onPress={() => router.back()}>
            <ButtonText>Fechar</ButtonText>
          </Button>
          <Button
            action="primary"
            size="md"
            onPress={(e) => {
              e?.stopPropagation?.();
              handleSubmit(onSubmit)();
            }}
          >
            <ButtonText>Salvar</ButtonText>
          </Button>
        </HStack>
      </ScrollView>

      {/* Modal do calendário */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <Box className="flex-1 justify-center items-center bg-black/70">
            <TouchableWithoutFeedback>
              <Box className="bg-slate-700 m-6 rounded-2xl w-11/12 max-w-md shadow-2xl">
                <Calendar
                  onDayPress={handleDayPress}
                  markedDates={{
                    [watchedExecutionDay]: {
                      selected: true,
                      marked: true,
                      selectedColor: "#22c55e",
                    },
                  }}
                  {...calendarProps}
                />
                <HStack className="justify-end mt-4 gap-2 p-5">
                  <Button
                    onPress={() => {
                      setValue("executionDay", "");
                      setModalVisible(false);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <ButtonText>Limpar</ButtonText>
                  </Button>
                  <Button onPress={() => setModalVisible(false)} size="sm">
                    <ButtonText>Fechar</ButtonText>
                  </Button>
                </HStack>
              </Box>
            </TouchableWithoutFeedback>
          </Box>
        </TouchableWithoutFeedback>
      </Modal>

      <DistancePicker
        visible={showDistancePicker}
        onClose={() => setDistanceShowPicker(false)}
        onConfirm={(valueInMeters) => {
          setValue("distanceInMeters", Number(valueInMeters));
          setDistanceShowPicker(false);
        }}
        initialValue={values.distanceInMeters}
        title="Selecione a distância percorrida (km)"
      />

      <TimePicker
        visible={showTimePicker}
        onClose={() => setTimeShowPicker(false)}
        onConfirm={(value) => {
          setValue("durationInSeconds", Number(value));
          setTimeShowPicker(false);
        }}
        initialValue={values.durationInSeconds}
      />

      <DistancePicker
        visible={showPacePicker}
        onClose={() => setPaceShowPicker(false)}
        onConfirm={(value) => {
          setValue("paceInSeconds", Number(value));
          setPaceShowPicker(false);
        }}
        initialValue={values.paceInSeconds}
        title="Selecione o pace médio (km)"
      />
    </View>
  );
};

export default OutdoorScreen;
