export type LessonPackageStatus = "active" | "paused" | "finished";
export type LessonClassStatus =
  "scheduled" | "pending" | "finished" | "canceled";
export type LessonClassType = "regular" | "pending" | "barter";

export interface LessonPackageClass {
  id: number;
  scheduledDate: string;
  scheduledTime?: string | null;
  type: LessonClassType;
  status: LessonClassStatus;
  notes?: string | null;
}

export interface LessonPackage {
  id: number;
  title: string;
  description?: string | null;
  warnings?: string | null;
  status: LessonPackageStatus;
  totalAmount: number | string;
  totalLessons: number;
  createdAt?: string;
  classes: LessonPackageClass[];
}
