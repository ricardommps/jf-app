import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React from "react";
import { Image, Text, View } from "react-native";

type StravaBrandBridgeProps = {
  connected?: boolean;
  userAvatar?: string | null;
  userName?: string | null;
};

const CONNECTOR_COLORS = ["#21C8B9", "#67C46C", "#A09546", "#D7862C", "#FF6900"];

function getInitials(name?: string | null) {
  if (!name) return "JF";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "JF";

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function StravaBrandBridge({
  connected = false,
  userAvatar,
  userName,
}: StravaBrandBridgeProps) {
  return (
    <View
      className="self-center flex-row items-center justify-between"
      style={{ width: 292 }}
    >
      <Image
        source={require("@/assets/images/jf_icone_v1.png")}
        resizeMode="contain"
        style={{ width: 92, height: 112 }}
      />

      <View
        className="flex-row items-center justify-between"
        style={{ width: 88 }}
      >
        {CONNECTOR_COLORS.map((color, index) => (
          <View
            key={`${color}-${index}`}
            style={{
              width: 9,
              height: 9,
              borderRadius: 999,
              backgroundColor: color,
            }}
          />
        ))}
      </View>

      {connected ? (
        <View className="relative">
          <View
            className="items-center justify-center overflow-hidden rounded-full border-[3px]"
            style={{
              width: 88,
              height: 88,
              borderColor: "#FC5200",
              backgroundColor: "#12161F",
            }}
          >
            {userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                resizeMode="cover"
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <View className="flex-1 items-center justify-center bg-[#1B2030]">
                <Text className="text-[27px] font-extrabold text-white">
                  {getInitials(userName)}
                </Text>
              </View>
            )}
          </View>

          <View
            className="absolute items-center justify-center rounded-full border-2 border-[#0C1017]"
            style={{
              width: 30,
              height: 30,
              backgroundColor: "#FC5200",
              bottom: 2,
              right: -6,
            }}
          >
            <FontAwesome5 name="strava" size={12} color="#FFFFFF" />
          </View>
        </View>
      ) : (
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 88,
            height: 88,
            backgroundColor: "#FC5200",
          }}
        >
          <FontAwesome5 name="strava" size={40} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}
