import { useLocalSearchParams as useExpoLocalSearchParams } from "expo-router";
import OutdoorScreen from "./screens/outdoor";
import IndoorViewScreen from "./screens/indoor-view";

interface Params {
  id?: string;
  outdoor?: "true" | "false"; // vem string, vamos converter depois
  intensities?: "true" | "false"; // idem
  unrealizedTraining?: "true" | "false"; // idem
  title?: string;
  subtitle?: string;
}

function useLocalSearchParams(): Params {
  return useExpoLocalSearchParams() as Params;
}

const RunnerFinishView = () => {
  const { id, outdoor, intensities, unrealizedTraining, title, subtitle } =
    useLocalSearchParams();
  const safeId = id ?? "";
  const outdoorBool = outdoor === "true";
  const intensitiesBool = intensities === "true";
  const unrealizedTrainingBool = unrealizedTraining === "true" ? true : false;
  const titleStr = title ?? "";
  if (outdoorBool) {
    return (
      <OutdoorScreen safeId={safeId} titleStr={titleStr} subtitle={subtitle} />
    );
  }
  return (
    <IndoorViewScreen
      safeId={safeId}
      intensitie={intensitiesBool}
      unrealizedTrainingBool={unrealizedTrainingBool}
      titleStr={titleStr}
    />
  );
};

export default RunnerFinishView;
