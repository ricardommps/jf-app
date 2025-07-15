import React from "react";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { ChevronRightIcon, Icon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";

const RedirectCard = ({ title, icon }: { title: string; icon: any }) => {
  return (
    <Pressable className="p-3 h-14 items-center bg-gray-900 rounded-[18px] gap-3 flex flex-row data-[active=true]:bg-primary-100">
      <Box className="p-3">
        <Icon as={icon} size="sm" className="text-primary-700" />
      </Box>
      <Text className="font-dm-sans-medium text-typography-900 flex-1">
        {title}
      </Text>
      <Box className="h-6 w-6 bg-background-0 rounded-full items-center justify-center">
        <Icon as={ChevronRightIcon} size="md" className="text-background-800" />
      </Box>
    </Pressable>
  );
};

export default RedirectCard;
