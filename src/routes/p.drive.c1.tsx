import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAiContent, generateAiContent, DMV_PROMPT_VERSION } from "@/lib/ai-knowledge.functions";
import { getAiQuota, consumeAiQuota, DEFAULT_FREE_QUOTA } from "@/lib/ai-quota.functions";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getRandomQuizQuestions,
  getMixedRandomQuestions,
  getMixedRandomQuestionsWithHistory,
  gradeQuiz,
  checkAnswer,
  type QuizQuestion,
  type GradedQuestion,
  type GradeResult,
} from "@/lib/quiz.functions";
import { translateTexts } from "@/lib/translate.functions";
import { Languages, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExamOptionList } from "@/components/exam/ExamOptionList";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  ClipboardCheck,
  Clock,
  ListChecks,
  Bookmark,
  Lightbulb,
  ScrollText,
  BookOpen,
  ExternalLink,
  ChevronDown,
  GraduationCap,
  Sparkles,
  Lock,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const AI_FEATURE_KEY = "dmv-c1-analysis";
const LOCAL_AI_QUOTA_KEY = "lione:ai-quota:";

function localQuotaKey(featureKey: string) {
  const today = new Date().toISOString().slice(0, 10);
  return `${LOCAL_AI_QUOTA_KEY}${featureKey}:${today}`;
}
function getLocalQuotaRemaining(featureKey: string): number {
  if (typeof window === "undefined") return DEFAULT_FREE_QUOTA;
  try {
    const used = parseInt(window.localStorage.getItem(localQuotaKey(featureKey)) || "0", 10);
    return Math.max(0, DEFAULT_FREE_QUOTA - used);
  } catch {
    return DEFAULT_FREE_QUOTA;
  }
}
function consumeLocalQuota(featureKey: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const key = localQuotaKey(featureKey);
    const used = parseInt(window.localStorage.getItem(key) || "0", 10);
    const next = used + 1;
    window.localStorage.setItem(key, String(next));
    return Math.max(0, DEFAULT_FREE_QUOTA - next);
  } catch {
    return 0;
  }
}


const DEFAULT_HANDBOOK_URL = "https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/";
const CDL_HANDBOOK_URL = "https://www.dmv.ca.gov/portal/handbook/commercial-driver-handbook/";
const CDL_CATEGORIES = new Set(["air_brake", "combination_vehicle", "commercial_driver"]);

function defaultManualName(category: string): string {
  return CDL_CATEGORIES.has(category)
    ? "California Commercial Driver Handbook"
    : "California Driver Handbook";
}
function defaultManualUrl(category: string): string {
  return CDL_CATEGORIES.has(category) ? CDL_HANDBOOK_URL : DEFAULT_HANDBOOK_URL;
}
function buildGoogleQuery(r: GradedQuestion): string {
  if (r.google_keywords && r.google_keywords.trim()) return r.google_keywords.trim();
  const q = (r.question_en && r.question_en.trim()) || r.question;
  const manual = r.manual_name?.trim() || defaultManualName(r.category);
  return `${q} ${manual}`;
}

export const Route = createFileRoute("/p/drive/c1")({
  head: () => ({
    meta: [
      { title: "小型车 C1 模拟考试 · Lione Apps" },
      { name: "description", content: "小型车 C1 驾照笔试模拟考试，题库随机抽题、自动判分、错题回顾。" },
    ],
  }),
  component: QuizPage,
});

type Phase = "intro" | "exam" | "result";

type QuestionTranslation = {
  question?: string;
  options?: Partial<Record<"A" | "B" | "C" | "D", string>>;
  explanation?: string;
};

export type QuizAppProps = {
  embedded?: boolean;
  category?: string;
  /** Optional mixed pools; overrides `category` when provided. */
  pools?: { category: string; count: number }[];
  total?: number;
  pass?: number;
  examSeconds?: number;
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  /** Optional wrong-based passing rule (e.g. maxWrong=6 for C1 mock). */
  maxWrong?: number;
  /** When true, exclude previously-seen questions per pool via localStorage. */
  useHistory?: boolean;
  /** Stable key used to namespace history in localStorage. */
  historyKey?: string;
  /** Max number of skips allowed during the exam (default: unlimited). */
  maxSkip?: number;
  /** Enable attempts tracking (e.g. 3 tries before forced reset). */
  maxAttempts?: number;
  /** Stable localStorage key for attempts counter. */
  attemptsKey?: string;
  /** Called when the user leaves this exam (back to hub / after final fail reset). */
  onExit?: () => void;
  /** Visual theme accent. */
  theme?: "blue" | "orange";
  /** When true, reveal correct answer immediately after a wrong pick and color the answer sheet. */
  instantFeedback?: boolean;
  /** When true, render the simplified intro rule list and hide the side rules/tips cards. */
  simplifiedRules?: boolean;
  /** Apple-minimal exam UI: no header/answer-sheet/skip/prev; submit-per-question; no AI in review. */
  minimalMode?: boolean;
};

const DEFAULT_TOTAL = 36;
const DEFAULT_PASS = 30;
const DEFAULT_SECONDS = 60 * 60;

export function QuizApp(props: QuizAppProps = {}) {
  const {
    embedded = false,
    category = "c1",
    pools,
    total: TOTAL = DEFAULT_TOTAL,
    pass: PASS = DEFAULT_PASS,
    maxWrong: MAX_WRONG,
    examSeconds: EXAM_SECONDS = DEFAULT_SECONDS,
    title = "California DMV 驾照模拟考试",
    subtitle = "模拟考试与加州 DMV 正式考试一致,帮助考生熟悉考试流程。",
    backHref = "/p/drive",
    backLabel = "← 返回驾考工具",
    useHistory = false,
    historyKey,
    maxSkip: MAX_SKIP,
    maxAttempts: MAX_ATTEMPTS,
    attemptsKey,
    onExit,
    theme = "blue",
    instantFeedback = false,
    simplifiedRules = false,
    minimalMode = false,
  } = props;



  // ---- Attempts (theory-only style rule: 3 tries then reset) ----
  const readAttempts = (): number => {
    if (!attemptsKey || typeof window === "undefined") return 0;
    try {
      return parseInt(window.localStorage.getItem(attemptsKey) || "0", 10) || 0;
    } catch {
      return 0;
    }
  };
  const writeAttempts = (n: number) => {
    if (!attemptsKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(attemptsKey, String(n));
    } catch {
      /* ignore */
    }
  };
  const clearAttempts = () => {
    if (!attemptsKey || typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(attemptsKey);
    } catch {
      /* ignore */
    }
  };

  const fetchFn = useServerFn(getRandomQuizQuestions);
  const fetchMixedFn = useServerFn(getMixedRandomQuestions);
  const fetchMixedHistFn = useServerFn(getMixedRandomQuestionsWithHistory);
  const gradeFn = useServerFn(gradeQuiz);

  const HISTORY_STORAGE_KEY = useMemo(() => {
    if (!useHistory) return null;
    const key = historyKey || (pools ? pools.map((p) => `${p.category}:${p.count}`).join("|") : category);
    return `lione:quiz-history:v1:${key}`;
  }, [useHistory, historyKey, pools, category]);

  const readHistory = (): Record<string, string[]> => {
    if (!HISTORY_STORAGE_KEY || typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    } catch {
      return {};
    }
  };
  const writeHistory = (h: Record<string, string[]>) => {
    if (!HISTORY_STORAGE_KEY || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(h));
    } catch {
      /* quota / private mode — ignore */
    }
  };

  const load = useMutation({
    mutationFn: async () => {
      if (useHistory && pools && pools.length > 0) {
        const history = readHistory();
        const res = await fetchMixedHistFn({
          data: {
            pools: pools.map((p) => ({
              category: p.category,
              count: p.count,
              excludeIds: history[p.category] ?? [],
            })),
          },
        });
        // Update history per pool. If exhausted, this round starts fresh —
        // reset that pool's history to only the newly picked ids so the
        // next exam again excludes what was just seen.
        const next: Record<string, string[]> = { ...history };
        for (const p of res.pools) {
          if (p.exhausted) {
            next[p.category] = [...p.pickedIds];
          } else {
            const prev = new Set(next[p.category] ?? []);
            for (const id of p.pickedIds) prev.add(id);
            next[p.category] = [...prev];
          }
        }
        writeHistory(next);
        return res.questions;
      }
      return pools && pools.length > 0
        ? fetchMixedFn({ data: { pools } })
        : fetchFn({ data: { category, count: TOTAL } });
    },
  });
  const submit = useMutation({
    mutationFn: (vars: { ids: string[]; answers: Record<string, "A" | "B" | "C" | "D"> }) =>
      gradeFn({ data: vars }),
  });

  function resetHistory() {
    if (!HISTORY_STORAGE_KEY || typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});
  const [correctMap, setCorrectMap] = useState<Record<string, boolean>>({});
  const [revealedCorrect, setRevealedCorrect] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [current, setCurrent] = useState(0);
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(EXAM_SECONDS);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translations, setTranslations] = useState<Record<string, QuestionTranslation>>({});
  const [translating, setTranslating] = useState(false);
  const [confirmUnanswered, setConfirmUnanswered] = useState(false);
  const [passStopShown, setPassStopShown] = useState(false);
  const [showPassStop, setShowPassStop] = useState(false);
  const [earlyEnded, setEarlyEnded] = useState(false);
  const [skipConfirmOpen, setSkipConfirmOpen] = useState(false);
  const [skipLimitOpen, setSkipLimitOpen] = useState(false);
  const [finalFailOpen, setFinalFailOpen] = useState(false);
  const [attempts, setAttempts] = useState<number>(0);
  const translateFn = useServerFn(translateTexts);
  const checkFn = useServerFn(checkAnswer);

  useEffect(() => {
    setAttempts(readAttempts());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptsKey]);

  const correctCount = Object.values(correctMap).filter(Boolean).length;
  const skippedCount = Object.values(skipped).filter(Boolean).length;
  const skipsRemaining =
    typeof MAX_SKIP === "number" ? Math.max(0, MAX_SKIP - skippedCount) : Infinity;

  // Pass-and-stop: only for correct-count-based exams (no maxWrong rule).
  useEffect(() => {
    if (phase !== "exam") return;
    if (typeof MAX_WRONG === "number") return;
    if (!passStopShown && correctCount >= PASS) {
      setPassStopShown(true);
      setShowPassStop(true);
    }
  }, [correctCount, phase, PASS, MAX_WRONG, passStopShown]);

  async function handlePick(qid: string, key: "A" | "B" | "C" | "D") {
    // In minimal mode, the user submits explicitly — don't auto-grade on pick.
    if (minimalMode) {
      if (qid in correctMap) return; // already judged; locked
      setAnswers((prev) => ({ ...prev, [qid]: key }));
      setSkipped((prev) => {
        if (!prev[qid]) return prev;
        const { [qid]: _, ...rest } = prev;
        return rest;
      });
      return;
    }
    // In instant-feedback mode, once a question is answered, ignore further picks.
    if (instantFeedback && qid in answers) return;
    setAnswers((prev) => ({ ...prev, [qid]: key }));
    setSkipped((prev) => {
      if (!prev[qid]) return prev;
      const { [qid]: _, ...rest } = prev;
      return rest;
    });
    try {
      const res = await checkFn({ data: { id: qid, answer: key } });
      setCorrectMap((prev) => ({ ...prev, [qid]: res.is_correct }));
      if (!res.is_correct && res.correct_answer) {
        setRevealedCorrect((prev) => ({ ...prev, [qid]: res.correct_answer! }));
      }
    } catch (e) {
      console.error("checkAnswer error", e);
    }
  }

  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  async function submitCurrentAnswer() {
    const q = questions[current];
    if (!q) return;
    const picked = answers[q.id];
    if (!picked) return;
    if (q.id in correctMap) return;
    setSubmittingAnswer(true);
    try {
      const res = await checkFn({ data: { id: q.id, answer: picked } });
      setCorrectMap((prev) => ({ ...prev, [q.id]: res.is_correct }));
      if (!res.is_correct && res.correct_answer) {
        setRevealedCorrect((prev) => ({ ...prev, [q.id]: res.correct_answer! }));
      }
      const isLast = current >= questions.length - 1;
      const delay = res.is_correct ? 1000 : 2000;
      window.setTimeout(() => {
        if (isLast) {
          void submitExam();
        } else {
          setCurrent((i) => Math.min(questions.length - 1, i + 1));
        }
      }, delay);
    } catch (e) {
      console.error("submitCurrentAnswer error", e);
    } finally {
      setSubmittingAnswer(false);
    }
  }

  function performSkip() {
    const q = questions[current];

    if (!q) return;
    setSkipped((prev) => ({ ...prev, [q.id]: true }));
    setAnswers((prev) => {
      if (!(q.id in prev)) return prev;
      const { [q.id]: _, ...rest } = prev;
      return rest;
    });
    setCorrectMap((prev) => {
      if (!(q.id in prev)) return prev;
      const { [q.id]: _, ...rest } = prev;
      return rest;
    });
    setCurrent((i) => Math.min(questions.length - 1, i + 1));
  }

  function handleSkip() {
    const q = questions[current];
    if (!q) return;
    if (typeof MAX_SKIP === "number") {
      // If this question is already marked as skipped, moving forward doesn't consume another.
      const alreadySkipped = !!skipped[q.id];
      if (!alreadySkipped && skippedCount >= MAX_SKIP) {
        setSkipLimitOpen(true);
        return;
      }
      setSkipConfirmOpen(true);
      return;
    }
    performSkip();
  }

  function requestSubmitFromLast() {
    const unanswered = questions.filter((q) => !answers[q.id]).length;
    if (unanswered > 0) {
      setConfirmUnanswered(true);
      return;
    }
    void submitExam();
  }

  async function startExam() {
    // Guard: if attempts already exhausted, force reset flow.
    if (typeof MAX_ATTEMPTS === "number" && readAttempts() >= MAX_ATTEMPTS) {
      setFinalFailOpen(true);
      return;
    }
    const rows = await load.mutateAsync();
    if (!rows.length) return;
    setQuestions(rows);
    setAnswers({});
    setMarked({});
    setSkipped({});
    setCorrectMap({});
    setRevealedCorrect({});
    setPassStopShown(false);
    setShowPassStop(false);
    setEarlyEnded(false);
    setCurrent(0);
    setGrade(null);
    setSecondsLeft(EXAM_SECONDS);
    setPhase("exam");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  function resetToIntro() {
    setPhase("intro");
    setQuestions([]);
    setAnswers({});
    setMarked({});
    setSkipped({});
    setCorrectMap({});
    setRevealedCorrect({});
    setPassStopShown(false);
    setShowPassStop(false);
    setEarlyEnded(false);
    setCurrent(0);
    setGrade(null);
  }

  function fullResetRound() {
    // Clear attempts + history + local exam state, then exit to parent (hub).
    clearAttempts();
    setAttempts(0);
    resetHistory();
    resetToIntro();
    setFinalFailOpen(false);
    onExit?.();
  }

  async function submitExam() {
    const ids = questions.map((q) => q.id);
    const res = await submit.mutateAsync({ ids, answers });
    setGrade(res);
    setPhase("result");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });

    // Attempts tracking (theory-style: 3 tries then force reset).
    if (typeof MAX_ATTEMPTS === "number") {
      const passed =
        typeof MAX_WRONG === "number"
          ? res.wrong <= MAX_WRONG
          : res.correct >= PASS;
      if (passed) {
        clearAttempts();
        setAttempts(0);
      } else {
        const next = readAttempts() + 1;
        writeAttempts(next);
        setAttempts(next);
        if (next >= MAX_ATTEMPTS) {
          // Slight delay so the result renders first.
          setTimeout(() => setFinalFailOpen(true), 200);
        }
      }
    }
  }


  async function ensureTranslation(q: QuizQuestion) {
    if (translations[q.id]) return;
    const optKeys = (["A", "B", "C", "D"] as const).filter(
      (k) => !!(q as unknown as Record<string, string | null>)[`option_${k.toLowerCase()}`],
    );
    const parts: string[] = [];
    parts.push(q.question);
    for (const k of optKeys) {
      parts.push((q as unknown as Record<string, string>)[`option_${k.toLowerCase()}`]);
    }
    setTranslating(true);
    try {
      const res = await translateFn({ data: { texts: parts, target: "en" } });
      const out = res.translations;
      const entry: QuestionTranslation = { options: {} };
      let i = 0;
      entry.question = out[i++];
      for (const k of optKeys) entry.options![k] = out[i++];
      setTranslations((prev) => ({ ...prev, [q.id]: entry }));
    } catch (e) {
      console.error("translate error", e);
    } finally {
      setTranslating(false);
    }
  }

  async function toggleTranslation() {
    const next = !showTranslation;
    setShowTranslation(next);
    if (next && phase === "exam") {
      const q = questions[current];
      if (q) await ensureTranslation(q);
    }
  }

  // auto-fetch translation when navigating between questions while enabled
  useEffect(() => {
    if (!showTranslation || phase !== "exam") return;
    const q = questions[current];
    if (q) void ensureTranslation(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, showTranslation, phase]);

  const body = (
    <div className={cn("min-h-screen", minimalMode ? "bg-white" : "bg-[#F8FAFC]")}>
      <div className={cn("mx-auto px-4 md:px-8 py-6 md:py-8", minimalMode ? "max-w-[760px]" : "max-w-[1400px]")}>
        {!(minimalMode && phase === "exam") && (
          <BlueBanner
            embedded={embedded}
            phase={phase}
            secondsLeft={secondsLeft}
            current={current}
            total={questions.length || TOTAL}
            title={title}
            subtitle={subtitle}
            backHref={backHref}
            backLabel={backLabel}
            onReset={phase !== "intro" ? resetToIntro : undefined}
            showTranslation={showTranslation}
            onToggleTranslation={toggleTranslation}
            translating={translating}
            theme={theme}
          />
        )}


        {phase === "intro" && (
          <div className="mt-6">
            <Intro
              total={TOTAL}
              pass={PASS}
              maxWrong={MAX_WRONG}
              maxSkip={MAX_SKIP}
              examSeconds={EXAM_SECONDS}
              onStart={startExam}
              loading={load.isPending}
              error={load.error?.message}
              showHistoryReset={useHistory}
              onResetHistory={resetHistory}
              attempts={attempts}
              maxAttempts={MAX_ATTEMPTS}
              theme={theme}
              onExit={onExit}
              simplifiedRules={simplifiedRules}
            />
          </div>
        )}

        {phase === "exam" && minimalMode && (
          <div className="mt-2">
            <Exam
              questions={questions}
              answers={answers}
              onPick={handlePick}
              onSkip={handleSkip}
              current={current}
              setCurrent={setCurrent}
              showTranslation={showTranslation}
              translations={translations}
              translating={translating}
              onSubmit={requestSubmitFromLast}
              submitting={submit.isPending}
              skipsRemaining={skipsRemaining}
              theme={theme}
              instantFeedback={instantFeedback}
              correctMap={correctMap}
              revealedCorrect={revealedCorrect}
              minimalMode
              onSubmitAnswer={submitCurrentAnswer}
              submittingAnswer={submittingAnswer}
            />
          </div>
        )}

        {phase === "exam" && !minimalMode && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] gap-6">
            <div className="min-w-0 space-y-6">
              <Exam
                questions={questions}
                answers={answers}
                onPick={handlePick}
                onSkip={handleSkip}
                current={current}
                setCurrent={setCurrent}
                showTranslation={showTranslation}
                translations={translations}
                translating={translating}
                onSubmit={requestSubmitFromLast}
                submitting={submit.isPending}
                skipsRemaining={skipsRemaining}
                theme={theme}
                instantFeedback={instantFeedback}
                correctMap={correctMap}
                revealedCorrect={revealedCorrect}
              />
              {!simplifiedRules && (
                <RulesTips total={TOTAL} pass={PASS} maxWrong={MAX_WRONG} examSeconds={EXAM_SECONDS} maxSkip={MAX_SKIP} />
              )}
            </div>
            <aside className="lg:sticky lg:top-6 self-start">
              <AnswerSheet
                questions={questions}
                answers={answers}
                marked={marked}
                setMarked={setMarked}
                skipped={skipped}
                current={current}
                setCurrent={setCurrent}
                onSubmit={submitExam}
                submitting={submit.isPending}
                submitError={submit.error?.message}
                instantFeedback={instantFeedback}
                correctMap={correctMap}
              />
            </aside>
          </div>
        )}



        {phase === "result" && grade && (
          <div className="mt-6">
            <Result
              grade={grade}
              pass={PASS}
              maxWrong={MAX_WRONG}
              skippedCount={Object.values(skipped).filter(Boolean).length}
              earlyEnded={earlyEnded}
              onRetake={startExam}
              onHome={onExit ?? resetToIntro}
              retaking={load.isPending}
              attempts={attempts}
              maxAttempts={MAX_ATTEMPTS}
              homeLabel={onExit ? "返回首页" : "返回"}
              minimalMode={minimalMode}

            />
          </div>
        )}
      </div>


      {phase === "exam" && <CountdownTicker onTick={setSecondsLeft} />}

      {confirmUnanswered && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => (submit.isPending ? null : setConfirmUnanswered(false))}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900">还有未作答的题目</h3>
            <p className="text-sm text-slate-600">
              你还有 {questions.filter((q) => !answers[q.id]).length} 道题未作答，是否确认提交？
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setConfirmUnanswered(false)} disabled={submit.isPending}>
                继续答题
              </Button>
              <Button
                onClick={async () => {
                  await submitExam();
                  setConfirmUnanswered(false);
                }}
                disabled={submit.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submit.isPending ? "评分中…" : "确认提交"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showPassStop && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => (submit.isPending ? null : setShowPassStop(false))}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-emerald-100 text-emerald-600 grid place-items-center">
                <CheckCircle2 size={22} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">恭喜！你已通过</h3>
            </div>
            <p className="text-sm text-slate-600">
              你已答对 <b className="text-emerald-600">{correctCount}</b> 题，达到 DMV 小型车 C1 模拟考通过标准（{PASS} 题）。
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowPassStop(false)} disabled={submit.isPending}>
                继续答完剩余题目
              </Button>
              <Button
                onClick={async () => {
                  setShowPassStop(false);
                  setEarlyEnded(true);
                  await submitExam();
                }}
                disabled={submit.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {submit.isPending ? "评分中…" : "查看成绩"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {skipConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSkipConfirmOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900">确认跳过此题？</h3>
            <p className="text-sm text-slate-600">
              您最多只能跳过 <b>{MAX_SKIP}</b> 道题。是否确定跳过当前题目？
              {typeof MAX_SKIP === "number" && (
                <span className="block mt-1 text-xs text-slate-500">
                  已跳过 {skippedCount} 题，剩余 {Math.max(0, MAX_SKIP - skippedCount)} 次。
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSkipConfirmOpen(false)}>否</Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => {
                  setSkipConfirmOpen(false);
                  performSkip();
                }}
              >
                是，跳过
              </Button>
            </div>
          </div>
        </div>
      )}

      {skipLimitOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSkipLimitOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900">已达最大跳过次数</h3>
            <p className="text-sm text-slate-600">
              您已经达到最大跳过次数（{MAX_SKIP} 次）。请继续完成当前题目。
            </p>
            <div className="flex justify-end pt-2">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setSkipLimitOpen(false)}>
                我知道了
              </Button>
            </div>
          </div>
        </div>
      )}

      {finalFailOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-red-100 text-red-600 grid place-items-center">
                <XCircle size={22} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">❌ 本次考试未通过</h3>
            </div>
            <p className="text-sm text-slate-600">
              很遗憾！您已使用完本轮全部 <b>{MAX_ATTEMPTS}</b> 次考试机会。
              系统将重新开始新的模拟考试，并重新随机生成新的试卷。
            </p>
            <div className="flex justify-end pt-2">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={fullResetRound}>
                重新开始模拟考试
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );


  return embedded ? body : <SiteLayout>{body}</SiteLayout>;
}

function QuizPage() {
  return <QuizApp />;
}

/* -------------------- Banner -------------------- */

function BlueBanner({
  embedded, phase, secondsLeft, current, total, title, subtitle, backHref, backLabel, onReset,
  showTranslation, onToggleTranslation, translating, theme = "blue",
}: {
  embedded: boolean;
  phase: Phase;
  secondsLeft: number;
  current: number;
  total: number;
  title: string;
  subtitle: string;
  backHref: string;
  backLabel: string;
  onReset?: () => void;
  showTranslation?: boolean;
  onToggleTranslation?: () => void;
  translating?: boolean;
  theme?: "blue" | "orange";
}) {
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const gradient =
    theme === "orange"
      ? "bg-gradient-to-r from-[#9a3412] via-[#c2410c] to-[#ea580c]"
      : "bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb]";
  const borderClass = theme === "orange" ? "border-orange-900/10" : "border-blue-900/10";
  const openTextClass = theme === "orange" ? "text-orange-700" : "text-blue-700";

  return (
    <div className={cn("rounded-2xl overflow-hidden shadow-sm border", borderClass)}>
      <div className={cn(gradient, "text-white")}>
        <div className="px-5 md:px-8 py-5 md:py-6 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] items-center gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-2xl bg-white/15 backdrop-blur grid place-items-center ring-1 ring-white/20">
              <ClipboardCheck size={26} />
            </div>
            <div className="min-w-0">
              {!embedded && (
                <a
                  href={backHref}
                  className="text-[11px] uppercase tracking-wider text-white/70 hover:text-white"
                >
                  {backLabel}
                </a>
              )}
              <h1 className="text-lg md:text-2xl font-bold tracking-tight truncate">{title}</h1>
              <p className="text-xs md:text-sm text-white/80 mt-0.5">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {phase === "exam" && (
              <>
                <StatChip icon={<Clock size={16} />} label="剩余时间" value={`${mm}:${ss}`} />
                <StatChip icon={<ListChecks size={16} />} label="题目进度" value={`${current + 1} / ${total}`} />
              </>
            )}
            {onToggleTranslation && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onToggleTranslation}
                className={cn(
                  "border border-white/20 text-white",
                  showTranslation ? cn("bg-white hover:bg-white/90", openTextClass) : "bg-white/15 hover:bg-white/25",
                )}
                title="在线中英对照翻译"
              >
                {translating ? (
                  <Loader2 size={14} className="mr-1 animate-spin" />
                ) : (
                  <Languages size={14} className="mr-1" />
                )}
                {showTranslation ? "中英对照 · 开" : "中英对照"}
              </Button>
            )}
            {onReset && (
              <Button variant="secondary" size="sm" onClick={onReset} className="bg-white/15 hover:bg-white/25 text-white border border-white/20">
                <RotateCcw size={14} className="mr-1" /> 重新开始
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white text-slate-900 rounded-xl px-4 py-2.5 shadow-sm min-w-[130px]">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <span className="text-blue-600">{icon}</span>
        {label}
      </div>
      <div className="text-lg font-bold tabular-nums leading-tight">{value}</div>
    </div>
  );
}

/* -------------------- Countdown -------------------- */

function CountdownTicker({ onTick }: { onTick: (v: number | ((v: number) => number)) => void }) {
  const ref = useRef(onTick);
  ref.current = onTick;
  useEffect(() => {
    const id = window.setInterval(() => {
      ref.current((s: number) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);
  return null;
}

/* -------------------- Intro -------------------- */

function Intro({
  total, pass, maxWrong, maxSkip, examSeconds, onStart, loading, error,
  showHistoryReset = false, onResetHistory,
  attempts = 0, maxAttempts, theme = "blue", onExit,
  simplifiedRules = false,
}: {
  total: number; pass: number; maxWrong?: number; maxSkip?: number; examSeconds: number;
  onStart: () => void; loading: boolean; error?: string;
  showHistoryReset?: boolean; onResetHistory?: () => void;
  attempts?: number; maxAttempts?: number;
  theme?: "blue" | "orange"; onExit?: () => void;
  simplifiedRules?: boolean;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const accent =
    theme === "orange"
      ? { icon: "bg-orange-50 text-orange-600", btn: "bg-orange-600 hover:bg-orange-700" }
      : { icon: "bg-blue-50 text-blue-600", btn: "bg-blue-600 hover:bg-blue-700" };
  const attemptsLeft =
    typeof maxAttempts === "number" ? Math.max(0, maxAttempts - attempts) : undefined;
  return (
    <div className={cn("grid grid-cols-1 gap-6", !simplifiedRules && "lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]")}>
      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardContent className="p-8 md:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className={cn("h-12 w-12 rounded-2xl grid place-items-center", accent.icon)}>
              <ClipboardCheck size={24} />
            </div>
            <div>
              <div className="text-lg font-semibold">开始模拟考试</div>
              <div className="text-sm text-muted-foreground">随机抽题 · 自动判分</div>
            </div>
          </div>
          <ul className="text-sm text-foreground/80 space-y-2 list-disc pl-5">
            <li>共 <b>{total}</b> 道题，随机从题库抽取。</li>
            <li>请认真审题。</li>
            <li>考试时长 <b>{Math.round(examSeconds / 60)}</b> 分钟。</li>
            <li>交卷后将显示成绩、正确答案与错题回顾。</li>
            {!simplifiedRules && typeof maxWrong === "number" && (
              <li>最多允许错 <b>{maxWrong}</b> 题。</li>
            )}
            {!simplifiedRules && typeof maxSkip === "number" ? (
              <li>最多允许跳过 <b>{maxSkip}</b> 题。</li>
            ) : null}
            {!simplifiedRules && typeof maxSkip !== "number" && (
              <li>允许无限次跳过。</li>
            )}
            {!simplifiedRules && typeof maxAttempts === "number" && (
              <li className="text-slate-700">
                本轮总共 <b>{maxAttempts}</b> 次考试机会，当前第 <b>{Math.min(attempts + 1, maxAttempts)}</b> / {maxAttempts} 次。
                {attemptsLeft !== undefined && attemptsLeft < maxAttempts && (
                  <span className="ml-1 text-amber-700">剩余 {attemptsLeft} 次</span>
                )}
              </li>
            )}
            {!simplifiedRules && showHistoryReset && (
              <li className="text-muted-foreground">
                已出过的题目下次会自动排除；每个题库刷完一轮后重新开始。
              </li>
            )}
          </ul>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={onStart} disabled={loading} className={accent.btn}>
              {loading ? "抽题中…" : "开始考试"}
            </Button>
            {onExit && (
              <Button size="lg" variant="outline" onClick={onExit}>
                返回考试选择
              </Button>
            )}
            {showHistoryReset && onResetHistory && (
              confirmReset ? (
                <>
                  <span className="text-sm text-muted-foreground">确定要清空出题历史？</span>
                  <Button size="sm" variant="destructive" onClick={() => { onResetHistory(); setConfirmReset(false); }}>
                    确认重置
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>取消</Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setConfirmReset(true)}>
                  <RotateCcw size={14} className="mr-1" />重置我的出题历史
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>
      {!simplifiedRules && (
        <div className="space-y-6">
          <RulesCard total={total} pass={pass} maxWrong={maxWrong} maxSkip={maxSkip} examSeconds={examSeconds} />
          <TipsCard />
        </div>
      )}
    </div>
  );
}


/* -------------------- Exam -------------------- */

function Exam({
  questions, answers, onPick, onSkip, current, setCurrent,
  showTranslation = false, translations = {}, translating = false,
  onSubmit, submitting = false, skipsRemaining = Infinity, theme = "blue",
  instantFeedback = false, correctMap = {}, revealedCorrect = {},
  minimalMode = false, onSubmitAnswer, submittingAnswer = false,
}: {
  questions: QuizQuestion[];
  answers: Record<string, "A" | "B" | "C" | "D">;
  onPick: (qid: string, key: "A" | "B" | "C" | "D") => void;
  onSkip: () => void;
  current: number;
  setCurrent: React.Dispatch<React.SetStateAction<number>>;
  showTranslation?: boolean;
  translations?: Record<string, QuestionTranslation>;
  translating?: boolean;
  onSubmit?: () => void;
  submitting?: boolean;
  skipsRemaining?: number;
  theme?: "blue" | "orange";
  instantFeedback?: boolean;
  correctMap?: Record<string, boolean>;
  revealedCorrect?: Record<string, "A" | "B" | "C" | "D">;
  minimalMode?: boolean;
  onSubmitAnswer?: () => void;
  submittingAnswer?: boolean;
}) {


  const q = questions[current];
  const tr = translations[q?.id ?? ""];
  const options = useMemo(
    () =>
      (["A", "B", "C", "D"] as const)
        .map((k) => ({
          key: k,
          text: (q as unknown as Record<string, string | null>)[`option_${k.toLowerCase()}`],
          textEn: (q as unknown as Record<string, string | null>)[`option_${k.toLowerCase()}_en`],
        }))
        .filter((o) => o.text && o.text.trim() !== ""),
    [q],
  );

  function pick(k: "A" | "B" | "C" | "D") {
    onPick(q.id, k);
  }

  const questionEn = q.question_en || (showTranslation ? tr?.question : null);
  const showAiBadge = showTranslation && !q.question_en && !!tr?.question;

  const isSignRecognition = q.question_type === "sign_recognition";

  return (
    <Card className={cn("rounded-2xl", minimalMode ? "border-transparent shadow-none bg-white" : "border-slate-200 shadow-sm")}>
      <CardContent className={cn(minimalMode ? "p-4 md:p-6 space-y-8" : "p-6 md:p-8 space-y-6")}>
        <div className={cn("flex gap-3", minimalMode ? "items-start" : "items-baseline")}>
          {!minimalMode && (
            <span className="text-2xl md:text-3xl font-bold text-blue-600 tabular-nums">{current + 1}.</span>
          )}
          <div className="min-w-0">
            <h2 className={cn(
              "leading-relaxed whitespace-pre-wrap text-slate-900",
              minimalMode ? "text-xl md:text-2xl font-semibold tracking-tight" : "text-base md:text-lg font-semibold",
            )}>
              {q.question}
            </h2>
            {(showTranslation || q.question_en) && questionEn && (
              <p className="mt-1.5 text-sm md:text-base text-slate-500 leading-relaxed whitespace-pre-wrap italic">
                {questionEn}
                {showAiBadge && (
                  <span className="ml-2 not-italic text-[10px] uppercase tracking-wider bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">AI</span>
                )}
              </p>
            )}
            {showTranslation && !questionEn && translating && (
              <p className="mt-1.5 text-xs text-slate-400 italic inline-flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> 正在翻译…
              </p>
            )}
          </div>
        </div>

        {q.image_url && (
          <div className="flex justify-center">
            <img
              src={q.image_url}
              alt={isSignRecognition ? "路标" : "题目配图"}
              loading="lazy"
              className="w-auto max-h-[420px] object-contain rounded-xl border border-slate-200 bg-white p-3"
            />
          </div>
        )}

        {(() => {
          const picked = answers[q.id] ?? null;
          const answered = q.id in answers;
          const judged = q.id in correctMap;
          const isCorrect = correctMap[q.id];
          const correctLetter = revealedCorrect[q.id];
          const feedbackReady = minimalMode
            ? judged
            : instantFeedback && answered && typeof isCorrect === "boolean";
          const stateFor = feedbackReady
            ? (k: "A" | "B" | "C" | "D") => {
                if (isCorrect) return k === picked ? "correct" : "neutral";
                if (k === correctLetter) return "correct";
                if (k === picked) return "wrong";
                return "neutral";
              }
            : undefined;
          const readOnly = minimalMode ? judged : (instantFeedback && answered);
          return (
            <>
              <ExamOptionList
                options={options.map((o) => ({
                  key: o.key,
                  text: o.text,
                  textEn: o.textEn || (showTranslation ? tr?.options?.[o.key] : null),
                }))}
                selected={picked}
                onSelect={pick}
                showTranslation={showTranslation}
                readOnly={readOnly}
                stateFor={stateFor}
              />
              {feedbackReady && minimalMode && (
                <div className="mt-6 space-y-2">
                  {isCorrect ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-base font-medium">
                      ✔ 回答正确
                    </div>
                  ) : (
                    <>
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-base">
                        您的答案：<b className="font-semibold">{picked ?? "未作答"}</b>
                      </div>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-base">
                        正确答案：<b className="font-semibold">{correctLetter ?? "?"}</b>
                      </div>
                    </>
                  )}
                </div>
              )}
              {feedbackReady && !minimalMode && (
                <div
                  className={cn(
                    "mt-4 rounded-xl border px-4 py-3 text-sm",
                    isCorrect
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-rose-200 bg-rose-50 text-rose-800",
                  )}
                >
                  {isCorrect ? (
                    <span>✅ 回答正确</span>
                  ) : (
                    <span>
                      ❌ 回答错误 · 正确答案是 <b className="font-semibold">{correctLetter ?? "?"}</b>
                    </span>
                  )}
                </div>
              )}
            </>
          );
        })()}

        {minimalMode ? (
          <div className="pt-4 flex justify-center">
            {!(q.id in correctMap) && (
              <Button
                size="lg"
                onClick={() => onSubmitAnswer?.()}
                disabled={!answers[q.id] || submittingAnswer || submitting}
                className={cn(
                  "min-w-[160px] rounded-full",
                  theme === "orange" ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700",
                )}
              >
                {submittingAnswer ? "判定中…" : submitting ? "评分中…" : "提交"}
              </Button>
            )}
          </div>
        ) : (
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-4 -mx-2 px-2">
            <Button
              variant="outline"
              onClick={() => setCurrent((i) => Math.max(0, i - 1))}
              disabled={current === 0}
              className="mt-4"
            >
              <ArrowLeft size={16} className="mr-1" /> 上一题
            </Button>
            <div className="flex items-center gap-2">
              {current < questions.length - 1 && (
                <Button
                  variant="outline"
                  onClick={onSkip}
                  className="mt-4 border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  跳过
                  {Number.isFinite(skipsRemaining) && (
                    <span className="ml-1 text-[10px] text-amber-600">
                      (剩 {skipsRemaining})
                    </span>
                  )}
                </Button>
              )}
              {current >= questions.length - 1 ? (
                <Button
                  onClick={() => onSubmit?.()}
                  disabled={submitting || !onSubmit}
                  className={cn("mt-4", theme === "orange" ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700")}
                >
                  {submitting ? "评分中…" : "提交答案"}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrent((i) => Math.min(questions.length - 1, i + 1))}
                  className={cn("mt-4", theme === "orange" ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700")}
                >
                  下一题 <ArrowRight size={16} className="ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


/* -------------------- Answer sheet -------------------- */

function AnswerSheet({
  questions, answers, marked, setMarked, skipped, current, setCurrent, onSubmit, submitting, submitError,
  instantFeedback = false, correctMap = {},
}: {
  questions: QuizQuestion[];
  answers: Record<string, "A" | "B" | "C" | "D">;
  marked: Record<string, boolean>;
  setMarked: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  skipped: Record<string, boolean>;
  current: number;
  setCurrent: React.Dispatch<React.SetStateAction<number>>;
  onSubmit: () => void;
  submitting: boolean;
  submitError?: string;
  instantFeedback?: boolean;
  correctMap?: Record<string, boolean>;
}) {
  const [confirming, setConfirming] = useState(false);
  const answered = Object.keys(answers).length;
  const markedCount = Object.values(marked).filter(Boolean).length;
  const skippedCount = Object.values(skipped).filter(Boolean).length;
  const unanswered = questions.length - answered - skippedCount;

  const currentId = questions[current]?.id;
  const isMarked = currentId ? !!marked[currentId] : false;

  return (
    <Card className="border-slate-200 shadow-sm rounded-2xl">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">答题卡</h3>
          <button
            type="button"
            onClick={() => currentId && setMarked((m) => ({ ...m, [currentId]: !m[currentId] }))}
            className={cn(
              "text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md border transition-colors",
              isMarked
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "text-slate-500 border-slate-200 hover:bg-slate-50",
            )}
          >
            <Bookmark size={12} className={isMarked ? "fill-amber-500 text-amber-500" : ""} />
            {isMarked ? "已标记" : "标记本题"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          {instantFeedback ? (
            <>
              <LegendDot
                color="bg-emerald-500"
                label={`已答对 ${Object.values(correctMap).filter(Boolean).length}`}
              />
              <LegendDot
                color="bg-red-500"
                label={`答错 ${
                  Object.entries(correctMap).filter(([, v]) => v === false).length
                }`}
              />
              <LegendDot color="bg-white border border-slate-300" label={`未作答 ${Math.max(0, unanswered)}`} />
              <LegendDot color="bg-orange-500" label={`跳过 ${skippedCount}`} />
              <LegendDot color="bg-amber-400" label={`标记 ${markedCount}`} />
            </>
          ) : (
            <>
              <LegendDot color="bg-white border border-slate-300" label={`未答 ${Math.max(0, unanswered)}`} />
              <LegendDot color="bg-blue-500" label={`已答 ${answered}`} />
              <LegendDot color="bg-orange-500" label={`跳过 ${skippedCount}`} />
              <LegendDot color="bg-amber-400" label={`标记 ${markedCount}`} />
              <LegendDot color="bg-emerald-500" label="答对" />
              <LegendDot color="bg-red-500" label="答错" />
            </>
          )}
        </div>

        <div className="grid grid-cols-6 gap-2">
          {questions.map((qq, i) => {
            const done = !!answers[qq.id];
            const flagged = !!marked[qq.id];
            const wasSkipped = !!skipped[qq.id];
            const active = i === current;
            const feedbackState =
              instantFeedback && qq.id in correctMap
                ? correctMap[qq.id]
                  ? "correct"
                  : "wrong"
                : null;
            return (
              <button
                key={qq.id}
                type="button"
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-9 rounded-md text-sm font-medium border transition-colors tabular-nums",
                  active
                    ? "bg-blue-600 border-blue-600 text-white shadow ring-2 ring-blue-300"
                    : feedbackState === "correct"
                      ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                      : feedbackState === "wrong"
                        ? "bg-red-100 border-red-400 text-red-800"
                        : flagged
                          ? "bg-amber-100 border-amber-300 text-amber-800"
                          : wasSkipped
                            ? "bg-orange-100 border-orange-300 text-orange-800"
                            : done
                              ? "bg-blue-100 border-blue-300 text-blue-800"
                              : "bg-white border-slate-200 text-slate-600 hover:border-blue-300",
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>


        <Button onClick={() => setConfirming(true)} className="w-full bg-blue-600 hover:bg-blue-700">
          结束考试
        </Button>
        <p className="text-[11px] text-center text-slate-500">
          已答 {answered} / {questions.length}
        </p>
      </CardContent>

      {confirming && (
        <div
          className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
          onClick={() => (submitting ? null : setConfirming(false))}
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">确认交卷？</h3>
            <p className="text-sm text-muted-foreground">
              你已作答 <b>{answered}</b> / {questions.length} 题
              {answered < questions.length && "，未作答的题将计为错误。"}
            </p>
            {submitError && <p className="text-sm text-destructive">{submitError}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setConfirming(false)} disabled={submitting}>取消</Button>
              <Button onClick={onSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? "评分中…" : "确认交卷"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-600">
      <span className={cn("h-3 w-3 rounded-sm", color)} />
      {label}
    </div>
  );
}

/* -------------------- Info cards -------------------- */

function RulesTips({ total, pass, maxWrong, examSeconds, maxSkip }: { total: number; pass: number; maxWrong?: number; examSeconds: number; maxSkip?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RulesCard total={total} pass={pass} maxWrong={maxWrong} maxSkip={maxSkip} examSeconds={examSeconds} />
      <TipsCard />
    </div>
  );
}


function RulesCard({ total, pass, maxWrong, maxSkip, examSeconds }: { total: number; pass: number; maxWrong?: number; maxSkip?: number; examSeconds: number }) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-2xl">
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <ScrollText size={18} className="text-blue-600" />
          <h3 className="font-semibold text-slate-900">测试规则</h3>
        </div>
        <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
          {typeof maxWrong === "number" ? (
            <li>
              本测试共 <b>{total}</b> 道题，答对 <b>{pass}</b> 题即通过；最多允许错 <b>{maxWrong}</b> 题。
            </li>
          ) : (
            <li>
              本测试共 <b>{total}</b> 道题，答对 <b>{pass}</b> 题或以上即可通过。
            </li>
          )}
          <li>每题有多个选项，请选择最正确的答案。</li>
          <li>测试时间为 {Math.round(examSeconds / 60)} 分钟，开始后计时。</li>
          {typeof maxSkip === "number" ? (
            <li>最多允许跳过 <b>{maxSkip}</b> 题。</li>
          ) : (
            <li>允许无限次跳过。</li>
          )}
          <li>您可以随时标记题目，方便之后查看。</li>
        </ul>
      </CardContent>
    </Card>
  );
}


function TipsCard() {
  return (
    <Card className="border-amber-200 bg-amber-50/50 shadow-sm rounded-2xl">
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-amber-600" />
          <h3 className="font-semibold text-slate-900">考试提示</h3>
        </div>
        <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
          <li>仔细阅读每个问题和所有选项。</li>
          <li>不确定的题目可以先标记，稍后再回来。</li>
          <li>交卷后可查看正确答案与详细解析。</li>
        </ul>
      </CardContent>
    </Card>
  );
}

/* -------------------- Result -------------------- */

function Result({
  grade, pass, maxWrong, skippedCount = 0, earlyEnded = false, onRetake, onHome, retaking,
  attempts = 0, maxAttempts, homeLabel = "返回",
}: {
  grade: GradeResult;
  pass: number;
  maxWrong?: number;
  skippedCount?: number;
  earlyEnded?: boolean;
  onRetake: () => void;
  onHome: () => void;
  retaking: boolean;
  attempts?: number;
  maxAttempts?: number;
  homeLabel?: string;
}) {
  const { total, correct: correctCount, wrong: wrongCount, results } = grade;
  const wrongs = results.filter((r) => !r.is_correct);
  const isWrongBased = typeof maxWrong === "number";
  const passed = isWrongBased ? wrongCount <= maxWrong : correctCount >= pass;
  const lawCount = results.filter((r) => r.category !== "c1_signs").length;
  const signsCount = results.filter((r) => r.category === "c1_signs").length;
  const actualWrong = Math.max(0, wrongCount - skippedCount);
  const rateAll = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const attemptsLeft =
    typeof maxAttempts === "number" ? Math.max(0, maxAttempts - attempts) : undefined;
  const outOfAttempts = attemptsLeft === 0;

  const attemptsHint =
    typeof maxAttempts === "number" && !passed ? (
      outOfAttempts ? (
        <div className="mt-2 rounded-lg bg-red-100 text-red-800 text-sm px-3 py-2">
          您已使用完本轮全部 {maxAttempts} 次考试机会，系统将重新开始新的模拟考试。
        </div>
      ) : (
        <div className="mt-2 text-sm text-amber-700">
          剩余考试次数：<b>{attemptsLeft}</b> / {maxAttempts} 次
        </div>
      )
    ) : null;

  if (isWrongBased) {
    return (
      <div className="space-y-8">
        <Card className={cn("border-slate-200 shadow-sm rounded-2xl", passed ? "bg-emerald-50/60" : "bg-red-50/60")}>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                  <div className={cn("inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full",
                    passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                    {passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {passed ? "PASS 通过" : "FAIL 未通过"}
                  </div>
                  <div className="mt-3 text-2xl md:text-3xl font-bold">
                    {passed ? "🎉 恭喜您！您已通过本次考试。" : "很遗憾，本次考试未通过。"}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {passed
                      ? `本次考试最多允许错 ${maxWrong} 题，你的错题数在允许范围内。`
                      : `本次考试最多允许错 ${maxWrong} 题，你的错题数超过通过标准，建议先复习错题再重新测试。`}
                  </div>
                  {attemptsHint}
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6 text-center">
                <Stat label="总题数" value={total} />
                <Stat label="交通法规题" value={lawCount} />
                <Stat label="交通标志题" value={signsCount} />
                <Stat label="答对" value={correctCount} tone="pos" />
                <Stat label="答错" value={actualWrong} tone="neg" />
                <Stat label="跳过" value={skippedCount} />
                <Stat label="正确率" value={`${rateAll}%`} />
              </div>
              <div className="flex flex-wrap gap-2">
                {!outOfAttempts && (
                  <Button onClick={onRetake} disabled={retaking} className="bg-blue-600 hover:bg-blue-700">
                    {retaking ? "抽题中…" : "重新考试"}
                  </Button>
                )}
                <Button variant="outline" onClick={onHome}>{homeLabel}</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <ExamResultReview results={results} wrongs={wrongs} />
      </div>
    );
  }


  const rate = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const answeredCount = total - skippedCount;
  return (
    <div className="space-y-8">
      {earlyEnded && passed && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-5 py-3 text-sm">
          您已达到本次考试通过标准，并选择提前结束考试。
        </div>
      )}
      <Card className={cn("border-slate-200 shadow-sm rounded-2xl", passed ? "bg-emerald-50/60" : "bg-red-50/60")}>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className={cn("inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full",
                passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                {passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {passed ? "PASS 通过" : "FAIL 未通过"}
              </div>
              <div className="mt-3 text-2xl md:text-3xl font-bold">
                得分 {correctCount} / {total}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                通过条件：答对 ≥ {pass} 题
              </div>
              {attemptsHint}
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6 text-center">
              <Stat label="总题数" value={total} />
              <Stat label="已答题数" value={answeredCount} />
              <Stat label="正确题数" value={correctCount} tone="pos" />
              <Stat label="错误题数" value={Math.max(0, wrongCount - skippedCount)} tone="neg" />
              <Stat label="跳过题数" value={skippedCount} />
              <Stat label="正确率" value={`${rate}%`} />
              <Stat label="结果" value={passed ? "PASS" : "FAIL"} tone={passed ? "pos" : "neg"} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {!outOfAttempts && (
              <Button onClick={onRetake} disabled={retaking} className="bg-blue-600 hover:bg-blue-700">
                {retaking ? "抽题中…" : "重新考试"}
              </Button>
            )}
            <Button variant="outline" onClick={onHome}>{homeLabel}</Button>
          </div>
        </CardContent>
      </Card>


      <ExamResultReview results={results} wrongs={wrongs} />
    </div>
  );
}


export function ExamResultReview({
  results, wrongs,
}: { results: GradedQuestion[]; wrongs: GradedQuestion[] }) {
  const [showAll, setShowAll] = useState(false);
  const hasWrong = wrongs.length > 0;

  return (
    <>
      {hasWrong ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">错题回顾</h2>
            <p className="text-sm text-muted-foreground mt-1">
              你本次答错了 <b className="text-red-600">{wrongs.length}</b> 题，建议优先复习以下题目。
            </p>
          </div>
          <div className="space-y-4">
            {wrongs.map((r, i) => (
              <ReviewItem key={r.id} r={r} idx={i + 1} />
            ))}
          </div>
        </section>
      ) : (
        <Card className="border-emerald-200 bg-emerald-50/60 shadow-sm rounded-2xl">
          <CardContent className="p-6 md:p-8 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white grid place-items-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-lg font-semibold text-emerald-800">恭喜！本次没有错题。</div>
              <div className="text-sm text-emerald-700/80 mt-0.5">全部作答正确，可继续查看完整解析巩固知识点。</div>
            </div>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 mt-8">
        {!showAll ? (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <BookOpen size={16} className="mr-1.5" /> 查看全部题目解析（{results.length}）
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">全部题目解析（{results.length}）</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAll(false)}>
                收起
              </Button>
            </div>
            <div className="space-y-4">
              {results.map((r, i) => (
                <ReviewItem key={r.id} r={r} idx={i + 1} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: "pos" | "neg" }) {
  return (
    <div>
      <div className={cn("text-2xl md:text-3xl font-bold",
        tone === "pos" && "text-emerald-600",
        tone === "neg" && "text-red-600",
      )}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function ReviewItem({ r, idx }: { r: GradedQuestion; idx: number }) {
  const correct = r.correct_answer;
  const pick = r.picked;
  const isRight = r.is_correct;
  const [showLearn, setShowLearn] = useState(!isRight);
  const opts = (["A", "B", "C", "D"] as const)
    .map((k) => ({
      key: k,
      text: (r as unknown as Record<string, string | null>)[`option_${k.toLowerCase()}`],
      textEn: (r as unknown as Record<string, string | null>)[`option_${k.toLowerCase()}_en`],
    }))
    .filter((o) => o.text && o.text.trim() !== "");

  return (
    <Card className="border-slate-200 shadow-sm rounded-2xl">
      <CardContent className="p-5 md:p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="text-sm font-medium min-w-0">
            <span className="text-muted-foreground mr-2">Q{idx}.</span>
            {r.question}
            {r.question_en && (
              <div className="mt-1 text-xs text-slate-500 italic font-normal">{r.question_en}</div>
            )}
          </div>
          <span
            className={cn(
              "shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              isRight ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700",
            )}
          >
            {isRight ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {isRight ? "正确" : pick ? "错误" : "未答"}
          </span>
        </div>
        {r.image_url && (
          <div className="flex justify-center">
            <img
              src={r.image_url}
              alt="题目配图"
              loading="lazy"
              className="max-h-56 w-auto object-contain rounded-lg border border-slate-200 bg-white p-2"
            />
          </div>
        )}
        <div className="space-y-2">
          {opts.map(({ key, text, textEn }) => {
            const isCorrect = key === correct;
            const isPicked = key === pick;
            return (
              <div
                key={key}
                className={cn(
                  "rounded-lg border p-3 text-sm flex items-start gap-3",
                  isCorrect && "border-emerald-500 bg-emerald-50",
                  !isCorrect && isPicked && "border-red-400 bg-red-50",
                  !isCorrect && !isPicked && "border-slate-200 bg-white",
                )}
              >
                <span className={cn(
                  "shrink-0 h-6 w-6 rounded-full grid place-items-center text-xs font-semibold",
                  isCorrect ? "bg-emerald-500 text-white"
                    : isPicked ? "bg-red-500 text-white"
                    : "bg-muted text-foreground",
                )}>{key}</span>
                <div className="min-w-0">
                  <div className="leading-relaxed">{text}</div>
                  {textEn && <div className="mt-0.5 text-xs text-slate-500 italic">{textEn}</div>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-muted-foreground grid gap-1 md:grid-cols-2">
          <div>我的选择：<b className={cn(isRight ? "text-emerald-700" : "text-red-700")}>{pick ?? "未作答"}</b></div>
          <div>正确答案：<b className="text-emerald-700">{correct}</b></div>
        </div>
        {r.explanation && (
          <div className="text-sm rounded-lg bg-emerald-50 border border-emerald-200 p-3 leading-relaxed">
            <div className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
              <CheckCircle2 size={12} /> 答案解析
            </div>
            <div>{r.explanation}</div>
            {r.explanation_en && (
              <div className="mt-1 text-xs text-emerald-800/70 italic">{r.explanation_en}</div>
            )}
          </div>
        )}

        <LearningCenter r={r} open={showLearn} onToggle={() => setShowLearn((v) => !v)} />
      </CardContent>
    </Card>
  );
}

function LearningCenter({
  r, open, onToggle,
}: { r: GradedQuestion; open: boolean; onToggle: () => void }) {
  const manualName = r.manual_name?.trim() || defaultManualName(r.category);
  const manualUrl = r.manual_url?.trim() || defaultManualUrl(r.category);
  const chapter = r.manual_chapter?.trim();
  const page = r.manual_page?.trim();
  const source = r.official_source?.trim() || manualName;
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/40">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-50 rounded-lg"
      >
        <span className="flex items-center gap-2">
          <GraduationCap size={16} /> 学习中心 · 查看解析
        </span>
        <ChevronDown
          size={16}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 space-y-3">
          <div className="rounded-md bg-white border border-blue-100 p-3 text-sm space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-800">
              <BookOpen size={14} /> 📚 官方资料来源
            </div>
            <div className="text-slate-700">{source}</div>
            {(chapter || page) && (
              <div className="text-xs text-slate-500">
                {chapter}{chapter && page ? " · " : ""}{page}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm transition-colors shadow-sm"
              title="打开 AI 智能解析"
            >
              <Sparkles size={14} /> 🤖 AI 智能解析
            </button>
            <a
              href={manualUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                window.open(manualUrl, "_blank", "noopener,noreferrer");
              }}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
            >
              <BookOpen size={14} /> 📘 查看官方手册
              <ExternalLink size={12} className="opacity-80" />
            </a>
          </div>
          <AiAnalysisSheet
            open={aiOpen}
            onOpenChange={setAiOpen}
            r={r}
            manualName={manualName}
            manualUrl={manualUrl}
            chapter={chapter}
            page={page}
          />
        </div>
      )}
    </div>
  );
}

type AiAnalysis = {
  why_correct: string;
  why_wrong: { key: "A" | "B" | "C" | "D"; text: string; reason: string }[];
  exam_point: string;
  exam_tips: string;
  official_reference: string;
  related_knowledge: string[];
  similar_questions: { question: string; hint: string }[];
};

function buildAiPrompt(r: GradedQuestion, manualName: string): { system: string; user: string } {
  const opts = (["A", "B", "C", "D"] as const)
    .map((k) => {
      const t = (r as unknown as Record<string, string | null>)[`option_${k.toLowerCase()}`];
      return t ? `${k}. ${t}` : null;
    })
    .filter(Boolean)
    .join("\n");
  const system =
    "你是加州 DMV 驾照考试的资深教练与考试专家,精通 California Driver Handbook 与 California Vehicle Code (CVC)。请针对给定考题输出**结构化 JSON**,内容详实、专业、口吻友好,面向准备 DMV 考试的中文考生。**只输出 JSON,不要 Markdown 代码块。**";
  const user = `请分析以下 DMV 考题,并严格按以下 JSON 结构输出:

{
  "why_correct": "为什么正确答案(${r.correct_answer})是正确的,详细说明,不少于100字",
  "why_wrong": [ { "key": "A", "text": "选项原文", "reason": "为什么这个选项错误(2-3句)" }, ... 除正确答案外的每个选项都要有 ],
  "exam_point": "本题在 DMV 考试中考查的核心交通法规/知识点(2-4句)",
  "exam_tips": "考试技巧,包括容易混淆的地方、记忆口诀、注意事项(2-4句)",
  "official_reference": "对应的 ${manualName} 章节名 + California Vehicle Code(CVC) 具体条文号(如 CVC §22350),尽量准确",
  "related_knowledge": [ "延伸知识点1", "延伸知识点2", "延伸知识点3" ],
  "similar_questions": [ { "question": "同类型考题题干", "hint": "答题要点提示" }, { ... }, { ... } ]
}

【题目】${r.question}
【选项】
${opts}
【正确答案】${r.correct_answer}
${r.explanation ? `【已有简要解析】${r.explanation}` : ""}

请直接输出 JSON。`;
  return { system, user };
}

function AiAnalysisSheet({
  open,
  onOpenChange,
  r,
  manualName,
  manualUrl,
  chapter,
  page,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  r: GradedQuestion;
  manualName: string;
  manualUrl: string;
  chapter?: string;
  page?: string;
}) {
  const { user } = useAuth();
  const getQuotaFn = useServerFn(getAiQuota);
  const consumeQuotaFn = useServerFn(consumeAiQuota);
  const getCacheFn = useServerFn(getAiContent);
  const generateFn = useServerFn(generateAiContent);

  const [quota, setQuota] = useState<{ checked: boolean; remaining: number }>({
    checked: false,
    remaining: 0,
  });
  const [cacheHit, setCacheHit] = useState<boolean | null>(null);

  const correct = r.correct_answer;
  const opts = (["A", "B", "C", "D"] as const)
    .map((k) => ({
      key: k,
      text: (r as unknown as Record<string, string | null>)[`option_${k.toLowerCase()}`],
    }))
    .filter((o) => o.text && o.text.trim() !== "");
  const correctText = opts.find((o) => o.key === correct)?.text ?? "";

  // 打开抽屉时预取额度（仅用于展示；缓存命中时不扣）
  useEffect(() => {
    if (!open) {
      setQuota({ checked: false, remaining: 0 });
      setCacheHit(null);
      return;
    }
    let active = true;
    async function check() {
      if (user) {
        try {
          const res = await getQuotaFn({ data: { featureKey: AI_FEATURE_KEY } });
          if (active) setQuota({ checked: true, remaining: res.remaining });
        } catch (e) {
          console.error("AI quota check failed", e);
          if (active) setQuota({ checked: true, remaining: 0 });
        }
      } else {
        if (active) setQuota({ checked: true, remaining: getLocalQuotaRemaining(AI_FEATURE_KEY) });
      }
    }
    void check();
    return () => {
      active = false;
    };
  }, [open, user, getQuotaFn]);

  const cacheKey = {
    module: "dmv",
    record_type: "question",
    record_id: r.id,
    language: "zh",
    prompt_version: DMV_PROMPT_VERSION,
  } as const;

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["ai-analysis-engine", r.id, cacheKey.prompt_version, cacheKey.language],
    queryFn: async () => {
      // 1) 先查平台 AI 缓存（免费、瞬时）
      const hit = await getCacheFn({ data: cacheKey });
      if (hit.cached && hit.row?.ai_content) {
        setCacheHit(true);
        return hit.row.ai_content as AiAnalysis;
      }
      // 2) 未命中 → 走额度 → 调 AI → 落库
      if (user) {
        const res = await consumeQuotaFn({ data: { featureKey: AI_FEATURE_KEY, questionId: r.id } });
        setQuota({ checked: true, remaining: res.remaining });
        if (res.remaining < 0 || (res.remaining === 0 && res.usedToday > DEFAULT_FREE_QUOTA)) {
          throw new Error("今日 AI 解析额度已用完");
        }
      } else {
        const remaining = consumeLocalQuota(AI_FEATURE_KEY);
        setQuota({ checked: true, remaining });
      }
      const gen = await generateFn({ data: cacheKey });
      setCacheHit(false);
      return gen.ai_content as AiAnalysis;
    },
    enabled: open && quota.checked,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  const showPaywall =
    quota.checked && quota.remaining <= 0 && cacheHit === false && !isLoading && !isFetching && !data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto bg-slate-50 p-0">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 px-5 py-4">
          <SheetHeader className="space-y-1">
            <SheetTitle className="flex items-center gap-2 text-base">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                <Sparkles size={14} />
              </span>
              AI 智能学习助手
              {cacheHit === true && (
                <span className="ml-2 text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  ✨ 已缓存 · 免费查看
                </span>
              )}
              {quota.checked && cacheHit !== true && (
                <span className="ml-2 text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  今日剩余 {quota.remaining} 次
                </span>
              )}
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              基于 California Driver Handbook 与 CVC 法规的结构化讲解
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="px-5 py-4 space-y-3.5 text-sm">
          {/* 题目卡 */}
          <AiCard tone="slate" icon="📝" title="题目">
            <div className="text-slate-800 leading-relaxed">{r.question}</div>
            <div className="mt-2 text-xs text-slate-500">
              正确答案 <b className="text-emerald-700">{correct}</b> · {correctText}
            </div>
          </AiCard>

          {showPaywall ? (
            <AiPaywall user={user} />
          ) : isLoading || isFetching ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
              <Loader2 className="animate-spin" size={20} />
              AI 正在为你生成深度解析…
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="font-medium mb-1">AI 解析加载失败</div>
              <div className="text-xs text-red-600 mb-2">{(error as Error)?.message ?? "未知错误"}</div>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                重试
              </Button>
            </div>
          ) : data ? (
            <>
              {/* 1. 为什么正确答案正确 */}
              <AiCard tone="emerald" icon="✅" title={`为什么正确答案 ${correct} 是正确的`}>
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{data.why_correct}</p>
              </AiCard>

              {/* 2. 其他选项为什么错误 */}
              {data.why_wrong?.length > 0 && (
                <AiCard tone="rose" icon="❌" title="其他选项为什么错误">
                  <ul className="space-y-3">
                    {data.why_wrong.map((w) => (
                      <li key={w.key} className="rounded-lg bg-white/70 border border-rose-100 p-3">
                        <div className="text-slate-800 font-medium mb-1">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-100 text-rose-700 text-xs font-bold mr-2">
                            {w.key}
                          </span>
                          {w.text}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{w.reason}</p>
                      </li>
                    ))}
                  </ul>
                </AiCard>
              )}

              {/* 3. DMV 考试考点 */}
              <AiCard tone="blue" icon="🎯" title="DMV 考试考点">
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{data.exam_point}</p>
              </AiCard>

              {/* 4. 考试技巧 */}
              <AiCard tone="amber" icon="💡" title="考试技巧 & 记忆方法">
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{data.exam_tips}</p>
              </AiCard>

              {/* 5. 官方法规依据 */}
              <AiCard tone="indigo" icon="⚖️" title="官方法规依据">
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{data.official_reference}</p>
                <div className="mt-3 pt-3 border-t border-indigo-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BookOpen size={12} className="text-indigo-600" />
                    <span className="font-medium text-slate-700">{manualName}</span>
                  </div>
                  {(chapter || page) && (
                    <div className="text-slate-500 mb-1.5">
                      {chapter}
                      {chapter && page ? " · " : ""}
                      {page}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => window.open(manualUrl, "_blank", "noopener,noreferrer")}
                    className="inline-flex items-center gap-1 text-indigo-700 hover:underline"
                  >
                    打开官方手册 <ExternalLink size={11} />
                  </button>
                </div>
              </AiCard>

              {/* 6. 相关知识点 */}
              {data.related_knowledge?.length > 0 && (
                <AiCard tone="violet" icon="📚" title="相关知识点">
                  <ul className="space-y-1.5">
                    {data.related_knowledge.map((k, i) => (
                      <li key={i} className="flex gap-2 text-slate-800 leading-relaxed">
                        <span className="text-violet-500 mt-1">•</span>
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </AiCard>
              )}

              {/* 7. 相似考题推荐 */}
              {data.similar_questions?.length > 0 && (
                <AiCard tone="teal" icon="🔮" title="相似考题推荐">
                  <ul className="space-y-3">
                    {data.similar_questions.map((q, i) => (
                      <li key={i} className="rounded-lg bg-white/70 border border-teal-100 p-3">
                        <div className="text-slate-800 text-sm leading-relaxed mb-1.5">
                          <b className="text-teal-700 mr-1">Q{i + 1}.</b>
                          {q.question}
                        </div>
                        <div className="text-xs text-slate-600 leading-relaxed">
                          <span className="font-medium text-teal-700">要点:</span> {q.hint}
                        </div>
                      </li>
                    ))}
                  </ul>
                </AiCard>
              )}

              <div className="pt-1 pb-4 text-center text-[11px] text-slate-400">
                以上内容由 AI 生成,仅供学习参考,以官方 DMV 手册与 CVC 法规为准。
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AiPaywall({ user }: { user?: User }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center space-y-4">
      <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 text-amber-600 grid place-items-center">
        <Lock size={22} />
      </div>
      <div>
        <h3 className="font-semibold text-amber-900">今日免费额度已用完</h3>
        <p className="mt-1 text-sm text-amber-800">
          每位用户每天可免费使用 <b>{DEFAULT_FREE_QUOTA}</b> 次 AI 智能解析。额度每日自动重置。
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {!user ? (
          <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
            <Link to="/auth">登录 / 注册以继续使用</Link>
          </Button>
        ) : (
          <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
            <Link to="/products">查看订阅方案</Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link to="/products">了解更多会员权益</Link>
        </Button>
      </div>
    </div>
  );
}


const TONE_STYLES: Record<string, { border: string; header: string; bg: string }> = {
  slate: { border: "border-slate-200", header: "text-slate-600", bg: "bg-white" },
  emerald: { border: "border-emerald-200", header: "text-emerald-700", bg: "bg-emerald-50/70" },
  rose: { border: "border-rose-200", header: "text-rose-700", bg: "bg-rose-50/60" },
  blue: { border: "border-blue-200", header: "text-blue-700", bg: "bg-blue-50/60" },
  amber: { border: "border-amber-200", header: "text-amber-700", bg: "bg-amber-50/60" },
  indigo: { border: "border-indigo-200", header: "text-indigo-700", bg: "bg-indigo-50/60" },
  violet: { border: "border-violet-200", header: "text-violet-700", bg: "bg-violet-50/60" },
  teal: { border: "border-teal-200", header: "text-teal-700", bg: "bg-teal-50/60" },
};

function AiCard({
  tone,
  icon,
  title,
  children,
}: {
  tone: keyof typeof TONE_STYLES;
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  const s = TONE_STYLES[tone] ?? TONE_STYLES.slate;
  return (
    <section className={`rounded-xl border ${s.border} ${s.bg} p-4 shadow-sm`}>
      <div className={`text-xs font-semibold ${s.header} mb-2 flex items-center gap-1.5`}>
        <span className="text-sm">{icon}</span>
        {title}
      </div>
      <div className="text-sm">{children}</div>
    </section>
  );
}


