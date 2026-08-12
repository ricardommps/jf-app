import Header from "@/components/header";
import { TablePaceContent } from "@/components/table-pace";
import { View } from "react-native";

export default function TablePaceScreen() {
  return (
    <View className="flex-1 bg-black">
      <Header title="Tabela - Pace X Km/h" />

      <View className="flex-1 px-4 pb-6 pt-4">
        <TablePaceContent />
      </View>
    </View>
  );
}
