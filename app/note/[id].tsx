import { NoteTabBar, type DetailTab } from '@/components/note-detail/NoteTabBar';
import { NoteSummaryModal, OutcomePackView } from '@/components/note-detail/SummaryTab';
import { TranscriptTab } from '@/components/note-detail/TranscriptTab';
import { ResponsiveContainer } from '@/components/responsive-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useResponsive, useResponsiveValue } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Note, type NoteDetail } from '@/models/note.model';
import { getFile } from '@/services/files.service';
import { getNoteDetail } from '@/services/notes.service';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

function diarizationToText(diarization: NoteDetail['diarization'] | undefined | null): string {
  const segments = diarization?.segments ?? [];
  if (segments.length === 0) return '';
  return segments
    .map((seg) => {
      const speaker = seg.speaker?.trim();
      return speaker ? `${speaker}: ${seg.text}` : seg.text;
    })
    .join('\n');
}

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
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id: string; note?: string }>();
  const { id } = params;
  const router = useRouter();
  const noteFromParams = parseNoteFromParams(params);
  const [note, setNote] = useState<Note | null>(noteFromParams);
  const [noteDetail, setNoteDetail] = useState<NoteDetail | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('transcript');
  const [detailLoaded, setDetailLoaded] = useState(false);
  const [loading, setLoading] = useState(!noteFromParams);
  const [error, setError] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const { isMobile } = useResponsive();
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');
  const backgroundColor = useThemeColor({}, 'background');
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
    const fileId = id ? parseInt(id, 10) : NaN;
    if (!id || isNaN(fileId)) {
      setError(t('note.invalidNote'));
      setLoading(false);
      setDetailLoaded(false);
      return;
    }

    try {
      setError(null);
      setDetailLoaded(false);
      console.log('fileId', fileId);
      const file = await getFile(fileId);
      if (!file.note) {
        setError(t('note.invalidNote'));
        setLoading(false);
        setDetailLoaded(false);
        return;
      }
      const detail = await getNoteDetail(file.note.id);
      setNoteDetail(detail);
      console.log('detail', detail);
      setNote({
        id: detail.id,
        title: detail.title,
        content: detail.content,
        diarizationContent: diarizationToText(detail.diarization) || detail.content || '',
        summary: detail.summary,
        isArchived: detail.isArchived,
        isPinned: detail.isPinned,
        isUpload: detail.isUpload,
        viewCount: detail.viewCount,
        lastViewedAt: detail.lastViewedAt,
        wordCount: detail.wordCount,
        readingTimeMinutes: detail.readingTimeMinutes,
        folders: [],
      });
    } catch (err) {
      console.error('Error loading note:', err);
      setError(err instanceof Error ? err.message : t('note.failedToLoadNote'));
      setNote(null);
      setNoteDetail(null);
    } finally {
      setLoading(false);
      setDetailLoaded(true);
    }
  }, [id, t]);


  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const goBack = () => router.back();

  const updateNoteSummary = useCallback(async () => {
    loadNote();
  }, [loadNote]);

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
            <ThemedText style={styles.loadingText}>{t('note.loadingNote')}</ThemedText>
          </View>
        </ResponsiveContainer>
      </ThemedView>
    );
  }

  if (error) {
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
              {t('note.couldNotLoadNote')}
            </ThemedText>
            <ThemedText style={styles.errorText}>{error ?? t('note.noteNotFound')}</ThemedText>
          </View>
        </ResponsiveContainer>
      </ThemedView>
    );
  }

  const diarizationText = diarizationToText(noteDetail?.diarization);
  const hasNote =
    Boolean(note?.content?.trim()) ||
    Boolean(diarizationText.trim()) ||
    Boolean(note?.summary?.trim());
  const outcomePacks = noteDetail?.outcomePacks ?? [];

  // Determine which content to show based on active tab
  const isTranscript = activeTab === 'transcript';
  const activePackId = !isTranscript ? parseInt(activeTab.replace('pack-', ''), 10) : null;
  const activePack = activePackId != null
    ? outcomePacks.find((p) => p.id === activePackId)
    : null;

  const showTranscriptAction = !hasNote && isTranscript;
  const hasBottomAction = showTranscriptAction;
  const scrollPaddingBottom = hasBottomAction ? 140 : 48;

  return (
    <ThemedView style={styles.container}>
      <ResponsiveContainer style={styles.containerInner}>
        <View style={[styles.header, { paddingVertical: paddingVertical ?? 16 }]}>
          <TouchableOpacity onPress={goBack} style={styles.backButton} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <NoteTabBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          accentColor={accentColor}
          outcomePacks={outcomePacks}
          onAddPress={() => setShowSummaryModal(true)}
        />

        <View style={styles.pageBody}>
          <ScrollView
            key={activeTab}
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText
              type="title"
              style={[styles.title, titleSize ? { fontSize: titleSize } : undefined]}
              numberOfLines={isMobile ? 2 : undefined}
            >
              {note?.title || t('note.noTitle')}
            </ThemedText>

            {(note?.lastViewedAt || note?.readingTimeMinutes > 0 || note?.wordCount > 0) && (
              <View style={styles.metaRow}>
                <ThemedText style={styles.meta}>
                  {note?.lastViewedAt && formatDate(note?.lastViewedAt) + ' · '}
                  {note?.readingTimeMinutes} {t('note.minRead')}
                  {note?.wordCount > 0 && ` · ${note?.wordCount} ${t('note.words')}`}
                </ThemedText>
              </View>
            )}

            {/* Transcript tab content */}
            {isTranscript && (
              <TranscriptTab note={note} noteDetail={noteDetail} hasNote={hasNote} />
            )}

            {/* Outcome pack tab content */}
            {activePack && (
              <OutcomePackView pack={activePack} />
            )}

            {/* If a pack tab is selected but pack not found */}
            {!isTranscript && !activePack && (
              <ThemedText style={styles.emptyTabText}>
                Summary not found.
              </ThemedText>
            )}
          </ScrollView>

          {showTranscriptAction && (
            <View style={[styles.bottomActionBar, { backgroundColor }]}>
              <TouchableOpacity
                style={[styles.bottomActionButton, { borderColor: accentColor }]}
                onPress={() =>
                  Alert.alert(t('common.ok'), t('history.reTranscribeComingSoon'))
                }
              >
                <ThemedText style={[styles.bottomActionButtonText, { color: accentColor }]}>
                  {t('history.reTranscribe')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
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

const styles = StyleSheet.create({
  summaryTitle: {
    marginBottom: 12,
    marginTop: 24,
  },
  container: {
    flex: 1,
    paddingTop: 32,
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
  pageBody: {
    flex: 1,
  },
  bottomActionBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  bottomActionButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTabText: {
    paddingVertical: 28,
    opacity: 0.65,
    textAlign: 'center',
    lineHeight: 24,
  },
});
