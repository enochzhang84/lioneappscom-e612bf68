import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getPageBySlug, getToolsByPageSlug, type PageFull, type ToolCategory, type ToolItem } from "@/lib/cms.functions";
import { SiteLayout } from "@/components/SiteLayout";
import { mediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useLang } from "@/lib/i18n";
import sbPcImg from "@/assets/sb-pc-builder.jpg";
import sbNasImg from "@/assets/sb-nas-builder.jpg";
import sbNetImg from "@/assets/sb-network-planner.jpg";
import sbFullImg from "@/assets/sb-full-solution.jpg";

export const Route = createFileRoute("/p/$slug/")({
  validateSearch: z.object({ cat: z.string().optional() }).parse,
  loader: async ({ params }) => {
    const page = await getPageBySlug({ data: { slug: params.slug } });
    if (!page) throw notFound();
    if (isToolsPage(page)) {
      const bundle = await getToolsByPageSlug({ data: { slug: params.slug } });
      return {
        page: bundle?.page ?? page,
        bundle: bundle ?? { page, categories: [], items: [] },
      };
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

  if (isToolsPage(page)) {
    if (page.slug === "ai") {
      return <AiHubView page={page} categories={bundle?.categories ?? []} items={bundle?.items ?? []} />;
    }
    return <ToolsPageView page={page} categories={bundle?.categories ?? []} items={bundle?.items ?? []} />;
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

function isToolsPage(page: Pick<PageFull, "page_type" | "slug">) {
  return String(page.page_type).trim().toLowerCase() === "tools" || String(page.slug).trim().toLowerCase() === "tools";
}

function ToolsPageView({ page, categories, items }: {
  page: PageFull; categories: ToolCategory[]; items: ToolItem[];
}) {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState("");
  const initialCat = search.cat ?? categories[0]?.id ?? null;
  const [activeId, setActiveId] = useState<string | null>(initialCat);

  const activeCat = categories.find(c => c.id === activeId) ?? categories[0] ?? null;

  const q = query.trim().toLowerCase();
  const matches = (it: ToolItem) =>
    !q ||
    it.title.toLowerCase().includes(q) ||
    (it.description ?? "").toLowerCase().includes(q) ||
    (it.subtitle ?? "").toLowerCase().includes(q);

  const catItems = items.filter((it) => activeCat ? it.category_id === activeCat.id : false);
  const topItems = catItems
    .filter((it) => !it.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order);
  const childrenOf = (parentId: string) =>
    catItems
      .filter((it) => it.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order);

  // groups: each top item either renders alone (no children) or as a group with children.
  // When searching, a group is shown if the group itself or any child matches.
  const visibleGroups = topItems
    .map((top) => ({ top, children: childrenOf(top.id) }))
    .filter(({ top, children }) => matches(top) || children.some(matches));

  const pick = (id: string) => {
    setActiveId(id);
    navigate({ search: { cat: id }, replace: true });
  };

  return (
    <SiteLayout>
      {/* Title section (full width) */}
      <section data-tools-layout="true" className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{page.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {(page.content && (page.content as { subtitle?: string }).subtitle) || "这里可以放副标题/说明文字"}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-4 md:px-6">
        {/* Mobile category chips */}
        <div className="md:hidden -mx-4 px-4 py-3 border-b border-border overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map(c => (
              <button key={c.id} type="button" onClick={() => pick(c.id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition
                  ${activeId === c.id ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/40"}`}>
                <span className="mr-1">{c.icon || "🧰"}</span>{c.title}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop split layout with fixed vertical divider */}
        <div className="grid md:grid-cols-[260px_1fr]">
          {/* Left sidebar */}
          <aside className="hidden md:block border-r border-border py-6 pr-4">
            <nav className="sticky top-24 space-y-1">
              {categories.map(c => (
                <button key={c.id} type="button" onClick={() => pick(c.id)}
                  className={`w-full text-left flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition
                    ${activeId === c.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/80 hover:bg-muted/70"}`}>
                  <span className="text-lg leading-none w-5 text-center">{c.icon || "🧰"}</span>
                  <span className="truncate">{c.title}</span>
                </button>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground px-3 py-2">暂无类别</p>
              )}
            </nav>
          </aside>

          {/* Right content */}
          <main className="min-w-0 py-6 md:pl-6">
            <div className="mb-5">
              <div className="relative max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="search" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="搜索工具..."
                  className="w-full h-10 pl-11 pr-4 rounded-lg border border-border bg-card text-sm
                    placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition" />
              </div>
            </div>

            {activeCat && (
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block w-1 h-5 rounded bg-primary" />
                <h2 className="text-lg font-semibold">{activeCat.title}</h2>
                {activeCat.description && (
                  <span className="text-xs text-muted-foreground hidden sm:inline">· {activeCat.description}</span>
                )}
              </div>
            )}

            {categories.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8">此工具页面还没有类别。请在后台添加。</p>
            ) : activeCat && activeCat.status === "developing" ? (
              <ComingSoonPanel title={activeCat.title} description={activeCat.description} />
            ) : visibleGroups.length === 0 ? (
              query ? (
                <p className="text-muted-foreground text-sm py-8">
                  没有找到与 "{query}" 相关的工具。
                </p>
              ) : (
                <ComingSoonPanel title={activeCat?.title ?? ""} description={activeCat?.description ?? null} />
              )
            ) : (
              <div className="space-y-10 pb-16">
                {(() => {
                  const standalone = visibleGroups.filter((g) => g.children.length === 0).map((g) => g.top);
                  const grouped = visibleGroups.filter((g) => g.children.length > 0);
                  return (
                    <>
                      {standalone.length > 0 && (
                        <ToolCardGrid pageSlug={page.slug} items={standalone} />
                      )}
                      {grouped.map(({ top, children }) => (
                        <section key={top.id}>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-lg">{top.icon || "🧰"}</span>
                            <h3 className="text-base font-semibold">{top.title}</h3>
                            {top.description && (
                              <span className="text-xs text-muted-foreground">· {top.description}</span>
                            )}
                          </div>
                          <ToolCardGrid pageSlug={page.slug} items={q ? children.filter(matches) : children} />
                        </section>
                      ))}
                    </>
                  );
                })()}
              </div>
            )}

          </main>
        </div>
      </div>
    </SiteLayout>
  );
}


function AiHubView({ page, categories, items }: {
  page: PageFull; categories: ToolCategory[]; items: ToolItem[];
}) {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState("");

  const activeCat = search.cat ? categories.find(c => c.id === search.cat) ?? null : null;

  const q = query.trim().toLowerCase();
  const matches = (it: ToolItem) =>
    !q ||
    it.title.toLowerCase().includes(q) ||
    (it.description ?? "").toLowerCase().includes(q) ||
    (it.subtitle ?? "").toLowerCase().includes(q);

  const countFor = (catId: string) =>
    items.filter((it) => it.category_id === catId && !it.parent_id).length;

  const subtitle =
    (page.content && (page.content as { subtitle?: string }).subtitle) ||
    "智能写作、翻译、总结、SEO、编程与办公工具。";

  // Category detail view
  if (activeCat) {
    const catItems = items.filter((it) => it.category_id === activeCat.id);
    const topItems = catItems.filter((it) => !it.parent_id).sort((a, b) => a.sort_order - b.sort_order);
    const visible = q ? topItems.filter(matches) : topItems;

    return (
      <SiteLayout>
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10">
            <button
              type="button"
              onClick={() => navigate({ search: {}, replace: true })}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition"
            >
              ← 返回 AI 助手中心
            </button>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 grid place-items-center text-2xl">
                {activeCat.icon || "🤖"}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">{activeCat.title}</h1>
                {activeCat.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{activeCat.description}</p>
                )}
              </div>
            </div>
            <div className="mt-6 relative max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="search" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="搜索该分类下的工具..."
                className="w-full h-10 pl-11 pr-4 rounded-lg border border-border bg-card text-sm
                  placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 md:px-6 py-10">
          {activeCat.status === "developing" ? (
            <ComingSoonPanel title={activeCat.title} description={activeCat.description} />
          ) : visible.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8">
              {q ? `没有找到与 "${query}" 相关的工具。` : "该分类暂无工具。"}
            </p>
          ) : (
            <ToolCardGrid pageSlug={page.slug} items={visible} />
          )}
        </section>
      </SiteLayout>
    );
  }

  // Hub (category cards) view
  const qCats = q
    ? categories.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q) ||
        items.some((it) => it.category_id === c.id && matches(it)))
    : categories;

  return (
    <SiteLayout>
      <section className="border-b border-border bg-gradient-to-b from-primary/[0.03] to-transparent">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-14 md:py-20 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <span>✨</span> AI Assistant Hub
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">{page.title}</h1>
          <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
          <div className="mt-7 relative max-w-lg mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="search" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="搜索 AI 工具或分类..."
              className="w-full h-11 pl-11 pr-4 rounded-full border border-border bg-card text-sm shadow-sm
                placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-14">
        {qCats.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-16">
            没有找到与 "{query}" 相关的分类。
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {qCats.map((c) => {
              const count = countFor(c.id);
              const developing = c.status === "developing";
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate({ search: { cat: c.id }, replace: false })}
                  className={`group text-left h-full rounded-2xl border border-border bg-card p-5 transition
                    ${developing ? "opacity-70" : "hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 grid place-items-center text-2xl">
                      {c.icon || "🤖"}
                    </div>
                    {developing ? (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                        Coming Soon
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {count} 个工具
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{c.title}</h3>
                  {c.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  )}
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-80 group-hover:opacity-100 transition">
                    进入分类 <ArrowRight size={12} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function ToolCardGrid({ pageSlug, items }: { pageSlug: string; items: ToolItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <ItemCard key={it.id} pageSlug={pageSlug} item={it} />
      ))}
    </div>
  );
}

function ItemCard({ pageSlug, item }: { pageSlug: string; item: ToolItem }) {
  const isDeveloping = item.status === "developing";
  const external = item.link_url && /^https?:\/\//.test(item.link_url);
  const inner = (
    <div className={`group h-full rounded-xl border border-border bg-card p-4 transition ${isDeveloping ? "opacity-70 cursor-not-allowed" : "hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 grid place-items-center text-xl">
          {item.icon || "🧰"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold truncate">{item.title}</h3>
            {isDeveloping ? (
              <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                Coming Soon
              </span>
            ) : (
              <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary shrink-0 transition" />
            )}
          </div>
          {item.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
          )}
        </div>
      </div>
    </div>
  );
  if (isDeveloping) {
    return <div aria-disabled="true">{inner}</div>;
  }
  if (external) {
    return <a href={item.link_url!} target="_blank" rel="noreferrer">{inner}</a>;
  }
  if (item.link_url && item.link_url.startsWith("/")) {
    return <a href={item.link_url}>{inner}</a>;
  }

  return (
    <Link to="/p/$slug/i/$itemSlug" params={{ slug: pageSlug, itemSlug: item.slug }}>
      {inner}
    </Link>
  );
}

function ComingSoonPanel({ title, description }: { title: string; description: string | null }) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        <span>🚧</span> Coming Soon · 即将上线
      </div>
      <h3 className="mt-5 text-xl font-semibold">{title || "该分类"}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {description || "该分类正在持续开发中，敬请期待。"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground/80">
        Lione Apps 会陆续在此分类下发布新的工具。
      </p>
    </div>
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
