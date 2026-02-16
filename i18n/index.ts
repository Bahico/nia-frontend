import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCALE_STORAGE_KEY = '@nia_locale';

export const SUPPORTED_LOCALES = ['en', 'ru', 'uz'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

function normalizeLocale(tag: string): Locale {
  const code = tag.split(/[-_]/)[0]?.toLowerCase() ?? 'en';
  if (SUPPORTED_LOCALES.includes(code as Locale)) return code as Locale;
  return 'en';
}

async function getInitialLocale(): Promise<Locale> {
  try {
    const saved = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES.includes(saved as Locale)) return saved as Locale;
    const device = Localization.getLocales()[0]?.languageCode;
    return device ? normalizeLocale(device) : 'en';
  } catch {
    return 'en';
  }
}

export async function setLocale(locale: Locale): Promise<void> {
  await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
  await i18n.changeLanguage(locale);
}

export async function getStoredLocale(): Promise<Locale | null> {
  const saved = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved && SUPPORTED_LOCALES.includes(saved as Locale)) return saved as Locale;
  return null;
}

const en = require('../locales/en.json');
const ru = require('../locales/ru.json');
const uz = require('../locales/uz.json');

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    uz: { translation: uz },
  },
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: [...SUPPORTED_LOCALES],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export async function initI18n(): Promise<Locale> {
  const locale = await getInitialLocale();
  await i18n.changeLanguage(locale);
  return locale;
}

export default i18n;
