import { Finished } from "./finished";
import { Media } from "./media";
import { Program } from "./program";

export type ExerciseInfo = {
  id: number;
  cadence: string;
  method: string;
  reps: string;
  reset: string;
  rir: string;
  comments: string;
};

export type WorkoutRunner = {
  id: number;
  programId: number;
  name?: string;
  subtitle: string;
  history: History[] | null;
};

export type History = {
  id: number;
  workoutId: number;
  executionDay: string | null;
  distance: string | null;
  duration: string | null;
  pace: string | null;
  link: string | null;
  rpe: number;
  trimp: string | null;
  review: boolean;
  comments: string | null;
  feedback: string | null;
  unrealized: boolean;
  outdoor: boolean;
  intensities: any[];
  unitMeasurement: string | null;
  typeWorkout: string | null;
  checkList: string | null;
  distanceInMeters: string | null;
  durationInSeconds: string | null;
  paceInSeconds: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type MediaInfo = {
  id: number;
  workoutItem: WorkoutItem;
  media: Media;
  mediaId: string;
  method: string | null;
  reps: string | null;
  reset: string | null;
  rir: string | null;
  cadence: string | null;
  comments: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkoutItem = {
  id: string;
  _id: string;
  category: string;
  description: string | null;
  isWorkoutLoad: boolean;
  mediaOrder: any[][];
  medias: Media[];
  mediaInfo: MediaInfo[];
};

export type Workout = {
  id: string;
  programId: number;
  program: Program;
  title: string;
  subtitle: string;
  distance: string;
  link: string;
  description: string;
  heating: string;
  recovery: string;
  displayOrder: string;
  published: boolean;
  hide: boolean;
  finished: boolean;
  unrealized: boolean;
  running: boolean;
  musclesWorked: boolean;
  datePublished: Date;
  workoutDateOther: Date;
  createdAt: Date;
  updatedAt: Date;
  workoutItems: WorkoutItem[];
  history: Finished[];
};
