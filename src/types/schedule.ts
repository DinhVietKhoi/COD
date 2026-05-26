export type CategoryId =
  | 'prekvk'
  | 'milestone'
  | 'lore'
  | 'behe'
  | 'pass'
  | 'fort'
  | 'statue'
  | 'buff'
  | 'unlock'
  | 'weekly'
  | 'monolith'
  | 'darkmonster';

export interface CategoryDef {
  id: CategoryId;
  label_vi: string;
  label_en: string;
  color: string;
}

export interface EventTemplate {
  id: string;
  name_vi: string;
  name_en: string;
  category: CategoryId;
  /** Hours from anchor. Negative = before anchor. */
  offset_hours: number;
  /** Optional duration in hours (default 0 = point event). */
  duration_hours?: number;
  /** Optional mission order (1..21) for lore-driven events. */
  mission_order?: number;
  /** Optional title key referencing ODYSSEY_QUEST_TITLE_N in lc_season.dat. */
  title_key?: string;
  /** Optional note (vi). */
  note_vi?: string;
}

export interface ScheduleTemplate {
  season_id?: string;
  season_label_vi: string;
  season_label_en: string;
  anchor_label_vi: string;
  anchor_label_en: string;
  categories: CategoryDef[];
  events: EventTemplate[];
}

export interface ScheduleIndexEntry {
  id: string;
  label_vi: string;
  label_en: string;
  file: string;
  anchor_default_ms?: number;
  anchor_default_label_vi?: string;
  anchor_default_label_en?: string;
}

export interface ScheduleIndex {
  schedules: ScheduleIndexEntry[];
  default_id: string;
}

export interface RenderedEvent extends EventTemplate {
  /** Absolute start timestamp as UTC ms epoch. */
  start_ms: number;
  /** Optional end timestamp if duration_hours > 0. */
  end_ms?: number;
}

export interface RenderedSchedule {
  anchor_ms: number;
  template: ScheduleTemplate;
  events: RenderedEvent[];
}
