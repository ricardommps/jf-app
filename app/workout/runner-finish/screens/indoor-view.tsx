import IndoorScreen from "./indoor";
import IndoorSimpleScreen from "./indoor-simple";
import UnrealizedFinishView from "./unrealized-finished";

interface Props {
  safeId: string;
  intensitie: boolean;
  unrealizedTrainingBool: boolean;
  titleStr?: string;
}

const IndoorViewScreen = ({
  safeId,
  intensitie = false,
  unrealizedTrainingBool = false,
  titleStr,
}: Props) => {
  if (unrealizedTrainingBool) {
    return <UnrealizedFinishView safeId={safeId} />;
  }
  if (!intensitie) {
    return <IndoorSimpleScreen safeId={safeId} titleStr={titleStr} />;
  }

  return <IndoorScreen safeId={safeId} titleStr={titleStr} />;
};

export default IndoorViewScreen;
