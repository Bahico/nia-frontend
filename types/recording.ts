/**
 * Recording status types
 */
export type RecordingStatus = 'pending' | 'processed';

/**
 * Recording metadata interface
 * Matches the structure that will be stored in AsyncStorage
 */
export interface Recording {
  id: string;
  title?: string; // Will be provided by backend
  summary?: string; // Will be provided by backend
  duration: number; // in seconds (calculated locally)
  fileUri: string; // Local file path
  createdAt: string; // ISO timestamp
  status: RecordingStatus; // Processing status
  backendId?: string; // ID from backend after processing
}

/**
 * Recording state for the recording page
 */
export interface RecordingState {
  isRecording: boolean;
  duration: number; // in seconds
  recording: any; // expo-av Recording instance
}
