// hooks/useCalendar.ts
import { useCallback, useState } from "react";
import { DateData } from "react-native-calendars";

interface UseCalendarOptions {
  initialDate?: string;
  multiSelect?: boolean;
  onDateChange?: (date: string | string[]) => void;
  dateFormat?: Intl.DateTimeFormatOptions;
  preSelectedDates?: string[];
  markedDatesConfig?: { [key: string]: { color: string; textColor: string } };
}

interface UseCalendarReturn {
  selectedDate: string;
  selectedDates: string[];
  isModalVisible: boolean;
  openModal: () => void;
  closeModal: () => void;
  selectDate: (date: string) => void;
  onDayPress: (day: DateData) => void;
  formatDate: (dateString: string) => string;
  isDateSelected: (dateString: string) => boolean;
  clearSelection: () => void;
  getMarkedDates: () => { [key: string]: any };
  setMarkedDatesConfig: (config: {
    [key: string]: { color: string; textColor: string };
  }) => void;
}

export const useCalendar = (
  options: UseCalendarOptions = {}
): UseCalendarReturn => {
  const {
    initialDate = "",
    multiSelect = false,
    onDateChange,
    dateFormat = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
    preSelectedDates = [],
    markedDatesConfig = {},
  } = options;

  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [selectedDates, setSelectedDates] =
    useState<string[]>(preSelectedDates);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [markedConfig, setMarkedConfig] = useState<{
    [key: string]: {
      color: string;
      textColor: string;
      startingDay?: boolean;
      endingDay?: boolean;
      isCompetition?: boolean;
    };
  }>(markedDatesConfig);

  const openModal = useCallback((): void => {
    setModalVisible(true);
  }, []);

  const closeModal = useCallback((): void => {
    setModalVisible(false);
  }, []);

  const selectDate = useCallback(
    (date: string): void => {
      if (multiSelect) {
        setSelectedDates((prev) => {
          const newDates = prev.includes(date)
            ? prev.filter((d) => d !== date)
            : [...prev, date];
          onDateChange?.(newDates);
          return newDates;
        });
      } else {
        setSelectedDate(date);
        onDateChange?.(date);
      }
    },
    [multiSelect, onDateChange]
  );

  const onDayPress = useCallback(
    (day: DateData): void => {
      selectDate(day.dateString);
    },
    [selectDate]
  );

  const formatDate = useCallback(
    (dateString: string): string => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", dateFormat);
    },
    [dateFormat]
  );

  const isDateSelected = useCallback(
    (dateString: string): boolean => {
      return multiSelect
        ? selectedDates.includes(dateString)
        : selectedDate === dateString;
    },
    [multiSelect, selectedDate, selectedDates]
  );

  const clearSelection = useCallback((): void => {
    if (multiSelect) {
      setSelectedDates([]);
      onDateChange?.([]);
    } else {
      setSelectedDate("");
      onDateChange?.("");
    }
  }, [multiSelect, onDateChange]);

  const setMarkedDatesConfig = useCallback(
    (config: { [key: string]: { color: string; textColor: string } }) => {
      setMarkedConfig(config);
    },
    []
  );

  const getMarkedDates = useCallback(() => {
    const marked: { [key: string]: any } = {};
    const today = new Date().toISOString().split("T")[0];
    // Aplicar configurações personalizadas de marcação
    Object.keys(markedConfig).forEach((date) => {
      const config = markedConfig[date];
      marked[date] = {
        selected: true,
        isCompetition: config.isCompetition,
        selectedColor: config.color,
        selectedTextColor: config.textColor,
        ...(config.startingDay !== undefined && {
          startingDay: config.startingDay,
        }),
        ...(config.endingDay !== undefined && { endingDay: config.endingDay }),
      };
    });

    // Datas pré-selecionadas (se não tiverem configuração personalizada)
    preSelectedDates.forEach((date) => {
      if (!marked[date]) {
        marked[date] = {
          selected: true,
          selectedColor: "#4ADE80",
          selectedTextColor: "#ffffff",
        };
      }
    });

    // Data atual (hoje) - só destacar se não tiver configuração personalizada
    if (!marked[today]) {
      marked[today] = {
        selected: true,
        selectedColor: "#1E40AF",
        selectedTextColor: "#ffffff",
      };
    }

    // Data selecionada pelo usuário
    if (selectedDate && selectedDate !== today && !marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: "#0EA5E9",
        selectedTextColor: "#ffffff",
      };
    }

    return marked;
  }, [selectedDate, preSelectedDates, markedConfig]);

  return {
    selectedDate,
    selectedDates,
    isModalVisible,
    openModal,
    closeModal,
    selectDate,
    onDayPress,
    formatDate,
    isDateSelected,
    clearSelection,
    getMarkedDates,
    setMarkedDatesConfig,
  };
};
