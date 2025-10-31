import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ExtrapolationEntry } from "@/types/extrapolation";
import { Modal, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onRequestClose: () => void;
  currentExtrapolation: ExtrapolationEntry | null;
}

const ExtrapolativeValidity: React.FC<Props> = ({
  visible,
  onRequestClose,
  currentExtrapolation,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      presentationStyle="fullScreen"
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
          <VStack className="flex-1 p-6">
            {/* Header */}
            <HStack className="justify-between items-center mb-6">
              <Heading size="lg" className="text-white">
                Validade Extrapolativa
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
            {/* Conteúdo principal */}
            {currentExtrapolation && (
              <Box className="mt-6 rounded-xl bg-gray-100 dark:bg-[#2b2b2b9d] p-3">
                {Object.entries(currentExtrapolation)
                  .filter(([label]) => label !== "VO2")
                  .map(([label, value]) => (
                    <Box
                      key={label}
                      className="flex-row justify-between py-3 border-b border-gray-200 dark:border-gray-700"
                    >
                      <Text className="text-lg text-gray-700 dark:text-gray-300 font-semibold">
                        {label}
                      </Text>
                      <Text className="text-lg text-gray-900 dark:text-white">
                        {value}
                      </Text>
                    </Box>
                  ))}
              </Box>
            )}
          </VStack>
        </Box>
      </SafeAreaView>
    </Modal>
  );
};

export default ExtrapolativeValidity;
