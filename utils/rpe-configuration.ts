import {
  HappyIcon,
  VeryHappyIcon,
  NeutralIcon,
  SadIcon,
  VerySadIcon,
} from "@/components/ui/icon";

export const rpeConfiguration = [
  {
    value: 10,
    color: "bg-red-600/60",
    label: "Extremamente pesado",
    icon: VerySadIcon,
  },
  { value: 9, color: "bg-orange-800/60", label: "", icon: SadIcon },
  { value: 8, color: "bg-orange-700/60", label: "", icon: SadIcon },
  {
    value: 7,
    color: "bg-orange-600/60",
    label: "Muito pesado",
    icon: SadIcon,
  },
  { value: 6, color: "bg-orange-500/60", label: "", icon: NeutralIcon },
  { value: 5, color: "bg-amber-400/60", label: "Pesado", icon: NeutralIcon },
  {
    value: 4,
    color: "bg-yellow-400/60",
    label: "Um pouquinho pesado",
    icon: NeutralIcon,
  },
  { value: 3, color: "bg-yellow-300/60", label: "Moderado", icon: HappyIcon },
  { value: 2, color: "bg-lime-400/60", label: "Leve", icon: VeryHappyIcon },
  {
    value: 1,
    color: "bg-green-500/60",
    label: "Muito Leve",
    icon: VeryHappyIcon,
  },
  {
    value: 0,
    color: "bg-green-600/60",
    label: "Repouso",
    icon: VeryHappyIcon,
  },
];
