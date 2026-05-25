import { useEffect, useState } from 'react';
import type { QuizData, QuizCategory, QuizKind } from '../types/quiz';

type LoadState =
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready'; data: QuizData; error: null }
  | { status: 'error'; data: null; error: Error };

let cache: QuizData | null = null;
let inflight: Promise<QuizData> | null = null;

async function loadQuizData(): Promise<QuizData> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch('/cod-quiz.json')
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<QuizData>;
    })
    .then((data) => {
      cache = data;
      return data;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useQuizData(): LoadState {
  const [state, setState] = useState<LoadState>(
    cache
      ? { status: 'ready', data: cache, error: null }
      : { status: 'loading', data: null, error: null },
  );

  useEffect(() => {
    if (state.status === 'ready') return;
    let alive = true;
    loadQuizData()
      .then((data) => {
        if (alive) setState({ status: 'ready', data, error: null });
      })
      .catch((err: Error) => {
        if (alive) setState({ status: 'error', data: null, error: err });
      });
    return () => {
      alive = false;
    };
  }, [state.status]);

  return state;
}

export function getCategoriesByKind(data: QuizData, kind: QuizKind): QuizCategory[] {
  return data.categories.filter((c) => c.kind === kind);
}

export function getKindTotal(data: QuizData, kind: QuizKind): number {
  return getCategoriesByKind(data, kind).reduce((s, c) => s + c.question_count, 0);
}
