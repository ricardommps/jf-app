import CompetitionIcon from "@/assets/images/jf_logo_icone_push.png";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import React, { useEffect } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { MarkingProps } from "react-native-calendars/src/calendar/day/marking";

export interface CustomMarkingProps extends MarkingProps {
  isCompetition?: boolean;
  icon?: any;
}

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
    // ✅ CORREÇÃO: Removida a verificação que impedia cliques
    setTempSelectedDate(dateString);
  };

  useEffect(() => {
    if (tempSelectedDate) {
      onDateSelect?.(tempSelectedDate);
      onRequestClose();
    }
  }, [tempSelectedDate]);

  const markedDates = React.useMemo(() => {
    const marked: { [key: string]: any } = {};

    Object.keys(customMarkedDates).forEach((date) => {
      marked[date] = {
        ...customMarkedDates[date],
        color: customMarkedDates[date].selectedColor,
        textColor: customMarkedDates[date].selectedTextColor,
      };
    });

    if (tempSelectedDate) {
      marked[tempSelectedDate] = {
        ...marked[tempSelectedDate],
        startingDay: true,
        endingDay: true,
        color: "#1E40AF",
        textColor: "#ffffff",
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
              markingType="period"
              theme={calendarTheme}
              firstDay={1}
              enableSwipeMonths
              hideExtraDays
              minDate={minDate}
              maxDate={maxDate}
              dayComponent={({ date, state, marking }) => {
                if (!date) return <View style={{ width: 44, height: 44 }} />;

                const customMarking = marking as CustomMarkingProps | undefined;
                const isCompetition = customMarking?.isCompetition;
                const bgColor = customMarking?.color;
                const isDisabled = state === "disabled";

                return (
                  <TouchableOpacity
                    onPress={() => {
                      if (!isDisabled) {
                        handleDayPress({ dateString: date.dateString });
                      }
                    }}
                    disabled={isDisabled}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 6,
                        backgroundColor: "#F3F4F6",
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        opacity: isDisabled ? 0.3 : 1,
                        padding: 4,
                      }}
                    >
                      {/* ÍCONE / STATUS — TOPO ESQUERDA */}
                      {isCompetition && (
                        <Image
                          source={CompetitionIcon}
                          style={{
                            width: 28,
                            height: 28,
                            position: "absolute",
                            top: 0,
                            left: 0,
                          }}
                          resizeMode="contain"
                        />
                      )}

                      {/* CÍRCULO DE COR (se não for competição) */}
                      {!isCompetition && bgColor && (
                        <View
                          style={{
                            width: 15,
                            height: 15,
                            borderRadius: 10,
                            backgroundColor: bgColor,
                            position: "absolute",
                            top: 6,
                            left: 6,
                          }}
                        />
                      )}

                      {/* DIA — INFERIOR DIREITA */}
                      <Text
                        style={{
                          position: "absolute",
                          bottom: 4,
                          right: 4,
                          fontSize: 12,
                          color: "#000000",
                          fontWeight: "500",
                        }}
                      >
                        {date.day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
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
              <HStack className="items-center gap-1">
                <Image
                  source={CompetitionIcon}
                  style={{
                    width: 25,
                    height: 25,
                  }}
                />
                <Text className="text-slate-300 text-xs">Prova</Text>
              </HStack>
            </HStack>
          </Box>
          <Box></Box>
        </Box>
      </View>
    </Modal>
  );
};

export default CalendarModalScreen;
