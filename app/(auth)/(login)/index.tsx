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
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

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

  const { height } = Dimensions.get("window");
  const isSmallDevice = height < 700;

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
    // Fechar teclado antes de fazer login
    Keyboard.dismiss();
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
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 28,
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Logo Section */}
            <View
              className={`flex justify-center items-center ${
                isSmallDevice ? "mt-16" : "mt-32"
              }`}
            >
              <Image
                source={require("@/assets/images/jf_logo_full.png")}
                alt="logo"
                contentFit="contain"
                className={`${
                  isSmallDevice
                    ? "w-80 h-32 max-w-[320px] max-h-[128px]"
                    : "w-96 h-48 max-w-[400px] max-h-[200px]"
                }`}
              />
            </View>

            {/* Form Section */}
            <View className={`${isSmallDevice ? "mt-8" : "mt-12"}`}>
              <Controller
                name="cpf"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    variant="rounded"
                    className="border-0 bg-[#2b2b2b9d] rounded-md mt-2 mb-5 w-full"
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
                      returnKeyType="next"
                      blurOnSubmit={false}
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
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(handleLogin)}
                    />
                  </Input>
                )}
              />
            </View>

            {/* Button Section */}
            <View
              className={`flex justify-center items-center ${
                isSmallDevice ? "pt-6" : "pt-10"
              }`}
            >
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

            {/* Espaço extra para o teclado */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
