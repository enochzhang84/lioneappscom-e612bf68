import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { listPublishedPosts } from "@/lib/blog.functions";

const listQO = queryOptions({
  queryKey: ["blog", "list"],
  queryFn: async () => await (listPublishedPosts as unknown as () => Promise<Awaited<ReturnType<typeof listPublishedPosts>>>)(),
});

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "博客 · Lione Apps" },
      { name: "description", content: "Lione Apps 的产品动态、行业洞察与开发笔记。" },
      { property: "og:title", content: "博客 · Lione Apps" },
      { property: "og:description", content: "产品动态、行业洞察与开发笔记。" },
    ],
  }),
  loader: async ({ context }) => {
    const fn = listPublishedPosts;
    await context.queryClient.ensureQueryData({
      ...listQO, queryFn: () => (fn as unknown as () => Promise<unknown>)(),
    });
  },
  component: BlogIndex,
  errorComponent: ({ error }) => (
    <SiteLayout><div className="max-w-3xl mx-auto px-6 py-20 text-red-600">{error.message}</div></SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout><div className="max-w-3xl mx-auto px-6 py-20">没有找到文章</div></SiteLayout>
  ),
});

function BlogIndex() {
  const fn = useServerFn(listPublishedPosts);
  const { data: posts } = useSuspenseQuery({ ...listQO, queryFn: () => fn() });

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">博客</h1>
          <p className="text-slate-500 mt-2">产品动态、行业洞察与开发笔记。</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-slate-400 py-24 text-center">还没有发布任何文章。</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }}
                className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {p.cover_image ? (
                  <img src={p.cover_image} alt={p.title}
                    className="w-full aspect-video object-cover group-hover:scale-[1.02] transition-transform" />
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-blue-500 to-indigo-600" />
                )}
                <div className="p-5">
                  {p.category && (
                    <div className="text-[11px] text-blue-600 font-medium uppercase tracking-wider mb-2">
                      {p.category}
                    </div>
                  )}
                  <h2 className="font-semibold text-slate-900 text-lg leading-snug line-clamp-2">
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">{p.excerpt}</p>
                  )}
                  {p.published_at && (
                    <div className="text-xs text-slate-400 mt-3">
                      {new Date(p.published_at).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
