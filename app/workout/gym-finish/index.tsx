import HeaderNavigation from "@/components/shared/header-navigation";
import { useContext, useState } from "react";
import { ThemeContext } from "@/contexts/theme-context";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import {
  Icon,
  HappyIcon,
  VeryHappyIcon,
  NeutralIcon,
  SadIcon,
  VerySadIcon,
} from "@/components/ui/icon";
import { Modal, ScrollView, TouchableWithoutFeedback } from "react-native";
import { Calendar } from "react-native-calendars";
import dayjs from "dayjs";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { CalendarDays } from "lucide-react-native";
import { Textarea, TextareaInput } from "@/components/ui/textarea";

const GymFinishView = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const { colorMode }: any = useContext(ThemeContext);
  const isDarkMode = colorMode === "dark";

  const [selectedDate, setSelectedDate] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setModalVisible(false);
  };

  const colors = [
    {
      value: 10,
      color: "bg-red-600/60",
      label: "Extremamente pesado",
      icon: VerySadIcon,
    },
    { value: 9, color: "bg-orange-800/60", label: "", icon: SadIcon },
    { value: 8, color: "bg-orange-700/60", label: "", icon: SadIcon },
    {
      value: 7,
      color: "bg-orange-600/60",
      label: "Muito pesado",
      icon: SadIcon,
    },
    { value: 6, color: "bg-orange-500/60", label: "", icon: NeutralIcon },
    { value: 5, color: "bg-amber-400/60", label: "Pesado", icon: NeutralIcon },
    {
      value: 4,
      color: "bg-yellow-400/60",
      label: "Um pouquinho pesado",
      icon: NeutralIcon,
    },
    { value: 3, color: "bg-yellow-300/60", label: "Moderado", icon: HappyIcon },
    { value: 2, color: "bg-lime-400/60", label: "Leve", icon: VeryHappyIcon },
    {
      value: 1,
      color: "bg-green-500/60",
      label: "Muito Leve",
      icon: VeryHappyIcon,
    },
    {
      value: 0,
      color: "bg-green-600/60",
      label: "Repouso",
      icon: VeryHappyIcon,
    },
  ];
  return (
    <VStack space="md" className="flex-1 bg-background-0">
      <HeaderNavigation
        variant="search"
        title="Finalizar treino"
        label="Search for a city"
      />
      <ScrollView>
        <Box className="px-4 pt-2">
          <Pressable onPress={() => setModalVisible(true)} className="w-full">
            <Box pointerEvents="none">
              <Input
                variant="rounded"
                className="border-0 bg-background-50 rounded-md mt-2 mb-5 w-full"
                size="lg"
              >
                <InputField
                  editable={false}
                  value={
                    selectedDate ? dayjs(selectedDate).format("DD/MM/YYYY") : ""
                  }
                  placeholder="Data de realização do treino"
                  className="placeholder:text-typography-400"
                />
                <InputSlot className="pr-3">
                  <CalendarDays color="#4B5563" size={20} />
                </InputSlot>
              </Input>
            </Box>
          </Pressable>

          <Modal visible={modalVisible} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <Box className="flex-1 bg-black/40 justify-center items-center px-4">
                <TouchableWithoutFeedback>
                  <Box className="bg-white rounded-2xl w-full p-4">
                    <Calendar
                      onDayPress={handleDayPress}
                      markedDates={{
                        [selectedDate]: {
                          selected: true,
                          marked: true,
                          selectedColor: "#22c55e", // green-500
                        },
                      }}
                      theme={{
                        todayTextColor: "#22c55e",
                      }}
                    />

                    <VStack className="flex-row justify-end mt-4 gap-8">
                      <Button
                        onPress={() => {
                          setSelectedDate("");
                          setModalVisible(false);
                        }}
                        variant="outline"
                        size="sm"
                        className="bg-red-500"
                      >
                        <Text className="text-white">Limpar</Text>
                      </Button>

                      <Button
                        onPress={() => setModalVisible(false)}
                        className="bg-green-500"
                        size="sm"
                      >
                        <Text className="text-white">Fechar</Text>
                      </Button>
                    </VStack>
                  </Box>
                </TouchableWithoutFeedback>
              </Box>
            </TouchableWithoutFeedback>
          </Modal>
        </Box>
        <Box className="px-4 mb-5">
          <Textarea
            size="md"
            isReadOnly={false}
            isInvalid={false}
            isDisabled={false}
            className="border-0 bg-background-50 rounded-md  w-full"
          >
            <TextareaInput
              placeholder="Comentários"
              className="pt-2 text-left align-top"
            />
          </Textarea>
        </Box>
        <VStack className="justify-center items-center">
          <VStack className="items-center mb-5 gap-2">
            <Text className="text-typography-700 font-semibold">
              Escala CR-10 de borg
            </Text>
            <Text className="text-typography-700 font-semibold">
              Percepção de esforço
            </Text>
          </VStack>
          <VStack space="sm" className="items-start gap-1">
            {colors.map(({ value, color, label, icon }) => {
              const isSelected = selected === value;
              const baseStyle = `${color}/60 rounded-md w-16 h-10 justify-center items-center`;
              const selectedStyle = isSelected
                ? "border-2 border-black dark:border-white p-1"
                : "";

              return (
                <Pressable key={value} onPress={() => setSelected(value)}>
                  <HStack
                    className={`items-center gap-2 ${selectedStyle} ${color}`}
                  >
                    <Box className={`${baseStyle}`}>
                      <Text
                        className={`${
                          isDarkMode ? "text-white" : "text-typography-900"
                        } font-bold`}
                      >
                        {value}
                      </Text>
                    </Box>

                    <Text
                      className={`${
                        isDarkMode ? "text-white" : "text-typography-900"
                      } font-medium w-[210px]`}
                    >
                      {label}
                    </Text>
                    <Icon
                      as={icon}
                      size="xl"
                      className="text-background-700 mr-4"
                    />
                  </HStack>
                </Pressable>
              );
            })}
          </VStack>
        </VStack>
        <HStack className="gap-4 py-10 justify-end w-full px-4">
          <Button variant="outline" size="md">
            <ButtonText>Fechar</ButtonText>
          </Button>
          <Button action="positive" size="md">
            <ButtonText>Salvar</ButtonText>
          </Button>
        </HStack>
      </ScrollView>
    </VStack>
  );
};

export default GymFinishView;
