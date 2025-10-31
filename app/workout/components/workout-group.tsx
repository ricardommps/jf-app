import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { Box } from "@/components/ui/box";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
} from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { window } from "@/constants/sizes";
import { Media } from "@/types/media";
import { MediaInfo } from "@/types/workout";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import WorkoutItem from "./workout-item";

interface Props {
  media: Media[];
  exerciseInfo: MediaInfo[];
  isWorkoutLoad: boolean;
  debug?: boolean;
}

const WorkoutGroup = ({
  media,
  exerciseInfo,
  isWorkoutLoad,
  debug = false,
}: Props) => {
  const [itemHeights, setItemHeights] = useState<number[]>([]);
  const [carouselHeight, setCarouselHeight] = useState(400);
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const measuredHeights = useRef<Set<number>>(new Set());
  const layoutTimeoutRef = useRef<number | null>(null);

  // Ajusta altura do carrossel conforme maior item medido
  useEffect(() => {
    if (itemHeights.length) {
      setCarouselHeight(Math.max(...itemHeights) + 20);
    }
  }, [itemHeights]);

  // Define título (BISET, TRISET, CIRCUITO)
  const handleType = useMemo(() => {
    if (media.length < 2) return null;
    let title = "";
    if (media.length === 2) title = "BISET";
    else if (media.length === 3) title = "TRISET";
    else if (media.length > 3) title = "CIRCUITO";

    return (
      <Alert
        className="bg-background-200 rounded-lg flex-row items-center gap-x-2 p-4"
        variant="solid"
      >
        <AlertIcon as={InfoIcon} className="text-white font-dm-sans-bold" />
        <AlertText className="text-white font-dm-sans-bold">{title}</AlertText>
      </Alert>
    );
  }, [media.length]);

  // Medição de altura dos itens
  const handleLayout = useCallback(
    (event: LayoutChangeEvent, index: number) => {
      const { height } = event.nativeEvent.layout;
      if (measuredHeights.current.has(index)) return;
      measuredHeights.current.add(index);

      const next = [...itemHeights];
      next[index] = height;

      // Evita múltiplos setStates consecutivos
      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current);
      }
      layoutTimeoutRef.current = setTimeout(() => {
        setItemHeights(next);
      }, 50);
    },
    [itemHeights]
  );

  const goToPrev = useCallback(
    () => ref.current?.scrollTo({ count: -1, animated: true }),
    []
  );

  const goToNext = useCallback(
    () => ref.current?.scrollTo({ count: 1, animated: true }),
    []
  );

  const renderItem = useCallback(
    ({ index }: { index: number }) => {
      const item = media[index];
      return (
        <View onLayout={(e) => handleLayout(e, index)} className="px-4">
          <MemoizedWorkoutItem
            media={item}
            exerciseInfo={exerciseInfo}
            isWorkoutLoad={isWorkoutLoad}
            debug={debug}
          />
        </View>
      );
    },
    [media, exerciseInfo, isWorkoutLoad, debug, handleLayout]
  );

  if (!media || media.length === 0) {
    return null;
  }

  return (
    <Box
      className="p-2 rounded-xl overflow-visible border-2 mb-4"
      style={{ borderColor: "#2b2b2bc9", minHeight: "auto" }}
    >
      {handleType}

      {/* Navegação e contador */}
      <Box className="flex-row items-center justify-center mt-4 w-full gap-x-2 mb-4">
        <TouchableOpacity
          onPress={goToPrev}
          style={{
            opacity: 1,
            padding: 3,
            backgroundColor: "white",
            borderRadius: 999,
          }}
        >
          <ChevronLeftIcon className="text-blue-500" width={24} height={24} />
        </TouchableOpacity>

        <Text className="text-blue-500 font-semibold text-base">
          {currentIndex + 1} / {media.length}
        </Text>

        <TouchableOpacity
          onPress={goToNext}
          style={{
            opacity: 1,
            padding: 3,
            backgroundColor: "white",
            borderRadius: 999,
          }}
        >
          <ChevronRightIcon className="text-blue-500" width={24} height={24} />
        </TouchableOpacity>
      </Box>

      {/* Carousel */}
      <Box
        className="items-center justify-center relative"
        style={{ minHeight: carouselHeight }}
      >
        <Carousel
          data={media}
          height={carouselHeight}
          loop={false}
          pagingEnabled
          snapEnabled
          width={window.width - 40}
          ref={ref}
          style={{ width: window.width }}
          mode="horizontal-stack"
          modeConfig={{ snapDirection: "left", stackInterval: 0 }}
          onProgressChange={progress}
          renderItem={renderItem}
          scrollAnimationDuration={500}
          windowSize={1}
          onSnapToItem={(index) => setCurrentIndex(index)}
        />
      </Box>
    </Box>
  );
};

// Componente memoizado evita re-renderização desnecessária
const MemoizedWorkoutItem = memo(WorkoutItem);

export default WorkoutGroup;
