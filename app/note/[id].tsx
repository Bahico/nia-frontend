import { ResponsiveContainer } from '@/components/responsive-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useResponsive, useResponsiveValue } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Note } from '@/models/note.model';
import { getNote } from '@/services/notes.service';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseNoteFromParams(params: Record<string, string | undefined>): Note | null {
  try {
    const raw = params.note;
    if (!raw || typeof raw !== 'string') return null;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && 'id' in parsed && 'title' in parsed) {
      return parsed as Note;
    }
    return null;
  } catch {
    return null;
  }
}

export default function NoteDetailScreen() {
  const params = useLocalSearchParams<{ id: string; note?: string }>();
  const { id } = params;
  const router = useRouter();
  const noteFromParams = parseNoteFromParams(params);
  const [note, setNote] = useState<Note | null>(noteFromParams);
  const [loading, setLoading] = useState(!noteFromParams);
  const [error, setError] = useState<string | null>(null);

  const { isMobile } = useResponsive();
  const textColor = useThemeColor({}, 'text');
  const paddingVertical = useResponsiveValue({
    mobile: 16,
    tablet: 24,
    desktop: 32,
  });
  const titleSize = useResponsiveValue({
    mobile: 24,
    tablet: 28,
    desktop: 32,
  });

  const loadNote = useCallback(async () => {
    if (noteFromParams) {
      setNote(noteFromParams);
      setLoading(false);
      return;
    }
    const noteId = id ? parseInt(id, 10) : NaN;
    if (!id || isNaN(noteId)) {
      setError('Invalid note');
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await getNote(noteId);
      setNote(data);
    } catch (err) {
      console.error('Error loading note:', err);
      setError(err instanceof Error ? err.message : 'Failed to load note');
      setNote(null);
    } finally {
      setLoading(false);
    }
  }, [id, noteFromParams]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const goBack = () => router.back();

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ResponsiveContainer style={styles.containerInner}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backButton} accessibilityLabel="Go back">
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.loadingText}>Loading note…</ThemedText>
          </View>
        </ResponsiveContainer>
      </ThemedView>
    );
  }

  if (error || !note) {
    return (
      <ThemedView style={styles.container}>
        <ResponsiveContainer style={styles.containerInner}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backButton} accessibilityLabel="Go back">
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
            <ThemedText type="title" style={styles.errorTitle}>
              Couldn't load note
            </ThemedText>
            <ThemedText style={styles.errorText}>{error ?? 'Note not found'}</ThemedText>
          </View>
        </ResponsiveContainer>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ResponsiveContainer style={styles.containerInner}>
        <View style={[styles.header, { paddingVertical: paddingVertical ?? 16 }]}>
          <TouchableOpacity onPress={goBack} style={styles.backButton} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText
            type="title"
            style={[styles.title, titleSize ? { fontSize: titleSize } : undefined]}
            numberOfLines={isMobile ? 2 : undefined}
          >
            {note.title || 'No title'}
          </ThemedText>

          {(note.lastViewedAt || note.readingTimeMinutes > 0 || note.wordCount > 0) && (
            <View style={styles.metaRow}>
              <ThemedText style={styles.meta}>
                {note.lastViewedAt ? formatDate(note.lastViewedAt) : ''}
                {note.readingTimeMinutes > 0 && ` · ${note.readingTimeMinutes} min read`}
                {note.wordCount > 0 && ` · ${note.wordCount} words`}
              </ThemedText>
            </View>
          )}

          {note.summary ? (
            <ThemedText style={styles.summary}>{note.summary}</ThemedText>
          ) : null}

          <ThemedText style={styles.content}>{note.content || 'No content.'}</ThemedText>
        </ScrollView>
      </ResponsiveContainer>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  containerInner: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  title: {
    marginBottom: 12,
  },
  metaRow: {
    marginBottom: 20,
  },
  meta: {
    fontSize: 14,
    opacity: 0.65,
  },
  summary: {
    fontSize: 17,
    lineHeight: 26,
    opacity: 0.9,
    marginBottom: 24,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.85,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 64,
  },
  errorTitle: {
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 32,
  },
});
