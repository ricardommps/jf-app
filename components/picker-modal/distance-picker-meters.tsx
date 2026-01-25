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

const DistancePickerMeters = ({
  visible,
  onClose,
  onConfirm,
  initialValue = 0,
  title,
}: PickerModalProps) => {
  const [selectedKmIndex, setSelectedKmIndex] = useState(0);
  const [selectedMeterIndex, setSelectedMeterIndex] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Quilômetros de 0 a 99
  const kilometers: any = Array.from({ length: 100 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i,
  }));

  // Centésimos de quilômetro (00 a 99 = 0.00 a 0.99 km)
  const meters: any = Array.from({ length: 100 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i,
  }));

  const handleConfirm = () => {
    // Converte km + centésimos para metros totais
    // Exemplo: 5 km + 50 centésimos = 5.50 km = 5500 metros
    const km = selectedKmIndex + selectedMeterIndex / 100;
    const totalMeters = Math.round(km * 1000);
    onConfirm(totalMeters.toString());
  };

  useEffect(() => {
    if (visible) {
      // Converte metros para km (dividido por 1000)
      const km = initialValue / 1000;
      const initialKm = Math.floor(km);
      const initialMeters = Math.round((km - initialKm) * 100);

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

            <Text className="text-white text-xl ml-2">km</Text>
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

export default DistancePickerMeters;
