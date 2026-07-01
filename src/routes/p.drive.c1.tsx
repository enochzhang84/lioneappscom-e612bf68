import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, RotateCcw, ClipboardCheck } from "lucide-react";

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
const TOTAL = 36;
const PASS = 30;

export function QuizApp({ embedded = false }: { embedded?: boolean }) {
  const fetchFn = useServerFn(getRandomQuizQuestions);
  const gradeFn = useServerFn(gradeQuiz);
  const load = useMutation({
    mutationFn: () => fetchFn({ data: { category: "c1", count: TOTAL } }),
  });
  const submit = useMutation({
    mutationFn: (vars: { ids: string[]; answers: Record<string, "A" | "B" | "C" | "D"> }) =>
      gradeFn({ data: vars }),
  });

  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [current, setCurrent] = useState(0);
  const [grade, setGrade] = useState<GradeResult | null>(null);

  async function startExam() {
    const rows = await load.mutateAsync();
    if (!rows.length) return;
    setQuestions(rows);
    setAnswers({});
    setCurrent(0);
    setGrade(null);
    setPhase("exam");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  function resetToIntro() {
    setPhase("intro");
    setQuestions([]);
    setAnswers({});
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

  return (
    <SiteLayout>
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-8 py-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              <Link to="/p/$slug" params={{ slug: "drive" }} className="hover:text-foreground">← 返回驾考工具</Link>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">小型车 C1 模拟考试</h1>
          </div>
          {phase !== "intro" && (
            <Button variant="ghost" size="sm" onClick={resetToIntro}>
              <RotateCcw size={14} className="mr-1" /> 重新开始
            </Button>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 md:px-8 py-8 md:py-12">
        {phase === "intro" && <Intro onStart={startExam} loading={load.isPending} error={load.error?.message} />}
        {phase === "exam" && (
          <Exam
            questions={questions}
            answers={answers}
            setAnswers={setAnswers}
            current={current}
            setCurrent={setCurrent}
            onSubmit={submitExam}
            submitting={submit.isPending}
            submitError={submit.error?.message}
          />
        )}
        {phase === "result" && grade && (
          <Result grade={grade} onRetake={startExam} onHome={resetToIntro} retaking={load.isPending} />
        )}
      </div>
    </SiteLayout>
  );
}


function Intro({ onStart, loading, error }: { onStart: () => void; loading: boolean; error?: string }) {
  return (
    <Card className="border-border">
      <CardContent className="p-8 md:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <div className="text-lg font-semibold">开始模拟考试</div>
            <div className="text-sm text-muted-foreground">DMV 风格 · 随机抽题 · 自动判分</div>
          </div>
        </div>
        <ul className="text-sm text-foreground/80 space-y-2 list-disc pl-5">
          <li>共 <b>{TOTAL}</b> 道题，随机从题库抽取。</li>
          <li>答对 <b>{PASS}</b> 题及以上为通过。</li>
          <li>交卷后将显示成绩、正确答案与错题回顾。</li>
          <li>建议使用真实考试的状态答题，不要中途查找答案。</li>
        </ul>
        {error && <div className="text-sm text-destructive">{error}</div>}
        <Button size="lg" onClick={onStart} disabled={loading} className="w-full md:w-auto">
          {loading ? "抽题中…" : "开始考试"}
        </Button>
      </CardContent>
    </Card>
  );
}

function Exam({
  questions, answers, setAnswers, current, setCurrent, onSubmit, submitting, submitError,
}: {
  questions: QuizQuestion[];
  answers: Record<string, "A" | "B" | "C" | "D">;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, "A" | "B" | "C" | "D">>>;
  current: number;
  setCurrent: React.Dispatch<React.SetStateAction<number>>;
  onSubmit: () => void;
  submitting: boolean;
  submitError?: string;
}) {
  const q = questions[current];
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / questions.length) * 100);
  const [confirming, setConfirming] = useState(false);

  const options = useMemo(
    () =>
      (["A", "B", "C", "D"] as const)
        .map((k) => ({ key: k, text: (q as unknown as Record<string, string | null>)[`option_${k.toLowerCase()}`] }))
        .filter((o) => o.text && o.text.trim() !== ""),
    [q],
  );

  function pick(k: "A" | "B" | "C" | "D") {
    setAnswers((prev) => ({ ...prev, [q.id]: k }));
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="font-medium">第 <span className="text-primary">{current + 1}</span> / {questions.length} 题</div>
          <div className="text-muted-foreground">已答 {answered} / {questions.length}</div>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <Card className="border-border">
        <CardContent className="p-6 md:p-8 space-y-5">
          <div className="text-base md:text-lg font-medium leading-relaxed whitespace-pre-wrap">
            {q.question}
          </div>
          <div className="space-y-3">
            {options.map(({ key, text }) => {
              const selected = answers[q.id] === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => pick(key)}
                  className={cn(
                    "w-full text-left rounded-xl border p-4 md:p-5 flex items-start gap-4 transition-colors",
                    selected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-white hover:border-primary/40 hover:bg-accent/40",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 h-8 w-8 rounded-full grid place-items-center text-sm font-semibold",
                      selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    {key}
                  </span>
                  <span className="text-sm md:text-base leading-relaxed">{text}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Nav buttons */}
      <div className="flex flex-wrap gap-2 justify-between">
        <Button variant="outline" onClick={() => setCurrent((i) => Math.max(0, i - 1))} disabled={current === 0}>
          <ArrowLeft size={16} className="mr-1" /> 上一题
        </Button>
        <div className="flex gap-2">
          {current < questions.length - 1 ? (
            <Button onClick={() => setCurrent((i) => Math.min(questions.length - 1, i + 1))}>
              下一题 <ArrowRight size={16} className="ml-1" />
            </Button>
          ) : null}
          <Button variant={answered === questions.length ? "default" : "secondary"} onClick={() => setConfirming(true)}>
            交卷
          </Button>
        </div>
      </div>

      {/* Grid navigator */}
      <Card className="border-border">
        <CardContent className="p-4 md:p-5">
          <div className="text-xs text-muted-foreground mb-3">题号导航</div>
          <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
            {questions.map((qq, i) => {
              const done = !!answers[qq.id];
              const active = i === current;
              return (
                <button
                  key={qq.id}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "h-9 rounded-md text-sm font-medium border transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : done
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-white text-muted-foreground hover:bg-accent",
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {confirming && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={() => submitting ? null : setConfirming(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">确认交卷？</h3>
            <p className="text-sm text-muted-foreground">
              你已作答 <b>{answered}</b> / {questions.length} 题
              {answered < questions.length && "，未作答的题将计为错误。"}
            </p>
            {submitError && <p className="text-sm text-destructive">{submitError}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setConfirming(false)} disabled={submitting}>取消</Button>
              <Button onClick={onSubmit} disabled={submitting}>{submitting ? "评分中…" : "确认交卷"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Result({
  grade, onRetake, onHome, retaking,
}: {
  grade: GradeResult;
  onRetake: () => void;
  onHome: () => void;
  retaking: boolean;
}) {
  const { total, correct: correctCount, wrong: wrongCount, results } = grade;
  const rate = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = correctCount >= PASS;
  const wrongs = results.filter((r) => !r.is_correct);

  return (
    <div className="space-y-8">
      {/* Score summary */}
      <Card className={cn("border-border", passed ? "bg-emerald-50/60" : "bg-red-50/60")}>
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
                通过分数线：{PASS} / {total}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
              <Stat label="答对" value={correctCount} tone="pos" />
              <Stat label="答错" value={wrongCount} tone="neg" />
              <Stat label="正确率" value={`${rate}%`} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            <Button onClick={onRetake} disabled={retaking}>
              {retaking ? "抽题中…" : "再考一次"}
            </Button>
            <Button variant="outline" onClick={onHome}>返回</Button>
          </div>
        </CardContent>
      </Card>

      {/* Wrong review */}
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

      {/* Full analysis */}
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
    .map((k) => ({ key: k, text: (r as unknown as Record<string, string | null>)[`option_${k.toLowerCase()}`] }))
    .filter((o) => o.text && o.text.trim() !== "");

  return (
    <Card className="border-border">
      <CardContent className="p-5 md:p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="text-sm font-medium">
            <span className="text-muted-foreground mr-2">Q{idx}.</span>
            {r.question}
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
          {opts.map(({ key, text }) => {
            const isCorrect = key === correct;
            const isPicked = key === pick;
            return (
              <div
                key={key}
                className={cn(
                  "rounded-lg border p-3 text-sm flex items-start gap-3",
                  isCorrect && "border-emerald-500 bg-emerald-50",
                  !isCorrect && isPicked && "border-red-400 bg-red-50",
                  !isCorrect && !isPicked && "border-border bg-white",
                )}
              >
                <span className={cn(
                  "shrink-0 h-6 w-6 rounded-full grid place-items-center text-xs font-semibold",
                  isCorrect ? "bg-emerald-500 text-white"
                    : isPicked ? "bg-red-500 text-white"
                    : "bg-muted text-foreground",
                )}>{key}</span>
                <span className="leading-relaxed">{text}</span>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-muted-foreground grid gap-1 md:grid-cols-2">
          <div>我的选择：<b className={cn(isRight ? "text-emerald-700" : "text-red-700")}>{pick ?? "未作答"}</b></div>
          <div>正确答案：<b className="text-emerald-700">{correct}</b></div>
        </div>
        {r.explanation && (
          <div className="text-sm rounded-lg bg-muted/50 p-3 leading-relaxed">
            <div className="text-xs font-semibold text-muted-foreground mb-1">解析</div>
            {r.explanation}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
