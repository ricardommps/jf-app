import { DistancePicker, TimePicker } from "@/components/picker-modal";
import HeaderNavigation from "@/components/shared/header-navigation";
import Loading from "@/components/shared/loading";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
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
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { ThemeContext } from "@/contexts/theme-context";
import { finishedWorkout } from "@/services/finished.service";
import { calendarBaseTheme } from "@/utils/calendar-base-theme";
import {
  convertMetersToKilometersFormat,
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
  FlatList,
  ListRenderItem,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { z } from "zod";

const workoutSchema = z.object({
  workoutsId: z.string(),
  rpe: z.number(),
  trimp: z.number(),
  link: z.string(),
  comments: z.string(),
  outdoor: z.boolean(),
  distanceInMeters: z
    .number()
    .min(1, "A distância deve ser maior que 0")
    .refine((val) => val > 0, { message: "Campo distância obrigatório" }),
  durationInSeconds: z
    .number()
    .min(1, "O tempo deve ser maior que 0")
    .refine((val) => val > 0, { message: "Campo tempo total obrigatório" }),
  executionDay: z
    .string()
    .min(1, "Data de realização do treino obrigatório")
    .refine((val) => val !== null && val !== "", {
      message: "Data de realização do treino obrigatório",
    }),
  intensities: z.array(
    z
      .number()
      .nonnegative("Intensidade deve ser um valor positivo")
      .finite("Intensidade deve ser um número válido")
  ),
  warmUpDuration: z.number(),
  warmUpIntensities: z.number(),
  unitMeasurement: z.string(),
  coolDownDuration: z.number(),
  coolDownIntensities: z.number(),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

interface Props {
  safeId: string;
  titleStr?: string;
}

const IndoorScreen = ({ safeId, titleStr }: Props) => {
  const router = useRouter();
  const toast = useToast();
  const { colorMode }: any = useContext(ThemeContext);
  const isDarkMode = colorMode === "dark";

  const [modalVisible, setModalVisible] = useState(false);
  const [showDistancePicker, setDistanceShowPicker] = useState(false);
  const [showTimePicker, setTimeShowPicker] = useState(false);
  const [showWarmUpDuration, setShowWarmUpDuration] = useState(false);
  const [showWarmUpIntensities, setShowWarmUpIntensities] = useState(false);
  const [showCoolDownDuration, setShowCoolDownDuration] = useState(false);
  const [showCoolDownIntensities, setShowCoolDownIntensities] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [toastId, setToastId] = useState<string>("");

  const defaultValues = useMemo(
    () => ({
      rpe: 0,
      trimp: 0,
      link: "",
      comments: "",
      workoutsId: safeId,
      outdoor: false,
      distanceInMeters: 0,
      durationInSeconds: 0,
      executionDay: "",
      warmUpDuration: 0,
      intensities: [],
      unitMeasurement: "pace",
      warmUpIntensities: 0,
      coolDownDuration: 0,
      coolDownIntensities: 0,
    }),
    [safeId]
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
  const watchedRpe = watch("rpe");
  const trimp = watch("trimp");
  const intensities = watch("intensities");
  const unitMeasurement = watch("unitMeasurement");
  const warmUpDuration = watch("warmUpDuration");
  const warmUpIntensities = watch("warmUpIntensities");
  const coolDownDuration = watch("coolDownDuration");
  const coolDownIntensities = watch("coolDownIntensities");

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

  async function onSubmit(data: WorkoutFormData) {
    setIsLoading(true);
    try {
      const payload = Object.assign({}, data);
      payload.workoutsId = safeId;
      payload.distanceInMeters = Number(payload.distanceInMeters);
      payload.durationInSeconds = Number(payload.durationInSeconds);
      payload.rpe = Number(payload.rpe);
      payload.link = payload.link;
      payload.executionDay = convertDate(payload.executionDay);
      await finishedWorkout(payload);
      router.push(
        `/finished?distanceInMeters=${payload.distanceInMeters}&durationInSeconds=${payload.durationInSeconds}&rpe=${payload.rpe}&title=${titleStr}&trimp=${payload.trimp}` as any
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

  const calculateAverage = (items: (number | string)[]): number => {
    const validItems = items
      .map((num) => Number(num))
      .filter((num) => num > 0 && !isNaN(num));
    if (validItems.length === 0) return 0;
    const sum = validItems.reduce((acc, curr) => acc + curr, 0);
    const average = sum / validItems.length;
    const result = Math.floor(average * 100) / 100;
    return result;
  };

  const handleArraySizeChange = (size: string) => {
    const num = Number(size);
    if (!isNaN(num) && num >= 0) {
      setValue("intensities", Array(num).fill(0));
    }
  };

  const renderIntensityItem: ListRenderItem<number> = ({ item, index }) => {
    const isLeftColumn = index % 2 === 0;

    return (
      <Box className={`mb-4 ${isLeftColumn ? "mr-2" : "ml-2"} w-[48%]`}>
        <Text className="text-white font-medium mb-1">Esforço {index + 1}</Text>

        <Controller
          control={control}
          name={`intensities.${index}`}
          render={({ field: { value, onChange } }) => (
            <Input
              variant="rounded"
              className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
              size="lg"
            >
              <InputField
                keyboardType="numeric"
                value={String(value || "")}
                onChangeText={(text) => {
                  const cleanText = text.replace(/[^0-9.,]/g, "");
                  const normalizedText = cleanText.replace(",", ".");
                  const isValid = /^\d*\.?\d*$/.test(normalizedText);
                  if (isValid) {
                    onChange(normalizedText);
                  }
                }}
                onBlur={() => {
                  const parsed = parseFloat(String(value));
                  if (!isNaN(parsed) && String(value) !== "") {
                    onChange(parsed);
                  }
                }}
                className="text-white"
              />
              <InputSlot className="pr-3">
                <Text>{unitMeasurement === "pace" ? "min" : "km/h"}</Text>
              </InputSlot>
            </Input>
          )}
        />
      </Box>
    );
  };

  const RenderWarmUpIntensities = () => {
    if (showWarmUpIntensities && unitMeasurement === "pace") {
      return (
        <TimePicker
          visible={showWarmUpIntensities}
          onClose={() => setShowWarmUpIntensities(false)}
          onConfirm={(value) => {
            setValue("warmUpIntensities", Number(value));
            setShowWarmUpIntensities(false);
          }}
          initialValue={values.warmUpIntensities}
          title="Selecione a intensidade de aquacimento (min)"
        />
      );
    }
    return (
      <DistancePicker
        visible={showWarmUpIntensities}
        onClose={() => setShowWarmUpIntensities(false)}
        onConfirm={(value) => {
          setValue("warmUpIntensities", Number(value));
          setShowWarmUpIntensities(false);
        }}
        initialValue={values.warmUpIntensities}
        title="Selecione a intensidade de aquacimento (km/h)"
      />
    );
  };

  const RenderCollDownIntensities = () => {
    if (showCoolDownIntensities && unitMeasurement === "pace") {
      return (
        <TimePicker
          visible={showCoolDownIntensities}
          onClose={() => setShowCoolDownIntensities(false)}
          onConfirm={(value) => {
            setValue("coolDownIntensities", Number(value));
            setShowCoolDownIntensities(false);
          }}
          initialValue={values.coolDownIntensities}
          title="Selecione a intensidade de desaquacimento (min)"
        />
      );
    }
    return (
      <DistancePicker
        visible={showCoolDownIntensities}
        onClose={() => setShowCoolDownIntensities(false)}
        onConfirm={(value) => {
          setValue("coolDownIntensities", Number(value));
          setShowCoolDownIntensities(false);
        }}
        initialValue={values.coolDownIntensities}
        title="Selecione a intensidade de desaquacimento (km/h)"
      />
    );
  };

  useEffect(() => {
    getTrimp();
  }, [values.durationInSeconds, values.rpe]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <VStack space="md" className="flex-1 bg-background-0">
      <HeaderNavigation title="Finalizar treino indoor" />
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

        <Box className="px-4 pt-5">
          <Text className="text-typography-600 text-base mb-1">
            Link da atividade
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
          >
            <Box pointerEvents="none">
              <Text className="text-typography-600 text-base">
                Distância (km/h)
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
          <Pressable className="w-full" onPress={() => setTimeShowPicker(true)}>
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

        {/* Unidade de medida */}
        <Box className="px-4 pt-2">
          <Text className="text-typography-700 font-semibold">
            ⁠Selecione a unidade de medida
          </Text>
          <HStack space="md" className="mt-2">
            <Pressable
              className={
                `flex-1 items-center justify-center py-2 rounded-2xl border ` +
                (unitMeasurement === "pace"
                  ? "bg-[#2b2b2b9d]  border-gray-500"
                  : "bg-transparent border-white/20")
              }
              onPress={() => setValue("unitMeasurement", "pace")}
            >
              <Text className="text-white">Pace</Text>
            </Pressable>
            <Pressable
              className={
                `flex-1 items-center justify-center py-2 rounded-2xl border ` +
                (unitMeasurement === "km"
                  ? "bg-[#2b2b2b9d]  border-gray-500"
                  : "bg-transparent border-white/20")
              }
              onPress={() => setValue("unitMeasurement", "km")}
            >
              <Text className="text-white">Km/h</Text>
            </Pressable>
          </HStack>
        </Box>

        <Divider orientation="horizontal" className="mt-5" />

        {/* Aquecimento */}
        <Box className="px-4 pt-2 pb-5">
          <Text className="text-xl font-bold text-center pb-2">
            Aquecimento (opcional)
          </Text>

          {/* Campo de tempo de aquecimento */}
          <Box className="pt-2">
            <Pressable
              className="w-full"
              onPress={() => setShowWarmUpDuration(true)}
            >
              <Box pointerEvents="none">
                <Text className="text-typography-600 text-base">
                  Tempo de aquecimento (min)
                </Text>
                <Input
                  variant="rounded"
                  className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                  size="lg"
                >
                  <InputField
                    editable={false}
                    value={convertSecondsToHourMinuteFormat(warmUpDuration)}
                    className="placeholder:text-typography-400"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </Input>
              </Box>
            </Pressable>
            {errors.warmUpDuration && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.warmUpDuration.message}
              </Text>
            )}
          </Box>

          {/* Campo de Intensidade de aquecimento */}
          <Box className="pt-4 pb-2">
            <Pressable
              className="w-full"
              onPress={() => setShowWarmUpIntensities(true)}
            >
              <Box pointerEvents="none">
                <Text className="text-typography-600 text-base">
                  {`Intensidade de aquecimento (${
                    unitMeasurement === "pace" ? "min" : "km/h"
                  })`}
                </Text>
                <Input
                  variant="rounded"
                  className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                  size="lg"
                >
                  <InputField
                    editable={false}
                    value={
                      unitMeasurement === "pace"
                        ? convertSecondsToHourMinuteFormat(warmUpIntensities)
                        : convertMetersToKilometersFormat(warmUpIntensities)
                    }
                    className="placeholder:text-typography-400"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </Input>
              </Box>
            </Pressable>
            {errors.warmUpIntensities && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.warmUpIntensities.message}
              </Text>
            )}
          </Box>
        </Box>

        <Divider orientation="horizontal" className="mt-1" />

        {/* Intensidade */}

        <Box className="px-4 pt-2">
          <Text className="text-xl font-bold text-center pb-2">
            Intensidade dos esforços (opcional)
          </Text>

          <Text className="text-typography-600 text-base">
            Quantidade de esforços
          </Text>
          <Controller
            control={control}
            name="intensities"
            render={({ field: { onChange, value } }) => (
              <Input
                variant="rounded"
                className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                size="lg"
              >
                <InputField
                  editable
                  value={String(value.length)}
                  onChangeText={handleArraySizeChange}
                  className="placeholder:text-typography-400"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Input>
            )}
          />

          <FlatList
            data={intensities}
            renderItem={renderIntensityItem}
            numColumns={2} // <-- aqui está a mudança principal
            contentContainerStyle={{
              paddingBottom: 16,
              paddingHorizontal: 8,
              paddingTop: 20,
            }}
            scrollEnabled={false}
            nestedScrollEnabled={true}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={() => (
              <Text className="text-typography-500 text-center py-4">
                Nenhuma intensidade adicionada
              </Text>
            )}
          />
          <HStack space="3xl">
            <VStack>
              <Text className="text-2xl text-white font-bold">
                {calculateAverage(intensities)}
              </Text>
              <Text className="text-1xl text-white">
                {unitMeasurement === "pace" ? "Tempo médio" : "Km médio"}
              </Text>
            </VStack>
          </HStack>
        </Box>

        <Divider orientation="horizontal" className="mt-5" />

        {/* Desaquecimento */}
        <Box className="px-4 pt-2 pb-5">
          <Text className="text-xl font-bold text-center pb-2">
            Desaquecimento (opcional)
          </Text>

          {/* Campo de tempo de desaquecimento */}
          <Box className="pt-2">
            <Pressable
              className="w-full"
              onPress={() => setShowCoolDownDuration(true)}
            >
              <Box pointerEvents="none">
                <Text className="text-typography-600 text-base">
                  Tempo de desaquecimento
                </Text>
                <Input
                  variant="rounded"
                  className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                  size="lg"
                >
                  <InputField
                    editable={false}
                    value={convertSecondsToHourMinuteFormat(coolDownDuration)}
                    className="placeholder:text-typography-400"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </Input>
              </Box>
            </Pressable>
            {errors.coolDownDuration && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.coolDownDuration.message}
              </Text>
            )}
          </Box>

          {/* Campo de Intensidade de desaquecimento */}
          <Box className="pt-4">
            <Pressable
              className="w-full"
              onPress={() => setShowCoolDownIntensities(true)}
            >
              <Box pointerEvents="none">
                <Text className="text-typography-600 text-base">
                  {`Intensidade de desaquecimento (${
                    unitMeasurement === "pace" ? "min" : "km/h"
                  })`}
                </Text>
                <Input
                  variant="rounded"
                  className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                  size="lg"
                >
                  <InputField
                    editable={false}
                    value={
                      unitMeasurement === "pace"
                        ? convertSecondsToHourMinuteFormat(coolDownIntensities)
                        : convertMetersToKilometersFormat(coolDownIntensities)
                    }
                    className="placeholder:text-typography-400"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </Input>
              </Box>
            </Pressable>
            {errors.coolDownIntensities && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.coolDownIntensities.message}
              </Text>
            )}
          </Box>
        </Box>
        <Divider orientation="horizontal" className="mt-5" />

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
          <Button action="primary" size="md" onPress={handleSubmit(onSubmit)}>
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
        title="Selecione a distância percorrida (km/h)"
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
      <TimePicker
        visible={showWarmUpDuration}
        onClose={() => setShowWarmUpDuration(false)}
        onConfirm={(value) => {
          setValue("warmUpDuration", Number(value));
          setShowWarmUpDuration(false);
        }}
        initialValue={values.warmUpDuration}
        title="Selecione o tempo de aquacimento (min)"
      />
      <TimePicker
        visible={showCoolDownDuration}
        onClose={() => setShowCoolDownDuration(false)}
        onConfirm={(value) => {
          setValue("coolDownDuration", Number(value));
          setShowCoolDownDuration(false);
        }}
        initialValue={values.coolDownDuration}
        title="Selecione o tempo de desaquacimento (min)"
      />

      <RenderWarmUpIntensities />
      <RenderCollDownIntensities />
    </VStack>
  );
};

export default IndoorScreen;
