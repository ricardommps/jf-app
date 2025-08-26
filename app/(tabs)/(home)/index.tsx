import React, { useEffect, useState } from "react";
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
import Loading from "@/components/shared/loading";
import { useRouter } from "expo-router";
import { isAxiosError, AxiosError } from "axios";
import { PaidInvoices } from "@/types/invoice";
import { getTotalPaidInvoices } from "@/services/invoice.service";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";

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

  const handleErrorSafely = (error: unknown) => {
    if (isAxiosError(error)) {
      router.push(`/error/view`);
    } else if (error) {
      router.push(`/error/view`);
    }
  };

  const {
    data: programs,
    isLoading: isProgramsLoading,
    refetch: refetchPrograms,
    error: programsError,
  } = useQuery<ProgramItem[], AxiosError>({
    staleTime: 0,
    gcTime: 0,
    queryKey: ["programs"],
    queryFn: getPrograms,
    retry: false,
  });

  const {
    data: paidInvoices,
    refetch: refetchPaidInvoices,
    isLoading: isInvoicesLoading,
    error: invoicesError,
  } = useQuery<PaidInvoices, AxiosError>({
    queryKey: ["other-data"],
    staleTime: 0,
    gcTime: 0,
    queryFn: getTotalPaidInvoices,
    retry: false,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchPrograms(), refetchPaidInvoices()]);
    } catch (err) {
      handleErrorSafely(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleInvoice = () => {
    router.push(`/invoice`);
  };

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

  useEffect(() => {
    if (programsError) {
      handleErrorSafely(programsError);
    }

    if (invoicesError) {
      handleErrorSafely(invoicesError);
    }
  }, [programsError, invoicesError, router]);

  const isLoading = isProgramsLoading || isInvoicesLoading;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      {paidInvoices && paidInvoices.totalOverdue > 0 && (
        <Box className="bg-[#e20e0ee1] rounded-xl mb-2 min-h-[80px] mx-5 p-5">
          <VStack>
            <Text className="text-white font-bold text-base">
              Você possui débitos pendentes. Realize o pagamento para evitar a
              interrupção do serviço.
            </Text>
            <Button action="primary" className="mt-5" onPress={handleInvoice}>
              <ButtonText>Ver faturas</ButtonText>
            </Button>
          </VStack>
        </Box>
      )}

      <FlatList
        data={programs || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={{ flex: 1, backgroundColor: "var(--background-0)" }}
        contentContainerStyle={{
          gap: 32,
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2b2b2b9d"]}
            tintColor="#2b2b2b9d"
          />
        }
        ListEmptyComponent={() => (
          <View>
            <Text>Você não tem nenhum programa ativo.</Text>
          </View>
        )}
      />
    </>
  );
};

export default Home;
