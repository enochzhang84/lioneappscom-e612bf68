import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Search, Star, ExternalLink, Copy, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  adminListPosts,
  adminDeletePost,
  adminBulkAction,
  adminDuplicatePost,
  adminListCategories,
  type BlogPost,
  type BlogCategory,
} from "@/lib/blog.functions";

export const Route = createFileRoute("/_authenticated/admin/blog/")({
  component: BlogList,
});

type StatusFilter = "all" | "draft" | "scheduled" | "published" | "unpublished";

function BlogList() {
  const listFn = useServerFn(adminListPosts);
  const delFn = useServerFn(adminDeletePost);
  const bulkFn = useServerFn(adminBulkAction);
  const dupFn = useServerFn(adminDuplicatePost);
  const catFn = useServerFn(adminListCategories);
  const qc = useQueryClient();

  const list = useQuery({ queryKey: ["admin", "blog"], queryFn: () => listFn() });
  const cats = useQuery({ queryKey: ["admin", "blog", "cats"], queryFn: () => catFn() });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [catId, setCatId] = useState<string>("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const catMap = useMemo(() => {
    const m = new Map<string, BlogCategory>();
    (cats.data ?? []).forEach((c) => m.set(c.id, c));
    return m;
  }, [cats.data]);

  const rows = list.data ?? [];
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (catId !== "all" && r.category_id !== catId) return false;
      if (featuredOnly && !r.featured) return false;
      if (!kw) return true;
      return (
        (r.title_zh ?? "").toLowerCase().includes(kw) ||
        (r.title_en ?? "").toLowerCase().includes(kw) ||
        r.slug.toLowerCase().includes(kw)
      );
    });
  }, [rows, q, status, catId, featuredOnly]);

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["admin", "blog"] });
    setSelected(new Set());
  }

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("已删除"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const dup = useMutation({
    mutationFn: (id: string) => dupFn({ data: { id } }),
    onSuccess: () => { toast.success("已复制"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulk = useMutation({
    mutationFn: (action: "publish" | "unpublish" | "delete") =>
      bulkFn({ data: { ids: Array.from(selected), action } }),
    onSuccess: (_, action) => {
      toast.success(action === "delete" ? "已删除" : action === "publish" ? "已发布" : "已下线");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(filtered.map((r) => r.id)) : new Set());
  }
  function toggleOne(id: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    setSelected(next);
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px]">
      <PageHeader
        title="文章中心"
        description="发布公司动态、行业洞察、产品教程与客户故事。已发布的文章会自动出现在 /blog 页面。"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/blog/categories"><Folder size={14} className="mr-1" /> 分类管理</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/blog/$id" params={{ id: "new" }}><Plus size={14} className="mr-1" /> 新建文章</Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索标题 / slug" className="pl-9" />
        </div>
        <select
          value={catId}
          onChange={(e) => setCatId(e.target.value)}
          className="h-9 px-3 text-sm rounded-md border border-slate-200 bg-white"
        >
          <option value="all">全部分类</option>
          {(cats.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name_zh} / {c.name_en}</option>
          ))}
        </select>
        <div className="inline-flex bg-slate-100 rounded-md p-0.5 text-xs">
          {(["all", "published", "draft", "scheduled", "unpublished"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded ${status === s ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
            >
              {s === "all" ? "全部" : s === "published" ? "已发布" : s === "draft" ? "草稿" : s === "scheduled" ? "定时" : "下线"}
            </button>
          ))}
        </div>
        <label className="text-xs text-slate-600 inline-flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />
          仅推荐
        </label>
        <div className="text-xs text-slate-500 ml-auto">共 {filtered.length} 篇</div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <span>已选 {selected.size} 篇</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={() => bulk.mutate("publish")}>批量发布</Button>
            <Button size="sm" variant="outline" onClick={() => bulk.mutate("unpublish")}>批量下线</Button>
            <Button size="sm" variant="destructive" onClick={() => { if (confirm(`删除 ${selected.size} 篇？`)) bulk.mutate("delete"); }}>批量删除</Button>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium w-8">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selected.size === filtered.length}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">标题</th>
                  <th className="px-4 py-3 font-medium">分类</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">语言</th>
                  <th className="px-4 py-3 font-medium">发布时间</th>
                  <th className="px-4 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => {
                  const cat = r.category_id ? catMap.get(r.category_id) : null;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(r.id)}
                          onChange={(e) => toggleOne(r.id, e.target.checked)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 min-w-[220px]">
                          {r.featured && <Star size={12} className="text-amber-500 fill-amber-400 shrink-0" />}
                          <div>
                            <div className="font-medium text-slate-900">{r.title_zh || r.title_en || r.title}</div>
                            {r.title_en && r.title_zh && <div className="text-xs text-slate-400">{r.title_en}</div>}
                            <div className="text-xs text-slate-400">/{r.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {cat ? `${cat.name_zh} / ${cat.name_en}` : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <LangBadge on={!!(r.title_zh && r.content_zh)} label="中" />
                          <LangBadge on={!!(r.title_en && r.content_en)} label="EN" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {r.published_at ? new Date(r.published_at).toLocaleDateString("zh-CN") : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          {r.status === "published" && (
                            <Button asChild size="sm" variant="ghost" title="查看">
                              <a href={`/blog/${r.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink size={14} />
                              </a>
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" title="复制" onClick={() => dup.mutate(r.id)}>
                            <Copy size={14} />
                          </Button>
                          <Button asChild size="sm" variant="ghost" title="编辑">
                            <Link to="/admin/blog/$id" params={{ id: r.id }}><Pencil size={14} /></Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="删除"
                            onClick={() => { if (confirm(`删除《${r.title_zh || r.title_en}》？`)) del.mutate(r.id); }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-slate-400">
                      暂无文章
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    published: { label: "已发布", cls: "bg-green-100 text-green-700" },
    draft: { label: "草稿", cls: "bg-slate-100 text-slate-600" },
    scheduled: { label: "定时", cls: "bg-blue-100 text-blue-700" },
    unpublished: { label: "已下线", cls: "bg-amber-100 text-amber-700" },
    archived: { label: "已归档", cls: "bg-slate-100 text-slate-500" },
  };
  const it = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-600" };
  return <span className={`inline-flex px-2 py-0.5 rounded text-xs ${it.cls}`}>{it.label}</span>;
}

function LangBadge({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${on ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"}`}>
      {label}
    </span>
  );
}
