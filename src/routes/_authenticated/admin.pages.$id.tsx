import { createFileRoute, useNavigate, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetPage, adminUpsertPage } from "@/lib/pages-admin.functions";
import {
  adminListCategories, adminUpsertCategory, adminDeleteCategory,
  adminListItems, adminUpsertItem, adminDeleteItem,
} from "@/lib/tools-admin.functions";
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
import { Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from "lucide-react";

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
      const pt = page.page_type as PageType;
      setPageType(pt === "content" || pt === "tools" || pt === "blank" ? pt : "content");
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
    <div className="p-8 space-y-6 max-w-4xl">
      <form onSubmit={save} className="space-y-6">
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
                    <SelectItem value="tools">实用工具页面（左右布局）</SelectItem>
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

      {!isNew && pageType === "tools" && page && (
        <ToolsManager pageId={page.id} />
      )}
      {isNew && pageType === "tools" && (
        <Card>
          <CardHeader><CardTitle>工具页面分类与内容</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            请先保存页面后，即可在此管理项目栏（分类）与内容栏（条目）。
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------- Tools manager ----------------

type Category = {
  id: string; page_id: string; title: string; description: string | null;
  icon: string | null; sort_order: number; is_visible: boolean;
};
type Item = {
  id: string; page_id: string; category_id: string | null; slug: string;
  title: string; subtitle: string | null; icon: string | null;
  description: string | null; content: string | null; html_content: string | null;
  image_url: string | null; video_url: string | null; link_url: string | null;
  button_text: string | null; sort_order: number; is_visible: boolean;
};

function ToolsManager({ pageId }: { pageId: string }) {
  const qc = useQueryClient();
  const listCats = useServerFn(adminListCategories);
  const listItems = useServerFn(adminListItems);
  const upsertCat = useServerFn(adminUpsertCategory);
  const delCat = useServerFn(adminDeleteCategory);
  const upsertItem = useServerFn(adminUpsertItem);
  const delItem = useServerFn(adminDeleteItem);

  const catsQ = useQuery({
    queryKey: ["admin", "tool_cats", pageId],
    queryFn: () => listCats({ data: { page_id: pageId } }) as Promise<Category[]>,
  });
  const itemsQ = useQuery({
    queryKey: ["admin", "tool_items", pageId],
    queryFn: () => listItems({ data: { page_id: pageId } }) as Promise<Item[]>,
  });

  const refreshCats = () => qc.invalidateQueries({ queryKey: ["admin", "tool_cats", pageId] });
  const refreshItems = () => qc.invalidateQueries({ queryKey: ["admin", "tool_items", pageId] });

  const mCat = useMutation({
    mutationFn: upsertCat,
    onSuccess: () => { toast.success("已保存"); refreshCats(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const mCatDel = useMutation({
    mutationFn: delCat,
    onSuccess: () => { toast.success("已删除"); refreshCats(); refreshItems(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const mItem = useMutation({
    mutationFn: upsertItem,
    onSuccess: () => { toast.success("已保存"); refreshItems(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const mItemDel = useMutation({
    mutationFn: delItem,
    onSuccess: () => { toast.success("已删除"); refreshItems(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const [catDrafts, setCatDrafts] = useState<Record<string, Partial<Category>>>({});
  const [itemDrafts, setItemDrafts] = useState<Record<string, Partial<Item>>>({});
  const [openCat, setOpenCat] = useState<Record<string, boolean>>({});
  const [openItem, setOpenItem] = useState<Record<string, boolean>>({});

  const cats = catsQ.data ?? [];
  const items = itemsQ.data ?? [];

  function newCat() {
    const tmpId = `new-${Date.now()}`;
    setCatDrafts({ ...catDrafts, [tmpId]: { title: "", description: "", icon: "", sort_order: cats.length, is_visible: true } });
    setOpenCat({ ...openCat, [tmpId]: true });
  }
  function newItem() {
    const tmpId = `new-${Date.now()}`;
    setItemDrafts({ ...itemDrafts, [tmpId]: { slug: "", title: "", description: "", category_id: cats[0]?.id ?? null, sort_order: items.length, is_visible: true } });
    setOpenItem({ ...openItem, [tmpId]: true });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>工具页面分类与内容</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Categories */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">项目栏（左侧分类）</h3>
            <Button type="button" size="sm" onClick={newCat}><Plus size={14} className="mr-1" /> 添加项目栏</Button>
          </div>
          {cats.length === 0 && Object.keys(catDrafts).length === 0 && (
            <p className="text-sm text-muted-foreground">还没有项目栏。</p>
          )}
          <div className="space-y-2">
            {cats.map((c) => {
              const draft = { ...c, ...(catDrafts[c.id] ?? {}) } as Category;
              const dirty = Object.keys(catDrafts[c.id] ?? {}).length > 0;
              const isOpen = openCat[c.id] ?? false;
              return (
                <div key={c.id} className="rounded-md border border-border bg-background">
                  <button
                    type="button"
                    onClick={() => setOpenCat({ ...openCat, [c.id]: !isOpen })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/40"
                  >
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="text-lg">{draft.icon || "🧰"}</span>
                    <span className="font-medium">{draft.title || "(未命名)"}</span>
                    <span className="ml-auto text-xs text-muted-foreground">排序 {draft.sort_order}</span>
                    {!draft.is_visible && <span className="text-xs text-muted-foreground">隐藏</span>}
                  </button>
                  {isOpen && (
                    <div className="p-3 border-t border-border space-y-3">
                      <CategoryFormFields
                        value={draft}
                        onPatch={(p) => setCatDrafts({ ...catDrafts, [c.id]: { ...(catDrafts[c.id] ?? {}), ...p } })}
                      />
                      <div className="flex gap-2">
                        <Button type="button" size="sm" disabled={!dirty || mCat.isPending}
                          onClick={() => mCat.mutate({ data: { id: c.id, page_id: pageId,
                            title: draft.title, description: draft.description ?? "",
                            icon: draft.icon ?? "", sort_order: draft.sort_order,
                            is_visible: draft.is_visible } },
                            { onSuccess: () => { const n = { ...catDrafts }; delete n[c.id]; setCatDrafts(n); } })}>
                          保存
                        </Button>
                        <Button type="button" size="sm" variant="ghost"
                          onClick={() => { if (confirm(`删除项目栏「${c.title}」及其下所有内容？`)) mCatDel.mutate({ data: { id: c.id } }); }}>
                          <Trash2 size={14} className="mr-1" /> 删除
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {Object.entries(catDrafts).filter(([k]) => k.startsWith("new-")).map(([tmpId, d]) => (
              <div key={tmpId} className="rounded-md border border-primary/40 bg-background p-3 space-y-3">
                <div className="text-xs text-primary uppercase font-medium">新项目栏</div>
                <CategoryFormFields
                  value={d as Category}
                  onPatch={(p) => setCatDrafts({ ...catDrafts, [tmpId]: { ...d, ...p } })}
                />
                <div className="flex gap-2">
                  <Button type="button" size="sm" disabled={!(d.title && d.title.trim())}
                    onClick={() => mCat.mutate(
                      { data: { page_id: pageId, title: d.title ?? "", description: d.description ?? "",
                        icon: d.icon ?? "", sort_order: d.sort_order ?? 0, is_visible: d.is_visible ?? true } },
                      { onSuccess: () => { const n = { ...catDrafts }; delete n[tmpId]; setCatDrafts(n); } },
                    )}>
                    创建
                  </Button>
                  <Button type="button" size="sm" variant="ghost"
                    onClick={() => { const n = { ...catDrafts }; delete n[tmpId]; setCatDrafts(n); }}>
                    取消
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Items */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">内容栏（右侧内容）</h3>
            <Button type="button" size="sm" onClick={newItem} disabled={cats.length === 0}>
              <Plus size={14} className="mr-1" /> 添加内容栏
            </Button>
          </div>
          {cats.length === 0 && <p className="text-xs text-muted-foreground">请先创建一个项目栏。</p>}
          {cats.length > 0 && items.length === 0 && Object.keys(itemDrafts).length === 0 && (
            <p className="text-sm text-muted-foreground">还没有内容。</p>
          )}
          <div className="space-y-2">
            {items.map((it) => {
              const draft = { ...it, ...(itemDrafts[it.id] ?? {}) } as Item;
              const dirty = Object.keys(itemDrafts[it.id] ?? {}).length > 0;
              const isOpen = openItem[it.id] ?? false;
              const cat = cats.find(c => c.id === draft.category_id);
              return (
                <div key={it.id} className="rounded-md border border-border bg-background">
                  <button type="button"
                    onClick={() => setOpenItem({ ...openItem, [it.id]: !isOpen })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/40">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="font-medium">{draft.title || "(未命名)"}</span>
                    <span className="text-xs text-muted-foreground">/ {cat?.title ?? "未分类"}</span>
                    <span className="ml-auto text-xs text-muted-foreground">排序 {draft.sort_order}</span>
                    {!draft.is_visible && <span className="text-xs text-muted-foreground">隐藏</span>}
                  </button>
                  {isOpen && (
                    <div className="p-3 border-t border-border space-y-3">
                      <ItemFormFields
                        value={draft}
                        cats={cats}
                        onPatch={(p) => setItemDrafts({ ...itemDrafts, [it.id]: { ...(itemDrafts[it.id] ?? {}), ...p } })}
                      />
                      <div className="flex gap-2">
                        <Button type="button" size="sm" disabled={!dirty || mItem.isPending}
                          onClick={() => mItem.mutate({ data: { id: it.id, page_id: pageId,
                            category_id: draft.category_id, slug: draft.slug, title: draft.title,
                            subtitle: draft.subtitle ?? "", icon: draft.icon ?? "",
                            description: draft.description ?? "", content: draft.content ?? "",
                            html_content: draft.html_content ?? "",
                            image_url: draft.image_url ?? null, video_url: draft.video_url ?? "",
                            link_url: draft.link_url ?? "", button_text: draft.button_text ?? "",
                            sort_order: draft.sort_order, is_visible: draft.is_visible } },
                            { onSuccess: () => { const n = { ...itemDrafts }; delete n[it.id]; setItemDrafts(n); } })}>
                          保存
                        </Button>
                        <Button type="button" size="sm" variant="ghost"
                          onClick={() => { if (confirm(`删除内容「${it.title}」？`)) mItemDel.mutate({ data: { id: it.id } }); }}>
                          <Trash2 size={14} className="mr-1" /> 删除
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {Object.entries(itemDrafts).filter(([k]) => k.startsWith("new-")).map(([tmpId, d]) => (
              <div key={tmpId} className="rounded-md border border-primary/40 bg-background p-3 space-y-3">
                <div className="text-xs text-primary uppercase font-medium">新内容栏</div>
                <ItemFormFields
                  value={d as Item}
                  cats={cats}
                  onPatch={(p) => setItemDrafts({ ...itemDrafts, [tmpId]: { ...d, ...p } })}
                />
                <div className="flex gap-2">
                  <Button type="button" size="sm"
                    disabled={!(d.title && d.slug && d.category_id)}
                    onClick={() => mItem.mutate(
                      { data: { page_id: pageId, category_id: d.category_id ?? null,
                        slug: d.slug ?? "", title: d.title ?? "",
                        subtitle: d.subtitle ?? "",
                        description: d.description ?? "",
                        content: d.content ?? "", html_content: d.html_content ?? "",
                        image_url: d.image_url ?? null,
                        video_url: d.video_url ?? "", link_url: d.link_url ?? "",
                        button_text: d.button_text ?? "",
                        sort_order: d.sort_order ?? 0, is_visible: d.is_visible ?? true } },
                      { onSuccess: () => { const n = { ...itemDrafts }; delete n[tmpId]; setItemDrafts(n); } },
                    )}>
                    创建
                  </Button>
                  <Button type="button" size="sm" variant="ghost"
                    onClick={() => { const n = { ...itemDrafts }; delete n[tmpId]; setItemDrafts(n); }}>
                    取消
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function CategoryFormFields({ value, onPatch }: { value: Category; onPatch: (p: Partial<Category>) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="项目标题"><Input value={value.title ?? ""} onChange={e => onPatch({ title: e.target.value })} placeholder="驾照考试" /></Field>
      <Field label="图标 emoji"><Input value={value.icon ?? ""} onChange={e => onPatch({ icon: e.target.value })} placeholder="🚗" /></Field>
      <Field label="项目说明"><Input value={value.description ?? ""} onChange={e => onPatch({ description: e.target.value })} placeholder="各类驾照模拟考试" /></Field>
      <Field label="排序"><Input type="number" value={value.sort_order ?? 0} onChange={e => onPatch({ sort_order: parseInt(e.target.value) || 0 })} /></Field>
      <div className="flex items-center gap-3 md:col-span-2">
        <Switch checked={value.is_visible ?? true} onCheckedChange={(v) => onPatch({ is_visible: v })} />
        <Label>显示在前台</Label>
      </div>
    </div>
  );
}

function ItemFormFields({ value, cats, onPatch }: { value: Item; cats: Category[]; onPatch: (p: Partial<Item>) => void }) {
  return (
    <div className="space-y-6">
      {/* 卡片基础信息 */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">卡片基础信息（显示在列表）</div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="所属项目栏">
            <Select value={value.category_id ?? ""} onValueChange={(v) => onPatch({ category_id: v || null })}>
              <SelectTrigger><SelectValue placeholder="选择分类" /></SelectTrigger>
              <SelectContent>
                {cats.map(c => <SelectItem key={c.id} value={c.id}>{c.icon || "🧰"} {c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="slug（详情页地址）">
            <Input value={value.slug ?? ""} onChange={e => onPatch({ slug: e.target.value })} pattern="[a-z0-9-]+" placeholder="c1-exam" />
          </Field>
          <Field label="卡片标题"><Input value={value.title ?? ""} onChange={e => onPatch({ title: e.target.value })} placeholder="小型车 C1 考试" /></Field>
          <Field label="卡片简介"><Input value={value.description ?? ""} onChange={e => onPatch({ description: e.target.value })} placeholder="适合普通小型车驾照考试练习" /></Field>
          <Field label="外部/内部链接（留空使用内置详情页）">
            <Input value={value.link_url ?? ""} onChange={e => onPatch({ link_url: e.target.value })} placeholder="留空使用 /p/{slug}/i/{itemSlug}" />
          </Field>
          <Field label="排序"><Input type="number" value={value.sort_order ?? 0} onChange={e => onPatch({ sort_order: parseInt(e.target.value) || 0 })} /></Field>
          <div className="flex items-center gap-3 md:col-span-2">
            <Switch checked={value.is_visible ?? true} onCheckedChange={(v) => onPatch({ is_visible: v })} />
            <Label>显示在前台</Label>
          </div>
        </div>
      </div>

      {/* 详情页内容 */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
        <div>
          <div className="text-sm font-semibold">📄 编辑页面内容（点击卡片后打开的详情页）</div>
          <div className="text-xs text-muted-foreground mt-1">路径：/p/{"{"}页面slug{"}"}/i/{value.slug || "{item-slug}"}</div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="页面副标题">
              <Input value={value.subtitle ?? ""} onChange={e => onPatch({ subtitle: e.target.value })} placeholder="加州 DMV 驾照考试练习" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="正文（纯文字段落）">
              <Textarea rows={6} value={value.content ?? ""} onChange={e => onPatch({ content: e.target.value })} placeholder="文章正文，可换行..." />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="封面图片">
              <ImageUpload value={value.image_url ?? null} onChange={(v) => onPatch({ image_url: v })} folder="tools" label="上传图片" />
            </Field>
          </div>
          <Field label="视频链接（YouTube/Bilibili 等）">
            <Input value={value.video_url ?? ""} onChange={e => onPatch({ video_url: e.target.value })} placeholder="https://..." />
          </Field>
          <Field label="按钮文字（可选）">
            <Input value={value.button_text ?? ""} onChange={e => onPatch({ button_text: e.target.value })} placeholder="开始练习" />
          </Field>
          <div className="md:col-span-2">
            <Field label="自定义 HTML（进阶，可留空）">
              <Textarea rows={5} className="font-mono text-xs" value={value.html_content ?? ""} onChange={e => onPatch({ html_content: e.target.value })} placeholder="<div>自定义 HTML 内容</div>" />
            </Field>
          </div>
        </div>
      </div>
    </div>
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
