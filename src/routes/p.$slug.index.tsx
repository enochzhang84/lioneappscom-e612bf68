import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getPageBySlug, getToolsByPageSlug, type PageFull, type ToolCategory, type ToolItem } from "@/lib/cms.functions";
import { SiteLayout } from "@/components/SiteLayout";
import { mediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

export const Route = createFileRoute("/p/$slug")({
  validateSearch: z.object({ cat: z.string().optional() }).parse,
  loader: async ({ params }) => {
    const page = await getPageBySlug({ data: { slug: params.slug } });
    if (!page) throw notFound();
    if (page.page_type === "tools") {
      const bundle = await getToolsByPageSlug({ data: { slug: params.slug } });
      return { page, bundle };
    }
    return { page, bundle: null as null };
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
  const { page, bundle } = Route.useLoaderData() as {
    page: PageFull;
    bundle: { page: PageFull; categories: ToolCategory[]; items: ToolItem[] } | null;
  };

  if (page.page_type === "tools" && bundle) {
    return <ToolsPageView page={page} categories={bundle.categories} items={bundle.items} />;
  }

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

        {toolCards.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-4">
            {toolCards.map((t, i) => <ToolCardView key={i} card={t} />)}
          </div>
        )}

        {blocks.length === 0 && (
          <p className="text-muted-foreground">此页面还没有内容。</p>
        )}
      </section>
    </SiteLayout>
  );
}

function ToolsPageView({ page, categories, items }: {
  page: PageFull; categories: ToolCategory[]; items: ToolItem[];
}) {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const activeId = search.cat ?? categories[0]?.id ?? null;
  const [mobileActive, setMobileActive] = useState(activeId);
  const active = activeId ?? mobileActive;

  const shown = useMemo(
    () => items.filter(it => it.category_id === active),
    [items, active],
  );
  const activeCat = categories.find(c => c.id === active) ?? null;

  const setActive = (id: string) => {
    setMobileActive(id);
    navigate({ search: { cat: id }, replace: true });
  };

  return (
    <SiteLayout>
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{page.title}</h1>
          <p className="text-muted-foreground mt-2">分类清晰的工具与知识库</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        {categories.length === 0 ? (
          <p className="text-muted-foreground">此工具页面还没有分类。</p>
        ) : (
          <>
            {/* Mobile category chips */}
            <div className="md:hidden -mx-6 px-6 mb-6 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {categories.map(c => (
                  <button key={c.id} type="button" onClick={() => setActive(c.id)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition
                      ${active === c.id ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:border-primary/40"}`}>
                    <span className="mr-1">{c.icon || "🧰"}</span>{c.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-[240px_1fr]">
              {/* Sidebar (desktop) */}
              <aside className="hidden md:block">
                <nav className="sticky top-24 space-y-1">
                  {categories.map(c => (
                    <button key={c.id} type="button" onClick={() => setActive(c.id)}
                      className={`w-full text-left flex items-start gap-2 rounded-lg px-3 py-2.5 transition
                        ${active === c.id ? "bg-primary/10 text-foreground border border-primary/30"
                          : "hover:bg-muted/60 border border-transparent"}`}>
                      <span className="text-xl leading-none">{c.icon || "🧰"}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium truncate">{c.title}</span>
                        {c.description && (
                          <span className="block text-xs text-muted-foreground line-clamp-2">{c.description}</span>
                        )}
                      </span>
                    </button>
                  ))}
                </nav>
              </aside>

              {/* Right content */}
              <div className="min-w-0 space-y-4">
                {activeCat && (
                  <div className="mb-2">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <span>{activeCat.icon || "🧰"}</span>{activeCat.title}
                    </h2>
                    {activeCat.description && (
                      <p className="text-sm text-muted-foreground mt-1">{activeCat.description}</p>
                    )}
                  </div>
                )}
                {shown.length === 0 ? (
                  <p className="text-muted-foreground text-sm">此分类下暂无内容。</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {shown.map(it => <ItemCard key={it.id} pageSlug={page.slug} item={it} />)}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}

function ItemCard({ pageSlug, item }: { pageSlug: string; item: ToolItem }) {
  const external = item.link_url && /^https?:\/\//.test(item.link_url);
  const inner = (
    <div className="group h-full rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold min-w-0 truncate">{item.title}</h3>
        <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary shrink-0 transition" />
      </div>
      {item.description && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{item.description}</p>
      )}
      {item.button_text && (
        <div className="mt-3 text-xs text-primary">{item.button_text} →</div>
      )}
    </div>
  );
  if (external) {
    return <a href={item.link_url!} target="_blank" rel="noreferrer">{inner}</a>;
  }
  if (item.link_url) {
    return <a href={item.link_url}>{inner}</a>;
  }
  return (
    <Link to="/p/$slug/i/$itemSlug" params={{ slug: pageSlug, itemSlug: item.slug }}>
      {inner}
    </Link>
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
        <a href={block.href}>{btn}</a>
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

function ToolCardView({ card }: { card: Extract<Block, { type: "tool_card" }> }) {
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
    <a href={card.href}>{inner}</a>
  );
}
