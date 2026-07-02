import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Wrench } from "lucide-react";

import {
  adminListPlugins,
  adminUpsertPlugin,
  adminTogglePlugin,
  adminDeletePlugin,
} from "@/lib/tool-plugins.functions";
import { PageHeader, FormPanel, FormField, EmptyState, ConfirmDialog } from "@/components/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/platform/plugins")({
  component: PluginsPage,
});

type Plugin = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  version: string;
  component_key: string;
  default_config: unknown;
  enabled: boolean;
  sort_order: number;
};

function PluginsPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListPlugins);
  const toggle = useServerFn(adminTogglePlugin);
  const remove = useServerFn(adminDeletePlugin);
  const upsert = useServerFn(adminUpsertPlugin);

  const { data } = useQuery({
    queryKey: ["admin", "tool-plugins"],
    queryFn: () => list(),
  });

  const [editing, setEditing] = useState<Plugin | null>(null);
  const [confirm, setConfirm] = useState<Plugin | null>(null);
  const [creating, setCreating] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "tool-plugins"] });

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

  const rows = (data ?? []) as Plugin[];

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Tool Plugins"
        description="工具插件注册表。前端 PluginRegistry 用 component_key 匹配组件，新增插件不用改后台代码。"
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={14} className="mr-1" /> 新增插件
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="尚无插件" description="点击右上角新增第一个工具插件。" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => (
            <PluginCard
              key={p.id}
              plugin={p}
              onToggle={(v) => toggleM.mutate({ data: { id: p.id, enabled: v } })}
              onEdit={() => setEditing(p)}
              onDelete={() => setConfirm(p)}
            />
          ))}
        </div>
      )}

      {(editing || creating) && (
        <PluginEditor
          initial={editing ?? undefined}
          onCancel={() => { setEditing(null); setCreating(false); }}
          onSave={(payload) => upsertM.mutate({ data: payload })}
          saving={upsertM.isPending}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`删除插件 ${confirm?.name} ？`}
        description="插件记录将被移除，引用该插件的工具项需要另行迁移。"
        destructive
        confirmLabel="删除"
        onConfirm={() => { if (confirm) deleteM.mutate({ data: { id: confirm.id } }); }}
      />
    </div>
  );
}

function PluginCard({
  plugin: p,
  onToggle,
  onEdit,
  onDelete,
}: {
  plugin: Plugin;
  onToggle: (v: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Wrench size={18} />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm">{p.name}</div>
            <code className="text-[11px] text-slate-400">{p.code} · v{p.version}</code>
          </div>
        </div>
        <Switch checked={p.enabled} onCheckedChange={onToggle} />
      </div>
      {p.description && <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>}
      <div className="flex items-center gap-2 flex-wrap">
        {p.category && <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>}
        <Badge variant="outline" className="text-[10px] font-mono">{p.component_key}</Badge>
        <Badge variant="outline" className="text-[10px]">sort: {p.sort_order}</Badge>
        {!p.enabled && <Badge variant="destructive" className="text-[10px]">disabled</Badge>}
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
  description?: string | null;
  category?: string | null;
  icon?: string | null;
  version: string;
  component_key: string;
  default_config: Record<string, unknown>;
  enabled: boolean;
  sort_order: number;
};

function PluginEditor({
  initial,
  onCancel,
  onSave,
  saving,
}: {
  initial?: Plugin;
  onCancel: () => void;
  onSave: (payload: EditorPayload) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<EditorPayload>({
    id: initial?.id,
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    icon: initial?.icon ?? "",
    version: initial?.version ?? "1.0.0",
    component_key: initial?.component_key ?? "",
    default_config: (initial?.default_config as Record<string, unknown>) ?? {},
    enabled: initial?.enabled ?? true,
    sort_order: initial?.sort_order ?? 100,
  });
  const [configText, setConfigText] = useState<string>(
    JSON.stringify(form.default_config ?? {}, null, 2),
  );
  const [configError, setConfigError] = useState<string | null>(null);

  const handleSave = () => {
    try {
      const parsed = configText.trim() ? JSON.parse(configText) : {};
      setConfigError(null);
      onSave({ ...form, default_config: parsed });
    } catch (e) {
      setConfigError((e as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6" onClick={onCancel}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <FormPanel
          title={initial ? `编辑：${initial.name}` : "新增插件"}
          description="插件记录保存在 tool_plugins 表。component_key 是前端 PluginRegistry 的匹配键。"
          actions={
            <>
              <Button variant="ghost" size="sm" onClick={onCancel}>取消</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
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
            <FormField label="Component Key" required hint="前端 PluginRegistry 键">
              <Input
                value={form.component_key}
                onChange={(e) => setForm({ ...form, component_key: e.target.value })}
                placeholder="exam-runner"
              />
            </FormField>
            <FormField label="版本">
              <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
            </FormField>
            <FormField label="分类">
              <Input
                value={form.category ?? ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="exam / content / link / ai"
              />
            </FormField>
            <FormField label="Icon 名" hint="Lucide 名称">
              <Input
                value={form.icon ?? ""}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="Wrench"
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
          <FormField label="描述">
            <Textarea
              rows={2}
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </FormField>
          <FormField label="默认配置 (JSON)" hint="插件实例化时的默认参数">
            <Textarea
              rows={6}
              className="font-mono text-xs"
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
            />
            {configError && <p className="text-xs text-rose-600 mt-1">JSON 错误：{configError}</p>}
          </FormField>
        </FormPanel>
      </div>
    </div>
  );
}
