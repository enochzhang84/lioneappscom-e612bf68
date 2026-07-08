import { useState } from "react";
import { Card } from "@/components/ui/card";
import { QuizApp } from "@/routes/p.drive.c1";

type Mode = "hub" | "theory" | "signs";

const THEORY_PROPS = {
  embedded: true as const,
  category: "c1",
  total: 36,
  pass: 30,
  maxWrong: 6,
  maxSkip: 3,
  examSeconds: 60 * 60,
  title: "California DMV 驾照模拟考试",
  subtitle: "共 36 道题 · 60 分钟 · 随机抽题",
  backHref: "/p/drive",
  backLabel: "← 返回考试选择",
  useHistory: true,
  historyKey: "drive-c1-theory",
  attemptsKey: "lione:c1-theory-attempts",
  maxAttempts: 3,
  theme: "blue" as const,
  instantFeedback: true,
  simplifiedRules: true,
  minimalMode: true,
};

const SIGNS_PROPS = {
  embedded: true as const,
  category: "c1_signs",
  total: 12,
  pass: 10,
  maxWrong: 2,
  examSeconds: 20 * 60,
  title: "小型车 C1 · 图标模拟考试",
  subtitle: "共 12 道题 · 20 分钟 · 随机抽题",
  backHref: "/p/drive",
  backLabel: "← 返回考试选择",
  useHistory: true,
  historyKey: "drive-c1-signs",
  theme: "orange" as const,
  instantFeedback: true,
  simplifiedRules: true,
  minimalMode: true,
};

export function C1MockExamHub() {
  const [mode, setMode] = useState<Mode>("hub");

  if (mode === "theory") {
    return <QuizApp {...THEORY_PROPS} onExit={() => setMode("hub")} />;
  }
  if (mode === "signs") {
    return <QuizApp {...SIGNS_PROPS} onExit={() => setMode("hub")} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-xl px-6 py-16 md:py-24">
        <div className="mb-12 text-center md:mb-16">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            DMV 小型车 C1 模拟考试
          </h1>
          <p className="mt-3 text-base text-slate-500">
            请选择要进行的考试类型
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <Card
            role="button"
            tabIndex={0}
            onClick={() => setMode("theory")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setMode("theory");
            }}
            className="group flex cursor-pointer items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-blue-500 hover:shadow-md md:p-7"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl transition-colors group-hover:bg-blue-50 md:h-14 md:w-14">
              🚗
            </span>
            <div className="min-w-0">
              <div className="text-lg font-semibold text-slate-900 md:text-xl">
                驾驶员理论考试
              </div>
              <div className="mt-0.5 text-sm text-slate-500">Theory Test</div>
            </div>
          </Card>

          <Card
            role="button"
            tabIndex={0}
            onClick={() => setMode("signs")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setMode("signs");
            }}
            className="group flex cursor-pointer items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-orange-500 hover:shadow-md md:p-7"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl transition-colors group-hover:bg-orange-50 md:h-14 md:w-14">
              🚸
            </span>
            <div className="min-w-0">
              <div className="text-lg font-semibold text-slate-900 md:text-xl">
                驾驶员图标考试
              </div>
              <div className="mt-0.5 text-sm text-slate-500">Road Sign Test</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
