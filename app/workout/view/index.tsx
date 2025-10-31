import HeaderNavigation from "@/components/shared/header-navigation";
import Loading from "@/components/shared/loading";
import { VStack } from "@/components/ui/vstack";
import { getWorkout } from "@/services/workouts.service";
import { moduleName } from "@/utils/module-name";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import GymView from "../screens/gym-view";
import RunnerView from "../screens/runner-view";

const WorkoutView = () => {
  const { id, type } = useLocalSearchParams();
  const safeId = id as string;

  const { data, isLoading } = useQuery({
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

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
};

export default WorkoutView;
