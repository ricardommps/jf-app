import {
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Actionsheet } from "@/components/ui/actionsheet";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { CloseIcon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { FileWarning, FileWarningIcon, MailIcon } from "lucide-react-native";

interface Props {
  open: boolean;
  onClose: () => void;
}

const Notifications = ({ open, onClose }: Props) => {
  return (
    <Actionsheet isOpen={open} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="px-5 min-h-[60%]">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <HStack className="justify-between w-full mt-3">
          <VStack>
            <Heading size="sm" className="font-semibold">
              Notificações
            </Heading>
          </VStack>
          <Pressable onPress={onClose}>
            <Icon as={CloseIcon} size="lg" className="stroke-background-500" />
          </Pressable>
        </HStack>

        <VStack className="w-full mt-5 gap-3 px-3 mr-3">
          <Divider orientation="horizontal" />
          <HStack className="items-start w-full gap-3">
            <Icon
              as={MailIcon}
              size="lg"
              className="stroke-background-500 my-1"
            />
            <VStack className="w-full">
              <Text size="lg" className="font-semibold">
                Olá, Ricardo
              </Text>
              <Text size="sm">há 10 minutos</Text>
              <Box className="w-[95%] rounded-2xl bg-gray-900 gap-3 p-3 my-3">
                <Text size="md" className="font-semibold">
                  O feedback do seu último treino está disponível
                </Text>
                <Pressable>
                  <Text size="sm" className="font-bold">
                    Clique aqui para conferir
                  </Text>
                </Pressable>
              </Box>
            </VStack>
          </HStack>
          <Divider orientation="horizontal" />
          <HStack className="items-start w-full gap-3">
            <Icon
              as={FileWarningIcon}
              size="lg"
              className="stroke-background-500 my-1"
            />
            <VStack className="w-full">
              <Text size="lg" className="font-semibold">
                Olá, Ricardo
              </Text>
              <Text size="sm">há 10 minutos</Text>
              <Box className="w-[95%] rounded-2xl bg-gray-900 gap-3 p-3 my-3">
                <Text size="md" className="font-semibold">
                  Você possui mensalidade atrasada!
                </Text>
                <Pressable>
                  <Text size="sm" className="font-bold">
                    Clique aqui para conferir
                  </Text>
                </Pressable>
              </Box>
            </VStack>
          </HStack>
        </VStack>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default Notifications;
