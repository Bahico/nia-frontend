import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

import { ResponsiveContainer } from '@/components/responsive-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useResponsiveValue } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { type Locale } from '@/i18n';
import { changePassword } from '@/services/change-password.service';
import {
  getStoredCountry,
  type CountryCode,
} from '@/services/country.service';

const NOTIFICATIONS_STORAGE_KEY = '@notifications_enabled';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'profile.languageEn',
  ru: 'profile.languageRu',
  uz: 'profile.languageUz',
};

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

const appVersion = Constants.expoConfig?.version ?? '1.0.0';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAuth();
  const accentColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'tabBarBackground');
  const buttonPadding = useResponsiveValue({ mobile: 16, tablet: 18, desktop: 20 });
  const fontSize = useResponsiveValue({ mobile: 16, tablet: 17, desktop: 18 });
  const currentLocale = (i18n.language?.split(/-|_/)[0] ?? 'en') as Locale;
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getStoredCountry().then(setSelectedCountry);
      AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY).then((value) => {
        setNotificationsEnabled(value !== 'false');
      });
    }, [])
  );

  const handleNotificationsChange = useCallback((value: boolean) => {
    setNotificationsEnabled(value);
    AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, String(value));
  }, []);

  const handleChangePassword = useCallback(() => {
    void changePassword('', '');
  }, []);

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      t('profile.logoutConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert(t('common.error'), t('profile.logoutFailed'));
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <ResponsiveContainer style={styles.content}>
          {/* <ThemedText type="subtitle" style={styles.title}>
            {t('profile.title')}
          </ThemedText> */}

          <ThemedView style={[styles.profileCard, { backgroundColor: cardBackground }]}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color={accentColor} />
            </View>
            <ThemedText type="subtitle" style={styles.name}>
              {user?.firstName ? `${user?.firstName} ${user?.lastName}` : t('common.user')}
            </ThemedText>
            <ThemedText style={styles.email}>{user?.email}</ThemedText>
          </ThemedView>

          {/* Card 1: General */}
          <ThemedView style={[styles.infoCard, { backgroundColor: cardBackground }]}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              {t('profile.general')}
            </ThemedText>
            <TouchableOpacity
              style={styles.infoRowTouchable}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.infoLabel}>{t('profile.editProfile')}</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={accentColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.infoRowTouchable}
              onPress={handleChangePassword}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.infoLabel}>{t('profile.changePassword')}</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={accentColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.infoRowTouchable}
              onPress={() => router.push('/(tabs)/profile/statistics')}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.infoLabel}>{t('tabs.statistics')}</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={accentColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.infoRowTouchable}
              onPress={() => router.push('/(tabs)/profile/select-language')}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.infoLabel}>{t('profile.language')}</ThemedText>
              <View style={styles.infoValueRow}>
                <ThemedText style={styles.infoValue}>{t(LOCALE_LABELS[currentLocale])}</ThemedText>
                <Ionicons name="chevron-forward" size={20} color={accentColor} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.infoRowTouchable}
              onPress={() => router.push('/(tabs)/profile/select-country')}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.infoLabel}>{t('profile.country')}</ThemedText>
              <View style={styles.infoValueRow}>
                <ThemedText style={styles.infoValue}>
                  {selectedCountry ? t(COUNTRY_LABEL_KEYS[selectedCountry]) : '—'}
                </ThemedText>
                <Ionicons name="chevron-forward" size={20} color={accentColor} />
              </View>
            </TouchableOpacity>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>{t('profile.appVersion')}</ThemedText>
              <ThemedText style={styles.infoValue}>{appVersion}</ThemedText>
            </View>
          </ThemedView>

          {/* Card 2: Preferences */}
          <ThemedView style={[styles.infoCard, { backgroundColor: cardBackground }]}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              {t('profile.preferences')}
            </ThemedText>
            <TouchableOpacity
              style={styles.infoRowTouchable}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.infoLabel}>{t('profile.faq')}</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={accentColor} />
            </TouchableOpacity>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>{t('profile.notifications')}</ThemedText>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsChange}
                trackColor={{ false: '#767577', true: accentColor }}
                thumbColor="#fff"
              />
            </View>
            <TouchableOpacity
              style={styles.infoRowTouchable}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.infoValueRow}>
                <Ionicons name="log-out-outline" size={20} color="#E34C4C" />
                <ThemedText style={[styles.infoLabel, styles.logoutText]}>
                  {t('profile.logout')}
                </ThemedText>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color={accentColor} />
            </TouchableOpacity>
          </ThemedView>
        </ResponsiveContainer>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 32,
  },
  content: {
    maxWidth: 480,
    width: '100%',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 24,
    borderRadius: 16,
    // backgroundColor: '#2c2f38',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F6E34C20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    opacity: 0.7,
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
  },
  cardTitle: {
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoRowTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: {
    fontSize: 16,
    opacity: 0.9,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoutText: {
    color: '#E34C4C',
    fontWeight: '600',
  },
});
