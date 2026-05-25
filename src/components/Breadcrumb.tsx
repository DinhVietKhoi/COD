import { Link } from 'react-router-dom';

interface Crumb {
  label: string;
  to?: string;
}

interface Props {
  crumbs: Crumb[];
}

export default function Breadcrumb({ crumbs }: Props) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-gray-400 dark:text-brand-400">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-300 dark:text-brand-600">/</span>}
              {crumb.to && !isLast ? (
                <Link to={crumb.to} className="hover:text-gray-700 transition-colors dark:hover:text-brand-200">
                  {crumb.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-gray-600 dark:text-brand-200' : ''}>{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
