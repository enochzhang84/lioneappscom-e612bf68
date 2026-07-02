import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";

import {
  adminListPlatformSettings,
  adminUpsertPlatformSetting,
  adminDeletePlatformSetting,
} from "@/lib/platform-settings.functions";
import { PageHeader, FormPanel, FormField, EmptyState, ConfirmDialog } from "@/components/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/admin/platform/settings")({
  component: PlatformSettingsPage,
});

// 预设 scope（可自由扩展）—— 每一个 scope 都是一个 tab
const SCOPES: { id: string; label: string; description: string }[] = [
  { id: "brand", label: "品牌", description: "平台名称、Logo、主色等品牌层配置。" },
  { id: "contact", label: "联系", description: "官方邮箱、支持邮箱、客服链接。" },
  { id: "integrations", label: "集成", description: "第三方服务 endpoint / 非机密公开 ID（密钥请用 Secrets）。" },
  { id: "features", label: "特性开关", description: "Feature flags：控制平台功能是否启用。" },
];

function PlatformSettingsPage() {
  const list = useServerFn(adminListPlatformSettings);
  const { data } = useQuery({
    queryKey: ["admin", "platform-settings"],
    queryFn: () => list({ data: {} }),
  });

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Platform Settings"
        description="平台核心配置。所有 scope 下的键值都会被 Platform Core 与产品模块读取。"
      />

      <Tabs defaultValue={SCOPES[0].id}>
        <TabsList>
          {SCOPES.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {SCOPES.map((s) => (
          <TabsContent key={s.id} value={s.id} className="mt-4">
            <ScopePanel scope={s.id} label={s.label} description={s.description} rows={data ?? []} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

type Row = {
  id: string;
  scope: string;
  key: string;
  value: unknown;
  description: string | null;
};

function ScopePanel({
  scope,
  label,
  description,
  rows,
}: {
  scope: string;
  label: string;
  description: string;
  rows: Row[];
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(adminUpsertPlatformSetting);
  const remove = useServerFn(adminDeletePlatformSetting);
  const [confirm, setConfirm] = useState<Row | null>(null);
  const [newKey, setNewKey] = useState("");

  const scoped = useMemo(() => rows.filter((r) => r.scope === scope), [rows, scope]);

  const upsertM = useMutation({
    mutationFn: upsert,
    onSuccess: () => {
      toast.success("已保存");
      qc.invalidateQueries({ queryKey: ["admin", "platform-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteM = useMutation({
    mutationFn: remove,
    onSuccess: () => {
      toast.success("已删除");
      setConfirm(null);
      qc.invalidateQueries({ queryKey: ["admin", "platform-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function addKey() {
    const trimmed = newKey.trim().toLowerCase();
    if (!trimmed) return;
    if (!/^[a-z0-9_.-]+$/.test(trimmed)) {
      toast.error("key 仅支持小写字母数字与 . _ -");
      return;
    }
    upsertM.mutate({ data: { scope, key: trimmed, value: "", description: null } });
    setNewKey("");
  }

  return (
    <FormPanel
      title={`${label} · ${scope}`}
      description={description}
      actions={
        <div className="flex items-center gap-2">
          <Input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="新键名 e.g. support_email"
            className="h-9 w-56"
          />
          <Button size="sm" onClick={addKey} disabled={upsertM.isPending}>
            <Plus size={14} className="mr-1" /> 新增键
          </Button>
        </div>
      }
    >
      {scoped.length === 0 ? (
        <EmptyState
          title={`${label} 尚无配置`}
          description="在右上角输入 key 新增第一条平台配置。"
        />
      ) : (
        <div className="space-y-4">
          {scoped.map((row) => (
            <SettingRow
              key={row.id}
              row={row}
              onSave={(value, desc) =>
                upsertM.mutate({ data: { scope, key: row.key, value, description: desc } })
              }
              onDelete={() => setConfirm(row)}
              saving={upsertM.isPending}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`删除 ${confirm?.scope}.${confirm?.key} ？`}
        description="该操作不可恢复。依赖此键的产品模块将回退到默认值。"
        destructive
        confirmLabel="删除"
        onConfirm={() => { if (confirm) deleteM.mutate({ data: { id: confirm.id } }); }}
      />
    </FormPanel>
  );
}

function SettingRow({
  row,
  onSave,
  onDelete,
  saving,
}: {
  row: Row;
  onSave: (value: unknown, description: string | null) => void;
  onDelete: () => void;
  saving: boolean;
}) {
  const initial = typeof row.value === "string" ? row.value : JSON.stringify(row.value, null, 2);
  const [text, setText] = useState(initial);
  const [desc, setDesc] = useState(row.description ?? "");

  const isJsonLike = initial.trim().startsWith("{") || initial.trim().startsWith("[");

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <code className="text-sm font-semibold text-slate-900">{row.key}</code>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {row.scope}.{row.key}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 size={14} />
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <FormField label="Value" hint={isJsonLike ? "JSON" : "文本"}>
          <Textarea
            rows={isJsonLike ? 6 : 3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="font-mono text-xs"
          />
        </FormField>
        <FormField label="描述" hint="可选">
          <Textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
        </FormField>
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          size="sm"
          disabled={saving}
          onClick={() => {
            let parsed: unknown = text;
            const t = text.trim();
            if (t.startsWith("{") || t.startsWith("[")) {
              try {
                parsed = JSON.parse(t);
              } catch {
                toast.error(`${row.key}: JSON 解析失败`);
                return;
              }
            }
            onSave(parsed, desc.trim() || null);
          }}
        >
          <Save size={14} className="mr-1" /> 保存
        </Button>
      </div>
    </div>
  );
}
