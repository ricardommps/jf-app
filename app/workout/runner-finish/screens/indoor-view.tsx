import IndoorSimpleScreen from "./indoor-simple";
import IndoorScreen from "./indoor";
import UnrealizedFinishView from "./unrealized-finished";

interface Props {
  safeId: string;
  intensitie: boolean;
  unrealizedTrainingBool: boolean;
}

const IndoorViewScreen = ({
  safeId,
  intensitie = false,
  unrealizedTrainingBool = false,
}: Props) => {
  if (unrealizedTrainingBool) {
    return <UnrealizedFinishView safeId={safeId} />;
  }
  if (!intensitie) {
    return <IndoorSimpleScreen safeId={safeId} />;
  }

  return <IndoorScreen safeId={safeId} />;
};

export default IndoorViewScreen;
