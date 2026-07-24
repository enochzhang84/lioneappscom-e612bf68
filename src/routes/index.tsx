import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail, MessageCircle, Wifi, HardDrive, Home, Globe, Code2, Cloud, Users, Building2, Church, Search, PenTool, Wrench, LifeBuoy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { listProducts, listCases, type ProductCard, type CaseCard } from "@/lib/cms.functions";
import { mediaUrl } from "@/lib/media";
import { useLang, dict } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: dict["seo.home.title"].zh },
      { name: "description", content: dict["seo.home.desc"].zh },
      { property: "og:title", content: dict["seo.home.title"].zh },
      { property: "og:description", content: dict["seo.home.desc"].zh },
      { property: "og:type", content: "website" },
    ],
  }),
  loader: async () => {
    const [products, cases] = await Promise.all([listProducts(), listCases()]);
    return { products, cases };
  },
  component: Home_,
});

function Home_() {
  const { products, cases } = Route.useLoaderData();
  const { t } = useLang();

  // Prefer real CMS cases; fall back to product cards if the cases table is empty.
  const featuredCases = (cases as CaseCard[]).slice(0, 3);
  const featuredProducts = (products as ProductCard[]).slice(0, 3);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{ background: "radial-gradient(60% 50% at 50% 0%, oklch(0.55 0.22 264 / 0.18), transparent 70%)" }}
        />
        <div className="mx-auto max-w-5xl px-6 pt-20 pb-14 md:pt-28 md:pb-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{t("hero.title")}</h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <a href="#services">{t("hero.cta1")} <ArrowRight className="ml-1 h-4 w-4" /></a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">{t("hero.cta2")}</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">{t("hero.tags")}</p>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">{t("services.title")}</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{t("services.desc")}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { i: Wifi, t: "services.s1.t", d: "services.s1.d" },
            { i: HardDrive, t: "services.s2.t", d: "services.s2.d" },
            { i: Home, t: "services.s3.t", d: "services.s3.d" },
            { i: Globe, t: "services.s4.t", d: "services.s4.d" },
            { i: Code2, t: "services.s5.t", d: "services.s5.d" },
            { i: Cloud, t: "services.s6.t", d: "services.s6.d" },
          ].map(({ i: Icon, t: tk, d: dk }) => (
            <div
              key={tk}
              className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-primary/30"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{t(tk as keyof typeof dict)}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(dk as keyof typeof dict)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who we help */}
      <section className="bg-card/40 border-y border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">{t("who.title")}</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { i: Users, t: "who.h.t", d: "who.h.d" },
              { i: Building2, t: "who.b.t", d: "who.b.d" },
              { i: Church, t: "who.c.t", d: "who.c.d" },
            ].map(({ i: Icon, t: tk, d: dk }) => (
              <div key={tk} className="rounded-2xl border border-border bg-background p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{t(tk as keyof typeof dict)}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(dk as keyof typeof dict)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">{t("proc.title")}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {[
            { i: Search, t: "proc.p1.t", d: "proc.p1.d" },
            { i: PenTool, t: "proc.p2.t", d: "proc.p2.d" },
            { i: Wrench, t: "proc.p3.t", d: "proc.p3.d" },
            { i: LifeBuoy, t: "proc.p4.t", d: "proc.p4.d" },
          ].map(({ i: Icon, t: tk, d: dk }, idx) => (
            <div key={tk} className="relative rounded-2xl border border-border bg-card p-6">
              <div className="absolute -top-3 left-6 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {idx + 1}
              </div>
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 text-base font-semibold">{t(tk as keyof typeof dict)}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(dk as keyof typeof dict)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent projects (from CMS: cases → fallback to products) */}
      {(featuredCases.length > 0 || featuredProducts.length > 0) && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">{t("cases.title")}</h2>
            <Link to="/cases" className="text-sm font-medium text-primary hover:underline">
              {t("cases.viewAll")} →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredCases.length > 0
              ? featuredCases.map((c) => {
                  const img = mediaUrl(c.cover_image_url);
                  return (
                    <Link
                      key={c.id}
                      to="/cases/$slug"
                      params={{ slug: c.slug }}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/30"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-secondary grid place-items-center">
                        {img ? (
                          <img src={img} alt={c.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <span className="text-3xl text-muted-foreground/40">{c.title.slice(0, 2)}</span>
                        )}
                      </div>
                      <div className="p-5">
                        {c.tag && <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">{c.tag}</span>}
                        <h3 className="mt-3 text-lg font-semibold">{c.title}</h3>
                        {c.summary && <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{c.summary}</p>}
                      </div>
                    </Link>
                  );
                })
              : featuredProducts.map((p) => {
                  const img = mediaUrl(p.hero_image_url);
                  return (
                    <Link
                      key={p.id}
                      to="/products/$slug"
                      params={{ slug: p.slug }}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/30"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-secondary grid place-items-center">
                        {img ? (
                          <img src={img} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <span className="text-3xl text-muted-foreground/40">{p.title.slice(0, 2)}</span>
                        )}
                      </div>
                      <div className="p-5">
                        {p.tag && <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">{p.tag}</span>}
                        <h3 className="mt-3 text-lg font-semibold">{p.title}</h3>
                        {p.short_desc && <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{p.short_desc}</p>}
                      </div>
                    </Link>
                  );
                })}
          </div>
        </section>
      )}

      {/* Why choose us */}
      <section className="bg-card/40 border-y border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">{t("why.title")}</h2>
          </div>
          <ul className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
            {(["why.i1", "why.i2", "why.i3", "why.i4", "why.i5", "why.i6"] as const).map((k) => (
              <li key={k} className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm">{t(k)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-12 shadow-[var(--shadow-card)] text-center">
          <h2 className="text-2xl md:text-3xl font-bold">{t("cta.title")}</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{t("cta.desc")}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/contact"><MessageCircle className="mr-1 h-4 w-4" />{t("cta.free")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="mailto:hello@lioneapps.com"><Mail className="mr-1 h-4 w-4" />{t("cta.email")}</a>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
