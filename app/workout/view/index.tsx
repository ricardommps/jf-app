import { VStack } from "@/components/ui/vstack";
import { useLocalSearchParams } from "expo-router";
import HeaderNavigation from "@/components/shared/header-navigation";
import GymView from "../screens/gym-view";
import RunnerView from "../screens/runner-view";

const WorkoutView = () => {
  const { id } = useLocalSearchParams();
  const renderItem = () => {
    if (id === "8") {
      return <RunnerView />;
    }
    return <GymView />;
  };
  return (
    <VStack className="flex-1 bg-background-0">
      <HeaderNavigation
        variant="search"
        title="Peitoral e dorsais"
        label="Search for a city"
      />
      {renderItem()}
    </VStack>
  );
};

export default WorkoutView;
