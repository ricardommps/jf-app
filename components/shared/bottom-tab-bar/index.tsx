import {
  ActiveChartColumnStackedIcon,
  ActiveHistoryIcon,
  ActiveHomeIcon,
  ActiveProfileIcon,
  ActiveSettingsIcon,
  ChartColumnStackedIcon,
  HistoryIcon,
  HomeIcon,
  ProfileIcon,
  SettingsIcon,
} from "@/components/shared/icon";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

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
    name: "(monotony)",
    label: "Monotonia",
    path: "(monotony)",
    inActiveIcon: ActiveChartColumnStackedIcon,
    icon: ChartColumnStackedIcon,
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
  return (
    <Box className="bg-background-0">
      <HStack
        className="bg-background-0 pt-4 px-7 rounded-t-3xl min-h-[70px]"
        style={{
          paddingBottom: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          elevation: 10,
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
              onPress={() => props.navigation.navigate(item.path)}
            >
              <Icon
                as={isActive ? item.icon : item.inActiveIcon}
                size="xl"
                className={`${
                  isActive
                    ? item.icon === ActiveHomeIcon
                      ? "fill-primary-800 text-background-0"
                      : "stroke-background-0 fill-background-800"
                    : "text-background-500"
                }`}
              />
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
}

export default BottomTabBar;
