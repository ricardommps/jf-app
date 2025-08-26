import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";

export function NotificationHandler() {
  const router = useRouter();

  const handleNavigationFromNotification = (data: Record<string, any>) => {
    if (!data) return;

    if (data.url && typeof data.url === "string") {
      const url = data.url;
      const prefix = "jfapp://";

      if (url.startsWith(prefix)) {
        const path = url.slice(prefix.length);
        router.push(`/${path}` as any);
        return;
      }
    }

    if (!data.screen) return;

    const params =
      typeof data.params === "string" ? JSON.parse(data.params) : data.params;

    if (params?.feedbackId) {
      const { feedbackId, ...rest } = params;
      const query = new URLSearchParams(rest).toString();
      const path = query
        ? `/${data.screen}/${feedbackId}?${query}`
        : `/${data.screen}/${feedbackId}`;
      router.push(path as any);
    } else if (params?.id) {
      router.push(`/${data.screen}/${params.id}` as any);
    } else {
      router.push(`/${data.screen}` as any);
    }
  };

  useEffect(() => {
    (async () => {
      const lastNotification =
        await Notifications.getLastNotificationResponseAsync();
      if (lastNotification) {
        handleNavigationFromNotification(
          lastNotification.notification.request.content.data
        );
      }
    })();

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleNavigationFromNotification(
          response.notification.request.content.data
        );
      }
    );

    return () => subscription.remove();
  }, []);

  return null;
}
