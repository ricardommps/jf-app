import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  ListRenderItem,
  View,
  Text,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import ProgramCard from "@/components/screens/program/program-card";
import { useQuery } from "@tanstack/react-query";
import { getPrograms } from "@/services/program.services";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import Loading from "@/components/shared/loading";
import { useRouter } from "expo-router";
import { AxiosError } from "axios";

// Definir o tipo do item do programa baseado no retorno da API
interface ProgramItem {
  id: number;
  name: string;
  pace: string | null;
  pv: string | null;
  type: number;
  startDate: string;
  endDate: string;
}

const Home = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { handleError } = useErrorHandler();

  const { data, isLoading, refetch, error } = useQuery<
    ProgramItem[],
    AxiosError
  >({
    queryKey: ["programs"],
    queryFn: async () => await getPrograms(),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      handleError(error as any); // ou cast para o tipo esperado
    } finally {
      setRefreshing(false);
    }
  };

  // Renderizar cada item da lista
  const renderItem: ListRenderItem<ProgramItem> = ({ item, index }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100)
        .springify()
        .damping(12)}
    >
      <ProgramCard
        id={item.id}
        name={item.name}
        pv={item.pv || "N/A"}
        pace={item.pace || "N/A"}
        type={item.type}
        startDate={item.startDate}
        endDate={item.endDate}
      />
    </Animated.View>
  );

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    if (error?.status !== 403) {
      router.push(`/error/view`);
    }
  }

  return (
    <FlatList
      data={data || []} // Usar dados da API em vez de ProgramsData
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      style={{ flex: 1, backgroundColor: "var(--background-0)" }} // Aplicar estilo diretamente
      contentContainerStyle={{
        gap: 32, // 8 * 4 = 32 (equivalente ao gap-8 do Tailwind)
        paddingHorizontal: 20, // 5 * 4 = 20 (equivalente ao px-5)
        paddingVertical: 16,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#2b2b2b9d"]} // Cor do loading no Android
          tintColor="#2b2b2b9d" // Cor do loading no iOS
        />
      }
      ListEmptyComponent={() => (
        <View>
          <Text>Nenhum item encontrado</Text>
        </View>
      )}
    />
  );
};

export default Home;
