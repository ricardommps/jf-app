import { ExertionZoneContent } from "@/components/exertion-zone/indx";
import Header from "@/components/header";
import Loading from "@/components/shared/loading";
import { Text } from "@/components/ui/text";
import { getProgram, runnerProgram } from "@/services/program.services";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";

interface RunnerProgramSummary {
  id: number;
}

export default function ExertionZoneScreen() {
  const params = useLocalSearchParams<{ programId?: string }>();
  const programIdFromRoute =
    typeof params.programId === "string" ? params.programId : undefined;

  const { data: runnerPrograms, isLoading: isRunnerProgramLoading } = useQuery<
    RunnerProgramSummary[]
  >({
    queryKey: ["runnerProgram", "exertion-zone-screen"],
    queryFn: runnerProgram,
    enabled: !programIdFromRoute,
    retry: false,
  });

  const resolvedProgramId = useMemo(() => {
    if (programIdFromRoute) {
      return programIdFromRoute;
    }

    const fallbackProgram = Array.isArray(runnerPrograms)
      ? runnerPrograms[0]
      : undefined;

    return fallbackProgram?.id ? String(fallbackProgram.id) : undefined;
  }, [programIdFromRoute, runnerPrograms]);

  const { data: programData, isLoading: isProgramLoading } = useQuery({
    queryKey: ["programData", resolvedProgramId, "exertion-zone"],
    queryFn: () => getProgram(resolvedProgramId as string),
    enabled: !!resolvedProgramId,
    retry: false,
  });

  if (isRunnerProgramLoading || isProgramLoading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-black">
      <Header title="Zona de esforço" />

      <ScrollView className="flex-1 px-4 pb-6 pt-4">
        {resolvedProgramId && programData ? (
          <ExertionZoneContent
            data={{
              pv: programData.pv,
              pace: programData.pace,
              vla: programData.vla,
              paceVla: programData.paceVla,
              vlan: programData.vlan,
              paceVlan: programData.paceVlan,
            }}
          />
        ) : (
          <View className="mt-6 rounded-xl bg-[#2b2b2b9d] p-4">
            <Text className="text-base text-gray-300">
              Nenhum programa de corrida ativo encontrado.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
