// WorkoutView.tsx
import { Media } from "@/types/media";
import { MediaInfo } from "@/types/workout";
import { useCallback, useMemo } from "react";
import { FlatList, View } from "react-native";
import WorkoutGroup from "./workout-group";
import WorkoutItem from "./workout-item";

interface Props {
  medias: Media[];
  mediaOrder: (number | number[])[];
  exerciseInfo: MediaInfo[];
  isWorkoutLoad: boolean;
  sectionId?: string;
  musclesWorked?: boolean;
}

const WorkoutView = ({
  medias,
  mediaOrder,
  exerciseInfo,
  isWorkoutLoad,
  sectionId = "workout",
  musclesWorked,
}: Props) => {
  // Mapeia ID -> Media para facilitar lookup
  const mediaMap = useMemo(() => {
    const map = new Map<string, Media>();
    if (medias?.length) {
      medias.forEach((mediaGroup) => {
        if (Array.isArray(mediaGroup)) {
          mediaGroup.forEach((mediaItem) => {
            if (mediaItem?.id) map.set(mediaItem.id.toString(), mediaItem);
          });
        } else if (mediaGroup?.id) {
          map.set(mediaGroup.id.toString(), mediaGroup);
        }
      });
    }
    return map;
  }, [medias]);

  // Organiza o mediaOrder
  const organizedMedia = useMemo(() => {
    if (!mediaOrder?.length || !mediaMap.size) return medias;
    return mediaOrder
      .map((orderItem) => {
        if (Array.isArray(orderItem)) {
          const groupItems = orderItem
            .map((id) => mediaMap.get(id?.toString() ?? ""))
            .filter(Boolean);
          return groupItems.length ? groupItems : null;
        } else {
          const mediaItem = mediaMap.get(orderItem?.toString() ?? "");
          return mediaItem ? [mediaItem] : null;
        }
      })
      .filter(Boolean);
  }, [mediaMap, mediaOrder, medias]);

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (Array.isArray(item) && item.length > 1) {
        // Grupo (BISET, TRISET, CIRCUITO)
        return (
          <View key={`group-${index}`} style={{ marginBottom: 16 }}>
            <WorkoutGroup
              media={item}
              exerciseInfo={exerciseInfo}
              isWorkoutLoad={isWorkoutLoad}
              musclesWorked={musclesWorked}
            />
          </View>
        );
      } else if (item?.[0]) {
        // Exercício individual
        return (
          <View key={`item-${index}`} style={{ marginBottom: 16 }}>
            <WorkoutItem
              media={item[0]}
              exerciseInfo={exerciseInfo}
              isWorkoutLoad={isWorkoutLoad}
              musclesWorked={musclesWorked}
            />
          </View>
        );
      }
      return null;
    },
    [exerciseInfo, isWorkoutLoad],
  );

  return (
    <FlatList
      data={organizedMedia}
      keyExtractor={(_, index) => index.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ paddingVertical: 16 }}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      ItemSeparatorComponent={() => <View className="h-px bg-gray-800 my-4" />}
    />
  );
};

export default WorkoutView;
