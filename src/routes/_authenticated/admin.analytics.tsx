import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Eye, Users, FileText, GraduationCap, MousePointerClick } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { adminAnalyticsSummary } from "@/lib/analytics.functions";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const fn = useServerFn(adminAnalyticsSummary);
  const q = useQuery({ queryKey: ["admin", "analytics"], queryFn: () => fn() });
  const data = q.data;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px]">
      <PageHeader title="网站运营中心" description="过去 30 天的访问、来源与考试数据。" />

      {q.isLoading && <div className="text-slate-400 text-sm">加载中…</div>}
      {q.error && <div className="text-red-600 text-sm">{(q.error as Error).message}</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Stat icon={Eye} label="页面浏览" value={data.totals.views} tint="text-blue-600 bg-blue-50" />
            <Stat icon={MousePointerClick} label="会话数" value={data.totals.sessions} tint="text-indigo-600 bg-indigo-50" />
            <Stat icon={Users} label="注册用户" value={data.totals.users} tint="text-emerald-600 bg-emerald-50" />
            <Stat icon={FileText} label="文章数" value={data.totals.posts} tint="text-amber-600 bg-amber-50" />
            <Stat icon={GraduationCap} label="考试次数" value={data.totals.exams} tint="text-rose-600 bg-rose-50" />
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-semibold text-slate-900 mb-4">最近 30 天流量趋势</div>
              <MiniBarChart data={data.daily.map((d) => ({ label: d.date.slice(5), value: d.views }))} />
              <div className="mt-2 text-xs text-slate-500">最高单日：{Math.max(0, ...data.daily.map((d) => d.views))} 次浏览</div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-semibold text-slate-900 mb-3">热门页面 Top 10</div>
                <TopList
                  rows={data.topPaths.map((r) => ({ label: r.path, value: r.views }))}
                  empty="暂无访问数据"
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-semibold text-slate-900 mb-3">流量来源 Top 10</div>
                <TopList
                  rows={data.topReferrers.map((r) => ({ label: r.referrer, value: r.views }))}
                  empty="大多为直接访问"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-semibold text-slate-900 mb-3">考试模块表现</div>
              {data.examStats.length === 0 ? (
                <div className="text-slate-400 text-sm">暂无考试记录</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-slate-500">
                      <th className="py-2 font-medium">考试</th>
                      <th className="py-2 font-medium">尝试次数</th>
                      <th className="py-2 font-medium">通过</th>
                      <th className="py-2 font-medium">通过率</th>
                      <th className="py-2 font-medium">平均分</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.examStats.map((s) => (
                      <tr key={s.exam_slug}>
                        <td className="py-2 font-medium text-slate-900">{s.exam_slug}</td>
                        <td className="py-2">{s.attempts}</td>
                        <td className="py-2">{s.passed}</td>
                        <td className="py-2">{s.attempts ? Math.round((s.passed / s.attempts) * 100) : 0}%</td>
                        <td className="py-2">{s.avg_score}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({
  icon: Icon, label, value, tint,
}: { icon: React.ComponentType<{ size?: number }>; label: string; value: number; tint: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tint}`}>
          <Icon size={18} />
        </div>
        <div className="text-2xl font-bold text-slate-900 mt-3">{value.toLocaleString()}</div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </CardContent>
    </Card>
  );
}

function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div
            className="w-full rounded-t bg-blue-500/80 hover:bg-blue-600 transition-colors"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 2 : 0 }}
            title={`${d.label}: ${d.value}`}
          />
          {i % 5 === 0 && <div className="text-[9px] text-slate-400">{d.label}</div>}
        </div>
      ))}
    </div>
  );
}

function TopList({ rows, empty }: { rows: { label: string; value: number }[]; empty: string }) {
  if (rows.length === 0) return <div className="text-slate-400 text-sm">{empty}</div>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-700 truncate max-w-[70%]">{r.label}</span>
            <span className="text-slate-500">{r.value}</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded">
            <div className="h-full bg-blue-500 rounded" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
