import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ScrollText, Search, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  adminListActivityLogs,
  adminClearOldLogs,
  type AdminActivityLog,
} from "@/lib/system.functions";

export const Route = createFileRoute("/_authenticated/admin/logs")({
  component: LogsPage,
});

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  login: "bg-slate-200 text-slate-700",
  publish: "bg-amber-100 text-amber-700",
};

function actionClass(action: string) {
  const key = action.toLowerCase();
  for (const k of Object.keys(ACTION_COLORS)) {
    if (key.includes(k)) return ACTION_COLORS[k];
  }
  return "bg-slate-100 text-slate-700";
}

function LogsPage() {
  const listFn = useServerFn(adminListActivityLogs);
  const clearFn = useServerFn(adminClearOldLogs);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [action, setAction] = useState<string>("all");
  const [entityType, setEntityType] = useState<string>("all");

  const list = useQuery({
    queryKey: ["admin", "logs", { search, action, entityType }],
    queryFn: () =>
      listFn({
        data: {
          search: search || undefined,
          action: action === "all" ? undefined : action,
          entity_type: entityType === "all" ? undefined : entityType,
          limit: 200,
        },
      }),
  });

  const items: AdminActivityLog[] = list.data ?? [];

  const { actions, entityTypes } = useMemo(() => {
    const a = new Set<string>();
    const e = new Set<string>();
    for (const it of items) {
      if (it.action) a.add(it.action);
      if (it.entity_type) e.add(it.entity_type);
    }
    return { actions: Array.from(a).sort(), entityTypes: Array.from(e).sort() };
  }, [items]);

  const clearMut = useMutation({
    mutationFn: (days: number) => clearFn({ data: { days } }),
    onSuccess: () => {
      toast.success("已清理旧日志");
      qc.invalidateQueries({ queryKey: ["admin", "logs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const exportCSV = () => {
    const header = ["time", "actor", "action", "entity_type", "entity_id", "summary", "ip"];
    const rows = items.map((r) => [
      new Date(r.created_at).toISOString(),
      r.actor_email ?? "",
      r.action,
      r.entity_type ?? "",
      r.entity_id ?? "",
      (r.summary ?? "").replace(/"/g, '""'),
      r.ip ?? "",
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="操作日志"
        description="审计管理员在后台执行的动作：登录、内容修改、发布、删除等。"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV} disabled={items.length === 0}>
              <Download size={16} className="mr-2" />
              导出 CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("清理 30 天前的日志？此操作不可恢复。")) {
                  clearMut.mutate(30);
                }
              }}
            >
              <Trash2 size={16} className="mr-2" />
              清理 30 天前
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-4 flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索摘要 / 操作人 / 对象 ID"
              className="pl-9"
            />
          </div>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="动作" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部动作</SelectItem>
              {actions.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="对象类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              {entityTypes.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">时间</th>
                <th className="text-left px-4 py-3">操作人</th>
                <th className="text-left px-4 py-3">动作</th>
                <th className="text-left px-4 py-3">对象</th>
                <th className="text-left px-4 py-3">摘要</th>
                <th className="text-left px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    暂无日志记录
                  </td>
                </tr>
              )}
              {items.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("zh-CN")}
                  </td>
                  <td className="px-4 py-3">{r.actor_email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge className={actionClass(r.action)} variant="secondary">
                      {r.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {r.entity_type && (
                      <div className="text-muted-foreground">{r.entity_type}</div>
                    )}
                    {r.entity_id && (
                      <div className="font-mono truncate max-w-[180px]">{r.entity_id}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[400px]">
                    <div className="truncate">{r.summary ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {r.ip ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
