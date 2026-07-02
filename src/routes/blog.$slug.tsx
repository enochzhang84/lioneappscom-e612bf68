import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { getPublishedPost } from "@/lib/blog.functions";

const postQO = (slug: string) => queryOptions({
  queryKey: ["blog", "post", slug],
  queryFn: () => getPublishedPost({ data: { slug } }),
});


export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(postQO(params.slug));
    if (!data) throw notFound();
    return { post: data };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.post;
    if (!p) return {};
    const title = p.seo_title || p.title;
    const desc = p.seo_description || p.excerpt || "";
    return {
      meta: [
        { title: `${title} · Lione Apps` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        ...(p.cover_image ? [{ property: "og:image", content: p.cover_image }] : []),
      ],
    };
  },
  component: BlogPost,
  errorComponent: ({ error }) => (
    <SiteLayout><div className="max-w-3xl mx-auto px-6 py-20 text-red-600">{error.message}</div></SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="text-slate-400 mb-4">文章不存在或已下架</div>
        <Link to="/blog" className="text-blue-600 hover:underline">← 返回博客</Link>
      </div>
    </SiteLayout>
  ),
});

function BlogPost() {
  const { slug } = Route.useParams();
  const fn = useServerFn(getPublishedPost);
  const { data: p } = useSuspenseQuery({ ...postQO(slug), queryFn: () => fn({ data: { slug } }) });
  if (!p) return null;

  return (
    <SiteLayout>
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-8">
          <ArrowLeft size={14} /> 返回博客
        </Link>

        {p.category && (
          <div className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-3">
            {p.category}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
          {p.title}
        </h1>
        {p.published_at && (
          <div className="text-sm text-slate-400 mt-3">
            {new Date(p.published_at).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        )}

        {p.cover_image && (
          <img src={p.cover_image} alt={p.title}
            className="w-full aspect-video object-cover rounded-xl mt-8 border border-slate-200" />
        )}

        {p.excerpt && (
          <p className="text-lg text-slate-600 mt-8 leading-relaxed">{p.excerpt}</p>
        )}

        <div
          className="prose prose-slate max-w-none mt-8 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: p.content.includes("<") ? p.content : escapeHtml(p.content) }}
        />

        {p.tags && p.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
            {p.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">#{t}</span>
            ))}
          </div>
        )}
      </article>
    </SiteLayout>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}
