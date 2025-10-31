import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import React, { useEffect, useState } from "react";
import { Modal, View } from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";

interface PickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  initialValue: number;
  title: string;
}

const DistancePicker = ({
  visible,
  onClose,
  onConfirm,
  initialValue = 1000,
  title,
}: PickerModalProps) => {
  const [selectedKmIndex, setSelectedKmIndex] = useState(0);
  const [selectedMeterIndex, setSelectedMeterIndex] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);

  const kilometers: any = Array.from({ length: 100 }, (_, i) => ({
    label: i.toString().padStart(2, "0"), // Adiciona '0' na frente para valores entre 0 e 9
    value: i,
  }));

  // Metros de 0 a 99, onde o valor real é multiplicado por 10
  const meters: any = Array.from({ length: 100 }, (_, i) => ({
    label: i.toString().padStart(2, "0"), // Formata como 00, 01, 02, ..., 99
    value: i, // Cada valor já é diretamente o número de metros
  }));

  const handleConfirm = () => {
    // Converte as seleções de volta para metros, onde selectedMeterIndex é multiplicado por 10
    const totalMeters = selectedKmIndex * 100 + selectedMeterIndex;
    onConfirm(totalMeters.toString()); // Salva o valor correto em metros
  };

  useEffect(() => {
    if (visible) {
      const initialKm = Math.floor(initialValue / 100);
      const initialMeters = initialValue % 100; // Pegue os metros diretamente do valor

      setSelectedKmIndex(initialKm);
      setSelectedMeterIndex(initialMeters);

      setForceUpdate((prev) => prev + 1);
    }
  }, [visible, initialValue]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/70 justify-center items-center">
        <View className="bg-neutral-900 w-11/12 rounded-xl p-6">
          <Heading size="md" className="text-white text-center mb-5">
            {title}
          </Heading>
          <View className="flex-row justify-evenly items-center">
            <WheelPickerExpo
              height={160}
              initialSelectedIndex={selectedKmIndex}
              items={kilometers}
              onChange={({ item }) => setSelectedKmIndex(item.value)}
              backgroundColor="#131212"
              selectedStyle={{ borderColor: "#ffffff", borderWidth: 2 }}
              renderItem={(props) => <Text>{props.label}</Text>}
              key={`pickerOne-${forceUpdate}`}
            />

            <Text className="text-white text-3xl">,</Text>

            <WheelPickerExpo
              height={160}
              initialSelectedIndex={selectedMeterIndex}
              items={meters}
              onChange={({ item }) => setSelectedMeterIndex(item.value)}
              backgroundColor="#131212"
              selectedStyle={{ borderColor: "#ffffff", borderWidth: 2 }}
              renderItem={(props) => <Text>{props.label}</Text>}
              key={`pickerTwo-${forceUpdate}`}
            />
          </View>

          <HStack className="gap-4 pt-5 justify-end">
            <Button
              variant="outline"
              size="sm"
              action="secondary"
              onPress={onClose}
            >
              <ButtonText>Cancelar</ButtonText>
            </Button>

            <Button action="primary" size="sm" onPress={handleConfirm}>
              <ButtonText>Confirmar</ButtonText>
            </Button>
          </HStack>
        </View>
      </View>
    </Modal>
  );
};

export default DistancePicker;
