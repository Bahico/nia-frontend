import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Recording } from '@/types/recording';

interface RecordingItemProps {
  recording: Recording;
  onPlay: (recording: Recording) => void;
  onDelete?: (recording: Recording) => void;
}

export function RecordingItem({ recording, onPlay, onDelete }: RecordingItemProps) {
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const isPending = recording.status === 'pending';

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const truncateSummary = (summary: string | undefined, maxLength: number = 150): string => {
    if (!summary) return '';
    if (summary.length <= maxLength) return summary;
    return summary.substring(0, maxLength) + '...';
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {recording.title || 'Untitled'}
          </ThemedText>
          {isPending && (
            <View style={[styles.statusBadge, { backgroundColor: accentColor }]}>
              <ThemedText style={styles.statusText}>Pending</ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={styles.date}>
          {formatDate(recording.createdAt)} • {formatDuration(recording.duration)}
        </ThemedText>
      </View>

      <View style={styles.summaryContainer}>
        <ThemedText style={styles.summary}>
          {isPending
            ? 'Processing...'
            : recording.summary
              ? truncateSummary(recording.summary)
              : 'No summary available'}
        </ThemedText>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: accentColor }]}
          onPress={() => onPlay(recording)}
        >
          <Ionicons name="play" size={20} color={accentColor} />
          <ThemedText style={[styles.actionText, { color: accentColor }]}>Play</ThemedText>
        </TouchableOpacity>

        {onDelete && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(recording)}
          >
            <Ionicons name="trash-outline" size={20} color={textColor} />
            <ThemedText style={styles.actionText}>Delete</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  header: {
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000',
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  summaryContainer: {
    marginTop: 4,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  deleteButton: {
    borderColor: 'transparent',
    opacity: 0.6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
