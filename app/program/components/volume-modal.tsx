import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StatusBar,
  StyleSheet,
  Alert,
  Pressable,
  FlatList,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useQuery } from "@tanstack/react-query";
import { Input, InputField } from "@/components/ui/input";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { VolumeItem } from "@/types/volume";
import { format, isAfter, isBefore, isEqual } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getVolume } from "@/services/volume.service";
import { Divider } from "@/components/ui/divider";

// Tipos
interface MarkedDates {
  [key: string]: {
    selected: boolean;
    selectedColor: string;
    selectedTextColor: string;
  };
}

interface VolumeModalScreenProps {
  visible: boolean;
  onRequestClose: () => void;
  programId: string;
  onDateRangeSelected?: (startDate: Date, endDate: Date) => void;
}

type DateInputType = "start" | "end";

// Constantes
const COLORS = {
  PRIMARY: "#3B82F6",
  SUCCESS: "#10B981",
  ERROR: "#EF4444",
  WHITE: "#FFFFFF",
  GRAY: "#6B7280",
  DARK_GRAY: "#374151",
} as const;

const DATE_FORMAT = "dd/MM/yyyy";
const ISO_DATE_FORMAT = "yyyy-MM-dd";

const VolumeModalScreen: React.FC<VolumeModalScreenProps> = ({
  visible,
  onRequestClose,
  programId,
  onDateRangeSelected,
}) => {
  // Estados
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState<string>("");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedInputType, setSelectedInputType] =
    useState<DateInputType>("start");

  // Formatação das datas para a API (formato: yyyy-MM-dd)
  const formattedStartDate = useMemo(
    () => (startDate ? format(startDate, ISO_DATE_FORMAT) : ""),
    [startDate]
  );

  const formattedEndDate = useMemo(
    () => (endDate ? format(endDate, ISO_DATE_FORMAT) : ""),
    [endDate]
  );

  // React Query para buscar dados do volume - DESABILITADO por padrão
  const {
    data: volumeData,
    isLoading,
    refetch,
    error: queryError,
    isFetching,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: ["volume", programId, formattedStartDate, formattedEndDate],
    queryFn: async () => {
      if (!formattedStartDate || !formattedEndDate) {
        throw new Error("Datas são obrigatórias");
      }
      return await getVolume(programId, formattedStartDate, formattedEndDate);
    },
    enabled: false, // DESABILITADO - só executa manualmente
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Efeito para lidar com erro da query
  useEffect(() => {
    if (isError && queryError) {
      console.error("Erro ao buscar volume:", queryError);
      Alert.alert(
        "Erro",
        "Não foi possível buscar os dados do volume. Tente novamente."
      );
    }
  }, [isError, queryError]);

  // Valores computados
  const today = useMemo(() => new Date(), []);
  const todayString = useMemo(() => format(today, ISO_DATE_FORMAT), [today]);

  // Handlers
  const handleDatePickerOpen = useCallback((type: DateInputType) => {
    setSelectedInputType(type);
    setShowCalendar(true);
  }, []);

  const handleDateChange = useCallback(
    (day: DateData) => {
      // Cria a data corretamente no fuso horário local
      const [year, month, dayNum] = day.dateString.split("-").map(Number);
      const selectedDate = new Date(year, month - 1, dayNum); // month é 0-indexed

      // Limpa o erro primeiro
      setError("");

      // Para data inicial
      if (selectedInputType === "start") {
        // Verifica se a data é futura
        if (isAfter(selectedDate, today)) {
          setError("A data inicial não pode ser maior que a data atual");
          return;
        }

        // Verifica se a data inicial é maior ou igual à data final (se já existir)
        if (endDate && !isBefore(selectedDate, endDate)) {
          setError("A data inicial deve ser anterior à data final");
          return;
        }

        // Se passou nas validações, define a data
        setStartDate(selectedDate);
      }
      // Para data final
      else {
        // Verifica se a data é futura
        if (isAfter(selectedDate, today)) {
          setError("A data final não pode ser maior que a data atual");
          return;
        }

        // Verifica se a data final é menor ou igual à data inicial (se já existir)
        if (startDate && !isAfter(selectedDate, startDate)) {
          setError("A data final deve ser posterior à data inicial");
          return;
        }

        // Se passou nas validações, define a data
        setEndDate(selectedDate);
      }

      // Fecha o calendário após selecionar
      setShowCalendar(false);
    },
    [selectedInputType, today, startDate, endDate]
  );

  const handleClearDates = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setError("");
  }, []);

  const handleSearch = useCallback(() => {
    if (!startDate || !endDate) {
      Alert.alert("Erro", "Por favor, selecione ambas as datas");
      return;
    }

    // Limpa erros anteriores
    setError("");

    // Chama o callback se fornecido
    onDateRangeSelected?.(startDate, endDate);

    // Executa a busca manualmente
    refetch();
  }, [startDate, endDate, onDateRangeSelected, refetch]);

  const handleModalClose = useCallback(() => {
    setShowCalendar(false);
  }, []);

  const handleModalCloseVolume = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setError("");
    setSelectedInputType("start");
    onRequestClose();
  }, [onRequestClose]);

  // Formatação de data
  const formatDate = useCallback((date: Date | null): string => {
    return date ? format(date, DATE_FORMAT, { locale: ptBR }) : "";
  }, []);

  // Configuração do calendário
  const calendarProps = useMemo(() => {
    const baseTheme = {
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
    };

    if (selectedInputType === "start") {
      return {
        maxDate: todayString,
        minDate: undefined,
        theme: {
          ...baseTheme,
          selectedDayBackgroundColor: COLORS.PRIMARY,
          selectedDayTextColor: COLORS.WHITE,
          todayTextColor: COLORS.PRIMARY,
          arrowColor: COLORS.PRIMARY,
        },
      };
    } else {
      return {
        maxDate: todayString,
        minDate: startDate ? format(startDate, ISO_DATE_FORMAT) : undefined,
        theme: {
          ...baseTheme,
          selectedDayBackgroundColor: COLORS.SUCCESS,
          selectedDayTextColor: COLORS.WHITE,
          todayTextColor: COLORS.SUCCESS,
          arrowColor: COLORS.SUCCESS,
        },
      };
    }
  }, [selectedInputType, todayString, startDate]);

  // Datas marcadas no calendário
  const markedDates = useMemo((): MarkedDates => {
    const marked: MarkedDates = {};

    // Marca apenas a data correspondente ao tipo selecionado
    if (selectedInputType === "start" && startDate) {
      marked[format(startDate, ISO_DATE_FORMAT)] = {
        selected: true,
        selectedColor: COLORS.PRIMARY,
        selectedTextColor: COLORS.WHITE,
      };
    } else if (selectedInputType === "end" && endDate) {
      marked[format(endDate, ISO_DATE_FORMAT)] = {
        selected: true,
        selectedColor: COLORS.SUCCESS,
        selectedTextColor: COLORS.WHITE,
      };
    }

    return marked;
  }, [selectedInputType, startDate, endDate]);

  // Verificação se formulário está válido
  const isFormValid = useMemo(() => {
    return startDate && endDate && !error;
  }, [startDate, endDate, error]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      presentationStyle="fullScreen"
      visible={visible}
      onRequestClose={handleModalCloseVolume}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Box className="flex-1 bg-background-0 px-1">
        <VStack className="flex-1 p-6">
          {/* Header */}
          <HStack className="justify-between items-center mb-6">
            <Heading size="lg" className="text-white">
              Volume
            </Heading>
            <TouchableOpacity
              onPress={handleModalCloseVolume}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel="Fechar modal"
              accessibilityRole="button"
            >
              <Text className="text-2xl text-white">✕</Text>
            </TouchableOpacity>
          </HStack>

          {/* Conteúdo principal */}
          <VStack space="lg" className="mt-8">
            <Text className="text-2xl font-bold text-white text-center">
              Selecionar Período
            </Text>

            {/* Inputs de data */}
            <VStack space="sm">
              <Text className="text-base font-medium text-white">
                Data Inicial
              </Text>
              <Pressable
                onPress={() => handleDatePickerOpen("start")}
                accessible={true}
                accessibilityLabel={`Data Inicial - ${
                  formatDate(startDate) || "Selecione a data inicial"
                }`}
                accessibilityRole="button"
              >
                <Input
                  variant="rounded"
                  className="border-0 bg-[#2b2b2b9d] rounded-md mt-2 mb-1 w-full"
                  size="lg"
                  isReadOnly={true}
                  pointerEvents="none"
                >
                  <InputField
                    placeholder="Selecione a data inicial"
                    value={formatDate(startDate)}
                    editable={false}
                    className="placeholder:text-typography-400"
                    pointerEvents="none"
                  />
                </Input>
              </Pressable>
            </VStack>

            <VStack space="sm">
              <Text className="text-base font-medium text-white">
                Data Final
              </Text>
              <Pressable
                onPress={() => handleDatePickerOpen("end")}
                accessible={true}
                accessibilityLabel={`Data Final - ${
                  formatDate(endDate) || "Selecione a data final"
                }`}
                accessibilityRole="button"
                disabled={!startDate}
              >
                <Input
                  variant="rounded"
                  className="border-0 bg-[#2b2b2b9d] rounded-md mt-2 mb-1 w-full"
                  size="lg"
                  isReadOnly={true}
                  pointerEvents="none"
                >
                  <InputField
                    placeholder="Selecione a data final"
                    value={formatDate(endDate)}
                    editable={false}
                    className={`placeholder:text-typography-400 ${
                      !startDate ? "placeholder:text-typography-100" : ""
                    }`}
                    pointerEvents="none"
                  />
                </Input>
              </Pressable>
            </VStack>

            {/* Mensagem de erro */}
            {error && (
              <Box className="bg-red-50 border border-red-200 rounded-lg p-4">
                <Text className="text-red-800 font-medium text-center">
                  {error}
                </Text>
              </Box>
            )}

            {/* Erro da query */}
            {queryError && (
              <Box className="bg-red-50 border border-red-200 rounded-lg p-4">
                <Text className="text-red-800 font-medium text-center">
                  Erro ao buscar dados
                </Text>
              </Box>
            )}

            {/* Botões de ação */}
            <HStack className="gap-4 pt-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                action="secondary"
                onPress={handleClearDates}
              >
                <ButtonText>Limpar</ButtonText>
              </Button>
              <Button
                action="primary"
                size="sm"
                onPress={handleSearch}
                disabled={!isFormValid || isLoading || isFetching}
              >
                <ButtonText>
                  {isLoading || isFetching ? "Buscando..." : "Pesquisar"}
                </ButtonText>
              </Button>
            </HStack>

            {/* Exibição dos dados do volume */}
            {volumeData && (
              <>
                <Divider orientation="horizontal" />
                <VStack>
                  <Text className="text-2xl text-white font-bold">
                    {`${volumeData?.totalDistanceInKm} km`}
                  </Text>
                  <Text className="text-1xl text-white">Distância total</Text>
                </VStack>
              </>
            )}
            {Array.isArray(volumeData?.data) && (
              <Box className="max-h-[300px]">
                <FlatList<VolumeItem>
                  data={volumeData.data}
                  keyExtractor={(item) => item.workoutId}
                  renderItem={({ item }) => {
                    const formattedDate = format(
                      new Date(item.executionDay),
                      "dd/MM/yyyy",
                      { locale: ptBR }
                    );

                    return (
                      <HStack className="justify-between py-2 px-4 bg-gray-800 rounded-md mb-2">
                        <Text className="text-white font-medium">
                          {formattedDate}
                        </Text>
                        <Text className="text-white font-bold">
                          {item.distanceInKm} km
                        </Text>
                      </HStack>
                    );
                  }}
                  showsVerticalScrollIndicator={true}
                  style={{ flexGrow: 1 }}
                  contentContainerStyle={{ paddingBottom: 100 }}
                />
              </Box>
            )}
          </VStack>
        </VStack>
      </Box>

      {/* Modal do calendário */}
      <Modal
        visible={showCalendar}
        animationType="slide"
        transparent={true}
        onRequestClose={handleModalClose}
      >
        <View className="flex-1 justify-center items-center bg-black/70">
          <Box className="bg-slate-700 m-6 rounded-2xl w-11/12 max-w-md shadow-2xl">
            <VStack space="md" className="pt-6">
              <Text className="text-lg font-bold text-center text-white">
                {selectedInputType === "start"
                  ? "Selecionar Data Inicial"
                  : "Selecionar Data Final"}
              </Text>

              <Calendar
                onDayPress={handleDateChange}
                markedDates={markedDates}
                {...calendarProps}
              />
              <Box className="p-5">
                <Button variant="outline" onPress={handleModalClose}>
                  <ButtonText>Cancelar</ButtonText>
                </Button>
              </Box>
            </VStack>
          </Box>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default VolumeModalScreen;
