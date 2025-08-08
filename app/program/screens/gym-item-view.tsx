import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Badge, BadgeText } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "expo-router";
import { Box } from "@/components/ui/box";
import { Workout } from "@/types/workout";
import { useState } from "react";
import HistoryModal from "../components/history-modal";
import { Finished } from "@/types/finished";
import { Portal } from "@/components/ui/portal";
import Comments from "@/components/comments";

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
    router.push(`/workout/view?id=${id}&type=2`);
  };

  const getLastWorkoutInfo = () => {
    if (!item?.history?.length || !item.history[0]?.executionDay) {
      return null;
    }

    const { executionDay } = item.history[0];
    try {
      const parsedDate = parseISO(executionDay);
      const day = format(parsedDate, "dd");
      const monthYear = format(parsedDate, "MMMM", { locale: ptBR });

      if (day && monthYear) {
        return { day, monthYear };
      }
      return null;
    } catch (error) {
      console.warn("Data inválida:", executionDay);
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
        toggleComments={toggleComments}
      />
    </>
  );
};

export default GymItemView;
