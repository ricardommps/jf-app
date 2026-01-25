import Header from "@/components/header";
import Loading from "@/components/shared/loading";
import { HStack } from "@/components/ui/hstack";
import { AddIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  deleteRunningRaces,
  runningRaces,
} from "@/services/running-races.service";
import { Workout } from "@/types/workout";
import { useQuery } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ConfirmModalDelete from "./components/confirm-modal-delete";
import RunningRaceItemView from "./components/running-race-item-view";

type TabId = "add";

interface TabItem {
  id: TabId;
  label: string;
  inActiveIcon: React.ElementType;
  icon: React.ElementType;
}

const tabItems: TabItem[] = [
  {
    id: "add",
    label: "Add",
    inActiveIcon: AddIcon,
    icon: AddIcon,
  },
];

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
    staleTime: 0,
    gcTime: 0,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Workout | null>(null);

  const insets = useSafeAreaInsets();

  const scaleRefs = useRef<Record<TabId, Animated.Value>>({
    add: new Animated.Value(1),
  }).current;

  const handleAdd = () => {
    router.push(`/runningRaces/add?programId=${programId}` as any);
  };

  const handleEdit = (item: Workout) => {
    if (item.id) {
      router.push(
        `/runningRaces/add?programId=${programId}&workoutId=${item.id}` as any
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

  useEffect(() => {
    tabItems.forEach((item) => {
      Animated.spring(scaleRefs[item.id], {
        toValue: activeTab === item.id ? 1.2 : 1,
        useNativeDriver: true,
      }).start();
    });
  }, [activeTab]);

  if (isLoading) {
    return <Loading />;
  }
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#000" }}
      edges={["bottom"]}
    >
      <Header title="Provas" />
      <VStack className="w-full mt-5 gap-3 px-3 pb-10">
        <FlatList
          data={runningRacesData}
          renderItem={renderItem}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{
            paddingBottom: 80,
            gap: 10,
          }}
          ListEmptyComponent={() => (
            <View style={{ marginTop: 48, alignItems: "center" }}>
              <Text style={{ color: "#999" }}>Nenhuma prova encontrada</Text>
            </View>
          )}
        />
      </VStack>
      <View
        style={[
          styles.menuContainer,
          {
            backgroundColor:
              Platform.OS === "android" ? "#0d0d0d" : "transparent",
            bottom: 0,
          },
        ]}
      >
        {Platform.OS === "ios" && (
          <BlurView
            intensity={60}
            tint={"dark"}
            style={StyleSheet.absoluteFill}
          />
        )}

        <HStack
          style={[
            styles.menuContent,
            {
              paddingBottom:
                insets.bottom > 0 ? Math.min(insets.bottom, 12) : 12,
            },
          ]}
        >
          {tabItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Pressable
                key={item.id}
                className="flex-1 items-center justify-center"
                onPress={() => {
                  setActiveTab(item.id);
                  if (item.id === "add") {
                    handleAdd();
                  }
                }}
              >
                <Animated.View
                  style={{ transform: [{ scale: scaleRefs[item.id] }] }}
                >
                  <Icon
                    as={isActive ? item.icon : item.inActiveIcon}
                    size="xl"
                    className={`${
                      isActive ? "text-primary-800" : "text-background-500"
                    }`}
                  />
                </Animated.View>
              </Pressable>
            );
          })}
        </HStack>
      </View>
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
  menuContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignSelf: "center",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 10,
    overflow: "hidden",
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 10,
  },
});
