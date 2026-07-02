import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Package } from "lucide-react";

import {
  adminListModules,
  adminUpsertModule,
  adminToggleModule,
  adminDeleteModule,
} from "@/lib/product-modules.functions";
import { PageHeader, FormPanel, FormField, EmptyState, ConfirmDialog } from "@/components/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/platform/modules")({
  component: ModulesPage,
});

type Module = {
  id: string;
  code: string;
  name: string;
  tagline: string | null;
  icon: string | null;
  category: string | null;
  enabled: boolean;
  sort_order: number;
};

function ModulesPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListModules);
  const toggle = useServerFn(adminToggleModule);
  const remove = useServerFn(adminDeleteModule);
  const upsert = useServerFn(adminUpsertModule);

  const { data } = useQuery({
    queryKey: ["admin", "product-modules"],
    queryFn: () => list(),
  });

  const [editing, setEditing] = useState<Module | null>(null);
  const [confirm, setConfirm] = useState<Module | null>(null);
  const [creating, setCreating] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "product-modules"] });

  const toggleM = useMutation({
    mutationFn: toggle,
    onSuccess: () => { toast.success("已更新"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteM = useMutation({
    mutationFn: remove,
    onSuccess: () => { toast.success("已删除"); setConfirm(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const upsertM = useMutation({
    mutationFn: upsert,
    onSuccess: () => { toast.success("已保存"); setEditing(null); setCreating(false); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data ?? [];

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Product Modules"
        description="平台产品模块注册表。关闭的模块前台不再显示，路由与数据保留。"
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={14} className="mr-1" /> 新增模块
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="尚无模块" description="点击右上角新增第一个平台模块。" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((m) => (
            <ModuleCard
              key={m.id}
              module={m}
              onToggle={(v) => toggleM.mutate({ data: { id: m.id, enabled: v } })}
              onEdit={() => setEditing(m)}
              onDelete={() => setConfirm(m)}
            />
          ))}
        </div>
      )}

      {(editing || creating) && (
        <ModuleEditor
          initial={editing ?? undefined}
          onCancel={() => { setEditing(null); setCreating(false); }}
          onSave={(payload) => upsertM.mutate({ data: payload })}
          saving={upsertM.isPending}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`删除模块 ${confirm?.name} ？`}
        description="模块记录将被移除，前台自动隐藏。产品业务数据不会删除。"
        destructive
        confirmLabel="删除"
        onConfirm={() => { if (confirm) deleteM.mutate({ data: { id: confirm.id } }); }}
      />
    </div>
  );
}

function ModuleCard({
  module: m,
  onToggle,
  onEdit,
  onDelete,
}: {
  module: Module;
  onToggle: (v: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package size={18} />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm">{m.name}</div>
            <code className="text-[11px] text-slate-400">{m.code}</code>
          </div>
        </div>
        <Switch checked={m.enabled} onCheckedChange={onToggle} />
      </div>
      {m.tagline && <p className="text-xs text-slate-500 leading-relaxed">{m.tagline}</p>}
      <div className="flex items-center gap-2 flex-wrap">
        {m.category && <Badge variant="secondary" className="text-[10px]">{m.category}</Badge>}
        <Badge variant="outline" className="text-[10px]">sort: {m.sort_order}</Badge>
        {!m.enabled && <Badge variant="destructive" className="text-[10px]">disabled</Badge>}
      </div>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <Button variant="ghost" size="sm" onClick={onEdit}>编辑</Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

type EditorPayload = {
  id?: string;
  code: string;
  name: string;
  tagline?: string | null;
  icon?: string | null;
  category?: string | null;
  enabled: boolean;
  sort_order: number;
};

function ModuleEditor({
  initial,
  onCancel,
  onSave,
  saving,
}: {
  initial?: Module;
  onCancel: () => void;
  onSave: (payload: EditorPayload) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<EditorPayload>({
    id: initial?.id,
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    tagline: initial?.tagline ?? "",
    icon: initial?.icon ?? "",
    category: initial?.category ?? "",
    enabled: initial?.enabled ?? true,
    sort_order: initial?.sort_order ?? 100,
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6" onClick={onCancel}>
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <FormPanel
          title={initial ? `编辑：${initial.name}` : "新增模块"}
          description="平台模块记录保存在 product_modules 表。"
          actions={
            <>
              <Button variant="ghost" size="sm" onClick={onCancel}>取消</Button>
              <Button size="sm" onClick={() => onSave(form)} disabled={saving}>
                <Save size={14} className="mr-1" /> 保存
              </Button>
            </>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Code" required hint="小写、唯一">
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase() })}
                disabled={!!initial}
              />
            </FormField>
            <FormField label="名称" required>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </FormField>
            <FormField label="分类">
              <Input
                value={form.category ?? ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="core / vertical / business / ai / education"
              />
            </FormField>
            <FormField label="Icon 名" hint="Lucide 名称">
              <Input
                value={form.icon ?? ""}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="Church"
              />
            </FormField>
            <FormField label="Sort order">
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })}
              />
            </FormField>
            <FormField label="启用">
              <div className="h-9 flex items-center">
                <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
              </div>
            </FormField>
          </div>
          <FormField label="Tagline">
            <Textarea
              rows={2}
              value={form.tagline ?? ""}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
          </FormField>
        </FormPanel>
      </div>
    </div>
  );
}
