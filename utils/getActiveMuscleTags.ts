import type { Muscle } from "@/types/musclesWorked"; // ajuste o path se necessário
import { muscles } from "@/utils/muscles";

/**
 * Retorna os IDs SVG ativos a partir dos músculos trabalhados
 */
export function getActiveSvgIds(musclesId: number[]): string[] {
  return muscles
    .filter((m: Muscle) => musclesId.includes(m.id))
    .flatMap((m: Muscle) => m.tags);
}

/**
 * Retorna os nomes dos músculos
 */
export function getMuscleNames(musclesId: number[]): string[] {
  return muscles
    .filter((m: Muscle) => musclesId.includes(m.id))
    .map((m: Muscle) => m.muscle);
}

/**
 * Retorna os objetos de músculos ativos
 */
export const getActiveMuscles = (musclesWorked: number[]): Muscle[] => {
  return muscles.filter((m: Muscle) => musclesWorked.includes(m.id));
};
