import { useParams, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuizData, getCategoriesByKind } from '../hooks/useQuizData';
import type { QuizKind } from '../types/quiz';
import { SUPPORTED_LANGS, type SupportedLang } from '../i18n';
import Breadcrumb from '../components/Breadcrumb';
import QuizList from '../components/QuizList';

export default function QuizKindPage() {
  const { kind } = useParams<{ kind: string }>();
  const { t, i18n } = useTranslation();
  const state = useQuizData();

  if (kind !== 'personal' && kind !== 'alliance') {
    return <Navigate to="/quiz" replace />;
  }
  const quizKind = kind as QuizKind;
  const rawLang = (SUPPORTED_LANGS.includes(i18n.language as SupportedLang)
    ? i18n.language
    : 'vi') as SupportedLang;
  // Quiz data only has VI + EN; fall back to EN for any other UI language.
  const lang: 'vi' | 'en' = rawLang === 'vi' ? 'vi' : 'en';

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        crumbs={[
          { label: t('common.breadcrumb.home'), to: '/' },
          { label: t('quiz.title'), to: '/quiz' },
          { label: t(`quiz.${quizKind}.title`) },
        ]}
      />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-indigo-500 dark:text-brand-400">
            {t(`quiz.${quizKind}.subtitle`)}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {t(`quiz.${quizKind}.title`)}
          </h1>
          <p className="mt-2 max-w-2xl text-gray-600 dark:text-brand-300">
            {t(`quiz.${quizKind}.description`)}
          </p>
        </div>
        <Link to={`/quiz/${quizKind}/play`} className="btn-primary self-start sm:self-end">
          {t('quiz.actions.practice')}
        </Link>
      </header>

      {state.status === 'loading' && (
        <p className="text-gray-500 dark:text-brand-300">{t('quiz.loading')}</p>
      )}
      {state.status === 'error' && (
        <p className="text-red-500 dark:text-red-400">{t('quiz.loadError')}</p>
      )}
      {state.status === 'ready' && (
        <QuizList
          categories={getCategoriesByKind(state.data, quizKind)}
          lang={lang}
        />
      )}
    </div>
  );
}
