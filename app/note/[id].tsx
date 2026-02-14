import { ResponsiveContainer } from '@/components/responsive-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useResponsive, useResponsiveValue } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Note } from '@/models/note.model';
import { Template } from '@/models/template';
import { getNote, updateNote } from '@/services/notes.service';
import {
  processTranscript,
  ProcessTranscriptRequest,
  ProcessTranscriptResponse,
} from '@/services/process-transcript.service';
import { getTemplates } from '@/services/template.service';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const { isMobile } = useResponsive();
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');
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
    console.log('Loading note');
    
    const noteId = id ? parseInt(id, 10) : NaN;
    if (!id || isNaN(noteId)) {
      console.log('true');
      setError('Invalid note');
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      const data = await getNote(noteId);
      setNote(data);
      console.log(data);
      
      
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
  }, []);

  const goBack = () => router.back();

  const updateNoteSummary = useCallback(async (summary: string) => {
    if (!note) return;
    console.log(note);
    
    const updatedNote = await updateNote({ ...note, summary });
    setNote(updatedNote);
  }, [note]);

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
          {!note.summary && (
            <TouchableOpacity
              style={[styles.addSummaryButton, { borderColor: accentColor }]}
              onPress={() => setShowSummaryModal(true)}
            >
              <ThemedText style={[styles.addSummaryButtonText, { color: accentColor }]}>
                Add summary
              </ThemedText>
            </TouchableOpacity>
          )}
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
                {note.lastViewedAt && formatDate(note.lastViewedAt) + ' · '}
                {note.readingTimeMinutes} min read
                {note.wordCount > 0 && ` · ${note.wordCount} words`}
              </ThemedText>
            </View>
          )}

          <ThemedText style={styles.content}>{note.content || 'No content.'}</ThemedText>

          {note.summary ? (
            <>
            <ThemedText type="title" style={styles.summaryTitle}>Summary</ThemedText>
            <ThemedText style={styles.summary}>{note.summary}</ThemedText>
            </>
              
          ) : null}
        </ScrollView>
      </ResponsiveContainer>
      <NoteSummaryModal
        visible={showSummaryModal}
        noteId={note?.id ?? null}
        onClose={() => setShowSummaryModal(false)}
        onSummaryGenerated={updateNoteSummary}
      />
    </ThemedView>
  );
}

type NoteSummaryModalProps = {
  visible: boolean;
  noteId: number | null;
  onClose: () => void;
  onSummaryGenerated: (summary: string) => Promise<void>;
};

function NoteSummaryModal({ visible, noteId, onClose, onSummaryGenerated }: NoteSummaryModalProps) {
  const accentColor = useThemeColor({}, 'accent');
  const backgroundColor = useThemeColor({}, 'background');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [isProcessingSummary, setIsProcessingSummary] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    const data = await getTemplates();
    setTemplates(data);
  }, []);

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleClose = () => {
    if (isProcessingSummary) return;
    setSelectedTemplateId(null);
    setProcessingError(null);
    onClose();
  };

  const handleProcessSummary = async () => {
    if (!noteId || isNaN(noteId) || !selectedTemplateId) {
      setProcessingError('Please select a template.');
      return;
    }
    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
    if (!selectedTemplate) {
      setProcessingError('Selected template not found.');
      return;
    }
    setIsProcessingSummary(true);
    setProcessingError(null);
    try {
      const payload: ProcessTranscriptRequest = {
        noteId,
        templateId: selectedTemplateId,
        templateType: selectedTemplate.type,
        type: 'SUMMARY',
      };
      const response: ProcessTranscriptResponse = await processTranscript(payload);
      onSummaryGenerated(response.content);
      setIsProcessingSummary(false);
      setSelectedTemplateId(null);
      onClose();
    } catch (err) {
      console.error('Error processing transcript:', err);
      setProcessingError(err instanceof Error ? err.message : 'Failed to generate summary');
      setIsProcessingSummary(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor }]}>
          <ThemedText type="title" style={styles.modalTitle}>
            Add summary
          </ThemedText>
          <ThemedText style={styles.modalDescription}>
            Choose a template to generate a summary for this note. This may take a little while.
          </ThemedText>

          <ScrollView
            style={styles.templatesScroll}
            contentContainerStyle={styles.templatesScrollContent}
            showsVerticalScrollIndicator={true}
          >
            {templates.map((template) => {
              const isSelected = selectedTemplateId === template.id;
              return (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateItem,
                    {
                      borderColor: isSelected ? accentColor : 'rgba(255,255,255,0.1)',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedTemplateId(template.id)}
                  disabled={isProcessingSummary}
                >
                  <View style={styles.templateHeaderRow}>
                    <ThemedText style={styles.templateName}>{template.name}</ThemedText>
                    {template.category ? (
                      <ThemedText style={styles.templateCategory}>{template.category}</ThemedText>
                    ) : null}
                  </View>
                  {template.description ? (
                    <ThemedText style={styles.templateDescription}>{template.description}</ThemedText>
                  ) : null}
                </TouchableOpacity>
              );
            })}
            {templates.length === 0 && (
              <ThemedText style={styles.modalEmptyText}>
                No templates found. Please create templates first.
              </ThemedText>
            )}
          </ScrollView>

          {processingError ? (
            <ThemedText style={styles.processingErrorText}>{processingError}</ThemedText>
          ) : null}

          {isProcessingSummary && (
            <View style={styles.processingRow}>
              <ActivityIndicator size="small" color={accentColor} />
              <ThemedText style={styles.processingText}>Generating summary…</ThemedText>
            </View>
          )}

          <View style={styles.modalActionsRow}>
            <TouchableOpacity
              style={[styles.modalActionButton, styles.modalCancelButton]}
              onPress={handleClose}
              disabled={isProcessingSummary}
            >
              <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalActionButton,
                styles.modalConfirmButton,
                { backgroundColor: accentColor, opacity: selectedTemplateId ? 1 : 0.6 },
              ]}
              onPress={handleProcessSummary}
              disabled={isProcessingSummary || !selectedTemplateId}
            >
              <ThemedText style={styles.modalConfirmText}>
                {isProcessingSummary ? 'Generating…' : 'Generate'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  summaryTitle: {
    marginBottom: 12,
    marginTop: 24,
  },
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
  addSummaryButton: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  addSummaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    marginBottom: 4,
  },
  modalDescription: {
    opacity: 0.75,
    marginBottom: 16,
  },
  modalLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  modalLoadingText: {
    opacity: 0.8,
  },
  modalErrorContainer: {
    paddingVertical: 16,
    gap: 12,
  },
  modalErrorText: {
    color: '#ff6b6b',
  },
  modalRetryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  modalRetryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  templatesScroll: {
    maxHeight: 260,
    marginBottom: 12,
  },
  templatesScrollContent: {
    paddingVertical: 4,
    gap: 8,
  },
  templateItem: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  templateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  templateName: {
    fontWeight: '600',
    marginRight: 8,
  },
  templateCategory: {
    fontSize: 12,
    opacity: 0.7,
  },
  templateDescription: {
    fontSize: 13,
    opacity: 0.8,
  },
  modalEmptyText: {
    textAlign: 'center',
    opacity: 0.7,
    paddingVertical: 16,
  },
  processingErrorText: {
    marginTop: 4,
    color: '#ff6b6b',
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  processingText: {
    opacity: 0.8,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
  },
  modalConfirmButton: {},
  modalCancelText: {
    opacity: 0.8,
  },
  modalConfirmText: {
    color: '#000',
    fontWeight: '600',
  },
});
