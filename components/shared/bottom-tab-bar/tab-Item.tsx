import { BarChart3, History, Home, Settings, User } from "lucide-react-native";

interface TabItem {
  name: string;
  label: string;
  path: "/" | "/profile" | "/history" | "/monotony" | "/settings";
  icon: React.ElementType;
}

const tabItems: TabItem[] = [
  {
    name: "home",
    label: "Home",
    path: "/",
    icon: Home,
  },
  {
    name: "profile",
    label: "Perfil",
    path: "/profile",
    icon: User,
  },
  {
    name: "history",
    label: "Histórico",
    path: "/history",
    icon: History,
  },
  {
    name: "monotony",
    label: "Monotonia",
    path: "/monotony",
    icon: BarChart3,
  },
  {
    name: "settings",
    label: "Configurações",
    path: "/settings",
    icon: Settings,
  },
];

export default tabItems;
