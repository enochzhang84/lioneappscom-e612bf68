import { createFileRoute, Outlet, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { claimFirstAdmin } from "@/lib/bootstrap.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const claim = useServerFn(claimFirstAdmin);
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let live = true;
    claim()
      .then((r) => { if (!live) return; setIsAdmin(r.is_admin); if (r.claimed) toast.success("已自动授予管理员权限"); })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => { if (live) setChecked(true); });
    return () => { live = false; };
  }, [claim]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (!checked) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">检查权限中…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <Toaster richColors position="top-center" />
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">无管理员权限</h1>
          <p className="text-muted-foreground">您的账户尚未被授予管理员权限。请使用第一个注册的账户登录，或联系站点管理员添加。</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={signOut}>退出登录</Button>
            <Button asChild><Link to="/">返回网站</Link></Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <Toaster richColors position="top-center" />
      <Outlet />
    </>
  );
}
