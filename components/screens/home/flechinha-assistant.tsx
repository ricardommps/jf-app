import { X } from "lucide-react-native";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  FlechinhaAssistantMessage,
  FlechinhaAssistantMood,
} from "@/types/flechinha-assistant";

const FLECHINHA_MOOD_IMAGES: Record<
  FlechinhaAssistantMood,
  ImageSourcePropType
> = {
  "ola-acenando": require("@/assets/images/flechinha/01_ola_acenando.png.png"),
  piscando: require("@/assets/images/flechinha/02_piscando.png.png"),
  feliz: require("@/assets/images/flechinha/03_feliz.png.png"),
  pensativa: require("@/assets/images/flechinha/04_pensativa.png.png"),
  anuncio: require("@/assets/images/flechinha/05_anuncio.png.png"),
  ideia: require("@/assets/images/flechinha/06_ideia.png.png"),
  alerta: require("@/assets/images/flechinha/07_alerta.png.png"),
  brava: require("@/assets/images/flechinha/08_brava.png.png"),
  triste: require("@/assets/images/flechinha/09_triste.png.png"),
  comemorando: require("@/assets/images/flechinha/10_comemorando.png.png"),
  carinho: require("@/assets/images/flechinha/11_carinho.png.png"),
  tchau: require("@/assets/images/flechinha/12_tchau.png.png"),
  "comemorando-medalha": require("@/assets/images/flechinha/13_comemorando_medalha.png"),
};

type FlechinhaAssistantProps = {
  message: FlechinhaAssistantMessage | null;
  onClose: () => void;
  onCtaPress: () => void;
};

const FlechinhaAssistant = ({
  message,
  onClose,
  onCtaPress,
}: FlechinhaAssistantProps) => {
  if (!message) {
    return null;
  }

  const avatarSource = FLECHINHA_MOOD_IMAGES[message.mood];

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View pointerEvents="box-none" style={styles.bubbleWrapper}>
        <View pointerEvents="box-none" style={styles.bubble}>
          <View pointerEvents="box-none" style={styles.headerRow}>
            {message.title ? (
              <View pointerEvents="none" style={styles.titleWrapper}>
                <Text style={styles.title}>{message.title}</Text>
              </View>
            ) : null}
            <Pressable
              hitSlop={16}
              onPress={onClose}
              android_ripple={{ color: "rgba(107, 114, 128, 0.12)", radius: 22 }}
              style={({ pressed }) => [
                styles.closeButton,
                pressed ? styles.closeButtonPressed : null,
              ]}
            >
              <X color="#6B7280" size={18} />
            </Pressable>
          </View>

          <View pointerEvents="none">
            <Text style={styles.message}>{message.message}</Text>
          </View>

          {message.cta ? (
            <Pressable onPress={onCtaPress} style={styles.ctaButton}>
              <Text style={styles.ctaLabel}>{message.cta.label}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View pointerEvents="none" style={styles.avatarWrapper}>
        <Image source={avatarSource} style={styles.avatar} resizeMode="contain" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 8,
    bottom: 6,
    zIndex: 30,
    minHeight: 144,
    justifyContent: "flex-end",
  },
  bubbleWrapper: {
    marginRight: 84,
    marginBottom: 16,
    alignSelf: "stretch",
  },
  bubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  titleWrapper: {
    flex: 1,
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  closeButtonPressed: {
    opacity: 0.72,
  },
  title: {
    color: "#E11D48",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    lineHeight: 20,
  },
  message: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
    paddingRight: 12,
  },
  ctaButton: {
    alignSelf: "flex-start",
    marginTop: 10,
  },
  ctaLabel: {
    color: "#F43F5E",
    fontSize: 13,
    fontWeight: "700",
  },
  avatarWrapper: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 112,
    height: 112,
  },
  avatar: {
    width: 112,
    height: 112,
  },
});

export default FlechinhaAssistant;
