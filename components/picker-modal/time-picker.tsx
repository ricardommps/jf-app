import React, { useEffect, useState } from "react";
import { Modal, View } from "react-native";
import { Text } from "@/components/ui/text";
import WheelPickerExpo from "react-native-wheel-picker-expo";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";

interface PickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  initialValue: number;
  title?: string;
}

const TimePicker = ({
  visible,
  onClose,
  onConfirm,
  initialValue = 1000,
  title,
}: PickerModalProps) => {
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [selectedSeconds, setSelectedSeconds] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);

  const hour: any = Array.from({ length: 24 }, (_, i) => ({
    label: i.toString().padStart(2, "0"), // Adiciona '0' para valores entre 0 e 9
    value: i,
  }));

  const minutes: any = Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i,
  }));

  const seconds: any = Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i,
  }));

  const handleConfirm = () => {
    const totalSeconds =
      selectedHours * 3600 + selectedMinutes * 60 + selectedSeconds;
    onConfirm(totalSeconds.toString()); // Salva o valor correto em metros
  };

  useEffect(() => {
    if (visible) {
      // Converte o valor inicial (em segundos) para horas, minutos e segundos
      const initialHours = Math.floor(initialValue / 3600);
      const initialMinutes = Math.floor((initialValue % 3600) / 60);
      const initialSeconds = initialValue % 60;

      setSelectedHours(initialHours);
      setSelectedMinutes(initialMinutes);
      setSelectedSeconds(initialSeconds);

      setForceUpdate((prev) => prev + 1);
    }
  }, [visible, initialValue]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/70 justify-center items-center">
        <View className="bg-neutral-900 w-11/12 rounded-xl p-6">
          <Heading size="md" className="text-white text-center mb-5">
            {title ? title : "Selecione o tempo de treino(hh:mm:ss)"}
          </Heading>
          <View className="flex-row justify-evenly items-center">
            <WheelPickerExpo
              height={160}
              width={80}
              initialSelectedIndex={selectedHours}
              items={hour}
              onChange={({ item }) => setSelectedHours(item.value)}
              backgroundColor="#131212"
              selectedStyle={{ borderColor: "#ffffff", borderWidth: 2 }}
              renderItem={(props) => <Text>{props.label}</Text>}
              key={`pickerHours-${forceUpdate}`}
            />

            <Text className="text-white text-3xl">:</Text>

            <WheelPickerExpo
              height={160}
              width={80}
              initialSelectedIndex={selectedMinutes}
              items={minutes}
              onChange={({ item }) => setSelectedMinutes(item.value)}
              backgroundColor="#131212"
              selectedStyle={{ borderColor: "#ffffff", borderWidth: 2 }}
              renderItem={(props) => <Text>{props.label}</Text>}
              key={`pickerMinutes-${forceUpdate}`}
            />

            <Text className="text-white text-3xl">:</Text>

            <WheelPickerExpo
              height={160}
              width={80}
              initialSelectedIndex={selectedSeconds}
              items={seconds}
              onChange={({ item }) => setSelectedSeconds(item.value)}
              backgroundColor="#131212"
              selectedStyle={{ borderColor: "#ffffff", borderWidth: 2 }}
              renderItem={(props) => <Text>{props.label}</Text>}
              key={`pickerSeconds-${forceUpdate}`}
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

export default TimePicker;
