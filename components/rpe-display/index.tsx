import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { rpeConfiguration } from "@/utils/rpe-configuration";

type Props = {
  rpe: number;
};

export const RpeDisplay = ({ rpe }: Props) => {
  const config = rpeConfiguration.find((cfg) => cfg.value === rpe);
  const IconComponent = config?.icon;

  return (
    <VStack className="items-center">
      {IconComponent && (
        <Icon as={IconComponent} size="xl" className="text-background-700" />
      )}
      <Text className="text-xs text-typography-700 mt-1">Esforço</Text>
      <Text className="text-xs text-typography-900">{rpe}</Text>
    </VStack>
  );
};
