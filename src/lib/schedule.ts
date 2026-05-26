import dayjs from 'dayjs';
import type { RenderedEvent, RenderedSchedule, ScheduleTemplate } from '../types/schedule';

const HOUR_MS = 3_600_000;

/** Format the current offset of a tz as "+07:00" / "-05:00". */
export function tzOffsetLabel(tz: string): string {
  try {
    return dayjs().tz(tz).format('Z');
  } catch {
    return '+00:00';
  }
}

export function generateSchedule(template: ScheduleTemplate, anchorMs: number): RenderedSchedule {
  const events: RenderedEvent[] = template.events.map((e) => {
    const start_ms = anchorMs + e.offset_hours * HOUR_MS;
    const end_ms = e.duration_hours ? start_ms + e.duration_hours * HOUR_MS : undefined;
    return { ...e, start_ms, end_ms };
  });
  events.sort((a, b) => a.start_ms - b.start_ms);
  return { anchor_ms: anchorMs, template, events };
}

/** Format an epoch ms as "YYYY-MM-DD HH:mm" in the given IANA timezone. */
export function formatTzTime(ms: number, tz: string, withZone = false): string {
  const d = dayjs(ms).tz(tz);
  const base = d.format('YYYY-MM-DD HH:mm');
  return withZone ? `${base} ${d.format('Z')}` : base;
}

/** Format only the time part (HH:mm) in the given timezone. */
export function formatTzHour(ms: number, tz: string): string {
  return dayjs(ms).tz(tz).format('HH:mm');
}

/** Day key "YYYY-MM-DD" in the given timezone. */
export function tzDayKey(ms: number, tz: string): string {
  return dayjs(ms).tz(tz).format('YYYY-MM-DD');
}

/** Offset relative to anchor as a human-readable label. */
export function offsetLabel(hours: number): string {
  if (hours === 0) return 'D0';
  const sign = hours > 0 ? '+' : '-';
  const abs = Math.abs(hours);
  const days = Math.floor(abs / 24);
  const h = abs % 24;
  if (days === 0) return `${sign}${h}h`;
  if (h === 0) return `${sign}${days}d`;
  return `${sign}${days}d${h}h`;
}

/** Group events into chronological buckets per day-from-anchor. */
export function groupByDay(sched: RenderedSchedule): Array<{ dayOffset: number; events: RenderedEvent[] }> {
  const groups = new Map<number, RenderedEvent[]>();
  for (const ev of sched.events) {
    const dayOffset = Math.floor(ev.offset_hours / 24);
    if (!groups.has(dayOffset)) groups.set(dayOffset, []);
    groups.get(dayOffset)!.push(ev);
  }
  return Array.from(groups.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([dayOffset, events]) => ({ dayOffset, events }));
}
