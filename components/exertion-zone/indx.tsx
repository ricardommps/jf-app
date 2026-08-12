import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import React from "react";
import { Modal, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface ZoneData {
  pv?: number | string | null;
  pace?: number | string | null;
  vla?: number | string | null;
  paceVla?: number | string | null;
  vlan?: number | string | null;
  paceVlan?: number | string | null;
}

interface Props {
  visible: boolean;
  onRequestClose: () => void;
  data: ZoneData;
}

const formatValue = (label: string, value?: number | string | null) =>
  value === null || value === undefined || value === ""
    ? null
    : `${label}: ${value}`;

export const ExertionZoneContent = ({ data }: { data: ZoneData }) => {
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
        main: formatValue("Vla", data.vla),
        pace: formatValue("Pace Vla", data.paceVla),
      },
    },
    {
      id: "Z3",
      label: "Pesado",
      color: "#8B5CF6",
      values: {
        main: formatValue("Vlan", data.vlan),
        pace: formatValue("Pace Vlan", data.paceVlan),
      },
    },
    {
      id: "Z4",
      label: "Severo",
      color: "#F59E0B",
      values: {
        main: formatValue("Pv", data.pv),
        pace: formatValue("Pace Pv", data.pace),
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
    <View
      style={{
        backgroundColor: "#2b2b2b9d",
        borderRadius: 24,
        padding: 24,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 50 }}>
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
          Domínio de {"\n"}
          intensidade
        </Text>
      </View>

      {zones.map((zone, index) => (
        <View key={zone.id} style={{ position: "relative", marginBottom: 48 }}>
          {index < zones.length - 1 && (
            <View
              style={{
                position: "absolute",
                left: "50%",
                marginLeft: -15,
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
            <View
              style={{
                flex: 1,
                alignItems: "flex-end",
                paddingRight: 25,
              }}
            >
              {zone.values?.main ? (
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

                  {zone.values.pace ? (
                    <Text
                      style={{
                        color: "#94a3b8",
                        fontSize: 13,
                        marginTop: 2,
                      }}
                    >
                      {zone.values.pace}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>

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
  );
};

const ExertionZone: React.FC<Props> = ({ visible, onRequestClose, data }) => {
  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onRequestClose}>
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

            <ExertionZoneContent data={data} />
          </VStack>
        </Box>
      </SafeAreaView>
    </Modal>
  );
};

export default ExertionZone;
