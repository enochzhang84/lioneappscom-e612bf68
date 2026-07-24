import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "zh" | "en";

const STORAGE_KEY = "lione:lang";

type Dict = Record<string, { zh: string; en: string }>;

// Central dictionary for nav, footer, homepage, common buttons.
export const dict: Dict = {
  // Nav
  "nav.home": { zh: "首页", en: "Home" },
  "nav.services": { zh: "服务", en: "Services" },
  "nav.projects": { zh: "项目案例", en: "Projects" },
  "nav.tools": { zh: "实用工具", en: "Tools" },
  "nav.ai": { zh: "AI 助手", en: "AI Assistant" },
  "nav.blog": { zh: "博客", en: "Blog" },
  "nav.about": { zh: "关于我们", en: "About" },
  "nav.contact": { zh: "联系我们", en: "Contact" },
  "nav.cta": { zh: "联系咨询", en: "Contact Us" },
  "nav.lang.zh": { zh: "中文", en: "中文" },
  "nav.lang.en": { zh: "EN", en: "EN" },

  // Services dropdown
  "svc.group.home": { zh: "家庭服务", en: "Home Services" },
  "svc.group.biz": { zh: "企业服务", en: "Business Services" },
  "svc.home.network": { zh: "家庭网络与 Wi-Fi", en: "Home Network & Wi-Fi" },
  "svc.home.nas": { zh: "NAS 与私有云", en: "NAS & Private Cloud" },
  "svc.home.smart": { zh: "智能家居网络", en: "Smart Home Network" },
  "svc.home.media": { zh: "家庭影音与媒体中心", en: "Home Media Center" },
  "svc.biz.website": { zh: "企业网站建设", en: "Business Websites" },
  "svc.biz.software": { zh: "定制软件开发", en: "Custom Software" },
  "svc.biz.office": { zh: "企业办公平台", en: "Business Office Platforms" },
  "svc.biz.cloud": { zh: "云服务器部署与维护", en: "Cloud Deployment & Support" },

  // Hero
  "hero.title": {
    zh: "为家庭与小型企业打造可靠的数字生活",
    en: "Smart IT Solutions for Home and Small Business",
  },
  "hero.subtitle": {
    zh: "从家庭网络、NAS 私有云和智能家居，到企业网站、定制软件与办公平台，Lione Apps 为您提供规划、搭建、部署和长期维护服务。",
    en: "From home networks, NAS private cloud and smart home systems to business websites, custom software and office platforms, Lione Apps provides complete setup, deployment and ongoing support.",
  },
  "hero.cta1": { zh: "查看服务", en: "Explore Services" },
  "hero.cta2": { zh: "免费咨询", en: "Free Consultation" },
  "hero.tags": {
    zh: "家庭网络 · NAS 私有云 · 智能家居 · 企业网站 · 定制软件",
    en: "Home Network · NAS · Smart Home · Business Websites · Custom Software",
  },

  // Services section
  "services.title": { zh: "我们的服务", en: "Our Services" },
  "services.desc": {
    zh: "从家庭数字生活到企业日常运营，为您提供真正实用、容易维护的技术解决方案。",
    en: "Practical and maintainable technology solutions for your home, organization and growing business.",
  },
  "services.s1.t": { zh: "家庭网络与 Wi-Fi", en: "Home Network & Wi-Fi" },
  "services.s1.d": {
    zh: "家庭网络规划、路由器配置、全屋 Wi-Fi 覆盖、网络优化和故障排查。",
    en: "Home network planning, router setup, whole-home Wi-Fi coverage, performance optimization and troubleshooting.",
  },
  "services.s2.t": { zh: "NAS 与私有云", en: "NAS & Private Cloud" },
  "services.s2.d": {
    zh: "搭建家庭数据中心，实现照片、文件、影音资料的集中存储、自动备份和安全远程访问。",
    en: "Centralize photos, documents and media with secure storage, automatic backup and remote access.",
  },
  "services.s3.t": { zh: "智能家居与家庭影音", en: "Smart Home & Media" },
  "services.s3.d": {
    zh: "整合智能设备、摄像头、门锁、电视、音响和家庭影音系统，打造稳定易用的智能家庭网络。",
    en: "Integrate smart devices, cameras, locks, TVs, audio systems and home media into one reliable network.",
  },
  "services.s4.t": { zh: "企业网站建设", en: "Business Websites" },
  "services.s4.d": {
    zh: "为小型企业、教会和组织建设简洁、专业、支持手机访问的品牌官网和信息展示网站。",
    en: "Professional, responsive websites for small businesses, churches and local organizations.",
  },
  "services.s5.t": { zh: "定制软件开发", en: "Custom Software" },
  "services.s5.d": {
    zh: "根据实际工作流程开发 CRM、库存、报价、登记、排班、统计和行业管理系统。",
    en: "Custom CRM, inventory, estimating, registration, scheduling, reporting and industry management systems.",
  },
  "services.s6.t": { zh: "企业办公与云部署", en: "Business Platforms & Cloud" },
  "services.s6.d": {
    zh: "搭建企业办公平台，并提供 VPS、Docker、数据库、域名、SSL、备份和长期系统维护。",
    en: "Business management platforms with VPS, Docker, database, domain, SSL, backup and ongoing maintenance.",
  },

  // Who we help
  "who.title": { zh: "我们为谁服务", en: "Who We Help" },
  "who.h.t": { zh: "家庭用户", en: "Home Users" },
  "who.h.d": {
    zh: "需要改善家庭 Wi-Fi、建立 NAS 私有云、集中保存家庭照片和影音资料的用户。",
    en: "For families that need better Wi-Fi, NAS storage, private cloud, backup and home media solutions.",
  },
  "who.b.t": { zh: "小型企业", en: "Small Businesses" },
  "who.b.d": {
    zh: "需要企业网站、办公系统、库存管理、报价系统和日常技术支持的小型企业。",
    en: "For businesses that need websites, office systems, inventory, estimates and ongoing IT support.",
  },
  "who.c.t": { zh: "教会与非营利组织", en: "Churches & Nonprofits" },
  "who.c.d": {
    zh: "需要新人登记、课程管理、活动报名、签到统计和数字标牌系统的组织。",
    en: "For organizations that need registration, classes, events, attendance, reporting and digital signage.",
  },

  // Process
  "proc.title": { zh: "合作流程", en: "How We Work" },
  "proc.p1.t": { zh: "了解需求", en: "Discovery" },
  "proc.p1.d": {
    zh: "了解现有设备、网络环境和业务问题。",
    en: "We review your current devices, network and business needs.",
  },
  "proc.p2.t": { zh: "制定方案", en: "Solution Design" },
  "proc.p2.d": {
    zh: "提供清晰的设备、软件、预算和实施方案。",
    en: "We prepare a clear plan for equipment, software, budget and implementation.",
  },
  "proc.p3.t": { zh: "安装与部署", en: "Setup & Deployment" },
  "proc.p3.d": {
    zh: "完成网络搭建、软件开发、服务器配置或网站上线。",
    en: "We install the network, build the software, configure the server or launch the website.",
  },
  "proc.p4.t": { zh: "维护与支持", en: "Ongoing Support" },
  "proc.p4.d": {
    zh: "提供后续优化、备份、升级和技术支持。",
    en: "We provide maintenance, backup, upgrades and technical support.",
  },

  // Cases
  "cases.title": { zh: "项目案例", en: "Recent Projects" },
  "cases.view": { zh: "查看项目", en: "View Project" },
  "cases.viewAll": { zh: "查看全部案例", en: "View All Projects" },

  // Why
  "why.title": { zh: "为什么选择 Lione Apps", en: "Why Choose Lione Apps" },
  "why.i1": {
    zh: "家庭网络与软件服务一体化",
    en: "Integrated home IT and software services",
  },
  "why.i2": {
    zh: "根据实际需求提供定制方案",
    en: "Solutions designed around real customer needs",
  },
  "why.i3": {
    zh: "支持 NAS、VPS、Docker 和数据库部署",
    en: "NAS, VPS, Docker and database deployment",
  },
  "why.i4": {
    zh: "网站、软件和服务器可以统一维护",
    en: "Unified website, software and server maintenance",
  },
  "why.i5": {
    zh: "提供长期升级、备份和技术支持",
    en: "Ongoing upgrades, backup and technical support",
  },
  "why.i6": {
    zh: "适合家庭、教会和小型企业",
    en: "Designed for homes, churches and small businesses",
  },

  // Bottom CTA
  "cta.title": { zh: "不确定从哪里开始？", en: "Not Sure Where to Start?" },
  "cta.desc": {
    zh: "告诉我们您目前遇到的问题。无论是家庭 Wi-Fi、NAS、智能家居，还是企业网站和定制软件，我们都会为您推荐合适的解决方案。",
    en: "Tell us what you are trying to improve. Whether it is home Wi-Fi, NAS, smart home, a business website or custom software, we will help you find the right solution.",
  },
  "cta.free": { zh: "免费咨询", en: "Free Consultation" },
  "cta.email": { zh: "发送邮件", en: "Send Email" },

  // Footer
  "footer.brand.desc": {
    zh: "为家庭、组织和小型企业提供网络、软件与云平台解决方案。",
    en: "Network, software and cloud solutions for homes, organizations and small businesses.",
  },
  "footer.services": { zh: "服务", en: "Services" },
  "footer.company": { zh: "公司", en: "Company" },
  "footer.cases": { zh: "项目案例", en: "Projects" },
  "footer.about": { zh: "关于我们", en: "About" },
  "footer.contact": { zh: "联系我们", en: "Contact" },
  "footer.rights": { zh: "版权所有", en: "All rights reserved." },

  // SEO
  "seo.home.title": {
    zh: "Lione Apps — 家庭与小型企业 IT 解决方案",
    en: "Lione Apps — IT Solutions for Home & Small Business",
  },
  "seo.home.desc": {
    zh: "为个人、家庭和小型企业提供家庭网络、NAS 私有云、智能家居、企业网站、定制软件和办公平台服务。",
    en: "Home network, NAS private cloud, smart home, business website, custom software and office platform services for homes and small businesses.",
  },
  "seo.services.title": {
    zh: "Lione Apps 服务 — 家庭网络、NAS、智能家居与企业软件",
    en: "Lione Apps Services — Home Network, NAS, Smart Home & Business Software",
  },
  "seo.services.desc": {
    zh: "为家庭提供 Wi-Fi、NAS 私有云、智能家居和家庭影音服务,并为小型企业提供网站、定制软件、办公平台和云服务器部署。",
    en: "Home Wi-Fi, NAS private cloud, smart home and media services, plus business websites, custom software, office platforms and cloud deployment for small businesses.",
  },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict) => string;
};

const LangContext = createContext<Ctx | null>(null);

function detectDefault(): Lang {
  if (typeof window === "undefined") return "zh";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "zh" || saved === "en") return saved;
  } catch {
    /* ignore */
  }
  const nav = (typeof navigator !== "undefined" && navigator.language) || "";
  return nav.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // SSR-safe: always start with "zh" to match server HTML, then reconcile on mount.
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    const l = detectDefault();
    if (l !== lang) setLangState(l);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    try {
      document.documentElement.lang = l === "zh" ? "zh-CN" : "en";
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    } catch {
      /* ignore */
    }
  }, [lang]);

  const t = useCallback(
    (key: keyof typeof dict) => {
      const entry = dict[key];
      if (!entry) return String(key);
      return entry[lang];
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) {
    // Fallback so components that render outside the provider (edge cases) still work.
    return {
      lang: "zh",
      setLang: () => {},
      t: (k) => (dict[k]?.zh ?? String(k)),
    };
  }
  return ctx;
}

export function useT() {
  return useLang().t;
}
