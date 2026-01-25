import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Workout } from "@/types/workout";
import { Modal, Text } from "react-native";

interface Props {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  item: Workout;
  onConfirm: (id: string) => void;
}

const ConfirmModalDelete = ({
  modalVisible,
  setModalVisible,
  item,
  onConfirm,
}: Props) => {
  const handleConfirm = () => {
    if (item.id) {
      onConfirm(item.id);
    }
  };

  return (
    <Modal visible={modalVisible} transparent animationType="fade">
      <HStack className="flex-1 justify-center items-center bg-black/90 px-4">
        <Box className="bg-[#121212df] rounded-2xl p-6 w-full max-w-md">
          <VStack space="md">
            <Heading className="text-white font-semibold text-center">
              Deletar Prova?
            </Heading>
            <Text className="text-typography-400 text-center text-base">
              Você tem certeza que deseja deletar a prova:
            </Text>
            <Text className="text-white text-center text-lg font-semibold">
              {item.subtitle}
            </Text>
            <Text className="text-typography-400 text-center text-sm">
              Esta ação não poderá ser desfeita.
            </Text>

            <HStack space="md" className="mt-6 justify-end">
              <Button
                variant="outline"
                size="sm"
                action="secondary"
                onPress={() => setModalVisible(false)}
              >
                <ButtonText>Cancelar</ButtonText>
              </Button>
              <Button action="negative" size="sm" onPress={handleConfirm}>
                <ButtonText>Deletar</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </Box>
      </HStack>
    </Modal>
  );
};

export default ConfirmModalDelete;
