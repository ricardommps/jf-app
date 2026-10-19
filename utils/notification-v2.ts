import type { NotificationV2 } from "@/types/notification-v2";

export const isLessonPackageNotification = (
  notification: NotificationV2,
): boolean =>
  notification.type === "lesson-package" ||
  notification.type?.startsWith("lesson-package-") === true ||
  notification.metadata?.lessonPackageId != null ||
  notification.metadata?.lessonPackageClassId != null;

export const isFeedbackNotification = (
  notification: NotificationV2,
): boolean => {
  if (isLessonPackageNotification(notification)) return false;

  if (notification.type?.trim()) return notification.type === "feedback";

  // Preserve legacy feedbacks that have a variant but no explicit type.
  return (
    notification.variant === "feedback-running" ||
    notification.variant === "feedback-strength"
  );
};
