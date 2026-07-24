// Solution Builder — Product Catalog (P1)
// 品牌 / 分类 / 产品资料库（含成本价、CSV 导入导出、软删除、价格历史）
import { useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DataTable, ConfirmDialog, EmptyState } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  sbAdminListProducts,
  sbAdminSaveProduct,
  sbAdminDeleteProduct,
  sbAdminRestoreProduct,
  sbAdminListBrands,
  sbAdminSaveBrand,
  sbAdminDeleteBrand,
  sbAdminListCategories,
  sbAdminSaveCategory,
  sbAdminDeleteCategory,
  sbAdminPriceHistory,
  sbAdminBulkUpsertProducts,
  sbAdminProductFacets,
} from "@/lib/solution-builder.functions";
import type { SbProduct, SbBrand, SbCategory, SbPriceHistoryRow } from "@/lib/solution-builder/types";
import { formatMoney } from "@/lib/solution-builder/calc";
import { Upload, Download, RotateCcw, History } from "lucide-react";

const SUB_TABS = [
  { key: "products", label: "产品" },
  { key: "brands", label: "品牌" },
  { key: "categories", label: "分类" },
] as const;
type Sub = (typeof SUB_TABS)[number]["key"];

const BUILDER_OPTIONS = [
  { value: "pc", label: "PC 配置器" },
  { value: "nas", label: "NAS 配置器" },
  { value: "home-network", label: "家庭网络" },
  { value: "shared", label: "通用" },
  { value: "service", label: "服务" },
];

export function ProductCatalog() {
  const [sub, setSub] = useState<Sub>("products");
  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b">
        {SUB_TABS.map((t) => (
          <button key={t.key} onClick={() => setSub(t.key)}
            className={`px-3 py-1.5 -mb-px text-xs border-b-2 transition ${sub === t.key ? "border-blue-600 text-blue-700 font-medium" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {sub === "products" && <ProductsSection />}
      {sub === "brands" && <BrandsSection />}
      {sub === "categories" && <CategoriesSection />}
    </div>
  );
}

/* ============== Products ============== */
function ProductsSection() {
  const qc = useQueryClient();
  const listFn = useServerFn(sbAdminListProducts);
  const saveFn = useServerFn(sbAdminSaveProduct);
  const delFn = useServerFn(sbAdminDeleteProduct);
  const restoreFn = useServerFn(sbAdminRestoreProduct);
  const historyFn = useServerFn(sbAdminPriceHistory);
  const bulkFn = useServerFn(sbAdminBulkUpsertProducts);
  const brandsFn = useServerFn(sbAdminListBrands);
  const catsFn = useServerFn(sbAdminListCategories);
  const facetsFn = useServerFn(sbAdminProductFacets);

  const [builderType, setBuilderType] = useState("");
  const [category, setCategory] = useState("");
  const [brandId, setBrandId] = useState("");
  const [generation, setGeneration] = useState("");
  const [socket, setSocket] = useState("");
  const [ddr, setDdr] = useState("");
  const [completeness, setCompleteness] = useState("");
  const [search, setSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [editing, setEditing] = useState<Partial<SbProduct> | null>(null);
  const [pending, setPending] = useState<SbProduct | null>(null);
  const [historyOf, setHistoryOf] = useState<SbProduct | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const brandsQ = useQuery({ queryKey: ["admin-sb-brands"], queryFn: () => brandsFn() });
  const catsQ = useQuery({ queryKey: ["admin-sb-categories"], queryFn: () => catsFn() });
  const facetsQ = useQuery({ queryKey: ["admin-sb-facets"], queryFn: () => facetsFn() });
  const listQ = useQuery({
    queryKey: ["admin-sb-products", builderType, category, brandId, generation, socket, ddr, completeness, search, includeDeleted],
    queryFn: () => listFn({ data: {
      builder_type: builderType || undefined,
      category: category || undefined,
      brand_id: brandId || undefined,
      generation: generation || undefined,
      socket: socket || undefined,
      ddr: ddr || undefined,
      completeness: completeness || undefined,
      search: search || undefined,
      include_deleted: includeDeleted,
    } }),
  });

  const brands: SbBrand[] = brandsQ.data?.rows ?? [];
  const cats: SbCategory[] = (catsQ.data?.rows ?? []) as unknown as SbCategory[];
  const rows: SbProduct[] = listQ.data?.rows ?? [];
  const facets = facetsQ.data ?? { generations: [], sockets: [], memory_types: [], completeness: [] };
  const filteredCats = useMemo(
    () => builderType ? cats.filter((c) => c.builder_type === builderType) : cats,
    [cats, builderType]
  );

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-sb-products"] });
  const save = useMutation({
    mutationFn: (v: Partial<SbProduct>) => saveFn({ data: v as never }),
    onSuccess: () => { toast.success("已保存"); refresh(); setEditing(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (v: { id: string; hard?: boolean }) => delFn({ data: v }),
    onSuccess: () => { toast.success("已删除"); refresh(); setPending(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const restore = useMutation({
    mutationFn: (id: string) => restoreFn({ data: { id } }),
    onSuccess: () => { toast.success("已恢复"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const bulk = useMutation({
    mutationFn: (v: { rows: unknown[] }) => bulkFn({ data: v }),
    onSuccess: (r) => { toast.success(`已导入 ${r.count} 条`); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  function exportCsv() {
    const cols = ["category","slug","name_zh","name_en","brand","model","product_code","sku","builder_types","list_price","cost_price","install_fee","monthly_fee","annual_fee","stock_status","stock_quantity","lead_time_days","warranty_months","is_visible","sort_order","currency"];
    const esc = (v: unknown) => {
      const s = v === null || v === undefined ? "" : Array.isArray(v) ? v.join("|") : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc((r as any)[c])).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sb-products-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importCsv(file: File) {
    const text = await file.text();
    const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) { toast.error("CSV 为空"); return; }
    const parseLine = (line: string) => {
      const out: string[] = []; let cur = ""; let quoted = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (quoted) {
          if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; }
          else if (ch === '"') quoted = false;
          else cur += ch;
        } else {
          if (ch === '"') quoted = true;
          else if (ch === ",") { out.push(cur); cur = ""; }
          else cur += ch;
        }
      }
      out.push(cur); return out;
    };
    const header = parseLine(lines[0]);
    const need = ["category","slug","name_zh","name_en","list_price"];
    for (const n of need) if (!header.includes(n)) { toast.error(`CSV 缺少列：${n}`); return; }
    const numCols = new Set(["list_price","cost_price","install_fee","monthly_fee","annual_fee","stock_quantity","lead_time_days","warranty_months","sort_order"]);
    const boolCols = new Set(["is_visible","is_sample"]);
    const arrCols = new Set(["builder_types","usage_tags"]);
    const parsed: unknown[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = parseLine(lines[i]);
      const row: Record<string, unknown> = {};
      header.forEach((h, idx) => {
        const raw = (cells[idx] ?? "").trim();
        if (raw === "") return;
        if (numCols.has(h)) row[h] = Number(raw) || 0;
        else if (boolCols.has(h)) row[h] = /^(1|true|y|yes|✓)$/i.test(raw);
        else if (arrCols.has(h)) row[h] = raw.split(/[|;,]/).map((s) => s.trim()).filter(Boolean);
        else row[h] = raw;
      });
      // required defaults
      row.specs = row.specs ?? {};
      row.currency = row.currency ?? "USD";
      row.builder_types = row.builder_types ?? [];
      parsed.push(row);
    }
    bulk.mutate({ rows: parsed });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <FieldSm label="Builder">
          <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm" value={builderType} onChange={(e) => { setBuilderType(e.target.value); setCategory(""); }}>
            <option value="">全部</option>
            {BUILDER_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </FieldSm>
        <FieldSm label="分类">
          <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm min-w-[180px]" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">全部</option>
            {filteredCats.map((c) => <option key={c.id} value={c.code}>{c.name_zh} · {c.code}</option>)}
          </select>
        </FieldSm>
        <FieldSm label="品牌">
          <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm min-w-[140px]" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            <option value="">全部</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </FieldSm>
        <FieldSm label="世代">
          <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm min-w-[120px]" value={generation} onChange={(e) => setGeneration(e.target.value)}>
            <option value="">全部</option>
            {facets.generations.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </FieldSm>
        <FieldSm label="Socket">
          <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm min-w-[110px]" value={socket} onChange={(e) => setSocket(e.target.value)}>
            <option value="">全部</option>
            {facets.sockets.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FieldSm>
        <FieldSm label="内存">
          <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm min-w-[90px]" value={ddr} onChange={(e) => setDdr(e.target.value)}>
            <option value="">全部</option>
            {facets.memory_types.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </FieldSm>
        <FieldSm label="完整度">
          <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm min-w-[100px]" value={completeness} onChange={(e) => setCompleteness(e.target.value)}>
            <option value="">全部</option>
            {facets.completeness.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FieldSm>
        <FieldSm label="搜索"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="名称 / 型号 / 编码" className="h-9 min-w-[200px]" /></FieldSm>
        <label className="inline-flex items-center gap-2 text-xs text-slate-600 h-9"><input type="checkbox" checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} /> 显示已删除</label>
        <div className="ml-auto flex gap-2">
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importCsv(f); e.target.value = ""; }} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-1" />导入 CSV</Button>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-1" />导出 CSV</Button>
          <Button size="sm" onClick={() => setEditing({
            category: filteredCats[0]?.code ?? "pc-cpu", is_visible: true, currency: "USD",
            list_price: 0, cost_price: 0, install_fee: 0, monthly_fee: 0, annual_fee: 0,
            sort_order: 0, specs: {}, stock_status: "in_stock",
            builder_types: builderType ? [builderType] : [], usage_tags: [],
            slug: "", name_zh: "", name_en: "",
          })}>新增产品</Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="暂无产品" description="点击右上角新增，或从 CSV 批量导入。" />
      ) : (
        <DataTable<SbProduct>
          columns={[
            { key: "category", header: "分类", cell: (p) => <span className="font-mono text-xs">{p.category}</span> },
            { key: "name", header: "名称", cell: (p) => (
              <div>
                <div className="font-medium">{p.name_zh}{p.deleted_at && <span className="ml-2 text-[10px] text-red-500">已删除</span>}</div>
                <div className="text-xs text-slate-400">{p.name_en}</div>
              </div>
            ) },
            { key: "brand", header: "品牌/型号", cell: (p) => <span className="text-xs">{p.brand || "-"} {p.model || ""}</span> },
            { key: "gen", header: "世代/Socket", cell: (p) => (
              <div className="text-[11px] text-slate-500 leading-tight">
                {p.generation && <div>{p.generation}{p.launch_year ? ` · ${p.launch_year}` : ""}</div>}
                {(p.specs as Record<string, unknown> | null)?.socket ? <div className="font-mono">{String((p.specs as Record<string, unknown>).socket)}</div> : null}
                {(p.specs as Record<string, unknown> | null)?.memory_type ? <div className="text-slate-400">{String((p.specs as Record<string, unknown>).memory_type)}</div> : null}
                {!p.generation && !(p.specs as Record<string, unknown> | null)?.socket && <span>—</span>}
              </div>
            ) },
            { key: "completeness", header: "完整度", cell: (p) => {
              const c = p.data_completeness ?? "stub";
              const color = c === "complete" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : c === "partial" ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-100 text-slate-500 border-slate-200";
              return <span className={`text-[10px] px-1.5 py-0.5 rounded border ${color}`}>{c}</span>;
            } },
            { key: "code", header: "编码/SKU", cell: (p) => <span className="text-[11px] font-mono text-slate-500">{p.product_code || "-"}<br/>{p.sku || ""}</span> },
            { key: "price", header: "标价 / 成本", cell: (p) => (
              <div className="text-xs">
                <div>{formatMoney(Number(p.list_price), p.currency)}</div>
                <div className="text-slate-400">成本 {formatMoney(Number(p.cost_price ?? 0), p.currency)}</div>
              </div>
            ) },
            { key: "recurring", header: "月/年", cell: (p) => (
              <div className="text-[11px] text-slate-500">
                {Number(p.monthly_fee) > 0 && <div>月 {formatMoney(Number(p.monthly_fee), p.currency)}</div>}
                {Number(p.annual_fee) > 0 && <div>年 {formatMoney(Number(p.annual_fee), p.currency)}</div>}
                {!Number(p.monthly_fee) && !Number(p.annual_fee) && <span>—</span>}
              </div>
            ) },
            { key: "builders", header: "Builder", cell: (p) => <span className="text-[11px] text-slate-500">{(p.builder_types ?? []).join(", ") || "-"}</span> },
            { key: "stock", header: "库存", cell: (p) => <span className="text-xs">{p.stock_status}{p.stock_quantity != null ? ` · ${p.stock_quantity}` : ""}</span> },
            { key: "visible", header: "可见", cell: (p) => <>{p.is_visible ? "✓" : "—"}</> },
            { key: "actions", header: "操作", cell: (p) => (
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setEditing(p)}>编辑</Button>
                <Button size="sm" variant="ghost" title="价格历史" onClick={() => setHistoryOf(p)}><History className="h-4 w-4" /></Button>
                {p.deleted_at
                  ? <Button size="sm" variant="ghost" title="恢复" onClick={() => restore.mutate(p.id)}><RotateCcw className="h-4 w-4" /></Button>
                  : <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setPending(p)}>删除</Button>}
              </div>
            ) },
          ]}
          rows={rows}
          rowKey={(p) => p.id}
        />
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          {editing && <ProductForm value={editing} brands={brands} categories={cats} onCancel={() => setEditing(null)} onSave={(v) => save.mutate(v)} saving={save.isPending} />}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title="删除产品？"
        description={pending ? `软删除会保留价格历史。产品 "${pending.name_zh}"。` : ""}
        destructive
        onConfirm={() => { if (pending) del.mutate({ id: pending.id }); }}
      />

      <Dialog open={!!historyOf} onOpenChange={(o) => !o && setHistoryOf(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {historyOf && <PriceHistory product={historyOf} historyFn={historyFn} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PriceHistory({ product, historyFn }: { product: SbProduct; historyFn: (a: { data: { product_id: string } }) => Promise<{ rows: SbPriceHistoryRow[] }> }) {
  const q = useQuery({ queryKey: ["sb-price-history", product.id], queryFn: () => historyFn({ data: { product_id: product.id } }) });
  const rows: SbPriceHistoryRow[] = q.data?.rows ?? [];
  return (
    <>
      <DialogHeader>
        <DialogTitle>价格历史</DialogTitle>
        <DialogDescription>{product.name_zh} · {product.currency}</DialogDescription>
      </DialogHeader>
      {q.isLoading ? <div className="text-sm text-slate-500 py-4">载入中…</div>
        : rows.length === 0 ? <div className="text-sm text-slate-500 py-4">暂无历史记录。</div>
        : (
          <div className="rounded-lg border text-xs">
            <table className="w-full">
              <thead className="bg-slate-50"><tr>
                <th className="text-left px-3 py-2">时间</th>
                <th className="text-left px-3 py-2">字段</th>
                <th className="text-right px-3 py-2">旧值</th>
                <th className="text-right px-3 py-2">新值</th>
              </tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2 text-slate-500">{new Date(r.changed_at).toLocaleString()}</td>
                    <td className="px-3 py-2 font-mono">{r.field}</td>
                    <td className="px-3 py-2 text-right">{r.old_value != null ? formatMoney(Number(r.old_value), r.currency) : "—"}</td>
                    <td className="px-3 py-2 text-right font-medium">{r.new_value != null ? formatMoney(Number(r.new_value), r.currency) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </>
  );
}

function ProductForm({ value, brands, categories, onCancel, onSave, saving }: {
  value: Partial<SbProduct>; brands: SbBrand[]; categories: SbCategory[];
  onCancel: () => void; onSave: (v: Partial<SbProduct>) => void; saving: boolean;
}) {
  const [f, setF] = useState<Partial<SbProduct>>({ ...value, builder_types: value.builder_types ?? [], usage_tags: value.usage_tags ?? [] });
  const [specsText, setSpecsText] = useState<string>(JSON.stringify(value.specs ?? {}, null, 2));
  function set<K extends keyof SbProduct>(k: K, v: SbProduct[K] | number | string | boolean | null | string[]) { setF((s) => ({ ...s, [k]: v as never })); }
  const toggleBuilder = (b: string) => set("builder_types", (f.builder_types ?? []).includes(b) ? (f.builder_types ?? []).filter((x) => x !== b) : [...(f.builder_types ?? []), b]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{value.id ? "编辑产品" : "新增产品"}</DialogTitle>
        <DialogDescription>成本价仅管理员可见，前台与公开 API 不会返回。</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <F label="分类 *">
          <select className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm" value={f.category ?? ""} onChange={(e) => set("category", e.target.value)}>
            <option value="">选择分类</option>
            {categories.map((c) => <option key={c.id} value={c.code}>[{c.builder_type}] {c.name_zh} · {c.code}</option>)}
          </select>
        </F>
        <F label="Slug *"><Input value={f.slug ?? ""} onChange={(e) => set("slug", e.target.value)} /></F>
        <F label="中文名 *"><Input value={f.name_zh ?? ""} onChange={(e) => set("name_zh", e.target.value)} /></F>
        <F label="英文名 *"><Input value={f.name_en ?? ""} onChange={(e) => set("name_en", e.target.value)} /></F>
        <F label="品牌">
          <select className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm" value={f.brand_id ?? ""} onChange={(e) => {
            const id = e.target.value || null;
            const b = brands.find((x) => x.id === id);
            setF((s) => ({ ...s, brand_id: id, brand: b?.name ?? s.brand ?? null }));
          }}>
            <option value="">— 未关联 —</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </F>
        <F label="型号"><Input value={f.model ?? ""} onChange={(e) => set("model", e.target.value)} /></F>
        <F label="产品编码"><Input value={f.product_code ?? ""} onChange={(e) => set("product_code", e.target.value)} placeholder="内部唯一编码" /></F>
        <F label="SKU"><Input value={f.sku ?? ""} onChange={(e) => set("sku", e.target.value)} /></F>
        <F label="标价 (USD)"><Input type="number" min={0} step={0.01} value={Number(f.list_price ?? 0)} onChange={(e) => set("list_price", Number(e.target.value) || 0)} /></F>
        <F label="成本价 🔒（仅内部）"><Input type="number" min={0} step={0.01} value={Number(f.cost_price ?? 0)} onChange={(e) => set("cost_price", Number(e.target.value) || 0)} /></F>
        <F label="安装费"><Input type="number" min={0} step={0.01} value={Number(f.install_fee ?? 0)} onChange={(e) => set("install_fee", Number(e.target.value) || 0)} /></F>
        <F label="月费"><Input type="number" min={0} step={0.01} value={Number(f.monthly_fee ?? 0)} onChange={(e) => set("monthly_fee", Number(e.target.value) || 0)} /></F>
        <F label="年费"><Input type="number" min={0} step={0.01} value={Number(f.annual_fee ?? 0)} onChange={(e) => set("annual_fee", Number(e.target.value) || 0)} /></F>
        <F label="货币"><Input value={f.currency ?? "USD"} onChange={(e) => set("currency", e.target.value)} /></F>
        <F label="排序"><Input type="number" value={Number(f.sort_order ?? 0)} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} /></F>
        <F label="库存状态">
          <select className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm" value={f.stock_status ?? "in_stock"} onChange={(e) => set("stock_status", e.target.value as SbProduct["stock_status"])}>
            <option value="in_stock">in_stock</option>
            <option value="special_order">special_order</option>
            <option value="out_of_stock">out_of_stock</option>
            <option value="discontinued">discontinued</option>
          </select>
        </F>
        <F label="库存数量"><Input type="number" value={f.stock_quantity ?? ""} onChange={(e) => set("stock_quantity", e.target.value === "" ? null : Number(e.target.value))} /></F>
        <F label="供货天数"><Input type="number" value={f.lead_time_days ?? ""} onChange={(e) => set("lead_time_days", e.target.value === "" ? null : Number(e.target.value))} /></F>
        <F label="保修（月）"><Input type="number" value={f.warranty_months ?? ""} onChange={(e) => set("warranty_months", e.target.value === "" ? null : Number(e.target.value))} /></F>
        <F label="生产商链接" className="md:col-span-2"><Input value={f.manufacturer_url ?? ""} onChange={(e) => set("manufacturer_url", e.target.value)} /></F>
        <F label="图片 URL" className="md:col-span-2"><Input value={f.image_url ?? ""} onChange={(e) => set("image_url", e.target.value)} /></F>
        <F label="用于 Builder（可多选）" className="md:col-span-2">
          <div className="flex flex-wrap gap-2 mt-1">
            {BUILDER_OPTIONS.map((b) => (
              <label key={b.value} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border cursor-pointer ${(f.builder_types ?? []).includes(b.value) ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-slate-200 text-slate-600"}`}>
                <input type="checkbox" className="hidden" checked={(f.builder_types ?? []).includes(b.value)} onChange={() => toggleBuilder(b.value)} />
                {b.label}
              </label>
            ))}
          </div>
        </F>
        <F label="用途标签（逗号分隔）" className="md:col-span-2">
          <Input value={(f.usage_tags ?? []).join(", ")} onChange={(e) => set("usage_tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
        </F>
        <F label="中文简介"><Input value={f.short_description_zh ?? ""} onChange={(e) => set("short_description_zh", e.target.value)} /></F>
        <F label="英文简介"><Input value={f.short_description_en ?? ""} onChange={(e) => set("short_description_en", e.target.value)} /></F>
        <F label="世代 (Generation)"><Input value={f.generation ?? ""} onChange={(e) => set("generation", e.target.value)} placeholder="Intel 12th Gen / Ryzen 5000…" /></F>
        <F label="系列 (Series)"><Input value={f.series ?? ""} onChange={(e) => set("series", e.target.value)} placeholder="Core i5 / Ryzen 7…" /></F>
        <F label="架构 (Architecture)"><Input value={f.architecture ?? ""} onChange={(e) => set("architecture", e.target.value)} placeholder="Alder Lake / Zen 3…" /></F>
        <F label="代号 (Codename)"><Input value={f.codename ?? ""} onChange={(e) => set("codename", e.target.value)} /></F>
        <F label="发布年份"><Input type="number" value={f.launch_year ?? ""} onChange={(e) => set("launch_year", e.target.value === "" ? null : Number(e.target.value))} /></F>
        <F label="数据完整度">
          <select className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm" value={f.data_completeness ?? "stub"} onChange={(e) => set("data_completeness", e.target.value as SbProduct["data_completeness"])}>
            <option value="stub">stub（占位）</option>
            <option value="partial">partial（部分）</option>
            <option value="complete">complete（完整）</option>
          </select>
        </F>
        <F label="规格 PDF URL" className="md:col-span-2"><Input value={f.specification_pdf_url ?? ""} onChange={(e) => set("specification_pdf_url", e.target.value)} /></F>
        <F label="可见">
          <label className="inline-flex items-center gap-2 text-sm mt-2"><input type="checkbox" checked={!!f.is_visible} onChange={(e) => set("is_visible", e.target.checked)} /> 前台显示</label>
        </F>
        <F label="示例数据">
          <label className="inline-flex items-center gap-2 text-sm mt-2"><input type="checkbox" checked={!!f.is_sample} onChange={(e) => set("is_sample", e.target.checked)} /> 标记为示例</label>
        </F>
        <F label="规格 JSON" className="md:col-span-2">
          <textarea rows={6} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-mono" value={specsText} onChange={(e) => setSpecsText(e.target.value)} />
        </F>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>取消</Button>
        <Button disabled={saving} onClick={() => {
          let specs: Record<string, unknown> = {};
          try { specs = specsText.trim() ? JSON.parse(specsText) : {}; } catch { toast.error("规格 JSON 无法解析"); return; }
          onSave({
            ...f, specs,
            list_price: Number(f.list_price) || 0,
            cost_price: Number(f.cost_price) || 0,
            install_fee: Number(f.install_fee) || 0,
            monthly_fee: Number(f.monthly_fee) || 0,
            annual_fee: Number(f.annual_fee) || 0,
            sort_order: Number(f.sort_order) || 0,
          });
        }}>{saving ? "保存中…" : "保存"}</Button>
      </DialogFooter>
    </>
  );
}

/* ============== Brands ============== */
function BrandsSection() {
  const qc = useQueryClient();
  const listFn = useServerFn(sbAdminListBrands);
  const saveFn = useServerFn(sbAdminSaveBrand);
  const delFn = useServerFn(sbAdminDeleteBrand);
  const [editing, setEditing] = useState<Partial<SbBrand> | null>(null);
  const [pending, setPending] = useState<SbBrand | null>(null);
  const q = useQuery({ queryKey: ["admin-sb-brands"], queryFn: () => listFn() });
  const save = useMutation({
    mutationFn: (v: Partial<SbBrand>) => saveFn({ data: v as never }),
    onSuccess: () => { toast.success("已保存"); qc.invalidateQueries({ queryKey: ["admin-sb-brands"] }); setEditing(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("已删除"); qc.invalidateQueries({ queryKey: ["admin-sb-brands"] }); setPending(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const rows: SbBrand[] = q.data?.rows ?? [];
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing({ brand_code: "", name: "", is_active: true, sort_order: (rows.at(-1)?.sort_order ?? 0) + 10 })}>新增品牌</Button>
      </div>
      {rows.length === 0 ? <EmptyState title="暂无品牌" /> : (
        <DataTable<SbBrand>
          columns={[
            { key: "code", header: "编码", cell: (b) => <span className="font-mono text-xs">{b.brand_code}</span> },
            { key: "name", header: "名称", cell: (b) => <div><div className="font-medium">{b.name}</div><div className="text-xs text-slate-400">{b.name_en || ""}</div></div> },
            { key: "country", header: "国家", cell: (b) => <span className="text-xs">{b.country || "-"}</span> },
            { key: "site", header: "官网", cell: (b) => b.website_url ? <a href={b.website_url} target="_blank" rel="noreferrer" className="text-blue-600 text-xs underline">链接</a> : <span className="text-xs">-</span> },
            { key: "active", header: "启用", cell: (b) => <>{b.is_active ? "✓" : "—"}</> },
            { key: "sort", header: "排序", cell: (b) => <span className="text-xs">{b.sort_order}</span> },
            { key: "actions", header: "操作", cell: (b) => (
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setEditing(b)}>编辑</Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setPending(b)}>删除</Button>
              </div>
            ) },
          ]}
          rows={rows} rowKey={(b) => b.id} />
      )}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-xl">
          {editing && <BrandForm value={editing} onCancel={() => setEditing(null)} onSave={(v) => save.mutate(v)} saving={save.isPending} />}
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)} title="删除品牌？" description="关联产品会保留但断开品牌引用。" destructive onConfirm={() => { if (pending) del.mutate(pending.id); }} />
    </div>
  );
}

function BrandForm({ value, onCancel, onSave, saving }: { value: Partial<SbBrand>; onCancel: () => void; onSave: (v: Partial<SbBrand>) => void; saving: boolean }) {
  const [f, setF] = useState<Partial<SbBrand>>(value);
  const set = (k: keyof SbBrand, v: unknown) => setF((s) => ({ ...s, [k]: v as never }));
  return (
    <>
      <DialogHeader><DialogTitle>{value.id ? "编辑品牌" : "新增品牌"}</DialogTitle></DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <F label="编码 *"><Input value={f.brand_code ?? ""} onChange={(e) => set("brand_code", e.target.value.toLowerCase())} placeholder="intel, asus…" /></F>
        <F label="显示名 *"><Input value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} /></F>
        <F label="中文名"><Input value={f.name_zh ?? ""} onChange={(e) => set("name_zh", e.target.value)} /></F>
        <F label="英文名"><Input value={f.name_en ?? ""} onChange={(e) => set("name_en", e.target.value)} /></F>
        <F label="国家/地区"><Input value={f.country ?? ""} onChange={(e) => set("country", e.target.value)} /></F>
        <F label="官网"><Input value={f.website_url ?? ""} onChange={(e) => set("website_url", e.target.value)} /></F>
        <F label="Logo URL" className="md:col-span-2"><Input value={f.logo_url ?? ""} onChange={(e) => set("logo_url", e.target.value)} /></F>
        <F label="简介" className="md:col-span-2"><textarea rows={3} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={f.description ?? ""} onChange={(e) => set("description", e.target.value)} /></F>
        <F label="排序"><Input type="number" value={Number(f.sort_order ?? 0)} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} /></F>
        <F label="启用"><label className="inline-flex items-center gap-2 text-sm mt-2"><input type="checkbox" checked={!!f.is_active} onChange={(e) => set("is_active", e.target.checked)} /> 前台可见</label></F>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>取消</Button>
        <Button disabled={saving} onClick={() => onSave({ ...f, sort_order: Number(f.sort_order) || 0 })}>{saving ? "保存中…" : "保存"}</Button>
      </DialogFooter>
    </>
  );
}

/* ============== Categories ============== */
function CategoriesSection() {
  const qc = useQueryClient();
  const listFn = useServerFn(sbAdminListCategories);
  const saveFn = useServerFn(sbAdminSaveCategory);
  const delFn = useServerFn(sbAdminDeleteCategory);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<Partial<SbCategory> | null>(null);
  const [pending, setPending] = useState<SbCategory | null>(null);
  const q = useQuery({ queryKey: ["admin-sb-categories"], queryFn: () => listFn() });
  const save = useMutation({
    mutationFn: (v: Partial<SbCategory>) => saveFn({ data: v as never }),
    onSuccess: () => { toast.success("已保存"); qc.invalidateQueries({ queryKey: ["admin-sb-categories"] }); setEditing(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("已删除"); qc.invalidateQueries({ queryKey: ["admin-sb-categories"] }); setPending(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const rows: SbCategory[] = ((q.data?.rows ?? []) as unknown as SbCategory[]).filter((c) => !filter || c.builder_type === filter);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FieldSm label="Builder">
          <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">全部</option>
            {BUILDER_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </FieldSm>
        <div className="ml-auto">
          <Button size="sm" onClick={() => setEditing({ builder_type: (filter || "pc") as SbCategory["builder_type"], code: "", name_zh: "", name_en: "", is_active: true, sort_order: 0 })}>新增分类</Button>
        </div>
      </div>
      {rows.length === 0 ? <EmptyState title="暂无分类" /> : (
        <DataTable<SbCategory>
          columns={[
            { key: "builder", header: "Builder", cell: (c) => <span className="text-xs font-mono">{c.builder_type}</span> },
            { key: "code", header: "编码", cell: (c) => <span className="font-mono text-xs">{c.code}</span> },
            { key: "name", header: "名称", cell: (c) => <div><div className="font-medium">{c.name_zh}</div><div className="text-xs text-slate-400">{c.name_en}</div></div> },
            { key: "parent", header: "父级", cell: (c) => <span className="text-xs">{c.parent_code || "-"}</span> },
            { key: "active", header: "启用", cell: (c) => <>{c.is_active ? "✓" : "—"}</> },
            { key: "sort", header: "排序", cell: (c) => <span className="text-xs">{c.sort_order}</span> },
            { key: "actions", header: "操作", cell: (c) => (
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setEditing(c)}>编辑</Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setPending(c)}>删除</Button>
              </div>
            ) },
          ]}
          rows={rows} rowKey={(c) => c.id} />
      )}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-xl">
          {editing && <CategoryForm value={editing} onCancel={() => setEditing(null)} onSave={(v) => save.mutate(v)} saving={save.isPending} />}
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)} title="删除分类？" description="产品的 category 字段不会自动清空，请自行调整。" destructive onConfirm={() => { if (pending) del.mutate(pending.id); }} />
    </div>
  );
}

function CategoryForm({ value, onCancel, onSave, saving }: { value: Partial<SbCategory>; onCancel: () => void; onSave: (v: Partial<SbCategory>) => void; saving: boolean }) {
  const [f, setF] = useState<Partial<SbCategory>>(value);
  const set = (k: keyof SbCategory, v: unknown) => setF((s) => ({ ...s, [k]: v as never }));
  return (
    <>
      <DialogHeader><DialogTitle>{value.id ? "编辑分类" : "新增分类"}</DialogTitle></DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <F label="Builder *">
          <select className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm" value={f.builder_type ?? "pc"} onChange={(e) => set("builder_type", e.target.value)}>
            {BUILDER_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </F>
        <F label="编码 *"><Input value={f.code ?? ""} onChange={(e) => set("code", e.target.value.toLowerCase())} placeholder="pc-cpu…" /></F>
        <F label="中文名 *"><Input value={f.name_zh ?? ""} onChange={(e) => set("name_zh", e.target.value)} /></F>
        <F label="英文名 *"><Input value={f.name_en ?? ""} onChange={(e) => set("name_en", e.target.value)} /></F>
        <F label="父级编码"><Input value={f.parent_code ?? ""} onChange={(e) => set("parent_code", e.target.value || null)} /></F>
        <F label="图标"><Input value={f.icon ?? ""} onChange={(e) => set("icon", e.target.value)} /></F>
        <F label="排序"><Input type="number" value={Number(f.sort_order ?? 0)} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} /></F>
        <F label="启用"><label className="inline-flex items-center gap-2 text-sm mt-2"><input type="checkbox" checked={!!f.is_active} onChange={(e) => set("is_active", e.target.checked)} /> 启用</label></F>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>取消</Button>
        <Button disabled={saving} onClick={() => onSave({ ...f, sort_order: Number(f.sort_order) || 0 })}>{saving ? "保存中…" : "保存"}</Button>
      </DialogFooter>
    </>
  );
}

/* ============== shared ============== */
function F({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label className="text-xs">{label}</Label><div className="mt-1">{children}</div></div>;
}
function FieldSm({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-[11px] text-slate-500">{label}</Label><div className="mt-1">{children}</div></div>;
}
