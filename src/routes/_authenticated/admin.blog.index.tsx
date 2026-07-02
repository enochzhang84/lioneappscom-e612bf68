import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Search, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/PageHeader";
import { adminListPosts, adminDeletePost, adminUpsertPost, type BlogPost } from "@/lib/blog.functions";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  component: BlogList,
});

function BlogList() {
  const listFn = useServerFn(adminListPosts);
  const delFn = useServerFn(adminDeletePost);
  const upFn = useServerFn(adminUpsertPost);
  const qc = useQueryClient();

  const list = useQuery({ queryKey: ["admin", "blog"], queryFn: () => listFn() });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published" | "archived">("all");

  const rows = list.data ?? [];
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!kw) return true;
      return (
        r.title.toLowerCase().includes(kw) ||
        r.slug.toLowerCase().includes(kw) ||
        (r.category ?? "").toLowerCase().includes(kw)
      );
    });
  }, [rows, q, status]);

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("已删除"); qc.invalidateQueries({ queryKey: ["admin", "blog"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleFeatured = useMutation({
    mutationFn: (r: BlogPost) => upFn({
      data: {
        id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt, content: r.content,
        cover_image: r.cover_image, category: r.category, tags: r.tags,
        status: r.status as "draft" | "published" | "archived",
        featured: !r.featured, seo_title: r.seo_title, seo_description: r.seo_description,
        published_at: r.published_at, sort_order: r.sort_order,
      },
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px]">
      <PageHeader
        title="文章中心"
        description="发布公司动态、行业洞察、产品教程与客户故事。已发布的文章会自动出现在 /blog 页面。"
        actions={
          <Button asChild>
            <Link to="/admin/blog/$id" params={{ id: "new" }}><Plus size={14} className="mr-1" /> 新建文章</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索标题 / slug / 分类" className="pl-9" />
        </div>
        <div className="inline-flex bg-slate-100 rounded-md p-0.5 text-xs">
          {(["all", "published", "draft", "archived"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded ${status === s ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
            >
              {s === "all" ? "全部" : s === "published" ? "已发布" : s === "draft" ? "草稿" : "已归档"}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 ml-auto">共 {filtered.length} 篇</div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium w-8"></th>
                  <th className="px-4 py-3 font-medium">标题 / Slug</th>
                  <th className="px-4 py-3 font-medium">分类</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">发布时间</th>
                  <th className="px-4 py-3 font-medium">浏览</th>
                  <th className="px-4 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      还没有文章。点击右上方「新建文章」开始写作。
                    </td>
                  </tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 align-top">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleFeatured.mutate(r)}
                        title={r.featured ? "取消置顶" : "置顶推荐"}
                        className={r.featured ? "text-amber-500" : "text-slate-300 hover:text-amber-400"}
                      >
                        <Star size={16} fill={r.featured ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td className="px-4 py-3 max-w-[420px]">
                      <div className="font-medium text-slate-900 line-clamp-1">{r.title}</div>
                      <code className="text-[11px] text-slate-400">/blog/{r.slug}</code>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.category ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {r.published_at ? new Date(r.published_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{r.views}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {r.status === "published" && (
                        <a href={`/blog/${r.slug}`} target="_blank" rel="noreferrer"
                          className="inline-flex text-slate-400 hover:text-slate-700 mr-1 p-1"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <Button size="sm" variant="ghost" asChild>
                        <Link to="/admin/blog/$id" params={{ id: r.id }}>
                          <Pencil size={14} className="mr-1" /> 编辑
                        </Link>
                      </Button>
                      <Button
                        size="sm" variant="ghost" className="text-red-600"
                        onClick={() => { if (confirm(`删除「${r.title}」？`)) del.mutate(r.id); }}
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
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft: "bg-slate-100 text-slate-600 border-slate-200",
    archived: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const label: Record<string, string> = { published: "已发布", draft: "草稿", archived: "已归档" };
  return (
    <span className={`inline-flex text-[11px] px-2 py-0.5 rounded border ${map[status] ?? map.draft}`}>
      {label[status] ?? status}
    </span>
  );
}
