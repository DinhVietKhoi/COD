export type LangText = { en: string; vi: string };

export type QuizKind = 'personal' | 'alliance';

export interface QuizQuestion {
  id: number;
  key: string;
  question: LangText;
  correct: 'A' | 'B' | 'C' | 'D';
  options: Partial<Record<'A' | 'B' | 'C' | 'D', LangText>>;
}

export interface QuizCategory {
  family: string;
  kind: QuizKind;
  subkind: string | null;
  question_count: number;
  questions: QuizQuestion[];
}

export interface QuizMeta {
  extracted_at: string;
  source_file: string;
  source_modified_utc: string;
  source_size_bytes: number;
  source_md5: string;
  languages: string[];
  family_counts: Record<QuizKind, Record<string, number>>;
  total_questions: number;
  note: string;
}

export interface QuizData {
  _meta: QuizMeta;
  categories: QuizCategory[];
}
