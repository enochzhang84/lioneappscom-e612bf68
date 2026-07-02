import { createFileRoute, Outlet, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { LayoutDashboard, Package, Briefcase, Settings, LogOut, ExternalLink, FileText, Wrench } from "lucide-react";
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
    <div className="min-h-screen bg-muted/30 flex">
      <Toaster richColors position="top-center" />
      <aside className="w-60 shrink-0 border-r border-border bg-background flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">L</div>
            <span>Lione 后台</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavItem to="/admin" icon={<LayoutDashboard size={16} />} label="概览" exact />
          <NavItem to="/admin/products" icon={<Package size={16} />} label="产品" />
          <NavItem to="/admin/cases" icon={<Briefcase size={16} />} label="案例" />
          <NavItem to="/admin/pages" icon={<FileText size={16} />} label="页面管理" />
          <NavItem to="/admin/quiz" icon={<ClipboardList size={16} />} label="题库管理" />
          <NavItem to="/admin/settings" icon={<Settings size={16} />} label="站点设置" />
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <Button asChild variant="outline" size="sm" className="w-full justify-start">
            <Link to="/"><ExternalLink size={14} className="mr-2" />查看网站</Link>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            <LogOut size={14} className="mr-2" />退出登录
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon, label, exact }: { to: string; icon: React.ReactNode; label: string; exact?: boolean }) {
  return (
    <Link
      to={to}
      activeOptions={exact ? { exact: true } : undefined}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
      activeProps={{ className: "flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-accent text-foreground font-medium" }}
    >
      {icon}{label}
    </Link>
  );
}
