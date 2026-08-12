export type NotificationV2ActionKind =
  | "reply"
  | "download"
  | "open"
  | "mark-as-read";

export type NotificationV2Action = {
  label: string;
  kind: NotificationV2ActionKind;
};

export type NotificationV2Navigation = {
  url: string | null;
  screen: string | null;
  params: Record<string, unknown> | null;
};

export type NotificationV2Metadata = {
  workoutTitle?: string | null;
  workoutSubtitle?: string | null;
  referenceDate?: string | null;
  workoutKind?: string | null;
  finishedId?: number | string | null;
  workoutId?: number | string | null;
  workoutsId?: number | string | null;
  invoiceId?: number | string | null;
  amount?: string | null;
  icon?: string | null;
  actionLabel?: string | null;
  actionKind?: NotificationV2ActionKind | null;
  navigation?: NotificationV2Navigation | null;
  [key: string]: unknown;
};

export type NotificationV2 = {
  id: number;
  type: string;
  variant: string;
  title: string;
  content: string | null;
  referenceDate: string | null;
  referenceDateLabel: string | null;
  createdAt: string;
  createdAtLabel: string;
  readAt: string | null;
  link: string | null;
  icon: string;
  action: NotificationV2Action | null;
  navigation: NotificationV2Navigation | null;
  metadata: NotificationV2Metadata | null;
};
