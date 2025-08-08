import {
  TouchableOpacity,
  Modal,
  StatusBar,
  ListRenderItem,
  FlatList,
} from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Pressable } from "@/components/ui/pressable";
import { Icon } from "@/components/ui/icon";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Finished } from "@/types/finished";
import { MessageCircleIcon } from "lucide-react-native";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  visible: boolean;
  onRequestClose: () => void;
  history: Finished[];
  subtitle: string;
  toggleComments: (item: Finished) => void;
}

const HistoryModal: React.FC<Props> = ({
  visible,
  onRequestClose,
  history,
  subtitle,
  toggleComments,
}) => {
  const getLastWorkoutInfo = (executionDay: string) => {
    if (!executionDay) {
      return null;
    }

    try {
      const isoFormatted = executionDay.replace(" ", "T"); // "2025-07-26T12:00:00.00"
      const parsedDate = parseISO(isoFormatted);
      const day = format(parsedDate, "dd");
      const monthYear = format(parsedDate, "MMMM", { locale: ptBR });

      if (day && monthYear) {
        return { day, monthYear };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const renderItem: ListRenderItem<Finished> = ({ item, index }) => {
    const lastWorkoutInfo = getLastWorkoutInfo(item.executionDay);
    return (
      <Animated.View
        entering={FadeInUp.delay(index * 100)
          .springify()
          .damping(12)}
      >
        <Box className="bg-[#2b2b2b9d] rounded-xl p-4 mb-2 min-h-[100px]">
          <HStack
            className="w-full"
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <VStack style={{ flex: 1 }}>
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                className="text-typography-900 text-base font-semibold"
              >
                {subtitle || ""}
              </Text>
              {item.feedback ? (
                <HStack className="gap-6 pt-2 flex-wrap">
                  <Pressable
                    onPress={() => {
                      toggleComments(item);
                    }}
                  >
                    <Box className="relative">
                      <Icon
                        as={MessageCircleIcon}
                        className="text-typography-700"
                        size="xl"
                      />
                      <Box className="absolute -right-1 -top-1 bg-success-500 rounded-full w-5 h-5 items-center justify-center">
                        <Text className="text-white text-xs font-bold">1</Text>
                      </Box>
                    </Box>
                  </Pressable>
                </HStack>
              ) : (
                <Text className="pt-5 text-[#e96b10]">Aguardando feedback</Text>
              )}
            </VStack>
            {lastWorkoutInfo?.day && lastWorkoutInfo?.monthYear && (
              <VStack
                className="items-center justify-center"
                style={{ minWidth: 100 }}
              >
                <Text className="text-center text-sm">Realizado em</Text>
                <Text className="text-typography-900 text-sm text-center capitalize">
                  {lastWorkoutInfo?.monthYear}
                </Text>
                <Text className="text-typography-900 text-xl font-bold text-center">
                  {lastWorkoutInfo?.day}
                </Text>
              </VStack>
            )}
          </HStack>
        </Box>
      </Animated.View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      presentationStyle="fullScreen"
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Box className="flex-1 bg-background-0 px-1">
        <VStack className="flex-1 p-2">
          {/* Header */}
          <HStack className="justify-between items-center mb-6">
            <Heading size="lg" className="text-white">
              Histórico
            </Heading>
            <TouchableOpacity
              onPress={onRequestClose}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel="Fechar modal"
              accessibilityRole="button"
            >
              <Text className="text-2xl text-white">✕</Text>
            </TouchableOpacity>
          </HStack>
          {/* Conteúdo principal */}
          <Box>
            <FlatList<Finished>
              data={[...(history || [])].sort(
                (a, b) =>
                  new Date(b.executionDay.replace(" ", "T")).getTime() -
                  new Date(a.executionDay.replace(" ", "T")).getTime()
              )}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              ListEmptyComponent={() => (
                <Box style={{ marginTop: 48, alignItems: "center" }}>
                  <Text style={{ color: "#999" }}>Nenhum item encontrado</Text>
                </Box>
              )}
            />
          </Box>
        </VStack>
      </Box>
    </Modal>
  );
};

export default HistoryModal;
