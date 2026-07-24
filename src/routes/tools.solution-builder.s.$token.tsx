import { createFileRoute, Link } from "@tanstack/react-router";
import { sbGetShared } from "@/lib/solution-builder.functions";
import { formatMoney } from "@/lib/solution-builder/calc";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/tools/solution-builder/s/$token")({
  loader: async ({ params }) => sbGetShared({ data: { token: params.token } }),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.row?.title ?? "Shared Solution"} · Lione Apps` },
      { name: "description", content: "Lione Apps 方案分享 · IT 方案与预算参考" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SharedView,
});

function SharedView() {
  const data = Route.useLoaderData();
  if (!data.row) return <ShareUnavailable status={data.status} />;
  const shared = data.row;
  const L = (shared.language === "en" ? "en" : "zh") as "zh" | "en";
  const items = (shared.items as unknown as import("@/lib/solution-builder/types").LineItem[]) ?? [];
  const compat = (shared.compat_warnings as unknown as import("@/lib/solution-builder/types").CompatWarning[]) ?? [];
  const cur = shared.currency;

  const L = (shared.language === "en" ? "en" : "zh") as "zh" | "en";
  const items = (shared.items as unknown as import("@/lib/solution-builder/types").LineItem[]) ?? [];
  const compat = (shared.compat_warnings as unknown as import("@/lib/solution-builder/types").CompatWarning[]) ?? [];
  const cur = shared.currency;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 md:px-6 py-10">
        <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm">
          <div className="flex items-start justify-between border-b pb-4 mb-5">
            <div>
              <div className="text-xs text-slate-400">Lione Apps · {L === "zh" ? "方案分享" : "Shared Solution"}</div>
              <div className="mt-1 text-xl font-semibold text-slate-900">{shared.title}</div>
              <div className="text-xs text-slate-500">#{shared.solution_number}</div>
            </div>
            <div className="text-xs text-slate-500 text-right">
              {new Date(shared.created_at).toLocaleDateString()}
              {shared.share_expires_at && (
                <div>{L === "zh" ? "有效期至" : "Expires"} {new Date(shared.share_expires_at).toLocaleDateString()}</div>
              )}
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500 border-b">
              <tr><th className="text-left py-2">{L === "zh" ? "配置项" : "Item"}</th>
                  <th className="text-right py-2 w-14">{L === "zh" ? "数量" : "Qty"}</th>
                  <th className="text-right py-2 w-24">{L === "zh" ? "单价" : "Unit"}</th>
                  <th className="text-right py-2 w-24">{L === "zh" ? "小计" : "Amount"}</th></tr>
            </thead>
            <tbody>
              {items.map((i, idx) => (
                <tr key={i.id + idx} className="border-b border-slate-100">
                  <td className="py-2">
                    <div className="text-slate-800">{L === "zh" ? i.name_zh : i.name_en}</div>
                    {i.brand && <div className="text-xs text-slate-400">{i.brand}{i.model ? ` · ${i.model}` : ""}</div>}
                  </td>
                  <td className="py-2 text-right">{i.qty}</td>
                  <td className="py-2 text-right">{formatMoney(i.unit_price, cur, L)}</td>
                  <td className="py-2 text-right font-medium">{formatMoney(i.qty * i.unit_price, cur, L)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <div className="text-sm w-64">
              <SumRow label={L === "zh" ? "设备小计" : "Subtotal"} value={formatMoney(Number(shared.subtotal), cur, L)} />
              {Number(shared.service_fee) > 0 && <SumRow label={L === "zh" ? "服务费" : "Service Fee"} value={formatMoney(Number(shared.service_fee), cur, L)} />}
              {Number(shared.tax_amount) > 0 && <SumRow label={L === "zh" ? "税费" : "Tax"} value={formatMoney(Number(shared.tax_amount), cur, L)} />}
              <div className="flex justify-between border-t mt-2 pt-2 font-semibold text-blue-700 text-lg">
                <span className="text-xs uppercase tracking-wider text-slate-500 self-end">{L === "zh" ? "一次性总价" : "One-time"}</span>
                <span>{formatMoney(Number(shared.one_time_total), cur, L)}</span>
              </div>
              {Number(shared.monthly_total) > 0 && <SumRow label={L === "zh" ? "每月" : "Monthly"} value={formatMoney(Number(shared.monthly_total), cur, L) + "/mo"} />}
            </div>
          </div>

          {compat.length > 0 && (
            <div className="mt-6 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
              {compat.map((c, i) => <div key={i}>· {L === "zh" ? c.message_zh : c.message_en}</div>)}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-slate-600 py-0.5"><span>{label}</span><span className="text-slate-800">{value}</span></div>;
}
