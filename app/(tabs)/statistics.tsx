import { HeatmapCalendar } from '@/components/heatmap/heatmap';
import { ResponsiveContainer } from '@/components/responsive-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGridGutter, useResponsiveValue } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { UserStatistics } from '@/models/user-statistics';
import { getUserStatistics } from '@/services/user-statistics.service';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

const currentYear = new Date().getFullYear();

export default function StatisticsScreen() {
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const cardBg = useThemeColor({}, 'tabBarBackground');
  const tint = useThemeColor({}, 'tint');
  const gutter = useGridGutter();
  const cardPadding = useResponsiveValue({ mobile: 16, tablet: 20, desktop: 24 });

  const loadStats = useCallback(async () => {
    try {
      setError(null);
      const data = await getUserStatistics();
      setStats(data);
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
      setStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ResponsiveContainer>
          <ThemedText type="title" style={styles.title}>
            Statistics
          </ThemedText>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tint} />
            <ThemedText style={styles.loadingText}>Loading statistics…</ThemedText>
          </View>
        </ResponsiveContainer>
      </ThemedView>
    );
  }

  if (error || !stats) {
    return (
      <ThemedView style={styles.container}>
        <ResponsiveContainer>
          <ThemedText type="title" style={styles.title}>
            Statistics
          </ThemedText>
          <View style={styles.loadingContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={tint} />
            <ThemedText style={styles.errorText}>{error ?? 'No data'}</ThemedText>
          </View>
        </ResponsiveContainer>
      </ThemedView>
    );
  }

  const statCards = [
    { label: 'Days', value: stats.days, icon: 'calendar-outline' as const },
    { label: 'Recordings', value: stats.recordings, icon: 'mic-outline' as const },
    { label: 'Day streak', value: stats.longestDayStreak, icon: 'flame-outline' as const },
    { label: 'Hours', value: stats.hours.toFixed(1), icon: 'time-outline' as const },
    { label: 'Most recordings in a day', value: stats.mostRecordings, icon: 'trending-up-outline' as const },
    { label: 'Longest recording (H)', value: stats.longestRecordingHours.toFixed(1), icon: 'hourglass-outline' as const },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ResponsiveContainer>
          <ThemedText type="title" style={styles.title}>
            Statistics
          </ThemedText>

          <View style={[styles.grid, { gap: gutter }]}>
            {statCards.map((card) => (
              <View
                key={card.label}
                style={[
                  styles.cardWrapper,
                  { width: '49%', marginBottom: gutter },
                ]}
              >
                <View
                  style={[
                    styles.card,
                    { backgroundColor: cardBg, padding: cardPadding },
                  ]}
                >
                  {/* <Ionicons
                    name={card.icon}
                    size={24}
                    color={tint}
                    style={styles.cardIcon}
                  /> */}
                  <ThemedText type="subtitle" style={styles.cardLabel}>
                    {card.label}
                  </ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.cardValue}>
                    {card.value}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.heatmapSection}>
            <ThemedText type="subtitle" style={styles.heatmapTitle}>
              Activity
            </ThemedText>
            <HeatmapCalendar
              year={currentYear}
              values={stats.items}
              cellSize={14}
            />
          </View>
        </ResponsiveContainer>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
    paddingBottom: 32,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 32,
    justifyContent: 'space-between'
  },
  cardWrapper: {
    marginBottom: 0,
  },
  card: {
    borderRadius: 16,
    marginBottom: 0,
    height: 130,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardLabel: {
    marginBottom: 4,
    opacity: 0.8,
  },
  cardValue: {
    fontSize: 22,
  },
  heatmapSection: {
    marginTop: 8,
  },
  heatmapTitle: {
    marginBottom: 16,
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 64,
  },
  loadingText: {
    opacity: 0.7,
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.8,
  },
});
