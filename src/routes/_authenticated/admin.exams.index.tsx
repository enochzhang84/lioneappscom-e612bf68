import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GraduationCap, Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/admin/PageHeader";
import { adminListExams, adminDeleteExam, adminUpsertExam, type ExamConfig } from "@/lib/exams.functions";

export const Route = createFileRoute("/_authenticated/admin/exams/")({
  component: ExamListPage,
});

function fmtTime(sec: number) {
  if (!sec) return "无时限";
  const m = Math.round(sec / 60);
  return `${m} 分钟`;
}

function ExamListPage() {
  const listFn = useServerFn(adminListExams);
  const delFn = useServerFn(adminDeleteExam);
  const upFn = useServerFn(adminUpsertExam);
  const qc = useQueryClient();

  const list = useQuery({ queryKey: ["admin", "exams"], queryFn: () => listFn() });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("已删除"); qc.invalidateQueries({ queryKey: ["admin", "exams"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: (e: ExamConfig) =>
      upFn({ data: {
        id: e.id, category: e.category, title: e.title, subtitle: e.subtitle,
        total_questions: e.total_questions, pass_count: e.pass_count,
        time_seconds: e.time_seconds, bilingual: e.bilingual,
        back_href: e.back_href, back_label: e.back_label,
        is_active: !e.is_active, sort_order: e.sort_order,
      } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "exams"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = list.data ?? [];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px]">
      <PageHeader
        icon={GraduationCap}
        title="考试管理"
        description="定义所有 DMV / 驾考类模拟考试的规则：抽题数量、及格分、时限、双语开关等。前台通过 category 自动匹配题库。"
        actions={
          <Button asChild>
            <Link to="/admin/exams/$id" params={{ id: "new" }}>
              <Plus size={14} className="mr-1" /> 新建考试
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">考试</th>
                  <th className="px-4 py-3 font-medium">题库分类</th>
                  <th className="px-4 py-3 font-medium text-center">抽题 / 及格</th>
                  <th className="px-4 py-3 font-medium text-center">时限</th>
                  <th className="px-4 py-3 font-medium text-center">双语</th>
                  <th className="px-4 py-3 font-medium text-center">启用</th>
                  <th className="px-4 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    还没有考试，点击右上方 <b>+ 新建考试</b> 添加。
                  </td></tr>
                )}
                {rows.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{e.title}</div>
                      {e.subtitle && (
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{e.subtitle}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{e.category}</code>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {e.total_questions} / {e.pass_count}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{fmtTime(e.time_seconds)}</td>
                    <td className="px-4 py-3 text-center">
                      {e.bilingual ? <span className="text-xs text-blue-600">✓ 中英</span> : <span className="text-xs text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch checked={e.is_active} onCheckedChange={() => toggle.mutate(e)} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button asChild size="sm" variant="ghost" title="打开考试页">
                        <a href={`/p/drive/c1?exam=${e.category}`} target="_blank" rel="noreferrer">
                          <ExternalLink size={14} />
                        </a>
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/admin/exams/$id" params={{ id: e.id }}>
                          <Pencil size={14} className="mr-1" /> 编辑
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600"
                        onClick={() => { if (confirm(`删除考试「${e.title}」？（题库不会被删除）`)) del.mutate(e.id); }}>
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-slate-500">
        提示：<b>题库分类</b>（category）用于把考试与 <Link to="/admin/quiz" className="text-blue-600 underline">题库管理</Link> 关联。
        在「工具管理」的工具页里设置 <code className="bg-slate-100 px-1 rounded">link_url = app:exam:分类名</code>，
        前台就会自动以本页面配置的规则运行考试。
      </div>
    </div>
  );
}
