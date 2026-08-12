import { ExtrapolativeValidityContent } from "@/components/extrapolative-validity";
import Header from "@/components/header";
import Loading from "@/components/shared/loading";
import { Text } from "@/components/ui/text";
import { getProgram, runnerProgram } from "@/services/program.services";
import { extrapolation } from "@/utils/extrapolation";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";

interface RunnerProgramSummary {
  id: number;
}

export default function ExtrapolativeValidityScreen() {
  const params = useLocalSearchParams<{ programId?: string }>();
  const programIdFromRoute =
    typeof params.programId === "string" ? params.programId : undefined;

  const { data: runnerPrograms, isLoading: isRunnerProgramLoading } = useQuery<
    RunnerProgramSummary[]
  >({
    queryKey: ["runnerProgram", "extrapolative-validity-screen"],
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
    queryKey: ["programData", resolvedProgramId, "extrapolative-validity"],
    queryFn: () => getProgram(resolvedProgramId as string),
    enabled: !!resolvedProgramId,
    retry: false,
  });

  const currentExtrapolation = useMemo(() => {
    if (!programData?.pv) {
      return null;
    }

    const key = String(programData.pv) as keyof typeof extrapolation;
    return extrapolation[key] ?? null;
  }, [programData?.pv]);

  if (isRunnerProgramLoading || isProgramLoading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-black">
      <Header title="Validade Extrapolativa" />

      <ScrollView className="flex-1 px-4 pb-6 pt-4">
        {resolvedProgramId ? (
          <ExtrapolativeValidityContent
            currentExtrapolation={currentExtrapolation}
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
