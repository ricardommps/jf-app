import { MediaInfo } from "@/types/workout";
import WorkoutItem from "./workout-item";
import { FlatList, View } from "react-native";
import { useMemo } from "react";
import { VStack } from "@/components/ui/vstack";
import WorkoutGroup from "./workout-group";
import { Media } from "@/types/media";

interface Props {
  medias: Media[];
  mediaOrder: (number | number[])[];
  exerciseInfo: MediaInfo[];
  isWorkoutLoad: boolean;
}

const WorkoutView = ({
  medias,
  mediaOrder,
  exerciseInfo,
  isWorkoutLoad,
}: Props) => {
  const mediaMap = useMemo(() => {
    const map = new Map();

    if (medias && medias.length > 0) {
      medias.forEach((mediaGroup) => {
        if (Array.isArray(mediaGroup)) {
          mediaGroup.forEach((mediaItem) => {
            if (mediaItem && mediaItem.id) {
              map.set(mediaItem.id.toString(), mediaItem);
            }
          });
        }
      });
    }

    return map;
  }, [medias]);

  const organizedMedia = useMemo(() => {
    if (!mediaOrder || mediaOrder.length === 0 || !mediaMap.size) {
      return medias;
    }

    return mediaOrder
      .map((orderItem) => {
        if (Array.isArray(orderItem)) {
          const groupItems = orderItem
            .map((id) => mediaMap.get(id ? id.toString() : ""))
            .filter(Boolean);

          return groupItems.length > 0 ? groupItems : null;
        } else {
          const mediaItem = mediaMap.get(orderItem ? orderItem.toString() : "");
          return mediaItem ? [mediaItem] : null;
        }
      })
      .filter(Boolean);
  }, [mediaMap, mediaOrder]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (Array.isArray(item) && item.length > 1) {
      return (
        <WorkoutGroup
          key={index}
          media={item}
          exerciseInfo={exerciseInfo}
          isWorkoutLoad={isWorkoutLoad}
        />
      );
    } else if (item) {
      return (
        <WorkoutItem
          key={index}
          media={item[0]}
          exerciseInfo={exerciseInfo}
          isWorkoutLoad={isWorkoutLoad}
        />
      );
    }
    return null;
  };

  const Separator = () => <View style={{ height: 30 }} />;

  return (
    <VStack>
      <FlatList
        data={organizedMedia}
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
        ItemSeparatorComponent={Separator}
      />
    </VStack>
  );
};

export default WorkoutView;
