import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import type { FinishedShareData } from "@/services/finished.service";
import { moduleName } from "@/utils/module-name";
import { MODULE_PRESENTATION } from "@/utils/shared-module-presentation";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import {
  Clock3,
  Dumbbell,
  Footprints,
  Route,
  Share2,
  Shell,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { captureRef } from "react-native-view-shot";

type Layout1Props = {
  id?: string;
  data?: FinishedShareData | null;
};

const Layout1 = ({ data }: Layout1Props) => {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const artworkHeight = Math.min(300, Math.max(230, screenWidth * 0.72));
  const shareViewRef = useRef<View>(null);
  const [showButtons, setShowButtons] = useState(true);
  const distanceLabel =
    data?.distanceKm !== null && data?.distanceKm !== undefined
      ? String(data.distanceKm.toFixed(2).replace(".", ",")) + " km"
      : "—";
  const durationLabel = data?.durationLabel ?? "—";
  const paceLabel = data?.paceLabel ?? "—";
  const effortLabel =
    data?.effort !== null && data?.effort !== undefined
      ? String(data.effort)
      : "—";
  const presentation =
    data?.type === 3
      ? MODULE_PRESENTATION.FORCA
      : (MODULE_PRESENTATION[data?.module?.key ?? "RODAGEM"] ??
        MODULE_PRESENTATION.RODAGEM);
  const messageLines = presentation.message;
  const isComplementary = data?.type === 3;
  const usesStrengthMetrics = presentation.strength || isComplementary;
  let firstMetricValue = distanceLabel;
  if (presentation.strength) {
    firstMetricValue = "Força";
  }
  if (isComplementary) {
    firstMetricValue = "Complementar";
  }
  const titleLabel = presentation.strength
    ? (data?.subtitle ?? "—")
    : (moduleName(String(data?.title ?? "")) ?? "—");

  const handleClose = () => {
    router.replace("/(tabs)/(home)" as any);
  };

  const handleShare = async () => {
    try {
      setShowButtons(false);
      await new Promise((resolve) => setTimeout(resolve, 150));

      const uri = await captureRef(shareViewRef, {
        format: "png",
        quality: 1,
      });

      setShowButtons(true);

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "Compartilhamento não disponível",
          "O recurso de compartilhamento não está disponível nesse dispositivo.",
        );
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Compartilhar imagem",
      });
    } catch (error) {
      setShowButtons(true);
      console.error("Erro ao compartilhar shared:", error);
    }
  };

  return (
    <View ref={shareViewRef} collapsable={false} style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.footer}>
        <View style={[styles.assistantArtwork, { height: artworkHeight }]}>
          {!isComplementary ? (
            <>
              <View
                style={[
                  styles.messageBlock,
                  presentation.artwork
                    ? styles.messageBlockWithArtwork
                    : styles.messageBlockWithoutArtwork,
                  presentation.messageTop
                    ? { top: presentation.messageTop }
                    : null,
                ]}
              >
                {messageLines.map((line) => (
                  <Text key={line} style={styles.message}>
                    {line}
                  </Text>
                ))}
                <View style={styles.messageUnderline}>
                  <View style={styles.messageUnderlineMain} />
                  <View style={styles.messageUnderlineSecondary} />
                  <View style={styles.messageUnderlineTertiary} />
                </View>
              </View>
              {presentation.artwork ? (
                <Image
                  source={presentation.artwork}
                  style={styles.assistantImage}
                  resizeMode="contain"
                />
              ) : null}
            </>
          ) : null}
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{titleLabel}</Text>
          <Text style={styles.subtitle}>Bom trabalho! Hora de recuperar!</Text>
        </View>
        <View style={styles.metricsCard}>
          <Metric
            icon={isComplementary ? Shell : usesStrengthMetrics ? Dumbbell : Route}
            label={usesStrengthMetrics ? "Treino" : "Distância"}
            value={firstMetricValue}
          />
          <View style={styles.metricDivider} />
          <Metric icon={Clock3} label="Tempo" value={durationLabel} />
          {!usesStrengthMetrics ? (
            <>
              <View style={styles.metricDivider} />
              <Metric icon={Footprints} label="Pace Médio" value={paceLabel} />
            </>
          ) : null}
          <View style={styles.metricDivider} />
          <Metric icon={BatteryChargingIcon} label="PSE" value={effortLabel} />
        </View>
        <View style={styles.brandBlock}>
          <Image
            source={require("@/assets/images/jf_branding.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text numberOfLines={1} style={styles.instagram}>
            @foltz.assesportiva
          </Text>
        </View>
        {showButtons ? (
          <HStack style={styles.actions}>
            <Button
              action="primary"
              size="md"
              style={styles.actionButton}
              onPress={handleClose}
            >
              <ButtonText>Fechar</ButtonText>
            </Button>
            <Button
              action="secondary"
              size="md"
              style={styles.actionButton}
              onPress={handleShare}
            >
              <ButtonIcon as={Share2} />
              <ButtonText>Compartilhar</ButtonText>
            </Button>
          </HStack>
        ) : null}
      </View>
    </View>
  );
};

type MetricProps = {
  icon: React.ComponentType<{ color?: string; size?: number }>;
  label: string;
  value: string;
};

const BatteryChargingIcon = ({
  color,
  size,
}: {
  color?: string;
  size?: number;
}) => <FontAwesome name="battery-half" color={color} size={size} />;

const Metric = ({ icon: Icon, label, value }: MetricProps) => (
  <View style={styles.metric}>
    <Icon color="#FFFFFF" size={22} />
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 58,
  },
  footer: {
    width: "100%",
    alignItems: "center",
    gap: 6,
  },
  metricsCard: {
    width: "92%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 20,
    backgroundColor: "rgba(22, 22, 22, 0.78)",
  },
  titleBlock: {
    width: "92%",
    marginTop: -6,
    alignItems: "flex-start",
  },
  assistantArtwork: {
    width: "92%",
    position: "relative",
  },
  assistantImage: {
    position: "absolute",
    right: -8,
    top: 0,
    width: "75%",
    height: "100%",
    zIndex: 1,
  },
  messageBlock: {
    transform: [{ translateY: -5 }],
    alignItems: "flex-start",
    paddingLeft: 2,
    paddingRight: 4,
  },
  messageBlockWithArtwork: {
    position: "absolute",
    left: 0,
    top: "28%",
    width: "40%",
    zIndex: 2,
  },
  messageBlockWithoutArtwork: {
    position: "absolute",
    left: 0,
    top: "64%",
    width: "100%",
  },
  message: {
    color: "#FFFFFF",
    fontFamily: "kalam-bold",
    fontSize: 18,
    lineHeight: 32,
    letterSpacing: 0.6,
    paddingTop: 4,
    paddingBottom: 2,
    includeFontPadding: true,
    textTransform: "uppercase",
    transform: [{ rotate: "-8deg" }],
  },
  messageUnderline: {
    width: 72,
    marginTop: 5,
    marginLeft: 3,
    alignItems: "flex-start",
    transform: [{ rotate: "-6deg" }],
  },
  messageUnderlineMain: {
    width: 60,
    height: 2,
    borderRadius: 999,
    backgroundColor: "#ED1B2F",
    transform: [{ rotate: "-4deg" }],
  },
  messageUnderlineSecondary: {
    width: 52,
    height: 1,
    marginTop: -1,
    marginLeft: 3,
    borderRadius: 999,
    backgroundColor: "rgba(237, 27, 47, 0.9)",
    transform: [{ rotate: "-9deg" }],
  },
  messageUnderlineTertiary: {
    width: 38,
    height: 1,
    marginTop: -1,
    marginLeft: 9,
    borderRadius: 999,
    backgroundColor: "rgba(237, 27, 47, 0.65)",
    transform: [{ rotate: "-2deg" }],
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "baloo-extrabold",
    fontSize: 22,
    lineHeight: 25,
  },
  subtitle: {
    color: "#FFFFFF",
    fontFamily: "baloo-regular",
    fontSize: 16,
    lineHeight: 19,
  },
  metric: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  metricDivider: {
    width: 1,
    height: 44,
    backgroundColor: "#ED1B2F",
    alignSelf: "center",
  },
  metricLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    textAlign: "center",
  },
  metricValue: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  instagram: {
    color: "#ED1B2F",
    fontFamily: "baloo-extrabold",
    fontSize: 14,
    fontWeight: "700",
  },
  brandBlock: {
    alignItems: "center",
    gap: 2,
  },
  actions: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  logo: {
    width: 130,
    height: 60,
  },
});

export default Layout1;
