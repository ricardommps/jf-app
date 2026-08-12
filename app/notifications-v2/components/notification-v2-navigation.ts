import { NotificationV2 } from "@/types/notification-v2";

const DEEP_LINK_PREFIX = "jfapp://";

const toStringValue = (value: unknown): string | null => {
  if (typeof value === "string") {
    const normalizedValue = value.trim();
    return normalizedValue.length ? normalizedValue : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return null;
};

const buildRouteFromScreen = (
  screen: string,
  params: Record<string, unknown> | null,
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    const normalizedValue = toStringValue(value);

    if (normalizedValue) {
      searchParams.set(key, normalizedValue);
    }
  });

  const queryString = searchParams.toString();
  return `/${screen}${queryString ? `?${queryString}` : ""}`;
};

const normalizeJfappUrl = (url: string): string | null => {
  if (!url.startsWith(DEEP_LINK_PREFIX)) {
    return url.startsWith("/") ? url : null;
  }

  const path = url.slice(DEEP_LINK_PREFIX.length);

  if (!path) {
    return null;
  }

  return `/${path}`;
};

const resolveWorkoutType = (notification: NotificationV2): "1" | "2" => {
  const workoutKind = toStringValue(
    notification.metadata?.workoutKind,
  )?.toLowerCase();

  if (
    workoutKind === "running" ||
    notification.variant === "feedback-running"
  ) {
    return "1";
  }

  return "2";
};

export const extractInvoiceIdFromNotification = (
  notification: NotificationV2,
): string | null => {
  const params = notification.navigation?.params ?? null;

  return (
    toStringValue(notification.metadata?.invoiceId) ??
    toStringValue(params?.invoiceId) ??
    toStringValue(notification.link)?.match(/(\d+)(?!.*\d)/)?.[1] ??
    null
  );
};

export const resolveNotificationV2Href = (
  notification: NotificationV2,
): string | null => {
  const navigation = notification.navigation;
  const screen = toStringValue(navigation?.screen);
  const url = toStringValue(navigation?.url);
  const params = navigation?.params ?? null;

  if (
    screen === "activitie-details" ||
    url?.startsWith(`${DEEP_LINK_PREFIX}activitie-details`)
  ) {
    const finishedId =
      toStringValue(params?.finishedId) ??
      toStringValue(notification.metadata?.finishedId) ??
      toStringValue(notification.link);

    if (!finishedId) {
      return screen ? buildRouteFromScreen(screen, params) : normalizeJfappUrl(url!);
    }

    return `/activitie-details?finishedId=${encodeURIComponent(finishedId)}&notificationId=${notification.id}`;
  }

  if (screen === "workout" || url?.startsWith(`${DEEP_LINK_PREFIX}workout`)) {
    const workoutId =
      toStringValue(params?.workoutId) ??
      toStringValue(notification.metadata?.workoutsId) ??
      toStringValue(notification.metadata?.workoutId);

    if (!workoutId) {
      return null;
    }

    const workoutType = resolveWorkoutType(notification);
    return `/workout/view?id=${encodeURIComponent(workoutId)}&type=${workoutType}`;
  }

  if (screen === "invoice" || notification.type === "invoice") {
    return "/invoice";
  }

  if (screen === "feedback") {
    const finishedId =
      toStringValue(params?.feedbackId) ??
      toStringValue(params?.finishedId) ??
      toStringValue(notification.metadata?.finishedId) ??
      toStringValue(notification.link);

    if (!finishedId) {
      return null;
    }

    return `/activitie-details?finishedId=${encodeURIComponent(finishedId)}&notificationId=${notification.id}`;
  }

  if (screen) {
    return buildRouteFromScreen(screen, params);
  }

  if (url) {
    return normalizeJfappUrl(url);
  }

  if (notification.type === "feedback") {
    const finishedId =
      toStringValue(notification.metadata?.finishedId) ??
      toStringValue(notification.link);

    if (!finishedId) {
      return null;
    }

    return `/activitie-details?finishedId=${encodeURIComponent(finishedId)}&notificationId=${notification.id}`;
  }

  return null;
};
