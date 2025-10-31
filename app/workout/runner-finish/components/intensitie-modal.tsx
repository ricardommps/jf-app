import React, { useEffect, useState } from "react";
import { Alert, Modal, Text, TouchableWithoutFeedback } from "react-native";

import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";

interface Props {
  visible: boolean;
  onRequestClose: () => void;
  intensity: string;
  intensities: number[];
  editingIntensityIndex: number | null;
  onConfirm?: (value: string) => void;
}

const IntensitieModal: React.FC<Props> = ({
  visible,
  onRequestClose,
  intensity,
  editingIntensityIndex,
  intensities,
  onConfirm,
}) => {
  // Estados
  const [intensityValue, setIntensityValue] = useState(intensity);

  // Atualiza o valor quando o modal abre com dados diferentes
  useEffect(() => {
    setIntensityValue(intensity);
  }, [intensity, visible]);

  const handleConfirm = () => {
    const value = parseFloat(intensityValue);
    if (isNaN(value)) {
      Alert.alert("Erro", "Por favor, insira um valor numérico válido");
      return;
    }

    if (onConfirm) {
      onConfirm(intensityValue);
    }
  };

  const handleCancel = () => {
    setIntensityValue(intensity); // Restaura o valor original
    onRequestClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      presentationStyle="overFullScreen"
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <Box className="flex-1 bg-black/40 justify-center items-center px-4">
          <TouchableWithoutFeedback>
            <Box className="bg-white dark:bg-gray-800 rounded-2xl w-full p-6">
              <VStack space="md">
                <Text className="text-lg font-semibold text-center text-gray-900 dark:text-white">
                  {editingIntensityIndex !== null
                    ? `Editar Intensidade ${editingIntensityIndex + 1}`
                    : `Adicionar Intensidade ${intensities.length + 1}`}
                </Text>

                <Text className="text-gray-600 dark:text-gray-300 text-sm">
                  Insira o valor da intensidade:
                </Text>

                <Input
                  variant="rounded"
                  className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  size="lg"
                >
                  <InputField
                    value={intensityValue}
                    onChangeText={setIntensityValue}
                    placeholder="Ex: 8.5"
                    keyboardType="numeric"
                    className="placeholder:text-typography-400"
                    autoFocus={true}
                  />
                </Input>

                <HStack className="justify-end mt-4 gap-3">
                  <Button onPress={handleCancel} variant="outline" size="sm">
                    <ButtonText>Cancelar</ButtonText>
                  </Button>
                  <Button
                    onPress={handleConfirm}
                    className="bg-green-500"
                    size="sm"
                  >
                    <ButtonText className="text-white">
                      {editingIntensityIndex !== null ? "Salvar" : "Adicionar"}
                    </ButtonText>
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </TouchableWithoutFeedback>
        </Box>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default IntensitieModal;
