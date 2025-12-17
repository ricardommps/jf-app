import Header from "@/components/header";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { resetPassword } from "@/services/password.service";
import { ApiError } from "@/types/api";
import { PasswordData, ResetPasswordRequest } from "@/types/resetPassword";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { EyeIcon, EyeOffIcon } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

interface ShowPasswordsState {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface ValidationErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

type PasswordField = keyof PasswordData;
type ShowPasswordField = keyof ShowPasswordsState;

export default function ResetPasswordScreen() {
  const [passwords, setPasswords] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState<ShowPasswordsState>({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const toast = useToast();

  const handlePasswordChange = useCallback(
    (field: PasswordField, value: string) => {
      setPasswords((prev) => ({
        ...prev,
        [field]: value,
      }));
      setErrors((prev) => {
        if (prev[field]) {
          return {
            ...prev,
            [field]: undefined,
          };
        }
        return prev;
      });
    },
    []
  );

  const togglePasswordVisibility = useCallback((field: ShowPasswordField) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

  const passwordStrength = useMemo(() => {
    return (password: string): number => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/\d/.test(password)) strength++;
      if (/[^A-Za-z\d]/.test(password)) strength++;
      return strength;
    };
  }, []);

  const getStrengthColor = useCallback((strength: number): string => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  }, []);

  const getStrengthText = useCallback((strength: number): string => {
    if (strength <= 2) return "Fraca";
    if (strength <= 3) return "Média";
    return "Forte";
  }, []);

  const getStrengthTextColor = useCallback((strength: number): string => {
    if (strength <= 2) return "text-red-600";
    if (strength <= 3) return "text-yellow-600";
    return "text-green-600";
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    if (!passwords.currentPassword) {
      newErrors.currentPassword = "Senha atual é obrigatória";
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = "Nova senha é obrigatória";
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = "Nova senha deve ter pelo menos 8 caracteres";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwords.newPassword)) {
      newErrors.newPassword =
        "Nova senha deve conter ao menos: 1 maiúscula, 1 minúscula e 1 número";
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    if (
      passwords.currentPassword &&
      passwords.newPassword &&
      passwords.currentPassword === passwords.newPassword
    ) {
      newErrors.newPassword = "A nova senha deve ser diferente da senha atual";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [passwords]);

  const resetPasswordMutation = useMutation<
    { success: boolean; message: string },
    ApiError,
    ResetPasswordRequest
  >({
    mutationFn: resetPassword,
    onSuccess: () => {
      // Limpar formulário
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      router.push("/(tabs)/(home)" as any);

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="success" variant="solid">
            <VStack space="xs">
              <ToastTitle>Sucesso!</ToastTitle>
              <ToastDescription>Senha alterada com sucesso</ToastDescription>
            </VStack>
          </Toast>
        ),
      });
    },
    onError: (error: ApiError) => {
      const errorMessage = error.customMessage || "Erro interno do servidor";

      if (errorMessage.toLowerCase().includes("senha atual incorreta")) {
        setErrors((prev) => ({
          ...prev,
          currentPassword: "Senha atual incorreta",
        }));
      } else if (errorMessage.toLowerCase().includes("senha fraca")) {
        setErrors((prev) => ({ ...prev, newPassword: errorMessage }));
      }

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="error" variant="solid">
            <VStack space="xs">
              <ToastTitle>Erro!</ToastTitle>
              <ToastDescription>{errorMessage}</ToastDescription>
            </VStack>
          </Toast>
        ),
      });
    },
  });

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    resetPasswordMutation.mutate({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });
  }, [validateForm, resetPasswordMutation.mutate, passwords]);

  const currentPasswordStrength = useMemo(
    () => passwordStrength(passwords.newPassword),
    [passwords.newPassword, passwordStrength]
  );

  const renderScreen = useMemo(
    () => (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-[#2b2b2b9d] rounded-xl"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Box className="flex-1 px-6 pt-5">
            <VStack className="mb-8">
              <Text className="text-center text-white text-base">
                Para sua segurança, digite sua senha atual e escolha uma nova
                senha forte
              </Text>
            </VStack>

            <VStack space="lg" className="mb-8">
              <FormControl isInvalid={!!errors.currentPassword}>
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-600 text-base">
                    Senha Atual
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  variant="rounded"
                  className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                  size="lg"
                >
                  <InputField
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Digite sua senha atual"
                    value={passwords.currentPassword}
                    onChangeText={(value: string) =>
                      handlePasswordChange("currentPassword", value)
                    }
                    className="placeholder:text-typography-400"
                    secureTextEntry={!showPasswords.current}
                  />
                  <InputSlot
                    className="pr-3"
                    onPress={() => togglePasswordVisibility("current")}
                  >
                    <InputIcon
                      as={showPasswords.current ? EyeOffIcon : EyeIcon}
                      className="text-gray-500"
                    />
                  </InputSlot>
                </Input>
                {errors.currentPassword && (
                  <FormControlError>
                    <FormControlErrorText className="text-red-600 mt-1">
                      {errors.currentPassword}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.newPassword}>
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-600 text-base">
                    Nova Senha
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  variant="rounded"
                  className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                  size="lg"
                >
                  <InputField
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    value={passwords.newPassword}
                    onChangeText={(value: string) =>
                      handlePasswordChange("newPassword", value)
                    }
                    className="placeholder:text-typography-400"
                    secureTextEntry={!showPasswords.new}
                  />
                  <InputSlot
                    className="pr-3"
                    onPress={() => togglePasswordVisibility("new")}
                  >
                    <InputIcon
                      as={showPasswords.new ? EyeOffIcon : EyeIcon}
                      className="text-gray-500"
                    />
                  </InputSlot>
                </Input>

                {passwords.newPassword.length > 0 && (
                  <Box className="mt-3">
                    <Box className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm text-white">
                        Força da senha:
                      </Text>
                      <Text
                        className={`text-sm font-medium ${getStrengthTextColor(
                          currentPasswordStrength
                        )}`}
                      >
                        {getStrengthText(currentPasswordStrength)}
                      </Text>
                    </Box>
                    <Box className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <Box
                        className={`h-full transition-all duration-300 ${getStrengthColor(
                          currentPasswordStrength
                        )}`}
                        style={{
                          width: `${(currentPasswordStrength / 5) * 100}%`,
                        }}
                      />
                    </Box>
                  </Box>
                )}

                {errors.newPassword && (
                  <FormControlError>
                    <FormControlErrorText className="text-red-600 mt-1">
                      {errors.newPassword}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-600 text-base">
                    Confirmar Nova Senha
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  variant="rounded"
                  className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                  size="lg"
                >
                  <InputField
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    value={passwords.confirmPassword}
                    onChangeText={(value: string) =>
                      handlePasswordChange("confirmPassword", value)
                    }
                    className="placeholder:text-typography-400"
                    secureTextEntry={!showPasswords.confirm}
                  />
                  <InputSlot
                    className="pr-3"
                    onPress={() => togglePasswordVisibility("confirm")}
                  >
                    <InputIcon
                      as={showPasswords.confirm ? EyeOffIcon : EyeIcon}
                      className="text-gray-500"
                    />
                  </InputSlot>
                </Input>
                {errors.confirmPassword && (
                  <FormControlError>
                    <FormControlErrorText className="text-red-600 mt-1">
                      {errors.confirmPassword}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>
            </VStack>

            <Box className="bg-[#2b2b2b] p-4 rounded-lg mb-6">
              <Text className="text-white font-medium mb-2">
                Sua nova senha deve conter:
              </Text>
              <VStack space="xs">
                <Text className="text-white text-sm">
                  • No mínimo 8 caracteres
                </Text>
                <Text className="text-white text-sm">
                  • Pelo menos 1 letra maiúscula
                </Text>
                <Text className="text-white text-sm">
                  • Pelo menos 1 letra minúscula
                </Text>
                <Text className="text-white text-sm">
                  • Pelo menos 1 número
                </Text>
              </VStack>
            </Box>

            <Button
              size="lg"
              onPress={handleSubmit}
              isDisabled={resetPasswordMutation.isPending}
            >
              <ButtonText className="text-white font-medium">
                {resetPasswordMutation.isPending
                  ? "Alterando..."
                  : "Alterar Senha"}
              </ButtonText>
            </Button>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    ),
    [
      passwords,
      showPasswords,
      errors,
      handlePasswordChange,
      togglePasswordVisibility,
      currentPasswordStrength,
      getStrengthColor,
      getStrengthText,
      getStrengthTextColor,
      handleSubmit,
      resetPasswordMutation.isPending,
      resetPasswordMutation.isError,
      resetPasswordMutation.error?.message,
    ]
  );

  return (
    <View className="flex-1 bg-black">
      <Header title="Alterar Senha" />
      {renderScreen}
    </View>
  );
}
