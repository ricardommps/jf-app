import { Alert, AlertText } from "@/components/ui/alert";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Workout } from "@/types/workout";
import { Pencil, Trash2 } from "lucide-react-native";
import { Linking, Pressable } from "react-native";

interface Props {
  item: Workout;
  handleEdit: (item: Workout) => void;
  handleOpenDeleteModal: (item: Workout) => void;
}

const RunningRaceItemView = ({
  item,
  handleEdit,
  handleOpenDeleteModal,
}: Props) => {
  const raceDate = new Date(item.datePublished);

  const raceDay = raceDate.getDate();

  const raceMonth = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
  }).format(raceDate);

  const handleOpenLink = async () => {
    if (!item?.link) return;

    const canOpen = await Linking.canOpenURL(item.link);
    if (canOpen) {
      Linking.openURL(item.link);
    }
  };

  const statusTraining = () => {
    const today = new Date().toISOString().split("T")[0];
    const date = new Date(item.datePublished).toISOString().split("T")[0];
    if (!item.finished && date <= today) {
      return (
        <Alert
          className="bg-red-500/60 rounded-lg flex-row items-center gap-x-2 p-2"
          variant="solid"
        >
          <AlertText className="text-white font-dm-sans-bold">
            Aguardando realização da prova
          </AlertText>
        </Alert>
      );
    }

    if (item.finished && !item.unrealized) {
      return (
        <Alert
          className="bg-green-500/60 rounded-lg flex-row items-center gap-x-2 p-2"
          variant="solid"
        >
          <AlertText className="text-white font-dm-sans-bold">
            Prova finalizada
          </AlertText>
        </Alert>
      );
    }

    if (item.finished && item.unrealized) {
      return (
        <Alert
          className="bg-orange-500/60 rounded-lg flex-row items-center gap-x-2 p-2"
          variant="solid"
        >
          <AlertText className="text-white font-dm-sans-bold">
            Prova não realizada
          </AlertText>
        </Alert>
      );
    }

    if (
      !item.finished &&
      (item.unrealized === false || item.unrealized === null) &&
      date > today
    ) {
      return (
        <Alert
          className="bg-blue-400/60 rounded-lg flex-row items-center gap-x-2 p-2"
          variant="solid"
        >
          <AlertText className="text-white font-dm-sans-bold">
            Prova programada
          </AlertText>
        </Alert>
      );
    }
  };

  return (
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
        <VStack style={{ flex: 1, gap: 12 }}>
          <Text
            numberOfLines={3}
            ellipsizeMode="tail"
            className="text-typography-900 text-xl font-semibold"
          >
            {item?.subtitle || ""}
          </Text>
          <Text
            numberOfLines={3}
            ellipsizeMode="tail"
            className="text-typography-900 text-lg font-semibold"
          >
            Distância:{" "}
            {item.distance
              ? `${Number(item.distance) / 1000} km`
              : "Não informada"}
          </Text>
          {item.link && (
            <Pressable onPress={handleOpenLink}>
              <Text className="text-lg font-semibold underline text-primary-500">
                Acessar link da prova
              </Text>
            </Pressable>
          )}
          <Box>{statusTraining()}</Box>
          <HStack className="gap-5 pt-5 pl-5">
            <Pressable onPress={() => handleEdit(item)}>
              <Pencil size={22} color="#f4f4f4" />
            </Pressable>

            <Pressable onPress={() => handleOpenDeleteModal(item)}>
              <Trash2 size={22} color="#ff0000" />
            </Pressable>
          </HStack>
        </VStack>
        <VStack
          className="items-center justify-center"
          style={{ minWidth: 100 }}
        >
          <Text className="text-center text-base">Dia da Prova</Text>
          <Text className="text-typography-900 text-xl text-center capitalize font-bold">
            {raceMonth}
          </Text>
          <Text className="text-typography-900 text-xl font-bold text-center">
            {raceDay}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

export default RunningRaceItemView;
