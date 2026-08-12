import { Text } from "@/components/ui/text";
import { NotificationV2 } from "@/types/notification-v2";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  ArrowUpRight,
  Bell,
  Check,
  CornerUpLeft,
  Download,
  Eye,
  TriangleAlert,
} from "lucide-react-native";
import { memo } from "react";
import {
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { tv } from "tailwind-variants";

interface NotificationV2ItemProps {
  notification: NotificationV2;
  onActionPress: (notification: NotificationV2) => void | Promise<void>;
  onViewPress?: (notification: NotificationV2) => void | Promise<void>;
  onInvoicePress?: (notification: NotificationV2) => void | Promise<void>;
  isLoading?: boolean;
}

const tileStyles = tv({
  base: "mt-1 h-[50px] w-[50px] items-center justify-center rounded-[14px]",
  variants: {
    variant: {
      "feedback-running": "bg-[#223E9C]",
      "feedback-strength": "bg-[#273A92]",
      invoice: "bg-[#2B3E96]",
      training: "bg-[#233A8C]",
      alert: "bg-[#5F2E2E]",
      "running-finished-all": "bg-[#1D4D8F]",
      generic: "bg-[#30354F]",
    },
  },
  defaultVariants: {
    variant: "generic",
  },
});

const actionButtonStyles = tv({
  base: "mt-3 self-start rounded-[10px] border px-[12px] py-[7px]",
  variants: {
    kind: {
      reply: "border-[#2D64FF] bg-transparent",
      download: "border-[#3A3A46] bg-[#101010]",
      open: "border-[#3A3A46] bg-[#101010]",
      "mark-as-read": "border-[#3A3A46] bg-[#101010]",
    },
  },
  defaultVariants: {
    kind: "open",
  },
});

const actionLabelStyles = tv({
  base: "text-[12px] font-medium",
  variants: {
    kind: {
      reply: "text-[#4F7CFF]",
      download: "text-white",
      open: "text-white",
      "mark-as-read": "text-white",
    },
  },
  defaultVariants: {
    kind: "open",
  },
});

const resolveVariant = (notification: NotificationV2) => {
  if (
    notification.variant === "feedback-running" ||
    notification.variant === "feedback-strength" ||
    notification.variant === "invoice" ||
    notification.variant === "training" ||
    notification.variant === "alert" ||
    notification.variant === "running-finished-all"
  ) {
    return notification.variant;
  }

  return "generic";
};

const resolveIcon = (notification: NotificationV2) => {
  const icon = notification.icon?.toLowerCase();

  switch (icon) {
    case "running":
      return <MaterialCommunityIcons name="run-fast" color="#FFFFFF" size={21} />;
    case "strength":
      return <MaterialCommunityIcons name="dumbbell" color="#FFFFFF" size={20} />;
    case "invoice":
      return (
        <MaterialCommunityIcons
          name="file-document-outline"
          color="#FFFFFF"
          size={20}
        />
      );
    case "training":
      return <MaterialCommunityIcons name="bullhorn-outline" color="#FFFFFF" size={20} />;
    case "alert":
      return <TriangleAlert color="#FFFFFF" size={20} strokeWidth={2.2} />;
    default:
      if (notification.variant === "feedback-running") {
        return <MaterialCommunityIcons name="run-fast" color="#FFFFFF" size={21} />;
      }

      if (notification.variant === "feedback-strength") {
        return <MaterialCommunityIcons name="dumbbell" color="#FFFFFF" size={20} />;
      }

      if (notification.variant === "invoice") {
        return (
          <MaterialCommunityIcons
            name="file-document-outline"
            color="#FFFFFF"
            size={20}
          />
        );
      }

      if (notification.variant === "running-finished-all") {
        return <MaterialCommunityIcons name="run-fast" color="#FFFFFF" size={21} />;
      }

      if (notification.variant === "training") {
        return <MaterialCommunityIcons name="bullhorn-outline" color="#FFFFFF" size={20} />;
      }

      return <Bell color="#FFFFFF" size={19} strokeWidth={2.2} />;
  }
};

const resolveActionIcon = (notification: NotificationV2) => {
  switch (notification.action?.kind) {
    case "reply":
      return <CornerUpLeft color="#4F7CFF" size={13} strokeWidth={2.2} />;
    case "download":
      return <Download color="#FFFFFF" size={13} strokeWidth={2.2} />;
    case "mark-as-read":
      return <Check color="#FFFFFF" size={13} strokeWidth={2.2} />;
    case "open":
    default:
      return <ArrowUpRight color="#FFFFFF" size={13} strokeWidth={2.2} />;
  }
};

const getLoadingLabel = (notification: NotificationV2): string => {
  switch (notification.action?.kind) {
    case "download":
      return "Baixando...";
    case "mark-as-read":
      return "Marcando...";
    default:
      return "Abrindo...";
  }
};

const renderInvoiceActionIcon = () => (
  <Eye color="#FFFFFF" size={13} strokeWidth={2.2} />
);

const NotificationV2Item = ({
  notification,
  onActionPress,
  onViewPress,
  onInvoicePress,
  isLoading = false,
}: NotificationV2ItemProps) => {
  const variant = resolveVariant(notification);
  const showInvoiceReceiptButton =
    notification.variant === "invoice" && typeof onInvoicePress === "function";
  const showOkButton = !notification.action && !showInvoiceReceiptButton;
  const canPressCard =
    !showInvoiceReceiptButton && !notification.action && !!notification.navigation;
  const timeLabel = notification.createdAtLabel || "";
  const showViewButton =
    notification.type === "feedback" && typeof onViewPress === "function";

  const cardContent = (
    <View className="flex-row gap-[12px] py-5">
      <View className={tileStyles({ variant })}>{resolveIcon(notification)}</View>

      <View className="flex-1">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text
              allowFontScaling={false}
              className="text-[15px] font-semibold leading-[20px] text-white"
            >
              {notification.title}
            </Text>

            {notification.referenceDateLabel ? (
              <Text
                allowFontScaling={false}
                className="mt-[2px] text-[12px] leading-[16px] text-[#A1A1AA]"
              >
                {notification.referenceDateLabel}
              </Text>
            ) : null}
          </View>

          {showViewButton ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onViewPress(notification)}
              className="mt-[-1px] h-8 w-8 items-center justify-center rounded-full bg-[#111318]"
            >
              <Eye color="#A1A1AA" size={15} strokeWidth={2.2} />
            </TouchableOpacity>
          ) : null}
        </View>

        {notification.content ? (
          <Text
            allowFontScaling={false}
            className="mt-[8px] text-[14px] leading-[20px] text-white"
          >
            {notification.content}
          </Text>
        ) : null}

        {timeLabel ? (
          <Text
            allowFontScaling={false}
            className="mt-[8px] text-[12px] leading-[16px] text-[#8F8FA3]"
          >
            {timeLabel}
          </Text>
        ) : null}

        {notification.action ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onActionPress(notification)}
            disabled={isLoading}
            className={actionButtonStyles({
              kind: notification.action.kind,
            })}
          >
            <View className="flex-row items-center gap-[6px]">
              {resolveActionIcon(notification)}
              <Text
                allowFontScaling={false}
                className={actionLabelStyles({
                  kind: notification.action.kind,
                })}
              >
                {isLoading ? getLoadingLabel(notification) : notification.action.label}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {showInvoiceReceiptButton && !notification.action ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onInvoicePress(notification)}
            disabled={isLoading}
            className={actionButtonStyles({
              kind: "download",
            })}
          >
            <View className="flex-row items-center gap-[6px]">
              {renderInvoiceActionIcon()}
              <Text
                allowFontScaling={false}
                className={actionLabelStyles({
                  kind: "download",
                })}
              >
                {isLoading ? "Abrindo..." : "Ver comprovante"}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {showOkButton ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onActionPress(notification)}
            disabled={isLoading}
            className={actionButtonStyles({
              kind: "mark-as-read",
            })}
          >
            <View className="flex-row items-center gap-[6px]">
              <Check color="#FFFFFF" size={13} strokeWidth={2.2} />
              <Text
                allowFontScaling={false}
                className={actionLabelStyles({
                  kind: "mark-as-read",
                })}
              >
                {isLoading ? "Marcando..." : "OK"}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  if (!canPressCard) {
    return cardContent;
  }

  return (
    <Pressable onPress={() => onActionPress(notification)}>{cardContent}</Pressable>
  );
};

export default memo(NotificationV2Item);
