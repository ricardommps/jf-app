import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import Layout1 from "./layout1";
import Layout2 from "./layout2";
import {
  getFinishedShareData,
  type FinishedShareData,
} from "@/services/finished.service";

const SharedScreen = () => {
  const { id, layout, unrealizedTraining } = useLocalSearchParams<{ id?: string; layout?: string; unrealizedTraining?: string }>();
  const sharedId = Array.isArray(id) ? id[0] : id;
  const sharedLayout = Array.isArray(layout) ? layout[0] : layout;
  const isUnrealizedTraining = (Array.isArray(unrealizedTraining) ? unrealizedTraining[0] : unrealizedTraining) === "true";
  const [shareData, setShareData] = useState<FinishedShareData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isUnrealizedTraining || !sharedId) {
      return;
    }

    let isActive = true;
    setIsLoading(true);

    getFinishedShareData(sharedId)
      .then((data) => {
        if (isActive) {
          setShareData(data);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar dados do compartilhamento:", error);
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [isUnrealizedTraining, sharedId, sharedLayout]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#ED1B2F" size="large" />
      </View>
    );
  }

  return sharedLayout === "2" ? (
    <Layout2 data={shareData} unrealizedTraining={isUnrealizedTraining} />
  ) : (
    <Layout1 id={sharedId} data={shareData} />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
});

export default SharedScreen;
