import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getRandomQuizQuestions,
  gradeQuiz,
  type QuizQuestion,
  type GradedQuestion,
  type GradeResult,
} from "@/lib/quiz.functions";
import { translateTexts } from "@/lib/translate.functions";
import { Languages, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

export const Route = createFileRoute("/p/drive/c1")({
  head: () => ({
    meta: [
      { title: "小型车 C1 模拟考试 · Lione Apps" },
      { name: "description", content: "DMV 风格的小型车 C1 驾照笔试模拟考试，题库随机抽题、自动判分、错题回顾。" },
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
  total?: number;
  pass?: number;
  examSeconds?: number;
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
};

const DEFAULT_TOTAL = 36;
const DEFAULT_PASS = 30;
const DEFAULT_SECONDS = 60 * 60;

export function QuizApp(props: QuizAppProps = {}) {
  const {
    embedded = false,
    category = "c1",
    total: TOTAL = DEFAULT_TOTAL,
    pass: PASS = DEFAULT_PASS,
    examSeconds: EXAM_SECONDS = DEFAULT_SECONDS,
    title = "California DMV 驾照模拟考试",
    subtitle = "模拟考试与加州 DMV 正式考试一致，帮助考生熟悉考试流程。",
    backHref = "/p/drive",
    backLabel = "← 返回驾考工具",
  } = props;

  const fetchFn = useServerFn(getRandomQuizQuestions);
  const gradeFn = useServerFn(gradeQuiz);
  const load = useMutation({
    mutationFn: () => fetchFn({ data: { category, count: TOTAL } }),
  });
  const submit = useMutation({
    mutationFn: (vars: { ids: string[]; answers: Record<string, "A" | "B" | "C" | "D"> }) =>
      gradeFn({ data: vars }),
  });

  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [current, setCurrent] = useState(0);
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(EXAM_SECONDS);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translations, setTranslations] = useState<Record<string, QuestionTranslation>>({});
  const [translating, setTranslating] = useState(false);
  const translateFn = useServerFn(translateTexts);

  async function startExam() {
    const rows = await load.mutateAsync();
    if (!rows.length) return;
    setQuestions(rows);
    setAnswers({});
    setMarked({});
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
    setCurrent(0);
    setGrade(null);
  }

  async function submitExam() {
    const ids = questions.map((q) => q.id);
    const res = await submit.mutateAsync({ ids, answers });
    setGrade(res);
    setPhase("result");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
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
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-6 md:py-8">
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
        />


        {phase === "intro" && (
          <div className="mt-6">
            <Intro
              total={TOTAL}
              pass={PASS}
              examSeconds={EXAM_SECONDS}
              onStart={startExam}
              loading={load.isPending}
              error={load.error?.message}
            />
          </div>
        )}

        {phase === "exam" && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] gap-6">
            <div className="min-w-0 space-y-6">
              <Exam
                questions={questions}
                answers={answers}
                setAnswers={setAnswers}
                current={current}
                setCurrent={setCurrent}
                showTranslation={showTranslation}
                translations={translations}
                translating={translating}
              />
              <RulesTips total={TOTAL} pass={PASS} examSeconds={EXAM_SECONDS} />
            </div>
            <aside className="lg:sticky lg:top-6 self-start">
              <AnswerSheet
                questions={questions}
                answers={answers}
                marked={marked}
                setMarked={setMarked}
                current={current}
                setCurrent={setCurrent}
                onSubmit={submitExam}
                submitting={submit.isPending}
                submitError={submit.error?.message}
              />
            </aside>
          </div>
        )}

        {phase === "result" && grade && (
          <div className="mt-6">
            <Result grade={grade} pass={PASS} onRetake={startExam} onHome={resetToIntro} retaking={load.isPending} />
          </div>
        )}
      </div>

      {phase === "exam" && <CountdownTicker onTick={setSecondsLeft} />}
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
  showTranslation, onToggleTranslation, translating,
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
}) {
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-blue-900/10">
      <div className="bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] text-white">
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
                  showTranslation ? "bg-white text-blue-700 hover:bg-white/90" : "bg-white/15 hover:bg-white/25",
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
  total, pass, examSeconds, onStart, loading, error,
}: { total: number; pass: number; examSeconds: number; onStart: () => void; loading: boolean; error?: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] gap-6">
      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardContent className="p-8 md:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <div className="text-lg font-semibold">开始模拟考试</div>
              <div className="text-sm text-muted-foreground">DMV 风格 · 随机抽题 · 自动判分</div>
            </div>
          </div>
          <ul className="text-sm text-foreground/80 space-y-2 list-disc pl-5">
            <li>共 <b>{total}</b> 道题，随机从题库抽取。</li>
            <li>答对 <b>{pass}</b> 题及以上为通过。</li>
            <li>考试时长 <b>{Math.round(examSeconds / 60)}</b> 分钟。</li>
            <li>交卷后将显示成绩、正确答案与错题回顾。</li>
          </ul>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <Button size="lg" onClick={onStart} disabled={loading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
            {loading ? "抽题中…" : "开始考试"}
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <RulesCard total={total} pass={pass} examSeconds={examSeconds} />
        <TipsCard />
      </div>
    </div>
  );
}

/* -------------------- Exam -------------------- */

function Exam({
  questions, answers, setAnswers, current, setCurrent,
  showTranslation = false, translations = {}, translating = false,
}: {
  questions: QuizQuestion[];
  answers: Record<string, "A" | "B" | "C" | "D">;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, "A" | "B" | "C" | "D">>>;
  current: number;
  setCurrent: React.Dispatch<React.SetStateAction<number>>;
  showTranslation?: boolean;
  translations?: Record<string, QuestionTranslation>;
  translating?: boolean;
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
    setAnswers((prev) => ({ ...prev, [q.id]: k }));
  }

  const questionEn = q.question_en || (showTranslation ? tr?.question : null);
  const showAiBadge = showTranslation && !q.question_en && !!tr?.question;

  return (
    <Card className="border-slate-200 shadow-sm rounded-2xl">
      <CardContent className="p-6 md:p-8 space-y-6">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl md:text-3xl font-bold text-blue-600 tabular-nums">{current + 1}.</span>
          <div className="min-w-0">
            <h2 className="text-base md:text-lg font-semibold leading-relaxed whitespace-pre-wrap text-slate-900">
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

        <div className="space-y-3">
          {options.map(({ key, text, textEn }) => {
            const selected = answers[q.id] === key;
            const optEn = textEn || (showTranslation ? tr?.options?.[key] : null);
            return (
              <button
                key={key}
                type="button"
                onClick={() => pick(key)}
                className={cn(
                  "w-full text-left rounded-xl border p-4 md:p-5 flex items-start gap-4 transition-all",
                  selected
                    ? "border-blue-500 bg-blue-50 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40",
                )}
              >
                <span
                  className={cn(
                    "shrink-0 h-6 w-6 rounded-full grid place-items-center text-[11px] mt-0.5 transition-colors",
                    selected
                      ? "bg-blue-600 border-2 border-blue-600 text-white"
                      : "border-2 border-slate-300 bg-white",
                  )}
                >
                  {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
                <div className="flex-1 min-w-0 flex gap-2">
                  <span className={cn("font-semibold", selected ? "text-blue-700" : "text-slate-700")}>{key}.</span>
                  <div className="min-w-0">
                    <div className={cn("text-sm md:text-base leading-relaxed", selected ? "text-slate-900" : "text-slate-700")}>
                      {text}
                    </div>
                    {(showTranslation || textEn) && optEn && (
                      <div className="mt-1 text-xs md:text-sm text-slate-500 italic leading-relaxed">{optEn}</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>


        <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-4 -mx-2 px-2">
          <Button
            variant="outline"
            onClick={() => setCurrent((i) => Math.max(0, i - 1))}
            disabled={current === 0}
            className="mt-4"
          >
            <ArrowLeft size={16} className="mr-1" /> 上一题
          </Button>
          <Button
            onClick={() => setCurrent((i) => Math.min(questions.length - 1, i + 1))}
            disabled={current >= questions.length - 1}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            下一题 <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------- Answer sheet -------------------- */

function AnswerSheet({
  questions, answers, marked, setMarked, current, setCurrent, onSubmit, submitting, submitError,
}: {
  questions: QuizQuestion[];
  answers: Record<string, "A" | "B" | "C" | "D">;
  marked: Record<string, boolean>;
  setMarked: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  current: number;
  setCurrent: React.Dispatch<React.SetStateAction<number>>;
  onSubmit: () => void;
  submitting: boolean;
  submitError?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const answered = Object.keys(answers).length;
  const markedCount = Object.values(marked).filter(Boolean).length;
  const unanswered = questions.length - answered;

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
          <LegendDot color="bg-emerald-500" label={`已答 ${answered}`} />
          <LegendDot color="bg-white border border-slate-300" label={`未答 ${unanswered}`} />
          <LegendDot color="bg-amber-400" label={`标记 ${markedCount}`} />
          <LegendDot color="bg-blue-600" label="当前题" />
        </div>

        <div className="grid grid-cols-6 gap-2">
          {questions.map((qq, i) => {
            const done = !!answers[qq.id];
            const flagged = !!marked[qq.id];
            const active = i === current;
            return (
              <button
                key={qq.id}
                type="button"
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-9 rounded-md text-sm font-medium border transition-colors tabular-nums",
                  active
                    ? "bg-blue-600 border-blue-600 text-white shadow"
                    : flagged
                      ? "bg-amber-100 border-amber-300 text-amber-800"
                      : done
                        ? "bg-emerald-100 border-emerald-300 text-emerald-800"
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

function RulesTips({ total, pass, examSeconds }: { total: number; pass: number; examSeconds: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RulesCard total={total} pass={pass} examSeconds={examSeconds} />
      <TipsCard />
    </div>
  );
}

function RulesCard({ total, pass, examSeconds }: { total: number; pass: number; examSeconds: number }) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-2xl">
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <ScrollText size={18} className="text-blue-600" />
          <h3 className="font-semibold text-slate-900">测试规则</h3>
        </div>
        <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
          <li>本测试共 <b>{total}</b> 道题，答对 <b>{pass}</b> 题或以上即可通过。</li>
          <li>每题有多个选项，请选择最正确的答案。</li>
          <li>测试时间为 {Math.round(examSeconds / 60)} 分钟，开始后计时。</li>
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
  grade, pass, onRetake, onHome, retaking,
}: {
  grade: GradeResult;
  pass: number;
  onRetake: () => void;
  onHome: () => void;
  retaking: boolean;
}) {
  const { total, correct: correctCount, wrong: wrongCount, results } = grade;
  const rate = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = correctCount >= pass;
  const wrongs = results.filter((r) => !r.is_correct);

  return (
    <div className="space-y-8">
      <Card className={cn("border-slate-200 shadow-sm rounded-2xl", passed ? "bg-emerald-50/60" : "bg-red-50/60")}>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className={cn("inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full",
                passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                {passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {passed ? "通过" : "未通过"}
              </div>
              <div className="mt-3 text-2xl md:text-3xl font-bold">
                得分 {correctCount} / {total}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                通过分数线：{pass} / {total}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
              <Stat label="答对" value={correctCount} tone="pos" />
              <Stat label="答错" value={wrongCount} tone="neg" />
              <Stat label="正确率" value={`${rate}%`} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            <Button onClick={onRetake} disabled={retaking} className="bg-blue-600 hover:bg-blue-700">
              {retaking ? "抽题中…" : "再考一次"}
            </Button>
            <Button variant="outline" onClick={onHome}>返回</Button>
          </div>
        </CardContent>
      </Card>

      {wrongs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">错题回顾（{wrongs.length}）</h2>
          <div className="space-y-4">
            {wrongs.map((r, i) => (
              <ReviewItem key={r.id} r={r} idx={i + 1} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">全部题目解析</h2>
        <div className="space-y-4">
          {results.map((r, i) => (
            <ReviewItem key={r.id} r={r} idx={i + 1} />
          ))}
        </div>
      </section>
    </div>
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
      </CardContent>
    </Card>
  );
}
