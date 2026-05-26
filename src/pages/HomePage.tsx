import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          {t('home.title')}
        </h1>
        <p className="mt-3 max-w-2xl text-gray-600 dark:text-brand-300">{t('home.subtitle')}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link to="/quiz" className="card flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('home.sections.quiz.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-brand-300">
            {t('home.sections.quiz.description')}
          </p>
        </Link>
        <Link to="/schedule" className="card flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('home.sections.schedule.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-brand-300">
            {t('home.sections.schedule.description')}
          </p>
        </Link>
      </section>
    </div>
  );
}
