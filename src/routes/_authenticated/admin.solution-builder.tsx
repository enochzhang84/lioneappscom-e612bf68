import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader, DataTable, ConfirmDialog, EmptyState } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  sbAdminListSolutions,
  sbAdminGetSolution,
  sbAdminUpdateSolution,
  sbAdminDeleteSolution,
  sbAdminUpdateShare,
  sbAdminListProducts,
  sbAdminSaveProduct,
  sbAdminDeleteProduct,
  sbAdminSaveSettings,
  sbGetSettings,
} from "@/lib/solution-builder.functions";
import { SOLUTION_STATUSES, type SbProduct, type SbSolutionRow } from "@/lib/solution-builder/types";
import { formatMoney } from "@/lib/solution-builder/calc";
import { Link2, Copy, RefreshCw, Ban } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/solution-builder")({
  component: SolutionBuilderAdmin,
});

const TABS = [
  { key: "solutions", label: "客户方案" },
  { key: "products", label: "产品与价格" },
  { key: "settings", label: "参数设置" },
] as const;

type Tab = (typeof TABS)[number]["key"];

function SolutionBuilderAdmin() {
  const [tab, setTab] = useState<Tab>("solutions");
  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader
        title="方案配置中心"
        description="管理客户提交的 IT 方案、产品价格库与全局参数（税率、服务费、免责声明）。"
      />
      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 -mb-px text-sm border-b-2 transition ${tab === t.key ? "border-blue-600 text-blue-700 font-medium" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "solutions" && <SolutionsPanel />}
      {tab === "products" && <ProductsPanel />}
      {tab === "settings" && <SettingsPanel />}
    </div>
  );
}

/* ---------------- Solutions ---------------- */
function SolutionsPanel() {
  const qc = useQueryClient();
  const listFn = useServerFn(sbAdminListSolutions);
  const getFn = useServerFn(sbAdminGetSolution);
  const updFn = useServerFn(sbAdminUpdateSolution);
  const delFn = useServerFn(sbAdminDeleteSolution);
  const shareFn = useServerFn(sbAdminUpdateShare);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);
  const [shareRow, setShareRow] = useState<SbSolutionRow | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const listQ = useQuery({
    queryKey: ["admin-sb-solutions", status, search],
    queryFn: () => listFn({ data: { status: status || undefined, search: search || undefined } }),
  });

  const detailQ = useQuery({
    queryKey: ["admin-sb-solution", viewId],
    queryFn: () => getFn({ data: { id: viewId! } }),
    enabled: !!viewId,
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("已删除"); qc.invalidateQueries({ queryKey: ["admin-sb-solutions"] }); setPending(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  const upd = useMutation({
    mutationFn: (v: { id: string; patch: Partial<SbSolutionRow> }) => updFn({ data: v }),
    onSuccess: () => { toast.success("已更新"); qc.invalidateQueries({ queryKey: ["admin-sb-solutions"] }); qc.invalidateQueries({ queryKey: ["admin-sb-solution", viewId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const share = useMutation({
    mutationFn: (v: { id: string; action: "regenerate" | "revoke" | "set_expiry"; days?: number | null }) => shareFn({ data: v }),
    onSuccess: (res, vars) => {
      const msg = vars.action === "revoke" ? "分享已停用" : vars.action === "regenerate" ? "分享链接已重新生成" : "过期时间已更新";
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ["admin-sb-solutions"] });
      setShareRow((prev) => prev ? { ...prev, share_token: res.token, share_expires_at: res.expires } : prev);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows: SbSolutionRow[] = listQ.data?.rows ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <Label className="text-xs">状态</Label>
          <select className="mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">全部</option>
            {SOLUTION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[220px]">
          <Label className="text-xs">搜索</Label>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="标题 / 客户 / 编号" className="mt-1" />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="暂无方案" description="客户提交或您保存的方案都会显示在这里。" />
      ) : (
        <DataTable<SbSolutionRow>
          columns={[
            { key: "number", header: "编号", cell: (r) => <span className="font-mono text-xs">{r.solution_number}</span> },
            { key: "title", header: "标题", cell: (r) => <span className="font-medium">{r.title}</span> },
            { key: "type", header: "类型", cell: (r) => <span className="text-xs">{r.solution_type}</span> },
            { key: "customer", header: "客户", cell: (r) => (
              <div className="text-xs">
                <div>{r.customer_name || "-"}</div>
                <div className="text-slate-400">{r.customer_email || ""}</div>
              </div>
            ) },
            { key: "total", header: "一次性", cell: (r) => formatMoney(Number(r.one_time_total), r.currency) },
            { key: "status", header: "状态", cell: (r) => (
              <select value={r.status} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                onChange={(e) => upd.mutate({ id: r.id, patch: { status: e.target.value as never } })}>
                {SOLUTION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) },
            { key: "share", header: "分享", cell: (r) => <ShareBadge row={r} onManage={() => setShareRow(r)} /> },
            { key: "created", header: "提交时间", cell: (r) => <span className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</span> },
            { key: "actions", header: "操作", cell: (r) => (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setViewId(r.id)}>查看</Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setPending(r.id)}>删除</Button>
              </div>
            ) },
          ]}
          rows={rows}
          rowKey={(r) => r.id}
        />

      )}

      <Dialog open={!!viewId} onOpenChange={(o) => !o && setViewId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {detailQ.data?.row && <SolutionDetail row={detailQ.data.row} onPatch={(patch) => upd.mutate({ id: detailQ.data!.row!.id, patch })} />}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title="删除方案？"
        description="此操作不可撤销。"
        destructive
        onConfirm={() => { if (pending) del.mutate(pending); }}

      />

      <Dialog open={!!shareRow} onOpenChange={(o) => !o && setShareRow(null)}>
        <DialogContent className="max-w-lg">
          {shareRow && (
            <ShareManager
              row={shareRow}
              busy={share.isPending}
              onAction={(action, days) => share.mutate({ id: shareRow.id, action, days })}
            />
          )}
        </DialogContent>
      </Dialog>
  );
}

function SolutionDetail({ row, onPatch }: { row: SbSolutionRow; onPatch: (patch: Partial<SbSolutionRow>) => void }) {
  const [notes, setNotes] = useState(row.admin_notes ?? "");
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>{row.title}</DialogTitle>
        <DialogDescription>#{row.solution_number} · {row.solution_type}</DialogDescription>
      </DialogHeader>
      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <Field label="客户">{row.customer_name || "-"}</Field>
        <Field label="邮箱">{row.customer_email || "-"}</Field>
        <Field label="电话">{row.customer_phone || "-"}</Field>
        <Field label="城市">{row.customer_city || "-"}</Field>
        <Field label="组织">{row.organization_name || "-"}</Field>
        <Field label="预算">{row.customer_budget || "-"}</Field>
        <Field label="时间">{row.customer_timeline || "-"}</Field>
        <Field label="来源">{row.source}</Field>
      </div>
      {row.customer_notes && <Field label="客户说明"><div className="whitespace-pre-wrap text-slate-700">{row.customer_notes}</div></Field>}

      <div>
        <div className="text-xs font-semibold text-slate-500 mb-1">配置明细 ({row.items.length})</div>
        <div className="rounded-lg border">
          <table className="w-full text-xs">
            <thead className="bg-slate-50"><tr>
              <th className="text-left px-3 py-2">项目</th><th className="text-right px-3 py-2 w-14">数量</th>
              <th className="text-right px-3 py-2 w-24">单价</th><th className="text-right px-3 py-2 w-24">小计</th></tr></thead>
            <tbody>
              {row.items.map((i, idx) => (
                <tr key={i.id + idx} className="border-t">
                  <td className="px-3 py-2">{i.name_zh}<div className="text-slate-400">{i.brand || ""}{i.model ? ` · ${i.model}` : ""}</div></td>
                  <td className="px-3 py-2 text-right">{i.qty}</td>
                  <td className="px-3 py-2 text-right">{formatMoney(i.unit_price, row.currency)}</td>
                  <td className="px-3 py-2 text-right">{formatMoney(i.qty * i.unit_price, row.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <Sum k="小计" v={formatMoney(Number(row.subtotal), row.currency)} />
        <Sum k="服务费" v={formatMoney(Number(row.service_fee), row.currency)} />
        <Sum k="税费" v={formatMoney(Number(row.tax_amount), row.currency)} />
        <Sum k="一次性总价" v={formatMoney(Number(row.one_time_total), row.currency)} highlight />
      </div>

      <div>
        <Label>管理员备注</Label>
        <textarea className="mt-1 w-full min-h-[80px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={() => onPatch({ admin_notes: notes })}>保存备注</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="text-[11px] text-slate-400 uppercase tracking-wider">{label}</div><div className="text-slate-800">{children}</div></div>;
}
function Sum({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return <div className={`rounded-lg border p-2 ${highlight ? "bg-blue-50 border-blue-200" : "bg-slate-50"}`}>
    <div className="text-[11px] text-slate-500">{k}</div>
    <div className={`font-semibold ${highlight ? "text-blue-700" : "text-slate-800"}`}>{v}</div>
  </div>;
}

/* ---------------- Products ---------------- */
function ProductsPanel() {
  const qc = useQueryClient();
  const listFn = useServerFn(sbAdminListProducts);
  const saveFn = useServerFn(sbAdminSaveProduct);
  const delFn = useServerFn(sbAdminDeleteProduct);
  const [cat, setCat] = useState("");
  const [editing, setEditing] = useState<Partial<SbProduct> | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["admin-sb-products", cat],
    queryFn: () => listFn({ data: { category: cat || undefined } }),
  });

  const save = useMutation({
    mutationFn: (v: Partial<SbProduct>) => saveFn({ data: v as never }),
    onSuccess: () => { toast.success("已保存"); qc.invalidateQueries({ queryKey: ["admin-sb-products"] }); setEditing(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("已删除"); qc.invalidateQueries({ queryKey: ["admin-sb-products"] }); setPending(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows: SbProduct[] = q.data?.rows ?? [];
  const categories = useMemo(() => Array.from(new Set(rows.map((r) => r.category))).sort(), [rows]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <Label className="text-xs">分类</Label>
          <select className="mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">全部分类</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="ml-auto">
          <Button onClick={() => setEditing({ category: cat || "pc-cpu", is_visible: true, currency: "USD", list_price: 0, install_fee: 0, sort_order: 0, specs: {}, stock_status: "in_stock", slug: "", name_zh: "", name_en: "" })}>新增产品</Button>
        </div>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="暂无产品" description="点击右上角新增，为不同分类维护价格与规格。" />
      ) : (
        <DataTable<SbProduct>
          columns={[
            { key: "category", header: "分类", cell: (p) => <span className="font-mono text-xs">{p.category}</span> },
            { key: "name", header: "名称", cell: (p) => <div><div className="font-medium">{p.name_zh}</div><div className="text-xs text-slate-400">{p.name_en}</div></div> },
            { key: "brand", header: "品牌", cell: (p) => <span className="text-xs">{p.brand || "-"} {p.model || ""}</span> },
            { key: "price", header: "价格", cell: (p) => <>{formatMoney(Number(p.list_price), p.currency)}</> },
            { key: "stock", header: "库存", cell: (p) => <span className="text-xs">{p.stock_status}</span> },
            { key: "visible", header: "可见", cell: (p) => <>{p.is_visible ? "✓" : "—"}</> },
            { key: "actions", header: "操作", cell: (p) => (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(p)}>编辑</Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setPending(p.id)}>删除</Button>
              </div>
            ) },
          ]}
          rows={rows}
          rowKey={(p) => p.id}
        />
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editing && (
            <ProductForm value={editing} onCancel={() => setEditing(null)} onSave={(v) => save.mutate(v)} saving={save.isPending} />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title="删除产品？"
        destructive
        onConfirm={() => { if (pending) del.mutate(pending); }}

      />
    </div>
  );
}

function ProductForm({ value, onCancel, onSave, saving }: { value: Partial<SbProduct>; onCancel: () => void; onSave: (v: Partial<SbProduct>) => void; saving: boolean }) {
  const [f, setF] = useState<Partial<SbProduct>>(value);
  const [specsText, setSpecsText] = useState<string>(JSON.stringify(value.specs ?? {}, null, 2));
  function set<K extends keyof SbProduct>(k: K, v: SbProduct[K] | number | string | boolean) { setF((s) => ({ ...s, [k]: v })); }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{value.id ? "编辑产品" : "新增产品"}</DialogTitle>
        <DialogDescription>价格保存后立即在前端配置器生效。</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <F label="分类 *"><Input value={f.category ?? ""} onChange={(e) => set("category", e.target.value)} placeholder="pc-cpu, nas-drive..." /></F>
        <F label="Slug *"><Input value={f.slug ?? ""} onChange={(e) => set("slug", e.target.value)} /></F>
        <F label="中文名 *"><Input value={f.name_zh ?? ""} onChange={(e) => set("name_zh", e.target.value)} /></F>
        <F label="英文名 *"><Input value={f.name_en ?? ""} onChange={(e) => set("name_en", e.target.value)} /></F>
        <F label="品牌"><Input value={f.brand ?? ""} onChange={(e) => set("brand", e.target.value)} /></F>
        <F label="型号"><Input value={f.model ?? ""} onChange={(e) => set("model", e.target.value)} /></F>
        <F label="价格 (USD)"><Input type="number" min={0} step={0.01} value={Number(f.list_price ?? 0)} onChange={(e) => set("list_price", Number(e.target.value) || 0)} /></F>
        <F label="安装费"><Input type="number" min={0} step={0.01} value={Number(f.install_fee ?? 0)} onChange={(e) => set("install_fee", Number(e.target.value) || 0)} /></F>
        <F label="货币"><Input value={f.currency ?? "USD"} onChange={(e) => set("currency", e.target.value)} /></F>
        <F label="排序"><Input type="number" value={Number(f.sort_order ?? 0)} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} /></F>
        <F label="库存">
          <select className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm" value={f.stock_status ?? "in_stock"} onChange={(e) => set("stock_status", e.target.value as SbProduct["stock_status"])}>
            <option value="in_stock">in_stock</option>
            <option value="special_order">special_order</option>
            <option value="out_of_stock">out_of_stock</option>
            <option value="discontinued">discontinued</option>
          </select>
        </F>
        <F label="可见">
          <label className="inline-flex items-center gap-2 text-sm mt-2"><input type="checkbox" checked={!!f.is_visible} onChange={(e) => set("is_visible", e.target.checked)} /> 前台显示</label>
        </F>
        <F label="规格 JSON (可选)" className="md:col-span-2">
          <textarea rows={5} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-mono" value={specsText} onChange={(e) => setSpecsText(e.target.value)} />
        </F>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>取消</Button>
        <Button disabled={saving} onClick={() => {
          let specs: Record<string, unknown> = {};
          try { specs = specsText.trim() ? JSON.parse(specsText) : {}; } catch { toast.error("规格 JSON 无法解析"); return; }
          onSave({ ...f, specs, list_price: Number(f.list_price) || 0, install_fee: Number(f.install_fee) || 0, sort_order: Number(f.sort_order) || 0 });
        }}>{saving ? "保存中…" : "保存"}</Button>
      </DialogFooter>
    </>
  );
}

function F({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label className="text-xs">{label}</Label><div className="mt-1">{children}</div></div>;
}

/* ---------------- Settings ---------------- */
function SettingsPanel() {
  const getFn = useServerFn(sbGetSettings);
  const saveFn = useServerFn(sbAdminSaveSettings);
  const q = useQuery({ queryKey: ["sb-settings-admin"], queryFn: () => getFn() });
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: (v: unknown) => saveFn({ data: v as never }),
    onSuccess: () => { toast.success("已保存"); qc.invalidateQueries({ queryKey: ["sb-settings-admin"] }); qc.invalidateQueries({ queryKey: ["sb-settings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const [f, setF] = useState<Record<string, unknown> | null>(null);
  const settings = f ?? (q.data as unknown as Record<string, unknown> | undefined) ?? null;
  if (!settings) return <div className="text-sm text-slate-500">载入中…</div>;
  function set(k: string, v: unknown) { setF({ ...(settings as Record<string, unknown>), [k]: v }); }
  return (
    <div className="max-w-2xl space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <F label="默认货币"><Input value={String(settings.currency)} onChange={(e) => set("currency", e.target.value)} /></F>
        <F label="税率 (0-1)"><Input type="number" step={0.001} min={0} max={1} value={Number(settings.tax_rate)} onChange={(e) => set("tax_rate", Number(e.target.value))} /></F>
        <F label="默认服务费"><Input type="number" min={0} value={Number(settings.default_service_fee)} onChange={(e) => set("default_service_fee", Number(e.target.value))} /></F>
        <F label="毛利率 (0-1)"><Input type="number" step={0.01} min={0} max={1} value={Number(settings.margin_rate)} onChange={(e) => set("margin_rate", Number(e.target.value))} /></F>
        <F label="默认折扣率 (0-1)"><Input type="number" step={0.01} min={0} max={1} value={Number(settings.discount_rate)} onChange={(e) => set("discount_rate", Number(e.target.value))} /></F>
        <F label="报价有效期 (天)"><Input type="number" min={1} max={365} value={Number(settings.proposal_validity_days)} onChange={(e) => set("proposal_validity_days", Number(e.target.value))} /></F>
        <F label="联系邮箱"><Input type="email" value={String(settings.contact_email)} onChange={(e) => set("contact_email", e.target.value)} /></F>
        <F label="联系电话"><Input value={String(settings.contact_phone ?? "")} onChange={(e) => set("contact_phone", e.target.value)} /></F>
        <F label="中文免责声明" className="md:col-span-2"><textarea rows={3} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={String(settings.disclaimer_zh)} onChange={(e) => set("disclaimer_zh", e.target.value)} /></F>
        <F label="英文免责声明" className="md:col-span-2"><textarea rows={3} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={String(settings.disclaimer_en)} onChange={(e) => set("disclaimer_en", e.target.value)} /></F>
      </div>
      <div className="flex justify-end">
        <Button disabled={save.isPending} onClick={() => save.mutate(settings)}>{save.isPending ? "保存中…" : "保存设置"}</Button>
      </div>
    </div>
  );
}
