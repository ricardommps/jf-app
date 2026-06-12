import {
  useConnectStrava,
  useStravaStatus,
} from "@/hooks/useConnectStrava/useConnectStrava";
import React from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function StravaConnectButton() {
  const { mutate, status } = useConnectStrava(); // ✅ status indica 'idle' | 'loading' | 'error' | 'success'
  const { data, isLoading: isStatusLoading } = useStravaStatus();

  const isConnecting = status === "pending";

  if (isStatusLoading) return <ActivityIndicator size="small" />;

  return (
    <View style={styles.container}>
      {data?.connected ? (
        <Text style={styles.connectedText}>Strava conectado ✅</Text>
      ) : (
        <Button
          title={isConnecting ? "Conectando..." : "Conectar com Strava"}
          onPress={() => mutate()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: "center",
  },
  connectedText: {
    color: "green",
    fontWeight: "bold",
  },
});
