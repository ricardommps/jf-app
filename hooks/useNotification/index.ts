import { getNotifications, readAtReq } from "@/services/notification.service";
import { Notification } from "@/types/notification";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UseANotificationsReturn {
  onGetNotifications: () => Promise<any>;
  onReadAt: (notificationId: number) => void;
  notifications: Notification[] | undefined;
  notificationsStatus: "loading" | "error" | "success";
  notificationsError: Error | null;
  readAt: any;
  readAtStatus: "idle" | "loading" | "error" | "success";
  readAtError: Error | null;
  refetchNotifications: () => void;
}

export default function useANotifications(): UseANotificationsReturn {
  const queryClient = useQueryClient();

  // Get notifications query
  const {
    data: notifications,
    error: notificationsError,
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery<Notification[], Error>({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Read at mutation
  const {
    mutate: onReadAt,
    error: readAtError,
    isPending: readAtLoading,
    isSuccess: readAtSuccess,
    isIdle: readAtIdle,
    data: readAt,
  } = useMutation<any, Error, number>({
    mutationFn: readAtReq,
    onSuccess: () => {
      // Invalidate and refetch notifications after marking as read
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      console.error("Erro ao marcar notificação como lida:", error);
    },
  });

  // Get notifications function (if you need to manually trigger)
  const onGetNotifications = async (): Promise<any> => {
    return refetchNotifications();
  };

  // Determine readAt status
  const getReadAtStatus = () => {
    if (readAtIdle) return "idle";
    if (readAtLoading) return "loading";
    if (readAtError) return "error";
    if (readAtSuccess) return "success";
    return "idle";
  };

  return {
    onGetNotifications,
    onReadAt,
    notifications,
    notificationsStatus: notificationsLoading
      ? "loading"
      : notificationsError
      ? "error"
      : "success",
    notificationsError,
    readAt,
    readAtStatus: getReadAtStatus(),
    readAtError,
    refetchNotifications,
  };
}
