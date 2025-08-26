import React, { useState, useEffect } from "react";
import { Switch, Text, View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import CustomHeader from "@/components/shared/custom-header";

import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import * as Application from "expo-application";

const PUSH_KEY = "pushEnabled";

const Settings = () => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [appVersion, setAppVersion] = useState("1.0.0");

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

  return (
    <VStack className="flex-1 bg-background-0 justify-between">
      <VStack>
        <CustomHeader variant="general" title="Configurações" />

        <VStack className="mt-4 bg-[#2b2b2b9d] rounded-lg shadow-sm">
          <View className="flex-row justify-between items-center px-4 h-14 border-b ">
            <Text className="text-base font-medium text-white">
              Receber notificações push
            </Text>
            <Switch value={pushEnabled} onValueChange={togglePush} />
          </View>
        </VStack>
      </VStack>

      {/* Rodapé com versão */}
      <View className="py-4">
        <Text className="text-center text-white text-sm">
          Versão {appVersion}
        </Text>
      </View>
    </VStack>
  );
};

export default Settings;
