import {
  getNotificationsV2,
  getUnreadNotificationsCountV2,
  readAtV2Req,
  readManyAtV2Req,
} from "@/services/notification-v2.service";
import { NotificationV2 } from "@/types/notification-v2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UseNotificationV2Return {
  notifications: NotificationV2[] | undefined;
  notificationsStatus: "loading" | "error" | "success";
  notificationsError: Error | null;
  refetchNotifications: () => void;
  onReadAtAsync: (notificationId: number) => Promise<NotificationV2>;
  onReadManyAtAsync: (notificationIds: number[]) => Promise<NotificationV2[]>;
  isReadingAt: boolean;
  isReadingManyAt: boolean;
}

interface UseNotificationV2UnreadCountReturn {
  unreadCount: number;
  unreadCountStatus: "loading" | "error" | "success";
  unreadCountError: Error | null;
  refetchUnreadCount: () => void;
}

type UseNotificationV2UnreadCountOptions = {
  enabled?: boolean;
};

export default function useNotificationV2(): UseNotificationV2Return {
  const queryClient = useQueryClient();

  const invalidateNotifications = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["notifications-v2"] }),
      queryClient.invalidateQueries({
        queryKey: ["notifications-v2-unread-count"],
      }),
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    ]);
  };

  const {
    data: notifications,
    error: notificationsError,
    isLoading: notificationsLoading,
    refetch,
  } = useQuery<NotificationV2[], Error>({
    queryKey: ["notifications-v2"],
    queryFn: getNotificationsV2,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const readAtMutation = useMutation<NotificationV2, Error, number>({
    mutationFn: readAtV2Req,
    onSuccess: invalidateNotifications,
    onError: (error) => {
      console.error("Erro ao marcar notificação V2 como lida:", error);
    },
  });

  const readManyAtMutation = useMutation<NotificationV2[], Error, number[]>({
    mutationFn: readManyAtV2Req,
    onSuccess: invalidateNotifications,
    onError: (error) => {
      console.error("Erro ao marcar notificações V2 como lidas:", error);
    },
  });

  return {
    notifications,
    notificationsStatus: notificationsLoading
      ? "loading"
      : notificationsError
        ? "error"
        : "success",
    notificationsError,
    refetchNotifications: () => {
      refetch();
    },
    onReadAtAsync: readAtMutation.mutateAsync,
    onReadManyAtAsync: readManyAtMutation.mutateAsync,
    isReadingAt: readAtMutation.isPending,
    isReadingManyAt: readManyAtMutation.isPending,
  };
}

export function useNotificationV2UnreadCount(
  options?: UseNotificationV2UnreadCountOptions,
): UseNotificationV2UnreadCountReturn {
  const {
    data: unreadCount,
    error: unreadCountError,
    isLoading: unreadCountLoading,
    refetch,
  } = useQuery<number, Error>({
    queryKey: ["notifications-v2-unread-count"],
    queryFn: getUnreadNotificationsCountV2,
    staleTime: 0,
    gcTime: 0,
    enabled: options?.enabled ?? true,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    unreadCount: unreadCount ?? 0,
    unreadCountStatus: unreadCountLoading
      ? "loading"
      : unreadCountError
        ? "error"
        : "success",
    unreadCountError,
    refetchUnreadCount: () => {
      refetch();
    },
  };
}
