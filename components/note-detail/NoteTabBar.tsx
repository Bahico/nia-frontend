import { ThemedText } from '@/components/themed-text';
import { NoteOutcomePack } from '@/models/note.model';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export type DetailTab = 'transcript' | `pack-${number}`;

type NoteTabBarProps = {
  activeTab: DetailTab;
  onChangeTab: (tab: DetailTab) => void;
  accentColor: string;
  outcomePacks: NoteOutcomePack[];
  onAddPress: () => void;
};

export function NoteTabBar({
  activeTab,
  onChangeTab,
  accentColor,
  outcomePacks,
  onAddPress,
}: NoteTabBarProps) {
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to end when a new pack is added
  useEffect(() => {
    if (outcomePacks.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [outcomePacks.length]);

  return (
    <View style={styles.tabBarContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBarScroll}
        style={styles.tabBarScrollView}
      >
        {/* Transcript Tab */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'transcript' && {
              borderColor: accentColor,
              backgroundColor: 'rgba(255,255,255,0.08)',
            },
          ]}
          onPress={() => onChangeTab('transcript')}
        >
          <ThemedText
            style={[
              styles.tabButtonText,
              activeTab === 'transcript' && { color: accentColor, opacity: 1 },
            ]}
            numberOfLines={1}
          >
            Transcript
          </ThemedText>
        </TouchableOpacity>

        {/* Outcome Pack Tabs */}
        {outcomePacks.map((pack) => {
          const tabId: DetailTab = `pack-${pack.id}`;
          const isActive = activeTab === tabId;

          return (
            <TouchableOpacity
              key={pack.id}
              style={[
                styles.tabButton,
                isActive && {
                  borderColor: accentColor,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                },
              ]}
              onPress={() => onChangeTab(tabId)}
            >
              <ThemedText
                style={[
                  styles.tabButtonText,
                  isActive && { color: accentColor, opacity: 1 },
                ]}
                numberOfLines={1}
              >
                {pack.template?.name || pack.title || 'Summary'}
              </ThemedText>
            </TouchableOpacity>
          );
        })}

        {/* Plus Button */}
        <TouchableOpacity
          style={[styles.addButton, { borderColor: accentColor }]}
          onPress={onAddPress}
        >
          <Ionicons name="add" size={20} color={accentColor} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    marginBottom: 12,
  },
  tabBarScrollView: {
    flexGrow: 0,
  },
  tabBarScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 4,
  },
  tabButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  tabButtonText: {
    fontWeight: '600',
    opacity: 0.8,
    fontSize: 14,
  },
  addButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
