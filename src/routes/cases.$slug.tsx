import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { getCaseBySlug } from "@/lib/cms.functions";
import { mediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

type Details = { client?: string; highlights?: string[]; features?: string[] };

export const Route = createFileRoute("/cases/$slug")({
  loader: async ({ params }) => {
    const c = await getCaseBySlug({ data: { slug: params.slug } });
    if (!c) throw notFound();
    return { item: c };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.item?.title ?? "案例";
    const desc = loaderData?.item?.summary ?? "";
    const img = mediaUrl(loaderData?.item?.cover_image_url);
    return {
      meta: [
        { title: `${title} — Lione Apps` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(img ? [{ property: "og:image", content: img }] : []),
      ],
    };
  },
  notFoundComponent: () => <SiteLayout><PageHero title="未找到该案例" /></SiteLayout>,
  errorComponent: ({ error }) => <SiteLayout><PageHero title="加载失败" desc={error instanceof Error ? error.message : String(error)} /></SiteLayout>,
  component: CaseDetail,
});

function CaseDetail() {
  const { item } = Route.useLoaderData();
  const d = (item.details ?? {}) as Details;
  const img = mediaUrl(item.cover_image_url);

  return (
    <SiteLayout>
      <PageHero eyebrow={item.tag ?? undefined} title={item.title} desc={item.summary ?? undefined} />
      <section className="mx-auto max-w-4xl px-6 py-12 space-y-10">
        {img && (
          <div className="rounded-2xl overflow-hidden border border-border">
            <img src={img} alt={item.title} className="w-full object-cover" />
          </div>
        )}
        {d.client && (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-sm text-muted-foreground">客户</div>
            <div className="mt-1 font-semibold">{d.client}</div>
          </div>
        )}
        {d.highlights && d.highlights.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">项目亮点</h2>
            <ul className="space-y-2">
              {d.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2"><CheckCircle2 className="text-primary mt-0.5" size={18} /><span>{h}</span></li>
              ))}
            </ul>
          </div>
        )}
        {d.features && d.features.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">包含功能</h2>
            <div className="flex flex-wrap gap-2">
              {d.features.map((f, i) => (
                <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{f}</span>
              ))}
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h3 className="text-xl font-bold">想做一个类似的系统？</h3>
          <Button asChild size="lg" className="mt-5"><Link to="/contact">联系咨询</Link></Button>
        </div>
      </section>
    </SiteLayout>
  );
}
