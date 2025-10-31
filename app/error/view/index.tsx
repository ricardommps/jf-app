import { VStack } from "@/components/ui/vstack";
import ErrorScreen from "../screens/error-view";

const ErrorView = () => {
  return (
    <VStack space="md" className="flex-1 bg-background-0">
      <ErrorScreen />
    </VStack>
  );
};

export default ErrorView;
