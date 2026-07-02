import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Bell, Plus, Trash2, CheckCheck, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  adminListNotifications,
  adminCreateNotification,
  adminMarkNotificationRead,
  adminMarkAllNotificationsRead,
  adminDeleteNotification,
  type AdminNotification,
} from "@/lib/system.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  component: NotificationsPage,
});

const TYPE_META: Record<string, { label: string; className: string }> = {
  info: { label: "信息", className: "bg-blue-100 text-blue-700" },
  success: { label: "成功", className: "bg-emerald-100 text-emerald-700" },
  warning: { label: "警告", className: "bg-amber-100 text-amber-700" },
  error: { label: "错误", className: "bg-red-100 text-red-700" },
  system: { label: "系统", className: "bg-slate-200 text-slate-700" },
};

function NotificationsPage() {
  const listFn = useServerFn(adminListNotifications);
  const createFn = useServerFn(adminCreateNotification);
  const markFn = useServerFn(adminMarkNotificationRead);
  const markAllFn = useServerFn(adminMarkAllNotificationsRead);
  const delFn = useServerFn(adminDeleteNotification);
  const qc = useQueryClient();

  const [uid, setUid] = useState<string | null>(null);
  useState(() => {
    supabase.auth.getUser().then((r) => setUid(r.data.user?.id ?? null));
  });

  const list = useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: () => listFn(),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    type: "info",
    link_url: "",
    is_global: true,
  });

  const createMut = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          title: form.title,
          body: form.body || null,
          type: form.type as "info",
          link_url: form.link_url || null,
          is_global: form.is_global,
        },
      }),
    onSuccess: () => {
      toast.success("通知已发布");
      setShowForm(false);
      setForm({ title: "", body: "", type: "info", link_url: "", is_global: true });
      qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
      qc.invalidateQueries({ queryKey: ["admin", "unread-notifications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markMut = useMutation({
    mutationFn: (id: string) => markFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
      qc.invalidateQueries({ queryKey: ["admin", "unread-notifications"] });
    },
  });

  const markAllMut = useMutation({
    mutationFn: () => markAllFn(),
    onSuccess: () => {
      toast.success("已全部标为已读");
      qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
      qc.invalidateQueries({ queryKey: ["admin", "unread-notifications"] });
    },
  });

  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("已删除");
      qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });

  const items = list.data ?? [];
  const unreadCount = uid
    ? items.filter((n) => !(n.read_by ?? []).includes(uid)).length
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bell}
        title="通知中心"
        description="发布后台公告、系统通知；记录发布者与阅读状态。"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => markAllMut.mutate()}
              disabled={unreadCount === 0}
            >
              <CheckCheck size={16} className="mr-2" />
              全部标为已读
            </Button>
            <Button onClick={() => setShowForm((s) => !s)}>
              <Plus size={16} className="mr-2" />
              新建通知
            </Button>
          </div>
        }
      />

      <div className="flex gap-3 text-sm text-muted-foreground">
        <span>共 {items.length} 条</span>
        <span>· 未读 {unreadCount}</span>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>标题</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="通知标题"
                />
              </div>
              <div className="space-y-2">
                <Label>类型</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_META).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>正文</Label>
                <Textarea
                  rows={4}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="详细内容（可留空）"
                />
              </div>
              <div className="space-y-2">
                <Label>链接（可选）</Label>
                <Input
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="/admin/xxx 或 https://..."
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.is_global}
                  onCheckedChange={(v) => setForm({ ...form, is_global: v })}
                />
                <Label>面向全体管理员</Label>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>取消</Button>
              <Button
                onClick={() => createMut.mutate()}
                disabled={!form.title.trim() || createMut.isPending}
              >
                发布通知
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0 divide-y">
          {items.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-sm">
              暂无通知
            </div>
          )}
          {items.map((n: AdminNotification) => {
            const isRead = uid ? (n.read_by ?? []).includes(uid) : true;
            const meta = TYPE_META[n.type] ?? TYPE_META.info;
            return (
              <div
                key={n.id}
                className={`p-4 flex items-start gap-4 ${isRead ? "" : "bg-blue-50/50"}`}
              >
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={meta.className}>{meta.label}</Badge>
                    <span className="font-medium">{n.title}</span>
                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  {n.body && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {n.body}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground flex gap-3 flex-wrap pt-1">
                    <span>{new Date(n.created_at).toLocaleString("zh-CN")}</span>
                    <span>· 已读 {(n.read_by ?? []).length} 人</span>
                    {n.link_url && (
                      <a
                        href={n.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> 打开链接
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markMut.mutate(n.id)}
                    >
                      <Check size={14} />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("删除该通知？")) delMut.mutate(n.id);
                    }}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
