import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  adminGetExam, adminUpsertExam, adminDeleteExam, type ExamConfig,
} from "@/lib/exams.functions";

export const Route = createFileRoute("/_authenticated/admin/exams/$id")({
  component: ExamEditPage,
});

type FormState = {
  id?: string;
  category: string;
  title: string;
  subtitle: string;
  total_questions: number;
  pass_count: number;
  time_minutes: number;
  bilingual: boolean;
  back_href: string;
  back_label: string;
  is_active: boolean;
  sort_order: number;
};

const empty: FormState = {
  category: "",
  title: "",
  subtitle: "",
  total_questions: 25,
  pass_count: 20,
  time_minutes: 30,
  bilingual: false,
  back_href: "/p/drive",
  back_label: "← 返回驾考工具",
  is_active: true,
  sort_order: 0,
};

function toForm(e: ExamConfig): FormState {
  return {
    id: e.id,
    category: e.category,
    title: e.title,
    subtitle: e.subtitle ?? "",
    total_questions: e.total_questions,
    pass_count: e.pass_count,
    time_minutes: Math.round((e.time_seconds ?? 0) / 60),
    bilingual: e.bilingual,
    back_href: e.back_href ?? "",
    back_label: e.back_label ?? "",
    is_active: e.is_active,
    sort_order: e.sort_order,
  };
}

function ExamEditPage() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const getFn = useServerFn(adminGetExam);
  const upFn = useServerFn(adminUpsertExam);
  const delFn = useServerFn(adminDeleteExam);

  const q = useQuery({
    queryKey: ["admin", "exams", id],
    enabled: !isNew,
    queryFn: () => getFn({ data: { id } }),
  });

  const [form, setForm] = useState<FormState>(empty);
  useEffect(() => {
    if (!isNew && q.data) setForm(toForm(q.data));
  }, [isNew, q.data]);

  const save = useMutation({
    mutationFn: () => upFn({ data: {
      id: form.id,
      category: form.category.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      total_questions: Number(form.total_questions),
      pass_count: Number(form.pass_count),
      time_seconds: Math.max(0, Number(form.time_minutes) * 60),
      bilingual: form.bilingual,
      back_href: form.back_href.trim() || null,
      back_label: form.back_label.trim() || null,
      is_active: form.is_active,
      sort_order: Number(form.sort_order),
    } }),
    onSuccess: (r) => {
      toast.success("已保存");
      if (isNew) navigate({ to: "/admin/exams/$id", params: { id: r.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: () => delFn({ data: { id: form.id! } }),
    onSuccess: () => { toast.success("已删除"); navigate({ to: "/admin/exams" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  return (
    <div className="p-6 md:p-8 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/exams"><ArrowLeft size={14} className="mr-1" /> 返回列表</Link>
        </Button>
        <div className="flex gap-2">
          {!isNew && (
            <Button variant="outline" size="sm" className="text-red-600"
              onClick={() => { if (confirm("确定删除该考试？（题库不受影响）")) del.mutate(); }}>
              <Trash2 size={14} className="mr-1" /> 删除
            </Button>
          )}
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            <Save size={14} className="mr-1" /> 保存
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{isNew ? "新建考试" : "编辑考试"}</h1>
        <p className="text-sm text-slate-500 mt-1">
          修改后自动生效。前台通过 <code className="bg-slate-100 px-1 rounded">app:exam:分类名</code> 匹配。
        </p>
      </div>

      <Card><CardContent className="p-6 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>标题 *</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)}
              placeholder="例如：小型车 C1 模拟考试" />
          </div>
          <div className="space-y-1.5">
            <Label>题库分类 (category) *</Label>
            <Input value={form.category} onChange={(e) => update("category", e.target.value)}
              placeholder="c1 / air_brake / commercial_driver"
              disabled={!isNew} />
            {!isNew && <p className="text-[11px] text-slate-400">分类创建后不可修改（会与题库解耦）。</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>副标题 / 描述</Label>
          <Textarea rows={2} value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)}
            placeholder="DMV 风格 · 随机 25 题 · 45 分钟 · 20 题通过" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>抽题数量</Label>
            <Input type="number" min={1} value={form.total_questions}
              onChange={(e) => update("total_questions", Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>及格题数</Label>
            <Input type="number" min={0} value={form.pass_count}
              onChange={(e) => update("pass_count", Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>时限（分钟，0=无时限）</Label>
            <Input type="number" min={0} value={form.time_minutes}
              onChange={(e) => update("time_minutes", Number(e.target.value))} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>返回按钮 URL</Label>
            <Input value={form.back_href} onChange={(e) => update("back_href", e.target.value)}
              placeholder="/p/drive" />
          </div>
          <div className="space-y-1.5">
            <Label>返回按钮文案</Label>
            <Input value={form.back_label} onChange={(e) => update("back_label", e.target.value)}
              placeholder="← 返回驾考工具" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={form.bilingual} onCheckedChange={(v) => update("bilingual", v)} />
            <span>中英双语</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={form.is_active} onCheckedChange={(v) => update("is_active", v)} />
            <span>启用</span>
          </label>
          <div className="space-y-1.5">
            <Label>排序</Label>
            <Input type="number" value={form.sort_order}
              onChange={(e) => update("sort_order", Number(e.target.value))} />
          </div>
        </div>
      </CardContent></Card>
    </div>
  );
}
