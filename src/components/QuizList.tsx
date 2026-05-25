import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { QuizCategory, QuizQuestion } from '../types/quiz';
import type { SupportedLang } from '../i18n';

interface FlatQuestion extends QuizQuestion {
  subkind: string | null;
  answerText: { en: string; vi: string };
}

type MatchRange = [number, number];

interface SearchResult {
  item: FlatQuestion;
  ranges: { q: MatchRange[]; a: MatchRange[] } | null;
}

interface Props {
  categories: QuizCategory[];
  lang: SupportedLang;
}

const PAGE_SIZE = 50;

function eventLabel(t: TFunction, subkind: string | null): string {
  const key = `quiz.events.${subkind ?? 'core'}`;
  const translated = t(key);
  return translated === key ? (subkind ?? '') : translated;
}

function findRanges(text: string, query: string): MatchRange[] {
  const lower = text.toLowerCase();
  const lq = query.toLowerCase();
  const ranges: MatchRange[] = [];
  let i = 0;
  while ((i = lower.indexOf(lq, i)) !== -1) {
    ranges.push([i, i + lq.length - 1]);
    i += lq.length;
  }
  return ranges;
}

function applyHighlight(text: string, ranges: MatchRange[]): React.ReactNode {
  if (!ranges.length) return text;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark key={start} className="rounded-sm bg-yellow-200 text-yellow-900 dark:bg-brand-500/40 dark:text-white">
        {text.slice(start, end + 1)}
      </mark>,
    );
    cursor = end + 1;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

export default function QuizList({ categories, lang }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('__all__');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const subkinds = useMemo(() => {
    const seen = new Set<string>();
    const result: Array<{ key: string; subkind: string | null }> = [];
    for (const c of categories) {
      const k = c.subkind ?? '__core__';
      if (!seen.has(k)) {
        seen.add(k);
        result.push({ key: k, subkind: c.subkind });
      }
    }
    return result;
  }, [categories]);

  const showTabs = subkinds.length > 1;

  const allFlat = useMemo<FlatQuestion[]>(() => {
    const result: FlatQuestion[] = [];
    for (const c of categories) {
      for (const q of c.questions) {
        const ans = q.options[q.correct];
        result.push({ ...q, subkind: c.subkind, answerText: ans ?? { en: '', vi: '' } });
      }
    }
    return result;
  }, [categories]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { __all__: allFlat.length };
    for (const c of categories) {
      const k = c.subkind ?? '__core__';
      counts[k] = (counts[k] ?? 0) + c.question_count;
    }
    return counts;
  }, [categories, allFlat.length]);

  const tabFiltered = useMemo<FlatQuestion[]>(() => {
    if (activeTab === '__all__') return allFlat;
    const target = activeTab === '__core__' ? null : activeTab;
    return allFlat.filter((q) => q.subkind === target);
  }, [allFlat, activeTab]);

  const results = useMemo<SearchResult[]>(() => {
    const trimmed = query.trim();
    if (!trimmed) return tabFiltered.map((item) => ({ item, ranges: null }));

    return tabFiltered
      .filter((q) => {
        const lq = trimmed.toLowerCase();
        return (
          q.question[lang].toLowerCase().includes(lq) ||
          q.answerText[lang].toLowerCase().includes(lq)
        );
      })
      .map((item) => ({
        item,
        ranges: {
          q: findRanges(item.question[lang], trimmed),
          a: findRanges(item.answerText[lang], trimmed),
        },
      }));
  }, [query, tabFiltered, lang]);

  const visible = results.slice(0, visibleCount);
  const hasMore = visibleCount < results.length;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setVisibleCount(PAGE_SIZE);
    setQuery('');
  };

  const handleQuery = (q: string) => {
    setQuery(q);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-brand-500"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
          placeholder={t('quiz.list.searchPlaceholder')}
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none dark:border-brand-700 dark:bg-brand-900/80 dark:text-white dark:placeholder-brand-500 dark:focus:border-brand-500"
        />
        {query && (
          <button
            onClick={() => handleQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors dark:text-brand-500 dark:hover:text-white"
            aria-label="Clear search"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter tabs */}
      {showTabs && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTabChange('__all__')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              activeTab === '__all__'
                ? 'bg-indigo-600 text-white dark:bg-brand-500'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-brand-800/60 dark:text-brand-300 dark:hover:bg-brand-700/60 dark:hover:text-white'
            }`}
          >
            {t('quiz.list.filterAll')}
            <span className="ml-1.5 opacity-60">{tabCounts['__all__']}</span>
          </button>
          {subkinds.map(({ key }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeTab === key
                  ? 'bg-indigo-600 text-white dark:bg-brand-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-brand-800/60 dark:text-brand-300 dark:hover:bg-brand-700/60 dark:hover:text-white'
              }`}
            >
              {eventLabel(t, key === '__core__' ? null : key)}
              <span className="ml-1.5 opacity-60">{tabCounts[key] ?? 0}</span>
            </button>
          ))}
        </div>
      )}

      {/* Count */}
      <p className="text-[11px] text-gray-400 dark:text-brand-500">
        {t('quiz.list.showing', { count: results.length })}
      </p>

      {/* List */}
      {results.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-brand-400">{t('quiz.list.noResults')}</p>
      ) : (
        <>
          <ol className="flex flex-col gap-2">
            {visible.map(({ item: q, ranges }, idx) => (
              <li
                key={q.id}
                className="flex gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-brand-800 dark:bg-brand-900/40"
              >
                <span className="mt-0.5 shrink-0 font-mono text-[11px] text-gray-300 w-6 text-right dark:text-brand-600">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm leading-snug text-gray-900 dark:text-white">
                    {ranges?.q.length ? applyHighlight(q.question[lang], ranges.q) : q.question[lang]}
                  </p>
                  <p className="mt-1.5 text-xs text-gray-600 dark:text-brand-300">
                    {ranges?.a.length ? applyHighlight(q.answerText[lang], ranges.a) : q.answerText[lang]}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {hasMore && (
            <button
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              className="btn btn-ghost self-center text-sm"
            >
              {t('quiz.list.loadMore', { remaining: Math.min(PAGE_SIZE, results.length - visibleCount) })}
            </button>
          )}
        </>
      )}
    </div>
  );
}
