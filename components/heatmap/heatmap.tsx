import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { Props } from "./heatmap.model";

const WEEK_DAYS = 7;
const CELL_GAP = 4;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const HeatmapCalendar: React.FC<Props> = ({
  year,
  values,
  cellSize = 14,
}) => {
  const days = useMemo(() => {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    const map = new Map(values.map(v => [v.date, v.count]));

    const result: { date: string; count: number }[] = [];

    for (
      let d = new Date(start);
      d <= end;
      d.setDate(d.getDate() + 1)
    ) {
      const iso = d.toISOString().split("T")[0];
      result.push({
        date: iso,
        count: map.get(iso) ?? 0,
      });
    }

    return result;
  }, [year, values]);

  const weeks = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < days.length; i += WEEK_DAYS) {
      chunks.push(days.slice(i, i + WEEK_DAYS));
    }
    return chunks;
  }, [days]);

  const firstDayOfYear = useMemo(() => new Date(year, 0, 1).getDay(), [year]);
  const weekdayRows = useMemo(() => {
    const mon = (1 - firstDayOfYear + 7) % 7;
    const wed = (3 - firstDayOfYear + 7) % 7;
    const fri = (5 - firstDayOfYear + 7) % 7;
    return { mon, wed, fri };
  }, [firstDayOfYear]);

  const monthForWeek = useMemo(() => {
    return weeks.map((week, wIndex) => {
      const firstDayOfWeek = wIndex * 7;
      const d = new Date(year, 0, 1);
      d.setDate(d.getDate() + firstDayOfWeek);
      return d.getMonth();
    });
  }, [year, weeks]);

  const getColor = (count: number) => {
    if (count === 0) return "#161b22";
    if (count < 2) return "#0e4429";
    if (count < 4) return "#006d32";
    if (count < 6) return "#26a641";
    return "#39d353";
  };

  const getWeekdayLabel = (rowIndex: number) => {
    if (rowIndex === weekdayRows.mon) return "Mon";
    if (rowIndex === weekdayRows.wed) return "Wed";
    if (rowIndex === weekdayRows.fri) return "Fri";
    return null;
  };

  const weekdayColumnWidth = 28;

  return (
    <View style={{ flexDirection: "row" }}>
      {/* Fixed left column: empty for month row, then Mon/Wed/Fri */}
      <View style={{ width: weekdayColumnWidth, marginRight: 8 }}>
        <View style={{ height: 16, marginBottom: 4 }} />
        {[0, 1, 2, 3, 4, 5, 6].map(rowIndex => (
          <View
            key={rowIndex}
            style={{
              height: cellSize + CELL_GAP,
              justifyContent: "center",
            }}
          >
            {getWeekdayLabel(rowIndex) && (
              <Text style={{ color: "#8b949e", fontSize: 10 }}>
                {getWeekdayLabel(rowIndex)}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Scrollable: month labels + heatmap */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
        <View>
          {/* Month labels row */}
          <View style={{ flexDirection: "row", marginBottom: 4 }}>
            {weeks.map((week, wIndex) => {
              const month = monthForWeek[wIndex];
              const isFirstOfMonth = wIndex === 0 || monthForWeek[wIndex - 1] !== month;
              return (
                <View
                  key={wIndex}
                  style={{
                    width: cellSize,
                    marginRight: CELL_GAP,
                    height: 16,
                    justifyContent: "center",
                  }}
                >
                  {isFirstOfMonth && (
                    <Text style={{ color: "#8b949e", fontSize: 10 }}>
                      {MONTH_NAMES[month]}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Heatmap grid */}
          <View style={{ flexDirection: "row" }}>
            {weeks.map((week, wIndex) => (
              <View key={wIndex} style={{ marginRight: CELL_GAP }}>
                {week.map((day, dIndex) => (
                  <View
                    key={dIndex}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      marginBottom: CELL_GAP,
                      borderRadius: 3,
                      backgroundColor: getColor(day.count),
                    }}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
