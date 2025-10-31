import React from "react";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";

interface IGoBackButton {
  title: string;
  icon: any;
  onPress: () => void;
  active: boolean;
}

const GoBackButton = ({ title, icon, onPress, active }: IGoBackButton) => {
  return (
    <Pressable
      className={"h-14 items-center rounded-[18px] gap-3 flex-1 flex-row"}
      onPress={onPress}
    >
      <Icon as={icon} size="lg" className="text-primary-900" />
      <Text className="font-dm-sans-medium text-typography-900" size="xl">
        {title}
      </Text>
    </Pressable>
  );
};

export default GoBackButton;
