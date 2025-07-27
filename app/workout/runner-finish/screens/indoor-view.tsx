import IndoorSimpleScreen from "./indoor-simple";
import IndoorScreen from "./indoor";

interface Props {
  safeId: string;
  intensitie: boolean;
}

const IndoorViewScreen = ({ safeId, intensitie = false }: Props) => {
  if (!intensitie) {
    return <IndoorSimpleScreen safeId={safeId} />;
  }

  return <IndoorScreen safeId={safeId} />;
};

export default IndoorViewScreen;
