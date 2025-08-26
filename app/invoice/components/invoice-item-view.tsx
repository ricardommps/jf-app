import { Invoice } from "@/types/invoice";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import dayjs from "dayjs";
import { useState } from "react";
import { downloadInvoice } from "@/services/invoice.service";
import { useSession } from "@/contexts/Authentication";
import { gerarTemplateHtml } from "@/utils/gerarTemplateHtml";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";

interface Props {
  item: Invoice;
}

const InvoiceItemView = ({ item }: Props) => {
  const toast = useToast();
  const { getProfile } = useSession();
  const profile = getProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [toastId, setToastId] = useState<string>("");

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

  const handleDownloadInvoice = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (!item.invoiceNumber) {
        return;
      }
      const invoice: any = await downloadInvoice(String(item.id));

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

  const renderStatus = () => {
    switch (item.status) {
      case "paid":
        return (
          <Text
            ellipsizeMode="tail"
            className="text-green-500 text-base font-semibold"
          >
            Pago
          </Text>
        );
      case "pending":
        return (
          <Text
            ellipsizeMode="tail"
            className="text-orange-500 text-base font-semibold"
          >
            Pendente
          </Text>
        );
      case "overdue":
        return (
          <Text
            ellipsizeMode="tail"
            className="text-red-500 text-base font-semibold"
          >
            Atrasado
          </Text>
        );
      case "draft":
        return (
          <Text
            ellipsizeMode="tail"
            className="text-typography-900 text-base font-semibold"
          >
            Status: Rascunho
          </Text>
        );
      default:
        <Text
          ellipsizeMode="tail"
          className="text-typography-900 text-base font-semibold"
        >
          -
        </Text>;
    }
  };
  return (
    <Box className="bg-[#2b2b2b9d] rounded-xl p-4 mb-2 min-h-[100px]">
      <VStack
        className="w-full"
        style={{
          flexWrap: "wrap",
          gap: 5,
        }}
      >
        {renderStatus()}

        <Text className="text-typography-900 text-base font-semibold">
          {`Número: ${item.invoiceNumber}`}
        </Text>

        <Text className="text-typography-900 text-base font-semibold">
          {`Valor: ${item.totalAmount}`}
        </Text>

        <Text className="text-typography-900 text-base font-semibold">
          {`Vencimento: ${dayjs(item.dueDate).format("DD/MM/YYYY")}`}
        </Text>

        <Text
          numberOfLines={3}
          ellipsizeMode="tail"
          className="text-typography-900 text-base font-semibold"
        >
          {`Descrição: ${item.description}`}
        </Text>
      </VStack>
      <Box className="self-start mt-5">
        {item.status === "paid" && (
          <Button size="sm" action="primary" onPress={handleDownloadInvoice}>
            <ButtonText>Baixar comprovante</ButtonText>
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default InvoiceItemView;
