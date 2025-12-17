import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { getVolume } from "@/services/volume.service";
import { VolumeItem } from "@/types/volume";
import { useQuery } from "@tanstack/react-query";
import { format, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as Sharing from "expo-sharing";
import { Share2 } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

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

// Função auxiliar para formatar duração
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  } else if (minutes > 0) {
    return `${minutes}min`;
  } else {
    return `${secs}s`;
  }
};

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
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showButtons, setShowButtons] = useState<boolean>(true);
  const shareViewRef = useRef<View>(null);

  const formattedStartDate = useMemo(
    () => (startDate ? format(startDate, ISO_DATE_FORMAT) : ""),
    [startDate]
  );

  const formattedEndDate = useMemo(
    () => (endDate ? format(endDate, ISO_DATE_FORMAT) : ""),
    [endDate]
  );

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
    staleTime: 0,
    gcTime: 0,
    enabled: false,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

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
      const [year, month, dayNum] = day.dateString.split("-").map(Number);
      const selectedDate = new Date(year, month - 1, dayNum);

      setError("");

      if (selectedInputType === "start") {
        if (isAfter(selectedDate, today)) {
          setError("A data inicial não pode ser maior que a data atual");
          return;
        }

        if (endDate && !isBefore(selectedDate, endDate)) {
          setError("A data inicial deve ser anterior à data final");
          return;
        }

        setStartDate(selectedDate);
      } else {
        if (isAfter(selectedDate, today)) {
          setError("A data final não pode ser maior que a data atual");
          return;
        }

        if (startDate && !isAfter(selectedDate, startDate)) {
          setError("A data final deve ser posterior à data inicial");
          return;
        }

        setEndDate(selectedDate);
      }

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

    setError("");
    onDateRangeSelected?.(startDate, endDate);
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

  const handleShare = useCallback(async () => {
    if (!startDate || !endDate || !volumeData) return;

    setShowShareModal(true);
  }, [startDate, endDate, volumeData]);

  const handleCloseShareModal = useCallback(() => {
    setShowShareModal(false);
    setShowButtons(true);
  }, []);

  const handleConfirmShare = useCallback(async () => {
    try {
      setShowButtons(false);

      await new Promise((resolve) => setTimeout(resolve, 150));

      if (!shareViewRef.current) {
        setShowButtons(true);
        return;
      }

      const uri = await captureRef(shareViewRef, {
        format: "png",
        quality: 1,
      });

      setShowButtons(true);
      setShowShareModal(false);

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert(
          "Compartilhamento não disponível",
          "O recurso de compartilhamento não está disponível nesse dispositivo."
        );
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Compartilhar volume de treino",
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      setShowButtons(true);
      Alert.alert("Erro", "Não foi possível compartilhar. Tente novamente.");
    }
  }, []);

  const formatDate = useCallback((date: Date | null): string => {
    return date ? format(date, DATE_FORMAT, { locale: ptBR }) : "";
  }, []);

  const calendarProps = useMemo(() => {
    const baseTheme = {
      backgroundColor: "#1e293b",
      calendarBackground: "#1e293b",
      textSectionTitleColor: "#CBD5E1",
      selectedDayBackgroundColor: "#0EA5E9",
      selectedDayTextColor: "#ffffff",
      todayTextColor: "#0EA5E9",
      dayTextColor: "#CBD5E1",
      textDisabledColor: "#475569",
      dotColor: "#4ADE80",
      selectedDotColor: "#ffffff",
      arrowColor: "#CBD5E1",
      monthTextColor: "#F1F5F9",
      indicatorColor: "#0EA5E9",
      textDayFontFamily: "System",
      textMonthFontFamily: "System",
      textDayHeaderFontFamily: "System",
      textDayFontWeight: "400" as const,
      textMonthFontWeight: "600" as const,
      textDayHeaderFontWeight: "500" as const,
      textDayFontSize: 16,
      textMonthFontSize: 18,
      textDayHeaderFontSize: 14,
    };

    if (selectedInputType === "start") {
      return {
        maxDate: todayString,
        minDate: undefined,
        theme: {
          ...baseTheme,
          selectedDayBackgroundColor: COLORS.PRIMARY,
        },
      };
    } else {
      return {
        maxDate: todayString,
        minDate: startDate ? format(startDate, ISO_DATE_FORMAT) : undefined,
        theme: {
          ...baseTheme,
          selectedDayBackgroundColor: COLORS.SUCCESS,
        },
      };
    }
  }, [selectedInputType, todayString, startDate]);

  const markedDates = useMemo((): MarkedDates => {
    const marked: MarkedDates = {};

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

  const isFormValid = useMemo(() => {
    return startDate && endDate && !error;
  }, [startDate, endDate, error]);

  const totalDays = useMemo(() => {
    if (!volumeData?.data) return 0;
    return volumeData.data.length;
  }, [volumeData]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      presentationStyle="fullScreen"
      visible={visible}
      onRequestClose={handleModalCloseVolume}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000"
        translucent={false}
      />

      <SafeAreaView
        edges={["bottom", "left", "right"]}
        style={{
          flex: 1,
          backgroundColor: "#000",
          paddingTop: 30,
        }}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <VStack className="flex-1 px-5 py-4">
            {/* Header */}
            <HStack className="justify-between items-center mb-6">
              <Heading size="xl" className="text-white font-bold">
                Volume de Treino
              </Heading>
              <TouchableOpacity
                onPress={handleModalCloseVolume}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel="Fechar modal"
                accessibilityRole="button"
                className="w-10 h-10 items-center justify-center rounded-full"
              >
                <Text className="text-xl text-white">✕</Text>
              </TouchableOpacity>
            </HStack>

            {/* Seção de seleção de datas */}
            <VStack className="bg-[#2b2b2b9d] rounded-2xl p-5 mb-5">
              <Text className="text-lg font-semibold text-white mb-4">
                Período de análise
              </Text>

              {/* Grid de inputs de data */}
              <HStack className="gap-3 mb-4">
                <VStack className="flex-1">
                  <Text className="text-sm font-medium text-white mb-2">
                    Data inicial
                  </Text>
                  <Pressable
                    onPress={() => handleDatePickerOpen("start")}
                    accessible={true}
                    accessibilityLabel={`Data Inicial - ${
                      formatDate(startDate) || "Selecione a data inicial"
                    }`}
                    accessibilityRole="button"
                  >
                    <Box className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <Text
                        className={`text-base ${
                          startDate ? "text-white font-medium" : "text-gray-500"
                        }`}
                      >
                        {formatDate(startDate) || "DD/MM/AAAA"}
                      </Text>
                    </Box>
                  </Pressable>
                </VStack>

                <VStack className="flex-1">
                  <Text className="text-sm font-medium text-white mb-2">
                    Data final
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
                    <Box
                      className={`bg-gray-800 rounded-xl p-4 border ${
                        !startDate
                          ? "border-gray-800 opacity-50"
                          : "border-gray-700"
                      }`}
                    >
                      <Text
                        className={`text-base ${
                          endDate ? "text-white font-medium" : "text-gray-500"
                        }`}
                      >
                        {formatDate(endDate) || "DD/MM/AAAA"}
                      </Text>
                    </Box>
                  </Pressable>
                </VStack>
              </HStack>

              {/* Mensagem de erro */}
              {error && (
                <Box className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
                  <Text className="text-red-400 text-sm text-center font-medium">
                    ⚠️ {error}
                  </Text>
                </Box>
              )}

              {/* Erro da query */}
              {queryError && (
                <Box className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
                  <Text className="text-red-400 text-sm text-center font-medium">
                    ⚠️ Erro ao buscar dados
                  </Text>
                </Box>
              )}

              {/* Botões de ação */}
              <HStack className="gap-3">
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1 border-gray-700"
                  onPress={handleClearDates}
                >
                  <ButtonText className="text-gray-300">Limpar</ButtonText>
                </Button>
                <Button
                  action="primary"
                  size="md"
                  className="flex-1 "
                  onPress={handleSearch}
                  disabled={!isFormValid || isLoading || isFetching}
                >
                  <ButtonText className="font-semibold">
                    {isLoading || isFetching ? "Buscando..." : "Pesquisar"}
                  </ButtonText>
                </Button>
              </HStack>
            </VStack>

            {/* Seção de resultados */}
            {volumeData && (
              <VStack space="md">
                {/* Cards de totais lado a lado */}
                <HStack className="gap-3">
                  <Box className="flex-1 bg-gray-900 rounded-2xl p-5 border border-gray-800">
                    <Text className="text-gray-400 text-sm font-medium mb-1">
                      Distância Total
                    </Text>
                    <Text className="text-white text-3xl font-bold">
                      {volumeData.totalDistanceInKm}
                    </Text>
                    <Text className="text-gray-400 text-base font-medium">
                      km
                    </Text>
                  </Box>

                  <Box className="flex-1 bg-gray-900 rounded-2xl p-5 border border-gray-800">
                    <Text className="text-gray-400 text-sm font-medium mb-1">
                      Tempo Total
                    </Text>
                    <Text className="text-white text-3xl font-bold">
                      {formatDuration(volumeData.totalDurationInSeconds)}
                    </Text>
                    <Text className="text-gray-400 text-base font-medium">
                      de treino
                    </Text>
                  </Box>
                </HStack>

                {/* Botão de compartilhar */}
                <Button
                  action="secondary"
                  size="md"
                  className="bg-gray-900 border border-gray-800"
                  onPress={handleShare}
                >
                  <ButtonIcon as={Share2} />
                  <ButtonText className="text-white font-semibold">
                    Compartilhar Resultados
                  </ButtonText>
                </Button>

                {/* Lista de treinos */}
                {Array.isArray(volumeData?.data) &&
                  volumeData.data.length > 0 && (
                    <VStack className="mt-4">
                      <HStack className="justify-between items-center mb-3 px-1">
                        <Text className="text-white text-lg font-semibold">
                          Treinos realizados
                        </Text>
                        <Box className="bg-gray-800 rounded-full px-3 py-1">
                          <Text className="text-gray-300 text-sm font-medium">
                            {volumeData.data.length}
                          </Text>
                        </Box>
                      </HStack>

                      <VStack className="gap-2">
                        {volumeData.data.map((item: VolumeItem) => {
                          const formattedDate = format(
                            new Date(item.executionDay),
                            "dd/MM/yyyy",
                            { locale: ptBR }
                          );

                          return (
                            <Box
                              key={item.workoutId}
                              className="bg-gray-900 rounded-xl p-4 border border-gray-800"
                            >
                              <HStack className="justify-between items-start mb-2">
                                <VStack>
                                  <Text className="text-white font-semibold text-base">
                                    {formattedDate}
                                  </Text>
                                  <Text className="text-gray-400 text-sm mt-1">
                                    ⏱️ {formatDuration(item.durationInSeconds)}
                                  </Text>
                                </VStack>
                                <Box className="bg-blue-600/20 rounded-lg px-3 py-2">
                                  <Text className="text-blue-400 font-bold text-lg">
                                    {item.distanceInKm} km
                                  </Text>
                                </Box>
                              </HStack>
                            </Box>
                          );
                        })}
                      </VStack>
                    </VStack>
                  )}

                {/* Mensagem de lista vazia */}
                {Array.isArray(volumeData?.data) &&
                  volumeData.data.length === 0 && (
                    <Box className="bg-gray-900 rounded-2xl p-8 mt-4">
                      <Text className="text-gray-400 text-center text-base">
                        Nenhum treino encontrado neste período
                      </Text>
                    </Box>
                  )}
              </VStack>
            )}
          </VStack>
        </ScrollView>
      </SafeAreaView>

      {/* Modal do calendário */}
      <Modal
        visible={showCalendar}
        animationType="slide"
        transparent={true}
        onRequestClose={handleModalClose}
      >
        <View className="flex-1 justify-end bg-black/80">
          <Box className="bg-slate-800 rounded-t-3xl shadow-2xl">
            <VStack className="p-6">
              {/* Header do calendário */}
              <HStack className="justify-between items-center mb-4">
                <Text className="text-xl font-bold text-white">
                  {selectedInputType === "start"
                    ? "Selecionar Data Inicial"
                    : "Selecionar Data Final"}
                </Text>
                <TouchableOpacity
                  onPress={handleModalClose}
                  className="w-8 h-8 items-center justify-center rounded-full bg-gray-700"
                >
                  <Text className="text-white text-lg">✕</Text>
                </TouchableOpacity>
              </HStack>

              <Calendar
                onDayPress={handleDateChange}
                markedDates={markedDates}
                {...calendarProps}
              />
            </VStack>
          </Box>
        </View>
      </Modal>

      {/* Modal de compartilhamento */}
      <Modal
        visible={showShareModal}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseShareModal}
      >
        <View className="flex-1 bg-black">
          <View ref={shareViewRef} collapsable={false} className="flex-1">
            <ImageBackground
              source={require("@/assets/images/foltz_tela.png")}
              resizeMode="cover"
              className="flex-1 p-2"
            >
              <SafeAreaView className="flex-1 px-7">
                <VStack className="flex-1 justify-center items-center">
                  <VStack className="w-full max-w-[320px] items-center space-y-6">
                    <Text className="text-3xl font-extrabold text-white text-center">
                      Volume de Treino
                    </Text>

                    <VStack className="w-full gap-4 pt-12">
                      {/* Período */}
                      <VStack className="items-center space-y-2">
                        <Text className="text-lg text-gray-300 font-medium">
                          Período
                        </Text>
                        <Text className="text-lg text-white font-bold text-center">
                          {startDate &&
                            format(startDate, DATE_FORMAT, { locale: ptBR })}
                          {" - "}
                          {endDate &&
                            format(endDate, DATE_FORMAT, { locale: ptBR })}
                        </Text>
                      </VStack>

                      {/* Total de dias */}
                      <VStack className="items-center space-y-2">
                        <Text className="text-lg text-gray-300 font-medium">
                          Dias de treino
                        </Text>
                        <Text className="text-2xl text-white font-bold">
                          {totalDays} dias
                        </Text>
                      </VStack>

                      {/* Distância e Tempo lado a lado */}
                      <HStack className="justify-around gap-4 pt-3">
                        <VStack className="items-center flex-1 space-y-2">
                          <Text className="text-sm text-gray-300 font-medium">
                            Distância Total
                          </Text>
                          <Text className="text-2xl text-white font-bold">
                            {volumeData?.totalDistanceInKm}
                          </Text>
                          <Text className="text-base text-gray-300 font-medium">
                            km
                          </Text>
                        </VStack>

                        <Divider
                          orientation="vertical"
                          className="bg-gray-500"
                        />

                        <VStack className="items-center flex-1 space-y-2">
                          <Text className="text-sm text-gray-300 font-medium">
                            Tempo Total
                          </Text>
                          <Text className="text-2xl text-white font-bold">
                            {volumeData &&
                              formatDuration(volumeData.totalDurationInSeconds)}
                          </Text>
                          <Text className="text-base text-gray-300 font-medium">
                            de treino
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </VStack>
                </VStack>

                {showButtons && (
                  <Box className="pb-4">
                    <HStack className="gap-3">
                      <Button
                        action="secondary"
                        size="md"
                        className="flex-1"
                        onPress={handleCloseShareModal}
                      >
                        <ButtonText>Cancelar</ButtonText>
                      </Button>
                      <Button
                        action="primary"
                        size="md"
                        className="flex-1 bg-blue-600"
                        onPress={handleConfirmShare}
                      >
                        <ButtonText>Compartilhar</ButtonText>
                      </Button>
                    </HStack>
                  </Box>
                )}
              </SafeAreaView>
            </ImageBackground>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default VolumeModalScreen;
