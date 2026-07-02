import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  adminListProducts,
  adminListCases,
  adminListSettings,
} from "@/lib/cms-admin.functions";
import { adminListPages } from "@/lib/pages-admin.functions";
import { adminListCategories } from "@/lib/tools-admin.functions";
import { adminListQuiz } from "@/lib/quiz-admin.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  FileText, Wrench, BookOpen, Package, Briefcase, Settings,
  Plus, ArrowRight, BarChart3, Search, Users,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const lp = useServerFn(adminListProducts);
  const lc = useServerFn(adminListCases);
  const ls = useServerFn(adminListSettings);
  const lPages = useServerFn(adminListPages);
  const lTools = useServerFn(adminListCategories);
  const lQuiz = useServerFn(adminListQuiz);

  const products = useQuery({ queryKey: ["admin", "products"], queryFn: () => lp() });
  const cases = useQuery({ queryKey: ["admin", "cases"], queryFn: () => lc() });
  const settings = useQuery({ queryKey: ["admin", "settings"], queryFn: () => ls() });
  const pages = useQuery({ queryKey: ["admin", "pages"], queryFn: () => lPages() });
  const tools = useQuery({ queryKey: ["admin", "tool-categories"], queryFn: () => lTools() });
  const quiz = useQuery({ queryKey: ["admin", "quiz", "all"], queryFn: () => lQuiz({ data: {} as { category?: string } }) });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px]">
      <PageHeader
        title="仪表盘"
        description="Lione Apps 平台运营总览 · 快速跳转至各模块"
      />

      <section>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard title="页面" icon={FileText} value={pages.data?.length} to="/admin/pages" tone="blue" />
          <StatCard title="工具" icon={Wrench} value={tools.data?.length} to="/admin/tools" tone="violet" />
          <StatCard title="题目" icon={BookOpen} value={quiz.data?.length} to="/admin/quiz" tone="emerald" />
          <StatCard title="产品" icon={Package} value={products.data?.length} to="/admin/products" tone="amber" />
          <StatCard title="案例" icon={Briefcase} value={cases.data?.length} to="/admin/cases" tone="rose" />
          <StatCard title="设置" icon={Settings} value={settings.data?.length} to="/admin/settings" tone="slate" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">快速操作</h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link to="/admin/pages"><Plus size={14} className="mr-1" /> 新建页面</Link></Button>
          <Button asChild variant="outline"><Link to="/admin/tools"><Plus size={14} className="mr-1" /> 新建工具</Link></Button>
          <Button asChild variant="outline"><Link to="/admin/quiz"><Plus size={14} className="mr-1" /> 新增题目</Link></Button>
          <Button asChild variant="outline"><Link to="/admin/products/new"><Plus size={14} className="mr-1" /> 新增产品</Link></Button>
          <Button asChild variant="outline"><Link to="/admin/cases/new"><Plus size={14} className="mr-1" /> 新增案例</Link></Button>
          <Button asChild variant="ghost"><Link to="/admin/settings">编辑站点设置 →</Link></Button>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">运营模块（即将上线）</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <UpcomingCard icon={BarChart3} title="网站运营中心" desc="访问量、热门工具、来源与设备分析" to="/admin/analytics" />
          <UpcomingCard icon={Search} title="SEO 管理" desc="标题、描述、OG、sitemap、robots 与收录状态" to="/admin/seo" />
          <UpcomingCard icon={Users} title="用户管理" desc="会员、收藏、考试记录与错题本" to="/admin/users" />
        </div>
      </section>
    </div>
  );
}

const TONE_MAP: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  slate: "bg-slate-100 text-slate-600",
};

function StatCard({
  title, icon: Icon, value, to, tone = "blue",
}: {
  title: string; icon: React.ComponentType<{ size?: number; className?: string }>;
  value: number | undefined; to: string; tone?: string;
}) {
  return (
    <Link to={to} className="group">
      <Card className="border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className={`h-9 w-9 rounded-lg grid place-items-center ${TONE_MAP[tone]}`}>
              <Icon size={18} />
            </div>
            <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 tabular-nums">
            {value ?? "—"}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{title}</div>
        </CardContent>
      </Card>
    </Link>
  );
}

function UpcomingCard({
  icon: Icon, title, desc, to,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string; desc: string; to: string;
}) {
  return (
    <Link to={to}>
      <Card className="border-dashed border-slate-300 hover:border-blue-400 hover:bg-white transition-all bg-white/60 h-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-slate-500" />
            <div className="font-medium text-slate-800 text-sm">{title}</div>
            <span className="ml-auto text-[9px] uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded tracking-wider">Soon</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{desc}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
