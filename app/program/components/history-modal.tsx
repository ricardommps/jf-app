import Comments from "@/components/comments";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { VStack } from "@/components/ui/vstack";
import { Finished } from "@/types/finished";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircleIcon } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Modal,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onRequestClose: () => void;
  history: Finished[];
  subtitle: string;
}

const HistoryModal: React.FC<Props> = ({
  visible,
  onRequestClose,
  history,
  subtitle,
}) => {
  const [selectedItem, setSelectedItem] = useState<Finished | null>(null);
  const [openCommentsIds, setOpenCommentsIds] = useState<Set<number>>(
    new Set()
  );
  const insets = useSafeAreaInsets();

  const toggleComments = (item: Finished) => {
    setSelectedItem(item);
    setOpenCommentsIds((prev) => new Set([item.id])); // Só mantém um aberto por vez
  };

  const closeComments = () => {
    setSelectedItem(null);
    setOpenCommentsIds(new Set());
  };

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
      <View>
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
      </View>
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
      {/* Configuração do StatusBar específica para o modal */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000"
        translucent={false}
      />

      <SafeAreaView
        edges={["right", "bottom", "left"]}
        style={{
          flex: 1,
          backgroundColor: "#000",
          paddingTop: 50,
        }}
      >
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
      </SafeAreaView>

      {selectedItem && (
        <Comments
          open={openCommentsIds.has(selectedItem.id)}
          onClose={closeComments}
          content={{
            feedback: selectedItem.feedback || "",
            comments: selectedItem.comments || "",
            executionDay: selectedItem.executionDay,
            updatedAt: selectedItem.updatedAt
              ? selectedItem.updatedAt instanceof Date
                ? selectedItem.updatedAt.toDateString()
                : new Date(selectedItem.updatedAt).toDateString()
              : new Date().toDateString(),
          }}
        />
      )}
    </Modal>
  );
};

export default HistoryModal;
