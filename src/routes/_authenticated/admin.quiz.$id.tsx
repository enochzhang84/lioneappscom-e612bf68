import { createFileRoute, Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminGetQuiz, adminUpsertQuiz } from "@/lib/quiz-admin.functions";
import { adminListBankNodes } from "@/lib/question-bank-admin.functions";

export const Route = createFileRoute("/_authenticated/admin/quiz/$id")({
  validateSearch: (s) => z.object({ bank: z.string().uuid().optional() }).parse(s),
  component: QuizEditPage,
});

type QType =
  | "single_choice"
  | "image_choice"
  | "sign_recognition"
  | "multiple_choice"
  | "true_false"
  | "fill_blank"
  | "hotspot";

type Form = {
  id?: string;
  question_type: QType;
  image_url: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  question_en: string;
  option_a_en: string;
  option_b_en: string;
  option_c_en: string;
  option_d_en: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string;
  explanation_en: string;
  official_source: string;
  manual_name: string;
  manual_chapter: string;
  manual_page: string;
  manual_url: string;
  google_keywords: string;
  category: string;
  question_bank_id: string | null;
  difficulty: string;
  is_active: boolean;
  sort_order: number;
};

const TYPE_OPTIONS: { value: QType; label: string; hint: string }[] = [
  { value: "single_choice", label: "普通单选", hint: "纯文字题目 + 四个文字选项" },
  { value: "image_choice", label: "图片选择题", hint: "一张包含 A/B/C/D 四个图标的大图 + 选项按钮" },
  { value: "sign_recognition", label: "路标识别题", hint: "一张路标图片 + 四个文字答案" },
];

const empty: Form = {
  question_type: "single_choice",
  image_url: "",
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  question_en: "",
  option_a_en: "",
  option_b_en: "",
  option_c_en: "",
  option_d_en: "",
  correct_answer: "A",
  explanation: "",
  explanation_en: "",
  official_source: "",
  manual_name: "",
  manual_chapter: "",
  manual_page: "",
  manual_url: "",
  google_keywords: "",
  category: "c1",
  question_bank_id: null,
  difficulty: "medium",
  is_active: true,
  sort_order: 0,
};

function QuizEditPage() {
  const { id } = useParams({ from: "/_authenticated/admin/quiz/$id" });
  const { bank: bankFromUrl } = useSearch({ from: "/_authenticated/admin/quiz/$id" });
  const isNew = id === "new";
  const navigate = useNavigate();
  const getFn = useServerFn(adminGetQuiz);
  const upsertFn = useServerFn(adminUpsertQuiz);
  const nodesFn = useServerFn(adminListBankNodes);

  const nodesQuery = useQuery({ queryKey: ["admin", "bank-nodes"], queryFn: () => nodesFn({}) });
  const banks = (nodesQuery.data ?? []).filter((n) => n.node_type === "bank");
  const bankLabel = (id: string) => {
    const list = nodesQuery.data ?? [];
    const byId = new Map(list.map((n) => [n.id, n]));
    const parts: string[] = [];
    let cur = byId.get(id);
    while (cur) { parts.unshift(cur.name); cur = cur.parent_id ? byId.get(cur.parent_id) : undefined; }
    return parts.join(" › ");
  };

  const [form, setForm] = useState<Form>(() =>
    isNew && bankFromUrl ? { ...empty, question_bank_id: bankFromUrl } : empty,
  );

  const q = useQuery({
    queryKey: ["admin", "quiz", id],
    queryFn: () => getFn({ data: { id } }),
    enabled: !isNew,
  });

  useEffect(() => {
    if (!isNew && q.data) {
      setForm({
        id: q.data.id,
        question: q.data.question,
        option_a: q.data.option_a,
        option_b: q.data.option_b,
        option_c: q.data.option_c ?? "",
        option_d: q.data.option_d ?? "",
        question_en: (q.data as { question_en?: string | null }).question_en ?? "",
        option_a_en: (q.data as { option_a_en?: string | null }).option_a_en ?? "",
        option_b_en: (q.data as { option_b_en?: string | null }).option_b_en ?? "",
        option_c_en: (q.data as { option_c_en?: string | null }).option_c_en ?? "",
        option_d_en: (q.data as { option_d_en?: string | null }).option_d_en ?? "",
        correct_answer: q.data.correct_answer as "A" | "B" | "C" | "D",
        explanation: q.data.explanation ?? "",
        explanation_en: (q.data as { explanation_en?: string | null }).explanation_en ?? "",
        official_source: (q.data as { official_source?: string | null }).official_source ?? "",
        manual_name: (q.data as { manual_name?: string | null }).manual_name ?? "",
        manual_chapter: (q.data as { manual_chapter?: string | null }).manual_chapter ?? "",
        manual_page: (q.data as { manual_page?: string | null }).manual_page ?? "",
        manual_url: (q.data as { manual_url?: string | null }).manual_url ?? "",
        google_keywords: (q.data as { google_keywords?: string | null }).google_keywords ?? "",
        category: q.data.category,
        question_bank_id: (q.data as { question_bank_id?: string | null }).question_bank_id ?? null,
        difficulty: q.data.difficulty ?? "medium",
        is_active: q.data.is_active,
        sort_order: q.data.sort_order ?? 0,
      });
    }
  }, [isNew, q.data]);

  const save = useMutation({
    mutationFn: () => upsertFn({
      data: {
        id: form.id,
        question: form.question,
        option_a: form.option_a,
        option_b: form.option_b,
        option_c: form.option_c || null,
        option_d: form.option_d || null,
        question_en: form.question_en || null,
        option_a_en: form.option_a_en || null,
        option_b_en: form.option_b_en || null,
        option_c_en: form.option_c_en || null,
        option_d_en: form.option_d_en || null,
        correct_answer: form.correct_answer,
        explanation: form.explanation || null,
        explanation_en: form.explanation_en || null,
        official_source: form.official_source || null,
        manual_name: form.manual_name || null,
        manual_chapter: form.manual_chapter || null,
        manual_page: form.manual_page || null,
        manual_url: form.manual_url || null,
        google_keywords: form.google_keywords || null,
        category: form.category,
        question_bank_id: form.question_bank_id,
        difficulty: form.difficulty,
        is_active: form.is_active,
        sort_order: form.sort_order,
      },
    }),
    onSuccess: () => {
      toast.success("已保存");
      navigate({
        to: "/admin/quiz",
        search: form.question_bank_id ? ({ bank: form.question_bank_id } as never) : ({} as never),
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function set<K extends keyof Form>(k: K, v: Form[K]) { setForm((p) => ({ ...p, [k]: v })); }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" type="button"><Link to="/admin/quiz">← 返回</Link></Button>
          <h1 className="text-2xl font-bold">{isNew ? "新建题目" : "编辑题目"}</h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div>
            <Label>题目 (中文) *</Label>
            <Textarea rows={3} value={form.question} onChange={(e) => set("question", e.target.value)} />
          </div>
          <div>
            <Label>Question (English)</Label>
            <Textarea rows={3} value={form.question_en} onChange={(e) => set("question_en", e.target.value)} placeholder="Optional English translation" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>选项 A (中文) *</Label><Textarea rows={2} value={form.option_a} onChange={(e) => set("option_a", e.target.value)} /></div>
            <div><Label>Option A (EN)</Label><Textarea rows={2} value={form.option_a_en} onChange={(e) => set("option_a_en", e.target.value)} /></div>
            <div><Label>选项 B (中文) *</Label><Textarea rows={2} value={form.option_b} onChange={(e) => set("option_b", e.target.value)} /></div>
            <div><Label>Option B (EN)</Label><Textarea rows={2} value={form.option_b_en} onChange={(e) => set("option_b_en", e.target.value)} /></div>
            <div><Label>选项 C (中文)</Label><Textarea rows={2} value={form.option_c} onChange={(e) => set("option_c", e.target.value)} /></div>
            <div><Label>Option C (EN)</Label><Textarea rows={2} value={form.option_c_en} onChange={(e) => set("option_c_en", e.target.value)} /></div>
            <div><Label>选项 D (中文)</Label><Textarea rows={2} value={form.option_d} onChange={(e) => set("option_d", e.target.value)} /></div>
            <div><Label>Option D (EN)</Label><Textarea rows={2} value={form.option_d_en} onChange={(e) => set("option_d_en", e.target.value)} /></div>
          </div>
          <div>
            <Label>所属题库 *</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.question_bank_id ?? ""}
              onChange={(e) => set("question_bank_id", e.target.value || null)}
            >
              <option value="">— 未挂靠 —</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>{bankLabel(b.id)}</option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground mt-1">
              题库来自左侧目录（三级：分类 › 模块 › 题库）。新增分类请到题库管理主页。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>正确答案 *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.correct_answer}
                onChange={(e) => set("correct_answer", e.target.value as "A" | "B" | "C" | "D")}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div><Label>分类</Label><Input value={form.category} onChange={(e) => set("category", e.target.value)} /></div>
            <div><Label>难度</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}
              >
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>
            <div><Label>排序</Label><Input type="number" value={form.sort_order} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} /></div>
          </div>
          <div>
            <Label>题目解释 (中文)</Label>
            <Textarea rows={3} value={form.explanation} onChange={(e) => set("explanation", e.target.value)} />
          </div>
          <div>
            <Label>Explanation (English)</Label>
            <Textarea rows={3} value={form.explanation_en} onChange={(e) => set("explanation_en", e.target.value)} />
          </div>

          <div className="pt-4 border-t space-y-4">
            <div className="text-sm font-semibold text-slate-800">📚 学习中心 · 官方资料</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>官方资料来源 (official_source)</Label><Input value={form.official_source} onChange={(e) => set("official_source", e.target.value)} placeholder="California Driver Handbook" /></div>
              <div><Label>手册名称 (manual_name)</Label><Input value={form.manual_name} onChange={(e) => set("manual_name", e.target.value)} placeholder="California Commercial Driver Handbook" /></div>
              <div><Label>手册章节 (manual_chapter)</Label><Input value={form.manual_chapter} onChange={(e) => set("manual_chapter", e.target.value)} placeholder="Chapter 5" /></div>
              <div><Label>手册页码 (manual_page)</Label><Input value={form.manual_page} onChange={(e) => set("manual_page", e.target.value)} placeholder="Page 87" /></div>
              <div className="md:col-span-2"><Label>官方手册链接 (manual_url)</Label><Input value={form.manual_url} onChange={(e) => set("manual_url", e.target.value)} placeholder="https://www.dmv.ca.gov/..." /></div>
              <div className="md:col-span-2"><Label>Google 搜索关键词 (google_keywords)</Label><Input value={form.google_keywords} onChange={(e) => set("google_keywords", e.target.value)} placeholder="留空则使用题目 + 手册名" /></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} />
            <span className="text-sm">启用（在考试中出现）</span>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "保存中…" : "保存"}
            </Button>
            <Button asChild variant="ghost" type="button"><Link to="/admin/quiz">取消</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
