import { useParams, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuizData, getCategoriesByKind } from '../hooks/useQuizData';
import type { QuizKind, QuizQuestion } from '../types/quiz';
import { SUPPORTED_LANGS, type SupportedLang } from '../i18n';
import Breadcrumb from '../components/Breadcrumb';

const QUESTION_COUNT = 20;
const SECONDS_PER_QUESTION = 30;
const REVEAL_MS = 1600;

type Letter = 'A' | 'B' | 'C' | 'D';
const LETTERS: Letter[] = ['A', 'B', 'C', 'D'];

type Phase = 'playing' | 'revealing' | 'finished';

interface AnswerRecord {
  selected: Letter | null;
  correct: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions(pool: QuizQuestion[]): QuizQuestion[] {
  return shuffle(pool).slice(0, QUESTION_COUNT);
}

export default function QuizPlayPage() {
  const { kind } = useParams<{ kind: string }>();
  const { t, i18n } = useTranslation();
  const state = useQuizData();

  const lang = (SUPPORTED_LANGS.includes(i18n.language as SupportedLang)
    ? i18n.language
    : 'vi') as SupportedLang;

  const pool = useMemo<QuizQuestion[]>(() => {
    if (state.status !== 'ready') return [];
    if (kind !== 'personal' && kind !== 'alliance') return [];
    return getCategoriesByKind(state.data, kind as QuizKind).flatMap((c) => c.questions);
  }, [state, kind]);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Letter | null>(null);
  const [phase, setPhase] = useState<Phase>('playing');
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  const nextTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (questions.length === 0 && pool.length > 0) {
      setQuestions(pickQuestions(pool));
    }
  }, [pool, questions.length]);

  useEffect(() => {
    return () => {
      if (nextTimerRef.current) window.clearTimeout(nextTimerRef.current);
    };
  }, []);

  const current = questions[index];

  const reveal = useCallback(
    (picked: Letter | null) => {
      if (!current) return;
      setSelected(picked);
      setPhase('revealing');
      const isCorrect = picked !== null && picked === current.correct;
      setAnswers((prev) => [...prev, { selected: picked, correct: isCorrect }]);

      nextTimerRef.current = window.setTimeout(() => {
        nextTimerRef.current = null;
        if (index + 1 >= questions.length) {
          setPhase('finished');
        } else {
          setIndex((i) => i + 1);
          setSelected(null);
          setTimeLeft(SECONDS_PER_QUESTION);
          setPhase('playing');
        }
      }, REVEAL_MS);
    },
    [current, index, questions.length],
  );

  useEffect(() => {
    if (phase !== 'playing' || !current) return;
    if (timeLeft <= 0) return;
    const id = window.setTimeout(() => {
      setTimeLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [phase, timeLeft, current]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0 && current) {
      reveal(null);
    }
  }, [phase, timeLeft, current, reveal]);

  const restart = () => {
    if (nextTimerRef.current) {
      window.clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }
    setQuestions(pickQuestions(pool));
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setTimeLeft(SECONDS_PER_QUESTION);
    setPhase('playing');
  };

  if (kind !== 'personal' && kind !== 'alliance') {
    return <Navigate to="/quiz" replace />;
  }
  const quizKind = kind as QuizKind;

  const score = answers.reduce((s, a) => s + (a.correct ? 1 : 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        crumbs={[
          { label: t('common.breadcrumb.home'), to: '/' },
          { label: t('quiz.title'), to: '/quiz' },
          { label: t(`quiz.${quizKind}.title`), to: `/quiz/${quizKind}` },
          { label: t('quiz.play.title') },
        ]}
      />

      <header>
        <p className="text-xs uppercase tracking-wider text-indigo-500 dark:text-brand-400">
          {t(`quiz.${quizKind}.subtitle`)}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {t('quiz.play.title')}
        </h1>
      </header>

      {state.status === 'loading' && (
        <p className="text-gray-500 dark:text-brand-300">{t('quiz.loading')}</p>
      )}
      {state.status === 'error' && (
        <p className="text-red-500 dark:text-red-400">{t('quiz.loadError')}</p>
      )}

      {state.status === 'ready' && questions.length > 0 && phase !== 'finished' && current && (
        <PlayingView
          question={current}
          index={index}
          total={questions.length}
          lang={lang}
          phase={phase}
          selected={selected}
          timeLeft={timeLeft}
          score={score}
          onPick={(letter) => phase === 'playing' && reveal(letter)}
        />
      )}

      {state.status === 'ready' && phase === 'finished' && (
        <FinishedView
          score={score}
          total={questions.length}
          onRestart={restart}
          backTo={`/quiz/${quizKind}`}
        />
      )}
    </div>
  );
}

interface PlayingViewProps {
  question: QuizQuestion;
  index: number;
  total: number;
  lang: SupportedLang;
  phase: Phase;
  selected: Letter | null;
  timeLeft: number;
  score: number;
  onPick: (letter: Letter) => void;
}

function PlayingView({
  question,
  index,
  total,
  lang,
  phase,
  selected,
  timeLeft,
  score,
  onPick,
}: PlayingViewProps) {
  const { t } = useTranslation();
  const revealing = phase === 'revealing';

  const timeRatio = Math.max(0, Math.min(1, timeLeft / SECONDS_PER_QUESTION));
  const isLow = timeLeft <= 5 && !revealing;

  let banner: { text: string; tone: 'success' | 'error' | 'warn' } | null = null;
  if (revealing) {
    if (selected === null) {
      banner = { text: t('quiz.play.timeOut'), tone: 'warn' };
    } else if (selected === question.correct) {
      banner = { text: t('quiz.play.correct'), tone: 'success' };
    } else {
      banner = { text: t('quiz.play.wrong'), tone: 'error' };
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium text-gray-700 dark:text-brand-200">
            {t('quiz.play.progress', { current: index + 1, total })}
          </span>
          <span className="text-gray-400 dark:text-brand-500">·</span>
          <span className="text-gray-600 dark:text-brand-300">
            {t('quiz.play.score', { score })}
          </span>
        </div>
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold tabular-nums transition-colors ${
            revealing
              ? 'bg-gray-100 text-gray-500 dark:bg-brand-800/60 dark:text-brand-400'
              : isLow
              ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
              : 'bg-indigo-100 text-indigo-700 dark:bg-brand-500/20 dark:text-brand-200'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" strokeLinecap="round" />
          </svg>
          {t('quiz.play.timeLeft', { seconds: timeLeft })}
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-brand-800/60">
        <div
          className={`h-full transition-[width] duration-1000 ease-linear ${
            revealing
              ? 'bg-gray-300 dark:bg-brand-600'
              : isLow
              ? 'bg-red-500'
              : 'bg-indigo-500 dark:bg-brand-400'
          }`}
          style={{ width: `${timeRatio * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-brand-800 dark:bg-brand-900/40">
        <p className="text-base font-medium leading-snug text-gray-900 dark:text-white sm:text-lg">
          {question.question[lang]}
        </p>
      </div>

      {/* Banner */}
      {banner && (
        <div
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            banner.tone === 'success'
              ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
              : banner.tone === 'error'
              ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
          }`}
        >
          {banner.text}
        </div>
      )}

      {/* Options */}
      <div className="grid gap-2 sm:grid-cols-2">
        {LETTERS.map((letter) => {
          const opt = question.options[letter];
          if (!opt) return null;
          const isCorrect = letter === question.correct;
          const isSelected = selected === letter;

          let cls =
            'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/60 dark:border-brand-800 dark:bg-brand-900/40 dark:hover:border-brand-600 dark:hover:bg-brand-900';
          let badgeCls =
            'border-gray-300 text-gray-500 dark:border-brand-700 dark:text-brand-400';

          if (revealing) {
            if (isCorrect) {
              cls =
                'border-green-500 bg-green-50 dark:border-green-500 dark:bg-green-500/15';
              badgeCls =
                'border-green-500 bg-green-500 text-white dark:border-green-500 dark:bg-green-500 dark:text-white';
            } else if (isSelected) {
              cls =
                'border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-500/15';
              badgeCls =
                'border-red-500 bg-red-500 text-white dark:border-red-500 dark:bg-red-500 dark:text-white';
            } else {
              cls =
                'border-gray-200 bg-white opacity-60 dark:border-brand-800 dark:bg-brand-900/30';
            }
          } else if (isSelected) {
            cls =
              'border-indigo-400 bg-indigo-50 dark:border-brand-500 dark:bg-brand-800/60';
          }

          return (
            <button
              key={letter}
              type="button"
              onClick={() => onPick(letter)}
              disabled={revealing}
              className={`group flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition disabled:cursor-default ${cls}`}
            >
              <span
                className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${badgeCls}`}
              >
                {letter}
              </span>
              <span className="leading-snug text-gray-900 dark:text-white">
                {opt[lang]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface FinishedViewProps {
  score: number;
  total: number;
  onRestart: () => void;
  backTo: string;
}

function FinishedView({ score, total, onRestart, backTo }: FinishedViewProps) {
  const { t } = useTranslation();
  const ratio = total === 0 ? 0 : score / total;
  const tone =
    ratio >= 0.8
      ? 'text-green-600 dark:text-green-400'
      : ratio >= 0.5
      ? 'text-indigo-600 dark:text-brand-300'
      : 'text-red-600 dark:text-red-400';

  return (
    <div className="card flex flex-col items-center gap-5 text-center">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {t('quiz.play.finished.title')}
      </h2>
      <p className={`text-5xl font-bold tabular-nums ${tone}`}>
        {score}
        <span className="text-2xl text-gray-400 dark:text-brand-500"> / {total}</span>
      </p>
      <p className="text-sm text-gray-600 dark:text-brand-300">
        {t('quiz.play.finished.score', { score, total })}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onRestart} className="btn-primary">
          {t('quiz.play.finished.restart')}
        </button>
        <Link to={backTo} className="btn-ghost">
          {t('quiz.play.finished.back')}
        </Link>
      </div>
    </div>
  );
}