import { MediaInfo } from "@/types/workout";
import { useState, useRef } from "react";
import { Dimensions, LayoutChangeEvent, View } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Alert, AlertText, AlertIcon } from "@/components/ui/alert";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { TouchableOpacity } from "react-native";
import {
  InfoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/ui/icon";
import { window } from "@/constants/sizes";
import { useSharedValue } from "react-native-reanimated";
import { Media } from "@/types/media";
import WorkoutItem from "./workout-item";

interface Props {
  media: Media[];
  exerciseInfo: MediaInfo[];
  isWorkoutLoad: boolean;
}

const WorkoutGroup = ({ media, exerciseInfo, isWorkoutLoad }: Props) => {
  const [itemHeights, setItemHeights] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<ICarouselInstance>(null);

  const progress = useSharedValue<number>(0);

  const handleType = () => {
    let title = "";
    if (media.length === 2) {
      title = "BISET";
    }

    if (media.length === 3) {
      title = "TRISET";
    }

    if (media.length > 3) {
      title = "CIRCUITO";
    }

    return (
      <Alert
        className="bg-background-200 rounded-lg flex-row items-center gap-x-2 p-4"
        variant="solid"
      >
        <AlertIcon as={InfoIcon} className="text-white font-dm-sans-bold" />
        <AlertText className="text-white font-dm-sans-bold">{title}</AlertText>
      </Alert>
    );
  };

  const handleLayout = (event: LayoutChangeEvent, index: number) => {
    const { height } = event.nativeEvent.layout;
    setItemHeights((prev) => {
      const next = [...prev];
      next[index] = height;
      return next;
    });
  };

  const goToPrev = () => {
    if (activeIndex > 0) {
      ref.current?.scrollTo({ count: -1, animated: true });
      setActiveIndex((prev) => prev - 1);
    }
  };

  const goToNext = () => {
    if (activeIndex < media.length - 1) {
      ref.current?.scrollTo({ count: 1, animated: true });
      setActiveIndex((prev) => prev + 1);
    }
  };

  const renderItem = ({ index }: { index: number }) => {
    const item = media[index];
    return (
      <View onLayout={(e) => handleLayout(e, index)} className="px-4">
        <WorkoutItem
          key={index}
          media={item}
          exerciseInfo={exerciseInfo}
          isWorkoutLoad={isWorkoutLoad}
        />
      </View>
    );
  };

  return (
    <Box className="p-2 rounded-xl overflow-hidden bg-[#2b2b2bc9]">
      {handleType()}
      <Box className="flex-row items-center justify-center mt-4 w-full gap-x-2">
        <TouchableOpacity
          onPress={goToPrev}
          disabled={activeIndex === 0}
          style={{
            opacity: activeIndex === 0 ? 0.3 : 1,
            padding: 3,
            backgroundColor: "white",
            borderRadius: 999,
          }}
        >
          <ChevronLeftIcon className="text-blue-500" width={24} height={24} />
        </TouchableOpacity>

        <Text className="text-blue-500 font-semibold text-base">
          {activeIndex + 1} / {media.length}
        </Text>

        <TouchableOpacity
          onPress={goToNext}
          disabled={activeIndex === media.length - 1}
          style={{
            opacity: activeIndex === media.length - 1 ? 0.3 : 1,
            padding: 3,
            backgroundColor: "white",
            borderRadius: 999,
          }}
        >
          <ChevronRightIcon className="text-blue-500" width={24} height={24} />
        </TouchableOpacity>
      </Box>

      <Box className="items-center justify-center relative">
        <Carousel
          autoPlayInterval={2000}
          data={media}
          height={itemHeights[activeIndex] || 500}
          loop={false}
          pagingEnabled={true}
          snapEnabled={true}
          width={window.width}
          ref={ref}
          style={{
            width: window.width,
          }}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 50,
          }}
          onProgressChange={progress}
          onSnapToItem={(index) => setActiveIndex(index)}
          renderItem={renderItem}
        />
      </Box>
    </Box>
  );
};

export default WorkoutGroup;
