import { Media, ExerciseInfo } from "@/types/workout";
import WorkoutItem from "./workout-item";
import { FlatList, View } from "react-native";
import { useMemo } from "react";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import WorkoutGroup from "./workout-group";

interface Props {
  medias: Media[];
  mediaOrder: (number | number[])[];
  exerciseInfo: ExerciseInfo[];
}

const WorkoutView = ({ medias, mediaOrder, exerciseInfo }: Props) => {
  // Ordena as mídias de acordo com a ordem fornecida
  const orderedMedias = useMemo(() => {
    return mediaOrder.map((orderItem) => {
      if (Array.isArray(orderItem)) {
        return orderItem
          .map((id) => medias.find((media) => media.id === id))
          .filter(Boolean);
      } else {
        return medias.find((m) => m.id === orderItem) || null;
      }
    });
  }, [medias, mediaOrder]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (Array.isArray(item) && item.length > 0) {
      return (
        <WorkoutGroup key={index} media={item} exerciseInfo={exerciseInfo} />
      );
    } else if (item) {
      return (
        <WorkoutItem key={index} media={item} exerciseInfo={exerciseInfo} />
      );
    }
    return null;
  };

  const Separator = () => <View style={{ height: 30 }} />; // Espaço entre os itens

  return (
    <VStack>
      <FlatList
        data={orderedMedias}
        renderItem={renderItem}
        contentContainerStyle={{
          flexGrow: 1,
          gap: 16,
          paddingBottom: 16,
          width: "100%",
        }}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyExtractor={(item, index) => index.toString()}
        ItemSeparatorComponent={Separator} // Usando o separador
      />
    </VStack>
  );
};

export default WorkoutView;
