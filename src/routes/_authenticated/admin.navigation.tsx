import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ADMIN_NAV, navKeyOf } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/admin";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  adminGetHiddenNavItems,
  adminSetHiddenNavItems,
} from "@/lib/nav-visibility.functions";

export const Route = createFileRoute("/_authenticated/admin/navigation")({
  component: NavigationManagementPage,
});

function NavigationManagementPage() {
  const getHidden = useServerFn(adminGetHiddenNavItems);
  const setHidden = useServerFn(adminSetHiddenNavItems);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin", "nav-hidden"],
    queryFn: () => getHidden(),
  });

  const [hidden, setLocal] = useState<string[]>([]);
  useEffect(() => {
    if (data) setLocal(data);
  }, [data]);

  const save = useMutation({
    mutationFn: (items: string[]) => setHidden({ data: { items } }),
    onSuccess: () => {
      toast.success("导航设置已保存");
      qc.invalidateQueries({ queryKey: ["admin", "nav-hidden"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const groups = Array.from(new Set(ADMIN_NAV.map((n) => n.group)));

  function toggle(key: string, show: boolean) {
    const next = show ? hidden.filter((k) => k !== key) : Array.from(new Set([...hidden, key]));
    setLocal(next);
    save.mutate(next);
  }

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Navigation Management"
        description="控制左侧导航栏入口的显示。关闭后仅隐藏入口，页面、路由、数据与功能全部保留，仍可通过 URL 直接访问。"
      />

      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-100">
              {g}
            </div>
            <ul className="divide-y divide-slate-100">
              {ADMIN_NAV.filter((n) => n.group === g).map((n) => {
                const key = navKeyOf(n);
                const show = !hidden.includes(key);
                return (
                  <li key={key} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <div className="text-sm text-slate-800 truncate">{n.label}</div>
                      <div className="text-xs text-slate-400 truncate">{n.to}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-500 w-28 text-right">
                        {show ? "Show in Navigation" : "已隐藏（URL 可访问）"}
                      </span>
                      <Switch checked={show} onCheckedChange={(v) => toggle(key, v)} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div>
        <Button variant="outline" onClick={() => toggleAll()} disabled={save.isPending}>
          全部显示
        </Button>
      </div>
    </div>
  );

  function toggleAll() {
    setLocal([]);
    save.mutate([]);
  }
}
