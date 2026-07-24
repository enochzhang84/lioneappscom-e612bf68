import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2, Eye, Pencil, ExternalLink } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  adminGetPost,
  adminUpsertPost,
  adminDeletePost,
  adminListCategories,
} from "@/lib/blog.functions";

export const Route = createFileRoute("/_authenticated/admin/blog/$id")({
  component: BlogEditor,
});

type LangTab = "zh" | "en";
type StatusV = "draft" | "scheduled" | "published" | "unpublished";

type Draft = {
  id?: string;
  slug: string;
  title_zh: string;
  title_en: string;
  excerpt_zh: string;
  excerpt_en: string;
  content_zh: string;
  content_en: string;
  cover_image: string;
  cover_alt_zh: string;
  cover_alt_en: string;
  category_id: string;
  tagsText: string;
  status: StatusV;
  featured: boolean;
  allow_comments: boolean;
  seo_title_zh: string;
  seo_title_en: string;
  meta_description_zh: string;
  meta_description_en: string;
  og_image_url: string;
  reading_time: number | "";
  published_at: string;
  scheduled_at: string;
  sort_order: number;
};

const EMPTY: Draft = {
  slug: "",
  title_zh: "", title_en: "",
  excerpt_zh: "", excerpt_en: "",
  content_zh: "", content_en: "",
  cover_image: "", cover_alt_zh: "", cover_alt_en: "",
  category_id: "", tagsText: "",
  status: "draft", featured: false, allow_comments: false,
  seo_title_zh: "", seo_title_en: "",
  meta_description_zh: "", meta_description_en: "",
  og_image_url: "", reading_time: "",
  published_at: "", scheduled_at: "",
  sort_order: 0,
};

function estimateReadingTime(text: string) {
  if (!text) return 0;
  // Rough: CJK chars ~ 400/min, latin words ~ 200/min
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const latin = text.replace(/[\u4e00-\u9fff]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(cjk / 400 + latin / 200));
}

function BlogEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetPost);
  const upFn = useServerFn(adminUpsertPost);
  const delFn = useServerFn(adminDeletePost);
  const catFn = useServerFn(adminListCategories);

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [lang, setLang] = useState<LangTab>("zh");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const initialized = useRef(false);

  const cats = useQuery({ queryKey: ["admin", "blog", "cats"], queryFn: () => catFn() });
  const loaded = useQuery({
    queryKey: ["admin", "blog", id],
    queryFn: () => getFn({ data: { id } }),
    enabled: !isNew,
  });

  useEffect(() => {
    if (!isNew && loaded.data && !initialized.current) {
      const r = loaded.data;
      setDraft({
        id: r.id,
        slug: r.slug,
        title_zh: r.title_zh ?? "",
        title_en: r.title_en ?? "",
        excerpt_zh: r.excerpt_zh ?? "",
        excerpt_en: r.excerpt_en ?? "",
        content_zh: r.content_zh ?? "",
        content_en: r.content_en ?? "",
        cover_image: r.cover_image ?? "",
        cover_alt_zh: r.cover_alt_zh ?? "",
        cover_alt_en: r.cover_alt_en ?? "",
        category_id: r.category_id ?? "",
        tagsText: (r.tags ?? []).join(", "),
        status: (r.status as StatusV) ?? "draft",
        featured: r.featured,
        allow_comments: r.allow_comments,
        seo_title_zh: r.seo_title_zh ?? "",
        seo_title_en: r.seo_title_en ?? "",
        meta_description_zh: r.meta_description_zh ?? "",
        meta_description_en: r.meta_description_en ?? "",
        og_image_url: r.og_image_url ?? "",
        reading_time: r.reading_time ?? "",
        published_at: r.published_at ? r.published_at.slice(0, 16) : "",
        scheduled_at: r.scheduled_at ? r.scheduled_at.slice(0, 16) : "",
        sort_order: r.sort_order,
      });
      initialized.current = true;
    }
  }, [loaded.data, isNew]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setDirty(true);
  };

  function autoSlug() {
    if (draft.slug) return;
    const base = draft.title_en || draft.title_zh;
    if (!base) return;
    const s = base
      .toLowerCase()
      .replace(/[^\w\s-\u4e00-\u9fff]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80);
    set("slug", s);
  }

  const readingTime = useMemo(() => {
    if (draft.reading_time) return Number(draft.reading_time);
    return estimateReadingTime(draft.content_zh || draft.content_en);
  }, [draft.reading_time, draft.content_zh, draft.content_en]);

  function toPayload() {
    return {
      id: draft.id,
      slug: draft.slug.trim(),
      title_zh: draft.title_zh.trim() || null,
      title_en: draft.title_en.trim() || null,
      excerpt_zh: draft.excerpt_zh.trim() || null,
      excerpt_en: draft.excerpt_en.trim() || null,
      content_zh: draft.content_zh,
      content_en: draft.content_en,
      cover_image: draft.cover_image.trim() || null,
      cover_alt_zh: draft.cover_alt_zh.trim() || null,
      cover_alt_en: draft.cover_alt_en.trim() || null,
      category_id: draft.category_id || null,
      tags: draft.tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      status: draft.status,
      featured: draft.featured,
      allow_comments: draft.allow_comments,
      seo_title_zh: draft.seo_title_zh.trim() || null,
      seo_title_en: draft.seo_title_en.trim() || null,
      meta_description_zh: draft.meta_description_zh.trim() || null,
      meta_description_en: draft.meta_description_en.trim() || null,
      og_image_url: draft.og_image_url.trim() || null,
      reading_time: draft.reading_time === "" ? readingTime : Number(draft.reading_time),
      published_at: draft.published_at ? new Date(draft.published_at).toISOString() : null,
      scheduled_at: draft.scheduled_at ? new Date(draft.scheduled_at).toISOString() : null,
      sort_order: Number(draft.sort_order) || 0,
    };
  }

  const save = useMutation({
    mutationFn: () => upFn({ data: toPayload() }),
    onSuccess: (res) => {
      toast.success("已保存");
      setDirty(false);
      setSavedAt(new Date());
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

  // Autosave — debounced, only after first manual save (edits an existing row)
  useEffect(() => {
    if (!dirty || isNew || !draft.id) return;
    const t = setTimeout(() => {
      if (draft.slug && (draft.title_zh || draft.title_en)) save.mutate();
    }, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, dirty, isNew]);

  // Warn on unload if dirty
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const canSave = !!draft.slug && !!(draft.title_zh || draft.title_en);

  return (
    <div className="p-6 md:p-8 max-w-[1280px] space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => {
          if (dirty && !confirm("有未保存的更改，确定离开？")) return;
          nav({ to: "/admin/blog" });
        }}>
          <ArrowLeft size={14} className="mr-1" /> 返回列表
        </Button>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">
            {dirty
              ? "有未保存的更改…"
              : savedAt
                ? `已自动保存 · ${savedAt.toLocaleTimeString("zh-CN")}`
                : isNew ? "" : "已保存"}
          </div>
          {!isNew && draft.status === "published" && (
            <Button asChild variant="outline" size="sm">
              <a href={`/blog/${draft.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} className="mr-1" /> 预览线上
              </a>
            </Button>
          )}
          {!isNew && (
            <Button variant="ghost" className="text-red-600" onClick={() => {
              if (confirm("确认删除这篇文章？")) del.mutate();
            }}>
              <Trash2 size={14} className="mr-1" /> 删除
            </Button>
          )}
          <Button onClick={() => save.mutate()} disabled={save.isPending || !canSave}>
            <Save size={14} className="mr-1" /> {save.isPending ? "保存中…" : "保存"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main column */}
        <div className="space-y-4">
          {/* Lang + mode tabs */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex bg-slate-100 rounded-md p-0.5 text-sm">
              <button
                onClick={() => setLang("zh")}
                className={`px-3 py-1.5 rounded ${lang === "zh" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
              >中文</button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1.5 rounded ${lang === "en" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
              >English</button>
            </div>
            <div className="inline-flex bg-slate-100 rounded-md p-0.5 text-xs">
              <button
                onClick={() => setMode("edit")}
                className={`px-3 py-1.5 rounded inline-flex items-center gap-1 ${mode === "edit" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
              ><Pencil size={12} /> 编辑</button>
              <button
                onClick={() => setMode("preview")}
                className={`px-3 py-1.5 rounded inline-flex items-center gap-1 ${mode === "preview" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
              ><Eye size={12} /> 预览</button>
            </div>
            <div className="text-xs text-slate-400 ml-auto">阅读约 {readingTime} 分钟</div>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-medium text-slate-600">
                  标题（{lang === "zh" ? "中文" : "English"}） *
                </Label>
                {lang === "zh" ? (
                  <Input value={draft.title_zh} onChange={(e) => set("title_zh", e.target.value)}
                    onBlur={autoSlug} className="mt-1 text-lg" placeholder="文章标题" />
                ) : (
                  <Input value={draft.title_en} onChange={(e) => set("title_en", e.target.value)}
                    onBlur={autoSlug} className="mt-1 text-lg" placeholder="Article title" />
                )}
              </div>

              <div>
                <Label className="text-xs font-medium text-slate-600">Slug *</Label>
                <Input value={draft.slug} onChange={(e) => set("slug", e.target.value)}
                  className="mt-1 font-mono text-sm" placeholder="how-to-build-a-cms" />
                <div className="text-[11px] text-slate-400 mt-1">链接：/blog/{draft.slug || "..."}</div>
              </div>

              <div>
                <Label className="text-xs font-medium text-slate-600">
                  摘要（{lang === "zh" ? "中文" : "English"}）
                </Label>
                {lang === "zh" ? (
                  <Textarea rows={2} value={draft.excerpt_zh}
                    onChange={(e) => set("excerpt_zh", e.target.value)}
                    maxLength={600} className="mt-1" placeholder="一句话说明这篇文章讲了什么。" />
                ) : (
                  <Textarea rows={2} value={draft.excerpt_en}
                    onChange={(e) => set("excerpt_en", e.target.value)}
                    maxLength={600} className="mt-1" placeholder="One-line description." />
                )}
              </div>

              <div>
                <Label className="text-xs font-medium text-slate-600">
                  正文（{lang === "zh" ? "中文" : "English"}，支持 Markdown）
                </Label>
                {mode === "edit" ? (
                  lang === "zh" ? (
                    <Textarea rows={22} value={draft.content_zh}
                      onChange={(e) => set("content_zh", e.target.value)}
                      className="mt-1 font-mono text-sm leading-relaxed"
                      placeholder="# 标题&#10;&#10;正文段落..." />
                  ) : (
                    <Textarea rows={22} value={draft.content_en}
                      onChange={(e) => set("content_en", e.target.value)}
                      className="mt-1 font-mono text-sm leading-relaxed"
                      placeholder="# Heading&#10;&#10;Body paragraphs..." />
                  )
                ) : (
                  <MarkdownPreview md={lang === "zh" ? draft.content_zh : draft.content_en} />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="text-sm font-semibold text-slate-900">SEO 优化（{lang === "zh" ? "中文" : "English"}）</div>
              <div>
                <Label className="text-xs font-medium text-slate-600">SEO Title</Label>
                {lang === "zh" ? (
                  <Input value={draft.seo_title_zh}
                    onChange={(e) => set("seo_title_zh", e.target.value)}
                    className="mt-1" maxLength={160} placeholder="留空则使用文章标题" />
                ) : (
                  <Input value={draft.seo_title_en}
                    onChange={(e) => set("seo_title_en", e.target.value)}
                    className="mt-1" maxLength={160} placeholder="Leave blank to use article title" />
                )}
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">Meta Description</Label>
                {lang === "zh" ? (
                  <Textarea rows={2} value={draft.meta_description_zh}
                    onChange={(e) => set("meta_description_zh", e.target.value)}
                    maxLength={320} className="mt-1" placeholder="留空则使用摘要" />
                ) : (
                  <Textarea rows={2} value={draft.meta_description_en}
                    onChange={(e) => set("meta_description_en", e.target.value)}
                    maxLength={320} className="mt-1" placeholder="Leave blank to use excerpt" />
                )}
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">封面 alt（{lang === "zh" ? "中文" : "English"}）</Label>
                {lang === "zh" ? (
                  <Input value={draft.cover_alt_zh}
                    onChange={(e) => set("cover_alt_zh", e.target.value)} className="mt-1" />
                ) : (
                  <Input value={draft.cover_alt_en}
                    onChange={(e) => set("cover_alt_en", e.target.value)} className="mt-1" />
                )}
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">社交分享图 URL（可选）</Label>
                <Input value={draft.og_image_url}
                  onChange={(e) => set("og_image_url", e.target.value)}
                  className="mt-1" placeholder="留空则使用封面图" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-medium text-slate-600">状态</Label>
                <Select value={draft.status} onValueChange={(v) => set("status", v as StatusV)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="scheduled">定时发布</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="unpublished">已下线</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {draft.status === "scheduled" && (
                <div>
                  <Label className="text-xs font-medium text-slate-600">定时发布时间</Label>
                  <Input type="datetime-local" value={draft.scheduled_at}
                    onChange={(e) => set("scheduled_at", e.target.value)} className="mt-1" />
                </div>
              )}
              {draft.status === "published" && (
                <div>
                  <Label className="text-xs font-medium text-slate-600">发布时间（可修改）</Label>
                  <Input type="datetime-local" value={draft.published_at}
                    onChange={(e) => set("published_at", e.target.value)} className="mt-1" />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label className="text-sm">置顶推荐</Label>
                <Switch checked={draft.featured} onCheckedChange={(v) => set("featured", v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">允许评论</Label>
                <Switch checked={draft.allow_comments} onCheckedChange={(v) => set("allow_comments", v)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-medium text-slate-600">分类</Label>
                <Select value={draft.category_id || "none"} onValueChange={(v) => set("category_id", v === "none" ? "" : v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="选择分类" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">未分类</SelectItem>
                    {(cats.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name_zh} / {c.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">标签（逗号分隔）</Label>
                <Input value={draft.tagsText}
                  onChange={(e) => set("tagsText", e.target.value)}
                  className="mt-1" placeholder="NAS, Wi-Fi, Home Network" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-medium text-slate-600">封面图 URL</Label>
                <Input value={draft.cover_image}
                  onChange={(e) => set("cover_image", e.target.value)}
                  className="mt-1" placeholder="https://..." />
                {draft.cover_image && (
                  <img src={draft.cover_image} alt="" className="mt-2 w-full rounded border object-cover aspect-video" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-slate-600">阅读时长（分）</Label>
                  <Input type="number" value={draft.reading_time}
                    onChange={(e) => set("reading_time", e.target.value === "" ? "" : Number(e.target.value))}
                    className="mt-1" placeholder={String(readingTime)} />
                </div>
                <div>
                  <Label className="text-xs font-medium text-slate-600">排序</Label>
                  <Input type="number" value={draft.sort_order}
                    onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)}
                    className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MarkdownPreview({ md }: { md: string }) {
  const html = useMemo(() => {
    if (!md) return "<p class='text-slate-400 italic'>暂无内容</p>";
    const raw = marked.parse(md, { async: false, gfm: true }) as string;
    return DOMPurify.sanitize(raw);
  }, [md]);
  return (
    <div
      className="mt-1 min-h-[400px] rounded-md border border-slate-200 bg-white p-6 prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
