import Comments from "@/app/(tabs)/(history)/components/comments";
import { RpeDisplay } from "@/components/rpe-display";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { VStack } from "@/components/ui/vstack";
import { useFinishedHistory } from "@/hooks/useFinished/useFinished";
import { Finished } from "@/types/finished";
import { convertSecondsToHourMinuteFormat } from "@/utils/convertValues";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock10Icon, MessageCircleIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Modal,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onRequestClose: () => void;
  id: string;
}

const getLastWorkoutInfo = (executionDay: string) => {
  if (!executionDay) return null;

  try {
    const parsedDate = parseISO(executionDay.replace(" ", "T"));
    return {
      day: format(parsedDate, "dd"),
      monthYear: format(parsedDate, "MMMM", { locale: ptBR }),
    };
  } catch {
    return null;
  }
};

const HistoryView: React.FC<Props> = ({ visible, onRequestClose, id }) => {
  const { data: history, refetch } = useFinishedHistory(id);
  const [selectedItem, setSelectedItem] = useState<Finished | null>(null);

  // 🔥 Histórico ordenado memoizado
  const sortedHistory = useMemo(() => {
    if (!history) return [];

    return [...history].sort(
      (a, b) =>
        new Date(b.executionDay.replace(" ", "T")).getTime() -
        new Date(a.executionDay.replace(" ", "T")).getTime(),
    );
  }, [history]);

  const openComments = (item: Finished) => {
    setSelectedItem(item);
  };

  const closeComments = async () => {
    await refetch();
    setSelectedItem(null);
  };

  const handleCommentSent = async () => {
    const result = await refetch();

    const data = result.data as Finished[] | undefined;

    if (!data || !selectedItem) return;

    const updatedItem = data.find(
      (item: Finished) => item.id === selectedItem.id,
    );

    if (updatedItem) {
      setSelectedItem(updatedItem);
    }
  };

  const renderItem: ListRenderItem<Finished> = ({ item }) => {
    const lastWorkoutInfo = getLastWorkoutInfo(item.executionDay);

    const hasUnreadFromUser =
      item.comments?.some((c) => c.isAdmin && !c.read) ?? false;

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
                {item.workout?.subtitle || ""}
              </Text>

              {!item.review && (
                <Text className="pt-5 text-[#e96b10]">Aguardando feedback</Text>
              )}

              {item.comments && item.comments.length > 0 && (
                <HStack className="gap-6 pt-2 flex-wrap">
                  <Pressable onPress={() => openComments(item)}>
                    <Box className="relative">
                      <Icon
                        as={MessageCircleIcon}
                        className="text-typography-700"
                        size="xl"
                      />

                      <Box
                        className={`absolute -right-1 -top-1 rounded-full w-5 h-5 items-center justify-center ${
                          hasUnreadFromUser ? "bg-orange-500" : "bg-success-500"
                        }`}
                      >
                        <Text className="text-white text-xs font-bold">
                          {item.comments.length}
                        </Text>
                      </Box>
                    </Box>
                  </Pressable>
                </HStack>
              )}
            </VStack>

            {lastWorkoutInfo && (
              <VStack
                className="items-center justify-center"
                style={{ minWidth: 100 }}
              >
                <Text className="text-center text-sm">Realizado em</Text>
                <Text className="text-typography-900 text-sm text-center capitalize">
                  {lastWorkoutInfo.monthYear}
                </Text>
                <Text className="text-typography-900 text-xl font-bold text-center">
                  {lastWorkoutInfo.day}
                </Text>
              </VStack>
            )}
          </HStack>

          {item.durationInSeconds && item.rpe && (
            <HStack className="items-start pt-2 pl-3 gap-5">
              <VStack className="items-center">
                <Icon
                  as={Clock10Icon}
                  size="xl"
                  className="text-background-700"
                />
                <Text className="text-xs text-typography-700 mt-1">Tempo</Text>
                <Text className="text-xs text-typography-900">
                  {convertSecondsToHourMinuteFormat(item.durationInSeconds)}
                </Text>
              </VStack>

              <VStack className="items-center">
                <RpeDisplay rpe={item.rpe} />
              </VStack>
            </HStack>
          )}
        </Box>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="fullScreen"
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <SafeAreaView
        edges={["right", "bottom", "left"]}
        style={{ flex: 1, backgroundColor: "#000", paddingTop: 50 }}
      >
        <VStack className="flex-1 p-2">
          <HStack className="justify-between items-center mb-6">
            <Heading size="lg" className="text-white">
              Histórico
            </Heading>

            <TouchableOpacity onPress={onRequestClose}>
              <Text className="text-2xl text-white">✕</Text>
            </TouchableOpacity>
          </HStack>

          <FlatList
            data={sortedHistory}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={() => (
              <Box style={{ marginTop: 48, alignItems: "center" }}>
                <Text style={{ color: "#999" }}>Nenhum item encontrado</Text>
              </Box>
            )}
          />
        </VStack>
      </SafeAreaView>

      {selectedItem && (
        <Comments
          open={true}
          onClose={closeComments}
          finishedId={selectedItem.id}
          onCommentSent={handleCommentSent}
          content={{
            comments: selectedItem.comments ?? [],
            executionDay: selectedItem.executionDay,
            updatedAt:
              selectedItem.updatedAt instanceof Date
                ? selectedItem.updatedAt.toDateString()
                : new Date(selectedItem.updatedAt).toDateString(),
          }}
        />
      )}
    </Modal>
  );
};

export default HistoryView;
