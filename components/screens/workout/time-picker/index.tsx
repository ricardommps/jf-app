import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import {
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";

interface ITimePicker {
  open: boolean;
  onClose: () => void;
  onSave: (totalSeconds: string) => void;
}

const generateRange = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const TimePicker = ({ open, onClose, onSave }: ITimePicker) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const format = (num: number) => num.toString().padStart(2, "0");

  const handleOk = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    onSave(totalSeconds.toString()); // Salva o valor em segundos
  };

  return (
    <Modal visible={open} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <Box className="flex-1 bg-black/40 justify-center items-center px-4">
          <TouchableWithoutFeedback>
            <Box className="bg-white rounded-2xl w-full p-4">
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                }}
              >
                {/* HH */}
                <View style={{ width: 80 }}>
                  <Picker
                    selectedValue={hours}
                    onValueChange={(val) => setHours(val)}
                    style={{
                      color: "#fff",
                      backgroundColor: "gray",
                      height: 40, // Ajusta a altura do Picker
                      fontSize: 16, // Ajusta o tamanho da fonte
                      width: "100%", // Garante que o Picker ocupe 100% da largura da View
                    }}
                  >
                    {generateRange(0, 23).map((h) => (
                      <Picker.Item key={h} label={format(h)} value={h} />
                    ))}
                  </Picker>
                </View>

                {/* : */}
                <Text
                  style={{ color: "#fff", fontSize: 18, marginHorizontal: 4 }}
                >
                  :
                </Text>

                {/* MM */}
                <View style={{ width: 80 }}>
                  <Picker
                    selectedValue={minutes}
                    onValueChange={(val) => setMinutes(val)}
                    style={{
                      color: "#fff",
                      backgroundColor: "gray",
                      height: 40, // Ajusta a altura do Picker
                      fontSize: 16, // Ajusta o tamanho da fonte
                      width: "100%", // Garante que o Picker ocupe 100% da largura da View
                    }}
                  >
                    {generateRange(0, 59).map((m) => (
                      <Picker.Item key={m} label={format(m)} value={m} />
                    ))}
                  </Picker>
                </View>

                {/* : */}
                <Text
                  style={{ color: "#fff", fontSize: 18, marginHorizontal: 4 }}
                >
                  :
                </Text>

                {/* SS */}
                <View style={{ width: 80 }}>
                  <Picker
                    selectedValue={seconds}
                    onValueChange={(val) => setSeconds(val)}
                    style={{
                      color: "#fff",
                      backgroundColor: "gray",
                      height: 40, // Ajusta a altura do Picker
                      fontSize: 16, // Ajusta o tamanho da fonte
                      width: "100%", // Garante que o Picker ocupe 100% da largura da View
                    }}
                  >
                    {generateRange(0, 59).map((s) => (
                      <Picker.Item key={s} label={format(s)} value={s} />
                    ))}
                  </Picker>
                </View>
              </View>
              <VStack className="flex-row justify-end mt-4 gap-8">
                <Button
                  onPress={() => {
                    setHours(0);
                    setMinutes(0);
                    setSeconds(0);
                    onClose();
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-red-500"
                >
                  <Text className="text-white">Fechar</Text>
                </Button>

                <Button onPress={handleOk} className="bg-green-500" size="sm">
                  <Text className="text-white">Salvar</Text>
                </Button>
              </VStack>
            </Box>
          </TouchableWithoutFeedback>
        </Box>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default TimePicker;
