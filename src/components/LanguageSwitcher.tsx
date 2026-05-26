import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, type SupportedLang } from '../i18n';

const LABEL: Record<SupportedLang, string> = {
  vi: 'VI',
  en: 'EN',
  kr: 'KR',
};

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = (SUPPORTED_LANGS.includes(i18n.language as SupportedLang)
    ? i18n.language
    : 'vi') as SupportedLang;

  return (
    <div
      className="inline-flex rounded-lg border border-gray-200 bg-gray-100/60 p-0.5 dark:border-brand-800 dark:bg-brand-900/60"
      role="group"
      aria-label="Language switcher"
    >
      {SUPPORTED_LANGS.map((lng) => {
        const active = lng === current;
        return (
          <button
            key={lng}
            type="button"
            onClick={() => i18n.changeLanguage(lng)}
            className={[
              'rounded-md px-2.5 py-1 text-xs font-semibold transition',
              active
                ? 'bg-indigo-600 text-white dark:bg-brand-500 dark:text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-brand-300 dark:hover:text-white',
            ].join(' ')}
            aria-pressed={active}
          >
            {LABEL[lng]}
          </button>
        );
      })}
    </div>
  );
}
