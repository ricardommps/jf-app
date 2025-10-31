import Comments from "@/components/comments";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Finished } from "@/types/finished";
import { Workout } from "@/types/workout";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "expo-router";
import { useState } from "react";
import HistoryModal from "../components/history-modal";

interface Props {
  item: Workout;
}

const GymItemView = ({ item }: Props) => {
  const router = useRouter();
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  const [openCommentsIds, setOpenCommentsIds] = useState<Set<number>>(
    new Set()
  );
  const [selectedItem, setSelectedItem] = useState<Finished | null>(null);

  const toggleComments = (item: Finished) => {
    setSelectedItem(item);
    setOpenCommentsIds((prev) => new Set([item.id])); // Só mantém um aberto por vez
  };

  const closeComments = () => {
    setSelectedItem(null);
    setOpenCommentsIds(new Set());
  };

  const handleNavigate = (id: string) => {
    router.push(`/workout/view?id=${id}&type=2` as any);
  };

  const getLastWorkoutInfo = () => {
    if (!item?.history?.length) {
      return null;
    }

    // Ordena do mais recente para o mais antigo
    const sortedHistory = [...item.history].sort((a, b) => {
      const timeA = a.executionDay ? new Date(a.executionDay).getTime() : 0;
      const timeB = b.executionDay ? new Date(b.executionDay).getTime() : 0;
      return timeB - timeA;
    });

    const latest = sortedHistory[0];
    if (!latest?.executionDay) {
      return null;
    }

    try {
      const parsedDate = parseISO(latest.executionDay);
      const day = format(parsedDate, "dd");
      const monthYear = format(parsedDate, "MMMM", { locale: ptBR });

      return { day, monthYear };
    } catch (error) {
      console.warn("Data inválida:", latest.executionDay);
      return null;
    }
  };

  const lastWorkoutInfo = getLastWorkoutInfo();

  return (
    <>
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
          {/* Esquerda: título + botões */}
          <VStack style={{ flex: 1 }}>
            <Text
              numberOfLines={3}
              ellipsizeMode="tail"
              className="text-typography-900 text-base font-semibold"
            >
              {item?.subtitle || ""}
            </Text>

            <HStack className="gap-6 pt-8 flex-wrap">
              {item?.history?.length > 0 && (
                <Box className="relative">
                  <Badge
                    variant="solid"
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full z-10 px-[6px] py-[2px]"
                  >
                    <BadgeText className="text-white text-[10px] font-semibold">
                      {item.history.length}
                    </BadgeText>
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setShowHistoryModal(true)}
                  >
                    <ButtonText>Histórico</ButtonText>
                  </Button>
                </Box>
              )}

              <Button
                action="primary"
                onPress={() => handleNavigate(item.id)}
                size="sm"
              >
                <ButtonText>Ver treino</ButtonText>
              </Button>
            </HStack>
          </VStack>

          {/* Direita: Último treino */}
          {lastWorkoutInfo && (
            <VStack
              className="items-center justify-center"
              style={{ minWidth: 100 }}
            >
              <Text className="text-center text-sm">Último treino</Text>
              <Text className="text-typography-900 text-sm text-center capitalize">
                {lastWorkoutInfo.monthYear}
              </Text>
              <Text className="text-typography-900 text-xl font-bold text-center">
                {lastWorkoutInfo.day}
              </Text>
            </VStack>
          )}
        </HStack>
      </Box>
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

      <HistoryModal
        visible={showHistoryModal}
        onRequestClose={() => setShowHistoryModal(false)}
        history={item.history}
        subtitle={item.subtitle}
      />
    </>
  );
};

export default GymItemView;
