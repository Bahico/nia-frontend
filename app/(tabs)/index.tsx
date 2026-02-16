import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';


import { ResponsiveContainer } from '@/components/responsive-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { sendRecordedFile } from "@/services/record.service";
import { useTranslation } from 'react-i18next';
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";

export default function RecordScreen() {
  const { t } = useTranslation();
  const [duration, setDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<number | null>(null);
  const router = useRouter();

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const { isMobile } = useResponsive();
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

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

  const record = async () => {
    setDuration(0);

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    intervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    // The recording will be available on `audioRecorder.uri`.
    setIsSaving(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    await audioRecorder.stop();

    try {
      await sendRecordedFile(audioRecorder.uri as string);
      setIsSaving(false);
      setShowSuccessModal(true);
    } catch (error) {
      setIsSaving(false);
      Alert.alert(t('common.error'), t('record.saveRecordingFailed'));
    }
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert(t('common.error'), t('record.permissionDenied'));
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

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
              <ThemedText style={styles.loadingText}>{t('record.requestingPermissions')}</ThemedText>
            </View>
          </ScrollView>
        </ResponsiveContainer>
      </ThemedView>
    );
  }

  if (!hasPermission) {
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
                {t('record.microphoneRequired')}
              </ThemedText>
              <ThemedText style={styles.errorText}>
                {t('record.microphoneEnable')}
              </ThemedText>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: accentColor }]}
                onPress={requestPermissions}
              >
                <ThemedText style={styles.buttonText}>{t('record.grantPermission')}</ThemedText>
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
          <View style={{...styles.content}}>
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                {t('record.recordVoice')}
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                {t('record.tapToStart')}
              </ThemedText>
            </View>

            <View style={styles.recordingArea}>
              {/* Timer Display */}
              <View style={styles.timerContainer}>
                <ThemedText
                  type="title"
                  style={[
                    styles.timer,
                    recorderState.isRecording && styles.timerRecording,
                    { color: recorderState.isRecording ? accentColor : textColor },
                  ]}
                >
                  {formatTime(duration)}
                </ThemedText>
                {recorderState.isRecording && (
                  <View style={[styles.recordingIndicator, { backgroundColor: accentColor }]} />
                )}
              </View>

              {/* Record Button */}
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  recorderState.isRecording && styles.recordButtonRecording,
                  { borderColor: accentColor },
                  recorderState.isRecording && { backgroundColor: accentColor },
                ]}
                onPress={recorderState.isRecording ? stopRecording : record}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="large" color={textColor} />
                ) : (
                  <Ionicons
                    name={recorderState.isRecording ? 'stop' : 'mic'}
                    size={isMobile ? 48 : 64}
                    color={recorderState.isRecording ? textColor : accentColor}
                  />
                )}
              </TouchableOpacity>

              {/* Status Text */}
              <ThemedText style={styles.statusText}>
                {isSaving
                  ? t('record.saving')
                  : recorderState.isRecording
                    ? t('record.recordingInProgress')
                    : t('record.readyToRecord')}
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </ResponsiveContainer>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          router.push('/(tabs)/history');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <Ionicons name="checkmark-circle" size={64} color={accentColor} style={styles.successIcon} />
            <ThemedText type="title" style={styles.successTitle}>
              {t('record.savedSuccess')}
            </ThemedText>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: accentColor }]}
              onPress={() => {
                setShowSuccessModal(false);
                router.push('/(tabs)/history');
              }}
            >
              <ThemedText style={styles.modalButtonText}>{t('common.ok')}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  modalButtonText: {
    color: '#000',
    fontWeight: '600',
    textAlign: 'center',
  },
});
