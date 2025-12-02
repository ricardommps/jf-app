import { useMemo } from "react";
import { Text, View } from "react-native";

interface Props {
  values: number[];
}

export default function TrainingMetrics({ values }: Props) {
  const { monotony, strain, alertMessage } = useMemo(() => {
    const sum = values.reduce((acc, n) => acc + n, 0);
    const meanValue = sum / values.length;

    const variance =
      values.reduce((acc, n) => acc + Math.pow(n - meanValue, 2), 0) /
      values.length;

    const stdValue = Math.sqrt(variance);

    const monotonyValue = meanValue / (stdValue === 0 ? 1 : stdValue);

    const strainValue = sum * monotonyValue;

    let msg = "";
    if (monotonyValue > 2) {
      msg = "⚠️ Sinal de alerta: risco de overreaching / overtraining!";
    }

    return {
      monotony: monotonyValue,
      strain: strainValue,
      alertMessage: msg,
    };
  }, [values]);

  return (
    <View className="p-2 pt-11">
      {/* Linha com Monotonia e Strain */}
      <View className="flex-row items-center gap-6">
        <Text className="text-lg text-white">
          Monotonia: {monotony.toFixed(2)}
        </Text>

        <Text className="text-lg text-white">Strain: {strain.toFixed(2)}</Text>
      </View>

      {!!alertMessage && (
        <Text className="mt-2 text-red-600 font-bold mb-5">{alertMessage}</Text>
      )}
    </View>
  );
}
