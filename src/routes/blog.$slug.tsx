import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft, ArrowRight, Clock, Calendar } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useLang, type Lang } from "@/lib/i18n";
import { getPublishedPost, type BlogPost, type BlogCategory, type PublicPostRow } from "@/lib/blog.functions";

const detailQO = (slug: string) =>
  queryOptions({
    queryKey: ["blog", "post", slug],
    queryFn: () => getPublishedPost({ data: { slug } }),
  });

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(detailQO(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Article not found" }, { name: "robots", content: "noindex" }],
      };
    }
    const { post } = loaderData as { post: BlogPost };
    const title =
      post.seo_title_zh || post.seo_title_en || post.title_zh || post.title_en || post.title;
    const desc =
      post.meta_description_zh ||
      post.meta_description_en ||
      post.excerpt_zh ||
      post.excerpt_en ||
      "";
    const url = `https://lioneappscom.lovable.app/blog/${post.slug}`;
    const image = post.og_image_url || post.cover_image || undefined;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (image) {
      meta.push({ property: "og:image", content: image });
      meta.push({ name: "twitter:image", content: image });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: desc,
            image: image ? [image] : undefined,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            author: { "@type": "Organization", name: "Lione Apps" },
            publisher: {
              "@type": "Organization",
              name: "Lione Apps",
              url: "https://lioneappscom.lovable.app",
            },
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  component: PostDetail,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-6 py-20 text-red-600">{error.message}</div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold">Article not found</h1>
        <Link to="/blog" className="mt-6 inline-flex items-center gap-2 text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
      </div>
    </SiteLayout>
  ),
});

function contentOf(p: BlogPost, lang: Lang) {
  if (lang === "zh") return p.content_zh || p.content_en || p.content || "";
  return p.content_en || p.content_zh || p.content || "";
}
function titleOf(p: BlogPost, lang: Lang) {
  if (lang === "zh") return p.title_zh || p.title_en || p.title;
  return p.title_en || p.title_zh || p.title;
}
function excerptOf(p: BlogPost, lang: Lang) {
  if (lang === "zh") return p.excerpt_zh || p.excerpt_en || p.excerpt || "";
  return p.excerpt_en || p.excerpt_zh || p.excerpt || "";
}
function fmtDate(iso: string | null, lang: Lang) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: lang === "zh" ? "long" : "short",
    day: "numeric",
  });
}

function PostDetail() {
  const params = Route.useParams();
  const { lang } = useLang();
  const fn = useServerFn(getPublishedPost);
  const { data } = useSuspenseQuery({
    ...detailQO(params.slug),
    queryFn: () => fn({ data: { slug: params.slug } }),
  });
  if (!data) return null;
  const { post, category, related } = data;

  const rawContent = contentOf(post, lang);
  const { html, toc } = useMemo(() => renderMarkdown(rawContent), [rawContent]);

  return (
    <SiteLayout>
      <article className="pb-24">
        {/* Header */}
        <header className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="max-w-4xl mx-auto px-6 pt-10 md:pt-16 pb-10">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              {lang === "zh" ? "返回博客" : "Back to Blog"}
            </Link>
            {category && (
              <div className="mt-6 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {lang === "zh" ? category.name_zh : category.name_en}
              </div>
            )}
            <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              {titleOf(post, lang)}
            </h1>
            {excerptOf(post, lang) && (
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {excerptOf(post, lang)}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {fmtDate(post.published_at, lang)}
                </span>
              )}
              {post.reading_time && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {post.reading_time} min
                  {lang === "zh" ? " 阅读" : ""}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Cover */}
        {post.cover_image && (
          <div className="max-w-5xl mx-auto px-6 -mt-2">
            <img
              src={post.cover_image}
              alt={
                (lang === "zh" ? post.cover_alt_zh : post.cover_alt_en) || titleOf(post, lang)
              }
              className="w-full rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-border/60"
            />
          </div>
        )}

        {/* Body + TOC */}
        <div className="max-w-6xl mx-auto px-6 mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="min-w-0">
            {rawContent ? (
              <div
                className="prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-xl prose-img:shadow-sm prose-pre:rounded-xl prose-pre:bg-slate-900 prose-code:before:hidden prose-code:after:hidden"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="text-muted-foreground italic">
                {lang === "zh"
                  ? "该文章尚未撰写正文内容。"
                  : "This article does not have content yet."}
              </p>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {lang === "zh" ? "本页目录" : "On this page"}
                </div>
                <ul className="space-y-2 text-sm border-l border-border pl-3">
                  {toc.map((h) => (
                    <li
                      key={h.id}
                      className={h.level === 3 ? "pl-3 text-muted-foreground" : "text-slate-700"}
                    >
                      <a href={`#${h.id}`} className="hover:text-primary line-clamp-2">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 mt-24">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              {lang === "zh" ? "相关文章" : "Related Articles"}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <RelatedCard key={p.id} post={p} lang={lang} />
              ))}
            </div>
          </section>
        )}
      </article>
    </SiteLayout>
  );
}

function RelatedCard({ post, lang }: { post: PublicPostRow; lang: Lang }) {
  const title = lang === "zh" ? post.title_zh || post.title_en : post.title_en || post.title_zh;
  const excerpt =
    lang === "zh" ? post.excerpt_zh || post.excerpt_en : post.excerpt_en || post.excerpt_zh;
  const alt = (lang === "zh" ? post.cover_alt_zh : post.cover_alt_en) || title || "";
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group flex flex-col rounded-2xl border border-border/70 bg-card overflow-hidden hover:border-primary/30 hover:-translate-y-1 transition-all"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={alt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-100 to-blue-50" />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{excerpt}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
          {lang === "zh" ? "阅读" : "Read"}
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

type TocItem = { id: string; text: string; level: number };

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .slice(0, 80) || `h-${Math.random().toString(36).slice(2, 8)}`;
}

function renderMarkdown(md: string): { html: string; toc: TocItem[] } {
  if (!md) return { html: "", toc: [] };
  const toc: TocItem[] = [];
  const renderer = new marked.Renderer();
  const seen = new Map<string, number>();
  renderer.heading = ({ tokens, depth }: { tokens: unknown[]; depth: number }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = (marked as any).parser.parseInline(tokens as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plain = String(text).replace(/<[^>]*>/g, "");
    let id = slugify(plain);
    const n = seen.get(id) ?? 0;
    if (n > 0) id = `${id}-${n}`;
    seen.set(id, n + 1);
    if (depth === 2 || depth === 3) toc.push({ id, text: plain, level: depth });
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };
  marked.setOptions({ gfm: true, breaks: false });
  const raw = marked.parse(md, { renderer, async: false }) as string;
  const html = DOMPurify.sanitize(raw, {
    ADD_ATTR: ["target", "rel", "id"],
  });
  return { html, toc };
}
