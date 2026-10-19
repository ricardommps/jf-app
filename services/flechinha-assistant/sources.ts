import { resolveNotificationV2Href } from "@/app/notifications-v2/components/notification-v2-navigation";
import { getFlechinhaWeekKey } from "@/services/flechinha-assistant/weekly";
import {
  FLECHINHA_ASSISTANT_PRIORITIES,
  FlechinhaAssistantMessage,
} from "@/types/flechinha-assistant";
import { Invoice } from "@/types/invoice";
import { NotificationV2 } from "@/types/notification-v2";
import { Workout } from "@/types/workout";
import {
  isFeedbackNotification,
  isLessonPackageNotification,
} from "@/utils/notification-v2";

type FlechinhaAssistantSourcesInput = {
  invoices?: Invoice[] | null;
  notifications?: NotificationV2[] | null;
  runnerProgramId?: number | null;
  workouts?: Workout[] | null;
  stravaConnected?: boolean | null;
  showWeeklyGreeting?: boolean;
  showWeeklyCompletion?: boolean;
  showWeekendGreeting?: boolean;
};

const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

const toLocalDateString = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const localTime = new Date(date.getTime() - offsetMs);
  return localTime.toISOString().split("T")[0];
};

const toTimestamp = (value?: string | null) => {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const sortInvoicesByDueDate = (invoices: Invoice[]) =>
  [...invoices].sort(
    (left, right) => toTimestamp(left.dueDate) - toTimestamp(right.dueDate),
  );

const sortNotificationsByCreatedAt = (notifications: NotificationV2[]) =>
  [...notifications].sort(
    (left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt),
  );

const getWorkoutScheduledDate = (workout: Workout) => {
  const scheduledDate = (workout.workoutDateOther ||
    workout.datePublished) as unknown;

  if (typeof scheduledDate === "string") {
    return scheduledDate.slice(0, 10);
  }

  return toLocalDateString(scheduledDate as Date);
};

const buildWorkoutLabel = (workout: Workout) => {
  const title = workout.title?.trim();
  const subtitle = workout.subtitle?.trim();

  if (title && subtitle) {
    return `${title} - ${subtitle}`;
  }

  return title || subtitle || "treino";
};

const getInvoiceReferenceLabel = (invoice: Invoice) => {
  const dueDate = new Date(invoice.dueDate);

  if (Number.isNaN(dueDate.getTime())) {
    return "mês de referência";
  }

  return `mês de ${MONTH_NAMES[dueDate.getMonth()]}`;
};

const isInvoiceDueTomorrow = (invoice: Invoice) => {
  const invoiceDueDate = toLocalDateString(invoice.dueDate);
  const tomorrow = toLocalDateString(addDays(new Date(), 1));

  return invoiceDueDate === tomorrow;
};

const buildFinancialMessage = (invoices?: Invoice[] | null) => {
  if (!invoices?.length) {
    return null;
  }

  const overdueInvoices = sortInvoicesByDueDate(
    invoices.filter((invoice) => invoice.status === "overdue"),
  );

  if (overdueInvoices.length) {
    const primaryInvoice = overdueInvoices[0];
    const referenceLabel = getInvoiceReferenceLabel(primaryInvoice);

    return {
      id: `financial-overdue:${overdueInvoices.map((invoice) => invoice.id).join("-")}`,
      category: "financial",
      priority: FLECHINHA_ASSISTANT_PRIORITIES.financial,
      title:
        overdueInvoices.length > 1 ? "Faturas em atraso" : "Fatura em atraso",
      message:
        overdueInvoices.length > 1
          ? `Você tem ${overdueInvoices.length} faturas em atraso. Verifique agora para evitar interrupção do serviço.`
          : `Sua fatura referente ao ${referenceLabel} está em atraso. Verifique agora para evitar interrupção do serviço.`,
      mood: "brava",
      cta: {
        label: "Ver faturas",
        href: "/invoice",
      },
      createdAt: primaryInvoice.updatedAt || primaryInvoice.dueDate,
      metadata: {
        invoiceIds: overdueInvoices.map((invoice) => invoice.id),
        status: "overdue",
      },
    } satisfies FlechinhaAssistantMessage;
  }

  const pendingInvoices = sortInvoicesByDueDate(
    invoices.filter(
      (invoice) =>
        invoice.status === "pending" && isInvoiceDueTomorrow(invoice),
    ),
  );

  if (!pendingInvoices.length) {
    return null;
  }

  const primaryInvoice = pendingInvoices[0];
  const referenceLabel = getInvoiceReferenceLabel(primaryInvoice);

  return {
    id: `financial-pending:${pendingInvoices.map((invoice) => invoice.id).join("-")}`,
    category: "financial",
    priority: FLECHINHA_ASSISTANT_PRIORITIES.financial,
    title: pendingInvoices.length > 1 ? "Faturas pendentes" : "Fatura pendente",
    message:
      pendingInvoices.length > 1
        ? `Lembrando que você tem ${pendingInvoices.length} faturas com vencimento amanhã.`
        : `Lembrando que sua fatura referente ao ${referenceLabel} vence amanhã.`,
    mood: "alerta",
    cta: {
      label: "Ver faturas",
      href: "/invoice",
    },
    createdAt: primaryInvoice.updatedAt || primaryInvoice.dueDate,
    metadata: {
      invoiceIds: pendingInvoices.map((invoice) => invoice.id),
      status: "pending",
    },
  } satisfies FlechinhaAssistantMessage;
};

const resolveNotificationCtaLabel = (
  notification: NotificationV2,
  href: string,
) => {
  if (isLessonPackageNotification(notification)) {
    return href === "/lesson-packages" ? "Ver pacotes" : "Ver pacote";
  }

  if (notification.action?.label?.trim()) {
    return notification.action.label.trim();
  }

  if (href.startsWith("/notifications-v2")) {
    return "Ver notificações";
  }

  if (href.startsWith("/invoice")) {
    return "Ver fatura";
  }

  if (href.startsWith("/workout") || href.startsWith("/program/view")) {
    return "Ver treino";
  }

  return "Ver agora";
};

const buildFeedbackSummaryMessage = (
  feedbackNotifications: NotificationV2[],
): FlechinhaAssistantMessage => {
  const newestFeedback = feedbackNotifications[0];

  return {
    id: `notification-feedback-group:${feedbackNotifications.map((notification) => notification.id).join("-")}`,
    category: "notification",
    priority: FLECHINHA_ASSISTANT_PRIORITIES.notification,
    title: "Novos feedbacks",
    message: `Você tem ${feedbackNotifications.length} novos feedbacks para acompanhar.`,
    mood: "anuncio",
    cta: {
      label: "Ver notificações",
      href: "/notifications-v2",
    },
    createdAt: newestFeedback.createdAt,
    metadata: {
      notificationIds: feedbackNotifications.map(
        (notification) => notification.id,
      ),
      unreadCount: feedbackNotifications.length,
      variant: "feedback-group",
    },
  } satisfies FlechinhaAssistantMessage;
};

const buildNotificationMessage = (notifications?: NotificationV2[] | null) => {
  if (!notifications?.length) {
    return null;
  }

  const unreadNotifications = sortNotificationsByCreatedAt(
    notifications.filter((notification) => !notification.readAt),
  );

  if (!unreadNotifications.length) {
    return null;
  }

  const unreadFeedbackNotifications = unreadNotifications.filter(
    isFeedbackNotification,
  );

  if (unreadFeedbackNotifications.length > 1) {
    return buildFeedbackSummaryMessage(unreadFeedbackNotifications);
  }

  const currentNotification =
    unreadFeedbackNotifications.length === 1
      ? unreadFeedbackNotifications[0]
      : unreadNotifications[0];

  const href =
    resolveNotificationV2Href(currentNotification) || "/notifications-v2";
  const normalizedContent = currentNotification.content?.trim();
  const isPackage = isLessonPackageNotification(currentNotification);

  return {
    id: `notification:${currentNotification.id}`,
    category: isPackage ? "lessonPackage" : "notification",
    priority: isPackage
      ? FLECHINHA_ASSISTANT_PRIORITIES.lessonPackage
      : FLECHINHA_ASSISTANT_PRIORITIES.notification,
    title: currentNotification.title?.trim() || "Nova notificação",
    message:
      normalizedContent ||
      (unreadNotifications.length > 1
        ? `Você tem ${unreadNotifications.length} notificações pendentes.`
        : "Você recebeu uma nova notificação."),
    mood: unreadNotifications.length > 1 ? "anuncio" : "piscando",
    cta: {
      label: resolveNotificationCtaLabel(currentNotification, href),
      href,
    },
    createdAt: currentNotification.createdAt,
    metadata: {
      notificationId: currentNotification.id,
      unreadCount: unreadNotifications.length,
      variant: isLessonPackageNotification(currentNotification)
        ? "lesson-package"
        : currentNotification.variant,
    },
  } satisfies FlechinhaAssistantMessage;
};

const buildTrainingMessage = (
  runnerProgramId?: number | null,
  workouts?: Workout[] | null,
) => {
  if (!runnerProgramId || !workouts?.length) {
    return null;
  }

  const today = toLocalDateString(new Date());
  const unfinishedWorkouts = workouts.filter((workout) => !workout.finished);

  if (!unfinishedWorkouts.length) {
    return null;
  }

  const overdueWorkouts = unfinishedWorkouts
    .filter((workout) => getWorkoutScheduledDate(workout) < today)
    .sort(
      (left, right) =>
        toTimestamp(getWorkoutScheduledDate(left)) -
        toTimestamp(getWorkoutScheduledDate(right)),
    );

  const programHref = `/program/view?id=${runnerProgramId}&type=1`;

  if (overdueWorkouts.length) {
    const primaryWorkout = overdueWorkouts[0];

    return {
      id: `training-overdue:${overdueWorkouts.map((workout) => workout.id).join("-")}`,
      category: "training",
      priority: FLECHINHA_ASSISTANT_PRIORITIES.training,
      title:
        overdueWorkouts.length > 1 ? "Treinos atrasados" : "Treino atrasado",
      message:
        overdueWorkouts.length > 1
          ? `Você tem ${overdueWorkouts.length} treinos pendentes aguardando realização.`
          : `Seu treino ${buildWorkoutLabel(primaryWorkout)} ainda está pendente.`,
      mood: "alerta",
      cta: {
        label: "Ver treinos",
        href: programHref,
      },
      createdAt: String(primaryWorkout.datePublished ?? ""),
      metadata: {
        workoutIds: overdueWorkouts.map((workout) => workout.id),
        status: "overdue",
      },
    } satisfies FlechinhaAssistantMessage;
  }

  const todayWorkouts = unfinishedWorkouts.filter(
    (workout) => getWorkoutScheduledDate(workout) === today,
  );

  if (!todayWorkouts.length) {
    return null;
  }

  const primaryWorkout = todayWorkouts[0];

  return {
    id: `training-today:${todayWorkouts.map((workout) => workout.id).join("-")}`,
    category: "training",
    priority: FLECHINHA_ASSISTANT_PRIORITIES.training,
    title: "Treino do dia",
    message:
      todayWorkouts.length > 1
        ? `Você tem ${todayWorkouts.length} treinos programados para hoje.`
        : `Seu treino ${buildWorkoutLabel(primaryWorkout)} está pronto para hoje.`,
    mood: "ola-acenando",
    cta: {
      label: "Ver treinos",
      href: programHref,
    },
    createdAt: String(primaryWorkout.datePublished ?? ""),
    metadata: {
      workoutIds: todayWorkouts.map((workout) => workout.id),
      status: "today",
    },
  } satisfies FlechinhaAssistantMessage;
};

const buildWeeklyCompletionMessage = (showWeeklyCompletion?: boolean) => {
  if (!showWeeklyCompletion) {
    return null;
  }

  const weekStart = getFlechinhaWeekKey();

  return {
    id: "achievement:weekly-completion:" + weekStart,
    category: "reminder",
    priority: 0,
    title: "Bom trabalho! Você finalizou todos os treinos da semana!",
    message: "",
    mood: "comemorando",
    cta: null,
    createdAt: new Date().toISOString(),
    metadata: {
      type: "weekly-completion",
      weekStart,
    },
  } satisfies FlechinhaAssistantMessage;
};

const buildWeeklyGreetingMessage = (showWeeklyGreeting?: boolean) => {
  if (!showWeeklyGreeting) {
    return null;
  }

  return {
    id: "reminder:weekly-start",
    category: "reminder",
    priority: 0,
    title: "Boa semana de treinos!",
    message: "",
    mood: "feliz",
    cta: null,
    createdAt: new Date().toISOString(),
    metadata: {
      type: "weekly-start",
    },
  } satisfies FlechinhaAssistantMessage;
};

const buildWeekendGreetingMessage = (showWeekendGreeting?: boolean) => {
  if (!showWeekendGreeting) {
    return null;
  }

  return {
    id: "reminder:weekend-start",
    category: "reminder",
    priority: 0,
    title: "Que bom que você vai treinar no final de semana!",
    message: "",
    mood: "feliz",
    cta: null,
    createdAt: new Date().toISOString(),
    metadata: {
      type: "weekend-start",
    },
  } satisfies FlechinhaAssistantMessage;
};

const buildReminderMessage = (
  runnerProgramId?: number | null,
  stravaConnected?: boolean | null,
) => {
  if (!runnerProgramId || stravaConnected !== false) {
    return null;
  }

  return {
    id: "reminder:strava-connect",
    category: "reminder",
    priority: FLECHINHA_ASSISTANT_PRIORITIES.reminder,
    title: "Conecte seu Strava",
    message:
      "Sincronize seus treinos com o Strava para acompanhar sua evolução com mais facilidade.",
    mood: "ideia",
    cta: {
      label: "Conectar agora",
      href: "/stravaConnect",
    },
    createdAt: null,
    metadata: {
      type: "strava-connect",
    },
  } satisfies FlechinhaAssistantMessage;
};

export const buildFlechinhaAssistantMessages = ({
  invoices,
  notifications,
  runnerProgramId,
  workouts,
  stravaConnected,
  showWeeklyGreeting,
  showWeeklyCompletion,
  showWeekendGreeting,
}: FlechinhaAssistantSourcesInput): FlechinhaAssistantMessage[] => {
  const weeklyCompletionMessage =
    buildWeeklyCompletionMessage(showWeeklyCompletion);

  const packageNotifications = sortNotificationsByCreatedAt(
    (notifications ?? []).filter(
      (notification) =>
        !notification.readAt && isLessonPackageNotification(notification),
    ),
  );

  const messages: (FlechinhaAssistantMessage | null)[] = [
    buildFinancialMessage(invoices),
    ...packageNotifications.map((notification) =>
      buildNotificationMessage([notification]),
    ),
    buildNotificationMessage(
      notifications?.filter(
        (notification) => !isLessonPackageNotification(notification),
      ),
    ),
    buildTrainingMessage(runnerProgramId, workouts),
    buildReminderMessage(runnerProgramId, stravaConnected),
    weeklyCompletionMessage,
    buildWeeklyGreetingMessage(showWeeklyGreeting),
    buildWeekendGreetingMessage(
      showWeekendGreeting && !weeklyCompletionMessage,
    ),
  ];

  return messages.filter(
    (message): message is FlechinhaAssistantMessage => message != null,
  );
};
