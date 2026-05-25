import { useTranslation } from 'react-i18next';
import { useQuizData } from '../hooks/useQuizData';

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function Footer() {
  const { t, i18n } = useTranslation();
  const state = useQuizData();
  return (
    <footer className="shrink-0 border-t border-gray-200/70 bg-gray-50/70 dark:border-brand-800/70 dark:bg-brand-950/70">
      <div className="container-page flex flex-col gap-1.5 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between dark:text-brand-300">
        <div className="flex items-center gap-3">
          <span>{t('common.tagline')}</span>
          <span className="text-gray-300 dark:text-brand-700">·</span>
          <span className="font-semibold text-gray-700 dark:text-brand-300">© MageNoob 770</span>
        </div>
        {state.status === 'ready' && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>
              {t('common.footer.data_updated')}:{' '}
              <span className="text-gray-900 dark:text-brand-100">
                {formatDate(state.data._meta.source_modified_utc, i18n.language)}
              </span>
            </span>
            <span>
              {t('common.footer.questions', { count: state.data._meta.total_questions })}
            </span>
          </div>
        )}
      </div>
    </footer>
  );
}
