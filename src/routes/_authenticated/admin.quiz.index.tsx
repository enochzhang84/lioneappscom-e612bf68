import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { adminListQuiz, adminDeleteQuiz, adminToggleQuizActive } from "@/lib/quiz-admin.functions";
import { adminListBankNodes, type BankNode } from "@/lib/question-bank-admin.functions";
import { QuestionBankTree } from "@/components/admin/QuestionBankTree";
import { Pencil, Trash2, Search, ChevronRight, FolderTree } from "lucide-react";

const searchSchema = z.object({
  bank: z.string().uuid().optional(),
});

export const Route = createFileRoute("/_authenticated/admin/quiz/")({
  validateSearch: (s) => searchSchema.parse(s),
  component: QuizListPage,
});

function QuizListPage() {
  const listFn = useServerFn(adminListQuiz);
  const nodesFn = useServerFn(adminListBankNodes);
  const delFn = useServerFn(adminDeleteQuiz);
  const toggleFn = useServerFn(adminToggleQuizActive);
  const qc = useQueryClient();
  const navigate = useNavigate({ from: "/admin/quiz" });
  const { bank: bankId } = useSearch({ from: "/_authenticated/admin/quiz/" });
  const [q, setQ] = useState("");

  const nodes = useQuery({ queryKey: ["admin", "bank-nodes"], queryFn: () => nodesFn({}) });
  const selectedBank: BankNode | null = useMemo(() => {
    if (!bankId || !nodes.data) return null;
    return nodes.data.find((n) => n.id === bankId && n.node_type === "bank") ?? null;
  }, [bankId, nodes.data]);

  const breadcrumb = useMemo(() => {
    if (!selectedBank || !nodes.data) return [] as BankNode[];
    const byId = new Map(nodes.data.map((n) => [n.id, n]));
    const chain: BankNode[] = [];
    let cur: BankNode | undefined = selectedBank;
    while (cur) {
      chain.unshift(cur);
      cur = cur.parent_id ? byId.get(cur.parent_id) : undefined;
    }
    return chain;
  }, [selectedBank, nodes.data]);

  const list = useQuery({
    queryKey: ["admin", "quiz", "bank", bankId ?? "none"],
    queryFn: () => listFn({ data: { bankId: bankId ?? null } }),
    enabled: !!bankId,
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("已删除");
      qc.invalidateQueries({ queryKey: ["admin", "quiz"] });
      qc.invalidateQueries({ queryKey: ["admin", "bank-nodes"] });
    },
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
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* LEFT: tree */}
      <aside className="w-72 shrink-0 border-r bg-card flex flex-col">
        <QuestionBankTree
          selectedBankId={bankId ?? null}
          onSelectBank={(b) =>
            navigate({ search: () => ({ bank: b?.id }) })
          }
        />
      </aside>

      {/* RIGHT: content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="border-b px-6 py-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-h-[20px]">
            <FolderTree size={14} />
            {breadcrumb.length === 0 ? (
              <span>题库管理</span>
            ) : (
              breadcrumb.map((n, i) => (
                <span key={n.id} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight size={12} />}
                  <span className={i === breadcrumb.length - 1 ? "text-foreground font-medium" : ""}>{n.name}</span>
                </span>
              ))
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">
                {selectedBank ? selectedBank.name : "题库管理"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {selectedBank
                  ? `共 ${selectedBank.question_count} 题${list.isFetching ? " · 加载中…" : ""}`
                  : "从左侧目录选择一个题库开始编辑"}
              </p>
            </div>
            {selectedBank && (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/p/drive/c1">查看考试页</Link>
                </Button>
                <Button asChild size="sm">
                  <Link
                    to="/admin/quiz/$id"
                    params={{ id: "new" }}
                    search={{ bank: selectedBank.id } as never}
                  >
                    + 新建题目
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </header>

        {!selectedBank ? (
          <EmptyPane />
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="搜索题目内容…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {rows.length === 0 && !list.isLoading && (
                    <div className="p-8 text-sm text-muted-foreground text-center">
                      当前题库还没有题目
                    </div>
                  )}
                  {rows.map((r, idx) => (
                    <div key={r.id} className="p-4 flex items-start gap-4">
                      <div className="w-10 shrink-0 text-xs text-muted-foreground pt-1">#{idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center rounded bg-primary/10 text-primary px-2 py-0.5 text-xs">
                            正确：{r.correct_answer}
                          </span>
                          {!r.is_active && (
                            <span className="inline-flex items-center rounded bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs">已隐藏</span>
                          )}
                          {!r.question_bank_id && (
                            <span className="inline-flex items-center rounded bg-orange-100 text-orange-800 px-2 py-0.5 text-xs">未挂靠</span>
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
        )}
      </main>
    </div>
  );
}

function EmptyPane() {
  return (
    <div className="flex-1 flex items-center justify-center text-center p-8">
      <div className="max-w-md space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <FolderTree className="text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">选择一个题库</h2>
        <p className="text-sm text-muted-foreground">
          从左侧目录（DMV → C1 → 笔试题库 …）选择一个题库开始管理题目。
          <br />也可以从左上角「+ 分类」新建考试类型，无需修改代码即可扩展摩托车、CDL、船舶、教会考试等。
        </p>
      </div>
    </div>
  );
}
