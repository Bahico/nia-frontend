import { NoteItem } from '@/components/note-item';
import { ResponsiveContainer } from '@/components/responsive-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useResponsive } from '@/hooks/use-responsive';
import { Note } from '@/models/note.model';
import { getNotes } from '@/services/notes.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View
} from 'react-native';

export default function HistoryScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const { isTablet, isDesktop } = useResponsive();

  const loadNotes = useCallback(async () => {
    try {
      setError(null);
      const data = await getNotes();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notes');
      setNotes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotes();
  }, [loadNotes]);

  const handleNotePress = (note: Note) => {
    router.push({
      pathname: '/note/[id]',
      params: {
        id: String(note.id),
        note: JSON.stringify({
          id: note.id,
          title: note.title,
          content: note.content,
          summary: note.summary,
          lastViewedAt: note.lastViewedAt,
          readingTimeMinutes: note.readingTimeMinutes,
          wordCount: note.wordCount,
        }),
      },
    });
  };

  const renderItem = ({ item }: { item: Note }) => (
    <NoteItem note={item} onPress={handleNotePress} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
      <ThemedText type="title" style={styles.emptyTitle}>
        No Notes Yet
      </ThemedText>
      <ThemedText style={styles.emptyText}>
        Your saved notes will appear here
      </ThemedText>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
      <ThemedText type="title" style={styles.emptyTitle}>
        Couldn't load notes
      </ThemedText>
      <ThemedText style={styles.emptyText}>{error}</ThemedText>
    </View>
  );

  const numColumns = isDesktop ? 2 : isTablet ? 2 : 1;

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ResponsiveContainer>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              History
            </ThemedText>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.loadingText}>Loading notes…</ThemedText>
          </View>
        </ResponsiveContainer>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ResponsiveContainer>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            History
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </ThemedText>
        </View>

        <FlatList
          data={notes}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.listContent,
            notes.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={error ? renderError : renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          key={numColumns}
          showsVerticalScrollIndicator={true}
        />
      </ResponsiveContainer>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
    gap: 4,
  },
  title: {
    marginBottom: 0,
  },
  subtitle: {
    opacity: 0.7,
    fontSize: 14,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 64,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 32,
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
});
