import Header from "@/components/header";
import Loading from "@/components/shared/loading";
import { getWorkouts } from "@/services/workouts.service";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
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
    <View className="flex-1 bg-black">
      <Header title="Meus treinos" />
      {isLoading ? <Loading /> : <>{data?.length && renderItem()}</>}
    </View>
  );
};

export default ProgramView;
