import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Note } from '@/models/note.model';

interface NoteItemProps {
  note: Note;
  onPress: (note: Note) => void;
}

function formatDate(dateString: string): string {
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
}

function truncateSummary(summary: string | undefined, maxLength: number = 150): string {
  if (!summary) return '';
  if (summary.length <= maxLength) return summary;
  return summary.substring(0, maxLength) + '...';
}

export function NoteItem({ note, onPress }: NoteItemProps) {
  const accentColor = useThemeColor({}, 'accent');

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(note)}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={1}>
            {note.title || 'Untitled'}
          </ThemedText>
          <ThemedText style={styles.meta}>
            {formatDate(note.lastViewedAt)}
            {note.readingTimeMinutes > 0 && ` • ${note.readingTimeMinutes} min read`}
          </ThemedText>
        </View>

        <View style={styles.summaryContainer}>
          <ThemedText style={styles.summary} numberOfLines={3}>
            {note.summary
              ? truncateSummary(note.summary)
              : note.content
                ? truncateSummary(note.content)
                : 'No content'}
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <View style={styles.readMoreRow}>
            <ThemedText style={[styles.readMore, { color: accentColor }]}>View</ThemedText>
            <Ionicons name="chevron-forward" size={16} color={accentColor} />
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
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
  title: {
    flex: 1,
  },
  meta: {
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
  footer: {
    marginTop: 4,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '500',
  },
});
