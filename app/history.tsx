import { RecordingItem } from '@/components/recording-item';
import { RecordingPlayer } from '@/components/recording-player';
import { ResponsiveContainer } from '@/components/responsive-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Recording } from '@/types/recording';
import { deleteRecording, getAllRecordings } from '@/utils/recording-storage';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  View
} from 'react-native';

export default function HistoryScreen() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const { isMobile, isTablet, isDesktop } = useResponsive();
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const allRecordings = await getAllRecordings();
      setRecordings(allRecordings);
    } catch (error) {
      console.error('Error loading recordings:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecordings();

    // TODO: Backend Integration
    // Sync with backend to get updated summaries/titles
    // Example:
    // const pendingRecordings = recordings.filter(r => r.status === 'pending');
    // for (const recording of pendingRecordings) {
    //   const response = await fetch(`YOUR_API_ENDPOINT/${recording.backendId || recording.id}`);
    //   const data = await response.json();
    //   if (data.status === 'processed') {
    //     await updateRecording(recording.id, {
    //       summary: data.summary,
    //       title: data.title,
    //       status: 'processed',
    //       backendId: data.id,
    //     });
    //   }
    // }
    // await loadRecordings();

    setRefreshing(false);
  }, []);

  const handlePlay = (recording: Recording) => {
    setSelectedRecording(recording);
    setIsPlayerVisible(true);
  };

  const handleDelete = (recording: Recording) => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteRecording(recording.id);
            if (success) {
              await loadRecordings();
            } else {
              Alert.alert('Error', 'Failed to delete recording. Please try again.');
            }
          },
        },
      ]
    );
  };

  const closePlayer = () => {
    setIsPlayerVisible(false);
    setSelectedRecording(null);
  };

  const renderItem = ({ item }: { item: Recording }) => {
    return (
      <RecordingItem
        recording={item}
        onPlay={handlePlay}
        onDelete={handleDelete}
      />
    );
  };

  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="mic-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
        <ThemedText type="title" style={styles.emptyTitle}>
          No Recordings Yet
        </ThemedText>
        <ThemedText style={styles.emptyText}>
          Start recording to see your voice summaries here
        </ThemedText>
      </View>
    );
  };

  const numColumns = isDesktop ? 2 : isTablet ? 2 : 1;

  return (
    <ThemedView style={styles.container}>
      <ResponsiveContainer>
      <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            History
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}
          </ThemedText>
        </View>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            History
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}
          </ThemedText>
        </View>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            History
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}
          </ThemedText>
        </View>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            History
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}
          </ThemedText>
        </View>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            History
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}
          </ThemedText>
        </View>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            History
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}
          </ThemedText>
        </View>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            History
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}
          </ThemedText>
        </View>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            History
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}
          </ThemedText>
        </View>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            History
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}
          </ThemedText>
        </View>

        <FlatList
          data={recordings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            recordings.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          key={numColumns} // Force re-render when columns change
        />
      </ResponsiveContainer>

      <Modal
        visible={isPlayerVisible}
        transparent
        animationType="slide"
        onRequestClose={closePlayer}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            {selectedRecording && (
              <RecordingPlayer recording={selectedRecording} onClose={closePlayer} />
            )}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: 2000,
    paddingBottom: 2000,
    overflow: 'scroll',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
  },
});
