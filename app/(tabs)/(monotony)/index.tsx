import Loading from "@/components/shared/loading";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { getTrimp } from "@/services/trimp.service";
import { useIsFocused } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { View } from "react-native";
import TrimpStackedBarChart from "./components/trimpStackedBarChart";

const Monotonia = () => {
  const isFocused = useIsFocused();

  const {
    data: trimpData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["trimpData"],
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => await getTrimp(),
  });

  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);

  const data = trimpData?.data;

  return (
    <View className="flex-1 bg-[#000]">
      <Text
        size="2xl"
        className="text-typography-900 font-roboto text-center mb-5"
      >
        TRIMP - carga de treino
      </Text>

      <Box>
        {isLoading ? (
          <Loading />
        ) : data?.length ? (
          <TrimpStackedBarChart
            key={isFocused ? "focused" : "unfocused"}
            data={data}
          />
        ) : null}
      </Box>
    </View>
  );
};

export default Monotonia;
