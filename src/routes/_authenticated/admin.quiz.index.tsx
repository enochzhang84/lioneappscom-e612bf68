import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { adminListQuiz, adminDeleteQuiz, adminToggleQuizActive } from "@/lib/quiz-admin.functions";
import { Pencil, Trash2, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/quiz/")({
  component: QuizListPage,
});

function QuizListPage() {
  const listFn = useServerFn(adminListQuiz);
  const delFn = useServerFn(adminDeleteQuiz);
  const toggleFn = useServerFn(adminToggleQuizActive);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  const list = useQuery({
    queryKey: ["admin", "quiz", cat],
    queryFn: () => listFn({ data: cat ? { category: cat } : {} }),
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("已删除"); qc.invalidateQueries({ queryKey: ["admin", "quiz"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: (v: { id: string; is_active: boolean }) => toggleFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quiz"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (list.data ?? []).filter((r) =>
    q ? r.question.toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">题库管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {list.data ? `共 ${list.data.length} 题` : "加载中…"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/p/drive/c1">查看考试页</Link>
          </Button>
          <Button asChild>
            <Link to="/admin/quiz/$id" params={{ id: "new" }}>+ 新建题目</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="搜索题目内容…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Input placeholder="按分类过滤（如 c1）" value={cat} onChange={(e) => setCat(e.target.value)} className="w-56" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {rows.length === 0 && (
              <div className="p-8 text-sm text-muted-foreground text-center">暂无题目</div>
            )}
            {rows.map((r) => (
              <div key={r.id} className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs">{r.category}</span>
                    <span className="inline-flex items-center rounded bg-primary/10 text-primary px-2 py-0.5 text-xs">
                      正确：{r.correct_answer}
                    </span>
                    {!r.is_active && (
                      <span className="inline-flex items-center rounded bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs">已隐藏</span>
                    )}
                  </div>
                  <div className="mt-1.5 text-sm line-clamp-2">{r.question}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={r.is_active}
                    onCheckedChange={(v) => toggle.mutate({ id: r.id, is_active: v })}
                  />
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/admin/quiz/$id" params={{ id: r.id }}><Pencil size={14} className="mr-1" />编辑</Link>
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive"
                    onClick={() => { if (confirm("确认删除这道题？")) del.mutate(r.id); }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
