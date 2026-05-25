import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'px-3 py-2 text-sm font-medium rounded-md transition',
    isActive
      ? 'text-gray-900 bg-gray-200/60 dark:text-white dark:bg-brand-800/60'
      : 'text-gray-600 hover:text-gray-900 dark:text-brand-200 dark:hover:text-white',
  ].join(' ');

export default function Header() {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/85 backdrop-blur dark:border-brand-800 dark:bg-brand-950/85">
      <div className="container-page flex h-14 items-center gap-4">
        <NavLink to="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-500 dark:bg-brand-400" />
          {t('common.brand')}
        </NavLink>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navClass}>
            {t('common.nav.home')}
          </NavLink>
          <NavLink to="/quiz" className={navClass}>
            {t('common.nav.quiz')}
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
