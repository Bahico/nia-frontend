import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { ResponsiveContainer } from '@/components/responsive-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  type CountryCode,
  COUNTRY_CODES,
  getStoredCountry,
  setCountry,
} from '@/services/country.service';

const COUNTRY_LABEL_KEYS: Record<CountryCode, string> = {
  UZ: 'profile.countryUZ',
  RU: 'profile.countryRU',
  US: 'profile.countryUS',
  GB: 'profile.countryGB',
  KZ: 'profile.countryKZ',
  TJ: 'profile.countryTJ',
  KG: 'profile.countryKG',
  TM: 'profile.countryTM',
  AF: 'profile.countryAF',
  DE: 'profile.countryDE',
  FR: 'profile.countryFR',
  TR: 'profile.countryTR',
};

export default function SelectCountryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, 'tint');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);

  useFocusEffect(
    useCallback(() => {
      getStoredCountry().then(setSelectedCountry);
    }, [])
  );

  const handleSelect = async (code: CountryCode) => {
    await setCountry(code);
    setSelectedCountry(code);
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={accentColor} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          {t('profile.selectCountry')}
        </ThemedText>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer style={styles.content}>
          {COUNTRY_CODES.map((code) => (
            <TouchableOpacity
              key={code}
              style={[
                styles.optionRow,
                selectedCountry === code && { backgroundColor: accentColor + '22' },
              ]}
              onPress={() => handleSelect(code)}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.optionLabel,
                  selectedCountry === code && {
                    color: accentColor,
                    fontWeight: '600',
                  },
                ]}
              >
                {t(COUNTRY_LABEL_KEYS[code])}
              </ThemedText>
              {selectedCountry === code && (
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
