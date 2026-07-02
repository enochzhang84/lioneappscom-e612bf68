import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard,
  FileText,
  Wrench,
  BookOpen,
  GraduationCap,
  Newspaper,
  BarChart3,
  Search,
  Users,
  FolderOpen,
  Bell,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  Package,
  Briefcase,
  Home,
  Info,
  Mail,
  PencilLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { adminListShortcutPages } from "@/lib/pages-admin.functions";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  group: string;
  soon?: boolean;
  params?: Record<string, string>;
  search?: Record<string, string>;
};

const QUICK_EDIT_GROUP = "页面编辑";

const STATIC_QUICK_EDIT: NavItem[] = [
  { to: "/admin/settings", label: "首页", icon: Home, group: QUICK_EDIT_GROUP, search: { section: "hero" } },
  { to: "/admin/products", label: "产品", icon: Package, group: QUICK_EDIT_GROUP },
  { to: "/admin/cases", label: "案例", icon: Briefcase, group: QUICK_EDIT_GROUP },
  { to: "/admin/settings", label: "关于我们", icon: Info, group: QUICK_EDIT_GROUP, search: { section: "about" } },
  { to: "/admin/settings", label: "联系我们", icon: Mail, group: QUICK_EDIT_GROUP, search: { section: "contact" } },
  { to: "/admin/tools", label: "实用工具", icon: Wrench, group: QUICK_EDIT_GROUP },
];

// Platform Admin — 11 个模块（宪法级顺序，勿随意增删）
export const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, group: "Platform" },

  { to: "/admin/pages", label: "Content — 页面", icon: FileText, group: "Content" },
  { to: "/admin/blog", label: "Content — 文章", icon: Newspaper, group: "Content" },
  { to: "/admin/cases", label: "Content — 案例", icon: Briefcase, group: "Content" },

  { to: "/admin/tools", label: "Tools — 工具", icon: Wrench, group: "Tools" },
  { to: "/admin/quiz", label: "Tools — 题库", icon: BookOpen, group: "Tools" },

  { to: "/admin/exams", label: "Exams", icon: GraduationCap, group: "Exams" },

  { to: "/admin/products", label: "Products", icon: Package, group: "Products" },

  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, group: "Analytics" },
  { to: "/admin/seo", label: "SEO", icon: Search, group: "Analytics" },

  { to: "/admin/users", label: "Users", icon: Users, group: "System" },
  { to: "/admin/files", label: "Files", icon: FolderOpen, group: "System" },
  { to: "/admin/notifications", label: "Notifications", icon: Bell, group: "System" },
  { to: "/admin/logs", label: "Logs", icon: ScrollText, group: "System" },
  { to: "/admin/platform/settings", label: "Platform Settings", icon: Settings, group: "System" },
  { to: "/admin/settings", label: "站点内容 (Legacy)", icon: FileText, group: "System" },
];



export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const listShortcuts = useServerFn(adminListShortcutPages);
  const { data: shortcutPages } = useQuery({
    queryKey: ["admin", "shortcut-pages"],
    queryFn: () => listShortcuts(),
    staleTime: 60_000,
  });

  const dynamicQuickEdit: NavItem[] = (shortcutPages ?? []).map((p) => ({
    to: `/admin/pages/${p.id}`,
    label: p.nav_label || p.title || p.slug,
    icon: PencilLine,
    group: QUICK_EDIT_GROUP,
  }));

  const nav: NavItem[] = [
    ADMIN_NAV[0], // 仪表盘
    ...STATIC_QUICK_EDIT,
    ...dynamicQuickEdit,
    ...ADMIN_NAV.slice(1),
  ];

  const groups = Array.from(new Set(nav.map((n) => n.group)));

  const active = [...nav]
    .filter((n) => pathname === n.to || pathname.startsWith(n.to + "/"))
    .sort((a, b) => b.to.length - a.to.length)[0];

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  return (
    <div className="min-h-screen flex bg-[#F6F7F9]">
      {/* Sidebar */}
      <aside
        className={cn(
          "sticky top-0 h-screen shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="h-14 flex items-center px-4 border-b border-slate-100 justify-between">
          {!collapsed && (
            <Link to="/" className="font-bold text-slate-900 tracking-tight text-sm">
              Lione Apps <span className="text-blue-600">Admin</span>
            </Link>
          )}
          <button
            type="button"
            aria-label="collapse"
            onClick={() => setCollapsed((c) => !c)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {groups.map((g) => (
            <div key={g}>
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {g}
                </div>
              )}
              <ul className="space-y-0.5">
                {nav.filter((n) => n.group === g).map((n) => {
                  const isActive =
                    pathname === n.to || (n.to !== "/admin" && pathname.startsWith(n.to + "/")) ||
                    (n.to === "/admin" && pathname === "/admin");
                  const Icon = n.icon;
                  const isQuickEdit = n.group === QUICK_EDIT_GROUP;
                  return (
                    <li key={`${n.group}:${n.to}:${n.label}`}>
                      <Link
                        to={n.to}
                        search={n.search as never}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive && !isQuickEdit
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                          collapsed && "justify-center px-0",
                          isQuickEdit && !collapsed && "pl-6",
                        )}
                        title={collapsed ? n.label : undefined}
                      >
                        <Icon size={16} className="shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="truncate flex-1">{n.label}</span>
                            {n.soon && (
                              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-normal uppercase tracking-wider">
                                Soon
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>


        <div className="border-t border-slate-100 p-2 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50",
              collapsed && "justify-center px-0",
            )}
            title="访问前台"
          >
            <ExternalLink size={16} />
            {!collapsed && <span>访问前台</span>}
          </a>
          <button
            type="button"
            onClick={signOut}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50",
              collapsed && "justify-center px-0",
            )}
            title="退出"
          >
            <LogOut size={16} />
            {!collapsed && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="text-sm text-slate-600 flex items-center gap-2">
            <span className="text-slate-400">Lione Apps</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-800">{active?.label ?? "管理"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink size={14} className="mr-1" /> 前台
              </a>
            </Button>
          </div>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-2xl bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
        <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 items-center justify-center mb-4">
          <Wrench size={22} />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-2">
          {description ?? "该模块正在规划中，将在后续迭代上线。"}
        </p>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link to="/admin">← 返回仪表盘</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
