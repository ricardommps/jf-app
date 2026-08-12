import NotificationV2CommentsModal from "@/app/notifications-v2/components/notification-v2-comments-modal";
import NotificationV2Item from "@/app/notifications-v2/components/notification-v2-item";
import {
  extractInvoiceIdFromNotification,
  resolveNotificationV2Href,
} from "@/app/notifications-v2/components/notification-v2-navigation";
import Loading from "@/components/shared/loading";
import { Text } from "@/components/ui/text";
import { useSession } from "@/contexts/Authentication";
import useNotificationV2 from "@/hooks/useNotificationV2";
import { getComments } from "@/services/comment.service";
import { downloadInvoice } from "@/services/invoice.service";
import { CommentContent } from "@/types/commnets.type";
import { NotificationV2 } from "@/types/notification-v2";
import { gerarTemplateHtml } from "@/utils/gerarTemplateHtml";
import * as Print from "expo-print";
import { useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, FlatList, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Ocorreu um erro inesperado.";
};

const getNotificationFinishedId = (notification: NotificationV2) => {
  const rawFinishedId = notification.metadata?.finishedId ?? notification.link;
  const normalizedFinishedId =
    typeof rawFinishedId === "string" ? Number(rawFinishedId) : rawFinishedId;

  if (
    typeof normalizedFinishedId === "number" &&
    Number.isFinite(normalizedFinishedId) &&
    normalizedFinishedId > 0
  ) {
    return normalizedFinishedId;
  }

  return null;
};

const buildCommentsContent = (
  notification: NotificationV2,
  comments: CommentContent["comments"],
): CommentContent => ({
  executionDay:
    notification.referenceDateLabel ?? notification.referenceDate ?? "",
  updatedAt: notification.createdAt,
  comments,
});

export default function NotificationsV2Screen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { getProfile } = useSession();
  const profile = getProfile();
  const {
    notifications,
    notificationsStatus,
    notificationsError,
    refetchNotifications,
    onReadAtAsync,
    onReadManyAtAsync,
  } = useNotificationV2();

  const [activeNotificationId, setActiveNotificationId] = useState<
    number | null
  >(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [commentsNotification, setCommentsNotification] =
    useState<NotificationV2 | null>(null);
  const [commentsContent, setCommentsContent] = useState<CommentContent | null>(
    null,
  );
  const [commentsFinishedId, setCommentsFinishedId] = useState<number | null>(
    null,
  );
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const unreadNotifications = useMemo(
    () => notifications?.filter((notification) => !notification.readAt) ?? [],
    [notifications],
  );

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/(home)" as any);
  };

  const markNotificationAsRead = async (notification: NotificationV2) => {
    if (notification.readAt) {
      return;
    }

    await onReadAtAsync(notification.id);
  };

  const handleInvoiceDownload = async (notification: NotificationV2) => {
    const invoiceId = extractInvoiceIdFromNotification(notification);

    if (!invoiceId) {
      Alert.alert("Aviso", "Não foi possível localizar o comprovante.");
      return;
    }

    const invoice = await downloadInvoice(invoiceId);
    const html = await gerarTemplateHtml(invoice, profile);

    await Print.printAsync({
      html,
    });
  };

  const handleInvoiceReceiptPress = async (notification: NotificationV2) => {
    setActiveNotificationId(notification.id);

    try {
      await handleInvoiceDownload(notification);
      await markNotificationAsRead(notification);
    } catch (error) {
      Alert.alert("Erro", getErrorMessage(error));
    } finally {
      setActiveNotificationId(null);
    }
  };

  const loadComments = async (
    notification: NotificationV2,
    finishedId: number,
  ) => {
    try {
      const response = await getComments(finishedId);
      const safeComments = Array.isArray(response) ? response : [];
      const nextContent = buildCommentsContent(notification, safeComments);

      setCommentsContent(nextContent);

      return nextContent;
    } catch (error) {
      setCommentsContent(buildCommentsContent(notification, []));
      throw error;
    }
  };

  const handleReplyAction = async (notification: NotificationV2) => {
    const finishedId = getNotificationFinishedId(notification);

    if (!finishedId) {
      const href = resolveNotificationV2Href(notification);

      if (href) {
        router.push(href as any);
        return;
      }

      Alert.alert(
        "Aviso",
        "Não foi possível localizar os comentários desta notificação.",
      );
      return;
    }

    setCommentsNotification(notification);
    setCommentsFinishedId(finishedId);
    setCommentsContent(buildCommentsContent(notification, []));
    setIsCommentsOpen(true);

    const commentsResult = await Promise.allSettled([
      loadComments(notification, finishedId),
    ]);

    const [loadCommentsResult] = commentsResult;

    if (loadCommentsResult.status === "rejected") {
      Alert.alert("Erro", getErrorMessage(loadCommentsResult.reason));
    }
  };

  const handleCloseComments = async () => {
    const notificationToRead = commentsNotification;

    setIsCommentsOpen(false);
    setCommentsNotification(null);
    setCommentsContent(null);
    setCommentsFinishedId(null);

    if (notificationToRead && !notificationToRead.readAt) {
      try {
        await onReadAtAsync(notificationToRead.id);
      } catch (error) {
        Alert.alert("Erro", getErrorMessage(error));
      }
    }
  };

  const handleCommentSent = async () => {
    if (!commentsNotification || !commentsFinishedId) {
      return;
    }

    try {
      await loadComments(commentsNotification, commentsFinishedId);
    } catch (error) {
      Alert.alert("Erro", getErrorMessage(error));
    }
  };

  const handleNotificationView = async (notification: NotificationV2) => {
    try {
      const href = resolveNotificationV2Href(notification);

      if (!href) {
        Alert.alert(
          "Aviso",
          "Não foi possível localizar a tela de detalhes desta notificação.",
        );
        return;
      }

      router.push(href as any);
    } catch (error) {
      Alert.alert("Erro", getErrorMessage(error));
    }
  };

  const handleNotificationAction = async (notification: NotificationV2) => {
    setActiveNotificationId(notification.id);

    try {
      if (notification.action?.kind === "mark-as-read") {
        await markNotificationAsRead(notification);
        return;
      }

      if (notification.action?.kind === "download") {
        await handleInvoiceDownload(notification);
        await markNotificationAsRead(notification);
        return;
      }

      if (notification.action?.kind === "reply") {
        await handleReplyAction(notification);
        return;
      }

      const href = resolveNotificationV2Href(notification);

      await markNotificationAsRead(notification);

      if (href) {
        router.push(href as any);
      }
    } catch (error) {
      Alert.alert("Erro", getErrorMessage(error));
    } finally {
      setActiveNotificationId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!unreadNotifications.length || isMarkingAll) {
      return;
    }

    setIsMarkingAll(true);

    try {
      await onReadManyAtAsync(
        unreadNotifications.map((notification) => notification.id),
      );
    } catch (error) {
      Alert.alert("Erro", getErrorMessage(error));
    } finally {
      setIsMarkingAll(false);
    }
  };

  const renderHeader = () => (
    <View className="px-5 pb-3 pt-2">
      <View className="flex-row items-end justify-between">
        <View className="flex-1 flex-row items-center pr-3">
          <TouchableOpacity
            onPress={handleBack}
            className="-ml-2 h-11 w-11 items-center justify-center"
          >
            <ArrowLeft color="#FFFFFF" size={27} strokeWidth={2.2} />
          </TouchableOpacity>

          <View className="ml-1 flex-1">
            <Text
              allowFontScaling={false}
              className="text-[24px] font-semibold leading-[28px] text-white"
            >
              Notificações
            </Text>
          </View>
        </View>

        {unreadNotifications.length ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="mb-[3px] rounded-full px-1 py-1"
          >
            <Text
              allowFontScaling={false}
              className="text-[11px] font-medium text-[#4F7CFF]"
            >
              {isMarkingAll ? "Marcando..." : "Marcar todas"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="w-[84px]" />
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-[22px] font-semibold text-white">
        Nenhuma notificação pendente
      </Text>
      <Text className="mt-3 text-center text-[16px] leading-6 text-[#8F8FA3]">
        Quando houver novidades, elas aparecerão aqui nesta nova central.
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-[22px] font-semibold text-white">
        Não foi possível carregar
      </Text>
      <Text className="mt-3 text-center text-[16px] leading-6 text-[#8F8FA3]">
        {getErrorMessage(notificationsError)}
      </Text>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={refetchNotifications}
        className="mt-6 rounded-[14px] border border-[#2D64FF] px-5 py-3"
      >
        <Text className="text-[15px] font-semibold text-[#4F7CFF]">
          Tentar novamente
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: NotificationV2 }) => (
    <NotificationV2Item
      notification={item}
      onActionPress={handleNotificationAction}
      onViewPress={handleNotificationView}
      onInvoicePress={handleInvoiceReceiptPress}
      isLoading={activeNotificationId === item.id}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      {renderHeader()}

      {notificationsStatus === "loading" ? (
        <Loading />
      ) : notificationsStatus === "error" ? (
        renderErrorState()
      ) : (
        <FlatList
          data={notifications ?? []}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            flexGrow: notifications?.length ? 0 : 1,
            paddingHorizontal: 20,
            paddingBottom: 28,
          }}
          ItemSeparatorComponent={() => (
            <View className="h-px w-full bg-[#1B1B21]" />
          )}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      <NotificationV2CommentsModal
        open={isCommentsOpen}
        onClose={handleCloseComments}
        content={commentsContent}
        finishedId={commentsFinishedId}
        onCommentSent={handleCommentSent}
      />
    </SafeAreaView>
  );
}
