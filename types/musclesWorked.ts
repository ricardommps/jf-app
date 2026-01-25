export type MusclesWorked = {
  id: string;
  mediaId: string;
  musclesId: number[];
};

export interface Muscle {
  id: number;
  muscle: string;
  tags: string[];
  activeColor?: string;
}
