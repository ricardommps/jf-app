import { View } from "@/components/ui/view";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/contexts/Authentication";
import Logo from "@/assets/images/logo.svg";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "@/components/ui/image";

const schema = z.object({
  cpf: z.string().min(1, "CPF é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type SchemaFieldsType = z.infer<typeof schema>;

export type Error = {
  message: string;
  status: number;
};

export default function LoginScreen() {
  const toast = useToast();
  const { login } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [toastId, setToastId] = useState<string>("");

  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm({
    mode: "onBlur",
    resolver: zodResolver(schema),
    defaultValues: {
      cpf: "",
      password: "",
    },
  });

  async function handleLogin(data: SchemaFieldsType) {
    setIsLoading(true);
    try {
      await login(data);
    } catch (err) {
      const parsedError = err as Error;

      // Mostrar toast apenas se ainda não está visível
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
          <Toast nativeID={uniqueToastId} action="error" variant="solid">
            <ToastTitle>Erro ao fazer login</ToastTitle>
            <ToastDescription>{message}</ToastDescription>
          </Toast>
        );
      },
    });
  };

  return (
    <SafeAreaView className="container bg-black px-7 h-full">
      <View className="flex justify-center items-center mt-32">
        <Image
          source={require("@/assets/images/jf_logo_full.png")}
          alt="logo"
          contentFit="contain"
          className="w-[400px] h-[200px]"
        />
      </View>
      <View className="mt-12">
        <Controller
          name="cpf"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              variant="rounded"
              className="border-0 bg-[#2b2b2b9d] rounded-md mt-2 mb-5 w-fulll"
              size="lg"
              isDisabled={isLoading}
            >
              <InputField
                placeholder="Digite seu cpf"
                className="placeholder:text-typography-400"
                value={value}
                onBlur={onBlur}
                autoComplete="off"
                keyboardType="numeric"
                onChangeText={onChange}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Input>
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              variant="rounded"
              className="border-0 bg-[#2b2b2b9d] rounded-md mt-2 mb-5 w-full"
              size="lg"
              isDisabled={isLoading}
            >
              <InputField
                placeholder="Digite sua senha"
                className="placeholder:text-typography-400"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                textContentType="password"
                autoComplete="password"
              />
            </Input>
          )}
        />
      </View>
      <View className="flex justify-center items-center pt-10">
        <Button
          action="primary"
          size="lg"
          className="w-full"
          disabled={isLoading}
          onPress={handleSubmit(handleLogin)}
        >
          {isLoading ? (
            <Spinner size="small" color="white" />
          ) : (
            <ButtonText>Login</ButtonText>
          )}
        </Button>
      </View>
    </SafeAreaView>
  );
}
