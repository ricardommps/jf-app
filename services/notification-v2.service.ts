import axiosInstance from "@/config/axios";
import { ENV } from "@/config/env";
import { NotificationV2 } from "@/types/notification-v2";
import { getAccessToken } from "@/utils/token";
import * as Sentry from "@sentry/react-native";
import axios from "axios";

export type NotificationV2UnreadCountResponse = {
  count: number;
};

const BATCH_READ_TIMEOUT = 30000;

async function readManyAtV2BatchReq(
  notificationIds: number[],
): Promise<NotificationV2[]> {
  const accessToken = await getAccessToken();

  const response = await axios.put(
    `${ENV.API_URL}/api/v2/notification/v2/readAt`,
    {
      notificationIds,
    },
    {
      timeout: BATCH_READ_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(accessToken ? { Authorization: `${accessToken}` } : {}),
      },
    },
  );

  return response.data;
}

export async function getNotificationsV2(): Promise<NotificationV2[]> {
  try {
    const response = await axiosInstance.get("/api/v2/notification/v2");
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, { extra: { context: "getNotificationsV2" } });
    throw error;
  }
}

export async function getUnreadNotificationsCountV2(): Promise<number> {
  try {
    const response = await axiosInstance.get(
      "/api/v2/notification/v2/unread-count",
    );
    return Number(
      (response.data as NotificationV2UnreadCountResponse | undefined)?.count ??
        0,
    );
  } catch (error: any) {
    Sentry.captureException(error, {
      extra: { context: "getUnreadNotificationsCountV2" },
    });
    throw error;
  }
}

export async function readAtV2Req(
  notificationId: number,
): Promise<NotificationV2> {
  try {
    const response = await axiosInstance.get(
      `/api/v2/notification/v2/readAt/${notificationId}`,
    );
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, {
      extra: { context: "readAtV2Req", notificationId },
    });
    throw error;
  }
}

export async function readManyAtV2Req(
  notificationIds: number[],
): Promise<NotificationV2[]> {
  const normalizedNotificationIds = Array.from(new Set(notificationIds)).filter(
    (notificationId) => Number.isFinite(notificationId),
  );

  if (!normalizedNotificationIds.length) {
    return [];
  }

  try {
    if (!ENV.API_URL) {
      throw new Error("API URL não configurada para leitura em lote.");
    }

    return await readManyAtV2BatchReq(normalizedNotificationIds);
  } catch (error: any) {
    Sentry.captureMessage(
      "Falha ao marcar notificações V2 em lote; usando fallback individual.",
      {
        level: "warning",
        extra: {
          context: "readManyAtV2Req.batchFallback",
          notificationIds: normalizedNotificationIds,
        },
      },
    );

    try {
      return await Promise.all(
        normalizedNotificationIds.map((notificationId) =>
          readAtV2Req(notificationId),
        ),
      );
    } catch (fallbackError: any) {
      Sentry.captureException(fallbackError, {
        extra: {
          context: "readManyAtV2Req.fallback",
          notificationIds: normalizedNotificationIds,
        },
      });
      throw fallbackError;
    }
  }
}
