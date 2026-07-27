import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, FolderOpen, Clock, Trash2, Sparkles, Film } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { deleteProject, listProjects, saveProject } from "@/lib/photowall/store";
import { newProject, type PWProject, type AspectKey } from "@/lib/photowall/types";
import { TEMPLATES } from "@/lib/photowall/presets";
import { fmtTime } from "@/lib/photowall/render";
import { buildTimeline } from "@/lib/photowall/render";

export const Route = createFileRoute("/tools/photo-wall/")({
  head: () => ({
    meta: [
      { title: "Photo Wall Studio 照片墙工作室 — Lione Apps" },
      { name: "description", content: "专业级照片墙与视频编辑器：批量图片、模板、文字、音乐、动画、布局、时间轴与 MP4 导出，适合教会活动、退修会、圣诞节与毕业典礼。" },
      { property: "og:title", content: "Photo Wall Studio 照片墙工作室 — Lione Apps" },
      { property: "og:description", content: "在浏览器里制作教会活动照片墙与 MP4 视频，模板一键套用，支持音乐、动画与时间轴。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PhotoWallHome,
});

function PhotoWallHome() {
  const navigate = useNavigate();
  const [projects, setProjects] = React.useState<PWProject[]>([]);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  const reload = React.useCallback(() => {
    listProjects().then(setProjects).catch(() => setProjects([]));
  }, []);
  React.useEffect(() => reload(), [reload]);

  async function create(aspect: AspectKey = "16:9", templateKey?: string) {
    const p = newProject("未命名照片墙", aspect);
    const tpl = TEMPLATES.find((t) => t.key === templateKey);
    if (tpl) {
      p.name = tpl.name;
      p.settings = { ...p.settings, ...tpl.patch, openingText: tpl.opening, openingSub: tpl.openingSub, endingText: tpl.ending };
    }
    await saveProject(p);
    navigate({ to: "/tools/photo-wall/$id", params: { id: p.id } });
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-gradient-to-b from-primary/[0.06] to-transparent">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary">
            <Sparkles className="h-3 w-3" /> 实用工具
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Photo Wall Studio · 照片墙工作室</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            专业三栏编辑器：批量图片管理、模板中心、文字与经文、背景音乐、动画布局、播放时间轴与 MP4 导出。
            适用于主日、退修会、BBQ、圣诞节、洗礼、毕业典礼等活动照片墙。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" className="gap-2" onClick={() => void create("16:9")}><Plus className="h-4 w-4" /> 新建项目</Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => document.getElementById("recent")?.scrollIntoView({ behavior: "smooth" })}>
              <FolderOpen className="h-4 w-4" /> 打开项目
            </Button>
          </div>
        </div>
      </section>

      <section id="recent" className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight"><Clock className="h-5 w-5 text-primary" /> 最近项目</h2>
        {projects.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            还没有项目，点击「新建项目」或从下方模板中心开始。
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => {
              const tl = buildTimeline(p);
              return (
                <div key={p.id} className="group rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-2">
                    <button className="min-w-0 text-left" onClick={() => navigate({ to: "/tools/photo-wall/$id", params: { id: p.id } })}>
                      <div className="truncate font-semibold">{p.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {p.photos.length} 张图片 · {p.aspect} · {fmtTime(tl.total)}
                      </div>
                    </button>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${p.status === "published" ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {p.status === "published" ? "已发布" : "草稿"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">更新于 {new Date(p.updatedAt).toLocaleString()}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" className="h-7 gap-1 px-2 text-xs" onClick={() => navigate({ to: "/tools/photo-wall/$id", params: { id: p.id } })}>
                        <Film className="h-3 w-3" /> 打开
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => setConfirmId(p.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-xl font-bold tracking-tight">模板中心</h2>
        <p className="mt-1 text-sm text-muted-foreground">点击模板，自动创建项目并套用布局、动画、节奏与开场结束页。</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button key={t.key} onClick={() => void create("16:9", t.key)}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
              <span className="text-2xl">{t.emoji}</span>
              <span className="min-w-0">
                <span className="block font-semibold">{t.name}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{t.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(o) => !o && setConfirmId(null)}
        title="删除项目"
        description="删除后无法恢复，项目内的图片与音乐也会一并清除。"
        destructive
        onConfirm={async () => {
          if (confirmId) await deleteProject(confirmId);
          setConfirmId(null);
          reload();
        }}
      />
    </SiteLayout>
  );
}
