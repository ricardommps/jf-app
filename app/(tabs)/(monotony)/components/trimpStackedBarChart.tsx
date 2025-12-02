import { Box } from "@/components/ui/box";
import { TrimpItem } from "@/types/trimp";
import * as scale from "d3-scale";
import moment from "moment";
import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { StackedBarChart, XAxis, YAxis } from "react-native-svg-charts";
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

  const grouped: Record<string, { running: number; nonRunning: number }> = {};
  weekDays.forEach((day) => {
    grouped[day] = { running: 0, nonRunning: 0 };
  });

  filteredData.forEach((item) => {
    const day = moment(item.executionDay).format("YYYY-MM-DD");
    if (item.running) grouped[day].running += item.trimp;
    else grouped[day].nonRunning += item.trimp;
  });

  const chartData = weekDays.map((day) => ({
    day,
    label: moment(day).format("DD/MM"),
    running: grouped[day].running,
    nonRunning: grouped[day].nonRunning,
  }));

  const dailyTrimpValues = chartData.map((d) => d.running + d.nonRunning);

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

  const keys = ["nonRunning", "running"];
  const colors = ["#f55858", "#fc1c1c"];
  const contentInset = { top: 10, bottom: 10 };

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

        <View style={{ flexDirection: "row", height: 260 }}>
          <YAxis
            data={chartData.map((d) => d.running + d.nonRunning)}
            contentInset={contentInset}
            svg={{ fill: "#999", fontSize: 10 }}
            numberOfTicks={5}
          />

          <View style={{ flex: 1, marginLeft: 8 }}>
            <StackedBarChart
              style={{ flex: 1 }}
              keys={keys}
              colors={colors}
              data={chartData}
              contentInset={contentInset}
              showGrid={false}
            />

            <XAxis
              style={{ marginTop: 6 }}
              data={chartData}
              scale={scale.scaleBand}
              formatLabel={(value, index: any) => chartData[index].label}
              svg={{ fill: "white", fontSize: 10 }}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
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
        </View>
      </Box>

      <View>
        <TrainingMetrics values={dailyTrimpValues} />
      </View>
    </View>
  );
}
