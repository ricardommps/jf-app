import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import React, { useEffect } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";

interface CalendarModalScreenProps {
  visible: boolean;
  onRequestClose: () => void;
  onDateSelect?: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  initialDate?: string;
  markedDatesConfig?: { [key: string]: { color: string; textColor: string } };
  customMarkedDates?: { [key: string]: any };
}

const CalendarModalScreen: React.FC<CalendarModalScreenProps> = ({
  visible,
  onRequestClose,
  onDateSelect,
  minDate = "2020-01-01",
  maxDate = "2030-12-31",
  initialDate = "",
  customMarkedDates = {},
}) => {
  const [tempSelectedDate, setTempSelectedDate] =
    React.useState<string>(initialDate);

  const handleDayPress = (day: any) => {
    const { dateString } = day;

    // Acessa o objeto markedDates com segurança para evitar erros
    if (!markedDates[dateString]) {
      return;
    }
    setTempSelectedDate(dateString);
  };

  useEffect(() => {
    if (tempSelectedDate) {
      onDateSelect?.(tempSelectedDate);
      onRequestClose();
    }
  }, [tempSelectedDate]);

  const markedDates = React.useMemo(() => {
    // Corrige o erro de tipagem adicionando o tipo correto
    const marked: { [key: string]: any } = {};
    // 1. Processa as datas de customMarkedDates
    Object.keys(customMarkedDates).forEach((date) => {
      // Para cada data, tratamos ela como um período de um dia
      marked[date] = {
        ...customMarkedDates[date],
        // Adiciona as propriedades necessárias para o 'period'

        color: customMarkedDates[date].selectedColor,
        textColor: customMarkedDates[date].selectedTextColor,
        // Remove as propriedades que não são usadas pelo 'period'
        selectedColor: undefined,
        selectedTextColor: undefined,
      };
    });

    if (tempSelectedDate) {
      marked[tempSelectedDate] = {
        ...marked[tempSelectedDate], // Mantém as propriedades existentes se houver
        startingDay: true,
        endingDay: true,
        color: "#313131",
        textColor: "#ffffff",
        // Adiciona um estilo de borda para destacar a seleção
        customStyles: {
          container: {
            borderWidth: 2,
            borderColor: "#0EA5E9",
          },
        },
      };
    }

    return marked;
  }, [customMarkedDates, tempSelectedDate]);

  const calendarTheme = {
    backgroundColor: "#334155",
    calendarBackground: "#334155",
    textSectionTitleColor: "#CBD5E1",
    selectedDayBackgroundColor: "#0EA5E9",
    selectedDayTextColor: "#ffffff",
    todayTextColor: "#1E40AF",
    dayTextColor: "#CBD5E1",
    textDisabledColor: "#64748B",
    dotColor: "#4ADE80",
    selectedDotColor: "#ffffff",
    arrowColor: "#CBD5E1",
    monthTextColor: "#F8FAFC",
    indicatorColor: "#0EA5E9",
    textDayFontFamily: "System",
    textMonthFontFamily: "System",
    textDayHeaderFontFamily: "System",
    textDayFontWeight: "400",
    textMonthFontWeight: "600",
    textDayHeaderFontWeight: "500",
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
    "stylesheet.calendar.header": {
      monthText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#F8FAFC",
        marginBottom: 10,
      },
      arrow: {
        padding: 10,
        color: "#CBD5E1",
      },
      arrowImage: {
        tintColor: "#CBD5E1",
      },
    },
    "stylesheet.calendar.main": {
      container: {
        backgroundColor: "#334155",
        borderRadius: 16,
      },
      monthView: {
        backgroundColor: "#334155",
      },
    },
    "stylesheet.day.basic": {
      base: {
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        margin: 2,
      },
      selected: {
        backgroundColor: "#0EA5E9",
        borderRadius: 16,
      },
      today: {
        backgroundColor: "#1E40AF",
        borderRadius: 16,
      },
      text: {
        fontSize: 16,
        color: "#CBD5E1",
        fontWeight: "400",
      },
      selectedText: {
        color: "#ffffff",
        fontWeight: "500",
      },
      todayText: {
        color: "#ffffff",
        fontWeight: "600",
      },
    },
  } as any;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View className="flex-1 justify-center items-center bg-black/70">
        <Box className="bg-slate-700 m-6 rounded-2xl w-11/12 max-w-md shadow-2xl">
          {/* Header */}
          <HStack className="justify-between items-center p-4 border-b border-slate-600">
            <Heading size="lg" className="text-white">
              Selecione o treino
            </Heading>
            <TouchableOpacity
              onPress={onRequestClose}
              className="p-2 rounded-full"
            >
              <Text className="text-white font-bold text-lg">✕</Text>
            </TouchableOpacity>
          </HStack>

          {/* Calendar */}
          <Box className="p-4">
            <Calendar
              onDayPress={handleDayPress}
              markedDates={markedDates}
              markingType={"period"}
              theme={calendarTheme}
              firstDay={1}
              enableSwipeMonths
              hideExtraDays
              showWeekNumbers={false}
              minDate={minDate}
              maxDate={maxDate}
            />
          </Box>

          {/* Footer */}
          <HStack className="p-4 pt-2 border-t border-slate-600" space="lg">
            <Button
              variant="outline"
              onPress={onRequestClose}
              className="flex-1 border-slate-500 bg-slate-600"
            >
              <ButtonText className="text-slate-200">Fechar</ButtonText>
            </Button>
          </HStack>

          {/* Legenda das cores */}
          <Box className="p-4 pt-0">
            <Text className="text-white font-semibold mb-2">Legenda:</Text>
            <HStack className="flex-wrap gap-2">
              <HStack className="items-center gap-1">
                <View className="w-3 h-3 rounded-full bg-green-500" />
                <Text className="text-slate-300 text-xs">Realizado</Text>
              </HStack>
              <HStack className="items-center gap-1">
                <View className="w-3 h-3 rounded-full bg-orange-500" />
                <Text className="text-slate-300 text-xs">Não realizado</Text>
              </HStack>
              <HStack className="items-center gap-1">
                <View className="w-3 h-3 rounded-full bg-red-500" />
                <Text className="text-slate-300 text-xs">Em atraso</Text>
              </HStack>
              <HStack className="items-center gap-1">
                <View className="w-3 h-3 rounded-full bg-blue-700" />
                <Text className="text-slate-300 text-xs">Hoje</Text>
              </HStack>
              <HStack className="items-center gap-1">
                <View className="w-3 h-3 rounded-full bg-blue-400" />
                <Text className="text-slate-300 text-xs">
                  Treino programado
                </Text>
              </HStack>
            </HStack>
          </Box>
        </Box>
      </View>
    </Modal>
  );
};

export default CalendarModalScreen;
