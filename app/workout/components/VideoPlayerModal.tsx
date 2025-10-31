import { Maximize, Minus, X } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface VideoPlayerModalProps {
  videoId: string | null;
  showPlayer: boolean;
  minimized: boolean;
  isFullscreen: boolean;
  handleClosePlayer: () => void;
  handleToggleFullscreen: () => void;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  panGesture: ReturnType<typeof Gesture.Pan>;
}

const VideoPlayerModal = ({
  videoId,
  showPlayer,
  minimized,
  isFullscreen,
  handleClosePlayer,
  handleToggleFullscreen,
  translateX,
  translateY,
  panGesture,
}: VideoPlayerModalProps) => {
  const insets = useSafeAreaInsets();
  const playerRef = useRef(null);
  const [loading, setLoading] = useState(true); // ✅ estado de carregamento

  const playerWidth = isFullscreen
    ? SCREEN_WIDTH
    : minimized
    ? 160
    : SCREEN_WIDTH;

  const playerHeight = isFullscreen
    ? SCREEN_HEIGHT
    : minimized
    ? 90
    : SCREEN_HEIGHT * 0.5;

  const animatedStyle = useAnimatedStyle(() => ({
    width: playerWidth,
    height: playerHeight,
    position: isFullscreen || minimized ? "absolute" : "relative",
    top: 0,
    left: isFullscreen
      ? 0
      : minimized
      ? undefined
      : (SCREEN_WIDTH - playerWidth) / 2,
    right: isFullscreen ? 0 : undefined,
    bottom: 0,
    borderRadius: isFullscreen ? 0 : 12,
    overflow: "hidden",
    zIndex: 1000,
    transform: minimized
      ? [{ translateX: translateX.value }, { translateY: translateY.value }]
      : [],
  }));

  if (!showPlayer || !videoId) return null;

  const draggable = minimized;

  return (
    <GestureHandlerRootView style={styles.modalRoot}>
      <View
        style={[
          styles.modalOverlay,
          {
            backgroundColor: isFullscreen ? "rgba(0,0,0,1)" : "rgba(0,0,0,0.5)",
          },
        ]}
      >
        <GestureDetector gesture={draggable ? panGesture : Gesture.Pan()}>
          <Animated.View
            style={[
              styles.playerContainer,
              animatedStyle,
              { paddingTop: insets.top },
            ]}
          >
            {/* Loader sobreposto */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}

            <YoutubePlayer
              ref={playerRef}
              height={playerHeight - insets.top}
              width={playerWidth}
              play={true}
              videoId={videoId}
              mute={true}
              onReady={() => setLoading(false)} // ✅ remove loader quando o vídeo carrega
              initialPlayerParams={{
                controls: false,
                modestbranding: true,
                rel: false,
              }}
              webViewProps={{
                injectedJavaScript: `
                  var element = document.getElementsByClassName('container')[0];
                  element.style.position = 'unset';
                  element.style.paddingBottom = 'unset';
                  true;
                `,
                userAgent:
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36",
                mediaPlaybackRequiresUserAction: false,
                allowsInlineMediaPlayback: false,
              }}
            />

            {/* Controles flutuantes */}
            <View
              pointerEvents="box-none"
              style={[styles.floatingControls, { marginTop: insets.top + 8 }]}
            >
              <Pressable
                onPress={handleClosePlayer}
                style={styles.controlButton}
              >
                <X color="white" size={20} />
              </Pressable>

              {!minimized && (
                <Pressable
                  onPress={handleToggleFullscreen}
                  style={styles.controlButton}
                >
                  {isFullscreen ? (
                    <Minus color="white" size={20} />
                  ) : (
                    <Maximize color="white" size={20} />
                  )}
                </Pressable>
              )}
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  modalRoot: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.92)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  playerContainer: {
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  floatingControls: {
    position: "absolute",
    right: 8,
    flexDirection: "row",
    gap: 8,
    zIndex: 1001,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)", // ✅ leve transparência sobre o player
    zIndex: 1002,
  },
});

export default VideoPlayerModal;
