import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import vi from './locales/vi.json';

export const SUPPORTED_LANGS = ['vi', 'en'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    fallbackLng: 'en',
    supportedLngs: [...SUPPORTED_LANGS],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'cod-web.lang',
      caches: ['localStorage'],
    },
  });

if (!SUPPORTED_LANGS.includes(i18n.language as SupportedLang)) {
  i18n.changeLanguage('vi');
}

i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('lang', lng);
});
document.documentElement.setAttribute('lang', i18n.language || 'vi');

export default i18n;
