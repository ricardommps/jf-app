import Header from "@/components/header";
import DistancePickerMeters from "@/components/picker-modal/distance-picker-meters";
import Loading from "@/components/shared/loading";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import {
  createRunningRaces,
  updateRunningRaces,
} from "@/services/running-races.service";
import { getWorkout } from "@/services/workouts.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarDays, Loader2 } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { z } from "zod";

const workoutSchema = z.object({
  programId: z.number(),
  subtitle: z.string().min(1, "Subtítulo obrigatório"),
  distance: z
    .number()
    .min(1, "A distância deve ser maior que 0")
    .refine((val) => val > 0, { message: "Campo distância obrigatório" }),
  link: z.string(),
  datePublished: z
    .string()
    .min(1, "Data de realização do treino obrigatório")
    .refine((val) => val !== null && val !== "", {
      message: "Data de realização do treino obrigatório",
    }),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

export default function AddRunningRacesScreen() {
  const { programId, workoutId } = useLocalSearchParams();
  const router = useRouter();
  const toast = useToast();
  const isEditMode = !!workoutId;

  // Query para buscar dados do workout quando estiver em modo de edição
  const { data: workoutData, isLoading: isLoadingWorkout } = useQuery({
    queryKey: ["workoutData", workoutId],
    queryFn: async () => await getWorkout(workoutId as string),
    staleTime: 0,
    gcTime: 0,
    enabled: !!workoutId,
  });

  const defaultValues = useMemo(
    () => ({
      programId: Number(programId),
      subtitle: "",
      distance: 0,
      link: "",
      datePublished: "",
    }),
    [programId]
  );

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

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [showDistancePicker, setDistanceShowPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const watchedDatePublished = watch("datePublished");
  const distance = watch("distance");

  // Preenche o formulário quando os dados são carregados
  useEffect(() => {
    if (workoutData && isEditMode) {
      reset({
        programId: workoutData.programId,
        subtitle: workoutData.subtitle,
        distance: workoutData.distance,
        link: workoutData.link || "",
        datePublished: workoutData.datePublished
          ? dayjs(workoutData.datePublished).format("YYYY-MM-DD")
          : "",
      });
    }
  }, [workoutData, isEditMode, reset]);

  const handleDayPress = (day: { dateString: string }) => {
    setValue("datePublished", day.dateString);
    setModalVisible(false);
  };

  async function onSubmit(data: WorkoutFormData) {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        datePublished: dayjs(data.datePublished).startOf("day").toISOString(),
      };

      if (isEditMode) {
        await updateRunningRaces(workoutId as string, payload);
        showNewToast("Prova atualizada com sucesso!", "success");
      } else {
        await createRunningRaces(payload);
        showNewToast("Prova salva com sucesso!", "success");
      }

      router.push(`/runningRaces?programId=${programId}` as any);
    } catch (err) {
      const parsedError = err as Error;
      const action = isEditMode ? "atualizar" : "salvar";
      showNewToast(
        `Não foi possível ${action} a prova. ${parsedError}`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const showNewToast = (
    message: string,
    type: "success" | "error" = "error"
  ) => {
    const newId = Math.random().toString();
    toast.show({
      id: newId,
      placement: "top",
      duration: 9000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast nativeID={uniqueToastId} action={type} variant="solid">
            <ToastTitle>{type === "success" ? "Sucesso" : "Erro"}</ToastTitle>
            <ToastDescription>{message}</ToastDescription>
          </Toast>
        );
      },
    });
  };

  // Mostra loading enquanto carrega os dados
  if (isLoadingWorkout && isEditMode) {
    return (
      <View className="flex-1 bg-black">
        <Header title="Editar Prova" />
        <View className="flex-1 justify-center items-center">
          <Loading />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Header title={isEditMode ? "Editar Prova" : "Adicionar Prova"} />
      <ScrollView>
        <View className="pt-5">
          <Box className="px-4 pt-2">
            <Text className="text-typography-600 text-base">Nome</Text>
            <Controller
              name="subtitle"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Input
                    variant="rounded"
                    className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                    size="lg"
                  >
                    <InputField
                      placeholder="Nome"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      autoCapitalize="sentences"
                    />
                  </Input>
                  {errors.subtitle && (
                    <Text className="text-red-500 text-sm ml-2 mt-1">
                      {errors.subtitle.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </Box>
          <Box className="px-4 pt-2">
            <Pressable onPress={() => setModalVisible(true)} className="w-full">
              <Box pointerEvents="none">
                <Text className="text-typography-600 text-base">
                  Data de realização
                </Text>
                <Input
                  variant="rounded"
                  className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                  size="lg"
                >
                  <InputField
                    editable={false}
                    value={
                      watchedDatePublished
                        ? dayjs(watchedDatePublished).format("DD/MM/YYYY")
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
            {errors.datePublished && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.datePublished.message}
              </Text>
            )}
          </Box>
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
                    value={distance ? (distance / 1000).toFixed(2) : ""}
                    placeholder="0.00"
                    className="placeholder:text-typography-400"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </Input>
              </Box>
            </Pressable>
            {errors.distance && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.distance.message}
              </Text>
            )}
          </Box>
          <Box className="px-4 pt-2">
            <Text className="text-typography-600 text-base mb-1">Link</Text>
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
                    placeholder="Link"
                    className="placeholder:text-typography-400"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </Input>
              )}
            />
          </Box>
          <HStack className="gap-4 py-10 justify-end w-full px-4">
            <Button variant="outline" size="md" onPress={() => router.back()}>
              <ButtonText>Fechar</ButtonText>
            </Button>
            <Button
              action="primary"
              size="md"
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              className={isLoading ? "opacity-50" : ""}
            >
              {isLoading && (
                <ButtonIcon as={Loader2} className="animate-spin" />
              )}
              <ButtonText>
                {isLoading
                  ? isEditMode
                    ? "Atualizando..."
                    : "Salvando..."
                  : isEditMode
                  ? "Atualizar"
                  : "Salvar"}
              </ButtonText>
            </Button>
          </HStack>
        </View>
      </ScrollView>
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <Box className="flex-1 justify-center items-center bg-black/70">
            <TouchableWithoutFeedback>
              <Box className="bg-slate-700 m-6 rounded-2xl w-11/12 max-w-md shadow-2xl">
                <Calendar
                  onDayPress={handleDayPress}
                  markedDates={{
                    [watchedDatePublished]: {
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
                      setValue("datePublished", "");
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
      <DistancePickerMeters
        visible={showDistancePicker}
        onClose={() => setDistanceShowPicker(false)}
        onConfirm={(valueInMeters) => {
          setValue("distance", Number(valueInMeters));
          setDistanceShowPicker(false);
        }}
        initialValue={distance}
        title="Selecione a distância da Prova (km)"
      />
    </View>
  );
}
