import * as React from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getToolItem, type PageFull, type ToolItem, type ToolCategory } from "@/lib/cms.functions";
import { SiteLayout } from "@/components/SiteLayout";
import { mediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Maximize2, Loader2, AlertTriangle } from "lucide-react";
import { QuizApp } from "./p.drive.c1";

const EMBEDDED_APPS: Record<string, { render: () => React.ReactElement; fullPath?: string }> = {
  "app:drive-c1": { render: () => <QuizApp embedded />, fullPath: "/p/drive/c1" },
  "/p/drive/c1": { render: () => <QuizApp embedded />, fullPath: "/p/drive/c1" },
};

class EmbedErrorBoundary extends React.Component<
  { fullPath?: string; children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-2xl px-4 md:px-6 py-10">
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <AlertTriangle className="mx-auto mb-3 text-destructive" size={28} />
            <h3 className="text-lg font-semibold">加载失败</h3>
            <p className="mt-2 text-sm text-muted-foreground break-words">
              {this.state.error.message || "嵌入的应用无法加载，请稍后再试。"}
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
              <Button size="sm" onClick={() => this.setState({ error: null })}>重新加载</Button>
              {this.props.fullPath && (
                <Button asChild size="sm" variant="outline">
                  <a href={this.props.fullPath}>打开完整考试页</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function EmbedFallback() {
  return (
    <div className="mx-auto max-w-2xl px-4 md:px-6 py-16 flex flex-col items-center text-center">
      <Loader2 className="animate-spin text-primary" size={28} />
      <p className="mt-3 text-sm text-muted-foreground">正在加载考试程序…</p>
    </div>
  );
}

export const Route = createFileRoute("/p/$slug/i/$itemSlug")({
  loader: async ({ params }) => {
    const data = await getToolItem({ data: { pageSlug: params.slug, itemSlug: params.itemSlug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.item.title} · ${loaderData.page.title}` }] : [],
  }),
  component: ItemDetail,
});

function ItemDetail() {
  const { page, item, category } = Route.useLoaderData() as {
    page: PageFull; item: ToolItem; category: ToolCategory | null;
  };

  const appKey = item.link_url?.trim() || "";
  const embed = appKey ? EMBEDDED_APPS[appKey] : undefined;
  if (embed) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-5xl px-4 md:px-6 pt-4 md:pt-6 flex flex-wrap items-center justify-between gap-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/p/$slug" params={{ slug: page.slug }} search={{ cat: category?.id }}>
              <ArrowLeft size={14} className="mr-1" /> 返回 {page.title}
            </Link>
          </Button>
          {embed.fullPath && (
            <Button asChild variant="outline" size="sm">
              <a href={embed.fullPath}>
                <Maximize2 size={14} className="mr-1" /> 打开完整考试页
              </a>
            </Button>
          )}
        </div>
        <EmbedErrorBoundary fullPath={embed.fullPath}>
          <React.Suspense fallback={<EmbedFallback />}>
            {embed.render()}
          </React.Suspense>
        </EmbedErrorBoundary>
      </SiteLayout>
    );
  }


  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-6 py-10 md:py-16">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link to="/p/$slug" params={{ slug: page.slug }} search={{ cat: category?.id }}>
            <ArrowLeft size={14} className="mr-1" /> 返回 {page.title}
          </Link>
        </Button>

        {category && (
          <div className="text-xs text-primary mb-2">
            <span className="mr-1">{category.icon || "🧰"}</span>{category.title}
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{item.title}</h1>
        {item.subtitle && (
          <p className="mt-3 text-lg text-muted-foreground">{item.subtitle}</p>
        )}
        <div className="mt-2 text-sm text-muted-foreground">
          {new Date(item.created_at).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
        </div>

        {item.description && (
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{item.description}</p>
        )}

        {item.image_url && (
          <img src={mediaUrl(item.image_url) ?? ""} alt={item.title}
            className="mt-8 w-full rounded-lg border border-border" />
        )}

        {item.content && (
          <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed">{item.content}</div>
        )}

        {item.html_content && (
          <div className="mt-8 prose prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: item.html_content }} />
        )}

        {item.video_url && (
          <div className="mt-8 aspect-video rounded-lg overflow-hidden border border-border bg-muted">
            <iframe src={toEmbed(item.video_url)} title={item.title}
              className="w-full h-full" allowFullScreen
              allow="accelerometer; autoplay; encrypted-media; picture-in-picture" />
          </div>
        )}

        {item.link_url && (
          <div className="mt-8">
            <Button asChild>
              <a href={item.link_url} target={/^https?:\/\//.test(item.link_url) ? "_blank" : undefined}
                rel="noreferrer">
                {item.button_text || "打开链接"}
                <ExternalLink size={14} className="ml-1" />
              </a>
            </Button>
          </div>
        )}

        <div className="mt-12 border-t border-border pt-6">
          <Button asChild variant="outline" size="sm">
            <Link to="/p/$slug" params={{ slug: page.slug }} search={{ cat: category?.id }}>
              <ArrowLeft size={14} className="mr-1" /> 返回列表
            </Link>
          </Button>
        </div>
      </article>
    </SiteLayout>
  );
}

function toEmbed(url: string): string {
  // YouTube watch → embed
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}
