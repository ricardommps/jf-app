import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { runningPace } from "@/utils/running-pace";
import { FlatList, Modal, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onRequestClose: () => void;
}

const TablePace: React.FC<Props> = ({ visible, onRequestClose }) => {
  const filteredPace = runningPace.map(({ pace, speed }) => ({ pace, speed }));

  const ListHeader = () => (
    <Box className="flex-row justify-between items-center px-4 py-3 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
      <Text className="text-xl font-bold text-gray-800 dark:text-white">
        Pace
      </Text>
      <Text className="text-xl font-bold text-gray-800 dark:text-white">
        km/h
      </Text>
    </Box>
  );

  const renderItem = ({
    item,
    index,
  }: {
    item: { pace: string; speed: string };
    index: number;
  }) => (
    <Box
      className={`flex-row justify-between items-center px-4 py-3 ${
        index % 2 === 0
          ? "bg-gray-100 dark:bg-gray-800"
          : "bg-gray-200 dark:bg-gray-700"
      }`}
    >
      <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300">
        {item.pace}
      </Text>
      <Text className="text-lg font-semibold text-gray-900 dark:text-white">
        {item.speed}
      </Text>
    </Box>
  );

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
        <Box className="flex-1 bg-background-0">
          <VStack className="flex-1 px-4 pt-10">
            {/* Header */}
            <HStack className="justify-between items-center mb-4">
              <Heading size="lg" className="text-white">
                Tabela - Pace X Km/h
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

            <FlatList
              data={filteredPace}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderItem}
              ListHeaderComponent={ListHeader}
              contentContainerStyle={{ paddingBottom: 24 }}
              className="rounded-md overflow-hidden"
            />
          </VStack>
        </Box>
      </SafeAreaView>
    </Modal>
  );
};

export default TablePace;
