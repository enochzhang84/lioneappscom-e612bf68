import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2, Eye, EyeOff, Folder, FolderOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  adminListBankNodes,
  adminUpsertBankNode,
  adminDeleteBankNode,
  adminToggleBankNodeActive,
  type BankNode,
} from "@/lib/question-bank-admin.functions";

type NodeType = "category" | "module" | "bank";

const TYPE_LABEL: Record<NodeType, string> = {
  category: "一级分类",
  module: "二级模块",
  bank: "题库",
};

const NEXT_TYPE: Record<NodeType, NodeType | null> = {
  category: "module",
  module: "bank",
  bank: null,
};

type TreeNode = BankNode & { children: TreeNode[] };

function buildTree(nodes: BankNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  nodes.forEach((n) => map.set(n.id, { ...n, children: [] }));
  const roots: TreeNode[] = [];
  map.forEach((n) => {
    if (n.parent_id && map.has(n.parent_id)) map.get(n.parent_id)!.children.push(n);
    else if (!n.parent_id) roots.push(n);
  });
  const sort = (arr: TreeNode[]) => {
    arr.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    arr.forEach((c) => sort(c.children));
  };
  sort(roots);
  return roots;
}

type EditingState =
  | { mode: "create"; parent: BankNode | null; type: NodeType }
  | { mode: "edit"; node: BankNode }
  | null;

export function QuestionBankTree({
  selectedBankId,
  onSelectBank,
}: {
  selectedBankId: string | null;
  onSelectBank: (bank: BankNode | null) => void;
}) {
  const listFn = useServerFn(adminListBankNodes);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "bank-nodes"], queryFn: () => listFn({}) });

  const tree = useMemo(() => buildTree(q.data ?? []), [q.data]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<EditingState>(null);

  // Auto-expand ancestors of selected bank
  useMemo(() => {
    if (!selectedBankId || !q.data) return;
    const byId = new Map(q.data.map((n) => [n.id, n]));
    const toOpen = new Set(expanded);
    let cur = byId.get(selectedBankId);
    while (cur?.parent_id) {
      toOpen.add(cur.parent_id);
      cur = byId.get(cur.parent_id);
    }
    if (toOpen.size !== expanded.size) setExpanded(toOpen);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBankId, q.data]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "bank-nodes"] });
    qc.invalidateQueries({ queryKey: ["admin", "quiz"] });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">题库目录</div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2"
          onClick={() => setEditing({ mode: "create", parent: null, type: "category" })}
        >
          <Plus size={14} className="mr-1" />
          分类
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-1 py-2 space-y-0.5">
        {q.isLoading && <div className="p-3 text-sm text-muted-foreground">加载中…</div>}
        {tree.length === 0 && !q.isLoading && (
          <div className="p-4 text-sm text-muted-foreground text-center">
            还没有分类，点击右上角「+ 分类」开始。
          </div>
        )}
        {tree.map((n) => (
          <TreeItem
            key={n.id}
            node={n}
            depth={0}
            expanded={expanded}
            selectedBankId={selectedBankId}
            onToggle={toggle}
            onSelectBank={onSelectBank}
            onAddChild={(parent) => {
              const nextType = NEXT_TYPE[parent.node_type];
              if (!nextType) return;
              setEditing({ mode: "create", parent, type: nextType });
              if (!expanded.has(parent.id)) toggle(parent.id);
            }}
            onEdit={(node) => setEditing({ mode: "edit", node })}
          />
        ))}
      </div>

      {editing && (
        <NodeEditor
          state={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            invalidate();
            setEditing(null);
          }}
        />
      )}

    </div>
  );
}

function TreeItem({
  node,
  depth,
  expanded,
  selectedBankId,
  onToggle,
  onSelectBank,
  onAddChild,
  onEdit,
}: {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  selectedBankId: string | null;
  onToggle: (id: string) => void;
  onSelectBank: (bank: BankNode) => void;
  onAddChild: (parent: BankNode) => void;
  onEdit: (node: BankNode) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isOpen = expanded.has(node.id);
  const isBank = node.node_type === "bank";
  const isSelected = isBank && node.id === selectedBankId;
  const canAddChild = node.node_type !== "bank";

  const delFn = useServerFn(adminDeleteBankNode);
  const toggleFn = useServerFn(adminToggleBankNodeActive);
  const qc = useQueryClient();

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("已删除");
      qc.invalidateQueries({ queryKey: ["admin", "bank-nodes"] });
      qc.invalidateQueries({ queryKey: ["admin", "quiz"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const toggleActive = useMutation({
    mutationFn: (v: { id: string; is_active: boolean }) => toggleFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "bank-nodes"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const Icon = isBank ? Layers : isOpen && hasChildren ? FolderOpen : Folder;

  return (
    <div>
      <div
        className={
          "group flex items-center gap-1 rounded-md pr-1 text-sm cursor-pointer " +
          (isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted") +
          (!node.is_active ? " opacity-60" : "")
        }
        style={{ paddingLeft: 4 + depth * 12 }}
      >
        <button
          type="button"
          className="w-5 h-6 flex items-center justify-center shrink-0 text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(node.id);
          }}
          aria-label={isOpen ? "折叠" : "展开"}
        >
          {hasChildren ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-3" />}
        </button>
        <div
          className="flex-1 min-w-0 flex items-center gap-1.5 py-1.5"
          onClick={() => {
            if (isBank) onSelectBank(node);
            else if (hasChildren) onToggle(node.id);
          }}
        >
          <Icon size={14} className="shrink-0 opacity-70" />
          <span className="truncate">{node.name}</span>
          {isBank && node.question_count > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">{node.question_count}</span>
          )}
          {!node.is_active && (
            <span className="ml-1 text-[10px] rounded bg-yellow-100 text-yellow-800 px-1 py-0.5">隐藏</span>
          )}
        </div>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0">
          {canAddChild && (
            <button
              type="button"
              className="p-1 rounded hover:bg-background text-muted-foreground"
              title={`添加${TYPE_LABEL[NEXT_TYPE[node.node_type]!]}`}
              onClick={(e) => { e.stopPropagation(); onAddChild(node); }}
            >
              <Plus size={13} />
            </button>
          )}
          <button
            type="button"
            className="p-1 rounded hover:bg-background text-muted-foreground"
            title="重命名"
            onClick={(e) => { e.stopPropagation(); onEdit(node); }}
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-background text-muted-foreground"
            title={node.is_active ? "隐藏" : "显示"}
            onClick={(e) => {
              e.stopPropagation();
              toggleActive.mutate({ id: node.id, is_active: !node.is_active });
            }}
          >
            {node.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-background text-destructive"
            title="删除"
            onClick={(e) => {
              e.stopPropagation();
              const msg = hasChildren
                ? `确认删除「${node.name}」及其全部子级？`
                : isBank && node.question_count > 0
                  ? `「${node.name}」下有 ${node.question_count} 道题，删除后题目将解除挂靠（不会被删除）。继续？`
                  : `确认删除「${node.name}」？`;
              if (confirm(msg)) del.mutate(node.id);
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {isOpen && hasChildren && (
        <div>
          {node.children.map((c) => (
            <TreeItem
              key={c.id}
              node={c}
              depth={depth + 1}
              expanded={expanded}
              selectedBankId={selectedBankId}
              onToggle={onToggle}
              onSelectBank={onSelectBank}
              onAddChild={onAddChild}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/[\u4e00-\u9fa5]/g, "") || "item";
}

function NodeEditor({
  state,
  onClose,
  onSaved,
}: {
  state: NonNullable<EditingState>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const upsertFn = useServerFn(adminUpsertBankNode);
  const isEdit = state.mode === "edit";
  const type: NodeType = isEdit ? state.node.node_type : state.type;
  const parentId: string | null = isEdit ? state.node.parent_id : state.parent?.id ?? null;

  const [name, setName] = useState(isEdit ? state.node.name : "");
  const [nameEn, setNameEn] = useState(isEdit ? state.node.name_en ?? "" : "");
  const [slug, setSlug] = useState(isEdit ? state.node.slug : "");
  const [icon, setIcon] = useState(isEdit ? state.node.icon ?? "" : "");
  const [description, setDescription] = useState(isEdit ? state.node.description ?? "" : "");
  const [sortOrder, setSortOrder] = useState(isEdit ? state.node.sort_order : 0);
  const [isActive, setIsActive] = useState(isEdit ? state.node.is_active : true);
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const save = useMutation({
    mutationFn: () =>
      upsertFn({
        data: {
          id: isEdit ? state.node.id : undefined,
          parent_id: parentId,
          node_type: type,
          name: name.trim(),
          name_en: nameEn.trim() || null,
          slug: (slug || slugify(name)).trim(),
          icon: icon.trim() || null,
          description: description.trim() || null,
          sort_order: sortOrder,
          is_active: isActive,
        },
      }),
    onSuccess: () => {
      toast.success(isEdit ? "已更新" : "已创建");
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const title = isEdit
    ? `编辑${TYPE_LABEL[type]}`
    : `新建${TYPE_LABEL[type]}${state.mode === "create" && state.parent ? ` — ${state.parent.name}` : ""}`;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>名称（中文）*</Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder={type === "category" ? "DMV 驾照考试" : type === "module" ? "C1 小型车" : "笔试题库"}
            />
          </div>
          <div>
            <Label>Name (English)</Label>
            <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Optional" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Slug *</Label>
              <Input
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
                placeholder="dmv / c1 / written"
              />
              <p className="text-[11px] text-muted-foreground mt-1">同一父级下唯一，小写字母/数字/-</p>
            </div>
            <div>
              <Label>排序</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <Label>图标 (lucide 名，选填)</Label>
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Car / Truck / Layers" />
          </div>
          <div>
            <Label>说明</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="选填" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className="text-sm">启用</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={() => save.mutate()} disabled={!name.trim() || save.isPending}>
            {save.isPending ? "保存中…" : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
