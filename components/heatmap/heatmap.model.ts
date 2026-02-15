export type HeatmapValue = {
    date: string; // "2026-02-10"
    count: number;
};
  
export type HeatmapCalendarProps = {
    year: number;
    values: HeatmapValue[];
    cellSize?: number;
};

export type Props = {
    year: number;
    values: HeatmapValue[];
    cellSize?: number;
};