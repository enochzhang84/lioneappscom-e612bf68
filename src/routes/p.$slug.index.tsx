import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getPageBySlug, getToolsByPageSlug, type PageFull, type ToolCategory, type ToolItem } from "@/lib/cms.functions";
import { SiteLayout } from "@/components/SiteLayout";
import { mediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { z } from "zod";

export const Route = createFileRoute("/p/$slug/")({
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
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(search.cat ?? categories[0]?.id ?? null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Group items by category
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filter = (it: ToolItem) =>
      !q ||
      it.title.toLowerCase().includes(q) ||
      (it.description ?? "").toLowerCase().includes(q) ||
      (it.subtitle ?? "").toLowerCase().includes(q);
    return categories.map(c => ({
      cat: c,
      items: items.filter(it => it.category_id === c.id && filter(it)),
    }));
  }, [categories, items, query]);

  const totalMatches = grouped.reduce((n, g) => n + g.items.length, 0);

  const scrollTo = (id: string) => {
    setActiveId(id);
    navigate({ search: { cat: id }, replace: true });
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Scroll-spy: highlight active category as user scrolls
  useEffect(() => {
    if (query) return;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.getAttribute("data-cat-id"));
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [grouped, query]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">
        <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)] py-6">
          {/* Mobile chips */}
          <div className="md:hidden -mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-1">
              {categories.map(c => (
                <button key={c.id} type="button" onClick={() => scrollTo(c.id)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition
                    ${activeId === c.id ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-primary/40"}`}>
                  <span className="mr-1">{c.icon || "🧰"}</span>{c.title}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar (desktop) */}
          <aside className="hidden md:block">
            <nav className="sticky top-24 rounded-xl border border-border bg-card p-2 space-y-0.5 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <div className="px-3 py-3 mb-1 border-b border-border/60">
                <div className="text-base font-bold tracking-tight">{page.title}</div>
              </div>
              {categories.map(c => (
                <button key={c.id} type="button" onClick={() => scrollTo(c.id)}
                  className={`w-full text-left flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition
                    ${activeId === c.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/80 hover:bg-muted/70"}`}>
                  <span className="text-lg leading-none w-5 text-center">{c.icon || "🧰"}</span>
                  <span className="truncate">{c.title}</span>
                </button>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground px-3 py-2">暂无分类</p>
              )}
            </nav>
          </aside>

          {/* Right main */}
          <main className="min-w-0">
            {/* Search bar */}
            <div className="sticky top-16 z-10 -mx-4 md:mx-0 px-4 md:px-0 pb-4 pt-2 bg-background/80 backdrop-blur">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="输入关键词，按回车搜索..."
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-sm
                    placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
                />
              </div>
            </div>

            {categories.length === 0 && (
              <p className="text-muted-foreground text-sm py-8">此工具页面还没有分类。请在后台添加。</p>
            )}

            {query && totalMatches === 0 && (
              <p className="text-muted-foreground text-sm py-8">没有找到与 "{query}" 相关的工具。</p>
            )}

            <div className="space-y-10 pb-16">
              {grouped.map(({ cat, items }) =>
                items.length === 0 && query ? null : (
                  <section
                    key={cat.id}
                    data-cat-id={cat.id}
                    ref={el => { sectionRefs.current[cat.id] = el; }}
                    className="scroll-mt-24"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-block w-1 h-5 rounded bg-primary" />
                      <h2 className="text-lg font-semibold">{cat.title}</h2>
                      {cat.description && (
                        <span className="text-xs text-muted-foreground hidden sm:inline">· {cat.description}</span>
                      )}
                    </div>
                    {items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">此分类下暂无内容。</p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map(it => <ItemCard key={it.id} pageSlug={page.slug} item={it} />)}
                      </div>
                    )}
                  </section>
                )
              )}
            </div>
          </main>
        </div>
      </div>
    </SiteLayout>
  );
}

function ItemCard({ pageSlug, item }: { pageSlug: string; item: ToolItem }) {
  const external = item.link_url && /^https?:\/\//.test(item.link_url);
  const inner = (
    <div className="group h-full rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 grid place-items-center text-xl">
          {(item as ToolItem & { icon?: string | null }).icon || "🧰"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold truncate">{item.title}</h3>
            <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary shrink-0 transition" />
          </div>
          {item.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
          )}
        </div>
      </div>
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
