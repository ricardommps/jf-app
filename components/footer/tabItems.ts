import { BarChart3, History, Home } from "lucide-react-native";

export interface TabItem {
  name: "(home)" | "(profile)" | "(history)" | "(monotony)";
  label: string;
  icon: React.ElementType;
}

const tabItems: TabItem[] = [
  { name: "(home)", label: "Home", icon: Home },
  { name: "(history)", label: "Histórico", icon: History },
  { name: "(monotony)", label: "Monotonia", icon: BarChart3 },

];

export default tabItems;
