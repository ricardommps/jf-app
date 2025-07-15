import React, { useContext } from "react";
import { Link } from "expo-router";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { WeatherTabContext } from "@/contexts/weather-screen-context";

const tabs = [
  {
    id: 0,
    path: "/",
    label: "Home",
  },
  {
    id: 1,
    path: "/days",
    label: "10 Days",
  },
  {
    id: 2,
    path: "/monthly",
    label: "Monthly",
  },
];

const Tabs = () => {
  const { selectedTabIndex, setSelectedTabIndex }: any =
    useContext(WeatherTabContext);

  const handlePress = (index: number) => {
    setSelectedTabIndex(index);
  };

  return (
    <HStack space="xs" className="px-4 pt-5 pb-4 bg-background-0 gap-2">
      {tabs.map((tab, index) => (
        //@ts-ignore
        <Link href={tab.path} asChild key={tab.id}>
          <Pressable
            onPress={() => handlePress(index)}
            className={`${
              selectedTabIndex === index
                ? "bg-secondary-200"
                : "bg-background-300"
            } flex-1 rounded-full items-center justify-center h-[43px] border border-secondary-100`}
          >
            <Text
              className={`font-dm-sans-regular ${
                selectedTabIndex === index
                  ? "text-background-light"
                  : "text-typography-950"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        </Link>
      ))}
    </HStack>
  );
};

export default Tabs;
