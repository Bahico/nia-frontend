import { NoteItem } from '@/components/note-item';
import { ResponsiveContainer } from '@/components/responsive-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Folder } from '@/models/folder.model';
import { Note } from '@/models/note.model';
import { createFolder, deleteFolder, getFolders, updateFolder } from '@/services/folder.service';
import { getNotes } from '@/services/notes.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type HistoryFolderId = null | 'trash' | number;

const ALL_FILES_ID: HistoryFolderId = null;
const TRASH_ID: HistoryFolderId = 'trash';

const FOLDER_COLORS = [
  '#F6E34C', // yellow
  '#E34C4C', // red
  '#4CE34C', // green
  '#4C9FE3', // blue
  '#E34CE3', // magenta
  '#E39F4C', // orange
  '#9F4CE3', // purple
];

const FOLDER_ICONS: string[] = [
  'folder-outline',
  'document-text-outline',
  'star-outline',
  'heart-outline',
  'bookmark-outline',
  'briefcase-outline',
  'color-palette-outline',
  'flag-outline',
  'school-outline',
  'cart-outline',
  'key-outline',
  'gift-outline',
];

export default function HistoryScreen() {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<HistoryFolderId>(ALL_FILES_ID);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderSheetVisible, setFolderSheetVisible] = useState(false);
  const [folderFormVisible, setFolderFormVisible] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(FOLDER_COLORS[0]);
  const [formIcon, setFormIcon] = useState(FOLDER_ICONS[0]);
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [folderMenuFolderId, setFolderMenuFolderId] = useState<number | null>(null);

  const router = useRouter();
  const { isTablet, isDesktop } = useResponsive();
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, 'tint');
  const sheetBackground = useThemeColor({}, 'tabBarBackground');

  const folderDisplayName = useMemo(() => {
    if (selectedFolderId === ALL_FILES_ID) return t('history.allFiles');
    if (selectedFolderId === TRASH_ID) return t('history.trash');
    const folder = folders.find((f) => f.id === selectedFolderId);
    return folder?.name ?? t('history.allFiles');
  }, [selectedFolderId, folders, t]);

  const filteredNotes = useMemo(() => {
    if (selectedFolderId === TRASH_ID) return notes.filter((n) => n.isArchived);
    return notes;
  }, [notes, selectedFolderId]);

  const loadFolders = useCallback(async () => {
    try {
      const data = await getFolders();
      setFolders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading folders:', err);
      setFolders([]);
    }
  }, []);

  const loadNotes = useCallback(async () => {
    try {
      setError(null);
      const folderId =
        typeof selectedFolderId === 'number' ? selectedFolderId : undefined;
      const data = await getNotes(
        folderId != null ? { 'foldersId.equals': folderId } : undefined
      );
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError(err instanceof Error ? err.message : t('history.failedToLoadNotes'));
      setNotes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedFolderId, t]);

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

  const openNewFolderForm = useCallback(() => {
    setEditingFolder(null);
    setFormName('');
    setFormColor(FOLDER_COLORS[0]);
    setFormIcon(FOLDER_ICONS[0]);
    setFormError(null);
    setIconDropdownOpen(false);
    setFolderFormVisible(true);
  }, []);

  const openEditFolderForm = useCallback((folder: Folder) => {
    setFolderMenuFolderId(null);
    setEditingFolder(folder);
    setFormName(folder.name);
    setFormColor(folder.color || FOLDER_COLORS[0]);
    setFormIcon(folder.icon || FOLDER_ICONS[0]);
    setFormError(null);
    setIconDropdownOpen(false);
    setFolderFormVisible(true);
  }, []);

  const handleDeleteFolder = useCallback(
    (folder: Folder) => {
      setFolderMenuFolderId(null);
      Alert.alert(
        t('history.deleteFolder'),
        t('history.deleteFolderConfirm', { name: folder.name }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteFolder(folder.id);
                if (selectedFolderId === folder.id) {
                  setSelectedFolderId(ALL_FILES_ID);
                }
                setFolderSheetVisible(false);
                await loadFolders();
              } catch (err) {
                console.error('Error deleting folder:', err);
                Alert.alert(t('common.error'), err instanceof Error ? err.message : t('history.failedToDeleteFolder'));
              }
            },
          },
        ]
      );
    },
    [selectedFolderId, loadFolders, t]
  );

  const closeFolderForm = useCallback(() => {
    if (!formSaving) {
      setFolderFormVisible(false);
      setIconDropdownOpen(false);
    }
  }, [formSaving]);

  const saveFolderForm = useCallback(async () => {
    const name = formName.trim();
    if (!name) {
      setFormError(t('history.nameRequired'));
      return;
    }
    setFormError(null);
    setFormSaving(true);
    try {
      if (editingFolder) {
        await updateFolder({
          ...editingFolder,
          name,
          color: formColor,
          icon: formIcon,
        });
      } else {
        await createFolder({
          name,
          description: '',
          color: formColor,
          icon: formIcon,
          isDefault: false,
          position: folders.length,
        });
      }
      await loadFolders();
      closeFolderForm();
    } catch (err) {
      console.error('Error saving folder:', err);
      setFormError(err instanceof Error ? err.message : t('history.failedToSaveFolder'));
    } finally {
      setFormSaving(false);
    }
  }, [editingFolder, formName, formColor, formIcon, folders.length, loadFolders, closeFolderForm, t]);

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
        {t('history.noNotesYet')}
      </ThemedText>
      <ThemedText style={styles.emptyText}>
        {t('history.noNotesDescription')}
      </ThemedText>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
      <ThemedText type="title" style={styles.emptyTitle}>
        {t('history.couldNotLoadNotes')}
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
              {t('history.title')}
            </ThemedText>
            <View style={styles.headerRow}>
              <Pressable
                style={({ pressed }) => [styles.folderRow, pressed && styles.folderRowPressed]}
                onPress={() => setFolderSheetVisible(true)}
              >
                <ThemedText style={styles.folderName}>{folderDisplayName}</ThemedText>
                <Ionicons name="chevron-down" size={20} color={accentColor} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.plusButton, pressed && styles.folderRowPressed]}
                onPress={openNewFolderForm}
              >
                <Ionicons name="add-circle-outline" size={28} color={accentColor} />
              </Pressable>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.loadingText}>{t('history.loadingNotes')}</ThemedText>
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
            {t('history.title')}
          </ThemedText>
          
          <View style={styles.headerRow}>
            <Pressable
              style={({ pressed }) => [styles.folderRow, pressed && styles.folderRowPressed]}
              onPress={() => setFolderSheetVisible(true)}
            >
              <ThemedText style={styles.folderName}>{folderDisplayName}</ThemedText>
              <Ionicons name="chevron-down" size={20} color={accentColor} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.plusButton, pressed && styles.folderRowPressed]}
              onPress={openNewFolderForm}
            >
              <Ionicons name="add-circle-outline" size={28} color={accentColor} />
            </Pressable>
          </View>
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
          onRequestClose={() => {
            setFolderSheetVisible(false);
            setFolderMenuFolderId(null);
          }}
        >
          <Pressable
            style={[styles.sheetOverlay]}
            onPress={() => {
              setFolderSheetVisible(false);
              setFolderMenuFolderId(null);
            }}
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
                  <ThemedText style={styles.sheetItemText}>{t('history.allFiles')}</ThemedText>
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
                  <ThemedText style={styles.sheetItemText}>{t('history.trash')}</ThemedText>
                </Pressable>
                <View style={styles.sheetDivider} />
                {folders.map((folder) => (
                  <View key={folder.id} style={styles.folderItemWrapper}>
                    <View style={styles.folderItemRow}>
                      <Pressable
                        style={[
                          styles.sheetItem,
                          styles.folderItemMain,
                          selectedFolderId === folder.id && styles.sheetItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedFolderId(folder.id);
                          setFolderSheetVisible(false);
                        }}
                        onLongPress={() => {
                          setFolderSheetVisible(false);
                          openEditFolderForm(folder);
                        }}
                      >
                        <Ionicons
                          name={(folder.icon as keyof typeof Ionicons.glyphMap) || 'folder-outline'}
                          size={22}
                          color="#fff"
                        />
                        <ThemedText style={styles.sheetItemText}>{folder.name}</ThemedText>
                      </Pressable>
                      <Pressable
                        style={styles.folderMoreButton}
                        onPress={() =>
                          setFolderMenuFolderId((id) => (id === folder.id ? null : folder.id))
                        }
                      >
                        <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                      </Pressable>
                    </View>
                    {folderMenuFolderId === folder.id && (
                      <View style={styles.folderMenu}>
                        <Pressable
                          style={styles.folderMenuItem}
                          onPress={() => {
                            setFolderSheetVisible(false);
                            openEditFolderForm(folder);
                          }}
                        >
                          <Ionicons name="pencil-outline" size={20} color="#fff" />
                          <ThemedText style={styles.sheetItemText}>{t('common.edit')}</ThemedText>
                        </Pressable>
                        <Pressable
                          style={[styles.folderMenuItem, styles.folderMenuItemDanger]}
                          onPress={() => handleDeleteFolder(folder)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#E34C4C" />
                          <ThemedText style={[styles.sheetItemText, styles.folderMenuDangerText]}>
                            {t('common.delete')}
                          </ThemedText>
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal
          visible={folderFormVisible}
          transparent
          animationType="slide"
          onRequestClose={closeFolderForm}
        >
          <Pressable style={[styles.sheetOverlay]} onPress={closeFolderForm}>
            <Pressable
              style={[styles.formSheetContent, { backgroundColor: sheetBackground }]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.sheetHandle} />
              <ScrollView
                style={styles.formScroll}
                contentContainerStyle={styles.formScrollContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
              <ThemedText type="title" style={styles.formTitle}>
                {editingFolder ? t('history.editFolder') : t('history.newFolder')}
              </ThemedText>

              <ThemedText style={styles.formLabel}>{t('common.name')}</ThemedText>
              <TextInput
                style={[styles.formInput, { color: '#fff' }]}
                placeholder={t('history.folderName')}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formName}
                onChangeText={setFormName}
                editable={!formSaving}
              />

              <ThemedText style={styles.formLabel}>{t('history.color')}</ThemedText>
              <View style={styles.colorRow}>
                {FOLDER_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      formColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setFormColor(color)}
                  >
                    {formColor === color ? (
                      <Ionicons name="checkmark" size={18} color="#000" />
                    ) : null}
                  </Pressable>
                ))}
              </View>

              <ThemedText style={styles.formLabel}>{t('history.icon')}</ThemedText>
              <View style={styles.iconDropdownWrapper}>
                <Pressable
                  style={styles.iconDropdown}
                  onPress={() => setIconDropdownOpen((v) => !v)}
                  disabled={formSaving}
                >
                  <Ionicons
                    name={(formIcon as keyof typeof Ionicons.glyphMap) || 'folder-outline'}
                    size={24}
                    color="#fff"
                  />
                  <Ionicons
                    name={iconDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#fff"
                  />
                </Pressable>
                {iconDropdownOpen ? (
                  <View style={[styles.iconDropdownList, { backgroundColor: sheetBackground }]}>
                    <View style={styles.iconGrid}>
                      {FOLDER_ICONS.map((iconValue) => (
                        <Pressable
                          key={iconValue}
                          style={[
                            styles.iconGridCell,
                            formIcon === iconValue && styles.iconGridCellSelected,
                          ]}
                          onPress={() => {
                            setFormIcon(iconValue);
                            setIconDropdownOpen(false);
                          }}
                        >
                          <Ionicons
                            name={iconValue as keyof typeof Ionicons.glyphMap}
                            size={26}
                            color="#fff"
                          />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>

              {formError ? (
                <ThemedText style={styles.formError}>{formError}</ThemedText>
              ) : null}

              <View style={styles.formActions}>
                <Pressable
                  style={[styles.formButton, styles.formCancelButton]}
                  onPress={closeFolderForm}
                  disabled={formSaving}
                >
                  <ThemedText style={styles.formCancelText}>{t('common.cancel')}</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.formButton, { backgroundColor: accentColor }]}
                  onPress={saveFolderForm}
                  disabled={formSaving}
                >
                  {formSaving ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <ThemedText style={styles.formSaveText}>{t('common.save')}</ThemedText>
                  )}
                </Pressable>
              </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  plusButton: {
    padding: 4,
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
  sheetDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 8,
    marginHorizontal: 12,
  },
  folderItemWrapper: {
    position: 'relative',
    marginBottom: 4,
  },
  folderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderItemMain: {
    flex: 1,
  },
  folderMoreButton: {
    padding: 12,
    marginLeft: 4,
  },
   folderMenu: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    marginTop: 4,
    minWidth: 140,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.85)',
    overflow: 'hidden',
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  folderMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  folderMenuItemDanger: {},
  folderMenuDangerText: {
    color: '#E34C4C',
  },
  sheetItemText: {
    fontSize: 16,
  },
  formSheetContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
  },
  formScroll: {
    maxHeight: 500,
  },
  formScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  formTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  formLabel: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  iconDropdownWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  iconDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  iconDropdownList: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    padding: 8,
    borderRadius: 10,
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    display: 'flex'
  },
  iconGridCell: {
    width: '16.666%',
    aspectRatio: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
    borderRadius: 8,
  },
  iconGridCellSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  formError: {
    color: '#E34C4C',
    fontSize: 14,
    marginBottom: 12,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  formCancelButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  formCancelText: {
    fontSize: 16,
  },
  formSaveText: {
    fontSize: 16,
    color: '#000',
  },
});
