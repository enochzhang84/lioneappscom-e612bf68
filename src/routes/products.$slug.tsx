import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { getProductBySlug } from "@/lib/cms.functions";
import { mediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

type Feature = { title: string; desc: string };
type LongContent = { intro?: string; features?: Feature[]; cta?: string };

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    const product = await getProductBySlug({ data: { slug: params.slug } });
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.product?.title ?? "产品";
    const desc = loaderData?.product?.short_desc ?? "";
    const img = mediaUrl(loaderData?.product?.hero_image_url);
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
  notFoundComponent: () => (
    <SiteLayout><PageHero title="未找到该产品" desc="可能链接已变更或下线。" /></SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout><PageHero title="加载失败" desc={error instanceof Error ? error.message : String(error)} /></SiteLayout>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const lc = (product.long_content ?? {}) as LongContent;
  const img = mediaUrl(product.hero_image_url);

  return (
    <SiteLayout>
      <PageHero eyebrow={product.tag ?? undefined} title={product.title} desc={product.short_desc ?? undefined} />

      <section className="mx-auto max-w-5xl px-6 py-12 space-y-12">
        {img && (
          <div className="rounded-2xl overflow-hidden border border-border bg-card">
            <img src={img} alt={product.title} className="w-full object-cover" />
          </div>
        )}

        {lc.intro && (
          <div className="prose prose-neutral max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">{lc.intro}</p>
          </div>
        )}

        {lc.features && lc.features.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">功能模块</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {lc.features.map((f, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary mt-0.5" size={20} />
                    <div>
                      <div className="font-semibold">{f.title}</div>
                      {f.desc && <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h3 className="text-xl font-bold">{lc.cta || "想了解更多？"}</h3>
          <p className="mt-2 text-muted-foreground">联系我们获取演示与报价。</p>
          <Button asChild size="lg" className="mt-5">
            <Link to="/contact">联系咨询</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
