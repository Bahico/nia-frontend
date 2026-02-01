import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

import { ResponsiveContainer } from '@/components/responsive-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiPostFormData } from '@/utils/api-client';
import { saveRecording } from '@/utils/recording-storage';

export default function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<number | null>(null);

  const { isMobile } = useResponsive();
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
    return () => {
      // Cleanup on unmount
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setHasPermission(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Microphone permission is required to record audio.',
        [{ text: 'OK', onPress: requestPermissions }]
      );
      return;
    }

    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setDuration(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      if (!uri) {
        throw new Error('No recording URI');
      }

      recordingRef.current = null;
      setIsRecording(false);

      // Save the recording
      await saveRecordingToStorage(uri, duration);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
      setIsRecording(false);
    }
  };

  const saveRecordingToStorage = async (uri: string, duration: number) => {
    setIsSaving(true);
    try {
      // Validate URI exists
      if (!uri) {
        throw new Error('No recording file found. Please try recording again.');
      }

      // Verify file exists before attempting to upload
      // const fileResponse = await fetch(uri);
      // const blob = (await fileResponse.blob() as any)._data;

      // Use mp3 format with standard MIME type
      const filename = `recording-${Date.now()}.mp3`;
      const mimeType = 'audio/mpeg'; // Standard mp3 MIME type
      
      // Create FormData for API request
      // React Native FormData accepts an object with uri, type, and name
      // This ensures the file is sent with the correct MIME type (mp3)
      const formData = new FormData();

      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      // Append audio file using React Native FormData format (required)
      formData.append('audioFile', {
        uri,
        name: `recording.${fileType}`,
        type: `audio/x-${fileType}`,
      } as any);
      
      // Append transcriptModel (required) - set to GROQ
      formData.append('transcriptModel', 'GROQ');
      
      // Context is optional, so we skip it for now
      // If you need to add context later, you can add:
      // formData.append('context', contextString);

      // Send to backend API
      try {
        console.log('nice');
        console.log(formData.get('audioFile'));
        
        const apiResponse = await apiPostFormData('/transcript', formData);
        console.log('Recording uploaded successfully:', apiResponse);
      } catch (apiError: any) {
        // Handle specific API errors
        if (apiError?.message?.includes('Authentication') || apiError?.message?.includes('token')) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (apiError?.message?.includes('Network') || apiError?.message?.includes('fetch')) {
          throw new Error('Network error. Please check your connection and try again.');
        } else if (apiError?.message) {
          throw new Error(`Upload failed: ${apiError.message}`);
        } else {
          throw new Error('Failed to upload recording. Please try again.');
        }
      }
      
      // Save recording locally after successful upload
      await saveRecording(uri, duration);
      setDuration(0);

      Alert.alert(
        'Recording Saved',
        'Your recording has been saved and is being processed.',
        [
          {
            text: 'View History',
            onPress: () => router.push('/history'),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (error: any) {
      console.error('Error saving recording:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to save recording. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <ResponsiveContainer>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={accentColor} />
              <ThemedText style={styles.loadingText}>Requesting permissions...</ThemedText>
            </View>
          </ScrollView>
        </ResponsiveContainer>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <ResponsiveContainer>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.centerContent}>
              <Ionicons name="mic-off" size={64} color={textColor} style={styles.icon} />
              <ThemedText type="title" style={styles.errorTitle}>
                Microphone Access Required
              </ThemedText>
              <ThemedText style={styles.errorText}>
                Please enable microphone permissions in your device settings to record audio.
              </ThemedText>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: accentColor }]}
                onPress={requestPermissions}
              >
                <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ResponsiveContainer>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ResponsiveContainer>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                Record Voice
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Tap the button below to start recording
              </ThemedText>
            </View>

            <View style={styles.recordingArea}>
              {/* Timer Display */}
              <View style={styles.timerContainer}>
                <ThemedText
                  type="title"
                  style={[
                    styles.timer,
                    isRecording && styles.timerRecording,
                    { color: isRecording ? accentColor : textColor },
                  ]}
                >
                  {formatTime(duration)}
                </ThemedText>
                {isRecording && (
                  <View style={[styles.recordingIndicator, { backgroundColor: accentColor }]} />
                )}
              </View>

              {/* Record Button */}
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonRecording,
                  { borderColor: accentColor },
                  isRecording && { backgroundColor: accentColor },
                ]}
                onPress={handleRecordPress}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="large" color={textColor} />
                ) : (
                  <Ionicons
                    name={isRecording ? 'stop' : 'mic'}
                    size={isMobile ? 48 : 64}
                    color={isRecording ? textColor : accentColor}
                  />
                )}
              </TouchableOpacity>

              {/* Status Text */}
              <ThemedText style={styles.statusText}>
                {isSaving
                  ? 'Saving...'
                  : isRecording
                    ? 'Recording in progress'
                    : 'Ready to record'}
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </ResponsiveContainer>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  recordingArea: {
    alignItems: 'center',
    gap: 24,
  },
  timerContainer: {
    alignItems: 'center',
    gap: 12,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    height: 100,
    lineHeight: 100,
  },
  timerRecording: {
    opacity: 1,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.8,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  recordButtonRecording: {
    borderWidth: 0,
  },
  statusText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  icon: {
    opacity: 0.5,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
  },
});
