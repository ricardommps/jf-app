import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import tabItems from "./tabItems";

const Footer: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  return (
    <View
      className="bg-black border-t border-gray-800"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 10,
      }}
    >
      <View className="max-w-xl mx-auto flex-row items-center justify-around px-4 py-2 min-h-[74px]">
        {tabItems.map((item) => {
          const isActive = state.routeNames[state.index] === item.name;

          const IconComponent = item.icon;

          const onPress = () => {
            if (!isActive) {
              navigation.navigate(item.name as never);
            }
          };

          return (
            <TouchableOpacity
              key={item.name}
              className="flex-1 items-center justify-center gap-1"
              onPress={onPress}
              activeOpacity={0.7}
            >
              <IconComponent size={22} color={isActive ? "white" : "#9CA3AF"} />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? "600" : "500",
                  color: isActive ? "white" : "#9CA3AF",
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default Footer;
