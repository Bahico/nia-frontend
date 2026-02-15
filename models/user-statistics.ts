export interface UserStatisticsItem {
  date: string;
  count: number;
}

export interface UserStatistics {
  days: number;
  hours: number;
  recordings: number;
  mostRecordings: number;
  longestDayStreak: number;
  longestRecordingHours: number;
  items: UserStatisticsItem[];
}
