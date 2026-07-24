import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Search, ArrowRight, Clock } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useLang, type Lang } from "@/lib/i18n";
import {
  listPublishedPosts,
  getFeaturedPosts,
  listCategories,
  type PublicPostRow,
  type BlogCategory,
} from "@/lib/blog.functions";
import heroImage from "@/assets/services-hero-ecosystem.jpg";

const PAGE_SIZE = 9;

const listQO = (opts: { category?: string; q?: string; page: number }) =>
  queryOptions({
    queryKey: ["blog", "list", opts.category ?? "", opts.q ?? "", opts.page],
    queryFn: () => listPublishedPosts({ data: { ...opts, pageSize: PAGE_SIZE } }),
  });

const featuredQO = queryOptions({
  queryKey: ["blog", "featured"],
  queryFn: () => getFeaturedPosts(),
});

const categoriesQO = queryOptions({
  queryKey: ["blog", "categories"],
  queryFn: () => listCategories(),
});

type SearchParams = { category?: string; q?: string; page?: number };

export const Route = createFileRoute("/blog/")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    page: typeof s.page === "number" ? s.page : s.page ? Number(s.page) : undefined,
  }),
  loaderDeps: ({ search }) => ({
    category: search.category,
    q: search.q,
    page: search.page ?? 1,
  }),
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(listQO(deps)),
      context.queryClient.ensureQueryData(featuredQO),
      context.queryClient.ensureQueryData(categoriesQO),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Lione Apps 技术博客 — 家庭网络、NAS 与企业数字化" },
      {
        name: "description",
        content:
          "分享家庭网络、NAS 私有云、智能家居、企业网站、定制软件与云服务器部署的实用知识。",
      },
      { property: "og:title", content: "Lione Apps Insights — Home IT, NAS & Business Technology" },
      {
        property: "og:description",
        content:
          "Practical insights on home networks, NAS private cloud, smart home systems, business websites, custom software and cloud deployment.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://lioneappscom.lovable.app/blog" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://lioneappscom.lovable.app/blog" }],
  }),
  component: BlogIndex,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-6 py-20 text-red-600">{error.message}</div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-6 py-20">Not found</div>
    </SiteLayout>
  ),
});

function BlogIndex() {
  const { lang } = useLang();
  const search = Route.useSearch();
  const nav = Route.useNavigate();
  const page = search.page ?? 1;
  const category = search.category;
  const q = search.q ?? "";

  const [qInput, setQInput] = useState(q);
  useEffect(() => setQInput(q), [q]);

  const listFn = useServerFn(listPublishedPosts);
  const featFn = useServerFn(getFeaturedPosts);
  const catFn = useServerFn(listCategories);

  const list = useSuspenseQuery({
    ...listQO({ category, q, page }),
    queryFn: () => listFn({ data: { category, q, page, pageSize: PAGE_SIZE } }),
  });
  const featured = useQuery({ ...featuredQO, queryFn: () => featFn() });
  const categories = useQuery({ ...categoriesQO, queryFn: () => catFn() });

  const items = list.data.items;
  const total = list.data.total;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const catMap = new Map<string, BlogCategory>();
  (categories.data ?? []).forEach((c) => catMap.set(c.id, c));

  const featItems = featured.data ?? [];
  const heroFeatured = page === 1 && !category && !q ? featItems : [];

  const heroTitle =
    lang === "zh" ? "技术知识与实用指南" : "Technology Insights & Practical Guides";
  const heroDesc =
    lang === "zh"
      ? "分享家庭网络、NAS 私有云、智能家居、企业网站、定制软件和云平台部署的实用知识。"
      : "Practical knowledge about home networks, NAS private cloud, smart home systems, business websites, custom software and cloud deployment.";

  function goCategory(slug?: string) {
    nav({ search: (prev: SearchParams) => ({ ...prev, category: slug, page: 1 }) });
  }
  function goSearch(kw: string) {
    nav({ search: (prev: SearchParams) => ({ ...prev, q: kw || undefined, page: 1 }) });
  }
  function goPage(p: number) {
    nav({ search: (prev: SearchParams) => ({ ...prev, page: p }) });
  }

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 0%, oklch(0.7 0.15 264 / 0.18), transparent 70%)",
          }}
        />
        <div className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-10">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1">
                {lang === "zh" ? "Lione Apps 技术博客" : "Lione Apps Insights"}
              </div>
              <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
                {heroTitle}
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                {heroDesc}
              </p>
              {/* Search */}
              <form
                className="mt-6 relative max-w-md"
                onSubmit={(e) => {
                  e.preventDefault();
                  goSearch(qInput.trim());
                }}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  placeholder={
                    lang === "zh" ? "搜索文章、主题或关键词" : "Search articles, topics or keywords"
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-full border border-border bg-white/80 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </form>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt={lang === "zh" ? "技术知识与实用指南" : "Technology insights and practical guides"}
                width={1280}
                height={800}
                className="w-full h-auto rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-border/60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category chips */}
      <section className="border-b border-border/60 bg-background/60 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto scrollbar-none">
          <CategoryChip
            active={!category}
            onClick={() => goCategory(undefined)}
            label={lang === "zh" ? "全部" : "All"}
          />
          {(categories.data ?? []).map((c) => (
            <CategoryChip
              key={c.id}
              active={category === c.slug}
              onClick={() => goCategory(c.slug)}
              label={lang === "zh" ? c.name_zh : c.name_en}
            />
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-16">
        {/* Featured */}
        {heroFeatured.length > 0 && (
          <section>
            <div className="grid gap-6 md:grid-cols-2">
              <FeaturedBig post={heroFeatured[0]} lang={lang} category={catMap.get(heroFeatured[0].category_id ?? "")} />
              <div className="grid gap-6 grid-cols-1">
                {heroFeatured.slice(1, 3).map((p) => (
                  <FeaturedSmall
                    key={p.id}
                    post={p}
                    lang={lang}
                    category={catMap.get(p.category_id ?? "")}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Results header */}
        {(category || q) && (
          <div className="text-sm text-muted-foreground">
            {lang === "zh"
              ? `共找到 ${total} 篇文章`
              : `${total} article${total === 1 ? "" : "s"} found`}
            {q && ` · "${q}"`}
          </div>
        )}

        {/* List */}
        {items.length === 0 ? (
          <EmptyState lang={lang} filtered={!!(category || q)} />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  lang={lang}
                  category={catMap.get(p.category_id ?? "")}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 pt-4">
                <button
                  disabled={page <= 1}
                  onClick={() => goPage(page - 1)}
                  className="h-9 px-3 text-sm rounded-md border border-border disabled:opacity-40 hover:bg-muted"
                >
                  ←
                </button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={n}
                      onClick={() => goPage(n)}
                      className={`h-9 min-w-9 px-3 text-sm rounded-md border ${
                        n === page
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
                <button
                  disabled={page >= totalPages}
                  onClick={() => goPage(page + 1)}
                  className="h-9 px-3 text-sm rounded-md border border-border disabled:opacity-40 hover:bg-muted"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}

        {/* Contact CTA */}
        <section className="mt-16 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-8 md:p-10 text-center">
          <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
            {lang === "zh" ? "有具体的技术问题？" : "Have a specific technical question?"}
          </h3>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            {lang === "zh"
              ? "无论是家庭 Wi-Fi、NAS 部署，还是企业办公平台，我们都可以为您提供一对一咨询。"
              : "From home Wi-Fi and NAS deployment to business office platforms — we offer one-on-one consultations."}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            {lang === "zh" ? "联系我们" : "Contact Us"} <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </SiteLayout>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 h-8 px-3 rounded-full text-sm border transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-white border-border hover:border-primary/40 hover:text-primary"
      }`}
    >
      {label}
    </button>
  );
}

function titleOf(p: PublicPostRow, lang: Lang) {
  if (lang === "zh") return p.title_zh || p.title_en || "";
  return p.title_en || p.title_zh || "";
}
function excerptOf(p: PublicPostRow, lang: Lang) {
  if (lang === "zh") return p.excerpt_zh || p.excerpt_en || "";
  return p.excerpt_en || p.excerpt_zh || "";
}
function altOf(p: PublicPostRow, lang: Lang) {
  if (lang === "zh") return p.cover_alt_zh || titleOf(p, lang);
  return p.cover_alt_en || titleOf(p, lang);
}
function fmtDate(iso: string | null, lang: Lang) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: lang === "zh" ? "long" : "short",
    day: "numeric",
  });
}

function PostCard({
  post,
  lang,
  category,
}: {
  post: PublicPostRow;
  lang: Lang;
  category?: BlogCategory;
}) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_40px_-20px_rgba(37,99,235,0.35)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={altOf(post, lang)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-100 to-blue-50" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {category && (
          <div className="text-[11px] font-medium text-primary uppercase tracking-wider">
            {lang === "zh" ? category.name_zh : category.name_en}
          </div>
        )}
        <h3 className="mt-2 text-base font-semibold tracking-tight text-slate-900 line-clamp-2 leading-snug">
          {titleOf(post, lang)}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {excerptOf(post, lang)}
        </p>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{fmtDate(post.published_at, lang)}</span>
          {post.reading_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {post.reading_time} min
            </span>
          )}
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          {lang === "zh" ? "阅读全文" : "Read Article"}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function FeaturedBig({
  post,
  lang,
  category,
}: {
  post: PublicPostRow;
  lang: Lang;
  category?: BlogCategory;
}) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card hover:border-primary/30 hover:shadow-[0_18px_40px_-20px_rgba(37,99,235,0.4)] transition-all"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={altOf(post, lang)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 to-blue-50" />
        )}
        <div className="absolute left-4 top-4 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
          {lang === "zh" ? "推荐" : "Featured"}
        </div>
      </div>
      <div className="p-6">
        {category && (
          <div className="text-[11px] font-medium text-primary uppercase tracking-wider">
            {lang === "zh" ? category.name_zh : category.name_en}
          </div>
        )}
        <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-tight line-clamp-2">
          {titleOf(post, lang)}
        </h2>
        <p className="mt-3 text-muted-foreground line-clamp-2 leading-relaxed">
          {excerptOf(post, lang)}
        </p>
      </div>
    </Link>
  );
}

function FeaturedSmall({
  post,
  lang,
  category,
}: {
  post: PublicPostRow;
  lang: Lang;
  category?: BlogCategory;
}) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] gap-4 rounded-2xl border border-border/70 bg-card overflow-hidden hover:border-primary/30 transition-all"
    >
      <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-muted">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={altOf(post, lang)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-100 to-blue-50" />
        )}
      </div>
      <div className="py-4 pr-4">
        {category && (
          <div className="text-[10px] font-medium text-primary uppercase tracking-wider">
            {lang === "zh" ? category.name_zh : category.name_en}
          </div>
        )}
        <h3 className="mt-1 text-base font-semibold tracking-tight text-slate-900 line-clamp-2 leading-snug">
          {titleOf(post, lang)}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {excerptOf(post, lang)}
        </p>
      </div>
    </Link>
  );
}

function EmptyState({ lang, filtered }: { lang: Lang; filtered: boolean }) {
  return (
    <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-muted/30">
      <h3 className="text-lg font-semibold text-slate-900">
        {filtered
          ? lang === "zh"
            ? "没有找到相关文章"
            : "No matching articles"
          : lang === "zh"
            ? "博客内容正在准备中"
            : "New Articles Are Coming Soon"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        {filtered
          ? lang === "zh"
            ? "试试其他关键词或分类。"
            : "Try a different keyword or category."
          : lang === "zh"
            ? "我们正在整理家庭网络、NAS、智能家居和企业数字化相关的实用内容，敬请期待。"
            : "We are preparing practical guides about home networks, NAS, smart home systems and business technology."}
      </p>
    </div>
  );
}
