import { Button, ButtonText } from "@/components/ui/button";
import WorkoutSection from "../components/workout-section";
import { Pressable } from "@/components/ui/pressable";
import { Workout, WorkoutItem } from "@/types/workout";
import { FlatList, StyleSheet, Modal, View } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Icon, InfoIcon } from "@/components/ui/icon";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { TrashIcon } from "lucide-react-native";
import TreadmillIcon from "@/components/ui/treadmill-icon";

interface Props {
  workout: Workout;
}

const RunnerView = ({ workout }: Props) => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<"indoor" | "outdoor" | null>(
    "indoor"
  );
  function handleFinish() {
    const intensities =
      workout.title === "HIIT_CURTO" ||
      workout.title === "HIITT_LONGO" ||
      workout.title === "LL2_INTERVALADO" ||
      workout.title === "SPRINT" ||
      workout.title === "HIT_ELEVACAO";
    setModalVisible(false);
    setSelected("indoor");
    if (selected === "outdoor") {
      router.push(`/workout/runner-finish?id=${workout.id}&outdoor=true`);
    } else {
      router.push(
        `/workout/runner-finish?id=${workout.id}&intensities=${intensities}`
      );
    }
  }
  const renderWorkoutSection = ({ item }: { item: WorkoutItem }) => {
    return (
      <WorkoutSection
        title={item.category}
        description={item?.description}
        medias={item.medias}
        mediaOrder={item.mediaOrder}
        exerciseInfo={item.mediaInfo}
        isWorkoutLoad={item.isWorkoutLoad}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Box className="px-4 pb-4">
          <Pressable>
            <HStack className="items-center justify-start" space="sm">
              <Text className="text-white text-base font-bold">
                Tabela Pace km-h
              </Text>
              <Icon as={InfoIcon} className="text-white" size="lg" />
            </HStack>
          </Pressable>
        </Box>

        <FlatList
          data={workout.workoutItems}
          renderItem={renderWorkoutSection}
          keyExtractor={(item: WorkoutItem) => item.id}
          contentContainerStyle={{
            flexGrow: 1,
            gap: 16,
            paddingBottom: 50,
          }}
          ListFooterComponent={() => (
            <HStack className="gap-4 pt-2 justify-end w-full px-4">
              <Button variant="outline" size="md" onPress={() => router.back()}>
                <ButtonText>Fechar</ButtonText>
              </Button>
              <Button
                action="primary"
                size="md"
                onPress={() => setModalVisible(true)}
              >
                <ButtonText>Finalizar treino</ButtonText>
              </Button>
            </HStack>
          )}
        />
      </SafeAreaView>
      <Modal visible={modalVisible} transparent animationType="fade">
        <HStack className="flex-1 justify-center items-center bg-black/90 px-4">
          <Box className="bg-[#121212df] rounded-2xl p-6 w-full max-w-md">
            <VStack space="md">
              <Heading className="text-white font-semibold text-center">
                Seu treino foi?
              </Heading>

              <HStack space="md" className="mt-2">
                {/* Indoor */}
                <Pressable
                  onPress={() => setSelected("indoor")}
                  className={
                    `flex-1 items-center py-6 rounded-2xl border ` +
                    (selected === "indoor"
                      ? "bg-[#2b2b2b9d]  border-gray-500"
                      : "bg-transparent border-white/20")
                  }
                >
                  <TreadmillIcon size={32} color="#fff" strokeWidth={2.5} />
                  <Text className="text-white mt-2">Indoor</Text>
                </Pressable>

                {/* Outdoor */}
                <Pressable
                  onPress={() => setSelected("outdoor")}
                  className={
                    `flex-1 items-center py-6 rounded-2xl border ` +
                    (selected === "outdoor"
                      ? "bg-[#2b2b2b9d]  border-gray-500"
                      : "bg-transparent border-white/20")
                  }
                >
                  <MaterialCommunityIcons
                    name={"road" as any}
                    size={32}
                    color="white"
                  />

                  <Text className="text-white mt-2">Outdoor</Text>
                </Pressable>
              </HStack>

              <HStack space="md" className="mt-6 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  action="secondary"
                  onPress={() => setModalVisible(false)}
                >
                  <ButtonText>Cancelar</ButtonText>
                </Button>
                <Button action="primary" size="sm" onPress={handleFinish}>
                  <ButtonText>Confirmar</ButtonText>
                </Button>
              </HStack>
            </VStack>
          </Box>
        </HStack>
      </Modal>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
});

export default RunnerView;
