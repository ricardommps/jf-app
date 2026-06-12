// StravaConnect.tsx
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import * as ExpoLinking from "expo-linking";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useConnectStrava,
  useStravaStatus,
} from "@/hooks/useConnectStrava/useConnectStrava";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
const Divider = () => <View className="h-px bg-neutral-700" />;

const SectionTitle = ({ label }: { label: string }) => (
  <Text className="text-white text-sm font-semibold px-4 pt-5 pb-2 bg-neutral-900">
    {label}
  </Text>
);

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: boolean;
  onValueChange?: (v: boolean) => void;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
}

const SettingRow = ({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  actionLabel,
  onAction,
  disabled,
}: SettingRowProps) => (
  <View className="flex-row items-start px-4 py-4 bg-neutral-800 gap-3">
    <View className="w-9 items-center justify-center mt-0.5">{icon}</View>
    <View className="flex-1">
      <Text
        className={`text-sm leading-5 ${
          disabled ? "text-neutral-500" : "text-neutral-200"
        }`}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-xs text-neutral-500 mt-1 leading-4">
          {subtitle}
        </Text>
      ) : null}
    </View>
    {onValueChange !== undefined && value !== undefined ? (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#525252", true: "#FC4C02" }}
        thumbColor={value ? "#ffffff" : "#d4d4d4"}
        disabled={disabled}
      />
    ) : null}
    {actionLabel && onAction ? (
      <TouchableOpacity onPress={onAction} className="self-center">
        <Text className="text-blue-400 text-sm font-medium">{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------
const StravaConnect = ({ navigation }: { navigation?: any }) => {
  const { data: stravaData, isLoading } = useStravaStatus();
  const { mutate: connectStrava, status: connectStatus } = useConnectStrava();
  // const { mutate: disconnectStrava, status: disconnectStatus } =
  //   useDisconnectStrava?.() ?? { mutate: undefined, status: undefined };

  const [shareActivities, setShareActivities] = React.useState(true);
  const [shareRoutes, setShareRoutes] = React.useState(true);

  const isConnected = stravaData?.connected ?? false;
  const isConnecting = connectStatus === "pending";
  //const isDisconnecting = disconnectStatus === "pending";

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleConnect = () => {
    const redirectUri = ExpoLinking.createURL("strava-success");
    // Gera: jfapp://strava-success
    connectStrava({ redirectUri });
  };

  // const handleDisconnect = () => {
  //   disconnectStrava?.();
  // };

  if (isLoading) {
    return (
      <View className="flex-1 bg-neutral-900 items-center justify-center">
        <ActivityIndicator size="large" color="#FC4C02" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="h-0.5 bg-[#FC4C02]" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Logo + status */}
          <View className="items-center py-8 px-6 ">
            <Text className="text-[#FC4C02] text-5xl font-black tracking-widest mb-3">
              STRAVA
            </Text>
            {isConnected ? (
              <Text className="text-white text-base text-center">
                Você está conectado ao Strava.
              </Text>
            ) : (
              <Text className="text-white text-base text-center leading-6">
                Conecte sua conta Strava para sincronizar atividades.
              </Text>
            )}
          </View>

          {!isConnected && (
            <View className="items-center px-8 py-12">
              <FontAwesome5
                name="running"
                size={64}
                color="#FC4C02"
                style={{ opacity: 0.85, marginBottom: 20 }}
              />
              <Text className="text-white text-2xl font-bold mb-3 text-center">
                Conecte-se ao Strava
              </Text>
              <Text className="text-neutral-400 text-sm text-center leading-6 mb-8">
                Sincronize automaticamente suas atividades e percursos entre o
                Garmin Connect e o Strava.
              </Text>
              <TouchableOpacity
                onPress={handleConnect}
                activeOpacity={0.8}
                disabled={isConnecting}
                className="flex-row items-center bg-[#FC4C02] py-4 px-8 rounded-full gap-2.5"
                style={{
                  shadowColor: "#FC4C02",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.45,
                  shadowRadius: 10,
                  elevation: 6,
                }}
              >
                {isConnecting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <FontAwesome5 name="strava" size={20} color="#fff" />
                    <Text className="text-white text-base font-bold tracking-wide">
                      Conectar com Strava
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default StravaConnect;
