import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { adminGetPost, adminUpsertPost, adminDeletePost } from "@/lib/blog.functions";

export const Route = createFileRoute("/_authenticated/admin/blog/$id")({
  component: BlogEditor,
});

type Draft = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tagsText: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  seo_title: string;
  seo_description: string;
  sort_order: number;
};

const EMPTY: Draft = {
  slug: "", title: "", excerpt: "", content: "", cover_image: "",
  category: "", tagsText: "", status: "draft", featured: false,
  seo_title: "", seo_description: "", sort_order: 0,
};

function BlogEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetPost);
  const upFn = useServerFn(adminUpsertPost);
  const delFn = useServerFn(adminDeletePost);

  const [draft, setDraft] = useState<Draft>(EMPTY);

  const loaded = useQuery({
    queryKey: ["admin", "blog", id],
    queryFn: () => getFn({ data: { id } }),
    enabled: !isNew,
  });

  useEffect(() => {
    if (loaded.data) {
      const r = loaded.data;
      setDraft({
        id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt ?? "",
        content: r.content, cover_image: r.cover_image ?? "",
        category: r.category ?? "", tagsText: (r.tags ?? []).join(", "),
        status: (r.status as Draft["status"]) ?? "draft",
        featured: r.featured, seo_title: r.seo_title ?? "",
        seo_description: r.seo_description ?? "", sort_order: r.sort_order,
      });
    }
  }, [loaded.data]);

  const save = useMutation({
    mutationFn: () => upFn({
      data: {
        id: draft.id,
        slug: draft.slug.trim(),
        title: draft.title.trim(),
        excerpt: draft.excerpt.trim() || null,
        content: draft.content,
        cover_image: draft.cover_image.trim() || null,
        category: draft.category.trim() || null,
        tags: draft.tagsText.split(",").map((t) => t.trim()).filter(Boolean),
        status: draft.status,
        featured: draft.featured,
        seo_title: draft.seo_title.trim() || null,
        seo_description: draft.seo_description.trim() || null,
        sort_order: draft.sort_order,
      },
    }),
    onSuccess: (res) => {
      toast.success("已保存");
      qc.invalidateQueries({ queryKey: ["admin", "blog"] });
      if (isNew && res?.id) nav({ to: "/admin/blog/$id", params: { id: res.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: () => delFn({ data: { id: draft.id! } }),
    onSuccess: () => { toast.success("已删除"); nav({ to: "/admin/blog" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  function autoSlug() {
    if (draft.slug || !draft.title) return;
    const s = draft.title.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
    set("slug", s);
  }

  return (
    <div className="p-6 md:p-8 max-w-[1200px] space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => nav({ to: "/admin/blog" })}>
          <ArrowLeft size={14} className="mr-1" /> 返回列表
        </Button>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="ghost" className="text-red-600" onClick={() => {
              if (confirm("确认删除这篇文章？")) del.mutate();
            }}>
              <Trash2 size={14} className="mr-1" /> 删除
            </Button>
          )}
          <Button onClick={() => save.mutate()} disabled={save.isPending || !draft.title || !draft.slug}>
            <Save size={14} className="mr-1" /> {save.isPending ? "保存中…" : "保存"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-medium text-slate-600">标题 *</Label>
                <Input value={draft.title} onChange={(e) => set("title", e.target.value)}
                  onBlur={autoSlug} className="mt-1 text-lg" placeholder="文章标题" />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">Slug *</Label>
                <Input value={draft.slug} onChange={(e) => set("slug", e.target.value)}
                  className="mt-1 font-mono text-sm" placeholder="how-to-build-a-cms" />
                <div className="text-[11px] text-slate-400 mt-1">链接：/blog/{draft.slug || "..."}</div>
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">摘要</Label>
                <Textarea rows={2} value={draft.excerpt} onChange={(e) => set("excerpt", e.target.value)}
                  maxLength={600} className="mt-1" placeholder="一句话说明这篇文章讲了什么。" />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">内容（支持 Markdown / HTML）</Label>
                <Textarea rows={20} value={draft.content} onChange={(e) => set("content", e.target.value)}
                  className="mt-1 font-mono text-sm" placeholder="# 标题&#10;&#10;正文段落..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="text-sm font-semibold text-slate-900">SEO 优化</div>
              <div>
                <Label className="text-xs font-medium text-slate-600">SEO Title</Label>
                <Input value={draft.seo_title} onChange={(e) => set("seo_title", e.target.value)}
                  className="mt-1" maxLength={160} placeholder="留空则使用文章标题" />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">SEO Description</Label>
                <Textarea rows={2} value={draft.seo_description}
                  onChange={(e) => set("seo_description", e.target.value)}
                  maxLength={320} className="mt-1" placeholder="留空则使用摘要" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-medium text-slate-600">状态</Label>
                <Select value={draft.status} onValueChange={(v) => set("status", v as Draft["status"])}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="archived">已归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">置顶推荐</Label>
                <Switch checked={draft.featured} onCheckedChange={(v) => set("featured", v)} />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">分类</Label>
                <Input value={draft.category} onChange={(e) => set("category", e.target.value)}
                  className="mt-1" placeholder="产品动态 / 行业洞察" />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">标签（英文逗号分隔）</Label>
                <Input value={draft.tagsText} onChange={(e) => set("tagsText", e.target.value)}
                  className="mt-1" placeholder="CMS, Supabase, React" />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">封面图 URL</Label>
                <Input value={draft.cover_image} onChange={(e) => set("cover_image", e.target.value)}
                  className="mt-1" placeholder="https://..." />
                {draft.cover_image && (
                  <img src={draft.cover_image} alt="" className="mt-2 w-full rounded border object-cover aspect-video" />
                )}
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">排序</Label>
                <Input type="number" value={draft.sort_order}
                  onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)}
                  className="mt-1" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
