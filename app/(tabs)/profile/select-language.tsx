import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResponsiveContainer } from '@/components/responsive-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { setLocale, SUPPORTED_LOCALES, type Locale } from '@/i18n';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'profile.languageEn',
  ru: 'profile.languageRu',
  uz: 'profile.languageUz',
};

export default function SelectLanguageScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, 'tint');
  const currentLocale = (i18n.language?.split(/-|_/)[0] ?? 'en') as Locale;

  const handleSelect = async (locale: Locale) => {
    await setLocale(locale);
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={accentColor} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          {t('profile.selectLanguage')}
        </ThemedText>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer style={styles.content}>
          {SUPPORTED_LOCALES.map((locale) => (
            <TouchableOpacity
              key={locale}
              style={[
                styles.optionRow,
                currentLocale === locale && { backgroundColor: accentColor + '22' },
              ]}
              onPress={() => handleSelect(locale)}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.optionLabel,
                  currentLocale === locale && { color: accentColor, fontWeight: '600' },
                ]}
              >
                {t(LOCALE_LABELS[locale])}
              </ThemedText>
              {currentLocale === locale && (
                <Ionicons name="checkmark-circle" size={24} color={accentColor} />
              )}
            </TouchableOpacity>
          ))}
        </ResponsiveContainer>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  content: {
    maxWidth: 480,
    width: '100%',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 17,
  },
});
