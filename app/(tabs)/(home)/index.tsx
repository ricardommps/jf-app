// app/(tabs)/(home)/index.tsx
import * as Device from "expo-device";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import FlechinhaAssistant from "@/components/screens/home/flechinha-assistant";
import ProgramCard from "@/components/screens/program/program-card";
import Loading from "@/components/shared/loading";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import YearReview from "@/components/year-review";
import { useSession } from "@/contexts/Authentication";
import { useFlechinhaAssistant } from "@/hooks/useFlechinhaAssistant";
import {
  deviceInfo,
  DeviceInfoPayload,
  getDeviceInfo,
} from "@/services/device-info.service";
import { getTotalPaidInvoices } from "@/services/invoice.service";
import { getPrograms } from "@/services/program.services";
import { PaidInvoices } from "@/types/invoice";
import { useIsFocused } from "@react-navigation/native";
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
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const [hideAssistantUntilRefocus, setHideAssistantUntilRefocus] =
    useState(false);

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
  } = useQuery<PaidInvoices, AxiosError>({
    queryKey: ["other-data"],
    staleTime: 0,
    gcTime: 0,
    queryFn: getTotalPaidInvoices,
    retry: false,
  });

  const runnerProgram = useMemo(
    () => programs?.find((item) => item.type === 1) ?? null,
    [programs],
  );

  const orderedPrograms = useMemo(
    () =>
      [...(programs ?? [])].sort(
        (first, second) => Number(first.type === 3) - Number(second.type === 3),
      ),
    [programs],
  );

  const {
    activeMessage: activeAssistantMessage,
    dismissMessage,
    clickMessage,
    markMessageSeen,
    refetchAssistant,
  } = useFlechinhaAssistant({
    enabled: true,
  });

  const visibleAssistantMessage = hideAssistantUntilRefocus
    ? null
    : activeAssistantMessage;
  const shouldRenderAssistant = !!visibleAssistantMessage && !isProgramsLoading;

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
      if ((error as AxiosError)?.code === "ERR_CANCELED") {
        return;
      }

      console.error("Erro ao verificar informações do dispositivo:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchPrograms(),
        refetchPaidInvoices(),
        refetchAssistant(),
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

  const handleDismissAssistant = async () => {
    if (!visibleAssistantMessage) {
      return;
    }

    await dismissMessage(visibleAssistantMessage.id);
  };

  const handleAssistantCtaPress = async () => {
    if (!visibleAssistantMessage?.cta?.href) {
      return;
    }

    setHideAssistantUntilRefocus(true);

    try {
      await clickMessage(visibleAssistantMessage.id);
      router.push(visibleAssistantMessage.cta.href as any);
    } catch (error) {
      setHideAssistantUntilRefocus(false);
      console.error("Erro ao navegar pelo CTA da Flechinha:", error);
    }
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

  const shouldShowYearReview = () => {
    if (!runnerProgram) return false;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    if (year === 2025 && month === 11 && day >= 29) {
      return true;
    }

    if (year === 2026 && month === 0 && day <= 4) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    void checkAndSyncDeviceInfo();
  }, [customerId]);

  useEffect(() => {
    if (isFocused) {
      setHideAssistantUntilRefocus(false);
    }
  }, [isFocused]);

  useEffect(() => {
    if (!visibleAssistantMessage?.id) {
      return;
    }

    void markMessageSeen(visibleAssistantMessage.id);
  }, [markMessageSeen, visibleAssistantMessage?.id]);

  if (isProgramsLoading || isInvoicesLoading) {
    return (
      <View style={styles.container}>
        <Loading />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {shouldShowYearReview() && runnerProgram && (
        <YearReview programId={runnerProgram.id} />
      )}
      <FlatList
        data={orderedPrograms}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.flatList}
        contentContainerStyle={[
          styles.contentContainer,
          shouldRenderAssistant ? styles.contentContainerWithAssistant : null,
        ]}
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
            {paidInvoices &&
              paidInvoices.totalOverdue > 0 &&
              visibleAssistantMessage?.category !== "financial" && (
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
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />

      {shouldRenderAssistant ? (
        <FlechinhaAssistant
          message={visibleAssistantMessage}
          onClose={handleDismissAssistant}
          onCtaPress={handleAssistantCtaPress}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "var(--background-0)" },
  flatList: { flex: 1 },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexGrow: 1,
  },
  contentContainerWithAssistant: {
    paddingBottom: 24,
  },
  itemSeparator: {
    height: 16,
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
