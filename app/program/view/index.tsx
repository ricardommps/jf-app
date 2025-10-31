import HeaderNavigation from "@/components/shared/header-navigation";
import Loading from "@/components/shared/loading";
import { VStack } from "@/components/ui/vstack";
import { getWorkouts } from "@/services/workouts.service";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import GymView from "../screens/gym-view";
import RunnerView from "../screens/runner-view";

const ProgramView = () => {
  const { id, type } = useLocalSearchParams();
  const safeId = id as string;
  const { data, isLoading } = useQuery({
    queryKey: ["workoutsData", id, type],
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => await getWorkouts(Number(safeId), Number(type)),
    enabled: !!id,
  });
  const renderItem = () => {
    if (type === "1") {
      return <RunnerView workouts={data} programId={safeId} />;
    }
    return <GymView workouts={data} programId={safeId} />;
  };

  return (
    <VStack space="md" className="flex-1 bg-background-0">
      <HeaderNavigation title="Meus treinos" />
      {isLoading ? <Loading /> : <>{data?.length && renderItem()}</>}
    </VStack>
  );
};

export default ProgramView;
