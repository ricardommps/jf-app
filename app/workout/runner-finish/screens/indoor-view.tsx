import IndoorScreen from "./indoor";
import IndoorSimpleScreen from "./indoor-simple";
import UnrealizedFinishView from "./unrealized-finished";

interface Props {
  safeId: string;
  intensitie: boolean;
  unrealizedTrainingBool: boolean;
  titleStr?: string;
  editFinishedId?: string;
}

const IndoorViewScreen = ({
  safeId,
  intensitie = false,
  unrealizedTrainingBool = false,
  titleStr,
  editFinishedId,
}: Props) => {
  if (unrealizedTrainingBool) {
    return <UnrealizedFinishView safeId={safeId} />;
  }
  if (!intensitie) {
    return (
      <IndoorSimpleScreen
        safeId={safeId}
        titleStr={titleStr}
        editFinishedId={editFinishedId}
      />
    );
  }

  return (
    <IndoorScreen
      safeId={safeId}
      titleStr={titleStr}
        editFinishedId={editFinishedId}
    />
  );
};

export default IndoorViewScreen;
