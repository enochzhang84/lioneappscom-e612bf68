import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getPageBySlug, type PageFull } from "@/lib/cms.functions";
import { SiteLayout } from "@/components/SiteLayout";
import { mediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    const page = await getPageBySlug({ data: { slug: params.slug } });
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.page.title} · Lione Apps` }] : [],
  }),
  component: DynamicPage,
});

type Block =
  | { type: "heading"; text: string; level?: 1 | 2 | 3 }
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; url: string | null; alt?: string }
  | { type: "button"; text: string; href: string; variant?: "primary" | "outline" }
  | { type: "section"; title: string; body: string }
  | { type: "html"; html: string }
  | { type: "tool_card"; title: string; desc: string; href: string; icon?: string };

function DynamicPage() {
  const { page } = Route.useLoaderData() as { page: PageFull };
  const blocks: Block[] = Array.isArray(page.content) ? (page.content as Block[]) : [];
  const toolCards = blocks.filter((b): b is Extract<Block, { type: "tool_card" }> => b.type === "tool_card");
  const nonToolBlocks = blocks.filter((b) => b.type !== "tool_card");

  return (
    <SiteLayout>
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{page.title}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 space-y-8">
        {nonToolBlocks.map((b, i) => <BlockRender key={i} block={b} />)}

        {page.page_type === "tools" && toolCards.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-4">
            {toolCards.map((t, i) => <ToolCard key={i} card={t} />)}
          </div>
        )}

        {blocks.length === 0 && (
          <p className="text-muted-foreground">此页面还没有内容。</p>
        )}
      </section>
    </SiteLayout>
  );
}

function BlockRender({ block }: { block: Block }) {
  switch (block.type) {
    case "heading": {
      const level = block.level ?? 2;
      const className =
        level === 1 ? "text-4xl md:text-5xl font-bold tracking-tight"
        : level === 2 ? "text-2xl md:text-3xl font-semibold tracking-tight"
        : "text-xl font-semibold";
      if (level === 1) return <h1 className={className}>{block.text}</h1>;
      if (level === 3) return <h3 className={className}>{block.text}</h3>;
      return <h2 className={className}>{block.text}</h2>;
    }
    case "subheading":
      return <p className="text-lg text-muted-foreground">{block.text}</p>;
    case "paragraph":
      return <p className="text-base leading-relaxed whitespace-pre-wrap">{block.text}</p>;
    case "image":
      return block.url ? (
        <img src={mediaUrl(block.url) ?? ""} alt={block.alt ?? ""} className="w-full rounded-lg border border-border" />
      ) : null;
    case "button": {
      const isExternal = /^https?:\/\//.test(block.href);
      const btn = (
        <Button variant={block.variant === "outline" ? "outline" : "default"}>
          {block.text}
        </Button>
      );
      return isExternal ? (
        <a href={block.href} target="_blank" rel="noreferrer">{btn}</a>
      ) : (
        <Link to={block.href}>{btn}</Link>
      );
    }
    case "section":
      return (
        <div className="rounded-lg border border-border bg-card p-6 space-y-2">
          <h3 className="text-xl font-semibold">{block.title}</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{block.body}</p>
        </div>
      );
    case "html":
      return <div dangerouslySetInnerHTML={{ __html: block.html }} />;
    case "tool_card":
      return null;
  }
}

function ToolCard({ card }: { card: Extract<Block, { type: "tool_card" }> }) {
  const isExternal = /^https?:\/\//.test(card.href);
  const inner = (
    <div className="group h-full rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-sm transition">
      <div className="text-3xl mb-3">{card.icon || "🧰"}</div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{card.title}</h3>
        <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition" />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
    </div>
  );
  return isExternal ? (
    <a href={card.href} target="_blank" rel="noreferrer">{inner}</a>
  ) : (
    <Link to={card.href}>{inner}</Link>
  );
}
