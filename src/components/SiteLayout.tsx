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
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listNavPages } from "@/lib/cms.functions";

const ADMIN_SECRET = "Loveliang@2026";

const productLinks = [
  { slug: "church", label: "教会管理平台", desc: "HOC3 — 事工全流程管理" },
  { slug: "renovation", label: "装修报价平台", desc: "项目报价与客户管理" },
  { slug: "office", label: "企业办公平台", desc: "考勤、排班、任务统计" },
  { slug: "custom", label: "定制开发", desc: "按需打造的专属系统" },
] as const;


export function SiteLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState("");

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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 font-bold select-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              L
            </div>
            <span>Lione Apps</span>
          </Link>


          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground font-medium" }}>
                    首页
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-muted-foreground hover:text-foreground data-[state=open]:text-foreground">
                  产品
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[420px] gap-2 p-3 md:grid-cols-2">
                    {productLinks.map((p) => (
                      <li key={p.slug}>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/products/$slug"
                            params={{ slug: p.slug }}
                            className="block rounded-md p-3 hover:bg-accent"
                          >
                            <div className="text-sm font-medium">{p.label}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground">{p.desc}</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Link to="/cases" activeProps={{ className: "text-foreground font-medium" }}>案例</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Link to="/about" activeProps={{ className: "text-foreground font-medium" }}>关于我们</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Link to="/contact" activeProps={{ className: "text-foreground font-medium" }}>联系我们</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Button asChild size="sm">
            <Link to="/contact">联系咨询</Link>
          </Button>
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
            <p className="mt-3 text-muted-foreground">
              为教会、组织与小型企业打造专属管理平台。
            </p>
          </div>
          <div>
            <div className="font-semibold mb-3">产品</div>
            <ul className="space-y-2 text-muted-foreground">
              {productLinks.map((p) => (
                <li key={p.slug}><Link to="/products/$slug" params={{ slug: p.slug }} className="hover:text-foreground">{p.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">公司</div>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/cases" className="hover:text-foreground">项目案例</Link></li>
              <li><Link to="/about" className="hover:text-foreground">关于我们</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">联系我们</Link></li>
              <li><a href="mailto:hello@lioneapps.com" className="hover:text-foreground">hello@lioneapps.com</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Lione Apps. All rights reserved.</span>
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
