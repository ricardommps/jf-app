import { Box } from "@/components/ui/box";
import { TrimpItem } from "@/types/trimp";
import moment from "moment";
import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { YAxis } from "react-native-svg-charts";
import TrainingMetrics from "./trainingMetrics";

interface Props {
  data: TrimpItem[];
}

export default function TrimpStackedBarChart({ data }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);

  const startOfWeek = moment().add(weekOffset, "weeks").startOf("week");
  const endOfWeek = moment().add(weekOffset, "weeks").endOf("week");

  const filteredData = data.filter((item) =>
    moment(item.executionDay).isBetween(startOfWeek, endOfWeek, null, "[]")
  );

  const weekDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(moment(startOfWeek).add(i, "days").format("YYYY-MM-DD"));
  }

  const grouped: Record<
    string,
    { running: number; nonRunning: number; complementary: number }
  > = {};
  weekDays.forEach((day) => {
    grouped[day] = { running: 0, nonRunning: 0, complementary: 0 };
  });

  filteredData.forEach((item) => {
    const day = moment(item.executionDay).format("YYYY-MM-DD");
    if (item.programType === 3 || item.type === "complementar")
      grouped[day].complementary += item.trimp;
    else if (item.programType === 1 || item.type === "corrida" || item.running)
      grouped[day].running += item.trimp;
    else grouped[day].nonRunning += item.trimp;
  });

  const chartData = weekDays.map((day) => ({
    day,
    label: moment(day).format("DD/MM"),
    running: grouped[day].running,
    nonRunning: grouped[day].nonRunning,
    complementary: grouped[day].complementary,
  }));

  const dailyTrimpValues = chartData.map(
    (d) => d.running + d.nonRunning + d.complementary
  );
  const maxGroupedTrimp = Math.max(
    ...chartData.flatMap((d) => [d.running, d.nonRunning, d.complementary]),
    0
  );
  const yMax = Math.max(100, Math.ceil(maxGroupedTrimp / 100) * 100);

  const hasPrevWeek = useMemo(() => {
    const prevStart = moment(startOfWeek).subtract(1, "week");
    const prevEnd = moment(endOfWeek).subtract(1, "week");
    return data.some((d) =>
      moment(d.executionDay).isBetween(prevStart, prevEnd, null, "[]")
    );
  }, [weekOffset]);

  const hasNextWeek = useMemo(() => {
    const nextWeekStart = moment(startOfWeek).add(1, "week");
    const currentWeekStart = moment().startOf("week");

    return nextWeekStart.isSameOrBefore(currentWeekStart);
  }, [weekOffset]);

  const contentInset = { top: 10, bottom: 10 };
  const chartHeight = 190;
  const getBarHeight = (value: number) => {
    if (!value || !yMax) return 0;

    return Math.max(2, (value / yMax) * chartHeight);
  };

  return (
    <View style={{ padding: 16, backgroundColor: "black" }}>
      <Box>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            disabled={!hasPrevWeek}
            onPress={() => setWeekOffset((prev) => prev - 1)}
            style={{ opacity: hasPrevWeek ? 1 : 0.2, padding: 8 }}
          >
            <Text style={{ color: "white", fontSize: 22 }}>{"<"}</Text>
          </TouchableOpacity>

          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            {chartData[0]?.label ?? "--"} - {chartData[6]?.label ?? "--"}
          </Text>

          <TouchableOpacity
            disabled={!hasNextWeek}
            onPress={() => setWeekOffset((prev) => prev + 1)}
            style={{ opacity: hasNextWeek ? 1 : 0.2, padding: 8 }}
          >
            <Text style={{ color: "white", fontSize: 22 }}>{">"}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row" }}>
          <YAxis
            style={{ height: chartHeight }}
            data={[0, yMax]}
            contentInset={contentInset}
            svg={{ fill: "#999", fontSize: 10 }}
            numberOfTicks={5}
            yMin={0}
            yMax={yMax}
          />

          <View style={{ flex: 1, marginLeft: 8 }}>
            <View
              style={{
                height: chartHeight,
                flexDirection: "row",
                alignItems: "flex-end",
              }}
            >
              {chartData.map((item) => (
                <View
                  key={item.day}
                  style={{
                    flex: 1,
                    height: chartHeight,
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    <View
                      style={{
                        width: 7,
                        height: getBarHeight(item.running),
                        backgroundColor: "#fc1c1c",
                      }}
                    />
                    <View
                      style={{
                        width: 7,
                        height: getBarHeight(item.nonRunning),
                        backgroundColor: "#f55858",
                      }}
                    />
                    <View
                      style={{
                        width: 7,
                        height: getBarHeight(item.complementary),
                        backgroundColor: "#8e8e93",
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>

            <View
              style={{
                flexDirection: "row",
                marginTop: 6,
              }}
            >
              {chartData.map((item) => (
                <Text
                  key={item.day}
                  style={{
                    flex: 1,
                    color: "white",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginHorizontal: 8,
            }}
          >
            <View
              style={{
                width: 16,
                height: 16,
                marginRight: 4,
                backgroundColor: "#fc1c1c",
              }}
            />
            <Text style={{ color: "white", fontSize: 12 }}>Corrida</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginHorizontal: 8,
            }}
          >
            <View
              style={{
                width: 16,
                height: 16,
                marginRight: 4,
                backgroundColor: "#f55858",
              }}
            />
            <Text style={{ color: "white", fontSize: 12 }}>Força</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginHorizontal: 8,
            }}
          >
            <View
              style={{
                width: 16,
                height: 16,
                marginRight: 4,
                backgroundColor: "#8e8e93",
              }}
            />
            <Text style={{ color: "white", fontSize: 12 }}>Complementar</Text>
          </View>
        </View>
      </Box>

      <View>
        <TrainingMetrics values={dailyTrimpValues} />
      </View>
    </View>
  );
}
