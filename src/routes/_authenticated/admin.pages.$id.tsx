import { createFileRoute, useNavigate, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminGetPage, adminUpsertPage } from "@/lib/pages-admin.functions";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/pages/$id")({
  component: PageEditor,
});

type PageType = "content" | "tools" | "blank";

type Block =
  | { type: "heading"; text: string; level?: 1 | 2 | 3 }
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; url: string | null; alt?: string }
  | { type: "button"; text: string; href: string; variant?: "primary" | "outline" }
  | { type: "section"; title: string; body: string }
  | { type: "html"; html: string }
  | { type: "tool_card"; title: string; desc: string; href: string; icon?: string };

const BLOCK_LABEL: Record<Block["type"], string> = {
  heading: "标题",
  subheading: "副标题",
  paragraph: "文字段落",
  image: "图片",
  button: "按钮",
  section: "模块区块",
  html: "自定义 HTML",
  tool_card: "工具卡片",
};

function defaultBlock(type: Block["type"]): Block {
  switch (type) {
    case "heading": return { type, text: "", level: 2 };
    case "subheading": return { type, text: "" };
    case "paragraph": return { type, text: "" };
    case "image": return { type, url: null, alt: "" };
    case "button": return { type, text: "点击了解", href: "/", variant: "primary" };
    case "section": return { type, title: "", body: "" };
    case "html": return { type, html: "" };
    case "tool_card": return { type, title: "", desc: "", href: "" };
  }
}

function PageEditor() {
  const { id } = useParams({ from: "/_authenticated/admin/pages/$id" });
  const isNew = id === "new";
  const navigate = useNavigate();
  const get = useServerFn(adminGetPage);
  const upsert = useServerFn(adminUpsertPage);

  const { data: page, isLoading } = useQuery({
    queryKey: ["admin", "page", id],
    queryFn: () => get({ data: { id } }),
    enabled: !isNew,
  });

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [navLabel, setNavLabel] = useState("");
  const [pageType, setPageType] = useState<PageType>("content");
  const [showInNav, setShowInNav] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    if (page) {
      setSlug(page.slug ?? "");
      setTitle(page.title ?? "");
      setNavLabel(page.nav_label ?? "");
      setPageType((page.page_type as PageType) ?? "content");
      setShowInNav(page.show_in_nav ?? true);
      setIsVisible(page.is_visible ?? true);
      setSortOrder(page.sort_order ?? 0);
      setBlocks(Array.isArray(page.content) ? (page.content as Block[]) : []);
    }
  }, [page]);

  const m = useMutation({
    mutationFn: upsert,
    onSuccess: () => { toast.success("已保存"); navigate({ to: "/admin/pages" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  function save(e: React.FormEvent) {
    e.preventDefault();
    m.mutate({
      data: {
        id: isNew ? undefined : id,
        slug, title,
        nav_label: navLabel || title,
        page_type: (pageType || "content") as PageType,
        show_in_nav: showInNav,
        is_visible: isVisible,
        sort_order: sortOrder,
        content: blocks as unknown as Record<string, unknown>[],
      },
    });
  }

  function addBlock(type: Block["type"]) {
    setBlocks([...blocks, defaultBlock(type)]);
  }
  function updateBlock(i: number, patch: Partial<Block>) {
    setBlocks(blocks.map((b, idx) => idx === i ? { ...b, ...patch } as Block : b));
  }
  function removeBlock(i: number) {
    setBlocks(blocks.filter((_, idx) => idx !== i));
  }
  function moveBlock(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const n = [...blocks];
    [n[i], n[j]] = [n[j], n[i]];
    setBlocks(n);
  }

  if (!isNew && isLoading) return <div className="p-8 text-muted-foreground">加载中…</div>;
  if (!isNew && !page) return <div className="p-8 text-muted-foreground">未找到。</div>;

  return (
    <form onSubmit={save} className="p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isNew ? "新增页面" : "编辑页面"}</h1>
        <Button asChild variant="ghost" type="button"><Link to="/admin/pages">← 返回</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>基本信息</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="页面名称（标题）">
              <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="实用工具" />
            </Field>
            <Field label="页面地址 slug">
              <Input value={slug} onChange={e => setSlug(e.target.value)} pattern="[a-z0-9-]+" required placeholder="tools" />
            </Field>
            <Field label="导航名称">
              <Input value={navLabel} onChange={e => setNavLabel(e.target.value)} placeholder="实用工具" />
            </Field>
            <Field label="排序（小的在前）">
              <Input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)} />
            </Field>
            <Field label="页面类型">
              <Select value={pageType} onValueChange={(v) => setPageType((v || "content") as PageType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="content">普通内容页面</SelectItem>
                  <SelectItem value="tools">实用工具页面</SelectItem>
                  <SelectItem value="blank">空白自定义页面</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="text-xs text-muted-foreground self-end">
              最终访问路径为 <code>/p/{slug || "your-slug"}</code>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Switch checked={showInNav} onCheckedChange={setShowInNav} id="nav" />
              <Label htmlFor="nav">显示在主页导航栏</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isVisible} onCheckedChange={setIsVisible} id="vis" />
              <Label htmlFor="vis">页面已启用（可访问）</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>页面内容</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(BLOCK_LABEL) as Block["type"][]).map((t) => (
              <Button key={t} type="button" size="sm" variant="outline" onClick={() => addBlock(t)}>
                <Plus size={14} className="mr-1" />{BLOCK_LABEL[t]}
              </Button>
            ))}
          </div>

          {blocks.length === 0 && (
            <p className="text-sm text-muted-foreground">还没有内容块，点击上方按钮添加。</p>
          )}

          <div className="space-y-3">
            {blocks.map((b, i) => (
              <div key={i} className="rounded-md border border-border p-4 space-y-2 bg-background">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">{BLOCK_LABEL[b.type]}</span>
                  <div className="flex items-center gap-1">
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveBlock(i, -1)} disabled={i === 0}><ArrowUp size={14} /></Button>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1}><ArrowDown size={14} /></Button>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeBlock(i)}><Trash2 size={14} /></Button>
                  </div>
                </div>
                <BlockEditor block={b} onChange={(patch) => updateBlock(i, patch)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={m.isPending}>{m.isPending ? "保存中…" : "保存"}</Button>
        <Button asChild type="button" variant="ghost"><Link to="/admin/pages">取消</Link></Button>
      </div>
    </form>
  );
}

function BlockEditor({ block, onChange }: { block: Block; onChange: (p: Partial<Block>) => void }) {
  switch (block.type) {
    case "heading":
      return (
        <div className="grid gap-2 md:grid-cols-[1fr_120px]">
          <Input placeholder="标题文字" value={block.text} onChange={e => onChange({ text: e.target.value })} />
          <Select value={String(block.level ?? 2)} onValueChange={(v) => onChange({ level: Number(v) as 1|2|3 })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1（大）</SelectItem>
              <SelectItem value="2">H2（中）</SelectItem>
              <SelectItem value="3">H3（小）</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    case "subheading":
      return <Input placeholder="副标题" value={block.text} onChange={e => onChange({ text: e.target.value })} />;
    case "paragraph":
      return <Textarea rows={4} placeholder="段落文字" value={block.text} onChange={e => onChange({ text: e.target.value })} />;
    case "image":
      return (
        <div className="space-y-2">
          <ImageUpload value={block.url} onChange={(v) => onChange({ url: v })} folder="pages" label="图片" />
          <Input placeholder="alt 描述（可选）" value={block.alt ?? ""} onChange={e => onChange({ alt: e.target.value })} />
        </div>
      );
    case "button":
      return (
        <div className="grid gap-2 md:grid-cols-3">
          <Input placeholder="按钮文字" value={block.text} onChange={e => onChange({ text: e.target.value })} />
          <Input placeholder="链接地址" value={block.href} onChange={e => onChange({ href: e.target.value })} />
          <Select value={block.variant ?? "primary"} onValueChange={(v) => onChange({ variant: v as "primary" | "outline" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">主要按钮</SelectItem>
              <SelectItem value="outline">次要按钮</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    case "section":
      return (
        <div className="space-y-2">
          <Input placeholder="区块标题" value={block.title} onChange={e => onChange({ title: e.target.value })} />
          <Textarea rows={4} placeholder="区块内容" value={block.body} onChange={e => onChange({ body: e.target.value })} />
        </div>
      );
    case "html":
      return <Textarea rows={6} className="font-mono text-xs" placeholder="<div>自定义 HTML</div>" value={block.html} onChange={e => onChange({ html: e.target.value })} />;
    case "tool_card":
      return (
        <div className="grid gap-2 md:grid-cols-2">
          <Input placeholder="工具名（如：汇率换算）" value={block.title} onChange={e => onChange({ title: e.target.value })} />
          <Input placeholder="链接（如 /p/currency 或外链）" value={block.href} onChange={e => onChange({ href: e.target.value })} />
          <Textarea className="md:col-span-2" rows={2} placeholder="工具简介" value={block.desc} onChange={e => onChange({ desc: e.target.value })} />
          <Input className="md:col-span-2" placeholder="图标 emoji（可选，如 💱）" value={block.icon ?? ""} onChange={e => onChange({ icon: e.target.value })} />
        </div>
      );
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
