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
import { Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronRight, Pencil, Copy } from "lucide-react";

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
  const [showInAdminShortcut, setShowInAdminShortcut] = useState(false);
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
            {pageType === "tools" ? (
              <p className="text-sm text-muted-foreground">
                当前是「实用工具页面」。所有一级工具（分类）和它们下面的项目请到下方
                <span className="font-medium text-foreground"> 工具管理 </span>
                区域统一管理。以后新增的一级工具会自动进入「工具管理」，新增项目会自动归属到当前展开的一级工具下。
              </p>
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={m.isPending}>{m.isPending ? "保存中…" : "保存"}</Button>
          <Button asChild type="button" variant="ghost"><Link to="/admin/pages">取消</Link></Button>
        </div>
      </form>

      {!isNew && pageType === "tools" && page && (
        <div id="tools-content-manager" className="scroll-mt-8"><ToolsManager pageId={page.id} /></div>
      )}
      {isNew && pageType === "tools" && (
        <Card>
          <CardHeader><CardTitle>📁 工具管理</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            请先保存页面后，即可在此以树形目录方式统一管理所有一级工具（分类）和它们下面的项目。
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
  title: string; page_title: string | null; subtitle: string | null; icon: string | null;
  description: string | null; content: string | null; html_content: string | null;
  image_url: string | null; video_url: string | null; link_url: string | null;
  external_url: string | null; internal_url: string | null;
  button_text: string | null; button_url: string | null;
  sort_order: number; is_visible: boolean;
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
    onSuccess: () => { refreshCats(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const mCatDel = useMutation({
    mutationFn: delCat,
    onSuccess: () => { toast.success("已删除"); refreshCats(); refreshItems(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const mItem = useMutation({
    mutationFn: upsertItem,
    onSuccess: () => { refreshItems(); },
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
  const [editingCat, setEditingCat] = useState<Record<string, boolean>>({});
  const [editingItem, setEditingItem] = useState<Record<string, boolean>>({});
  const [newCatDraft, setNewCatDraft] = useState<Partial<Category> | null>(null);
  const [newItemDrafts, setNewItemDrafts] = useState<Record<string, Partial<Item>>>({});

  const cats = [...(catsQ.data ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const items = itemsQ.data ?? [];

  function addCategory() {
    setNewCatDraft({ title: "", description: "", icon: "", sort_order: cats.length, is_visible: true });
  }
  function addItemUnder(catId: string) {
    const stamp = Date.now().toString(36);
    const itemsInCat = items.filter(i => i.category_id === catId);
    setOpenCat({ ...openCat, [catId]: true });
    setNewItemDrafts({
      ...newItemDrafts,
      [catId]: {
        slug: `item-${stamp}`,
        title: "未命名项目",
        description: "",
        category_id: catId,
        sort_order: itemsInCat.length,
        is_visible: true,
      },
    });
  }

  function saveCatPatch(c: Category, patchOverride?: Partial<Category>) {
    const merged = { ...c, ...(catDrafts[c.id] ?? {}), ...(patchOverride ?? {}) };
    mCat.mutate({ data: {
      id: c.id, page_id: pageId,
      title: merged.title, description: merged.description ?? "",
      icon: merged.icon ?? "", sort_order: merged.sort_order, is_visible: merged.is_visible,
    } }, { onSuccess: () => {
      if (!patchOverride) toast.success("已保存");
      const n = { ...catDrafts }; delete n[c.id]; setCatDrafts(n);
      setEditingCat((s) => ({ ...s, [c.id]: false }));
    } });
  }

  function moveCategory(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= cats.length) return;
    const a = cats[idx]; const b = cats[j];
    mCat.mutate({ data: { id: a.id, page_id: pageId, title: a.title, description: a.description ?? "", icon: a.icon ?? "", sort_order: b.sort_order, is_visible: a.is_visible } });
    mCat.mutate({ data: { id: b.id, page_id: pageId, title: b.title, description: b.description ?? "", icon: b.icon ?? "", sort_order: a.sort_order, is_visible: b.is_visible } });
  }

  function duplicateCategory(c: Category) {
    mCat.mutate({ data: {
      page_id: pageId,
      title: `${c.title} 副本`,
      description: c.description ?? "",
      icon: c.icon ?? "",
      sort_order: cats.length,
      is_visible: c.is_visible,
    } }, { onSuccess: () => toast.success("已复制类别") });
  }

  type ItemPayload = {
    id?: string; page_id: string; category_id: string | null; slug: string; title: string;
    page_title: string; subtitle: string; icon: string; description: string; content: string;
    html_content: string; image_url: string | null; video_url: string; link_url: string;
    external_url: string; internal_url: string; button_text: string; button_url: string;
    sort_order: number; is_visible: boolean;
  };
  function itemPayload(it: Item, override?: Partial<Item>): ItemPayload {
    const m = { ...it, ...override };
    return {
      id: m.id, page_id: pageId,
      category_id: m.category_id ?? null,
      slug: m.slug, title: m.title,
      page_title: m.page_title ?? "",
      subtitle: m.subtitle ?? "", icon: m.icon ?? "",
      description: m.description ?? "", content: m.content ?? "",
      html_content: m.html_content ?? "",
      image_url: m.image_url ?? null, video_url: m.video_url ?? "",
      link_url: m.link_url ?? "",
      external_url: m.external_url ?? "", internal_url: m.internal_url ?? "",
      button_text: m.button_text ?? "", button_url: m.button_url ?? "",
      sort_order: m.sort_order, is_visible: m.is_visible,
    };
  }

  function saveItemPatch(it: Item) {
    const draft = { ...it, ...(itemDrafts[it.id] ?? {}) } as Item;
    mItem.mutate({ data: itemPayload(draft) }, { onSuccess: () => {
      toast.success("已保存");
      const n = { ...itemDrafts }; delete n[it.id]; setItemDrafts(n);
      setEditingItem((s) => ({ ...s, [it.id]: false }));
    } });
  }

  function moveItem(catItems: Item[], idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= catItems.length) return;
    const a = catItems[idx]; const b = catItems[j];
    mItem.mutate({ data: itemPayload(a, { sort_order: b.sort_order }) });
    mItem.mutate({ data: itemPayload(b, { sort_order: a.sort_order }) });
  }

  function duplicateItem(it: Item) {
    const stamp = Date.now().toString(36);
    const catItems = items.filter(i => i.category_id === it.category_id);
    const cloned: Item = { ...it, id: "" as unknown as string, slug: `${it.slug}-copy-${stamp}`, title: `${it.title} 副本`, sort_order: catItems.length };
    const p = itemPayload(cloned);
    delete (p as { id?: string }).id;
    mItem.mutate({ data: p }, { onSuccess: () => toast.success("已复制项目") });
  }

  const totalItems = items.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>📁 工具管理</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              树形目录管理这个页面下的所有一级工具（分类）及其项目。共 {cats.length} 个一级工具 / {totalItems} 个项目。
              新增的一级工具会自动出现在这里；在某个一级工具下点击「增加新项目」，新项目会自动归属到该工具。
            </p>
          </div>
          <Button type="button" size="sm" onClick={addCategory}>
            <Plus size={14} className="mr-1" /> 增加新类别
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {cats.length === 0 && !newCatDraft && (
          <p className="text-sm text-muted-foreground">还没有一级工具，点击右上角「增加新类别」开始添加（例如：驾照宝典、换算工具、世界时间）。</p>
        )}

        <ul className="space-y-2">
          {cats.map((c, ci) => {
            const draft = { ...c, ...(catDrafts[c.id] ?? {}) } as Category;
            const dirty = Object.keys(catDrafts[c.id] ?? {}).length > 0;
            const isOpen = openCat[c.id] ?? false;
            const isEditing = editingCat[c.id] ?? false;
            const catItems = items
              .filter(i => i.category_id === c.id)
              .sort((a, b) => a.sort_order - b.sort_order);
            return (
              <li key={c.id} className="rounded-md border border-border bg-background">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30">
                  <button type="button" className="flex items-center gap-2 flex-1 text-left"
                    onClick={() => setOpenCat({ ...openCat, [c.id]: !isOpen })}>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="text-lg">{draft.icon || "📁"}</span>
                    <span className="font-medium">{draft.title || "(未命名)"}</span>
                    <span className="text-xs text-muted-foreground">({catItems.length})</span>
                    {!draft.is_visible && <span className="text-xs text-muted-foreground">隐藏</span>}
                  </button>
                  <div className="flex items-center gap-1">
                    <IconBtn title="上移" onClick={() => moveCategory(ci, -1)} disabled={ci === 0}><ArrowUp size={14} /></IconBtn>
                    <IconBtn title="下移" onClick={() => moveCategory(ci, 1)} disabled={ci === cats.length - 1}><ArrowDown size={14} /></IconBtn>
                    <IconBtn title="编辑" onClick={() => { setOpenCat({ ...openCat, [c.id]: true }); setEditingCat({ ...editingCat, [c.id]: !isEditing }); }}><Pencil size={14} /></IconBtn>
                    <IconBtn title="复制" onClick={() => duplicateCategory(c)}><Copy size={14} /></IconBtn>
                    <IconBtn title="删除" onClick={() => { if (confirm(`删除工具「${c.title}」及其下所有项目？`)) mCatDel.mutate({ data: { id: c.id } }); }}><Trash2 size={14} /></IconBtn>
                  </div>
                </div>

                {isOpen && (
                  <div className="p-3 border-t border-border space-y-3">
                    {isEditing && (
                      <div className="rounded border border-border bg-muted/20 p-3 space-y-3">
                        <div className="text-xs uppercase font-medium text-muted-foreground">编辑类别</div>
                        <CategoryFormFields
                          value={draft}
                          onPatch={(p) => setCatDrafts({ ...catDrafts, [c.id]: { ...(catDrafts[c.id] ?? {}), ...p } })}
                        />
                        <div className="flex gap-2">
                          <Button type="button" size="sm" disabled={!dirty || mCat.isPending} onClick={() => saveCatPatch(c)}>保存类别</Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => {
                            const n = { ...catDrafts }; delete n[c.id]; setCatDrafts(n);
                            setEditingCat({ ...editingCat, [c.id]: false });
                          }}>取消</Button>
                        </div>
                      </div>
                    )}

                    <ul className="space-y-2 pl-3 border-l-2 border-border">
                      {catItems.length === 0 && !newItemDrafts[c.id] && (
                        <li className="text-xs text-muted-foreground pl-2">此工具下还没有项目。</li>
                      )}
                      {catItems.map((it, ii) => {
                        const idraft = { ...it, ...(itemDrafts[it.id] ?? {}) } as Item;
                        const iDirty = Object.keys(itemDrafts[it.id] ?? {}).length > 0;
                        const iEditing = editingItem[it.id] ?? false;
                        return (
                          <li key={it.id} className="rounded border border-border bg-background">
                            <div className="flex items-center gap-2 px-3 py-2">
                              <span className="text-muted-foreground select-none">├─</span>
                              <span>{idraft.icon || "📄"}</span>
                              <span className="font-medium text-sm">{idraft.title || "(未命名)"}</span>
                              {!idraft.is_visible && <span className="text-xs text-muted-foreground">隐藏</span>}
                              <div className="ml-auto flex items-center gap-1">
                                <IconBtn title="上移" onClick={() => moveItem(catItems, ii, -1)} disabled={ii === 0}><ArrowUp size={14} /></IconBtn>
                                <IconBtn title="下移" onClick={() => moveItem(catItems, ii, 1)} disabled={ii === catItems.length - 1}><ArrowDown size={14} /></IconBtn>
                                <IconBtn title="编辑" onClick={() => setEditingItem({ ...editingItem, [it.id]: !iEditing })}><Pencil size={14} /></IconBtn>
                                <IconBtn title="复制" onClick={() => duplicateItem(it)}><Copy size={14} /></IconBtn>
                                <IconBtn title="删除" onClick={() => { if (confirm(`删除项目「${it.title}」？`)) mItemDel.mutate({ data: { id: it.id } }); }}><Trash2 size={14} /></IconBtn>
                              </div>
                            </div>
                            {iEditing && (
                              <div className="p-3 border-t border-border space-y-3">
                                <ItemFormFields
                                  value={idraft}
                                  cats={cats}
                                  onPatch={(p) => setItemDrafts({ ...itemDrafts, [it.id]: { ...(itemDrafts[it.id] ?? {}), ...p } })}
                                />
                                <div className="flex gap-2">
                                  <Button type="button" size="sm" disabled={!iDirty || mItem.isPending} onClick={() => saveItemPatch(it)}>保存项目</Button>
                                  <Button type="button" size="sm" variant="ghost" onClick={() => {
                                    const n = { ...itemDrafts }; delete n[it.id]; setItemDrafts(n);
                                    setEditingItem({ ...editingItem, [it.id]: false });
                                  }}>取消</Button>
                                </div>
                              </div>
                            )}
                          </li>
                        );
                      })}
                      {newItemDrafts[c.id] && (
                        <li className="rounded border border-primary/40 bg-background p-3 space-y-3">
                          <div className="text-xs text-primary uppercase font-medium">新项目</div>
                          <ItemFormFields
                            value={newItemDrafts[c.id] as Item}
                            cats={cats}
                            onPatch={(p) => setNewItemDrafts({ ...newItemDrafts, [c.id]: { ...newItemDrafts[c.id], ...p } })}
                          />
                          <div className="flex gap-2">
                            <Button type="button" size="sm" onClick={() => {
                              const d = newItemDrafts[c.id];
                              mItem.mutate({ data: {
                                page_id: pageId, category_id: d.category_id ?? c.id,
                                slug: d.slug ?? "", title: d.title ?? "",
                                page_title: d.page_title ?? "",
                                subtitle: d.subtitle ?? "", icon: d.icon ?? "",
                                description: d.description ?? "",
                                content: d.content ?? "", html_content: d.html_content ?? "",
                                image_url: d.image_url ?? null,
                                video_url: d.video_url ?? "", link_url: d.link_url ?? "",
                                external_url: d.external_url ?? "", internal_url: d.internal_url ?? "",
                                button_text: d.button_text ?? "", button_url: d.button_url ?? "",
                                sort_order: d.sort_order ?? 0, is_visible: d.is_visible ?? true,
                              } }, { onSuccess: () => {
                                toast.success("已创建");
                                const n = { ...newItemDrafts }; delete n[c.id]; setNewItemDrafts(n);
                              } });
                            }}>创建</Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => {
                              const n = { ...newItemDrafts }; delete n[c.id]; setNewItemDrafts(n);
                            }}>取消</Button>
                          </div>
                        </li>
                      )}
                      <li>
                        <Button type="button" size="sm" variant="outline" onClick={() => addItemUnder(c.id)}>
                          <Plus size={14} className="mr-1" /> 增加新项目
                        </Button>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            );
          })}

          {newCatDraft && (
            <li className="rounded-md border border-primary/40 bg-background p-3 space-y-3">
              <div className="text-xs text-primary uppercase font-medium">新类别</div>
              <CategoryFormFields
                value={newCatDraft as Category}
                onPatch={(p) => setNewCatDraft({ ...newCatDraft, ...p })}
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" disabled={!(newCatDraft.title && newCatDraft.title.trim())}
                  onClick={() => mCat.mutate(
                    { data: {
                      page_id: pageId,
                      title: newCatDraft.title ?? "",
                      description: newCatDraft.description ?? "",
                      icon: newCatDraft.icon ?? "",
                      sort_order: newCatDraft.sort_order ?? 0,
                      is_visible: newCatDraft.is_visible ?? true,
                    } },
                    { onSuccess: () => { toast.success("已创建"); setNewCatDraft(null); } },
                  )}>创建</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setNewCatDraft(null)}>取消</Button>
              </div>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

function IconBtn({ children, title, disabled, onClick }: {
  children: React.ReactNode; title?: string; disabled?: boolean; onClick?: () => void;
}) {
  return (
    <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title={title} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  );
}

function CategoryFormFields({ value, onPatch }: { value: Category; onPatch: (p: Partial<Category>) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="类别名称"><Input value={value.title ?? ""} onChange={e => onPatch({ title: e.target.value })} placeholder="驾照考试" /></Field>
      <Field label="图标 emoji"><Input value={value.icon ?? ""} onChange={e => onPatch({ icon: e.target.value })} placeholder="🚗" /></Field>
      <Field label="类别简介"><Input value={value.description ?? ""} onChange={e => onPatch({ description: e.target.value })} placeholder="各类驾照模拟考试" /></Field>
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
          <Field label="所属类别">
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
          <Field label="项目名称"><Input value={value.title ?? ""} onChange={e => onPatch({ title: e.target.value })} placeholder="小型车 C1 考试" /></Field>
          <Field label="项目图标 emoji"><Input value={value.icon ?? ""} onChange={e => onPatch({ icon: e.target.value })} placeholder="🚗" /></Field>
          <Field label="项目简介"><Input value={value.description ?? ""} onChange={e => onPatch({ description: e.target.value })} placeholder="适合普通小型车驾照考试练习" /></Field>
          <Field label="页面链接（留空使用内置详情页）">
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
            <Field label="页面标题（详情页 H1，留空则用项目名称）">
              <Input value={value.page_title ?? ""} onChange={e => onPatch({ page_title: e.target.value })} placeholder="小型车 C1 驾照模拟考试" />
            </Field>
          </div>
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
          <Field label="外部链接（打开新标签）">
            <Input value={value.external_url ?? ""} onChange={e => onPatch({ external_url: e.target.value })} placeholder="https://..." />
          </Field>
          <Field label="内部链接（站内路径）">
            <Input value={value.internal_url ?? ""} onChange={e => onPatch({ internal_url: e.target.value })} placeholder="/p/other-page" />
          </Field>
          <Field label="按钮文字（可选）">
            <Input value={value.button_text ?? ""} onChange={e => onPatch({ button_text: e.target.value })} placeholder="开始练习" />
          </Field>
          <Field label="按钮链接">
            <Input value={value.button_url ?? ""} onChange={e => onPatch({ button_url: e.target.value })} placeholder="https://... 或 /p/..." />
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
