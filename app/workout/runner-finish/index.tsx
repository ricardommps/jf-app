import { useLocalSearchParams as useExpoLocalSearchParams } from "expo-router";
import OutdoorScreen from "./screens/outdoor";
import IndoorViewScreen from "./screens/indoor-view";

interface Params {
  id?: string;
  outdoor?: "true" | "false"; // vem string, vamos converter depois
  intensities?: "true" | "false"; // idem
}

function useLocalSearchParams(): Params {
  return useExpoLocalSearchParams() as Params;
}

const RunnerFinishView = () => {
  const { id, outdoor, intensities } = useLocalSearchParams();

  const safeId = id ?? "";
  const outdoorBool = outdoor === "true";
  const intensitiesBool = intensities === "true";
  if (outdoorBool) {
    return <OutdoorScreen safeId={safeId} />;
  }
  return <IndoorViewScreen safeId={safeId} intensitie={intensitiesBool} />;
};

export default RunnerFinishView;
