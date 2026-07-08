import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, TrafficCone, ArrowRight } from "lucide-react";
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
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="mx-auto max-w-[1100px] px-4 md:px-8 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            DMV 小型车 C1 模拟考试
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-600">
            按真实 DMV 考试方式拆分为两个独立考试，选择要进行的考试模块
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Theory */}
          <Card className="border-blue-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] text-white px-6 py-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-white/15 grid place-items-center ring-1 ring-white/20">
                <ClipboardCheck size={22} />
              </div>
              <div>
                <div className="text-lg font-bold">① California DMV 驾照模拟考试</div>
                <div className="text-xs text-white/80">Theory Test</div>
              </div>
            </div>
            <CardContent className="p-6 md:p-8 space-y-5">
              <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-5">
                <li>共 36 道题，随机从题库抽取。</li>
                <li>请认真审题。</li>
                <li>考试时长 60 分钟。</li>
                <li>交卷后将显示成绩、正确答案与错题回顾。</li>
              </ul>
              <Button
                size="lg"
                onClick={() => setMode("theory")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                开始考试 <ArrowRight size={16} className="ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Signs */}
          <Card className="border-orange-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#9a3412] via-[#c2410c] to-[#ea580c] text-white px-6 py-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-white/15 grid place-items-center ring-1 ring-white/20">
                <TrafficCone size={22} />
              </div>
              <div>
                <div className="text-lg font-bold">② 小型车 C1 · 图标模拟考试</div>
                <div className="text-xs text-white/80">Road Sign Test</div>
              </div>
            </div>
            <CardContent className="p-6 md:p-8 space-y-5">
              <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-5">
                <li>共 12 道题，随机从题库抽取。</li>
                <li>请认真审题。</li>
                <li>考试时长 20 分钟。</li>
                <li>交卷后将显示成绩、正确答案与错题回顾。</li>
              </ul>
              <Button
                size="lg"
                onClick={() => setMode("signs")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                开始考试 <ArrowRight size={16} className="ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          本模拟考试参考加州 DMV 真实考试流程 · 仅用于备考练习
        </p>
      </div>
    </div>
  );
}
