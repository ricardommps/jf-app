import HeaderNavigation from "@/components/shared/header-navigation";
import Loading from "@/components/shared/loading";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { convertDate } from "@/utils/format-time";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView } from "react-native";
import { z } from "zod";

import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { finishedWorkout } from "@/services/finished.service";

const workoutSchema = z.object({
  workoutsId: z.string(),
  rpe: z.number(),
  comments: z.string(),
  executionDay: z.string(),
  unrealized: z.boolean(),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

interface Props {
  safeId: string;
}
const UnrealizedFinishView = ({ safeId }: Props) => {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [toastId, setToastId] = useState<string>("");

  const defaultValues = useMemo(
    () => ({
      rpe: 0,
      comments: "",
      workoutsId: safeId,
      executionDay: "",
      unrealized: true,
    }),
    [safeId]
  );

  const { control, handleSubmit } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues,
  });

  async function onSubmit(data: WorkoutFormData) {
    setIsLoading(true);
    try {
      const payload = Object.assign({}, data);

      payload.workoutsId = safeId;
      payload.rpe = Number(payload.rpe);
      payload.executionDay = convertDate(new Date());
      await finishedWorkout(payload);
      router.push(`/finished?unrealizedTraining=${true}` as any);
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
  if (isLoading) {
    return <Loading />;
  }

  return (
    <VStack space="md" className="flex-1 bg-background-0">
      <HeaderNavigation title="Finalizar treino indoor" />
      <ScrollView>
        <Box className="px-4 pt-2">
          <Text className="text-2xl text-red-700 font-bold">
            Treino não realizado
          </Text>
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
        <HStack className="gap-4 py-10 justify-end w-full px-4">
          <Button variant="outline" size="md" onPress={() => router.back()}>
            <ButtonText>Fechar</ButtonText>
          </Button>
          <Button action="primary" size="md" onPress={handleSubmit(onSubmit)}>
            <ButtonText>Salvar</ButtonText>
          </Button>
        </HStack>
      </ScrollView>
    </VStack>
  );
};

export default UnrealizedFinishView;
