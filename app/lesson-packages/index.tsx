import Header from "@/components/header";
import {
  FinishedPackageCard,
  PackageSchedule,
  PackageState,
} from "@/components/lesson-packages";
import { useMyLessonPackages } from "@/hooks/useMyLessonPackages";
import { groupLessonPackages } from "@/utils/lesson-packages";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type PackageTab = "active" | "finished";

export default function LessonPackagesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const query = useMyLessonPackages();
  const groups = groupLessonPackages(query.data ?? []);
  const [selectedTab, setSelectedTab] = useState<PackageTab | null>(null);
  const tab =
    selectedTab ??
    (params.tab === "finished" ||
    (!groups.active.length && groups.finished.length)
      ? "finished"
      : "active");

  if (!query.isSessionLoading && !query.isAuthenticated)
    return <Redirect href="/(auth)/(login)" />;

  return (
    <View style={styles.screen}>
      <Header title="Pacotes de aula" backRoute="/(tabs)/(menu)" />
      <View style={styles.tabs} accessibilityRole="tablist">
        {(
          [
            { key: "active", label: "Ativo" },
            { key: "finished", label: "Finalizados" },
          ] as const
        ).map((item) => (
          <TouchableOpacity
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === item.key }}
            onPress={() => setSelectedTab(item.key)}
            style={[styles.tab, tab === item.key && styles.tabSelected]}
          >
            <Text
              style={[
                styles.tabText,
                tab === item.key && styles.tabTextSelected,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => void query.refetch()}
            tintColor="#37DEBC"
            colors={["#37DEBC"]}
          />
        }
      >
        {query.isPending || query.isSessionLoading ? (
          <PackageState loading title="Carregando seus pacotes" />
        ) : query.isError ? (
          <PackageState
            title="Não foi possível carregar os pacotes"
            description="Confira sua conexão e tente novamente."
            onRetry={() => void query.refetch()}
          />
        ) : groups[tab].length === 0 ? (
          <PackageState
            title={
              tab === "active"
                ? "Nenhum pacote ativo"
                : "Nenhum pacote finalizado"
            }
            description={
              tab === "active"
                ? "Seus próximos pacotes aparecerão aqui."
                : "Seu histórico de pacotes aparecerá aqui."
            }
          />
        ) : tab === "active" ? (
          groups.active.map((lessonPackage) => (
            <PackageSchedule
              key={lessonPackage.id}
              lessonPackage={lessonPackage}
            />
          ))
        ) : (
          groups.finished.map((lessonPackage) => (
            <FinishedPackageCard
              key={lessonPackage.id}
              lessonPackage={lessonPackage}
              onPress={() =>
                router.push({
                  pathname: "/lesson-packages/[id]",
                  params: { id: String(lessonPackage.id) },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#07111C" },
  tabs: {
    flexDirection: "row",
    margin: 20,
    padding: 5,
    borderRadius: 16,
    backgroundColor: "#0D1D2E",
    borderWidth: 1,
    borderColor: "#223247",
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 12 },
  tabSelected: { backgroundColor: "rgba(55,222,188,0.14)" },
  tabText: { color: "#9AA8BD", fontSize: 15, fontWeight: "600" },
  tabTextSelected: { color: "#37DEBC" },
  content: { paddingHorizontal: 20, paddingBottom: 32, gap: 20, flexGrow: 1 },
});
