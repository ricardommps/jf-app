import HeaderNavigation from "@/components/shared/header-navigation";
import Loading from "@/components/shared/loading";
import { VStack } from "@/components/ui/vstack";
import { getMyInvoices } from "@/services/invoice.service";
import { Invoice } from "@/types/invoice";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { FlatList } from "react-native";
import InvoiceItemView from "./components/invoice-item-view";

export default function InvoiceScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ["invoice"],
    queryFn: async () => await getMyInvoices(),
    staleTime: 0,
    gcTime: 0,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const renderItem = ({ item }: { item: Invoice }) => {
    return <InvoiceItemView item={item} />;
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <VStack space="md" className="flex-1 bg-background-0">
      <HeaderNavigation title="Minhas faturas" />
      {isLoading ? (
        <Loading />
      ) : (
        <VStack className="w-full mt-5 gap-3 px-3 pb-10">
          <FlatList
            data={data}
            renderItem={renderItem}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{
              paddingBottom: 10,
              gap: 10,
            }}
          />
        </VStack>
      )}
    </VStack>
  );
}
