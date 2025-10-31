import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import useANotifications from "@/hooks/useNotification";
import { downloadInvoice } from "@/services/invoice.service";
import { Notification } from "@/types/notification";
import { ProfileType } from "@/types/ProfileType";
import { gerarTemplateHtml } from "@/utils/gerarTemplateHtml";
import { getTimePassedText } from "@/utils/get-time-passed";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { BellRing, FileWarning, MailIcon, Receipt } from "lucide-react-native";
import { useState } from "react";

interface Props {
  notification: Notification;
  profile: ProfileType | null;
}

const NotificationItem = ({ notification, profile }: Props) => {
  const toast = useToast();
  const { onReadAt } = useANotifications();
  const router = useRouter();

  const [toastId, setToastId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const showNewToast = (error?: unknown) => {
    const errorMessage =
      (error as { message?: string })?.message ||
      String(error) ||
      "Ocorreu um erro inesperado.";

    const newId = Math.random().toString();
    setToastId(newId);

    toast.show({
      id: newId,
      placement: "top",
      duration: 9000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Box className="mt-12">
            <Toast nativeID={uniqueToastId} action="error" variant="solid">
              <ToastTitle>Erro ao baixar comprovante</ToastTitle>
              <ToastDescription>{errorMessage}</ToastDescription>
            </Toast>
          </Box>
        );
      },
    });
  };

  const getFormattedTimeAgo = (day: string): string => {
    return getTimePassedText(day);
  };

  const handleDownloadInvoice = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const link: string = notification.link;
      const match: RegExpMatchArray | null = link.match(
        /\/invoice\/download\/(\d+)/
      );
      const invoiceId: string | null = match
        ? link.split("/").pop() || null
        : null;

      if (!invoiceId) {
        return;
      }
      const invoice: any = await downloadInvoice(invoiceId);

      if (!invoice) {
        return;
      }
      try {
        const htmlMinimo = await gerarTemplateHtml(invoice, profile);
        const resultado1 = await Print.printToFileAsync({
          html: htmlMinimo,
          base64: false,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(resultado1.uri);
          handleAccept();
          return;
        }
      } catch (erro1: any) {
        if (!toast.isActive(toastId)) {
          showNewToast(erro1);
        }
      }
    } catch (erroGeral: any) {
      if (!toast.isActive(toastId)) {
        showNewToast(erroGeral);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    onReadAt(notification.id);
  };

  const handleFeedback = () => {
    router.push(
      `/feedback?feedbackId=${notification.link}&notificationId=${notification.id}` as any
    );
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "invoice":
        return (
          <Icon as={Receipt} size="lg" className="stroke-background-500 my-1" />
        );
      case "feedback":
        return (
          <Icon
            as={MailIcon}
            size="lg"
            className="stroke-background-500 my-1"
          />
        );

      case "alert":
        return (
          <FileWarning
            size={24}
            color="#22c55e" // cor equivalente ao Tailwind 'text-success'
            strokeWidth={2}
            style={{ marginVertical: 4 }}
          />
        );

      case "training":
        return (
          <BellRing
            size={24}
            color="#22c55e" // cor equivalente ao Tailwind 'text-success'
            strokeWidth={2}
            style={{ marginVertical: 4 }}
          />
        );

      default:
        return (
          <Icon
            as={MailIcon}
            size="lg"
            className="stroke-background-500 my-1"
          />
        );
    }
  };

  const renderActionButton = (type: string) => {
    switch (type) {
      case "invoice":
        return (
          <Button
            size="sm"
            action="primary"
            onPress={handleDownloadInvoice}
            disabled={isLoading}
          >
            <ButtonText>
              {isLoading ? "Baixando comprovante..." : "Baixar comprovante"}
            </ButtonText>
          </Button>
        );
      case "feedback":
        return (
          <Button size="sm" onPress={handleFeedback}>
            <ButtonText> Clique aqui para conferir</ButtonText>
          </Button>
        );

      case "alert":
        return (
          <Button size="sm" action="primary" onPress={handleAccept}>
            <ButtonText>Marcar como lido</ButtonText>
          </Button>
        );

      default:
        return (
          <Button size="sm" onPress={handleAccept}>
            <ButtonText>Marcar como lido</ButtonText>
          </Button>
        );
    }
  };

  return (
    <>
      <HStack className="items-start w-full gap-3 px-4">
        {renderIcon(notification.type)}
        <VStack className="flex-1">
          {notification?.title && (
            <Text size="lg" className="font-semibold">
              {notification?.title}
            </Text>
          )}
          {notification.updatedAt && (
            <Text size="sm">{getFormattedTimeAgo(notification.updatedAt)}</Text>
          )}

          <Box className="rounded-lg bg-[#2b2b2b9d] gap-3 p-2 py-3 my-3 overflow-hidden">
            <Text size="md" className="font-semibold">
              {notification.content}
            </Text>
            <Box className="self-start">
              {renderActionButton(notification.type)}
            </Box>
          </Box>
        </VStack>
      </HStack>
    </>
  );
};

export default NotificationItem;
