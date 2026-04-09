import { ThemedText } from '@/components/themed-text';
import { Note, type NoteDetail } from '@/models/note.model';
import { StyleSheet } from 'react-native';

type TranscriptTabProps = {
  note: Note | null;
  noteDetail: NoteDetail | null;
  hasNote: boolean;
};

export function TranscriptTab({ note, noteDetail, hasNote }: TranscriptTabProps) {
  const text = hasNote
    ? note?.diarizationContent || note?.content || noteDetail?.content || 'No transcript available.'
    : 'No transcript yet.';

  return <ThemedText style={hasNote ? styles.content : styles.emptyTabText}>{text}</ThemedText>;
}

const styles = StyleSheet.create({
  content: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.85,
  },
  emptyTabText: {
    paddingVertical: 28,
    opacity: 0.65,
    textAlign: 'center',
    lineHeight: 24,
  },
});

