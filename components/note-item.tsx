import { StyleSheet, View, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Note } from '@/models/note.model';
import { useTranslation } from 'react-i18next';

export type NoteMoreAction = 're-transcribe' | 'move-to-folder' | 'rename' | 'move-to-trash';

interface NoteItemProps {
  note: Note;
  onPress: (note: Note) => void;
  onMoreAction?: (note: Note, action: NoteMoreAction) => void;
  moreMenuOpen?: boolean;
  onMorePress?: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function truncateSummary(summary: string | undefined, maxLength: number = 150): string {
  if (!summary) return '';
  if (summary.length <= maxLength) return summary;
  return summary.substring(0, maxLength) + '...';
}

export function NoteItem({
  note,
  onPress,
  onMoreAction,
  moreMenuOpen,
  onMorePress,
}: NoteItemProps) {
  const { t } = useTranslation();
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');

  const content = (
    <>
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={1}>
          {note.title || 'Untitled'}
        </ThemedText>
        <ThemedText style={styles.meta}>
          {formatDate(note.lastViewedAt)}
          {note.readingTimeMinutes > 0 && ` • ${note.readingTimeMinutes} min read`}
        </ThemedText>
      </View>

      <View style={styles.summaryContainer}>
        <ThemedText style={styles.summary} numberOfLines={3}>
          {note.summary
            ? truncateSummary(note.summary)
            : note.content
              ? truncateSummary(note.content)
              : 'No content'}
        </ThemedText>
      </View>

      <View style={styles.footer}>
        <View style={styles.readMoreRow}>
          <ThemedText style={[styles.readMore, { color: accentColor }]}>View</ThemedText>
          <Ionicons name="chevron-forward" size={16} color={accentColor} />
        </View>
      </View>
    </>
  );

  const menuItems: { action: NoteMoreAction; icon: keyof typeof Ionicons.glyphMap; labelKey: string }[] = [
    { action: 're-transcribe', icon: 'refresh-outline', labelKey: 'history.reTranscribe' },
    { action: 'move-to-folder', icon: 'folder-open-outline', labelKey: 'history.moveToFolder' },
    { action: 'rename', icon: 'pencil-outline', labelKey: 'history.rename' },
    { action: 'move-to-trash', icon: 'trash-outline', labelKey: 'history.moveToTrash' },
  ];

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(note)}
        style={styles.touchable}
      >
        <ThemedView style={styles.container}>
          {content}
        </ThemedView>
      </TouchableOpacity>
      {onMoreAction != null && onMorePress != null && (
        <View style={styles.moreWrapper}>
          <Pressable
            style={({ pressed }) => [styles.moreButton, pressed && styles.moreButtonPressed]}
            onPress={onMorePress}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={textColor} />
          </Pressable>
          {moreMenuOpen && (
            <View style={styles.moreMenu}>
              {menuItems.map(({ action, icon, labelKey }) => (
                <Pressable
                  key={action}
                  style={[
                    styles.moreMenuItem,
                    action === 'move-to-trash' && styles.moreMenuItemDanger,
                  ]}
                  onPress={() => onMoreAction(note, action)}
                >
                  <Ionicons
                    name={icon}
                    size={20}
                    color={action === 'move-to-trash' ? '#E34C4C' : textColor}
                  />
                  <ThemedText
                    style={[
                      styles.moreMenuLabel,
                      action === 'move-to-trash' && styles.moreMenuLabelDanger,
                    ]}
                  >
                    {t(labelKey)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  touchable: {
    flex: 1,
  },
  container: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  header: {
    gap: 4,
  },
  title: {
    flex: 1,
  },
  meta: {
    fontSize: 12,
    opacity: 0.6,
  },
  summaryContainer: {
    marginTop: 4,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  footer: {
    marginTop: 4,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '500',
  },
  moreWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 5,
  },
  moreButton: {
    padding: 8,
    borderRadius: 8,
  },
  moreButtonPressed: {
    opacity: 0.7,
  },
  moreMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    minWidth: 180,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.9)',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  moreMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  moreMenuItemDanger: {},
  moreMenuLabel: {
    fontSize: 15,
  },
  moreMenuLabelDanger: {
    color: '#E34C4C',
  },
});
