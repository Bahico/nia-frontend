import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Recording } from '@/types/recording';

const RECORDINGS_KEY = '@recordings';
const RECORDINGS_DIR = `${FileSystem.documentDirectory}recordings/`;

/**
 * Ensure recordings directory exists
 */
async function ensureRecordingsDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(RECORDINGS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(RECORDINGS_DIR, { intermediates: true });
  }
}

/**
 * Save a recording (audio file and metadata)
 * @param fileUri - URI of the recorded audio file
 * @param duration - Duration in seconds
 * @returns The saved recording with generated ID
 */
export async function saveRecording(
  fileUri: string,
  duration: number
): Promise<Recording> {
  await ensureRecordingsDir();

  const id = `recording-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const fileName = `recording-${Date.now()}-${id}.m4a`;
  const newFileUri = `${RECORDINGS_DIR}${fileName}`;

  // Move/copy the file to our recordings directory
  await FileSystem.moveAsync({
    from: fileUri,
    to: newFileUri,
  });

  const recording: Recording = {
    id,
    duration,
    fileUri: newFileUri,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  // Get existing recordings
  const existingRecordings = await getAllRecordings();
  existingRecordings.push(recording);

  // Save to AsyncStorage
  await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(existingRecordings));

  return recording;
}

/**
 * Get all recordings sorted by date (newest first)
 * @returns Array of all recordings
 */
export async function getAllRecordings(): Promise<Recording[]> {
  try {
    const data = await AsyncStorage.getItem(RECORDINGS_KEY);
    if (!data) {
      return [];
    }

    const recordings: Recording[] = JSON.parse(data);
    // Sort by createdAt (newest first)
    return recordings.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) {
    console.error('Error getting recordings:', error);
    return [];
  }
}

/**
 * Get a single recording by ID
 * @param id - Recording ID
 * @returns Recording or null if not found
 */
export async function getRecordingById(id: string): Promise<Recording | null> {
  const recordings = await getAllRecordings();
  return recordings.find((r) => r.id === id) || null;
}

/**
 * Delete a recording (file and metadata)
 * @param id - Recording ID
 * @returns true if successful, false otherwise
 */
export async function deleteRecording(id: string): Promise<boolean> {
  try {
    const recording = await getRecordingById(id);
    if (!recording) {
      return false;
    }

    // Delete the audio file
    const fileInfo = await FileSystem.getInfoAsync(recording.fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(recording.fileUri, { idempotent: true });
    }

    // Remove from AsyncStorage
    const recordings = await getAllRecordings();
    const filtered = recordings.filter((r) => r.id !== id);
    await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(filtered));

    return true;
  } catch (error) {
    console.error('Error deleting recording:', error);
    return false;
  }
}

/**
 * Update recording metadata (for backend integration)
 * @param id - Recording ID
 * @param updates - Partial recording data to update
 * @returns Updated recording or null if not found
 */
export async function updateRecording(
  id: string,
  updates: Partial<Recording>
): Promise<Recording | null> {
  try {
    const recordings = await getAllRecordings();
    const index = recordings.findIndex((r) => r.id === id);

    if (index === -1) {
      return null;
    }

    // Update the recording
    recordings[index] = {
      ...recordings[index],
      ...updates,
    };

    // Save back to AsyncStorage
    await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(recordings));

    return recordings[index];
  } catch (error) {
    console.error('Error updating recording:', error);
    return null;
  }
}
