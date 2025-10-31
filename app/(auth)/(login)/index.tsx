// LoginScreen.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { z } from "zod";

import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { useSession } from "@/contexts/Authentication";
import { SafeAreaView } from "react-native-safe-area-context";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const { login } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onBlur",
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const { height } = Dimensions.get("window");
  const isSmallDevice = height < 700;

  const showToast = (message: string) => {
    toast.show({
      placement: "top",
      duration: 3000,
      render: ({ id }) => (
        <Box className="mt-12">
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastTitle>Aviso</ToastTitle>
            <ToastDescription>{message}</ToastDescription>
          </Toast>
        </Box>
      ),
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      Keyboard.dismiss();
      await login(data);
    } catch (err) {
      showToast("Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 28,
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo */}
            <View
              className={`flex justify-center items-center ${
                isSmallDevice ? "mt-16" : "mt-32"
              }`}
            >
              <Image
                source={require("@/assets/images/jf_logo_full.png")}
                alt="logo"
                resizeMode="contain"
                className={`${isSmallDevice ? "w-80 h-32" : "w-96 h-48"}`}
              />
            </View>

            {/* Form */}
            <View className={`${isSmallDevice ? "mt-8" : "mt-12"}`}>
              {/* Email Input */}
              <Controller
                name="email"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <Input
                      variant="rounded"
                      className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                      size="lg"
                    >
                      <InputField
                        placeholder="Digite seu e-mail"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isLoading}
                      />
                    </Input>
                    {errors.email && (
                      <Text className="text-red-500 text-sm ml-2 mt-1">
                        {errors.email.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* Password Input */}
              <Controller
                name="password"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ marginTop: 8 }}>
                    {/* container relative to position the toggle */}
                    <View style={{ position: "relative" }}>
                      <Input
                        variant="rounded"
                        className="border-0 bg-[#2b2b2b9d] rounded-md mt-1 mb-1 w-full"
                        size="lg"
                      >
                        <InputField
                          placeholder="Digite sua senha"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          secureTextEntry={!showPassword}
                          onSubmitEditing={handleSubmit(onSubmit)}
                          editable={!isLoading}
                        />
                      </Input>

                      {/* Toggle button (positioned on the right inside the input container) */}
                      <Pressable
                        onPress={() => setShowPassword((s) => !s)}
                        style={styles.toggleButton}
                        accessibilityLabel={
                          showPassword ? "Ocultar senha" : "Mostrar senha"
                        }
                        hitSlop={8}
                      >
                        <Text className="text-sm">
                          {showPassword ? "Ocultar" : "Mostrar"}
                        </Text>
                      </Pressable>
                    </View>

                    {errors.password && (
                      <Text className="text-red-500 text-sm ml-2 mt-1">
                        {errors.password.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Buttons */}
            <View className="flex justify-center items-center pt-6">
              <Button
                action="primary"
                size="lg"
                className="w-full"
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner size="small" color="white" />
                ) : (
                  <ButtonText>Login</ButtonText>
                )}
              </Button>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    position: "absolute",
    right: 12,
    top: Platform.OS === "ios" ? 14 : 13, // tweak if needed to vertically center
    zIndex: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
});
