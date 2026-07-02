import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  ExternalLink,
  Wrench,
} from "lucide-react";

import { adminListPages } from "@/lib/pages-admin.functions";
import {
  adminListCategories,
  adminUpsertCategory,
  adminDeleteCategory,
  adminListItems,
  adminUpsertItem,
  adminDeleteItem,
} from "@/lib/tools-admin.functions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/tools/")({
  component: ToolsAdmin,
});

type Category = {
  id: string;
  page_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_visible: boolean;
};
type Item = {
  id: string;
  page_id: string;
  category_id: string | null;
  parent_id: string | null;
  slug: string;
  title: string;
  page_title: string | null;
  subtitle: string | null;
  icon: string | null;
  description: string | null;
  content: string | null;
  html_content: string | null;
  image_url: string | null;
  video_url: string | null;
  link_url: string | null;
  external_url: string | null;
  internal_url: string | null;
  button_text: string | null;
  button_url: string | null;
  sort_order: number;
  is_visible: boolean;
};

type Selection =
  | { kind: "none" }
  | { kind: "category"; id: string }
  | { kind: "item"; id: string };

function ToolsAdmin() {
  const listPages = useServerFn(adminListPages);
  const pagesQ = useQuery({
    queryKey: ["admin", "pages", "tools"],
    queryFn: () => listPages(),
  });
  const toolsPages = useMemo(
    () => (pagesQ.data ?? []).filter((p) => p.page_type === "tools"),
    [pagesQ.data],
  );
  const [pageId, setPageId] = useState<string | null>(null);

  useEffect(() => {
    if (!pageId && toolsPages.length > 0) setPageId(toolsPages[0].id);
  }, [toolsPages, pageId]);

  if (pagesQ.isLoading) {
    return <div className="p-8 text-muted-foreground">加载中…</div>;
  }

  if (toolsPages.length === 0) {
    return (
      <div className="p-8 max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench size={22} /> 工具管理
        </h1>
        <p className="text-muted-foreground">
          还没有「实用工具」类型的页面。请先到
          <Link to="/admin/pages" className="text-primary underline mx-1">页面管理</Link>
          创建一个 <code className="bg-muted px-1 rounded">page_type = 工具页面</code> 的页面（例如 slug 为 <code>tools</code>），
          之后所有一级工具（驾照宝典、汇率换算、世界时间等）都会集中在这里管理。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b border-border bg-background px-6 py-3 flex items-center gap-3">
        <Wrench size={18} className="text-primary" />
        <h1 className="text-lg font-semibold">工具管理</h1>
        {toolsPages.length > 1 && (
          <Select value={pageId ?? ""} onValueChange={setPageId}>
            <SelectTrigger className="w-64 ml-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              {toolsPages.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.title} (/p/{p.slug})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {pageId && (
          <a
            href={`/p/${toolsPages.find((p) => p.id === pageId)?.slug ?? ""}`}
            target="_blank" rel="noreferrer"
            className="ml-auto text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ExternalLink size={12} /> 查看前台
          </a>
        )}
      </div>
      {pageId && <ToolsWorkbench pageId={pageId} />}
    </div>
  );
}

function ToolsWorkbench({ pageId }: { pageId: string }) {
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

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "tool_cats", pageId] });
    qc.invalidateQueries({ queryKey: ["admin", "tool_items", pageId] });
  };

  const mCat = useMutation({ mutationFn: upsertCat, onSuccess: refresh, onError: (e: Error) => toast.error(e.message) });
  const mCatDel = useMutation({ mutationFn: delCat, onSuccess: () => { toast.success("已删除"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const mItem = useMutation({ mutationFn: upsertItem, onSuccess: refresh, onError: (e: Error) => toast.error(e.message) });
  const mItemDel = useMutation({ mutationFn: delItem, onSuccess: () => { toast.success("已删除"); refresh(); }, onError: (e: Error) => toast.error(e.message) });

  const cats = useMemo(() => [...(catsQ.data ?? [])].sort((a, b) => a.sort_order - b.sort_order), [catsQ.data]);
  const items = itemsQ.data ?? [];

  const [openCat, setOpenCat] = useState<Record<string, boolean>>({});
  const [selection, setSelection] = useState<Selection>({ kind: "none" });

  useEffect(() => {
    // auto-select first category when data loads
    if (selection.kind === "none" && cats.length > 0) {
      setSelection({ kind: "category", id: cats[0].id });
      setOpenCat((s) => ({ ...s, [cats[0].id]: true }));
    }
  }, [cats, selection]);

  function addCategory() {
    mCat.mutate(
      {
        data: {
          page_id: pageId,
          title: "新工具分类",
          description: "",
          icon: "📁",
          sort_order: cats.length,
          is_visible: true,
        },
      },
      {
        onSuccess: (r) => {
          toast.success("已创建分类");
          setSelection({ kind: "category", id: r.id });
          setOpenCat((s) => ({ ...s, [r.id]: true }));
        },
      },
    );
  }

  function addItemUnder(catId: string, parentId: string | null = null) {
    const stamp = Date.now().toString(36);
    const siblings = items.filter((i) => i.category_id === catId && (i.parent_id ?? null) === parentId);
    mItem.mutate(
      {
        data: {
          page_id: pageId,
          category_id: catId,
          parent_id: parentId,
          slug: `item-${stamp}`,
          title: parentId ? "未命名子页面" : "未命名工具",
          page_title: "",
          subtitle: "",
          icon: parentId ? "📄" : "🧰",
          description: "",
          content: "",
          html_content: "",
          image_url: null,
          video_url: "",
          link_url: "",
          external_url: "",
          internal_url: "",
          button_text: "",
          button_url: "",
          sort_order: siblings.length,
          is_visible: true,
        },
      },
      {
        onSuccess: (r) => {
          toast.success(parentId ? "已创建子页面" : "已创建工具");
          setOpenCat((s) => ({ ...s, [catId]: true }));
          if (parentId) setOpenItem((s) => ({ ...s, [parentId]: true }));
          setSelection({ kind: "item", id: r.id });
        },
      },
    );
  }

  function moveCategory(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= cats.length) return;
    const a = cats[idx];
    const b = cats[j];
    mCat.mutate({ data: catPayload(a, pageId, { sort_order: b.sort_order }) });
    mCat.mutate({ data: catPayload(b, pageId, { sort_order: a.sort_order }) });
  }
  function moveItem(catItems: Item[], idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= catItems.length) return;
    const a = catItems[idx];
    const b = catItems[j];
    mItem.mutate({ data: itemPayload(a, pageId, { sort_order: b.sort_order }) });
    mItem.mutate({ data: itemPayload(b, pageId, { sort_order: a.sort_order }) });
  }
  function duplicateItem(it: Item) {
    const stamp = Date.now().toString(36);
    const catItems = items.filter((i) => i.category_id === it.category_id);
    const p = itemPayload(it, pageId, { sort_order: catItems.length });
    delete (p as { id?: string }).id;
    p.slug = `${it.slug}-copy-${stamp}`;
    p.title = `${it.title} 副本`;
    mItem.mutate({ data: p }, { onSuccess: () => toast.success("已复制") });
  }

  const selectedCat = selection.kind === "category" ? cats.find((c) => c.id === selection.id) : undefined;
  const selectedItem = selection.kind === "item" ? items.find((i) => i.id === selection.id) : undefined;

  return (
    <div className="flex-1 flex min-h-0">
      {/* LEFT: tree */}
      <aside className="w-72 shrink-0 border-r border-border bg-background flex flex-col">
        <div className="px-3 py-2 border-b border-border flex items-center gap-2">
          <span className="text-sm font-medium flex-1">📦 工具目录</span>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={addCategory}>
            <Plus size={14} className="mr-1" />新分类
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 text-sm">
          {cats.length === 0 && (
            <p className="text-xs text-muted-foreground p-3">
              还没有工具分类，点击右上方「新分类」创建（例如：驾照宝典、汇率换算）。
            </p>
          )}
          <ul className="space-y-0.5">
            {cats.map((c, ci) => {
              const isOpen = openCat[c.id] ?? false;
              const isSel = selection.kind === "category" && selection.id === c.id;
              const catItems = items
                .filter((i) => i.category_id === c.id)
                .sort((a, b) => a.sort_order - b.sort_order);
              return (
                <li key={c.id}>
                  <div
                    className={`group flex items-center gap-1 rounded px-1.5 py-1 cursor-pointer ${isSel ? "bg-accent text-foreground" : "hover:bg-muted/60"}`}
                    onClick={() => setSelection({ kind: "category", id: c.id })}
                  >
                    <button
                      type="button"
                      className="p-0.5 hover:bg-muted rounded"
                      onClick={(e) => { e.stopPropagation(); setOpenCat({ ...openCat, [c.id]: !isOpen }); }}
                    >
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <span className="text-base">{c.icon || "📁"}</span>
                    <span className={`flex-1 truncate ${!c.is_visible ? "text-muted-foreground line-through" : ""}`}>{c.title || "(未命名)"}</span>
                    <span className="text-xs text-muted-foreground">{catItems.length}</span>
                    <div className="hidden group-hover:flex items-center">
                      <button type="button" title="上移" className="p-0.5 hover:bg-muted rounded" onClick={(e) => { e.stopPropagation(); moveCategory(ci, -1); }} disabled={ci === 0}>
                        <ArrowUp size={12} />
                      </button>
                      <button type="button" title="下移" className="p-0.5 hover:bg-muted rounded" onClick={(e) => { e.stopPropagation(); moveCategory(ci, 1); }} disabled={ci === cats.length - 1}>
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <ul className="ml-5 border-l border-border pl-2 mt-0.5 space-y-0.5">
                      {catItems.map((it) => {
                        const iSel = selection.kind === "item" && selection.id === it.id;
                        return (
                          <li
                            key={it.id}
                            className={`flex items-center gap-1 rounded px-1.5 py-1 cursor-pointer text-xs ${iSel ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/60"}`}
                            onClick={() => setSelection({ kind: "item", id: it.id })}
                          >
                            <span>{it.icon || "🧰"}</span>
                            <span className={`flex-1 truncate ${!it.is_visible ? "text-muted-foreground line-through" : ""}`}>{it.title || "(未命名)"}</span>
                          </li>
                        );
                      })}
                      <li>
                        <button
                          type="button"
                          className="w-full text-left text-xs text-muted-foreground hover:text-primary px-1.5 py-1 rounded hover:bg-muted/60"
                          onClick={() => addItemUnder(c.id)}
                        >
                          + 新工具
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* RIGHT: detail */}
      <section className="flex-1 min-w-0 overflow-y-auto bg-muted/20">
        {selection.kind === "none" && (
          <div className="p-10 text-muted-foreground">在左侧选择一个分类或工具进行编辑。</div>
        )}
        {selectedCat && (
          <CategoryPane
            key={selectedCat.id}
            category={selectedCat}
            pageId={pageId}
            items={items.filter((i) => i.category_id === selectedCat.id).sort((a, b) => a.sort_order - b.sort_order)}
            onSave={(patch) => mCat.mutate({ data: catPayload(selectedCat, pageId, patch) }, { onSuccess: () => toast.success("已保存") })}
            onDelete={() => { if (confirm(`删除分类「${selectedCat.title}」及其下所有工具？`)) { mCatDel.mutate({ data: { id: selectedCat.id } }); setSelection({ kind: "none" }); } }}
            onAddItem={() => addItemUnder(selectedCat.id)}
            onSelectItem={(id) => setSelection({ kind: "item", id })}
            onMoveItem={(idx, dir) => moveItem(items.filter((i) => i.category_id === selectedCat.id).sort((a, b) => a.sort_order - b.sort_order), idx, dir)}
            onDeleteItem={(id, title) => { if (confirm(`删除工具「${title}」？`)) mItemDel.mutate({ data: { id } }); }}
            onDuplicateItem={duplicateItem}
          />
        )}
        {selectedItem && (
          <ItemPane
            key={selectedItem.id}
            item={selectedItem}
            cats={cats}
            pageSlug={""}
            onSave={(patch) => mItem.mutate({ data: itemPayload(selectedItem, pageId, patch) }, { onSuccess: () => toast.success("已保存") })}
            onDelete={() => { if (confirm(`删除工具「${selectedItem.title}」？`)) { mItemDel.mutate({ data: { id: selectedItem.id } }); setSelection({ kind: "category", id: selectedItem.category_id ?? "" }); } }}
          />
        )}
      </section>
    </div>
  );
}

function catPayload(c: Category, pageId: string, override?: Partial<Category>) {
  const m = { ...c, ...override };
  return {
    id: m.id,
    page_id: pageId,
    title: m.title,
    description: m.description ?? "",
    icon: m.icon ?? "",
    sort_order: m.sort_order,
    is_visible: m.is_visible,
  };
}

type ItemPayloadT = {
  id?: string;
  page_id: string;
  category_id: string | null;
  parent_id: string | null;
  slug: string; title: string; page_title: string; subtitle: string;
  icon: string; description: string; content: string; html_content: string;
  image_url: string | null; video_url: string; link_url: string;
  external_url: string; internal_url: string; button_text: string; button_url: string;
  sort_order: number; is_visible: boolean;
};
function itemPayload(it: Item, pageId: string, override?: Partial<Item>): ItemPayloadT {
  const m = { ...it, ...override };
  return {
    id: m.id, page_id: pageId,
    category_id: m.category_id ?? null,
    parent_id: m.parent_id ?? null,
    slug: m.slug, title: m.title,
    page_title: m.page_title ?? "",
    subtitle: m.subtitle ?? "",
    icon: m.icon ?? "",
    description: m.description ?? "",
    content: m.content ?? "",
    html_content: m.html_content ?? "",
    image_url: m.image_url ?? null,
    video_url: m.video_url ?? "",
    link_url: m.link_url ?? "",
    external_url: m.external_url ?? "",
    internal_url: m.internal_url ?? "",
    button_text: m.button_text ?? "",
    button_url: m.button_url ?? "",
    sort_order: m.sort_order,
    is_visible: m.is_visible,
  };
}

/* ---------------- Category detail ---------------- */

function CategoryPane({
  category, pageId, items,
  onSave, onDelete, onAddItem, onSelectItem, onMoveItem, onDeleteItem, onDuplicateItem,
}: {
  category: Category;
  pageId: string;
  items: Item[];
  onSave: (patch: Partial<Category>) => void;
  onDelete: () => void;
  onAddItem: () => void;
  onSelectItem: (id: string) => void;
  onMoveItem: (idx: number, dir: -1 | 1) => void;
  onDeleteItem: (id: string, title: string) => void;
  onDuplicateItem: (it: Item) => void;
}) {
  const [draft, setDraft] = useState(category);
  useEffect(() => setDraft(category), [category]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(category);
  void pageId;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground uppercase mb-1">工具分类</div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>{draft.icon || "📁"}</span>{draft.title || "(未命名)"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 size={14} className="mr-1" />删除分类
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-5 space-y-4">
        <div className="text-sm font-semibold">分类信息</div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="分类名称"><Input value={draft.title ?? ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="驾照宝典" /></Field>
          <Field label="图标 emoji"><Input value={draft.icon ?? ""} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} placeholder="🚗" /></Field>
          <Field label="简介"><Input value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="各类驾照模拟考试" /></Field>
          <Field label="排序（小的在前）"><Input type="number" value={draft.sort_order ?? 0} onChange={(e) => setDraft({ ...draft, sort_order: parseInt(e.target.value) || 0 })} /></Field>
          <div className="flex items-center gap-3 md:col-span-2">
            <Switch checked={draft.is_visible} onCheckedChange={(v) => setDraft({ ...draft, is_visible: v })} />
            <Label>显示在前台</Label>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" disabled={!dirty} onClick={() => onSave(draft)}>保存</Button>
          {dirty && <Button size="sm" variant="ghost" onClick={() => setDraft(category)}>取消</Button>}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="text-sm font-semibold">此分类下的工具（{items.length}）</div>
          <Button size="sm" onClick={onAddItem}><Plus size={14} className="mr-1" />新工具</Button>
        </div>
        {items.length === 0 ? (
          <div className="px-5 py-8 text-sm text-muted-foreground text-center">
            还没有工具，点击「新工具」创建。
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((it, i) => (
              <li key={it.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40">
                <span className="text-xl">{it.icon || "🧰"}</span>
                <button type="button" className="flex-1 text-left" onClick={() => onSelectItem(it.id)}>
                  <div className="font-medium">{it.title || "(未命名)"}</div>
                  {it.description && <div className="text-xs text-muted-foreground line-clamp-1">{it.description}</div>}
                </button>
                {!it.is_visible && <span className="text-xs text-muted-foreground">隐藏</span>}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="上移" onClick={() => onMoveItem(i, -1)} disabled={i === 0}><ArrowUp size={14} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="下移" onClick={() => onMoveItem(i, 1)} disabled={i === items.length - 1}><ArrowDown size={14} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="复制" onClick={() => onDuplicateItem(it)}><Copy size={14} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="删除" onClick={() => onDeleteItem(it.id, it.title)}><Trash2 size={14} /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------- Item detail ---------------- */

function ItemPane({
  item, cats, pageSlug, onSave, onDelete,
}: {
  item: Item;
  cats: Category[];
  pageSlug: string;
  onSave: (patch: Partial<Item>) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(item);
  useEffect(() => setDraft(item), [item]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(item);
  void pageSlug;

  function patch(p: Partial<Item>) { setDraft({ ...draft, ...p }); }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground uppercase mb-1">工具</div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>{draft.icon || "🧰"}</span>{draft.title || "(未命名)"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" disabled={!dirty} onClick={() => onSave(draft)}>保存</Button>
          {dirty && <Button size="sm" variant="ghost" onClick={() => setDraft(item)}>取消</Button>}
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 size={14} className="mr-1" />删除
          </Button>
        </div>
      </div>

      <Section title="卡片信息（列表页显示）">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="所属分类">
            <Select value={draft.category_id ?? ""} onValueChange={(v) => patch({ category_id: v || null })}>
              <SelectTrigger><SelectValue placeholder="选择分类" /></SelectTrigger>
              <SelectContent>
                {cats.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.icon || "📁"} {c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="slug（详情页地址）">
            <Input value={draft.slug ?? ""} onChange={(e) => patch({ slug: e.target.value })} pattern="[a-z0-9-]+" placeholder="c1-exam" />
          </Field>
          <Field label="标题"><Input value={draft.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="小型车 C1 模拟考试" /></Field>
          <Field label="图标 emoji"><Input value={draft.icon ?? ""} onChange={(e) => patch({ icon: e.target.value })} placeholder="🚗" /></Field>
          <div className="md:col-span-2">
            <Field label="简介（卡片描述）">
              <Input value={draft.description ?? ""} onChange={(e) => patch({ description: e.target.value })} placeholder="加州 DMV 驾照模拟考试" />
            </Field>
          </div>
          <Field label="卡片跳转链接（留空则打开内置详情页）">
            <Input value={draft.link_url ?? ""} onChange={(e) => patch({ link_url: e.target.value })} placeholder="留空 / http://... / app:drive-c1" />
          </Field>
          <Field label="排序"><Input type="number" value={draft.sort_order ?? 0} onChange={(e) => patch({ sort_order: parseInt(e.target.value) || 0 })} /></Field>
          <div className="flex items-center gap-3 md:col-span-2">
            <Switch checked={draft.is_visible} onCheckedChange={(v) => patch({ is_visible: v })} />
            <Label>显示在前台</Label>
          </div>
        </div>
      </Section>

      <Section title="详情页内容">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="页面标题（详情页 H1）">
              <Input value={draft.page_title ?? ""} onChange={(e) => patch({ page_title: e.target.value })} placeholder="留空则使用「标题」" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="副标题">
              <Input value={draft.subtitle ?? ""} onChange={(e) => patch({ subtitle: e.target.value })} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="正文">
              <Textarea rows={6} value={draft.content ?? ""} onChange={(e) => patch({ content: e.target.value })} placeholder="正文段落，可换行…" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="封面图片">
              <ImageUpload value={draft.image_url ?? null} onChange={(v) => patch({ image_url: v })} folder="tools" label="上传图片" />
            </Field>
          </div>
          <Field label="视频链接">
            <Input value={draft.video_url ?? ""} onChange={(e) => patch({ video_url: e.target.value })} placeholder="https://..." />
          </Field>
          <Field label="外部链接">
            <Input value={draft.external_url ?? ""} onChange={(e) => patch({ external_url: e.target.value })} placeholder="https://..." />
          </Field>
          <Field label="内部链接">
            <Input value={draft.internal_url ?? ""} onChange={(e) => patch({ internal_url: e.target.value })} placeholder="/products/xxx" />
          </Field>
          <Field label="按钮文字">
            <Input value={draft.button_text ?? ""} onChange={(e) => patch({ button_text: e.target.value })} placeholder="开始使用" />
          </Field>
          <div className="md:col-span-2">
            <Field label="按钮链接">
              <Input value={draft.button_url ?? ""} onChange={(e) => patch({ button_url: e.target.value })} placeholder="https://... 或 /..." />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="自定义 HTML">
              <Textarea rows={5} value={draft.html_content ?? ""} onChange={(e) => patch({ html_content: e.target.value })} placeholder="<div>...</div>" />
            </Field>
          </div>
        </div>
      </Section>

      <div className="flex gap-2">
        <Button disabled={!dirty} onClick={() => onSave(draft)}>保存</Button>
        {dirty && <Button variant="ghost" onClick={() => setDraft(item)}>取消</Button>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-5 space-y-4">
      <div className="text-sm font-semibold">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
