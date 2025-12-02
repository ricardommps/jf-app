// app/(tabs)/(home)/index.tsx
import * as Device from "expo-device";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ProgramCard from "@/components/screens/program/program-card";
import Loading from "@/components/shared/loading";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { useSession } from "@/contexts/Authentication";
import {
  deviceInfo,
  DeviceInfoPayload,
  getDeviceInfo,
} from "@/services/device-info.service";
import { getTotalPaidInvoices } from "@/services/invoice.service";
import { getPrograms } from "@/services/program.services";
import { PaidInvoices } from "@/types/invoice";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";

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
  const { getProfile } = useSession();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const profile = getProfile();
  const customerId = profile?.id;

  const { mutate: syncDeviceInfo, isPending: isSyncingDevice } = useMutation({
    mutationFn: (payload: DeviceInfoPayload) => deviceInfo(payload),
    onError: (error) => {
      console.error("Erro ao sincronizar informações do dispositivo:", error);
    },
  });

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

  const checkAndSyncDeviceInfo = async () => {
    try {
      if (!customerId) return;

      const currentDeviceInfo: DeviceInfoPayload["info"] = {
        brand: Device.brand || "Unknown",
        model: Device.modelName || "Unknown",
        uniqueId: Device.osBuildId || "Unknown",
        systemVersion: Device.osVersion || "Unknown",
      };

      const savedDeviceInfo = await getDeviceInfo(customerId);

      const hasChanges =
        !savedDeviceInfo ||
        savedDeviceInfo.info.brand !== currentDeviceInfo.brand ||
        savedDeviceInfo.info.model !== currentDeviceInfo.model ||
        savedDeviceInfo.info.uniqueId !== currentDeviceInfo.uniqueId ||
        savedDeviceInfo.info.systemVersion !== currentDeviceInfo.systemVersion;

      if (hasChanges) {
        syncDeviceInfo({ customerId, info: currentDeviceInfo });
      }
    } catch (error) {
      console.error("Erro ao verificar informações do dispositivo:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchPrograms(),
        refetchPaidInvoices(),
        checkAndSyncDeviceInfo(),
      ]);
    } catch (err) {
      throw err;
    } finally {
      setRefreshing(false);
    }
  };

  const handleInvoice = () => {
    router.push(`/invoice` as any);
  };

  const renderItem: ListRenderItem<ProgramItem> = ({ item }) => (
    <ProgramCard
      id={item.id}
      name={item.name}
      pv={item.pv || "N/A"}
      pace={item.pace || "N/A"}
      type={item.type}
      startDate={item.startDate}
      endDate={item.endDate}
    />
  );

  useEffect(() => {
    checkAndSyncDeviceInfo();
  }, [customerId]);

  if (isProgramsLoading || isInvoicesLoading) {
    return (
      <View style={styles.container}>
        <Loading />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={programs || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.flatList}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isSyncingDevice}
            onRefresh={onRefresh}
            colors={["#2b2b2b9d"]}
            tintColor="#2b2b2b9d"
          />
        }
        ListHeaderComponent={() => (
          <>
            {paidInvoices && paidInvoices.totalOverdue > 0 && (
              <Box className="bg-[#e20e0ee1] rounded-xl mb-2 min-h-[80px] p-5">
                <VStack>
                  <Text className="text-white font-bold text-base">
                    Você possui débitos pendentes. Realize o pagamento para
                    evitar a interrupção do serviço.
                  </Text>
                  <Button
                    action="primary"
                    className="mt-5"
                    onPress={handleInvoice}
                  >
                    <ButtonText>Ver faturas</ButtonText>
                  </Button>
                </VStack>
              </Box>
            )}
          </>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Você não tem nenhum programa ativo.
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "var(--background-0)" },
  loadingContainer: { flex: 1, backgroundColor: "var(--background-0)" },
  flatList: { flex: 1 },
  contentContainer: {
    gap: 32,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: { fontSize: 16, color: "#666", textAlign: "center" },
});

export default Home;
