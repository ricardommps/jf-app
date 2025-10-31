import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import React from "react";
import { Modal, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ZoneData {
  pv: number;
  pace: number;
  vla: number;
  paceVla: number;
  vlan: number;
  paceVlan: number;
}

interface Props {
  visible: boolean;
  onRequestClose: () => void;
  data: ZoneData;
}

const ExertionZone: React.FC<Props> = ({ visible, onRequestClose, data }) => {
  const zones = [
    {
      id: "Z1",
      label: "Leve",
      color: "#10B981",
      values: null,
    },
    {
      id: "Z2",
      label: "Moderado",
      color: "#06B6D4",
      values: {
        main: `Vla: ${data.vla}`,
        pace: `Pace Vla: ${data.paceVla}`,
      },
    },
    {
      id: "Z3",
      label: "Pesado",
      color: "#8B5CF6",
      values: {
        main: `Vlan: ${data.vlan}`,
        pace: `Pace Vlan: ${data.paceVlan}`,
      },
    },
    {
      id: "Z4",
      label: "Severo",
      color: "#F59E0B",
      values: {
        main: `Pv: ${data.pv}`,
        pace: `Pace Pv: ${data.pace}`,
      },
    },
    {
      id: "Z5",
      label: "Extremo",
      color: "#EF4444",
      values: null,
    },
  ];

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000"
        translucent={false}
      />

      <SafeAreaView
        edges={["right", "bottom", "left"]}
        style={{
          flex: 1,
          backgroundColor: "#000",
          paddingTop: 50,
        }}
      >
        <Box className="flex-1 bg-background-0 px-1">
          <VStack className="flex-1 p-1">
            {/* Header */}
            <HStack className="justify-between items-center mb-6 p-3">
              <Heading size="lg" className="text-white">
                Zona de esforço
              </Heading>
              <TouchableOpacity
                onPress={onRequestClose}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel="Fechar modal"
                accessibilityRole="button"
              >
                <Text className="text-2xl text-white">✕</Text>
              </TouchableOpacity>
            </HStack>
            <View
              style={{ flex: 1, backgroundColor: "#2b2b2b9d", padding: 24 }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "600", marginLeft: 50 }}
                >
                  Limiar
                </Text>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Zona</Text>
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    textAlign: "right",
                  }}
                >
                  Domínio de {"\n"}intensidade
                </Text>
              </View>

              {/* Lista de zonas */}
              {zones.map((zone, index) => (
                <View
                  key={zone.id}
                  style={{ position: "relative", marginBottom: 48 }}
                >
                  {/* Linha vertical */}
                  {index < zones.length - 1 && (
                    <View
                      style={{
                        position: "absolute",
                        left: "50%",
                        marginLeft: -15, // half of width (1px)
                        top: 20,
                        height: 80,
                        width: 1,
                        backgroundColor: "#475569",
                        zIndex: 0,
                      }}
                    />
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Limiar */}
                    <View
                      style={{
                        flex: 1,
                        alignItems: "flex-end",
                        paddingRight: 25,
                      }}
                    >
                      {zone.values && (
                        <View style={{ alignItems: "flex-end" }}>
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "600",
                              fontSize: 15,
                            }}
                          >
                            {zone.values.main}
                          </Text>
                          <Text
                            style={{
                              color: "#94a3b8",
                              fontSize: 13,
                              marginTop: 2,
                            }}
                          >
                            {zone.values.pace}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Zona */}
                    <View
                      style={{
                        alignItems: "center",
                        flexDirection: "row",
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: zone.color,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: "700",
                          color: "#fff",
                        }}
                      >
                        {zone.id}
                      </Text>
                    </View>

                    {/* Intensidade */}
                    <View
                      style={{
                        flex: 1,
                        paddingLeft: 25,
                        alignItems: "flex-end",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: "700",
                          color: "#fff",
                        }}
                      >
                        {zone.label}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </VStack>
        </Box>
      </SafeAreaView>
    </Modal>
  );
};

export default ExertionZone;
