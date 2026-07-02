import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/PageHeader";
import { adminListUsers, adminGrantRole, adminRevokeRole, adminDeleteUser } from "@/lib/users.functions";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const listFn = useServerFn(adminListUsers);
  const grantFn = useServerFn(adminGrantRole);
  const revokeFn = useServerFn(adminRevokeRole);
  const delFn = useServerFn(adminDeleteUser);
  const qc = useQueryClient();

  const list = useQuery({ queryKey: ["admin", "users"], queryFn: () => listFn() });
  const [q, setQ] = useState("");
  const rows = list.data ?? [];
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return rows;
    return rows.filter((u) => (u.email ?? "").toLowerCase().includes(kw) || u.id.includes(kw));
  }, [rows, q]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "users"] });

  const grant = useMutation({
    mutationFn: (userId: string) => grantFn({ data: { userId, role: "admin" } }),
    onSuccess: () => { toast.success("已授予管理员"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const revoke = useMutation({
    mutationFn: (userId: string) => revokeFn({ data: { userId, role: "admin" } }),
    onSuccess: () => { toast.success("已撤销管理员"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (userId: string) => delFn({ data: { userId } }),
    onSuccess: () => { toast.success("已删除用户"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const adminCount = rows.filter((u) => u.roles.includes("admin")).length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px]">
      <PageHeader
        title="用户管理"
        description="查看所有注册用户，授予/撤销管理员权限，或删除账户。"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="总用户数" value={rows.length} />
        <StatCard label="管理员" value={adminCount} />
        <StatCard label="已激活" value={rows.filter((r) => r.confirmed).length} />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索邮箱 / user id" className="pl-9" />
        </div>
        <div className="text-xs text-slate-500 ml-auto">共 {filtered.length} 人</div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">邮箱</th>
                  <th className="px-4 py-3 font-medium">角色</th>
                  <th className="px-4 py-3 font-medium">注册时间</th>
                  <th className="px-4 py-3 font-medium">最近登录</th>
                  <th className="px-4 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.isLoading && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">加载中…</td></tr>
                )}
                {!list.isLoading && filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">没有用户</td></tr>
                )}
                {filtered.map((u) => {
                  const isAdmin = u.roles.includes("admin");
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{u.email ?? "—"}</div>
                        <code className="text-[11px] text-slate-400">{u.id.slice(0, 8)}…</code>
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
                            <ShieldCheck size={12} /> Admin
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">用户</span>
                        )}
                        {!u.confirmed && (
                          <span className="ml-1 inline-flex text-[11px] px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
                            未激活
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {isAdmin ? (
                          <Button size="sm" variant="ghost"
                            onClick={() => { if (confirm(`撤销 ${u.email} 的管理员权限？`)) revoke.mutate(u.id); }}
                          >
                            <ShieldOff size={14} className="mr-1" /> 撤销 Admin
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost"
                            onClick={() => { if (confirm(`授予 ${u.email} 管理员权限？`)) grant.mutate(u.id); }}
                          >
                            <ShieldCheck size={14} className="mr-1" /> 授予 Admin
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-red-600"
                          onClick={() => { if (confirm(`删除用户 ${u.email}？此操作不可恢复。`)) del.mutate(u.id); }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}
