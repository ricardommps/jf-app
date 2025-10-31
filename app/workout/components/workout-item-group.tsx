import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Media } from "@/types/media";
import { MediaInfo } from "@/types/workout";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface Props {
  media: Media;
  exerciseInfo: MediaInfo[];
}

const getYoutubeId = (url?: string) => {
  if (!url) return null;
  const match = url.match(/(?:\?v=|\/embed\/|\.be\/|\/shorts\/)([\w\-]{11})/);
  return match ? match[1] : null;
};

const WorkoutItemGroup = ({ media, exerciseInfo }: Props) => {
  const exerciseInfoById = exerciseInfo?.find(
    (item) => String(item.id) === String(media.id)
  );
  const videoId = getYoutubeId(media.videoUrl);

  return (
    <VStack space="md">
      <VStack className="rounded-2xl bg-background-200 gap-3 p-2 py-3 px-3 min-h-[150px]">
        <HStack className="gap-2 items-start">
          <Text className="text-typography-900 font-dm-sans-bold text-base">
            {media.title}
          </Text>
        </HStack>

        {videoId && (
          <View style={styles.webviewContainer}>
            <WebView
              source={{
                uri: `https://www.youtube.com/embed/${videoId}?playsinline=1&controls=1&modestbranding=1&rel=0&mute=1`,
              }}
              style={styles.webview}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsFullscreenVideo={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              mixedContentMode="compatibility"
              userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
            />
          </View>
        )}

        <VStack className="px-2 gap-3">
          <HStack className="rounded-2xl bg-background-300 flex-row justify-between items-center p-2">
            <Text
              className="text-typography-700 font-dm-sans-bold flex-1"
              size="md"
            >
              Carga: não definida
            </Text>
            <Button variant="outline" size="sm">
              <ButtonText>Editar</ButtonText>
            </Button>
          </HStack>

          {exerciseInfoById?.method && (
            <InfoItem label="MÉTODO:" value={exerciseInfoById.method} />
          )}
          {exerciseInfoById?.reps && (
            <InfoItem
              label="RANGE DE REPETIÇÕES:"
              value={exerciseInfoById.reps}
            />
          )}
          {exerciseInfoById?.reset && (
            <InfoItem
              label="INTERVALO DE RECUPERAÇÃO:"
              value={exerciseInfoById.reset}
            />
          )}
          {exerciseInfoById?.rir && (
            <InfoItem
              label="REPETIÇÕES DE RESERVA:"
              value={exerciseInfoById.rir}
            />
          )}
          {exerciseInfoById?.cadence && (
            <InfoItem
              label="CADÊNCIA / VEL. DE MOV.:"
              value={exerciseInfoById.cadence}
            />
          )}
          {exerciseInfoById?.comments && (
            <InfoItem label="OBSERVAÇÕES:" value={exerciseInfoById.comments} />
          )}
        </VStack>
      </VStack>
    </VStack>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <VStack className="items-start">
    <Text className="font-dm-sans-bold" size="sm">
      {label}
    </Text>
    <Text className="font-dm-sans-medium" size="sm">
      {value}
    </Text>
  </VStack>
);

const styles = StyleSheet.create({
  webviewContainer: {
    width: "100%",
    height: 320,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default WorkoutItemGroup;
