export interface HistoryItem {
  id: number;

  executionDay: string;
  createdAt: string;
  updatedAt: string;

  feedback: string | null;
  review: boolean;
  unrealized: boolean;

  programId: number;
  programName: string;
  month: string | null;
  difficulty: string;
  goal: string;
  type: number;
  pv: string;
  programpace: string;

  trainingId: string;
  trainingName: string;
  trainingSubtitle: string;
  trainingDesc: string;
  trainingRunning: boolean;
  trainingDatePublished: string;

  workoutId: number | null;
  workoutsId: string | null;

  distance: string | null;
  distanceInMeters: string | null;

  duration: string | null;
  durationInSeconds: string | null;

  pace: string | null;
  paceInSeconds: string | null;

  trimp: string | number | null;
  rpe: number | null;

  intensities: string[] | null;

  warmUpDuration: string | null;
  warmUpIntensities: string | null;

  coolDownDuration: string | null;
  coolDownIntensities: string | null;

  outdoor: boolean;
  typeWorkout: string | null;
  unitmeasurement: string | null;

  link: string | null;

  checkList: any | null;

  comments: Comment[];
}
