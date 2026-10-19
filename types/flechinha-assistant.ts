export const FLECHINHA_ASSISTANT_PRIORITIES = {
  financial: 1,
  lessonPackage: 2,
  notification: 3,
  training: 4,
  reminder: 5,
} as const;

export type FlechinhaAssistantCategory =
  keyof typeof FLECHINHA_ASSISTANT_PRIORITIES;

export const FLECHINHA_ASSISTANT_MOODS = [
  "ola-acenando",
  "piscando",
  "feliz",
  "pensativa",
  "anuncio",
  "ideia",
  "alerta",
  "brava",
  "triste",
  "comemorando",
  "carinho",
  "tchau",
  "comemorando-medalha",
] as const;

export type FlechinhaAssistantMood = (typeof FLECHINHA_ASSISTANT_MOODS)[number];

export type FlechinhaAssistantStatus = "seen" | "dismissed" | "clicked";

export type FlechinhaAssistantCta = {
  label: string;
  href: string;
};

export type FlechinhaAssistantMessage = {
  id: string;
  category: FlechinhaAssistantCategory;
  priority: number;
  title: string;
  message: string;
  mood: FlechinhaAssistantMood;
  cta: FlechinhaAssistantCta | null;
  createdAt?: string | null;
  expiresAt?: string | null;
  metadata?: Record<string, unknown>;
};

export type FlechinhaAssistantMessageState = {
  status: FlechinhaAssistantStatus;
  updatedAt: string;
};

export type FlechinhaAssistantPersistedState = {
  version: 1;
  messages: Record<string, FlechinhaAssistantMessageState>;
};

export type FlechinhaAssistantQueue = {
  activeMessage: FlechinhaAssistantMessage | null;
  queuedMessages: FlechinhaAssistantMessage[];
};
