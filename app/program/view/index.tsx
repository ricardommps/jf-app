import { VStack } from "@/components/ui/vstack";
import { useLocalSearchParams } from "expo-router";
import HeaderNavigation from "@/components/shared/header-navigation";
import GymView from "../screens/gym-view";
import RunnerView from "../screens/runner-view";
import { useQuery } from "@tanstack/react-query";
import { getWorkouts } from "@/services/workouts.service";
import Loading from "@/components/shared/loading";
import { useRouter } from "expo-router";

const ProgramView = () => {
  const { id, type } = useLocalSearchParams();
  const safeId = id as string;
  const router = useRouter();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["workoutsData", id, type],
    queryFn: async () => await getWorkouts(Number(safeId), Number(type)),
    enabled: !!id,
  });
  const renderItem = () => {
    if (type === "1") {
      return <RunnerView workouts={data} programId={safeId} />;
    }
    return <GymView />;
  };

  if (error) {
    router.push(`/error/view`);
  }

  return (
    <VStack space="md" className="flex-1 bg-background-0">
      <HeaderNavigation
        variant="search"
        title="Meus treinos"
        label="Search for a city"
      />
      {isLoading ? <Loading /> : <>{data?.length && renderItem()}</>}
    </VStack>
  );
};

export default ProgramView;
