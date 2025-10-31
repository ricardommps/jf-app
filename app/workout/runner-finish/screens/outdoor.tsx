import { DistancePicker, TimePicker } from "@/components/picker-modal";
import HeaderNavigation from "@/components/shared/header-navigation";
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
import { Modal, ScrollView, TouchableWithoutFeedback } from "react-native";
import { Calendar } from "react-native-calendars";
import { z } from "zod";

import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { finishedWorkout } from "@/services/finished.service";

import { calendarBaseTheme } from "@/utils/calendar-base-theme";

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

const OutdoorScreen = ({ safeId, titleStr, subtitle }: Props) => {
  const router = useRouter();
  const toast = useToast();

  const { colorMode }: any = useContext(ThemeContext);
  const isDarkMode = colorMode === "dark";

  const [modalVisible, setModalVisible] = useState(false);

  const [showDistancePicker, setDistanceShowPicker] = useState(false);
  const [showTimePicker, setTimeShowPicker] = useState(false);
  const [showPacePicker, setPaceShowPicker] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [toastId, setToastId] = useState<string>("");

  const defaultValues = useMemo(
    () => ({
      rpe: 0,
      trimp: 0,
      link: "",
      comments: "",
      workoutsId: safeId,
      outdoor: true,
      distanceInMeters: 0,
      durationInSeconds: 0,
      paceInSeconds: 0,
      executionDay: "",
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
  const paceInSeconds = watch("paceInSeconds");
  const watchedRpe = watch("rpe");
  const trimp = watch("trimp");

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
      payload.paceInSeconds = Number(payload.paceInSeconds);
      payload.executionDay = convertDate(payload.executionDay);
      await finishedWorkout(payload);
      router.push(
        `/finished?distanceInMeters=${payload.distanceInMeters}&durationInSeconds=${payload.durationInSeconds}
        &paceInSeconds=${payload.paceInSeconds}&rpe=${payload.rpe}&title=${titleStr}&subtitle=${subtitle}` as any
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
    <VStack space="md" className="flex-1 bg-background-0">
      <HeaderNavigation title="Finalizar treino outdoor" />
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
        {/* Campo de pace */}
        <Box className="px-4 pt-2">
          <Pressable className="w-full" onPress={() => setPaceShowPicker(true)}>
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
    </VStack>
  );
};

export default OutdoorScreen;
