import en from './translations/en.json';
import hi from './translations/hi.json';
import mr from './translations/mr.json';
import gu from './translations/gu.json';

export type Language = 'hi' | 'en' | 'mr' | 'gu';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', speechCode: 'hi-IN' },
  { code: 'en', label: 'English', nativeLabel: 'English', speechCode: 'en-IN' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', speechCode: 'mr-IN' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', speechCode: 'gu-IN' },
];

export const translations: Record<Language, Record<string, string>> = {
  hi,
  en,
  mr,
  gu,
};

export function getTranslation(lang: Language, key: string): string {
  return translations[lang]?.[key] || translations.en?.[key] || key;
}

export function getSpeechLangCode(lang: Language): string {
  const match = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
  return match?.speechCode || 'hi-IN';
}

