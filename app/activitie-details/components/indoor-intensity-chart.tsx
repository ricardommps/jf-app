import { Text } from "@/components/ui/text";
import { View } from "react-native";

type IndoorUnitMeasurement = "pace" | "km" | null;

type IndoorIntensityItem = {
  effort: number;
  value: number;
  label: string;
};

type Props = {
  items: IndoorIntensityItem[];
  unitMeasurement: IndoorUnitMeasurement;
};

const formatKmDelta = (delta: number) => {
  const absoluteValue = Math.abs(delta);

  return `${delta >= 0 ? "+" : "-"}${absoluteValue
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d*[1-9])0$/, "$1")}`;
};

const formatPaceDelta = (deltaInSeconds: number) => {
  const absoluteSeconds = Math.max(0, Math.round(Math.abs(deltaInSeconds)));
  const hours = Math.floor(absoluteSeconds / 3600);
  const minutes = Math.floor((absoluteSeconds % 3600) / 60);
  const seconds = absoluteSeconds % 60;
  const sign = deltaInSeconds >= 0 ? "+" : "-";

  if (hours > 0) {
    return `${sign}${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${sign}${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const getBarWidth = (
  value: number,
  values: number[],
  unitMeasurement: IndoorUnitMeasurement,
): `${number}%` => {
  if (!values.length) {
    return "88%";
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;

  if (range <= 0) {
    return "88%";
  }

  const normalizedValue =
    unitMeasurement === "pace"
      ? (maxValue - value) / range
      : (value - minValue) / range;

  return `${50 + normalizedValue * 50}%`;
};

const getDeltaLabel = (
  currentValue: number,
  previousValue: number,
  unitMeasurement: IndoorUnitMeasurement,
) => {
  const delta =
    unitMeasurement === "pace"
      ? previousValue - currentValue
      : currentValue - previousValue;
  const normalizedDelta = Math.abs(delta) < 0.0001 ? 0 : delta;

  return {
    isPositive: normalizedDelta >= 0,
    label:
      unitMeasurement === "pace"
        ? formatPaceDelta(normalizedDelta)
        : formatKmDelta(normalizedDelta),
  };
};

export function IndoorIntensityChart({ items, unitMeasurement }: Props) {
  if (!items.length) {
    return null;
  }

  const chartValues = items.map((item) => item.value);
  const resolvedUnitMeasurement =
    unitMeasurement ??
    (chartValues.some((value) => !Number.isInteger(value) || value <= 30)
      ? "km"
      : "pace");

  return (
    <View className="mt-2 rounded-[30px] bg-[#232A36] px-3 pb-4 pt-5">
      <View className="mb-5 flex-row items-start">
        <View className="w-[42px] pr-1">
          <Text
            allowFontScaling={false}
            className="text-[14px] font-medium uppercase tracking-[0.8px] text-[#7E889C]"
          />
        </View>

        <View className="flex-1 pr-2">
          <Text
            allowFontScaling={false}
            className="text-[14px] font-medium uppercase tracking-[0.8px] text-[#7E889C]"
          >
            RITMO DOS ESFORÇOS
          </Text>
        </View>

        <View className="w-[78px] items-end">
          <Text
            allowFontScaling={false}
            className="text-[14px] font-medium uppercase tracking-[0.8px] text-[#7E889C]"
          >
            +/-
          </Text>
        </View>
      </View>

      {items.map((item, index) => {
        const delta =
          index > 0
            ? getDeltaLabel(
                item.value,
                items[index - 1].value,
                resolvedUnitMeasurement,
              )
            : null;

        return (
          <View
            key={`${item.effort}-${item.label}-${index}`}
            className="mb-3 flex-row items-center"
          >
            <View className="w-[42px] pr-1">
              <Text
                allowFontScaling={false}
                className="text-[18px] font-semibold text-white"
              >
                {item.effort}
              </Text>
            </View>

            <View className="flex-1 pr-2">
              <View
                className="min-w-[128px] h-[30px] justify-center rounded-[10px] bg-[#44CCC1] px-4"
                style={{
                  width: getBarWidth(
                    item.value,
                    chartValues,
                    resolvedUnitMeasurement,
                  ),
                }}
              >
                <Text
                  allowFontScaling={false}
                  className="text-[18px] font-medium text-[#F1FBFA]"
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </View>
            </View>

            <View className="w-[78px] items-end">
              {delta ? (
                <Text
                  allowFontScaling={false}
                  className={`text-[18px] font-semibold ${
                    delta.isPositive ? "text-[#4CE583]" : "text-[#FF6B72]"
                  }`}
                >
                  {delta.label}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
