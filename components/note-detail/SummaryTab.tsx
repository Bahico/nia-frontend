import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Note, type Content, type NoteOutcomePack } from '@/models/note.model';
import { Template } from '@/models/template';
import {
  processTranscript,
  type ProcessTranscriptRequest,
  type ProcessTranscriptResponse,
} from '@/services/process-transcript.service';
import { getTemplates } from '@/services/template.service';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

/* ─── Single Outcome Pack Content Renderer ───────────────────────────── */

type OutcomePackViewProps = {
  pack: NoteOutcomePack;
};

function ContentBlock({ block }: { block: Content }) {
  const accentColor = useThemeColor({}, 'accent');

  if (block.type === 'TEXT') {
    return (
      <View style={styles.contentBlock}>
        {block.title ? (
          <ThemedText type="defaultSemiBold" style={styles.contentBlockTitle}>
            {block.title}
          </ThemedText>
        ) : null}
        {typeof block.content === 'string' ? (
          <ThemedText style={styles.contentBlockText}>
            {block.content}
          </ThemedText>
        ) : (
          block.items?.map((item, i) => (
            <View key={i} style={styles.listItemRow}>
              <ThemedText style={styles.listItemBullet}>•</ThemedText>
              <ThemedText style={styles.listItemText}>{item}</ThemedText>
            </View>
          ))
        )}
      </View>
    );
  }

  if (block.type === 'TASKS' || block.type === 'ACTION_ITEMS') {
    return (
      <View style={styles.contentBlock}>
        {block.title ? (
          <ThemedText type="defaultSemiBold" style={styles.contentBlockTitle}>
            {block.title}
          </ThemedText>
        ) : null}
        {(block.content as { action: string, isDone: boolean }[])?.map((task, i) => (
          <View key={i} style={styles.taskRow}>
            <Ionicons
              name={task.isDone ? 'checkbox' : 'square-outline'}
              size={18}
              color={task.isDone ? accentColor : 'rgba(255,255,255,0.4)'}
            />
            <ThemedText
              style={[
                styles.taskText,
                task.isDone && styles.taskDone,
              ]}
            >
              {task.action}
            </ThemedText>
          </View>
        ))}
      </View>
    );
  }

  return null;
}

export function OutcomePackView({ pack }: OutcomePackViewProps) {
  if (!pack.content || pack.content.length === 0) {
    return (
      <ThemedText style={styles.emptyTabText}>
        No content in this summary.
      </ThemedText>
    );
  }

  return (
    <>
      {pack.content.map((block, index) => (
        <ContentBlock key={index} block={block} />
      ))}
    </>
  );
}

/* ─── Legacy SummaryTab (kept for backward compat if needed) ───────── */

type SummaryTabProps = {
  note: Note | null;
  outcomePacks: NoteOutcomePack[];
};

export function SummaryTab({ note, outcomePacks }: SummaryTabProps) {
  const hasOutcomePacks = outcomePacks.length > 0;

  if (hasOutcomePacks) {
    return (
      <>
        <ThemedText type="title" style={styles.summaryTitle}>
          Summary
        </ThemedText>
        {outcomePacks.map((pack) => (
          <View key={pack.id} style={styles.outcomePackCard}>
            <ThemedText type="title" style={styles.outcomePackTitle}>
              {pack.title}
            </ThemedText>
          </View>
        ))}
      </>
    );
  }

  if (note?.summary) {
    return (
      <>
        <ThemedText type="title" style={styles.summaryTitle}>
          Summary
        </ThemedText>
        <ThemedText style={styles.summary}>{note.summary}</ThemedText>
      </>
    );
  }

  return <ThemedText style={styles.emptyTabText}>No summary yet.</ThemedText>;
}

/* ─── NoteSummaryModal ─────────────────────────────────────────────── */

type NoteSummaryModalProps = {
  visible: boolean;
  noteId: number | null;
  onClose: () => void;
  onSummaryGenerated: (summary: string) => Promise<void>;
};

export function NoteSummaryModal({
  visible,
  noteId,
  onClose,
  onSummaryGenerated,
}: NoteSummaryModalProps) {
  const { t } = useTranslation();
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
  }, [loadTemplates]);

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
      await onSummaryGenerated(response.content);

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
            {t('note.addSummary')}
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
              <ThemedText style={styles.processingText}>Generating summary...</ThemedText>
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
                {isProcessingSummary ? 'Generating...' : 'Generate'}
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
  summary: {
    fontSize: 17,
    lineHeight: 26,
    opacity: 0.9,
    marginBottom: 24,
  },
  emptyTabText: {
    paddingVertical: 28,
    opacity: 0.65,
    textAlign: 'center',
    lineHeight: 24,
  },
  outcomePackCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  outcomePackTitle: {
    marginBottom: 10,
  },
  /* ─── Content block styles ─── */
  contentBlock: {
    marginTop: 16,
  },
  contentBlockTitle: {
    fontSize: 17,
    marginBottom: 8,
  },
  contentBlockText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.85,
    marginBottom: 4,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingLeft: 4,
  },
  listItemBullet: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.6,
    marginRight: 8,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.85,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  taskText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  taskDone: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  /* ─── Modal styles ─── */
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
