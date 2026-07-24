import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, ShieldCheck, Wrench, HeartHandshake,
  Home, Building2, Users, ArrowRight, CheckCircle2,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useLang, type Lang } from "@/lib/i18n";
import heroImage from "@/assets/services-hero-ecosystem.jpg";
import svcHomeNetwork from "@/assets/service-home-network.jpg";
import svcBizPlatforms from "@/assets/service-business-platforms.jpg";
import svcNas from "@/assets/service-nas.jpg";
import svcCustom from "@/assets/service-custom-software.jpg";
import audHome from "@/assets/audience-home-users.jpg";
import audBiz from "@/assets/audience-small-business.jpg";
import audNp from "@/assets/audience-nonprofit.jpg";
import proc1 from "@/assets/process-1-discovery.jpg";
import proc2 from "@/assets/process-2-design.jpg";
import proc3 from "@/assets/process-3-deployment.jpg";
import proc4 from "@/assets/process-4-support.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "关于我们 | Lione Apps — Home & Small Business IT Solutions" },
      {
        name: "description",
        content:
          "了解 Lione Apps 如何帮助家庭和小型企业构建稳定、安全、高效的数字化解决方案，包括家庭网络、NAS 私有云、智能家居、企业网站、定制软件和云平台。",
      },
      { property: "og:title", content: "About Us | Lione Apps" },
      {
        property: "og:description",
        content:
          "Lione Apps provides practical IT solutions for homes and small businesses — networking, NAS private cloud, smart home systems, business websites, custom software and cloud infrastructure.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://lioneappscom.lovable.app/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://lioneappscom.lovable.app/about" }],
  }),
  component: AboutPage,
});

type Bi = { zh: string; en: string };
const t = (lang: Lang, b: Bi) => b[lang];

const VALUES: Array<{ icon: typeof Sparkles; title: Bi; desc: Bi }> = [
  {
    icon: Sparkles,
    title: { zh: "简单", en: "Simple" },
    desc: { zh: "技术应该简单易用，而不是复杂难懂。", en: "Technology should be easy to use, not hard to understand." },
  },
  {
    icon: ShieldCheck,
    title: { zh: "稳定", en: "Reliable" },
    desc: { zh: "稳定比功能更多更重要。", en: "Reliability matters more than a long feature list." },
  },
  {
    icon: Wrench,
    title: { zh: "定制", en: "Tailored" },
    desc: { zh: "每位客户都有不同需求，我们提供真正适合客户的解决方案。", en: "Every client is different — we build what actually fits your needs." },
  },
  {
    icon: HeartHandshake,
    title: { zh: "长期支持", en: "Long-term Support" },
    desc: { zh: "我们的服务不会在交付后结束，而是持续陪伴客户成长。", en: "Our work doesn't end at delivery — we grow with our clients." },
  },
];

const OFFERINGS: Array<{ image: string; title: Bi; items: Bi[] }> = [
  {
    image: svcHomeNetwork,
    title: { zh: "家庭数字生活", en: "Home Digital Life" },
    items: [
      { zh: "家庭网络", en: "Home Network" },
      { zh: "Mesh Wi-Fi", en: "Mesh Wi-Fi" },
      { zh: "NAS 私有云", en: "NAS Private Cloud" },
      { zh: "智能家居", en: "Smart Home" },
      { zh: "家庭影音", en: "Home Media" },
    ],
  },
  {
    image: svcBizPlatforms,
    title: { zh: "小型企业数字化", en: "Small Business Digitalization" },
    items: [
      { zh: "企业网站", en: "Business Website" },
      { zh: "定制软件", en: "Custom Software" },
      { zh: "CRM", en: "CRM" },
      { zh: "办公平台", en: "Office Platform" },
      { zh: "云部署", en: "Cloud Deployment" },
    ],
  },
  {
    image: svcNas,
    title: { zh: "长期技术支持", en: "Long-term Technical Support" },
    items: [
      { zh: "系统维护", en: "System Maintenance" },
      { zh: "数据备份", en: "Data Backup" },
      { zh: "网络优化", en: "Network Optimization" },
      { zh: "安全更新", en: "Security Updates" },
      { zh: "故障排查", en: "Troubleshooting" },
    ],
  },
  {
    image: svcCustom,
    title: { zh: "定制开发", en: "Custom Development" },
    items: [
      { zh: "需求分析", en: "Requirements Analysis" },
      { zh: "UI 设计", en: "UI Design" },
      { zh: "软件开发", en: "Software Development" },
      { zh: "部署实施", en: "Deployment" },
      { zh: "长期维护", en: "Long-term Maintenance" },
    ],
  },
];

const WHY: Bi[] = [
  { zh: "家庭与企业一体化解决方案", en: "Unified home and business solutions" },
  { zh: "一站式规划、部署与维护", en: "End-to-end planning, deployment and maintenance" },
  { zh: "数据属于客户自己", en: "Your data always belongs to you" },
  { zh: "可持续扩展", en: "Built to scale sustainably" },
  { zh: "双语服务（中英文）", en: "Bilingual service (Chinese & English)" },
  { zh: "长期技术支持", en: "Long-term technical support" },
];

const PROCESS: Array<{ image: string; title: Bi; desc: Bi }> = [
  {
    image: proc1,
    title: { zh: "需求沟通", en: "Discovery" },
    desc: { zh: "深入了解您的实际使用场景与目标。", en: "Understand your real-world needs and goals." },
  },
  {
    image: proc2,
    title: { zh: "方案设计", en: "Design" },
    desc: { zh: "根据预算和场景定制合适的方案。", en: "Tailor a plan that fits your budget and context." },
  },
  {
    image: proc3,
    title: { zh: "安装部署", en: "Deployment" },
    desc: { zh: "现场或远程部署，配置到位可直接使用。", en: "On-site or remote setup — configured and ready to use." },
  },
  {
    image: proc1,
    title: { zh: "培训交付", en: "Training" },
    desc: { zh: "帮助用户熟悉系统，交付完整文档。", en: "Onboarding and documentation so your team owns it." },
  },
  {
    image: proc4,
    title: { zh: "长期维护", en: "Long-term Support" },
    desc: { zh: "持续监控、更新与优化，随需响应。", en: "Ongoing monitoring, updates and optimization." },
  },
];

const AUDIENCES: Array<{ image: string; title: Bi; desc: Bi }> = [
  {
    image: audHome,
    title: { zh: "家庭用户", en: "Home Users" },
    desc: { zh: "追求稳定网络、私有云存储与智能家居体验的家庭。", en: "Families who want reliable networks, private cloud storage and a smart home." },
  },
  {
    image: audBiz,
    title: { zh: "小型企业", en: "Small Businesses" },
    desc: { zh: "希望用合理成本完成数字化升级的中小企业。", en: "Small teams looking to modernize operations at a reasonable cost." },
  },
  {
    image: audNp,
    title: { zh: "教会与非营利组织", en: "Churches & Nonprofits" },
    desc: { zh: "需要长期、稳定且预算敏感的技术合作伙伴。", en: "Mission-driven organizations needing a stable, budget-aware technology partner." },
  },
];

function AboutPage() {
  const { lang } = useLang();
  const isZh = lang === "zh";

  return (
    <SiteLayout>
      {/* ============ Hero ============ */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 0%, oklch(0.7 0.15 264 / 0.16), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-6 pt-16 md:pt-24 pb-16 md:pb-20">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {isZh ? "关于 Lione Apps" : "About Lione Apps"}
              </div>
              <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                {isZh
                  ? "让科技真正服务于家庭与小型企业"
                  : "Technology That Works for Homes & Small Businesses"}
              </h1>
              <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                {isZh
                  ? "Lione Apps 专注于家庭 IT 与小型企业数字化解决方案，为客户提供家庭网络、NAS 私有云、智能家居、企业网站、定制软件和云平台等一站式技术服务。"
                  : "Lione Apps provides practical IT solutions for homes and small businesses, including networking, NAS private cloud, smart home systems, business websites, custom software and cloud infrastructure."}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {isZh ? "查看服务" : "View Services"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {isZh ? "联系我们" : "Contact Us"}
                </Link>
              </div>
            </div>
            <div>
              <img
                src={heroImage}
                alt={isZh ? "家庭与小型企业的数字生态系统" : "Home and small business digital ecosystem"}
                width={1280}
                height={800}
                loading="eager"
                className="w-full h-auto rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-border/60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ Mission ============ */}
      <SectionShell>
        <SectionHeader
          eyebrow={isZh ? "Mission" : "使命"}
          title={isZh ? "我们的使命" : "Our Mission"}
        />
        <div className="mt-8 max-w-3xl mx-auto rounded-2xl border border-border/70 bg-card p-8 md:p-10 text-center shadow-sm">
          <p className="text-base md:text-lg text-slate-700 leading-relaxed">
            {isZh
              ? "我们相信，科技应该帮助人们，而不是增加复杂性。我们致力于帮助家庭建立稳定、安全、高效的数字生活，也帮助小型企业以合理的成本完成数字化升级。从规划到部署，再到长期维护，我们希望成为客户值得信赖的长期技术伙伴。"
              : "We believe technology should help people — not add complexity. We help families build a stable, secure and efficient digital life, and help small businesses modernize at a reasonable cost. From planning to deployment to long-term maintenance, we aim to be a technology partner our clients can trust for the long run."}
          </p>
        </div>
      </SectionShell>

      {/* ============ Values ============ */}
      <SectionShell>
        <SectionHeader
          eyebrow={isZh ? "Values" : "价值观"}
          title={isZh ? "我们的价值观" : "Our Values"}
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div
              key={v.title.en}
              className="group rounded-2xl border border-border/70 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_40px_-24px_rgba(37,99,235,0.35)]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold tracking-tight text-slate-900">
                {t(lang, v.title)}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {isZh ? v.title.en : v.title.zh}
                </span>
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(lang, v.desc)}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* ============ Offerings ============ */}
      <SectionShell tinted>
        <SectionHeader
          eyebrow={isZh ? "What We Offer" : "服务内容"}
          title={isZh ? "我们提供什么" : "What We Offer"}
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {OFFERINGS.map((o) => (
            <article
              key={o.title.en}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_40px_-24px_rgba(37,99,235,0.35)]"
            >
              <div className="aspect-[16/9] overflow-hidden bg-muted">
                <img
                  src={o.image}
                  alt={t(lang, o.title)}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                  {t(lang, o.title)}
                </h3>
                <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  {o.items.map((it) => (
                    <li key={it.en} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-primary/60" />
                      {t(lang, it)}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>

      {/* ============ Why us ============ */}
      <SectionShell>
        <SectionHeader
          eyebrow={isZh ? "Why Us" : "为什么选择我们"}
          title={isZh ? "为什么选择我们" : "Why Choose Lione Apps"}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w) => (
            <div
              key={w.en}
              className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/30"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <span className="text-sm text-slate-800 leading-relaxed">{t(lang, w)}</span>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* ============ Process timeline ============ */}
      <SectionShell tinted>
        <SectionHeader
          eyebrow={isZh ? "Process" : "工作流程"}
          title={isZh ? "我们的工作流程" : "How We Work"}
        />
        <div className="mt-12 relative">
          {/* Connector line (desktop) */}
          <div
            className="hidden lg:block absolute left-0 right-0 top-[72px] h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.6 0.16 264 / 0.35) 15%, oklch(0.6 0.16 264 / 0.35) 85%, transparent)",
            }}
          />
          <ol className="grid gap-8 lg:grid-cols-5">
            {PROCESS.map((p, i) => (
              <li key={p.title.en} className="relative flex flex-col items-center text-center">
                <div className="relative">
                  <div className="h-[120px] w-[120px] overflow-hidden rounded-2xl ring-1 ring-border/60 bg-white shadow-sm">
                    <img
                      src={p.image}
                      alt={t(lang, p.title)}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow ring-4 ring-background">
                    {i + 1}
                  </div>
                </div>
                <h3 className="mt-4 text-sm font-semibold tracking-tight text-slate-900">
                  {t(lang, p.title)}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed max-w-[180px]">
                  {t(lang, p.desc)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </SectionShell>

      {/* ============ Audiences ============ */}
      <SectionShell>
        <SectionHeader
          eyebrow={isZh ? "Who We Serve" : "服务对象"}
          title={isZh ? "我们服务哪些客户" : "Who We Serve"}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {AUDIENCES.map((a, i) => {
            const Icon = [Home, Building2, Users][i];
            return (
              <article
                key={a.title.en}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_40px_-24px_rgba(37,99,235,0.35)]"
              >
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={a.image}
                    alt={t(lang, a.title)}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">
                      {t(lang, a.title)}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {t(lang, a.desc)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </SectionShell>

      {/* ============ Vision ============ */}
      <SectionShell tinted>
        <SectionHeader
          eyebrow={isZh ? "Vision" : "愿景"}
          title={isZh ? "我们的愿景" : "Our Vision"}
        />
        <div className="mt-8 max-w-3xl mx-auto rounded-2xl border border-border/70 bg-card p-8 md:p-10 text-center shadow-sm">
          <p className="text-base md:text-lg text-slate-700 leading-relaxed">
            {isZh
              ? "我们希望帮助更多家庭拥有属于自己的数字生活中心，也帮助更多小型企业以合理成本建立稳定、高效、可持续发展的数字平台。我们相信，真正优秀的技术，不只是软件，而是长期创造价值。"
              : "We want to help more families build their own digital home hub, and help more small businesses build stable, efficient and sustainable digital platforms at a reasonable cost. Great technology isn't just software — it's value that lasts."}
          </p>
        </div>
      </SectionShell>

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/8 via-white to-primary/5 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            {isZh ? "准备开始您的数字化升级？" : "Ready to start your digital upgrade?"}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {isZh
              ? "欢迎联系我们，我们将根据您的需求提供合适的技术方案。"
              : "Get in touch and we'll recommend a solution that fits your needs."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {isZh ? "免费咨询" : "Free Consultation"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:border-primary/40 hover:text-primary transition-colors"
            >
              {isZh ? "查看服务" : "View Services"}
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function SectionShell({ children, tinted = false }: { children: React.ReactNode; tinted?: boolean }) {
  return (
    <section className={tinted ? "bg-muted/40 border-y border-border/50" : ""}>
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">{children}</div>
    </section>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">{eyebrow}</div>
      <h2 className="mt-3 text-2xl md:text-4xl font-bold tracking-tight text-slate-900">{title}</h2>
    </div>
  );
}
