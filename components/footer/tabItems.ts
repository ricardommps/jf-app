import { BarChart3, History, Home, Menu } from "lucide-react-native";

export interface TabItem {
  name: "(home)" | "(profile)" | "(history)" | "(monotony)" | "(menu)";
  label: string;
  icon: React.ElementType;
}

const tabItems: TabItem[] = [
  { name: "(home)", label: "Home", icon: Home },
  { name: "(history)", label: "Histórico", icon: History },
  { name: "(monotony)", label: "Monotonia", icon: BarChart3 },

  { name: "(menu)", label: "Configurações", icon: Menu },
];

export default tabItems;
