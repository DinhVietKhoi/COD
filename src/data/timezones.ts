/**
 * Curated list of timezones for the UI selector.
 *
 * Stores only city name + IANA zone — the "UTC+xx:xx" prefix is computed
 * dynamically at render time via tzOffsetLabel(), so format stays consistent
 * with the rest of the source code (UTC+07:00 · Ho Chi Minh).
 */
export interface TzOption {
  value: string;  // IANA zone
  city: string;   // display name
}

export const TZ_OPTIONS: TzOption[] = [
  { value: 'Etc/GMT+12',                       city: 'Baker Island' },
  { value: 'Pacific/Pago_Pago',                city: 'American Samoa' },
  { value: 'Pacific/Honolulu',                 city: 'Hawaii' },
  { value: 'America/Anchorage',                city: 'Alaska' },
  { value: 'America/Los_Angeles',              city: 'Pacific Time (US & Canada)' },
  { value: 'America/Denver',                   city: 'Mountain Time (US & Canada)' },
  { value: 'America/Chicago',                  city: 'Central Time (US & Canada)' },
  { value: 'America/New_York',                 city: 'Eastern Time (US & Canada)' },
  { value: 'America/Halifax',                  city: 'Atlantic Time (Canada)' },
  { value: 'America/St_Johns',                 city: 'Newfoundland' },
  { value: 'America/Argentina/Buenos_Aires',   city: 'Buenos Aires' },
  { value: 'Atlantic/South_Georgia',           city: 'South Georgia' },
  { value: 'Atlantic/Azores',                  city: 'Azores' },
  { value: 'UTC',                              city: 'UTC' },
  { value: 'Europe/London',                    city: 'London' },
  { value: 'Europe/Berlin',                    city: 'Berlin' },
  { value: 'Europe/Paris',                     city: 'Paris' },
  { value: 'Europe/Athens',                    city: 'Athens' },
  { value: 'Africa/Cairo',                     city: 'Cairo' },
  { value: 'Europe/Moscow',                    city: 'Moscow' },
  { value: 'Europe/Istanbul',                  city: 'Istanbul' },
  { value: 'Asia/Tehran',                      city: 'Tehran' },
  { value: 'Asia/Dubai',                       city: 'Dubai' },
  { value: 'Asia/Kabul',                       city: 'Kabul' },
  { value: 'Asia/Karachi',                     city: 'Karachi' },
  { value: 'Asia/Kolkata',                     city: 'India' },
  { value: 'Asia/Kathmandu',                   city: 'Nepal' },
  { value: 'Asia/Dhaka',                       city: 'Dhaka' },
  { value: 'Asia/Yangon',                      city: 'Yangon' },
  { value: 'Asia/Bangkok',                     city: 'Bangkok' },
  { value: 'Asia/Jakarta',                     city: 'Jakarta' },
  { value: 'Asia/Ho_Chi_Minh',                 city: 'Ho Chi Minh' },
  { value: 'Asia/Hong_Kong',                   city: 'Hong Kong' },
  { value: 'Asia/Kuala_Lumpur',                city: 'Kuala Lumpur' },
  { value: 'Asia/Manila',                      city: 'Manila' },
  { value: 'Asia/Singapore',                   city: 'Singapore' },
  { value: 'Asia/Shanghai',                    city: 'Shanghai' },
  { value: 'Asia/Taipei',                      city: 'Taipei' },
  { value: 'Asia/Seoul',                       city: 'Seoul' },
  { value: 'Asia/Tokyo',                       city: 'Tokyo' },
  { value: 'Australia/Adelaide',               city: 'Adelaide' },
  { value: 'Australia/Sydney',                 city: 'Sydney' },
  { value: 'Pacific/Guadalcanal',              city: 'Solomon Islands' },
  { value: 'Pacific/Auckland',                 city: 'Auckland' },
  { value: 'Pacific/Tongatapu',                city: 'Tonga' },
  { value: 'Pacific/Kiritimati',               city: 'Kiritimati' },
];
