import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import SvgBodComplet from "@/svg/BodComplet";
import { MusclesWorked } from "@/types/musclesWorked";
import {
  getActiveMuscles,
  getActiveSvgIds,
  getMuscleNames,
} from "@/utils/getActiveMuscleTags";
import React, { useMemo } from "react";
import { Modal, StatusBar, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onRequestClose: () => void;
  musclesWorked: MusclesWorked | null;
}

const MusclesScreen: React.FC<Props> = ({
  visible,
  onRequestClose,
  musclesWorked,
}) => {
  const musclesId = musclesWorked?.musclesId ?? [];

  const activeSvgIds = useMemo(() => getActiveSvgIds(musclesId), [musclesId]);

  const activeMuscles = useMemo(() => getActiveMuscles(musclesId), [musclesId]);

  const muscleNames = useMemo(() => getMuscleNames(musclesId), [musclesId]);

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
                Musculaturas trabalhadas
              </Heading>

              <TouchableOpacity
                onPress={onRequestClose}
                activeOpacity={0.7}
                accessibilityLabel="Fechar modal"
                accessibilityRole="button"
              >
                <Text className="text-2xl text-white">✕</Text>
              </TouchableOpacity>
            </HStack>

            {/* Chips */}
            <HStack className="flex-wrap">
              {activeMuscles.map((muscle) => (
                <Box
                  key={muscle.id}
                  className="mr-2 mb-2 px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: muscle.activeColor ?? "#FF4D4F",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "500",
                    }}
                  >
                    {muscle.muscle}
                  </Text>
                </Box>
              ))}
            </HStack>

            {/* SVG */}
            <Box className="items-center" style={{ height: 500 }}>
              <SvgBodComplet
                width="100%"
                height="100%"
                activeIds={activeSvgIds}
              />
            </Box>
          </VStack>
        </Box>
      </SafeAreaView>
    </Modal>
  );
};

export default MusclesScreen;
