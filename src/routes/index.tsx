import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail, MessageCircle, Users, Building2, Church, Search, PenTool, Wrench, LifeBuoy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { listProducts, listCases, type ProductCard, type CaseCard } from "@/lib/cms.functions";
import { mediaUrl } from "@/lib/media";
import { useLang, dict } from "@/lib/i18n";
import { services } from "@/lib/services-data";
import audienceHome from "@/assets/audience-home-users.jpg";
import audienceBiz from "@/assets/audience-small-business.jpg";
import audienceNonprofit from "@/assets/audience-nonprofit.jpg";
import process1 from "@/assets/process-1-discovery.jpg";
import process2 from "@/assets/process-2-design.jpg";
import process3 from "@/assets/process-3-deployment.jpg";
import process4 from "@/assets/process-4-support.jpg";

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
  const { lang, t } = useLang();

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
        <div className="mx-auto max-w-[1200px] px-6 pt-20 pb-14 md:pt-28 md:pb-20 text-center">
          <h1
            className="mx-auto max-w-[1200px] font-bold tracking-tight text-balance lg:whitespace-nowrap"
            style={{ fontSize: "clamp(1.9rem, 4.6vw, 3.5rem)", lineHeight: 1.1, letterSpacing: "-0.01em" }}
          >
            {lang === "zh" ? (
              <>
                <span className="whitespace-nowrap">为家庭与小型企业</span>{" "}
                <span className="whitespace-nowrap">打造可靠的数字生活</span>
              </>
            ) : (
              t("hero.title")
            )}
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/services">{t("hero.cta1")} <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">{t("hero.cta2")}</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">{t("hero.tags")}</p>
        </div>
      </section>

      {/* Services — shared data with /services page (shows only items with a hero image) */}
      <section id="services" className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="text-center mb-12 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold">{t("services.title")}</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{t("services.desc")}</p>
        </div>
        <div className="grid gap-6 md:gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {services.filter((s) => s.image).map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.id}
                to="/services"
                hash={s.anchor}
                aria-label={s.title[lang]}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-transparent transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_18px_40px_-20px_rgba(37,99,235,0.35)] hover:ring-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40">
                  <img
                    src={s.image}
                    alt={s.imageAlt[lang]}
                    loading="lazy"
                    width={1280}
                    height={800}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />


                  {/* Soft top-to-bottom fade into card body */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-card/80" />
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold tracking-tight">{s.title[lang]}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {s.short[lang]}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {lang === "zh" ? "了解更多" : "Learn More"}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>



      {/* Who we help */}
      <section className="bg-card/40 border-y border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">{t("who.title")}</h2>
          </div>
          <div className="grid gap-6 md:gap-7 md:grid-cols-3">
            {[
              { i: Users, img: audienceHome, alt: { zh: "家庭数字生活中心：Mesh Wi-Fi、NAS、智能家居与影音设备互联", en: "Home digital hub: Mesh Wi-Fi, NAS, smart devices and media connected" }, t: "who.h.t", d: "who.h.d" },
              { i: Building2, img: audienceBiz, alt: { zh: "小型企业办公场景：网站、CRM、库存、报价与云服务器协同", en: "Small business office: website, CRM, inventory and cloud collaboration" }, t: "who.b.t", d: "who.b.d" },
              { i: Church, img: audienceNonprofit, alt: { zh: "教会与非营利组织：成员登记、活动报名与课程管理数字平台", en: "Churches & nonprofits: registration, events and class management platform" }, t: "who.c.t", d: "who.c.d" },
            ].map(({ i: Icon, img, alt, t: tk, d: dk }) => (
              <div
                key={tk}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-transparent transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_18px_40px_-20px_rgba(37,99,235,0.35)] hover:ring-primary/20"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40">
                  <img
                    src={img}
                    alt={alt[lang]}
                    loading="lazy"
                    width={1280}
                    height={800}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
                  />
                  <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md ring-1 ring-white/30 backdrop-blur-sm" aria-hidden>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-background/80" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold tracking-tight">{t(tk as keyof typeof dict)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(dk as keyof typeof dict)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process — timeline with connecting line */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold">{t("proc.title")}</h2>
        </div>
        <div className="relative">
          {/* Desktop connecting line */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-6 hidden md:block h-px"
            style={{ background: "linear-gradient(90deg, transparent 0%, oklch(0.55 0.22 264 / 0.35) 12%, oklch(0.55 0.22 264 / 0.35) 88%, transparent 100%)" }}
            aria-hidden
          />
          <div className="grid gap-8 md:gap-6 md:grid-cols-4">
            {[
              { i: Search, img: process1, alt: { zh: "了解需求：设备清单、网络图与业务流程分析", en: "Discovery: device inventory, network diagram and workflow analysis" }, t: "proc.p1.t", d: "proc.p1.d" },
              { i: PenTool, img: process2, alt: { zh: "制定方案：网络拓扑、软件原型与项目计划", en: "Solution design: topology, prototype and project plan" }, t: "proc.p2.t", d: "proc.p2.d" },
              { i: Wrench, img: process3, alt: { zh: "安装与部署：网络设备、NAS、云服务器与网站上线", en: "Setup & deployment: network, NAS, cloud servers and website launch" }, t: "proc.p3.t", d: "proc.p3.d" },
              { i: LifeBuoy, img: process4, alt: { zh: "维护与支持:系统监控、自动备份、安全防护与远程支持", en: "Ongoing support: monitoring, backups, security and remote support" }, t: "proc.p4.t", d: "proc.p4.d" },
            ].map(({ i: Icon, img, alt, t: tk, d: dk }, idx) => (
              <div key={tk} className="relative flex flex-col items-center text-center">
                {/* Numbered node on the line */}
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background ring-2 ring-primary/60 shadow-[0_4px_16px_-4px_rgba(37,99,235,0.35)]">
                  <span className="text-sm font-semibold text-primary">{String(idx + 1).padStart(2, "0")}</span>
                </div>
                {/* Illustration */}
                <div className="mt-6 w-full overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={img}
                      alt={alt[lang]}
                      loading="lazy"
                      width={1280}
                      height={800}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <h3 className="mt-1 text-base font-semibold">{t(tk as keyof typeof dict)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(dk as keyof typeof dict)}</p>
              </div>
            ))}
          </div>
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
