import AsyncStorage from '@react-native-async-storage/async-storage';

const COUNTRY_STORAGE_KEY = '@nia_country';

export const COUNTRY_CODES = [
  'UZ',
  'RU',
  'US',
  'GB',
  'KZ',
  'TJ',
  'KG',
  'TM',
  'AF',
  'DE',
  'FR',
  'TR',
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

export async function setCountry(code: CountryCode): Promise<void> {
  await AsyncStorage.setItem(COUNTRY_STORAGE_KEY, code);
}

export async function getStoredCountry(): Promise<CountryCode | null> {
  const saved = await AsyncStorage.getItem(COUNTRY_STORAGE_KEY);
  if (saved && COUNTRY_CODES.includes(saved as CountryCode)) return saved as CountryCode;
  return null;
}
