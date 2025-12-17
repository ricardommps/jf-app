import Header from "@/components/header";
import Loading from "@/components/shared/loading";
import { getWorkout } from "@/services/workouts.service";
import { moduleName } from "@/utils/module-name";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
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
    // <SafeAreaProvider>
    //   <VStack className="flex-1 bg-background-0">
    //     {isLoading ? (
    //       <Loading />
    //     ) : (
    //       <>
    //         {data && (
    //           <>
    //             <HeaderNavigation title={moduleName(data.title)} />
    //             {renderItem()}
    //           </>
    //         )}
    //       </>
    //     )}
    //   </VStack>
    // </SafeAreaProvider>
    <View className="flex-1 bg-black">
      <Header title={data?.title ? moduleName(data?.title) : "Carregando"} />
      {isLoading ? <Loading /> : <>{data && renderItem()}</>}
    </View>
  );
};

export default WorkoutView;
