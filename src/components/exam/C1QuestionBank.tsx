import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ExamOptionList } from "@/components/exam/ExamOptionList";
import { listPracticeQuestions, type PracticeQuestion } from "@/lib/quiz.functions";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, Bookmark, Loader2, RotateCcw, Search, Star, XCircle, CheckCircle2, ListChecks,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Topic classification — derived from question text (no schema change) */
/* ------------------------------------------------------------------ */

type Topic = { key: string; label: string; match?: (q: PracticeQuestion) => boolean };

const has = (q: PracticeQuestion, ...words: string[]) => {
  const hay = `${q.question} ${q.option_a} ${q.option_b} ${q.option_c ?? ""} ${q.option_d ?? ""}`;
  return words.some((w) => hay.includes(w));
};

const TOPICS: Topic[] = [
  { key: "all", label: "全部" },
  { key: "signs", label: "交通标志", match: (q) => q.category === "c1_signs" || q.question_type === "sign_recognition" || has(q, "标志", "标线", "路标") },
  { key: "dui", label: "酒驾", match: (q) => has(q, "酒", "血液酒精", "毒品", "药物") },
  { key: "freeway", label: "高速公路", match: (q) => has(q, "高速公路", "匝道", "汇入", "快速道") },
  { key: "parking", label: "停车", match: (q) => has(q, "停车", "泊车", "路缘", "消防栓") },
  { key: "lights", label: "灯光", match: (q) => has(q, "车灯", "近光", "远光", "灯光", "信号灯", "转向灯") },
  { key: "accident", label: "事故处理", match: (q) => has(q, "事故", "碰撞", "保险", "报警", "受伤") },
  { key: "safety", label: "安全驾驶", match: (q) => has(q, "安全带", "儿童", "车距", "跟车", "疲劳", "分心", "手机", "天气", "雨", "雾") },
  { key: "rules", label: "交通法规", match: (q) => has(q, "法律", "罚", "吊销", "驾照", "登记", "让行", "限速", "违规") },
  { key: "other", label: "其他" },
];

function topicOf(q: PracticeQuestion): string[] {
  const keys = TOPICS.filter((t) => t.match?.(q)).map((t) => t.key);
  return keys.length ? keys : ["other"];
}

/* ------------------------------------------------------------------ */
/* Local persistence                                                    */
/* ------------------------------------------------------------------ */

const K = {
  progress: "lione:c1-bank:progress",
  answers: "lione:c1-bank:answers",
  favorites: "lione:c1-bank:favorites",
  wrong: "lione:c1-bank:wrong",
  records: "lione:c1-bank:records",
};

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — practice still works in-memory */
  }
}

type AnswerMap = Record<string, "A" | "B" | "C" | "D">;
type PracticeRecord = {
  startedAt: string;
  endedAt: string;
  correct: number;
  wrong: number;
  total: number;
};

/* ------------------------------------------------------------------ */

type Mode = "browse" | "practice";

export function C1QuestionBank({
  backHref = "/p/drive",
  backLabel = "← 返回驾考工具",
}: {
  backHref?: string;
  backLabel?: string;
}) {
  const listFn = useServerFn(listPracticeQuestions);
  const bank = useQuery({
    queryKey: ["c1-question-bank"],
    queryFn: () => listFn({ data: { categories: ["c1", "c1_signs"] } }),
    staleTime: 10 * 60 * 1000,
  });

  const [mode, setMode] = useState<Mode>("browse");
  const [topic, setTopic] = useState("all");
  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [favorites, setFavorites] = useState<Record<string, true>>({});
  const [wrongBook, setWrongBook] = useState<Record<string, true>>({});
  const [current, setCurrent] = useState(0);
  const [resumeAsk, setResumeAsk] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [records, setRecords] = useState<PracticeRecord[]>([]);

  useEffect(() => {
    setAnswers(readJSON<AnswerMap>(K.answers, {}));
    setFavorites(readJSON<Record<string, true>>(K.favorites, {}));
    setWrongBook(readJSON<Record<string, true>>(K.wrong, {}));
    setRecords(readJSON<PracticeRecord[]>(K.records, []));
  }, []);

  const all = bank.data ?? [];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((item) => {
      if (topic !== "all" && !topicOf(item).includes(topic)) return false;
      if (!needle) return true;
      const hay = [
        item.question, item.question_en, item.option_a, item.option_b, item.option_c, item.option_d,
        item.correct_answer, item.explanation, item.category, item.google_keywords,
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [all, topic, q]);

  useEffect(() => { setPage(1); }, [topic, q, pageSize]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* ---------- practice ---------- */

  function startPractice(fromIndex = 0) {
    setCurrent(fromIndex);
    setStartedAt(new Date().toISOString());
    setMode("practice");
    setResumeAsk(null);
  }

  function onStartClick() {
    const saved = readJSON<number>(K.progress, 0);
    if (saved > 0 && saved < filtered.length) setResumeAsk(saved);
    else startPractice(0);
  }

  function persistAnswer(id: string, pick: "A" | "B" | "C" | "D", correct: boolean) {
    const next = { ...answers, [id]: pick };
    setAnswers(next);
    writeJSON(K.answers, next);
    if (!correct) {
      const nw = { ...wrongBook, [id]: true as const };
      setWrongBook(nw);
      writeJSON(K.wrong, nw);
    }
  }

  function goTo(index: number) {
    const clamped = Math.max(0, Math.min(filtered.length - 1, index));
    setCurrent(clamped);
    writeJSON(K.progress, clamped);
  }

  function endPractice() {
    if (startedAt) {
      let correct = 0;
      let wrong = 0;
      for (const item of filtered) {
        const picked = answers[item.id];
        if (!picked) continue;
        if (picked === item.correct_answer) correct++;
        else wrong++;
      }
      if (correct + wrong > 0) {
        const rec: PracticeRecord = {
          startedAt,
          endedAt: new Date().toISOString(),
          correct,
          wrong,
          total: filtered.length,
        };
        const next = [rec, ...records].slice(0, 20);
        setRecords(next);
        writeJSON(K.records, next);
      }
    }
    setStartedAt(null);
    setMode("browse");
  }

  function toggleFavorite(id: string) {
    const next = { ...favorites };
    if (next[id]) delete next[id];
    else next[id] = true;
    setFavorites(next);
    writeJSON(K.favorites, next);
  }

  function toggleWrongBook(id: string) {
    const next = { ...wrongBook };
    if (next[id]) delete next[id];
    else next[id] = true;
    setWrongBook(next);
    writeJSON(K.wrong, next);
  }

  function resetAnswer(id: string) {
    const next = { ...answers };
    delete next[id];
    setAnswers(next);
    writeJSON(K.answers, next);
  }

  /* ---------- render ---------- */

  if (bank.isLoading) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-slate-500">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 size={16} className="animate-spin" /> 正在加载题库…
        </div>
      </div>
    );
  }

  if (bank.error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          题库加载失败：{(bank.error as Error).message}
          <div className="mt-4">
            <Button size="sm" onClick={() => bank.refetch()}>重新加载</Button>
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = filtered.filter((item) => answers[item.id]).length;
  const correctCount = filtered.filter((item) => answers[item.id] === item.correct_answer).length;

  if (mode === "practice") {
    const item = filtered[current];
    if (!item) {
      return (
        <div className="mx-auto max-w-xl px-4 py-12 text-center text-sm text-slate-500">
          当前筛选下没有题目。
          <div className="mt-4"><Button size="sm" onClick={() => setMode("browse")}>返回题库</Button></div>
        </div>
      );
    }
    return (
      <PracticeView
        item={item}
        index={current}
        total={filtered.length}
        questions={filtered}
        answers={answers}
        favorites={favorites}
        wrongBook={wrongBook}
        onPick={(pick) => persistAnswer(item.id, pick, pick === item.correct_answer)}
        onGoTo={goTo}
        onToggleFavorite={() => toggleFavorite(item.id)}
        onToggleWrong={() => toggleWrongBook(item.id)}
        onReset={() => resetAnswer(item.id)}
        onExit={endPractice}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-6 md:py-10 space-y-6">
        <a href={backHref} className="inline-flex text-sm text-slate-500 hover:text-blue-600">{backLabel}</a>

        {/* Header */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-blue-700/20">
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-6 md:p-7">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-2xl bg-white/15 backdrop-blur grid place-items-center ring-1 ring-white/20">
                <ListChecks size={26} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">小型车 C1 题库</h1>
                <p className="mt-1 text-sm text-blue-100">
                  共 {all.length} 题 · 按数据库顺序排列 · 支持搜索、筛选与顺序练习
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={onStartClick} className="rounded-full bg-white text-blue-700 hover:bg-blue-50">
                开始顺序练习
              </Button>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs">
                已答 {answeredCount} · 答对 {correctCount} · 收藏 {Object.keys(favorites).length} · 错题 {Object.keys(wrongBook).length}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-4 md:p-5 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="搜索题目、关键词、答案或分类…"
                  className="pl-9 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="shrink-0">每页</span>
                {[20, 50, 100].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPageSize(n)}
                    className={cn(
                      "h-9 px-3 rounded-lg border text-sm transition-colors tabular-nums",
                      pageSize === n
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:border-blue-300",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTopic(t.key)}
                  className={cn(
                    "h-8 px-3 rounded-full border text-xs transition-colors",
                    topic === t.key
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:border-blue-300",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500">
              筛选结果 {filtered.length} 题 · 第 {page} / {pageCount} 页
            </p>
          </CardContent>
        </Card>

        {/* List */}
        <div className="space-y-3">
          {pageRows.map((item, i) => {
            const absolute = (page - 1) * pageSize + i;
            const globalNo = globalIndexById.get(item.id) ?? absolute;
            const picked = answers[item.id];
            const state = picked ? (picked === item.correct_answer ? "correct" : "wrong") : "none";
            return (
              <Card key={item.id} className="border-slate-200 shadow-sm rounded-2xl">
                <CardContent className="p-4 md:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    {/* Left: question */}
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span
                        className={cn(
                          "shrink-0 mt-0.5 h-7 min-w-[2rem] px-1.5 rounded-md grid place-items-center text-xs font-medium tabular-nums border",
                          state === "correct"
                            ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                            : state === "wrong"
                              ? "bg-red-100 border-red-400 text-red-800"
                              : "bg-white border-slate-200 text-slate-500",
                        )}
                      >
                        {globalNo + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm md:text-base text-slate-900 leading-relaxed whitespace-pre-wrap break-words">
                          {item.question}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="rounded bg-slate-100 px-2 py-0.5">
                            {item.category === "c1_signs" ? "交通标志" : "笔试题"}
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5">{topicLabelOf(item)}</span>
                          <span
                            className={cn(
                              "rounded px-2 py-0.5",
                              state === "correct"
                                ? "bg-emerald-50 text-emerald-700"
                                : state === "wrong"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-slate-50 text-slate-500",
                            )}
                          >
                            {state === "correct" ? "已答对" : state === "wrong" ? "已答错" : "未练习"}
                          </span>
                          {favorites[item.id] && (
                            <span className="rounded bg-amber-50 text-amber-700 px-2 py-0.5">已收藏</span>
                          )}
                          {wrongBook[item.id] && (
                            <span className="rounded bg-rose-50 text-rose-700 px-2 py-0.5">错题本</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: global position + actions */}
                    <div className="flex shrink-0 items-center justify-end gap-2 sm:w-auto sm:flex-col sm:items-end">
                      <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        题库第 {globalNo + 1} / {all.length} 题
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(item.id)}
                          aria-label="收藏"
                          className={cn(
                            "h-8 w-8 grid place-items-center rounded-lg border transition-colors",
                            favorites[item.id]
                              ? "border-amber-300 bg-amber-50 text-amber-600"
                              : "border-slate-200 text-slate-400 hover:border-amber-300",
                          )}
                        >
                          <Star size={14} className={favorites[item.id] ? "fill-amber-500" : ""} />
                        </button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => startPractice(absolute)}
                        >
                          {picked ? "继续练习" : "练习"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {pageRows.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              没有匹配的题目
            </div>
          )}
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              上一页
            </Button>
            <span className="text-sm text-slate-600 tabular-nums px-2">{page} / {pageCount}</span>
            <Button variant="outline" size="sm" className="rounded-full" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>
              下一页
            </Button>
          </div>
        )}

        {/* Records */}
        {records.length > 0 && (
          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-slate-900">练习记录</h3>
              <div className="space-y-2">
                {records.slice(0, 5).map((r, i) => {
                  const rate = r.correct + r.wrong > 0 ? Math.round((r.correct / (r.correct + r.wrong)) * 100) : 0;
                  const done = r.total > 0 ? Math.round(((r.correct + r.wrong) / r.total) * 100) : 0;
                  return (
                    <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>开始 {new Date(r.startedAt).toLocaleString()}</span>
                      <span>结束 {new Date(r.endedAt).toLocaleString()}</span>
                      <span className="text-emerald-600">正确 {r.correct}</span>
                      <span className="text-rose-600">错误 {r.wrong}</span>
                      <span>正确率 {rate}%</span>
                      <span>完成 {done}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resume dialog */}
      {resumeAsk !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={() => setResumeAsk(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">继续上次练习？</h3>
            <p className="text-sm text-muted-foreground">
              上次练习到第 <b>{resumeAsk + 1}</b> 题，你可以继续，也可以从第 1 题重新开始。
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => startPractice(0)}>重新开始</Button>
              <Button className="rounded-full bg-blue-600 hover:bg-blue-700" onClick={() => startPractice(resumeAsk)}>
                继续练习
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PracticeView({
  item, index, total, questions, answers, favorites, wrongBook,
  onPick, onGoTo, onToggleFavorite, onToggleWrong, onReset, onExit,
}: {
  item: PracticeQuestion;
  index: number;
  total: number;
  questions: PracticeQuestion[];
  answers: AnswerMap;
  favorites: Record<string, true>;
  wrongBook: Record<string, true>;
  onPick: (pick: "A" | "B" | "C" | "D") => void;
  onGoTo: (i: number) => void;
  onToggleFavorite: () => void;
  onToggleWrong: () => void;
  onReset: () => void;
  onExit: () => void;
}) {
  const picked = answers[item.id] ?? null;
  const answered = !!picked;
  const isCorrect = picked === item.correct_answer;
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;

  const options = ([
    { key: "A" as const, text: item.option_a, textEn: item.option_a_en },
    { key: "B" as const, text: item.option_b, textEn: item.option_b_en },
    { key: "C" as const, text: item.option_c, textEn: item.option_c_en },
    { key: "D" as const, text: item.option_d, textEn: item.option_d_en },
  ]).filter((o) => !!o.text && o.text.trim() !== "");

  // Navigator window keeps large banks usable on phones.
  const windowSize = 30;
  const start = Math.max(0, Math.min(index - windowSize / 2, total - windowSize));
  const navItems = questions.slice(Math.max(0, start), Math.max(0, start) + windowSize);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-3xl px-4 md:px-6 py-6 md:py-10 space-y-5">
        {/* Progress header */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-blue-700/20">
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-blue-100">小型车 C1 题库 · 顺序练习</div>
                <div className="mt-1 text-lg md:text-xl font-bold tabular-nums">
                  第 {index + 1} / {total} 题
                </div>
              </div>
              <Button size="sm" variant="secondary" className="rounded-full bg-white/15 text-white hover:bg-white/25 border-0" onClick={onExit}>
                结束练习
              </Button>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Question */}
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 md:p-8 space-y-6">
            <div className="flex gap-3 items-baseline">
              <span className="text-2xl md:text-3xl font-bold text-blue-600 tabular-nums">{index + 1}.</span>
              <div className="min-w-0">
                <h2 className="text-base md:text-lg font-semibold leading-relaxed whitespace-pre-wrap text-slate-900">
                  {item.question}
                </h2>
                {item.question_en && (
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed whitespace-pre-wrap italic">
                    {item.question_en}
                  </p>
                )}
              </div>
            </div>

            {item.image_url && (
              <div className="flex justify-center">
                <img
                  src={item.image_url}
                  alt="题目配图"
                  loading="lazy"
                  className="w-auto max-h-[420px] object-contain rounded-xl border border-slate-200 bg-white p-3"
                />
              </div>
            )}

            <ExamOptionList
              options={options}
              selected={picked}
              onSelect={(k) => !answered && onPick(k)}
              readOnly={answered}
              stateFor={
                answered
                  ? (k) => {
                      if (k === item.correct_answer) return "correct";
                      if (k === picked) return "wrong";
                      return "neutral";
                    }
                  : undefined
              }
            />

            {answered && (
              <>
                <div
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm flex items-center gap-2",
                    isCorrect
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-rose-200 bg-rose-50 text-rose-800",
                  )}
                >
                  {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {isCorrect ? (
                    <span>回答正确</span>
                  ) : (
                    <span>回答错误 · 正确答案是 <b className="font-semibold">{item.correct_answer}</b></span>
                  )}
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2 text-sm text-slate-700">
                  <div className="font-semibold text-blue-800">答案解析</div>
                  <p><span className="text-slate-500">正确答案：</span><b>{item.correct_answer}</b></p>
                  {item.explanation && <p className="leading-relaxed whitespace-pre-wrap">{item.explanation}</p>}
                  {item.explanation_en && (
                    <p className="leading-relaxed whitespace-pre-wrap text-slate-500 italic">{item.explanation_en}</p>
                  )}
                  {(item.manual_name || item.manual_chapter || item.manual_page || item.official_source) && (
                    <p className="text-xs text-slate-500">
                      法律依据 / 出处：
                      {[item.official_source, item.manual_name, item.manual_chapter, item.manual_page && `第 ${item.manual_page} 页`]
                        .filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {item.google_keywords && (
                    <p className="text-xs text-slate-500">考试技巧关键词：{item.google_keywords}</p>
                  )}
                  {!item.explanation && !item.explanation_en && (
                    <p className="text-xs text-slate-400">该题暂无文字解析。</p>
                  )}
                </div>
              </>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap justify-center gap-2 border-t border-slate-100">
              <Button
                variant="outline"
                className="mt-4 min-w-[104px] rounded-full"
                disabled={index === 0}
                onClick={() => onGoTo(index - 1)}
              >
                <ArrowLeft size={16} className="mr-1" /> 上一题
              </Button>
              <Button
                className="mt-4 min-w-[104px] rounded-full bg-blue-600 hover:bg-blue-700"
                disabled={index >= total - 1}
                onClick={() => onGoTo(index + 1)}
              >
                下一题 <ArrowRight size={16} className="ml-1" />
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "mt-4 min-w-[92px] rounded-full",
                  favorites[item.id] && "border-amber-300 bg-amber-50 text-amber-700",
                )}
                onClick={onToggleFavorite}
              >
                <Star size={15} className={cn("mr-1", favorites[item.id] && "fill-amber-500")} />
                {favorites[item.id] ? "已收藏" : "收藏"}
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "mt-4 min-w-[104px] rounded-full",
                  wrongBook[item.id] && "border-rose-300 bg-rose-50 text-rose-700",
                )}
                onClick={onToggleWrong}
              >
                <Bookmark size={15} className="mr-1" />
                {wrongBook[item.id] ? "已在错题本" : "加入错题"}
              </Button>
              <Button
                variant="ghost"
                className="mt-4 min-w-[92px] rounded-full text-slate-600 hover:bg-slate-100"
                disabled={!answered}
                onClick={onReset}
              >
                <RotateCcw size={15} className="mr-1" /> 重新作答
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigator */}
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">题号导航</h3>
              <span className="text-xs text-slate-500 tabular-nums">
                显示 {Math.max(0, start) + 1} - {Math.min(total, Math.max(0, start) + windowSize)} / {total}
              </span>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
              {navItems.map((nq, i) => {
                const absolute = Math.max(0, start) + i;
                const pick = answers[nq.id];
                const active = absolute === index;
                return (
                  <button
                    key={nq.id}
                    type="button"
                    onClick={() => onGoTo(absolute)}
                    className={cn(
                      "h-9 rounded-md text-sm font-medium border transition-colors tabular-nums",
                      active
                        ? "bg-blue-600 border-blue-600 text-white shadow ring-2 ring-blue-300"
                        : pick
                          ? pick === nq.correct_answer
                            ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                            : "bg-red-100 border-red-400 text-red-800"
                          : "bg-white border-slate-200 text-slate-600 hover:border-blue-300",
                    )}
                  >
                    {absolute + 1}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between gap-2">
              <Button variant="outline" size="sm" className="rounded-full" disabled={index === 0} onClick={() => onGoTo(0)}>
                回到第 1 题
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" disabled={index >= total - 1} onClick={() => onGoTo(total - 1)}>
                跳到最后一题
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
