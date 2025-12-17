import Header from "@/components/header";
import { useSession } from "@/contexts/Authentication";
import useANotifications from "@/hooks/useNotification";
import { useRouter } from "expo-router";
import {
  Bell,
  CircleDollarSignIcon,
  Settings,
  SquareAsteriskIcon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Notifications from "../(profile)/components/notifications";
import AvatarImage from "./avatar-image";

export default function Menu() {
  const isDark = true;

  const router = useRouter();
  const { getProfile, updateProfile } = useSession();
  const { onGetNotifications, notifications } = useANotifications();
  const profile = getProfile();

  const [showNotifications, setShowNotifications] = useState(false);

  const handlePassword = () => {
    router.push("/password" as any);
  };

  const handleInvoice = () => {
    router.push(`/invoice` as any);
  };

  const handleSettings = () => {
    router.push(`/settings` as any);
  };

  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    onGetNotifications();
  }, []);

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView className="flex-1">
        {/* Header */}
        <Header title="Menu" />

        {/* Profile Section */}
        <View className="px-4 py-8">
          <View className="items-center mb-6">
            <AvatarImage profile={profile} updateProfile={updateProfile} />
            <Text
              className={`text-xl font-semibold text-center ${
                isDark ? "text-white" : "text-gray-900"
              } mb-2 px-4`}
            >
              {profile?.name || ""}
            </Text>
            <Text
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {profile?.email || ""}
            </Text>
          </View>

          {/* Action Cards Grid */}
          <View className="gap-y-3">
            <View className="flex-row justify-between">
              {/* Notificações */}
              <TouchableOpacity
                style={{ width: "48.5%" }}
                className={`${
                  isDark ? "bg-gray-800" : "bg-white"
                } rounded-2xl p-4 items-center justify-center relative shadow-sm`}
                onPress={handleNotifications}
              >
                <View className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">
                    {notifications?.length}
                  </Text>
                </View>
                <Bell
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                  size={28}
                  strokeWidth={1.5}
                />
                <Text
                  className={`text-xs font-medium mt-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Notificações
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ width: "48.5%" }}
                className={`${
                  isDark ? "bg-gray-800" : "bg-white"
                } rounded-2xl p-4 items-center justify-center shadow-sm`}
                onPress={handleSettings}
              >
                <Settings
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                  size={28}
                  strokeWidth={1.5}
                />
                <Text
                  className={`text-xs font-medium mt-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Configurações
                </Text>
              </TouchableOpacity>

              {/* Inscrições */}
              {/* <TouchableOpacity
                style={{ width: "48.5%" }}
                className={`${
                  isDark ? "bg-gray-800" : "bg-white"
                } rounded-2xl p-4 items-center justify-center shadow-sm`}
              >
                <Ticket
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                  size={28}
                  strokeWidth={1.5}
                />
                <Text
                  className={`text-xs font-medium mt-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Inscrições
                </Text>
              </TouchableOpacity> */}
            </View>

            <View className="flex-row justify-between gap-3">
              {/* Senha */}
              <TouchableOpacity
                style={{ width: "48.5%" }}
                className={`${
                  isDark ? "bg-gray-800" : "bg-white"
                } rounded-2xl p-4 items-center justify-center shadow-sm`}
                onPress={handlePassword}
              >
                <SquareAsteriskIcon
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                  size={28}
                  strokeWidth={1.5}
                />
                <Text
                  className={`text-xs font-medium mt-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Senha
                </Text>
              </TouchableOpacity>

              {/* Financeiro */}
              <TouchableOpacity
                style={{ width: "48.5%" }}
                className={`${
                  isDark ? "bg-gray-800" : "bg-white"
                } rounded-2xl p-4 items-center justify-center shadow-sm`}
                onPress={handleInvoice}
              >
                <CircleDollarSignIcon
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                  size={28}
                  strokeWidth={1.5}
                />
                <Text
                  className={`text-xs font-medium mt-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Financeiro
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between">
              {/* Inscrições (repetido) */}
              {/* <TouchableOpacity
                style={{ width: "48.5%" }}
                className={`${
                  isDark ? "bg-gray-800" : "bg-white"
                } rounded-2xl p-4 items-center justify-center shadow-sm`}
                onPress={handleSettings}
              >
                <Settings
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                  size={28}
                  strokeWidth={1.5}
                />
                <Text
                  className={`text-xs font-medium mt-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Configurações
                </Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </ScrollView>
      <Notifications
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        profile={profile}
      />
    </View>
  );
}
