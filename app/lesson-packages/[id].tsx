import Header from "@/components/header";
import { PackageSchedule, PackageState } from "@/components/lesson-packages";
import { useMyLessonPackages } from "@/hooks/useMyLessonPackages";
import { Redirect, useLocalSearchParams } from "expo-router";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function LessonPackageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useMyLessonPackages();
  const lessonPackage = query.data?.find((item) => String(item.id) === id);

  if (!query.isSessionLoading && !query.isAuthenticated)
    return <Redirect href="/(auth)/(login)" />;

  return (
    <View style={styles.screen}>
      <Header
        title="Pacotes de aula"
        backRoute="/lesson-packages?tab=finished"
      />
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
          <PackageState loading title="Carregando pacote" />
        ) : query.isError ? (
          <PackageState
            title="Não foi possível carregar o pacote"
            description="Confira sua conexão e tente novamente."
            onRetry={() => void query.refetch()}
          />
        ) : lessonPackage ? (
          <>
            <Text accessibilityRole="header" style={styles.heading}>
              {lessonPackage.status === "finished"
                ? "Pacote finalizado"
                : "Detalhes do pacote"}
            </Text>
            <PackageSchedule lessonPackage={lessonPackage} />
          </>
        ) : (
          <PackageState
            title="Pacote não encontrado"
            description="Este pacote não está disponível na sua conta."
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#07111C" },
  content: { padding: 20, paddingBottom: 32, gap: 20, flexGrow: 1 },
  heading: {
    color: "#F7F8FA",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
