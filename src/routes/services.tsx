import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { useLang, dict } from "@/lib/i18n";
import {
  homeServices,
  businessServices,
  type ServiceItem,
} from "@/lib/services-data";
import heroEcosystem from "@/assets/services-hero-ecosystem.jpg";


export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: dict["seo.services.title"].zh },
      { name: "description", content: dict["seo.services.desc"].zh },
      { property: "og:title", content: dict["seo.services.title"].zh },
      { property: "og:description", content: dict["seo.services.desc"].zh },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://lioneapps.com/services" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { lang, t } = useLang();

  // Keep <title>/description in sync with language switch (SSR default = zh).
  useEffect(() => {
    const title = dict["seo.services.title"][lang];
    const desc = dict["seo.services.desc"][lang];
    document.title = title;
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", desc);
  }, [lang]);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div

          className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, oklch(0.55 0.22 264 / 0.18), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-14 md:pt-24 md:pb-20 grid gap-10 md:grid-cols-[1.15fr_1fr] items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-primary">
              {lang === "zh" ? "服务与解决方案" : "Services & Solutions"}
            </div>
            <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-[1.15]">
              {lang === "zh"
                ? "为家庭与小型企业提供实用的数字化解决方案"
                : "Practical IT Solutions for Home and Small Business"}
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {lang === "zh"
                ? "从家庭网络、NAS 私有云和智能家居,到企业网站、定制软件与办公平台,我们为您提供规划、搭建、部署和长期支持。"
                : "From home networks, NAS private cloud and smart home systems to business websites, custom software and office platforms, we provide planning, setup, deployment and ongoing support."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href="#home-services">
                  {lang === "zh" ? "查看家庭服务" : "Explore Home Services"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#business-services">
                  {lang === "zh" ? "查看企业服务" : "Explore Business Services"}
                </a>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/contact">
                  {lang === "zh" ? "免费咨询" : "Free Consultation"}
                </Link>
              </Button>
            </div>
          </div>

          <HeroIllustration />
        </div>
      </section>

      {/* Home services */}
      <section id="home-services" className="scroll-mt-32">


        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <SectionHeader
            eyebrow={lang === "zh" ? "家庭服务" : "Home"}
            title={
              lang === "zh" ? "家庭数字生活服务" : "Home Technology Services"
            }
            desc={
              lang === "zh"
                ? "现代家庭需要的不只是能够上网,而是一个稳定、安全、方便管理的家庭数字中心。"
                : "A modern home needs more than internet access. It needs a stable, secure and easy-to-manage digital foundation."
            }
          />
          <div className="mt-12 space-y-16 md:space-y-24">
            {homeServices.map((s, i) => (
              <ServiceBlock key={s.id} service={s} flip={i % 2 === 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Transition */}
      <section className="bg-card/40 border-b border-border/60">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            {lang === "zh"
              ? "让家庭网络成为数字生活中心"
              : "Turn Your Home Network into a Digital Living Center"}
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {lang === "zh"
              ? "网络、存储、智能设备和影音系统不应该彼此独立。合理规划后,它们可以成为一个稳定、方便和安全的家庭数字环境。"
              : "Networking, storage, smart devices and media systems should not operate separately. With proper planning, they can become one stable, convenient and secure digital environment."}
          </p>
        </div>
      </section>

      {/* Business services */}
      <section id="business-services" className="scroll-mt-32 border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <SectionHeader
            eyebrow={lang === "zh" ? "企业服务" : "Business"}
            title={
              lang === "zh" ? "企业数字化服务" : "Business Technology Services"
            }
            desc={
              lang === "zh"
                ? "帮助小型企业减少重复工作,建立专业形象,并让数据、员工和业务流程更容易管理。"
                : "We help small businesses reduce repetitive work, build a professional presence and manage data, employees and workflows more effectively."
            }
          />
          <div className="mt-12 space-y-16 md:space-y-24">
            {businessServices.map((s, i) => (
              <ServiceBlock key={s.id} service={s} flip={i % 2 === 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-12 shadow-[var(--shadow-card)] text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            {lang === "zh"
              ? "准备改善您的家庭网络或企业系统吗?"
              : "Ready to Improve Your Home Network or Business Systems?"}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {lang === "zh"
              ? "告诉我们您目前的设备、网络环境或业务需求,我们会帮助您整理问题并提供合适的解决方案。"
              : "Tell us about your current devices, network environment or business needs, and we will help you identify the right solution."}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/contact">
                <MessageCircle className="mr-1 h-4 w-4" />
                {lang === "zh" ? "免费咨询" : "Free Consultation"}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/cases">
                {lang === "zh" ? "查看项目案例" : "View Projects"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
        {title}
      </h2>
      <p className="mt-4 text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function ServiceBlock({
  service,
  flip,
}: {
  service: ServiceItem;
  flip: boolean;
}) {
  const { lang } = useLang();
  const Icon = service.icon;

  return (
    <article
      id={service.anchor}
      className="scroll-mt-32 grid gap-8 md:grid-cols-2 md:gap-12 items-center"
    >
      <div className={flip ? "md:order-2" : ""}>
        <ServiceIllustration
          image={service.image}
          gradient={service.gradient}
          Icon={Icon}
          alt={service.imageAlt[lang]}
        />
      </div>

      <div>
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
          {service.title[lang]}
        </h3>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          {service.short[lang]}
        </p>
        <p className="mt-4 text-sm text-foreground/85 leading-relaxed">
          {service.full[lang]}
        </p>

        <div className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            {lang === "zh" ? "主要应用场景" : "Use Cases"}
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {service.useCases[lang].map((u) => (
              <li key={u} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{u}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild>
            <a href={`/contact?service=${service.id}`}>
              {lang === "zh" ? "咨询此服务" : "Ask About This Service"}
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link to="/cases">
              {lang === "zh" ? "查看相关案例" : "View Related Projects"}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function ServiceIllustration({
  gradient,
  Icon,
  alt,
}: {
  gradient: string;
  Icon: ServiceItem["icon"];
  alt: string;
}) {
  return (
    <div
      role="img"
      aria-label={alt}
      className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]"
      style={{ background: gradient }}
    >
      {/* subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -left-10 -bottom-10 h-52 w-52 rounded-full bg-black/10 blur-2xl" />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/25 backdrop-blur-md ring-1 ring-white/40 shadow-xl">
          <Icon className="h-12 w-12 text-white" strokeWidth={1.6} />
        </div>
      </div>
    </div>
  );
}

function HeroIllustration() {
  const { lang } = useLang();
  const alt =
    lang === "zh"
      ? "家庭与小型企业数字生态:Wi-Fi、NAS、智能家居、网站、Dashboard 与云服务连接示意图"
      : "Home and small business digital ecosystem: Wi-Fi, NAS, smart home, website, dashboard and cloud services";
  return (
    <div className="relative w-full">
      <div
        className="pointer-events-none absolute -inset-8 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 50%, oklch(0.75 0.14 264 / 0.35), transparent 70%)",
        }}
      />
      <img
        src={heroEcosystem}
        alt={alt}
        width={1280}
        height={1024}
        fetchPriority="high"
        decoding="async"
        className="w-full h-auto rounded-3xl shadow-[var(--shadow-card)] ring-1 ring-border/60 motion-safe:animate-[float_8s_ease-in-out_infinite]"
      />
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}

