import { useMemo } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTimezone, getTimezoneOptions, getTzOffset } from '../contexts/TimezoneContext';

function offsetMinutes(offset: string): number {
  const m = offset.match(/^([+-])(\d{2}):(\d{2})$/);
  if (!m) return 0;
  const sign = m[1] === '+' ? 1 : -1;
  return sign * (Number(m[2]) * 60 + Number(m[3]));
}

type Opt = {
  value: string;
  label: string;
  _zone: string;
  _city: string;
  _offset: string;
  _detected: boolean;
};

export default function TimezoneSelect() {
  const { t } = useTranslation();
  const { tz, setTz, detected } = useTimezone();

  const options = useMemo<Opt[]>(() => {
    return getTimezoneOptions()
      .map<Opt & { _sort: number }>(({ value, city }) => {
        const offset = getTzOffset(value);
        const offsetNoColon = offset.replace(':', '');
        const offsetHoursOnly = offset.replace(/:\d{2}$/, '');
        return {
          value,
          // Searchable text — antd filters against this. Include many variants:
          // city, IANA zone, UTC+07:00, UTC+0700, UTC+07, GMT+07:00, just "UTC".
          label: `${city} ${value} UTC ${offset} UTC${offset} UTC${offsetNoColon} UTC${offsetHoursOnly} GMT${offset}`,
          _zone: value,
          _city: city,
          _offset: offset,
          _detected: value === detected,
          _sort: offsetMinutes(offset),
        };
      })
      .sort((a, b) => a._sort - b._sort || a._city.localeCompare(b._city));
  }, [detected]);

  const currentOffset = getTzOffset(tz);
  const currentCity = getTimezoneOptions().find((o) => o.value === tz)?.city ?? tz;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-brand-500">
          Timezone
        </span>
        <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
          UTC{currentOffset}
        </span>
      </div>
      <Select<string, Opt>
        value={tz}
        onChange={(v) => setTz(v)}
        options={options}
        showSearch
        placeholder={t('common.timezone.placeholder')}
        title={t('common.timezone.detectedHint', { tz: detected })}
        optionFilterProp="label"
        size="middle"
        style={{ width: '100%' }}
        popupMatchSelectWidth={false}
        labelRender={() => (
          <span className="truncate text-sm text-gray-900 dark:text-white">{currentCity}</span>
        )}
        optionRender={(opt) => {
          const data = opt.data as Opt;
          return (
            <div className="flex items-center justify-between gap-3 py-0.5">
              <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                UTC{data._offset}
              </span>
              <span className="flex-1 truncate text-sm text-gray-900 dark:text-white">
                {data._city}
              </span>
              {data._detected && (
                <span className="rounded-sm bg-indigo-100 px-1 text-[9px] font-semibold uppercase text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  PC
                </span>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
