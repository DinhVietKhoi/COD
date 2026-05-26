import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import TimezoneSelect from './TimezoneSelect';
import avatar from '../../public/avatar.png';

type NavItem = {
  to: string;
  end?: boolean;
  labelKey: string;
  icon: ReactNode;
};

const NAV: NavItem[] = [
  {
    to: '/',
    end: true,
    labelKey: 'common.nav.home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M3 11l9-8 9 8M5 10v10a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-5h2v5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V10" />
      </svg>
    ),
  },
  {
    to: '/quiz',
    labelKey: 'common.nav.quiz',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4.18 1.85c-.67.6-1.18 1.07-1.18 2.15M12 17h.01" />
      </svg>
    ),
  },
  {
    to: '/schedule',
    labelKey: 'common.nav.schedule',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
];

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-indigo-100 text-indigo-700 dark:bg-brand-800 dark:text-white'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-brand-300 dark:hover:bg-brand-900/60 dark:hover:text-white',
  ].join(' ');
}

export default function Sidebar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile toggle button (visible < lg) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white/90 text-gray-700 shadow-sm backdrop-blur lg:hidden dark:border-brand-800 dark:bg-brand-950/90 dark:text-brand-200"
        aria-label="Open menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {/* Backdrop on mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-gray-200 bg-white transition-transform dark:border-brand-800 dark:bg-brand-950',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:static lg:translate-x-0',
        ].join(' ')}
      >
        {/* Header: logo + brand + Hub badge */}
        <NavLink
          to="/"
          end
          className="flex items-center gap-3 border-b border-gray-200 px-4 py-4 transition hover:bg-gray-50 dark:border-brand-800 dark:hover:bg-brand-900/40"
        >
          <div className="size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-indigo-500/30">
            <img className="size-10 object-cover" src={avatar} alt="logo" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {t('common.brand')}
            </span>
            <span className="mt-0.5 inline-flex w-fit items-center rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              {t('common.sidebar.hub')}
            </span>
          </div>
        </NavLink>

        {/* Middle: menu */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              {item.icon}
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer: timezone + theme + language */}
        <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50/60 p-3 dark:border-brand-800 dark:bg-brand-950/60">
          <TimezoneSelect />
          <div className="flex items-center justify-between gap-2 border-t border-gray-200 pt-3 dark:border-brand-800">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </aside>
    </>
  );
}
