import { VStack } from "@/components/ui/vstack";
import { useLocalSearchParams } from "expo-router";
import HeaderNavigation from "@/components/shared/header-navigation";
import GymView from "../screens/gym-view";
import RunnerView from "../screens/runner-view";
import { useQuery } from "@tanstack/react-query";
import { getWorkout } from "@/services/workouts.service";
import Loading from "@/components/shared/loading";
import { useRouter } from "expo-router";
import { moduleName } from "@/utils/module-name";

const WorkoutView = () => {
  const router = useRouter();
  const { id, type } = useLocalSearchParams();
  const safeId = id as string;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["workoutData", id, type],
    queryFn: async () => await getWorkout(safeId),
    staleTime: 0,
    gcTime: 0,
    enabled: !!id,
  });

  const renderItem = () => {
    if (type === "1") {
      return <RunnerView workout={data} />;
    }
    return <GymView workout={data} />;
  };

  if (error) {
    router.push(`/error/view`);
  }
  return (
    <VStack className="flex-1 bg-background-0">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {data && (
            <>
              <HeaderNavigation title={moduleName(data.title)} />
              {renderItem()}
            </>
          )}
        </>
      )}
    </VStack>
  );
};

export default WorkoutView;
