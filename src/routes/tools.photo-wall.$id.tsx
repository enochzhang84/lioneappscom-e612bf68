import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { StudioEditor } from "@/components/photowall/StudioEditor";
import { getProject } from "@/lib/photowall/store";
import type { PWProject } from "@/lib/photowall/types";

export const Route = createFileRoute("/tools/photo-wall/$id")({
  head: () => ({
    meta: [
      { title: "编辑照片墙 — Photo Wall Studio | Lione Apps" },
      { name: "description", content: "Photo Wall Studio 编辑器：图片、模板、文字、音乐、动画、布局与时间轴，一站式制作照片墙与 MP4 视频。" },
      { property: "og:title", content: "编辑照片墙 — Photo Wall Studio" },
      { property: "og:description", content: "在浏览器里编辑照片墙项目并导出视频。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditorPage,
});

function EditorPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [project, setProject] = React.useState<PWProject | null>(null);
  const [missing, setMissing] = React.useState(false);

  React.useEffect(() => {
    let ok = true;
    getProject(id).then((p) => {
      if (!ok) return;
      if (p) setProject(p);
      else setMissing(true);
    });
    return () => { ok = false; };
  }, [id]);

  if (missing) {
    return (
      <div className="grid h-[100dvh] place-items-center bg-[#0e1117] text-white/70">
        <div className="text-center">
          <p className="text-sm">项目不存在或已被删除。</p>
          <button className="mt-3 text-sm text-primary underline" onClick={() => navigate({ to: "/tools/photo-wall" })}>
            返回照片墙工作室
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="grid h-[100dvh] place-items-center bg-[#0e1117]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <StudioEditor initial={project} />;
}
