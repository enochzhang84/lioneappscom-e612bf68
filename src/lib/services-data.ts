import {
  Wifi,
  HardDrive,
  Home as HomeIcon,
  Film,
  Globe,
  Code2,
  Users,
  Cloud,
  type LucideIcon,
} from "lucide-react";
import imgHomeNetwork from "@/assets/service-home-network.jpg";
import imgNas from "@/assets/service-nas.jpg";
import imgSmartHome from "@/assets/service-smart-home.jpg";
import imgWebsites from "@/assets/service-websites.jpg";
import imgCustomSoftware from "@/assets/service-custom-software.jpg";
import imgBusinessPlatforms from "@/assets/service-business-platforms.jpg";

export type ServiceCategory = "home" | "business";

export type ServiceItem = {
  id: string;
  category: ServiceCategory;
  anchor: string;
  icon: LucideIcon;
  // Illustration gradient (used in lieu of stock photos — clean, modern, brand-consistent)
  gradient: string;
  /** Optional hero image URL. Homepage service grid shows only items that have this. */
  image?: string;
  title: { zh: string; en: string };
  short: { zh: string; en: string };
  full: { zh: string; en: string };
  useCases: { zh: string[]; en: string[] };
  imageAlt: { zh: string; en: string };
};

export const services: ServiceItem[] = [
  // ============ Home ============
  {
    id: "home-network",
    category: "home",
    anchor: "home-network",
    icon: Wifi,
    gradient: "linear-gradient(135deg,#2563EB 0%,#38BDF8 100%)",
    title: { zh: "家庭网络与 Wi-Fi", en: "Home Network & Wi-Fi" },
    short: {
      zh: "为家庭规划稳定的网络结构,改善弱信号、网络死角、速度不稳定和多设备连接问题。",
      en: "We design reliable home networks that improve weak signals, dead zones, unstable speeds and multi-device connectivity.",
    },
    full: {
      zh: "如今的家庭同时连接手机、电脑、电视、摄像头、游戏机、音响和智能设备。普通路由器往往无法保证全屋稳定覆盖。合理规划家庭网络和 Mesh Wi-Fi,可以让远程办公、在线学习、4K 影音、游戏和智能家居设备运行得更加稳定。",
      en: "Modern homes connect phones, computers, TVs, cameras, game consoles, audio systems and smart devices at the same time. A basic router may not provide reliable whole-home coverage. A properly planned network and Mesh Wi-Fi system can improve remote work, online learning, 4K streaming, gaming and smart home performance.",
    },
    useCases: {
      zh: [
        "全屋 Wi-Fi 覆盖",
        "Mesh 网络搭建",
        "路由器配置",
        "网络死角改善",
        "有线网络规划",
        "多楼层住宅网络",
        "网络速度与稳定性优化",
        "家庭远程办公网络",
      ],
      en: [
        "Whole-home Wi-Fi coverage",
        "Mesh network setup",
        "Router configuration",
        "Dead zone reduction",
        "Wired network planning",
        "Multi-story home networking",
        "Speed and stability optimization",
        "Home office networking",
      ],
    },
    imageAlt: {
      zh: "现代住宅内的 Mesh Wi-Fi 网络与多设备连接示意",
      en: "Modern home with Mesh Wi-Fi covering multiple connected devices",
    },
  },
  {
    id: "nas-private-cloud",
    category: "home",
    anchor: "nas-private-cloud",
    icon: HardDrive,
    gradient: "linear-gradient(135deg,#0EA5E9 0%,#6366F1 100%)",
    title: { zh: "NAS 与私有云", en: "NAS & Private Cloud" },
    short: {
      zh: "建立属于自己的家庭数据中心,集中保存照片、视频、文件和家庭影音资料。",
      en: "Build your own home data center for centralized storage of photos, videos, documents and media.",
    },
    full: {
      zh: "随着手机照片、家庭视频和重要文件不断增加,只依赖手机、移动硬盘或公共云服务容易造成数据分散、空间不足和隐私风险。NAS 可以帮助家庭建立自己的私有云,实现自动备份、文件共享、远程访问和家庭成员共同使用。",
      en: "As photos, family videos and important documents continue to grow, relying only on phones, external drives or public cloud services can lead to scattered files, limited storage and privacy concerns. A NAS creates a private cloud with automatic backup, file sharing, remote access and shared family storage.",
    },
    useCases: {
      zh: [
        "手机照片自动备份",
        "家庭视频集中存储",
        "文件共享",
        "多设备同步",
        "安全远程访问",
        "电脑自动备份",
        "家庭影音资料库",
        "数据备份与恢复",
      ],
      en: [
        "Automatic phone photo backup",
        "Centralized family video storage",
        "File sharing",
        "Multi-device synchronization",
        "Secure remote access",
        "Computer backup",
        "Home media library",
        "Data backup and recovery",
      ],
    },
    imageAlt: {
      zh: "NAS 设备与手机、电脑、电视同步照片和影音资料",
      en: "NAS device syncing photos and media across phone, computer and TV",
    },
  },
  {
    id: "smart-home",
    category: "home",
    anchor: "smart-home",
    icon: HomeIcon,
    gradient: "linear-gradient(135deg,#10B981 0%,#14B8A6 100%)",
    title: { zh: "智能家居网络", en: "Smart Home Network" },
    short: {
      zh: "整合摄像头、门锁、灯光、传感器和其他智能设备,让家庭设备连接更稳定、控制更简单。",
      en: "Integrate cameras, locks, lighting, sensors and smart devices into a more reliable and easier-to-manage home system.",
    },
    full: {
      zh: "智能家居设备越来越多,但如果网络规划不合理,不同品牌设备容易出现断线、延迟和控制混乱。通过合理划分网络、优化 Wi-Fi 覆盖和统一设备接入,可以提升家庭安全、便利性、节能效果和远程管理能力。",
      en: "As smart home devices increase, poor network planning can cause disconnections, delays and confusing controls across different brands. Proper network design, Wi-Fi optimization and organized device integration can improve security, convenience, energy efficiency and remote management.",
    },
    useCases: {
      zh: [
        "智能摄像头",
        "智能门锁",
        "智能灯光",
        "温度与环境传感器",
        "家庭自动化",
        "手机远程控制",
        "访客网络",
        "智能设备网络隔离",
      ],
      en: [
        "Smart cameras",
        "Smart locks",
        "Smart lighting",
        "Temperature and environment sensors",
        "Home automation",
        "Mobile remote control",
        "Guest network",
        "Smart device network isolation",
      ],
    },
    imageAlt: {
      zh: "现代家庭智能控制界面,含门锁、灯光、摄像头与温控",
      en: "Modern smart home dashboard with locks, lighting, cameras and climate control",
    },
  },
  {
    id: "home-media",
    category: "home",
    anchor: "home-media",
    icon: Film,
    gradient: "linear-gradient(135deg,#D97706 0%,#F59E0B 100%)",
    title: { zh: "家庭影音与媒体中心", en: "Home Media Center" },
    short: {
      zh: "将电视、音响、功放、NAS 和影音资料连接起来,打造方便管理的家庭娱乐中心。",
      en: "Connect TVs, audio systems, receivers, NAS storage and media libraries into one convenient home entertainment center.",
    },
    full: {
      zh: "家庭影音已经从单独看电视,发展为多设备、多房间和本地媒体库。通过合理连接电视、音响、功放、NAS 和播放器,可以实现家庭电影、音乐、照片和视频的集中管理与播放。",
      en: "Home entertainment has evolved beyond a single television into multi-device, multi-room and local media experiences. By connecting TVs, audio systems, receivers, NAS storage and players, families can centrally manage and enjoy movies, music, photos and videos.",
    },
    useCases: {
      zh: [
        "家庭影院",
        "NAS 影音库",
        "多房间音乐",
        "电视与音响连接",
        "本地电影播放",
        "家庭照片展示",
        "影音设备整理",
        "远程媒体访问",
      ],
      en: [
        "Home theater",
        "NAS media library",
        "Multi-room audio",
        "TV and audio integration",
        "Local movie playback",
        "Family photo display",
        "Media device organization",
        "Remote media access",
      ],
    },
    imageAlt: {
      zh: "现代客厅家庭影院与 NAS 媒体中心组合",
      en: "Modern living room home theater with NAS media center",
    },
  },
  // ============ Business ============
  {
    id: "business-websites",
    category: "business",
    anchor: "business-websites",
    icon: Globe,
    gradient: "linear-gradient(135deg,#2563EB 0%,#7C3AED 100%)",
    title: { zh: "企业网站建设", en: "Business Websites" },
    short: {
      zh: "为小型企业、教会和组织建设简洁、专业、适合手机访问的官方网站。",
      en: "Professional and mobile-friendly websites for small businesses, churches and local organizations.",
    },
    full: {
      zh: "现在很多客户在联系企业之前,会先通过 Google 搜索、社交平台或网站了解服务。专业网站不仅是公司介绍,也是品牌形象、客户信任和业务咨询的重要入口。对于小型企业,简洁、快速和容易维护的网站比复杂网站更加实用。",
      en: "Many customers now research a business through Google, social platforms or its website before making contact. A professional website supports brand identity, customer trust and lead generation. For small businesses, a simple, fast and maintainable website is often more valuable than an overly complicated one.",
    },
    useCases: {
      zh: [
        "企业官网",
        "品牌展示网站",
        "服务介绍页面",
        "教会与组织网站",
        "联系表单",
        "手机响应式页面",
        "基础 SEO",
        "域名与 SSL 配置",
      ],
      en: [
        "Business websites",
        "Brand presentation sites",
        "Service pages",
        "Church and organization websites",
        "Contact forms",
        "Mobile-responsive pages",
        "Basic SEO",
        "Domain and SSL setup",
      ],
    },
    imageAlt: {
      zh: "响应式企业网站在电脑、平板和手机端的展示",
      en: "Responsive business website shown on desktop, tablet and mobile",
    },
  },
  {
    id: "custom-software",
    category: "business",
    anchor: "custom-software",
    icon: Code2,
    gradient: "linear-gradient(135deg,#7C3AED 0%,#EC4899 100%)",
    title: { zh: "定制软件开发", en: "Custom Software" },
    short: {
      zh: "根据企业真实工作流程开发管理系统,减少重复操作和人工记录。",
      en: "Custom management systems designed around real business workflows to reduce repetitive work and manual records.",
    },
    full: {
      zh: "许多小型企业仍依赖 Excel、纸张、短信和多个不同工具处理客户、库存、报价、登记和统计。定制软件可以把这些流程集中到一个系统中,让数据更清晰、操作更简单,也方便未来继续扩展。",
      en: "Many small businesses still rely on spreadsheets, paper, messages and disconnected tools to manage customers, inventory, estimates, registration and reporting. Custom software can centralize these workflows into one system, making data clearer, operations simpler and future expansion easier.",
    },
    useCases: {
      zh: [
        "CRM 客户管理",
        "库存管理",
        "报价系统",
        "登记系统",
        "排班系统",
        "订单与用料管理",
        "数据统计",
        "行业管理平台",
      ],
      en: [
        "CRM",
        "Inventory management",
        "Estimating systems",
        "Registration systems",
        "Scheduling",
        "Order and material management",
        "Reporting",
        "Industry management platforms",
      ],
    },
    imageAlt: {
      zh: "企业 Dashboard、CRM、库存与报表界面组合",
      en: "Business dashboard combining CRM, inventory and reporting screens",
    },
  },
  {
    id: "business-platforms",
    category: "business",
    anchor: "business-platforms",
    icon: Users,
    gradient: "linear-gradient(135deg,#0EA5E9 0%,#2563EB 100%)",
    title: { zh: "企业办公平台", en: "Business Office Platforms" },
    short: {
      zh: "将员工、任务、排班、考勤、审批和统计整合到统一的办公平台中。",
      en: "Bring employees, tasks, scheduling, attendance, approvals and reporting into one unified office platform.",
    },
    full: {
      zh: "当企业规模增加后,依赖聊天软件和人工记录容易造成任务遗漏、信息分散和统计困难。统一办公平台可以让管理者更清楚地了解员工安排、任务进度和业务数据。",
      en: "As a business grows, relying on chat tools and manual records can lead to missed tasks, scattered information and difficult reporting. A unified office platform gives managers clearer visibility into employee schedules, task progress and business data.",
    },
    useCases: {
      zh: [
        "员工管理",
        "考勤",
        "排班",
        "任务分配",
        "工作记录",
        "权限管理",
        "数据统计",
        "内部通知",
      ],
      en: [
        "Employee management",
        "Attendance",
        "Scheduling",
        "Task assignment",
        "Work records",
        "Permission management",
        "Reporting",
        "Internal notifications",
      ],
    },
    imageAlt: {
      zh: "现代办公管理平台的员工、任务、排班与统计 Dashboard",
      en: "Modern office management platform with employee, task, scheduling and reporting dashboards",
    },
  },
  {
    id: "cloud-deployment",
    category: "business",
    anchor: "cloud-deployment",
    icon: Cloud,
    gradient: "linear-gradient(135deg,#0F766E 0%,#0EA5E9 100%)",
    title: { zh: "云服务器部署与维护", en: "Cloud Deployment & Support" },
    short: {
      zh: "为网站和软件提供 VPS、Docker、数据库、域名、SSL、备份和长期维护服务。",
      en: "VPS, Docker, database, domain, SSL, backup and ongoing maintenance for websites and software platforms.",
    },
    full: {
      zh: "网站和软件上线后,需要稳定的服务器、安全证书、数据库、备份和持续维护。合理部署云服务器可以让系统更加稳定、安全,也方便后续升级和远程管理。",
      en: "After a website or software platform goes live, it needs reliable hosting, security certificates, databases, backups and ongoing maintenance. Proper cloud deployment improves stability, security, future upgrades and remote administration.",
    },
    useCases: {
      zh: [
        "VPS 部署",
        "Docker 部署",
        "数据库配置",
        "域名绑定",
        "SSL 证书",
        "自动备份",
        "系统更新",
        "故障排查与维护",
      ],
      en: [
        "VPS deployment",
        "Docker deployment",
        "Database configuration",
        "Domain setup",
        "SSL certificates",
        "Automated backup",
        "System updates",
        "Troubleshooting and maintenance",
      ],
    },
    imageAlt: {
      zh: "云服务器、Docker 容器、数据库与网站服务连接示意",
      en: "Cloud servers, Docker containers, databases and website services connected",
    },
  },
];

export const homeServices = services.filter((s) => s.category === "home");
export const businessServices = services.filter((s) => s.category === "business");

export function findService(anchor: string) {
  return services.find((s) => s.anchor === anchor);
}
