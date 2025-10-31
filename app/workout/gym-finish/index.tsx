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
import { convertDate } from "@/utils/format-time";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  useLocalSearchParams as useExpoLocalSearchParams,
  useRouter,
} from "expo-router";
import { CalendarDays } from "lucide-react-native";
import { useContext, useMemo, useState } from "react";
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
import { useWorkouut } from "@/contexts/WorkoutContext";
import { finishedWorkout } from "@/services/finished.service";

const workoutSchema = z.object({
  workoutsId: z.string(),
  rpe: z.number(),
  comments: z.string(),
  executionDay: z
    .string()
    .min(1, "Data de realização do treino obrigatório")
    .refine((val) => val !== null && val !== "", {
      message: "Data de realização do treino obrigatório",
    }),
  checkList: z.array(z.number()),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

interface Params {
  id?: string;
}

function useLocalSearchParams(): Params {
  return useExpoLocalSearchParams() as Params;
}

const GymFinishView = () => {
  const { id } = useLocalSearchParams();
  const safeId = id ?? "";
  const router = useRouter();
  const toast = useToast();
  const { checkList } = useWorkouut();
  const { colorMode }: any = useContext(ThemeContext);
  const isDarkMode = colorMode === "dark";

  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastId, setToastId] = useState<string>("");

  const defaultValues = useMemo(
    () => ({
      rpe: 0,
      comments: "",
      workoutsId: safeId,
      executionDay: "",
      checkList: [],
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

  const watchedExecutionDay = watch("executionDay");
  const watchedRpe = watch("rpe");

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: "#334155",
      calendarBackground: "#334155",
      textSectionTitleColor: "#CBD5E1",
      selectedDayBackgroundColor: "#0EA5E9",
      selectedDayTextColor: "#ffffff",
      todayTextColor: "#1E40AF",
      dayTextColor: "#CBD5E1",
      textDisabledColor: "#64748B",
      dotColor: "#4ADE80",
      selectedDotColor: "#ffffff",
      arrowColor: "#CBD5E1",
      monthTextColor: "#F8FAFC",
      indicatorColor: "#0EA5E9",
      textDayFontFamily: "System",
      textMonthFontFamily: "System",
      textDayHeaderFontFamily: "System",
      textDayFontWeight: 400 as any,
      textMonthFontWeight: 600 as any,
      textDayHeaderFontWeight: 500 as any,
      textDayFontSize: 16,
      textMonthFontSize: 18,
      textDayHeaderFontSize: 14,
    }),
    []
  );

  const handleDayPress = (day: { dateString: string }) => {
    setValue("executionDay", day.dateString);
    setModalVisible(false);
  };

  async function onSubmit(data: WorkoutFormData) {
    setIsLoading(true);
    try {
      const payload = Object.assign({}, data);
      payload.workoutsId = safeId;
      payload.rpe = Number(payload.rpe);
      payload.executionDay = convertDate(payload.executionDay);
      payload.checkList = checkList;
      await finishedWorkout(payload);
      router.push(`/finished` as any);
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
                  theme={calendarTheme}
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
                    <ButtonText className="text-white">Limpar</ButtonText>
                  </Button>
                  <Button onPress={() => setModalVisible(false)} size="sm">
                    <ButtonText className="text-white">Fechar</ButtonText>
                  </Button>
                </HStack>
              </Box>
            </TouchableWithoutFeedback>
          </Box>
        </TouchableWithoutFeedback>
      </Modal>
    </VStack>
  );
};

export default GymFinishView;
