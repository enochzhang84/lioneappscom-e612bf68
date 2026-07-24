import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { usePlatform } from "@/lib/platform-bootstrap";
import { useLang } from "@/lib/i18n";
import { services } from "@/lib/services-data";

const ADMIN_SECRET = "love@liang2026";

export function SiteLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const { navPages } = usePlatform();
  const { lang, setLang, t } = useLang();

  function handleLogoClick(e: React.MouseEvent) {
    if (location.pathname !== "/") return;
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1500);
    if (clickCountRef.current >= 7) {
      e.preventDefault();
      clickCountRef.current = 0;
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      setPassword("");
      setDialogOpen(true);
    }
  }

  function handleSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_SECRET) {
      setDialogOpen(false);
      setPassword("");
      toast.success("验证通过，进入后台");
      navigate({ to: "/admin" });
    } else {
      toast.error("密码错误");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Toaster richColors position="top-center" />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 gap-4">
          <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2.5 font-bold select-none shrink-0 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              L
            </div>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate">Lione Apps</span>
              <span className="hidden sm:block truncate text-[10.5px] font-medium text-muted-foreground tracking-wide">
                {t("brand.tagline")}
              </span>
            </div>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {/* 1. Home */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground font-medium" }}>
                    {t("nav.home")}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* 2. Services — plain page link (was dropdown) */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Link to="/services" activeProps={{ className: "text-foreground font-medium" }}>
                    {t("nav.services")}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* 3. Projects (was 案例) */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Link to="/cases" activeProps={{ className: "text-foreground font-medium" }}>
                    {t("nav.projects")}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* 4-8. Untouched routes/paths — only display text is translated. */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Link to="/p/$slug" params={{ slug: "tools" }} activeProps={{ className: "text-foreground font-medium" }}>
                    {t("nav.tools")}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Link to="/p/$slug" params={{ slug: "ai" }} activeProps={{ className: "text-foreground font-medium" }}>
                    {t("nav.ai")}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Link to="/blog" activeProps={{ className: "text-foreground font-medium" }}>{t("nav.blog")}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Link to="/about" activeProps={{ className: "text-foreground font-medium" }}>{t("nav.about")}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Link to="/contact" activeProps={{ className: "text-foreground font-medium" }}>{t("nav.contact")}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Extra CMS-driven pages (excluding tools/ai which are already pinned above) */}
              {navPages?.filter((p) => p.slug !== "tools" && p.slug !== "ai").map((p) => (
                <NavigationMenuItem key={p.id}>
                  <NavigationMenuLink asChild className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                    <Link
                      to="/p/$slug"
                      params={{ slug: p.slug }}
                      activeProps={{ className: "text-foreground font-medium" }}
                    >
                      {p.nav_label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-3 shrink-0">
            {/* Language switcher — desktop + mobile */}
            <div className="flex items-center text-xs font-medium select-none">
              <button
                type="button"
                onClick={() => setLang("zh")}
                className={lang === "zh" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
                aria-pressed={lang === "zh"}
              >
                中文
              </button>
              <span className="mx-1.5 text-muted-foreground/50">|</span>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={lang === "en" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
                aria-pressed={lang === "en"}
              >
                EN
              </button>
            </div>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/contact">{t("nav.cta")}</Link>
            </Button>

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <nav className="flex flex-col gap-1 p-6 pt-10 text-base">
                  <MobileLink to="/" exact onNavigate={() => setMobileOpen(false)}>{t("nav.home")}</MobileLink>
                  <MobileLink to="/services" onNavigate={() => setMobileOpen(false)}>{t("nav.services")}</MobileLink>
                  <MobileLink to="/cases" onNavigate={() => setMobileOpen(false)}>{t("nav.projects")}</MobileLink>
                  <MobileLink to="/p/$slug" params={{ slug: "tools" }} onNavigate={() => setMobileOpen(false)}>{t("nav.tools")}</MobileLink>
                  <MobileLink to="/p/$slug" params={{ slug: "ai" }} onNavigate={() => setMobileOpen(false)}>{t("nav.ai")}</MobileLink>
                  <MobileLink to="/blog" onNavigate={() => setMobileOpen(false)}>{t("nav.blog")}</MobileLink>
                  <MobileLink to="/about" onNavigate={() => setMobileOpen(false)}>{t("nav.about")}</MobileLink>
                  <MobileLink to="/contact" onNavigate={() => setMobileOpen(false)}>{t("nav.contact")}</MobileLink>
                  {navPages?.filter((p) => p.slug !== "tools" && p.slug !== "ai").map((p) => (
                    <MobileLink key={p.id} to="/p/$slug" params={{ slug: p.slug }} onNavigate={() => setMobileOpen(false)}>
                      {p.nav_label}
                    </MobileLink>
                  ))}
                  <Button asChild size="sm" className="mt-4">
                    <Link to="/contact" onClick={() => setMobileOpen(false)}>{t("nav.cta")}</Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border mt-20">
        <div className="mx-auto max-w-6xl px-6 py-10 grid gap-8 md:grid-cols-3 text-sm">
          <div>
            <div className="flex items-center gap-2 font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs">
                L
              </div>
              <span>Lione Apps</span>
            </div>
            <p className="mt-2 text-xs font-medium text-foreground/80">{t("brand.tagline")}</p>
            <p className="mt-2 text-muted-foreground">{t("footer.brand.desc")}</p>
          </div>
          <div>
            <div className="font-semibold mb-3">{t("footer.services")}</div>
            <ul className="space-y-2 text-muted-foreground">
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    to="/services"
                    hash={s.anchor}
                    className="hover:text-foreground"
                  >
                    {s.title[lang]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">{t("footer.company")}</div>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/cases" className="hover:text-foreground">{t("footer.cases")}</Link></li>
              <li><Link to="/about" className="hover:text-foreground">{t("footer.about")}</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">{t("footer.contact")}</Link></li>
              <li><a href="mailto:hello@lioneapps.com" className="hover:text-foreground">hello@lioneapps.com</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Lione Apps. {t("footer.rights")}</span>
            <span>lioneapps.com</span>
          </div>
        </div>
      </footer>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>进入后台</DialogTitle>
            <DialogDescription>请输入管理员密码</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-secret">密码</Label>
              <Input
                id="admin-secret"
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">确定</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div
        className="absolute inset-0 -z-10 opacity-60"
        style={{ background: "radial-gradient(60% 50% at 50% 0%, oklch(0.55 0.22 264 / 0.18), transparent 70%)" }}
      />
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24 text-center">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-primary">
            {eyebrow}
          </div>
        )}
        <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
        {desc && <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{desc}</p>}
      </div>
    </section>
  );
}
