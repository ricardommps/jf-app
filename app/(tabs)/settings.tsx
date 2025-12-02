import CustomHeader from "@/components/shared/custom-header";
import { VStack } from "@/components/ui/vstack";
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
    const phoneNumber = process.env.PHONENUMBER;
    const message = encodeURIComponent(
      `Olá! Preciso de ajuda com o app.\n\nUsuário: ${profile?.name}\nE-mail: ${profile?.email}\nPlataforma: ${Platform.OS}\n`
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
    <VStack className="flex-1 bg-background-0 justify-between">
      <VStack>
        <CustomHeader variant="general" title="Configurações" />

        <VStack className="mt-4 bg-[#2b2b2b9d] rounded-lg shadow-sm">
          <View className="flex-row justify-between items-center px-4 h-14 border-b border-gray-700">
            <Text className="text-base font-medium text-white">
              Receber notificações push
            </Text>
            <Switch value={pushEnabled} onValueChange={togglePush} />
          </View>
        </VStack>
      </VStack>

      {/* Bloco de suporte */}
      <VStack className="items-center mt-6 mb-2">
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
    </VStack>
  );
};

export default Settings;
