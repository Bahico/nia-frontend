import { NoteItem } from '@/components/note-item';
import { ResponsiveContainer } from '@/components/responsive-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Folder } from '@/models/folder.model';
import { Note } from '@/models/note.model';
import { getFolders } from '@/services/folder.service';
import { getNotes } from '@/services/notes.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type HistoryFolderId = null | 'trash' | number;

const ALL_FILES_ID: HistoryFolderId = null;
const TRASH_ID: HistoryFolderId = 'trash';
const ALL_FILES_LABEL = 'All files';
const TRASH_LABEL = 'Trash';

export default function HistoryScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<HistoryFolderId>(ALL_FILES_ID);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderSheetVisible, setFolderSheetVisible] = useState(false);

  const router = useRouter();
  const { isTablet, isDesktop } = useResponsive();
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, 'tint');
  const sheetBackground = useThemeColor({}, 'tabBarBackground');

  const folderDisplayName = useMemo(() => {
    if (selectedFolderId === ALL_FILES_ID) return ALL_FILES_LABEL;
    if (selectedFolderId === TRASH_ID) return TRASH_LABEL;
    const folder = folders.find((f) => f.id === selectedFolderId);
    return folder?.name ?? ALL_FILES_LABEL;
  }, [selectedFolderId, folders]);

  const filteredNotes = useMemo(() => {
    if (selectedFolderId === ALL_FILES_ID) return notes;
    if (selectedFolderId === TRASH_ID) return notes.filter((n) => n.isArchived);
    return notes.filter((n) => n.folders?.some((f) => f.id === selectedFolderId));
  }, [notes, selectedFolderId]);

  const loadFolders = useCallback(async () => {
    try {
      const data = await getFolders();
      console.log(data);
      
      setFolders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading folders:', err);
      setFolders([]);
    }
  }, []);

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

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

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
            <Pressable
              style={({ pressed }) => [styles.folderRow, pressed && styles.folderRowPressed]}
              onPress={() => setFolderSheetVisible(true)}
            >
              <ThemedText style={styles.folderName}>{folderDisplayName}</ThemedText>
              <Ionicons name="chevron-down" size={20} color={accentColor} />
            </Pressable>
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
          
          <Pressable
            style={({ pressed }) => [styles.folderRow, pressed && styles.folderRowPressed]}
            onPress={() => setFolderSheetVisible(true)}
          >
            <ThemedText style={styles.folderName}>{folderDisplayName}</ThemedText>
            <Ionicons name="chevron-down" size={20} color={accentColor} />
          </Pressable>
        </View>

        <FlatList
          data={filteredNotes}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.listContent,
            filteredNotes.length === 0 && styles.listContentEmpty,
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

        <Modal
          visible={folderSheetVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setFolderSheetVisible(false)}
        >
          <Pressable
            style={[styles.sheetOverlay]}
            onPress={() => setFolderSheetVisible(false)}
          >
            <Pressable style={[styles.sheetContent, { backgroundColor: sheetBackground }]} onPress={(e) => e.stopPropagation()}>
              <View style={styles.sheetHandle} />
              <ScrollView
                style={styles.sheetScroll}
                contentContainerStyle={styles.sheetScrollContent}
                showsVerticalScrollIndicator={true}
              >
                <Pressable
                  style={[
                    styles.sheetItem,
                    selectedFolderId === ALL_FILES_ID && styles.sheetItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedFolderId(ALL_FILES_ID);
                    setFolderSheetVisible(false);
                  }}
                >
                  <Ionicons name="folder-open-outline" size={22} color="#fff" />
                  <ThemedText style={styles.sheetItemText}>{ALL_FILES_LABEL}</ThemedText>
                </Pressable>
                <Pressable
                  style={[
                    styles.sheetItem,
                    selectedFolderId === TRASH_ID && styles.sheetItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedFolderId(TRASH_ID);
                    setFolderSheetVisible(false);
                  }}
                >
                  <Ionicons name="trash-outline" size={22} color="#fff" />
                  <ThemedText style={styles.sheetItemText}>{TRASH_LABEL}</ThemedText>
                </Pressable>
                {folders.map((folder) => (
                  <Pressable
                    key={folder.id}
                    style={[
                      styles.sheetItem,
                      selectedFolderId === folder.id && styles.sheetItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedFolderId(folder.id);
                      setFolderSheetVisible(false);
                    }}
                  >
                    <Ionicons name="folder-outline" size={22} color="#fff" />
                    <ThemedText style={styles.sheetItemText}>{folder.name}</ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </ResponsiveContainer>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 32,
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
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 4,
    borderRadius: 8,
  },
  folderRowPressed: {
    opacity: 0.7,
  },
  folderName: {
    fontSize: 15,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetScroll: {
    maxHeight: 400,
  },
  sheetScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  sheetItemSelected: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  sheetItemText: {
    fontSize: 16,
  },
});
