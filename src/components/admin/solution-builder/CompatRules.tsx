import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { DataTable, ConfirmDialog, EmptyState } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  sbAdminListCompatRules,
  sbAdminSaveCompatRule,
  sbAdminDeleteCompatRule,
} from "@/lib/solution-builder.functions";

type Row = {
  id: string;
  rule_code: string;
  rule_type: string;
  params: Record<string, string | number | boolean | null>;
  severity: "info" | "warning" | "error";
  message_zh: string | null;
  message_en: string | null;
  is_active: boolean;
  sort_order: number;
};

const RULE_TYPES: { value: string; label: string; params: string[] }[] = [
  { value: "pc.socket_match", label: "PC · CPU/主板 Socket 匹配", params: [] },
  { value: "pc.ram_type_match", label: "PC · 内存类型匹配", params: [] },
  { value: "pc.psu_headroom", label: "PC · 电源余量", params: ["headroom_pct"] },
  { value: "pc.gpu_slot", label: "PC · 显卡插槽/尺寸", params: [] },
  { value: "pc.cooler_tdp", label: "PC · 散热 TDP 覆盖", params: [] },
  { value: "nas.raid_min_bays", label: "NAS · RAID 最少盘位", params: ["level", "min_bays", "even_only"] },
  { value: "nas.recording_cmr", label: "NAS · 监控要求 CMR 盘", params: [] },
  { value: "nas.nic_switch_match", label: "NAS · 网口与交换机匹配", params: [] },
  { value: "net.poe_budget", label: "网络 · PoE 预算", params: ["headroom_pct"] },
  { value: "net.mesh_backhaul", label: "网络 · Mesh 回程", params: [] },
  { value: "net.cable_cat", label: "网络 · 线缆等级", params: ["min_cat"] },
];

const SEVERITIES = [
  { value: "info", label: "Info · 提示" },
  { value: "warning", label: "Warning · 警告" },
  { value: "error", label: "Error · 错误" },
] as const;

const SEV_COLOR: Record<Row["severity"], string> = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
};

const EMPTY: Row = {
  id: "",
  rule_code: "",
  rule_type: "pc.socket_match",
  params: {},
  severity: "warning",
  message_zh: "",
  message_en: "",
  is_active: true,
  sort_order: 100,
};

export function CompatRules() {
  const qc = useQueryClient();
  const listFn = useServerFn(sbAdminListCompatRules);
  const saveFn = useServerFn(sbAdminSaveCompatRule);
  const delFn = useServerFn(sbAdminDeleteCompatRule);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [pendingDel, setPendingDel] = useState<Row | null>(null);

  const q = useQuery({
    queryKey: ["admin", "compat-rules"],
    queryFn: async () => (await listFn()) as { rows: Row[] },
  });

  const rows = useMemo(() => {
    const all = (q.data?.rows ?? []) as Row[];
    return all.filter((r) => {
      if (typeFilter && r.rule_type !== typeFilter) return false;
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        r.rule_code.toLowerCase().includes(s) ||
        r.rule_type.toLowerCase().includes(s) ||
        (r.message_zh ?? "").toLowerCase().includes(s) ||
        (r.message_en ?? "").toLowerCase().includes(s)
      );
    });
  }, [q.data, search, typeFilter]);

  const saveM = useMutation({
    mutationFn: async (payload: Row) => saveFn({ data: payload }),
    onSuccess: () => {
      toast.success("已保存");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "compat-rules"] });
      qc.invalidateQueries({ queryKey: ["sb", "compat-rules"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delM = useMutation({
    mutationFn: async (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("已删除");
      setPendingDel(null);
      qc.invalidateQueries({ queryKey: ["admin", "compat-rules"] });
      qc.invalidateQueries({ queryKey: ["sb", "compat-rules"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="max-w-xs"
          placeholder="搜索 code / 消息 / 类型"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={typeFilter || "all"} onValueChange={(v) => setTypeFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-64"><SelectValue placeholder="全部类型" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            {RULE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button onClick={() => setEditing({ ...EMPTY })}>
            <Plus className="h-4 w-4 mr-1" /> 新建规则
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="暂无规则" description="点击右上角“新建规则”创建第一条兼容性规则。" />
      ) : (
        <DataTable<Row>
          rowKey={(r) => r.id}
          columns={[
            { key: "sort_order", header: "序", width: "60px", cell: (r) => <span className="text-slate-500">{r.sort_order}</span> },
            { key: "rule_code", header: "Code", cell: (r) => <code className="text-xs">{r.rule_code}</code> },
            { key: "rule_type", header: "类型", cell: (r) => <span className="text-xs text-slate-600">{r.rule_type}</span> },
            {
              key: "severity",
              header: "级别",
              width: "90px",
              cell: (r) => <Badge className={SEV_COLOR[r.severity]}>{r.severity}</Badge>,
            },
            {
              key: "message",
              header: "消息",
              cell: (r) => (
                <div className="text-xs text-slate-700 space-y-0.5">
                  <div>{r.message_zh || <span className="text-slate-400">— zh 未填 —</span>}</div>
                  <div className="text-slate-500">{r.message_en || <span className="text-slate-400">— en missing —</span>}</div>
                </div>
              ),
            },
            {
              key: "is_active",
              header: "启用",
              width: "80px",
              cell: (r) => (
                <Switch
                  checked={r.is_active}
                  onCheckedChange={(v) => saveM.mutate({ ...r, is_active: v })}
                />
              ),
            },
            {
              key: "actions",
              header: "",
              width: "120px",
              cell: (r) => (
                <div className="flex gap-1 justify-end">
                  <Button size="sm" variant="ghost" onClick={() => setEditing({ ...r, params: r.params ?? {} })}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPendingDel(r)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ),
            },
          ]}
          rows={rows}
        />
      )}

      {editing && (
        <EditDialog
          row={editing}
          onClose={() => setEditing(null)}
          onSave={(r) => saveM.mutate(r)}
          saving={saveM.isPending}
        />
      )}

      <ConfirmDialog
        open={!!pendingDel}
        onOpenChange={(v) => { if (!v) setPendingDel(null); }}
        title="删除规则？"
        description={pendingDel ? `将永久删除 ${pendingDel.rule_code}。` : ""}
        confirmLabel="删除"
        destructive
        onConfirm={() => { if (pendingDel) delM.mutate(pendingDel.id); }}
      />
    </div>
  );
}

function EditDialog({ row, onClose, onSave, saving }: { row: Row; onClose: () => void; onSave: (r: Row) => void; saving: boolean }) {
  const [form, setForm] = useState<Row>(row);
  const [paramsText, setParamsText] = useState(() => JSON.stringify(row.params ?? {}, null, 2));
  const [paramsErr, setParamsErr] = useState<string | null>(null);

  const meta = RULE_TYPES.find((t) => t.value === form.rule_type);

  const handleSubmit = () => {
    let parsed: Record<string, string | number | boolean | null> = {};
    try {
      parsed = paramsText.trim() ? JSON.parse(paramsText) : {};
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("必须为 JSON 对象");
    } catch (e) {
      setParamsErr((e as Error).message);
      return;
    }
    onSave({ ...form, params: parsed });
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{row.id ? "编辑规则" : "新建规则"}</DialogTitle>
          <DialogDescription>规则由方案配置器实时执行；停用后立即失效。</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Rule Code *</Label>
            <Input value={form.rule_code} onChange={(e) => setForm({ ...form, rule_code: e.target.value })} placeholder="pc.socket.v1" />
          </div>
          <div>
            <Label>排序</Label>
            <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })} />
          </div>
          <div className="col-span-2">
            <Label>规则类型 *</Label>
            <Select value={form.rule_type} onValueChange={(v) => setForm({ ...form, rule_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RULE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {meta && meta.params.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">支持参数：{meta.params.join(", ")}</p>
            )}
          </div>
          <div>
            <Label>严重级别</Label>
            <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v as Row["severity"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEVERITIES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <span className="text-sm">启用</span>
            </div>
          </div>
          <div className="col-span-2">
            <Label>消息（中文）</Label>
            <Textarea rows={2} value={form.message_zh ?? ""} onChange={(e) => setForm({ ...form, message_zh: e.target.value })} placeholder="CPU 接口与主板不兼容" />
          </div>
          <div className="col-span-2">
            <Label>Message (English)</Label>
            <Textarea rows={2} value={form.message_en ?? ""} onChange={(e) => setForm({ ...form, message_en: e.target.value })} placeholder="CPU socket does not match motherboard" />
          </div>
          <div className="col-span-2">
            <Label>Params (JSON)</Label>
            <Textarea
              rows={4}
              className="font-mono text-xs"
              value={paramsText}
              onChange={(e) => { setParamsText(e.target.value); setParamsErr(null); }}
              placeholder='{"headroom_pct": 20}'
            />
            {paramsErr && <p className="text-xs text-red-600 mt-1">{paramsErr}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? "保存中…" : "保存"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
