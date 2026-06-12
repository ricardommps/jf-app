import Header from "@/components/header";
import Loading from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { AddIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { VStack } from "@/components/ui/vstack";
import {
  deleteRunningRaces,
  runningRaces,
} from "@/services/running-races.service";
import { Workout } from "@/types/workout";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfirmModalDelete from "./components/confirm-modal-delete";
import RunningRaceItemView from "./components/running-race-item-view";

export default function RunningRacesScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const programId =
    typeof params.programId === "string" ? params.programId : undefined;

  const {
    data: runningRacesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["running-races", programId],
    queryFn: async () => runningRaces(programId as string),
    enabled: !!programId,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Workout | null>(null);

  const handleAdd = () => {
    router.push(`/runningRaces/add?programId=${programId}` as any);
  };

  const handleEdit = (item: Workout) => {
    if (item.id) {
      router.push(
        `/runningRaces/add?programId=${programId}&workoutId=${item.id}` as any,
      );
    }
  };

  const handleOpenDeleteModal = (item: Workout) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setModalVisible(false);
      setSelectedItem(null);
      await deleteRunningRaces(id);
      refetch();
    } catch (error) {
      console.error("Erro ao deletar prova:", error);
    }
  };

  const renderItem = ({ item }: { item: Workout }) => {
    return (
      <RunningRaceItemView
        item={item}
        handleEdit={handleEdit}
        handleOpenDeleteModal={handleOpenDeleteModal}
      />
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <Header title="Provas" />

      {/* BOTÃO TOPO DIREITA */}
      <View style={styles.topActionContainer}>
        <Button
          action="primary"
          size="md"
          onPress={handleAdd}
          className="flex-row items-center justify-center gap-2 min-w-[140px] rounded-xl"
        >
          <Icon as={AddIcon} size="sm" className="text-white" />
          <Text className="text-white font-semibold">Adicionar</Text>
        </Button>
      </View>

      <VStack className="w-full gap-3 px-3 pb-10">
        <FlatList
          data={runningRacesData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id ?? Math.random().toString()}
          contentContainerStyle={{
            paddingBottom: 40,
            gap: 10,
          }}
          ListEmptyComponent={() => (
            <View style={{ marginTop: 48, alignItems: "center" }}>
              <Text style={{ color: "#999" }}>Nenhuma prova encontrada</Text>
            </View>
          )}
        />
      </VStack>

      {modalVisible && selectedItem && (
        <ConfirmModalDelete
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          item={selectedItem}
          onConfirm={handleDelete}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topActionContainer: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
