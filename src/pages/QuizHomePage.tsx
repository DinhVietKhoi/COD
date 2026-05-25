import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuizData, getKindTotal } from '../hooks/useQuizData';
import Breadcrumb from '../components/Breadcrumb';

export default function QuizHomePage() {
  const { t } = useTranslation();
  const state = useQuizData();

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        crumbs={[
          { label: t('common.breadcrumb.home'), to: '/' },
          { label: t('quiz.title') },
        ]}
      />

      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {t('quiz.title')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-brand-300">{t('quiz.subtitle')}</p>
      </header>

      {state.status === 'loading' && (
        <p className="text-gray-500 dark:text-brand-300">{t('quiz.loading')}</p>
      )}
      {state.status === 'error' && (
        <p className="text-red-500 dark:text-red-400">{t('quiz.loadError')}</p>
      )}
      {state.status === 'ready' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/quiz/personal" className="card flex flex-col">
            <span className="text-xs uppercase tracking-wider text-indigo-500 dark:text-brand-400">
              {t('quiz.personal.subtitle')}
            </span>
            <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
              {t('quiz.personal.title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-brand-300">
              {t('quiz.personal.description')}
            </p>
            <div className="mt-4 text-sm font-medium text-gray-700 dark:text-brand-200">
              {t('quiz.stats.count', { count: getKindTotal(state.data, 'personal') })}
            </div>
          </Link>

          <Link to="/quiz/alliance" className="card flex flex-col">
            <span className="text-xs uppercase tracking-wider text-indigo-500 dark:text-brand-400">
              {t('quiz.alliance.subtitle')}
            </span>
            <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
              {t('quiz.alliance.title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-brand-300">
              {t('quiz.alliance.description')}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-medium text-gray-700 dark:text-brand-200">
              <span>
                {t('quiz.stats.count', { count: getKindTotal(state.data, 'alliance') })}
              </span>
              {(() => {
                const subs = state.data.categories.filter(
                  (c) => c.kind === 'alliance' && c.subkind,
                ).length;
                return subs > 0 ? (
                  <span className="text-gray-400 dark:text-brand-400">
                    · {t('quiz.stats.events', { count: subs })}
                  </span>
                ) : null;
              })()}
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
