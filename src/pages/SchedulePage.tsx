import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, DatePicker, Tag, Segmented, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import 'dayjs/locale/ko';

import Breadcrumb from '../components/Breadcrumb';
import { useTimezone } from '../contexts/TimezoneContext';
import { generateSchedule, formatTzHour, tzDayKey, offsetLabel, tzOffsetLabel } from '../lib/schedule';
import type { ScheduleTemplate, RenderedEvent, CategoryId, ScheduleIndex } from '../types/schedule';

const STORAGE_KEY_ANCHOR_PREFIX = 'cod-web.schedule.anchor.';
const STORAGE_KEY_SEASON = 'cod-web.schedule.season';

function defaultAnchor(tz: string): Dayjs {
  // Noon today, interpreted in the user's selected timezone.
  return dayjs.tz(undefined, tz).hour(12).minute(0).second(0).millisecond(0);
}

/** Read saved anchor for a season from localStorage. Returns null when missing or invalid. */
function readStoredAnchor(seasonId: string): Dayjs | null {
  if (!seasonId) return null;
  const raw = localStorage.getItem(STORAGE_KEY_ANCHOR_PREFIX + seasonId);
  if (!raw) return null;
  const ms = Number(raw);
  if (!Number.isFinite(ms) || ms <= 0) return null;
  // Sanity bound: between year 2000 and year 2100 (Unix ms).
  if (ms < 946684800000 || ms > 4102444800000) return null;
  return dayjs(ms);
}

function loadStoredAnchorOrDefault(seasonId: string, tz: string): Dayjs {
  return readStoredAnchor(seasonId) ?? defaultAnchor(tz);
}

export default function SchedulePage() {
  const { t, i18n } = useTranslation();
  const langCode = (i18n.language ?? 'vi').toLowerCase();
  const lang: 'vi' | 'en' | 'kr' = langCode.startsWith('vi')
    ? 'vi'
    : langCode.startsWith('kr') || langCode.startsWith('ko')
      ? 'kr'
      : 'en';
  const templateLang: 'vi' | 'en' = lang === 'vi' ? 'vi' : 'en';
  const { tz } = useTimezone();

  const [index, setIndex] = useState<ScheduleIndex | null>(null);
  const [seasonId, setSeasonId] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY_SEASON) ?? '',
  );
  const [template, setTemplate] = useState<ScheduleTemplate | null>(null);
  const [anchor, setAnchor] = useState<Dayjs>(() => {
    // Synchronously rehydrate from localStorage if available so there's no flash of
    // "today 12:00" on refresh.
    const initialSeason = localStorage.getItem(STORAGE_KEY_SEASON);
    return loadStoredAnchorOrDefault(initialSeason ?? '', tz);
  });
  const [activeCats, setActiveCats] = useState<Set<CategoryId>>(new Set());
  const [selected, setSelected] = useState<Dayjs>(() => dayjs());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    dayjs.locale(lang === 'kr' ? 'ko' : lang);
  }, [lang]);

  // Load schedule index on mount
  useEffect(() => {
    fetch('/data/schedules/index.json')
      .then((r) => {
        if (!r.ok) throw new Error(`index.json HTTP ${r.status}`);
        return r.json();
      })
      .then((idx: ScheduleIndex) => {
        setIndex(idx);
        setSeasonId((prev) => {
          // If saved seasonId isn't in this index anymore, fall back to default.
          if (prev && idx.schedules.some((s) => s.id === prev)) return prev;
          return idx.default_id;
        });
      })
      .catch((err) => {
        console.error('Failed to load schedule index:', err);
        setIndex(null);
      });
  }, []);

  // Load template whenever season changes
  useEffect(() => {
    if (!index || !seasonId) return;
    const entry = index.schedules.find((s) => s.id === seasonId);
    if (!entry) {
      console.warn(`Season "${seasonId}" not found in index; ignoring.`);
      return;
    }
    fetch(entry.file)
      .then((r) => {
        if (!r.ok) throw new Error(`${entry.file} HTTP ${r.status}`);
        return r.json();
      })
      .then((data: ScheduleTemplate) => {
        setTemplate(data);
        setActiveCats(new Set(data.categories.map((c) => c.id)));
        setAnchor(loadStoredAnchorOrDefault(seasonId, tz));
        localStorage.setItem(STORAGE_KEY_SEASON, seasonId);
      })
      .catch((err) => {
        console.error('Failed to load schedule template:', err);
        setTemplate(null);
      });
  }, [index, seasonId, tz]);

  function handleAnchorChange(d: Dayjs | null) {
    if (d) {
      setAnchor(d);
      if (seasonId) {
        localStorage.setItem(STORAGE_KEY_ANCHOR_PREFIX + seasonId, String(d.valueOf()));
      }
    }
  }

  function toggleCat(id: CategoryId) {
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const schedule = useMemo(() => {
    if (!template) return null;
    return generateSchedule(template, anchor.valueOf());
  }, [template, anchor]);

  const filteredEvents = useMemo(() => {
    if (!schedule) return [];
    return schedule.events.filter((e) => activeCats.has(e.category));
  }, [schedule, activeCats]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, RenderedEvent[]>();
    for (const ev of filteredEvents) {
      const key = tzDayKey(ev.start_ms, tz);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [filteredEvents]);

  const selectedDayEvents = useMemo(() => {
    const key = selected.tz(tz).format('YYYY-MM-DD');
    return eventsByDay.get(key) ?? [];
  }, [eventsByDay, selected, tz]);

  function getCatColor(id: CategoryId): string {
    return template?.categories.find((c) => c.id === id)?.color ?? '#888';
  }

  function getCatLabel(id: CategoryId): string {
    const c = template?.categories.find((x) => x.id === id);
    if (!c) return id;
    return templateLang === 'vi' ? c.label_vi : c.label_en;
  }

  const cellRender = (current: Dayjs) => {
    const key = current.tz(tz).format('YYYY-MM-DD');
    const evs = eventsByDay.get(key);
    if (!evs?.length) return null;
    const byCat = new Map<CategoryId, RenderedEvent[]>();
    for (const e of evs) {
      if (!byCat.has(e.category)) byCat.set(e.category, []);
      byCat.get(e.category)!.push(e);
    }
    return (
      <ul className="flex flex-col gap-0.5 overflow-hidden">
        {Array.from(byCat.entries()).slice(0, 3).map(([cat, list]) => {
          const name = list[0] && (templateLang === 'vi' ? list[0].name_vi : list[0].name_en);
          return (
            <li key={cat} className="flex items-center gap-1 overflow-hidden text-xs leading-tight">
              <span
                className="inline-block size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: getCatColor(cat) }}
              />
              <span className="truncate text-gray-700 dark:text-brand-200">
                {name}
                {list.length > 1 ? ` +${list.length - 1}` : ''}
              </span>
            </li>
          );
        })}
        {byCat.size > 3 && (
          <li className="truncate text-[10px] text-gray-400 dark:text-brand-500">
            +{byCat.size - 3} {t('schedule.more')}
          </li>
        )}
      </ul>
    );
  };

  function shiftMonth(months: number) {
    setSelected((s) => s.add(months, 'month'));
  }
  function shiftYear(years: number) {
    setSelected((s) => s.add(years, 'year'));
  }
  function goToday() {
    setSelected(dayjs.tz(undefined, tz));
  }

  const headerRender = ({ value }: { value: Dayjs; onChange?: (d: Dayjs) => void }) => {
    const monthLabel = value.tz(tz).locale(lang === 'kr' ? 'ko' : lang).format('MMMM YYYY');
    return (
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 dark:border-brand-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftYear(-1)}
            title={t('schedule.calNav.prevYear')}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-brand-300 dark:hover:bg-brand-900 dark:hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <path d="M18 17l-5-5 5-5M11 17l-5-5 5-5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            title={t('schedule.calNav.prevMonth')}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-brand-300 dark:hover:bg-brand-900 dark:hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center gap-3">
          <h3 className="text-base font-semibold text-gray-900 capitalize dark:text-white">
            {monthLabel}
          </h3>
          <button
            type="button"
            onClick={goToday}
            title={t('schedule.calNav.today')}
            className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
          >
            {t('schedule.calNav.today')}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            title={t('schedule.calNav.nextMonth')}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-brand-300 dark:hover:bg-brand-900 dark:hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => shiftYear(1)}
            title={t('schedule.calNav.nextYear')}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-brand-300 dark:hover:bg-brand-900 dark:hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <path d="M6 17l5-5-5-5M13 17l5-5-5-5" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
        <Breadcrumb
          crumbs={[
            { label: t('common.breadcrumb.home'), to: '/' },
            { label: t('schedule.title') },
          ]}
        />

        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {t('schedule.title')}
            </h1>
            {template && (
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                {templateLang === 'vi' ? template.season_label_vi : template.season_label_en}
              </span>
            )}
            <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-xs text-gray-600 dark:border-brand-800 dark:bg-brand-900 dark:text-brand-300">
              UTC{tzOffsetLabel(tz)}
            </span>
          </div>
          <p className="max-w-3xl text-gray-600 dark:text-brand-300">{t('schedule.subtitle')}</p>
        </header>

        <section className="card grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-brand-200">
              {t('schedule.seasonLabel')}
            </label>
            <Select
              value={seasonId || undefined}
              onChange={(v) => setSeasonId(v)}
              options={(index?.schedules ?? []).map((s) => ({
                value: s.id,
                label: templateLang === 'vi' ? s.label_vi : s.label_en,
              }))}
              placeholder={t('schedule.seasonPlaceholder')}
              className="!w-full"
            />
            <p className="text-xs text-gray-500 dark:text-brand-400">{t('schedule.seasonHint')}</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-brand-200">
              {t('schedule.anchorLabel')} <span className="text-xs font-normal text-gray-500 dark:text-brand-400">(UTC{tzOffsetLabel(tz)} · {tz})</span>
            </label>
            <DatePicker
              value={anchor.tz(tz)}
              onChange={handleAnchorChange}
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              allowClear={false}
              className="!w-full"
              placeholder={t('schedule.anchorPlaceholder')}
            />
            <p className="text-xs text-gray-500 dark:text-brand-400">{t('schedule.anchorHint')}</p>
          </div>
        </section>

        {!template && (
          <p className="text-gray-500 dark:text-brand-300">{t('schedule.loadingTemplate')}</p>
        )}

        {template && (
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {template.categories.map((c) => {
                const on = activeCats.has(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCat(c.id)}
                    className="rounded-full px-2.5 py-1 text-xs font-medium transition hover:opacity-80"
                    style={{
                      backgroundColor: on ? c.color : 'transparent',
                      color: on ? '#fff' : c.color,
                      border: `1px solid ${c.color}`,
                      opacity: on ? 1 : 0.7,
                    }}
                  >
                    {templateLang === 'vi' ? c.label_vi : c.label_en}
                  </button>
                );
              })}
            </div>
            <Segmented
              value={view}
              onChange={(v) => setView(v as 'calendar' | 'list')}
              options={[
                { label: t('schedule.view.calendar'), value: 'calendar' },
                { label: t('schedule.view.list'), value: 'list' },
              ]}
            />
          </section>
        )}

        {schedule && view === 'calendar' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card lg:col-span-2 !p-0 overflow-hidden">
              <Calendar
                fullscreen
                mode="month"
                value={selected}
                onSelect={(d) => setSelected(d)}
                cellRender={cellRender}
                headerRender={headerRender}
              />
            </div>

            <aside className="card flex flex-col gap-4">
              <div className="border-b border-gray-100 pb-3 dark:border-brand-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selected.tz(tz).format('YYYY-MM-DD')}
                </h3>
                <p className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-brand-400">
                  <span>{selected.tz(tz).format('dddd')}</span>
                  <span>·</span>
                  <span className="font-mono">UTC{tzOffsetLabel(tz)}</span>
                  <span>·</span>
                  <span>{t('schedule.dayCount', { count: selectedDayEvents.length })}</span>
                </p>
              </div>

              {selectedDayEvents.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-brand-400">
                  {t('schedule.noEventsThisDay')}
                </p>
              )}

              <ul className="flex flex-col gap-3">
                {selectedDayEvents
                  .slice()
                  .sort((a, b) => a.start_ms - b.start_ms)
                  .map((ev) => (
                    <li key={ev.id} className="flex flex-col gap-1 border-l-2 pl-3" style={{ borderColor: getCatColor(ev.category) }}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-500 dark:text-brand-400">
                          {formatTzHour(ev.start_ms, tz)}
                        </span>
                        <Tag color={getCatColor(ev.category)} bordered={false} style={{ margin: 0 }}>
                          {getCatLabel(ev.category)}
                        </Tag>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {lang === 'vi' ? ev.name_vi : ev.name_en}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-brand-400">
                        <span className="font-mono">{offsetLabel(ev.offset_hours)}</span>
                        {ev.mission_order != null && <span>· M{ev.mission_order}</span>}
                        {ev.duration_hours ? <span>· {ev.duration_hours}h</span> : null}
                      </div>
                      {ev.note_vi && lang === 'vi' && (
                        <div className="text-xs text-gray-500 dark:text-brand-400">{ev.note_vi}</div>
                      )}
                    </li>
                  ))}
              </ul>
            </aside>
          </div>
        )}

        {schedule && view === 'list' && (() => {
          // Build rowSpan for the Date column so identical dates merge into one cell.
          const sorted = [...filteredEvents].sort((a, b) => a.start_ms - b.start_ms);
          const dateSpans = new Map<string, number>();
          for (const ev of sorted) {
            const k = tzDayKey(ev.start_ms, tz);
            dateSpans.set(k, (dateSpans.get(k) ?? 0) + 1);
          }
          const seen = new Set<string>();

          type Row = RenderedEvent & { _date: string; _rowSpan: number };
          const data: Row[] = sorted.map((ev) => {
            const d = tzDayKey(ev.start_ms, tz);
            const rowSpan = seen.has(d) ? 0 : dateSpans.get(d) ?? 1;
            seen.add(d);
            return { ...ev, _date: d, _rowSpan: rowSpan };
          });

          const columns: ColumnsType<Row> = [
            {
              title: t('schedule.cols.date'),
              dataIndex: '_date',
              key: 'date',
              width: 140,
              onCell: (row) => ({ rowSpan: row._rowSpan }),
              render: (_, row) => {
                const d = dayjs(row.start_ms).tz(tz);
                return (
                  <div className="flex flex-col leading-tight">
                    <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                      {d.format('YYYY-MM-DD')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-brand-400">
                      {d.format('dddd')}
                    </span>
                  </div>
                );
              },
            },
            {
              title: t('schedule.cols.time'),
              key: 'time',
              width: 80,
              render: (_, row) => (
                <span className="font-mono text-xs text-gray-700 dark:text-brand-200">
                  {formatTzHour(row.start_ms, tz)}
                </span>
              ),
            },
            {
              title: t('schedule.cols.offset'),
              key: 'offset',
              width: 90,
              render: (_, row) => (
                <span className="font-mono text-xs text-gray-500 dark:text-brand-400">
                  {offsetLabel(row.offset_hours)}
                </span>
              ),
            },
            {
              title: t('schedule.cols.category'),
              key: 'category',
              width: 140,
              render: (_, row) => (
                <Tag color={getCatColor(row.category)} bordered={false} style={{ margin: 0 }}>
                  {getCatLabel(row.category)}
                </Tag>
              ),
            },
            {
              title: t('schedule.cols.event'),
              key: 'event',
              render: (_, row) => (
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {templateLang === 'vi' ? row.name_vi : row.name_en}
                  </span>
                  <div className="flex flex-wrap gap-3 text-[11px] text-gray-500 dark:text-brand-400">
                    {row.mission_order != null && <span>M{row.mission_order}</span>}
                    {row.duration_hours ? <span>{row.duration_hours}h</span> : null}
                  </div>
                  {row.note_vi && templateLang === 'vi' && (
                    <span className="text-xs text-gray-500 dark:text-brand-400">{row.note_vi}</span>
                  )}
                </div>
              ),
            },
          ];

          return (
            <section className="card !p-0 overflow-hidden">
              <Table<Row>
                rowKey="id"
                size="small"
                columns={columns}
                dataSource={data}
                pagination={false}
                rowClassName={(row) => row.start_ms < Date.now() ? 'opacity-60' : ''}
                scroll={{ x: 'max-content' }}
              />
            </section>
          );
        })()}
    </div>
  );
}
