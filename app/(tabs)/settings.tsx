import Header from "@/components/header";
import { VStack } from "@/components/ui/vstack";
import { ENV } from "@/config/env";
import { useSession } from "@/contexts/Authentication";
import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Linking,
  Platform,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PUSH_KEY = "pushEnabled";

const Settings = () => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [appVersion, setAppVersion] = useState("1.0.0");
  const { getProfile } = useSession();
  const profile = getProfile();

  useEffect(() => {
    const version =
      Application.nativeApplicationVersion ||
      Constants.expoConfig?.version ||
      "1.0.0";
    setAppVersion(version);

    const loadPreference = async () => {
      const value = await SecureStore.getItemAsync(PUSH_KEY);
      if (value !== null) {
        setPushEnabled(value === "true");
      }
    };
    loadPreference();
  }, []);

  const togglePush = async () => {
    const newValue = !pushEnabled;
    setPushEnabled(newValue);
    await SecureStore.setItemAsync(PUSH_KEY, newValue.toString());

    if (!newValue) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } else {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permissão para notificações não concedida.");
      }
    }
  };

  const handleOpenWhatsApp = async () => {
    // ✅ Usando ENV.PHONE_NUMBER ao invés de process.env
    const phoneNumber = ENV.PHONE_NUMBER;
    const message = encodeURIComponent(
      `Olá! Preciso de ajuda com o app.\n\nUsuário: ${profile?.name}\nE-mail: ${profile?.email}\nPlataforma: ${Platform.OS}\n`,
    );
    const url = `https://wa.me/${phoneNumber}?text=${message}`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      alert("Não foi possível abrir o WhatsApp.");
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Container que distribui topo e rodapé */}
      <View className="flex-1 justify-between">
        {/* Conteúdo superior */}
        <VStack>
          <Header title="Configurações" />

          <VStack className="mt-4 rounded-lg shadow-sm">
            <View className="flex-row justify-between items-center px-4 h-14 border-b border-gray-700">
              <Text className="text-base font-medium text-white">
                Receber notificações push
              </Text>
              <Switch value={pushEnabled} onValueChange={togglePush} />
            </View>
          </VStack>
        </VStack>

        {/* Bloco inferior */}
        <View>
          <VStack className="items-center mb-2">
            <TouchableOpacity
              onPress={handleOpenWhatsApp}
              activeOpacity={0.8}
              className="flex-row items-center bg-green-600 py-3 px-5 rounded-full shadow-md"
            >
              <Ionicons name="logo-whatsapp" size={22} color="white" />
              <Text className="ml-2 text-white font-semibold text-base">
                Falar com o suporte
              </Text>
            </TouchableOpacity>

            <Text className="text-center text-gray-400 text-xs mt-2">
              Atendimento via WhatsApp
            </Text>
          </VStack>

          <View className="py-4">
            <Text className="text-center text-white text-sm">
              Versão {appVersion}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Settings;
