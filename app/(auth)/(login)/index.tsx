import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";

import { View } from "@/components/ui/view";
import { Box } from "@/components/ui/box";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/contexts/Authentication";
import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { Image } from "@/components/ui/image";

const schema = z.object({
  cpf: z.string().min(1, "CPF é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type SchemaFieldsType = z.infer<typeof schema>;

const TOKEN_KEY = "biometric_access_token";
const CPF_KEY = "biometric_cpf";

export default function LoginScreen() {
  const toast = useToast();
  const { login, loginWithBiometrics } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [toastId, setToastId] = useState<string>("");
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [savedCpf, setSavedCpf] = useState<string | null>(null);
  const [hasBiometricCredentials, setHasBiometricCredentials] = useState(false);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  const { height } = Dimensions.get("window");
  const isSmallDevice = height < 700;

  const { control, handleSubmit, setValue } = useForm<SchemaFieldsType>({
    mode: "onBlur",
    resolver: zodResolver(schema),
    defaultValues: {
      cpf: "",
      password: "",
    },
  });

  useEffect(() => {
    async function prepare() {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const biometricSupported = hasHardware && isEnrolled;
        setIsBiometricSupported(biometricSupported);

        const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const savedCpfValue = await SecureStore.getItemAsync(CPF_KEY);

        if (savedCpfValue) {
          setSavedCpf(savedCpfValue);
          setValue("cpf", savedCpfValue);
        }

        const hasCredentials = !!(
          savedToken &&
          savedCpfValue &&
          biometricSupported
        );
        setHasBiometricCredentials(hasCredentials);

        if (hasCredentials && !autoLoginAttempted) {
          setAutoLoginAttempted(true);
          await attemptAutoLogin();
        }
      } catch (error) {
        console.error("Erro ao preparar login:", error);
      }
    }

    prepare();
  }, [setValue, loginWithBiometrics, autoLoginAttempted]);

  async function attemptAutoLogin() {
    try {
      setIsLoading(true);

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Use sua digital ou Face ID para entrar rapidamente",
        fallbackLabel: "Inserir senha manualmente",
        disableDeviceFallback: false,
        cancelLabel: "Cancelar",
      });

      if (result.success) {
        const user = await loginWithBiometrics();
        if (user) {
          return;
        } else {
          await clearBiometricCredentials();
          showNewToast("Credenciais expiradas. Faça login novamente.");
        }
      }
    } catch (error) {
      console.error("Erro no auto-login biométrico:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogin(data: SchemaFieldsType) {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const user = await login(data);
      setSavedCpf(data.cpf);
      setHasBiometricCredentials(true);
    } catch (err) {
      const parsedError = err as { message: string };
      if (!toast.isActive(toastId)) {
        showNewToast(parsedError.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAccessWithOtherAccount() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(CPF_KEY);
      await SecureStore.deleteItemAsync("session"); // Remove a sessão salva
      setHasBiometricCredentials(false);
      setSavedCpf(null);
      setValue("cpf", "");
      showNewToast("Digite os dados para acessar com outra conta.");
    } catch (error) {
      console.error("Erro ao limpar credenciais:", error);
      showNewToast("Erro ao tentar acessar com outra conta.");
    }
  }

  async function clearBiometricCredentials() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(CPF_KEY);
      setHasBiometricCredentials(false);
      setSavedCpf(null);
      setValue("cpf", "");
    } catch (error) {
      console.error("Erro ao limpar credenciais:", error);
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
              <ToastTitle>Aviso</ToastTitle>
              <ToastDescription>{message}</ToastDescription>
            </Toast>
          </Box>
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

              {isBiometricSupported && hasBiometricCredentials && (
                <Button
                  action="secondary"
                  size="md"
                  className="mt-4 w-full"
                  disabled={isLoading}
                  onPress={handleAccessWithOtherAccount}
                >
                  <ButtonText>Acessar com outra conta</ButtonText>
                </Button>
              )}
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
