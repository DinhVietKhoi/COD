import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import dayjs from 'dayjs';

const STORAGE_KEY = 'cod-web.timezone';

function detectBrowserTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function loadStoredTz(): string {
  const v = localStorage.getItem(STORAGE_KEY);
  if (v && v.trim()) return v;
  return detectBrowserTz();
}

import { TZ_OPTIONS } from '../data/timezones';

/** Curated timezone list shown in the selector. */
export function getTimezoneOptions() {
  return TZ_OPTIONS;
}

/** Current UTC offset for a timezone, formatted like "+07:00". */
export function getTzOffset(tz: string): string {
  try {
    return dayjs().tz(tz).format('Z');
  } catch {
    return '+00:00';
  }
}

interface TimezoneContextValue {
  tz: string;
  setTz: (tz: string) => void;
  detected: string;
  reset: () => void;
}

const TimezoneContext = createContext<TimezoneContextValue>({
  tz: 'UTC',
  setTz: () => undefined,
  detected: 'UTC',
  reset: () => undefined,
});

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [tz, setTzState] = useState<string>(() => loadStoredTz());
  const detected = useMemo(detectBrowserTz, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, tz);
  }, [tz]);

  const value = useMemo<TimezoneContextValue>(
    () => ({
      tz,
      setTz: setTzState,
      detected,
      reset: () => setTzState(detected),
    }),
    [tz, detected],
  );

  return <TimezoneContext.Provider value={value}>{children}</TimezoneContext.Provider>;
}

export const useTimezone = () => useContext(TimezoneContext);
