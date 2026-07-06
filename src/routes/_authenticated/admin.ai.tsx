import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, RefreshCw, Trash2, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  adminListAiCache,
  adminAiCacheStats,
  adminDeleteAiCache,
  adminRegenerateAiCache,
  adminBulkGenerateDmv,
} from "@/lib/ai-knowledge.functions";

export const Route = createFileRoute("/_authenticated/admin/ai")({
  head: () => ({ meta: [{ title: "AI 知识引擎 · Lione Apps Admin" }] }),
  component: AiEnginePage,
});

function AiEnginePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI 知识引擎"
        description="统一 AI 缓存与批量生成中心。所有产品共用：DMV / Church / Estimate / Warehouse / Blog / Tool。缓存命中即免费，只有真正生成时才调用 AI Gateway。"
      />
      <Tabs defaultValue="cache" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cache">缓存列表</TabsTrigger>
          <TabsTrigger value="bulk">批量生成</TabsTrigger>
          <TabsTrigger value="stats">统计</TabsTrigger>
        </TabsList>
        <TabsContent value="cache"><CacheList /></TabsContent>
        <TabsContent value="bulk"><BulkGenerate /></TabsContent>
        <TabsContent value="stats"><Stats /></TabsContent>
      </Tabs>
    </div>
  );
}

// -------------------- Cache List --------------------
function CacheList() {
  const listFn = useServerFn(adminListAiCache);
  const delFn = useServerFn(adminDeleteAiCache);
  const regenFn = useServerFn(adminRegenerateAiCache);
  const qc = useQueryClient();

  const [module, setModule] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const list = useQuery({
    queryKey: ["admin", "ai-cache", { module, status, search }],
    queryFn: () =>
      listFn({
        data: {
          module: module === "all" ? undefined : module,
          status: status === "all" ? undefined : (status as "ready" | "failed" | "generating"),
          search: search || undefined,
          limit: 100,
          offset: 0,
        },
      }),
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("缓存已删除");
      qc.invalidateQueries({ queryKey: ["admin", "ai-cache"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const regen = useMutation({
    mutationFn: (id: string) => regenFn({ data: { id } }),
    onSuccess: () => {
      toast.success("已重新生成");
      qc.invalidateQueries({ queryKey: ["admin", "ai-cache"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = list.data?.rows ?? [];

  return (
    <>
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索 record_id"
            className="max-w-xs"
          />
          <Select value={module} onValueChange={setModule}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="模块" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部模块</SelectItem>
              <SelectItem value="dmv">DMV</SelectItem>
              <SelectItem value="church">Church</SelectItem>
              <SelectItem value="estimate">Estimate</SelectItem>
              <SelectItem value="warehouse">Warehouse</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="tool">Tool</SelectItem>
              <SelectItem value="article">Article</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="状态" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="generating">Generating</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto text-xs text-muted-foreground">
            共 {list.data?.total ?? 0} 条
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">模块 / 类型</th>
                <th className="text-left px-4 py-3">Record ID</th>
                <th className="text-left px-4 py-3">语言 / 版本</th>
                <th className="text-left px-4 py-3">模型</th>
                <th className="text-left px-4 py-3">状态</th>
                <th className="text-right px-4 py-3">Tokens</th>
                <th className="text-left px-4 py-3">更新时间</th>
                <th className="text-right px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.isLoading && (
                <tr><td colSpan={8} className="text-center py-12"><Loader2 className="inline animate-spin" size={20} /></td></tr>
              )}
              {!list.isLoading && rows.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">暂无缓存记录</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.module}</div>
                    <div className="text-xs text-muted-foreground">{r.record_type}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs max-w-[220px] truncate">{r.record_id}</td>
                  <td className="px-4 py-3 text-xs">
                    <div>{r.language}</div>
                    <div className="text-muted-foreground">{r.prompt_version}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.model ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={
                        r.status === "ready"
                          ? "bg-emerald-100 text-emerald-700"
                          : r.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-200 text-slate-700"
                      }
                    >
                      {r.status}
                    </Badge>
                    {r.error && (
                      <div className="text-[11px] text-red-600 mt-1 max-w-[220px] truncate" title={r.error}>{r.error}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-right text-muted-foreground">
                    {r.tokens_in}/{r.tokens_out}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(r.updated_at).toLocaleString("zh-CN")}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      disabled={regen.isPending}
                      onClick={() => regen.mutate(r.id)}
                    >
                      <RefreshCw size={13} className="mr-1" />
                      重新生成
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      disabled={del.isPending}
                      onClick={() => {
                        if (confirm("确认删除此缓存？")) del.mutate(r.id);
                      }}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}

// -------------------- Bulk Generate --------------------
function BulkGenerate() {
  const bulkFn = useServerFn(adminBulkGenerateDmv);
  const qc = useQueryClient();
  const [kind, setKind] = useState<"written" | "signs" | "all">("all");
  const [limit, setLimit] = useState(20);
  const [lastResult, setLastResult] = useState<{
    totalQuestions: number;
    pendingBefore: number;
    processed: number;
    succeeded: number;
    failed: number;
    remaining: number;
    errors: { id: string; error: string }[];
  } | null>(null);

  const run = useMutation({
    mutationFn: () =>
      bulkFn({
        data: {
          kind,
          language: "zh",
          prompt_version: "v1",
          limit,
          onlyMissing: true,
        },
      }),
    onSuccess: (res) => {
      setLastResult(res);
      toast.success(`本轮完成：成功 ${res.succeeded}，失败 ${res.failed}，剩余 ${res.remaining}`);
      qc.invalidateQueries({ queryKey: ["admin", "ai-cache"] });
      qc.invalidateQueries({ queryKey: ["admin", "ai-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center">
            <Zap size={18} />
          </div>
          <div>
            <div className="font-semibold">DMV 题目解析批量生成</div>
            <div className="text-xs text-muted-foreground mt-1">
              为 DMV 题库中的每道题生成 AI 解析并缓存。以后所有用户打开该题，直接读缓存，秒开、不消耗 AI 额度。
              建议每批 20~50 条，多次点击直到"剩余 = 0"。
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">题库范围</label>
            <Select value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部（笔试 + 图标）</SelectItem>
                <SelectItem value="written">仅笔试</SelectItem>
                <SelectItem value="signs">仅图标</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">本轮生成条数</label>
            <Input
              type="number"
              min={1}
              max={500}
              value={limit}
              onChange={(e) => setLimit(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
              className="w-[120px]"
            />
          </div>
          <Button onClick={() => run.mutate()} disabled={run.isPending}>
            {run.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Sparkles size={16} className="mr-2" />}
            {run.isPending ? "生成中…" : "开始生成"}
          </Button>
        </div>

        {lastResult && (
          <div className="mt-4 rounded-lg border bg-slate-50 p-4 text-sm">
            <div className="font-semibold mb-2">本轮结果</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <Stat label="题库总量" value={lastResult.totalQuestions} />
              <Stat label="生成前待生成" value={lastResult.pendingBefore} />
              <Stat label="本轮处理" value={lastResult.processed} />
              <Stat label="成功" value={lastResult.succeeded} tone="emerald" />
              <Stat label="失败" value={lastResult.failed} tone="rose" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">还剩 <b className="text-slate-700">{lastResult.remaining}</b> 条待生成。</div>
            {lastResult.errors.length > 0 && (
              <details className="mt-2">
                <summary className="text-xs text-red-600 cursor-pointer">查看 {lastResult.errors.length} 条错误</summary>
                <ul className="mt-2 space-y-1 text-xs text-red-600">
                  {lastResult.errors.slice(0, 20).map((er) => (
                    <li key={er.id} className="font-mono truncate">{er.id}: {er.error}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "emerald" | "rose" }) {
  const color = tone === "emerald" ? "text-emerald-700" : tone === "rose" ? "text-red-600" : "text-slate-800";
  return (
    <div className="rounded-md bg-white border p-2">
      <div className="text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold ${color}`}>{value}</div>
    </div>
  );
}

// -------------------- Stats --------------------
function Stats() {
  const statsFn = useServerFn(adminAiCacheStats);
  const q = useQuery({
    queryKey: ["admin", "ai-stats"],
    queryFn: () => statsFn(),
  });
  if (q.isLoading) return <div className="p-8 text-center"><Loader2 className="inline animate-spin" /></div>;
  const s = q.data;
  if (!s) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="缓存总量" value={s.total} />
        <Stat label="Ready" value={s.ready} tone="emerald" />
        <Stat label="Failed" value={s.failed} tone="rose" />
        <Stat label="Tokens In" value={s.tokens_in} />
        <Stat label="Tokens Out" value={s.tokens_out} />
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">模块</th>
                <th className="text-left px-4 py-3">类型</th>
                <th className="text-right px-4 py-3">Ready</th>
                <th className="text-right px-4 py-3">Failed</th>
                <th className="text-right px-4 py-3">总计</th>
                <th className="text-right px-4 py-3">Tokens In</th>
                <th className="text-right px-4 py-3">Tokens Out</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {s.buckets.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">暂无数据</td></tr>
              )}
              {s.buckets.map((b) => (
                <tr key={`${b.module}::${b.record_type}`}>
                  <td className="px-4 py-3 font-medium">{b.module}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.record_type}</td>
                  <td className="px-4 py-3 text-right text-emerald-700">{b.ready}</td>
                  <td className="px-4 py-3 text-right text-red-600">{b.failed}</td>
                  <td className="px-4 py-3 text-right">{b.total}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{b.tokens_in}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{b.tokens_out}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
