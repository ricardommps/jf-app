import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  MapsIcon,
  SettingsIcon,
  ActiveMapsIcon,
  ActiveSettingsIcon,
  HomeIcon,
  ActiveHomeIcon,
  ProfileIcon,
  ActiveProfileIcon,
  HistoryIcon,
  ActiveHistoryIcon,
} from "@/components/shared/icon";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Platform } from "react-native";
import { Icon } from "@/components/ui/icon";
import { RFValue } from "react-native-responsive-fontsize";

interface TabItem {
  name: string;
  label: string;
  path: string;
  inActiveIcon: React.ElementType;
  icon: React.ElementType;
}

const tabItems: TabItem[] = [
  {
    name: "(home)",
    label: "Home",
    path: "(home)",
    inActiveIcon: HomeIcon,
    icon: ActiveHomeIcon,
  },

  {
    name: "(profile)",
    label: "Perfil",
    path: "(profile)",
    inActiveIcon: ProfileIcon,
    icon: ActiveProfileIcon,
  },
  {
    name: "(history)",
    label: "Histórico",
    path: "(history)",
    inActiveIcon: HistoryIcon,
    icon: ActiveHistoryIcon,
  },
  {
    name: "settings",
    label: "Configurações",
    path: "settings",
    inActiveIcon: SettingsIcon,
    icon: ActiveSettingsIcon,
  },
];

function BottomTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <Box className="bg-background-0">
      <HStack
        className="bg-background-0 pt-4 px-7 rounded-t-3xl min-h-[78px]"
        style={{
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 16,
          boxShadow: "0px -10px 12px 0px rgba(0, 0, 0, 0.04)",
        }}
        space="sm"
      >
        {tabItems.map((item) => {
          const isActive =
            props.state.routeNames[props.state.index] === item.path;
          return (
            <Pressable
              key={item.name}
              className="flex-1 items-center justify-center"
              onPress={() => {
                props.navigation.navigate(item.path);
              }}
            >
              <Icon
                as={isActive ? item.icon : item.inActiveIcon}
                size="xl"
                className={`${
                  isActive
                    ? item.icon === ActiveMapsIcon
                      ? "fill-primary-800 text-background-0"
                      : "stroke-background-0 fill-background-800"
                    : "text-background-500"
                }`}
              />
              <Text
                style={{ fontSize: RFValue(8) }} // 12 é o valor base em pixels
                className={`mt-1 font-medium text-center ${
                  isActive ? "text-primary-800" : "text-background-500"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
}

export default BottomTabBar;
