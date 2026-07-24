import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail, MessageCircle, Users, Building2, Church, Search, PenTool, Wrench, LifeBuoy, Check, Wifi, HardDrive, Home as HomeIcon, Film, Shield, RefreshCw, Lock, Layers, TrendingUp, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";

import { useLang, dict } from "@/lib/i18n";
import { services } from "@/lib/services-data";
import audienceHome from "@/assets/audience-home-users.jpg";
import audienceBiz from "@/assets/audience-small-business.jpg";
import audienceNonprofit from "@/assets/audience-nonprofit.jpg";
import process1 from "@/assets/process-1-discovery.jpg";
import process2 from "@/assets/process-2-design.jpg";
import process3 from "@/assets/process-3-deployment.jpg";
import process4 from "@/assets/process-4-support.jpg";
import futureHero from "@/assets/future-home-hero.jpg";
import futureNetwork from "@/assets/future-home-network.jpg";
import futureNas from "@/assets/future-home-nas.jpg";
import futureSmart from "@/assets/future-home-smart.jpg";
import futureMedia from "@/assets/future-home-media.jpg";
import trendStorage from "@/assets/future-home-trend-1.png";
import trendNetwork from "@/assets/future-home-trend-2.png";
import trendAi from "@/assets/future-home-trend-3.png";
import trendSecurity from "@/assets/future-home-trend-4.png";
import advOwn from "@/assets/future-home-adv-1.png";
import advBackup from "@/assets/future-home-adv-2.png";
import advPrivacy from "@/assets/future-home-adv-3.png";
import advUnified from "@/assets/future-home-adv-4.png";
import advScale from "@/assets/future-home-adv-5.png";
import advValue from "@/assets/future-home-adv-6.png";


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
  component: Home_,
});


function Home_() {
  const { lang, t } = useLang();



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
                  {/* icon overlay removed per design */}

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
      {/* Future Home Digital Center — replaces prior "Recent projects" section */}
      <FutureHomeSection lang={lang} />


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

/* =========================================================================
 * Future Home Digital Center — self-contained bilingual section.
 * Text lives inline (Chinese + English) to keep i18n dictionary untouched.
 * ========================================================================= */

type Lang = "zh" | "en";
type Bi = { zh: string; en: string };
const bi = (v: Bi, lang: Lang) => v[lang];

const FH_MODULES: {
  id: string;
  img: string;
  title: Bi;
  body: Bi;
  bullets: Bi[];
  alt: Bi;
}[] = [
  {
    id: "network",
    img: futureNetwork,
    title: { zh: "家庭网络成为数字基础设施", en: "Home Network as Digital Infrastructure" },
    body: {
      zh: "未来家庭会同时连接手机、电脑、电视、摄像头、智能门锁、音响、游戏机和各种传感器。稳定的 Mesh Wi-Fi、有线网络和设备隔离，将成为家庭数字生活的基础。",
      en: "Future homes will connect phones, computers, TVs, cameras, smart locks, audio systems, game consoles and sensors. Reliable Mesh Wi-Fi, wired networking and device isolation will form the foundation of digital living.",
    },
    bullets: [
      { zh: "全屋 Wi-Fi 覆盖", en: "Whole-home Wi-Fi coverage" },
      { zh: "多设备稳定连接", en: "Stable multi-device connectivity" },
      { zh: "远程办公与在线学习", en: "Remote work and online learning" },
      { zh: "影音娱乐低延迟", en: "Low-latency media & gaming" },
      { zh: "智能设备网络隔离", en: "Smart-device network isolation" },
    ],
    alt: { zh: "现代住宅全屋 Mesh Wi-Fi 与多设备网络覆盖示意图", en: "Whole-home Mesh Wi-Fi and multi-device network coverage illustration" },
  },
  {
    id: "nas",
    img: futureNas,
    title: { zh: "NAS 将成为家庭数据中心", en: "NAS as the Home Data Center" },
    body: {
      zh: "家庭照片、视频和重要文件不断增加，只依赖手机、移动硬盘和公共云服务，容易造成文件分散、空间不足和隐私风险。NAS 可以让家庭拥有自己的私有云，实现自动备份、集中存储和安全远程访问。",
      en: "As family photos, videos and important files continue to grow, relying only on phones, external drives and public cloud services can create scattered data, limited storage and privacy concerns. A NAS gives families their own private cloud with automatic backup, centralized storage and secure remote access.",
    },
    bullets: [
      { zh: "手机照片自动备份", en: "Automatic phone photo backup" },
      { zh: "家庭视频集中保存", en: "Centralized home video library" },
      { zh: "多设备同步", en: "Multi-device sync" },
      { zh: "私有云与安全远程访问", en: "Private cloud & secure remote access" },
      { zh: "家庭成员共享", en: "Family member sharing" },
    ],
    alt: { zh: "NAS 私有云在手机、电脑、电视间同步照片和文件", en: "NAS private cloud syncing photos and files across phone, PC and TV" },
  },
  {
    id: "smart",
    img: futureSmart,
    title: { zh: "智能家居进入整合阶段", en: "Smart Home Is Moving Toward Integration" },
    body: {
      zh: "未来的智能家居不会只是单独控制灯光或门锁，而是通过稳定网络、统一平台和自动化场景，将摄像头、温控、照明、安全和影音设备连接起来。",
      en: "The future smart home will go beyond controlling individual lights or locks. Reliable networking, unified platforms and automation will connect cameras, climate control, lighting, security and media systems.",
    },
    bullets: [
      { zh: "智能门锁与摄像头", en: "Smart locks and cameras" },
      { zh: "智能灯光与温控", en: "Smart lighting & thermostats" },
      { zh: "统一平台与自动化", en: "Unified platform & automation" },
      { zh: "手机远程控制", en: "Remote control from phone" },
    ],
    alt: { zh: "智能家庭控制中心连接门锁、摄像头、灯光和温控", en: "Smart home control hub linking locks, cameras, lights and climate" },
  },
  {
    id: "media",
    img: futureMedia,
    title: { zh: "家庭影音将转向私人媒体中心", en: "Home Media Is Becoming a Private Entertainment Center" },
    body: {
      zh: "越来越多家庭希望集中管理电影、音乐、照片和家庭视频。通过 NAS、电视、音响、播放器和多房间系统，可以建立属于自己的家庭影音资料库。",
      en: "More families want to centrally manage movies, music, photos and home videos. By connecting NAS storage, TVs, audio systems, media players and multi-room setups, families can create their own private entertainment library.",
    },
    bullets: [
      { zh: "家庭影院", en: "Home theater" },
      { zh: "NAS 影音库", en: "NAS media library" },
      { zh: "电视与音响整合", en: "TV & audio integration" },
      { zh: "多房间音乐", en: "Multi-room audio" },
      { zh: "本地媒体播放", en: "Local media playback" },
    ],
    alt: { zh: "现代客厅中的电视、音响、NAS 与家庭媒体中心", en: "Modern living room with TV, speakers, NAS and home media center" },
  },
];

const FH_ADVANTAGES: { icon: React.ComponentType<{ className?: string }>; title: Bi; desc: Bi }[] = [
  {
    icon: Lock,
    title: { zh: "数据属于自己", en: "Own Your Data" },
    desc: { zh: "减少对单一公共云平台的依赖，让重要照片、文件和家庭资料掌握在自己手中。", en: "Reduce reliance on a single public cloud platform and keep important photos, files and family records in your own hands." },
  },
  {
    icon: RefreshCw,
    title: { zh: "自动备份", en: "Automatic Backup" },
    desc: { zh: "手机、电脑和家庭设备的数据可以自动集中备份，降低误删、损坏和设备遗失风险。", en: "Data from phones, computers and home devices can be automatically centralized to reduce the risk of accidental loss, damage or misplaced devices." },
  },
  {
    icon: Shield,
    title: { zh: "更好的隐私", en: "Better Privacy" },
    desc: { zh: "通过本地存储、权限管理和安全远程访问，减少个人数据长期暴露在不同平台中的风险。", en: "Local storage, permission controls and secure remote access reduce long-term exposure of personal data across many platforms." },
  },
  {
    icon: Layers,
    title: { zh: "统一管理设备", en: "Unified Device Management" },
    desc: { zh: "将网络、存储、智能设备和影音系统统一规划，减少设备之间彼此独立和控制混乱的问题。", en: "Plan networking, storage, smart devices and media systems together so devices no longer live in isolation." },
  },
  {
    icon: TrendingUp,
    title: { zh: "支持家庭未来扩展", en: "Ready for Future Growth" },
    desc: { zh: "家庭中的智能设备、高清视频和数据容量会持续增长，提前建立基础架构可以降低未来升级成本。", en: "Smart devices, high-resolution video and data storage will keep growing; building the foundation early lowers future upgrade cost." },
  },
  {
    icon: Check,
    title: { zh: "长期节省成本", en: "Long-Term Value" },
    desc: { zh: "合理规划网络、存储和智能设备，可以减少重复购买、云存储订阅和临时维修费用。", en: "Thoughtful planning across networking, storage and smart devices reduces duplicate purchases, cloud subscription fees and one-off repairs." },
  },
];

const FH_TRENDS: { img: string; alt: Bi; title: Bi; desc: Bi }[] = [
  {
    img: trendStorage,
    alt: { zh: "NAS 与云端同步 3D 插画", en: "NAS and cloud sync 3D illustration" },
    title: { zh: "本地存储与公共云并存", en: "Local Storage and Public Cloud Working Together" },
    desc: { zh: "重要数据保存在家庭 NAS,本地备份与公共云备份形成互补,而不是完全依赖单一平台。", en: "Important data lives on a home NAS while public cloud complements local backups, instead of relying on any single platform." },
  },
  {
    img: trendNetwork,
    alt: { zh: "Mesh Wi-Fi 与智能家居户型 3D 插画", en: "Mesh Wi-Fi and smart home floor plan 3D illustration" },
    title: { zh: "网络与智能家居统一规划", en: "Unified Networking and Smart Home Design" },
    desc: { zh: "未来家庭会在装修或升级时统一规划 Wi-Fi、有线网络、摄像头、传感器和智能控制系统。", en: "Future homes will plan Wi-Fi, wired networks, cameras, sensors and smart control together during renovation or upgrades." },
  },
  {
    img: trendAi,
    alt: { zh: "AI 芯片、NAS 与摄像头自动化 3D 插画", en: "AI chip, NAS and camera automation 3D illustration" },
    title: { zh: "家庭 AI 与自动化增加", en: "More Home AI and Automation" },
    desc: { zh: "家庭服务器和 NAS 将逐步承担本地 AI、照片管理、监控识别和自动化任务。", en: "Home servers and NAS units will gradually take on local AI, photo management, camera analysis and automation tasks." },
  },
  {
    img: trendSecurity,
    alt: { zh: "家庭网络分区与安全防护 3D 插画", en: "Segmented home network security 3D illustration" },
    title: { zh: "家庭设备更重视安全隔离", en: "Stronger Security and Device Isolation" },
    desc: { zh: "访客设备、智能设备、工作电脑和家庭存储会使用不同网络区域,提高安全性和稳定性。", en: "Guest devices, smart devices, work computers and home storage will live in separate network zones for better security and stability." },
  },
];

function FutureHomeSection({ lang }: { lang: Lang }) {
  return (
    <section id="future-home" className="relative overflow-hidden border-y border-border/60 bg-card/40">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{ background: "radial-gradient(60% 45% at 50% 0%, oklch(0.55 0.22 264 / 0.14), transparent 70%)" }}
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        {/* Intro */}
        <div className="grid gap-10 md:gap-12 md:grid-cols-2 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs font-medium text-primary">
              <HomeIcon className="h-3.5 w-3.5" />
              {lang === "zh" ? "未来家庭数字中心" : "The Future Home Digital Center"}
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-balance">
              {lang === "zh" ? "未来家庭，需要自己的数字中心" : "Every Future Home Needs Its Own Digital Center"}
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              {lang === "zh"
                ? "随着照片、视频、智能设备、远程办公和家庭影音资料不断增加，家庭网络已经不再只是连接互联网，而正在成为数据存储、设备管理、安全监控和数字娱乐的基础设施。"
                : "As photos, videos, smart devices, remote work and home media continue to grow, the home network is becoming more than an internet connection. It is becoming the foundation for storage, device management, security and digital entertainment."}
            </p>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40 shadow-[0_20px_60px_-30px_rgba(37,99,235,0.35)]">
              <img
                src={futureHero}
                alt={lang === "zh" ? "未来家庭数字中心：Mesh Wi-Fi、NAS、智能家居、家庭影音与云端连接" : "Future home digital center: Mesh Wi-Fi, NAS, smart home, media and cloud connected"}
                loading="lazy"
                width={1600}
                height={1000}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Four core modules */}
        <div className="mt-16 md:mt-20 space-y-16 md:space-y-20">
          {FH_MODULES.map((m, i) => {
            const imageFirst = i % 2 === 1; // alternate
            return (
              <article
                key={m.id}
                className="grid gap-8 md:gap-12 md:grid-cols-2 items-center"
              >
                <div className={imageFirst ? "md:order-2" : ""}>
                  <div className="overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40 shadow-[0_18px_40px_-24px_rgba(37,99,235,0.35)]">
                    <img
                      src={m.img}
                      alt={bi(m.alt, lang)}
                      loading="lazy"
                      width={1600}
                      height={1000}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className={imageFirst ? "md:order-1" : ""}>
                  <h3 className="text-2xl md:text-[26px] font-semibold tracking-tight">
                    {bi(m.title, lang)}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    {bi(m.body, lang)}
                  </p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {m.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{bi(b, lang)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {/* Advantages */}
        <div className="mt-20 md:mt-24">
          <div className="text-center mb-10 md:mb-12">
            <h3 className="text-2xl md:text-3xl font-bold">
              {lang === "zh" ? "为什么每个家庭都应该逐步建立数字中心？" : "Why Should Every Home Build a Digital Center?"}
            </h3>
          </div>
          <div className="grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FH_ADVANTAGES.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.title.en}
                  className="rounded-2xl border border-border/70 bg-background p-5 md:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_14px_32px_-20px_rgba(37,99,235,0.35)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 text-base font-semibold">{bi(a.title, lang)}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {bi(a.desc, lang)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trends */}
        <div className="mt-16 md:mt-20">
          <div className="text-center mb-10 md:mb-12">
            <h3 className="text-2xl md:text-3xl font-bold">
              {lang === "zh" ? "家庭数字中心的发展趋势" : "The Future of Home Digital Infrastructure"}
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FH_TRENDS.map((t2) => {
              return (
                <div
                  key={t2.title.en}
                  className="rounded-2xl border border-dashed border-primary/25 bg-background/70 p-5"
                >
                  <div className="flex h-24 items-center justify-start">
                    <img
                      src={t2.img}
                      alt={bi(t2.alt, lang)}
                      loading="lazy"
                      width={768}
                      height={768}
                      className="h-24 w-auto object-contain drop-shadow-[0_10px_20px_rgba(37,99,235,0.18)]"
                    />
                  </div>
                  <h4 className="mt-4 text-sm font-semibold leading-snug">{bi(t2.title, lang)}</h4>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {bi(t2.desc, lang)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 md:mt-20">
          <div className="rounded-3xl border border-border/70 bg-background p-8 md:p-10 text-center shadow-[var(--shadow-card)]">
            <h3 className="text-2xl md:text-3xl font-bold">
              {lang === "zh" ? "开始规划您的家庭数字中心" : "Start Building Your Home Digital Center"}
            </h3>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {lang === "zh"
                ? "无论您目前需要改善 Wi-Fi、建立 NAS 私有云，还是整合智能家居和家庭影音，我们都可以帮助您从基础开始逐步建设。"
                : "Whether you need better Wi-Fi, a NAS private cloud, smart home integration or a home media system, we can help you build the right foundation step by step."}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/services" hash="home-services">
                  {lang === "zh" ? "查看家庭服务" : "Explore Home Services"} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/tools/solution-builder">
                  {lang === "zh" ? "使用方案配置工具" : "Use Solution Builder"}
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/contact">
                  {lang === "zh" ? "免费咨询" : "Free Consultation"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

