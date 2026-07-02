import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  adminListSeo,
  adminUpsertSeo,
  adminDeleteSeo,
  type SeoMeta,
} from "@/lib/seo.functions";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  component: SeoPage,
});

type Draft = {
  id?: string;
  path: string;
  title: string;
  description: string;
  og_image_url: string;
  canonical_url: string;
  robots: string;
  is_active: boolean;
};

const EMPTY: Draft = {
  path: "/",
  title: "",
  description: "",
  og_image_url: "",
  canonical_url: "",
  robots: "index,follow",
  is_active: true,
};

function fromRow(r: SeoMeta): Draft {
  return {
    id: r.id,
    path: r.path,
    title: r.title ?? "",
    description: r.description ?? "",
    og_image_url: r.og_image_url ?? "",
    canonical_url: r.canonical_url ?? "",
    robots: r.robots,
    is_active: r.is_active,
  };
}

function SeoPage() {
  const listFn = useServerFn(adminListSeo);
  const upFn = useServerFn(adminUpsertSeo);
  const delFn = useServerFn(adminDeleteSeo);
  const qc = useQueryClient();

  const list = useQuery({ queryKey: ["admin", "seo"], queryFn: () => listFn() });

  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);

  const rows = list.data ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.path.toLowerCase().includes(q) ||
        (r.title ?? "").toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q),
    );
  }, [rows, query]);

  const save = useMutation({
    mutationFn: (d: Draft) =>
      upFn({
        data: {
          id: d.id,
          path: d.path.trim(),
          title: d.title.trim() || null,
          description: d.description.trim() || null,
          og_image_url: d.og_image_url.trim() || null,
          canonical_url: d.canonical_url.trim() || null,
          robots: d.robots.trim() || "index,follow",
          is_active: d.is_active,
        },
      }),
    onSuccess: () => {
      toast.success("已保存");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["admin", "seo"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("已删除");
      qc.invalidateQueries({ queryKey: ["admin", "seo"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: (r: SeoMeta) =>
      upFn({ data: { ...fromRow(r), is_active: !r.is_active } as Draft }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "seo"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px]">
      <PageHeader
        title="SEO 管理"
        description="为任意站内路径配置浏览器标题、描述、社交分享图、robots 与 canonical。前台按当前路径匹配并覆盖默认元数据。"
        actions={
          <Button onClick={() => setDraft({ ...EMPTY })}>
            <Plus size={14} className="mr-1" /> 新增规则
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索路径 / 标题 / 描述"
            className="pl-9"
          />
        </div>
        <div className="text-xs text-slate-500">共 {filtered.length} 条</div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">路径</th>
                  <th className="px-4 py-3 font-medium">Title / Description</th>
                  <th className="px-4 py-3 font-medium">Robots</th>
                  <th className="px-4 py-3 font-medium text-center">启用</th>
                  <th className="px-4 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                      还没有 SEO 规则。点击右上方「+ 新增规则」为特定页面覆盖 Title / Description。
                    </td>
                  </tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 align-top">
                    <td className="px-4 py-3">
                      <code className="text-[12px] bg-slate-100 px-1.5 py-0.5 rounded">{r.path}</code>
                    </td>
                    <td className="px-4 py-3 max-w-[520px]">
                      <div className="font-medium text-slate-900 line-clamp-1">
                        {r.title || <span className="text-slate-400">（未设置标题）</span>}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {r.description || "（未设置描述）"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{r.robots}</code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch checked={r.is_active} onCheckedChange={() => toggle.mutate(r)} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button size="sm" variant="ghost" onClick={() => setDraft(fromRow(r))}>
                        <Pencil size={14} className="mr-1" /> 编辑
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => {
                          if (confirm(`删除 SEO 规则「${r.path}」？`)) del.mutate(r.id);
                        }}
                      >
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

      <div className="text-xs text-slate-500 leading-relaxed">
        提示：路径需以 <code className="bg-slate-100 px-1 rounded">/</code> 开头，例如
        <code className="bg-slate-100 px-1 rounded">/about</code>、
        <code className="bg-slate-100 px-1 rounded">/p/tools</code>。留空的字段将使用站点默认值。
        <br />
        Robots 常用取值：<code className="bg-slate-100 px-1 rounded">index,follow</code>、
        <code className="bg-slate-100 px-1 rounded">noindex,nofollow</code>。
      </div>

      {draft && (
        <SeoDrawer
          value={draft}
          onChange={setDraft}
          onClose={() => setDraft(null)}
          onSave={() => save.mutate(draft)}
          saving={save.isPending}
        />
      )}
    </div>
  );
}

function SeoDrawer({
  value,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  value: Draft;
  onChange: (d: Draft) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-6 py-4">
          <div>
            <div className="text-sm text-slate-500">{value.id ? "编辑 SEO 规则" : "新增 SEO 规则"}</div>
            <div className="font-semibold text-slate-900">{value.path || "/"}</div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <Field label="路径 *">
            <Input
              value={value.path}
              onChange={(e) => set("path", e.target.value)}
              placeholder="/about"
            />
          </Field>
          <Field label="Title（浏览器标签 / 搜索结果）">
            <Input
              value={value.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={160}
              placeholder="Lione Apps — 教会与小型企业管理平台"
            />
            <div className="text-[11px] text-slate-400 mt-1">建议 30–60 字符 · 当前 {value.title.length}</div>
          </Field>
          <Field label="Description（Meta 描述）">
            <Textarea
              rows={3}
              value={value.description}
              onChange={(e) => set("description", e.target.value)}
              maxLength={320}
              placeholder="一句话说明这个页面提供什么价值。"
            />
            <div className="text-[11px] text-slate-400 mt-1">建议 80–160 字符 · 当前 {value.description.length}</div>
          </Field>
          <Field label="OG Image URL（社交分享封面）">
            <Input
              value={value.og_image_url}
              onChange={(e) => set("og_image_url", e.target.value)}
              placeholder="https://... 或 /api/public/media/xxx.jpg"
            />
          </Field>
          <Field label="Canonical URL（规范链接）">
            <Input
              value={value.canonical_url}
              onChange={(e) => set("canonical_url", e.target.value)}
              placeholder="https://lioneappscom.lovable.app/about"
            />
          </Field>
          <Field label="Robots">
            <Input
              value={value.robots}
              onChange={(e) => set("robots", e.target.value)}
              placeholder="index,follow"
            />
          </Field>
          <div className="flex items-center gap-3">
            <Switch
              id="seo-active"
              checked={value.is_active}
              onCheckedChange={(v) => set("is_active", v)}
            />
            <Label htmlFor="seo-active">启用此规则</Label>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button onClick={onSave} disabled={saving || !value.path}>
            {saving ? "保存中…" : "保存"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      {children}
    </div>
  );
}
