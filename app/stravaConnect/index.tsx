import Header from "@/components/header";
import Loading from "@/components/shared/loading";
import { getMyInvoices } from "@/services/invoice.service";
import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import StravaConnect from "./components/StravaConnect";

export default function InvoiceScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ["invoice"],
    queryFn: async () => await getMyInvoices(),
    staleTime: 0,
    gcTime: 0,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-black">
      <Header title="Conexão com o Strava" />
      {isLoading ? <Loading /> : <StravaConnect />}
    </View>
  );
}
