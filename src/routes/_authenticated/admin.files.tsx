import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Upload,
  Trash2,
  Search,
  Copy,
  FileText,
  ImageIcon,
  Film,
  Music,
  Tag as TagIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/PageHeader";
import { mediaUrl } from "@/lib/media";
import {
  adminListMedia,
  adminUploadMedia,
  adminUpdateMedia,
  adminDeleteMedia,
  type MediaAsset,
} from "@/lib/files.functions";

export const Route = createFileRoute("/_authenticated/admin/files")({
  component: FilesPage,
});

function humanSize(n: number | null) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function fileIcon(mime: string | null) {
  if (!mime) return FileText;
  if (mime.startsWith("image/")) return ImageIcon;
  if (mime.startsWith("video/")) return Film;
  if (mime.startsWith("audio/")) return Music;
  return FileText;
}

function fileToDataURL(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(f);
  });
}

function FilesPage() {
  const listFn = useServerFn(adminListMedia);
  const upFn = useServerFn(adminUploadMedia);
  const updFn = useServerFn(adminUpdateMedia);
  const delFn = useServerFn(adminDeleteMedia);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const list = useQuery({
    queryKey: ["admin", "media", { search, tag }],
    queryFn: () => listFn({ data: { search, tag: tag ?? undefined } }),
  });

  const items = list.data ?? [];

  const allTags = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => i.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [items]);

  async function upload(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        if (f.size > 15 * 1024 * 1024) {
          toast.error(`${f.name} 超过 15MB，跳过`);
          continue;
        }
        const dataUrl = await fileToDataURL(f);
        await upFn({ data: { filename: f.name, data_url: dataUrl } });
      }
      toast.success("上传完成");
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("已删除");
      setSelected(null);
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMeta = useMutation({
    mutationFn: (p: { id: string; alt_text?: string; tags?: string[] }) => updFn({ data: p }),
    onSuccess: () => {
      toast.success("已保存");
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px]">
      <PageHeader
        title="文件管理"
        description="集中管理站点使用的图片、PDF、视频等媒体资源。可打标签、检索、复制链接，供页面 / 工具 / 文章复用。"
        actions={
          <>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                upload(e.target.files);
                e.target.value = "";
              }}
            />
            <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
              <Upload size={14} className="mr-1" /> {uploading ? "上传中…" : "上传文件"}
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索文件名"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setTag(null)}
            className={`px-2.5 py-1 rounded-full text-xs border ${
              tag === null ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            全部
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t === tag ? null : t)}
              className={`px-2.5 py-1 rounded-full text-xs border inline-flex items-center gap-1 ${
                tag === t
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              <TagIcon size={10} /> {t}
            </button>
          ))}
        </div>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files);
        }}
        className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-center text-xs text-slate-500 bg-slate-50/60"
      >
        拖拽文件到此处即可上传 · 单文件 ≤ 15MB
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-slate-400">
            资源库为空，点击右上方「上传文件」或拖拽文件到上方区域开始。
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((it) => {
            const url = mediaUrl(it.path);
            const isImage = it.mime_type?.startsWith("image/");
            const Icon = fileIcon(it.mime_type);
            return (
              <button
                key={it.id}
                onClick={() => setSelected(it)}
                className="group text-left rounded-lg border border-slate-200 bg-white overflow-hidden hover:shadow-md hover:border-slate-300 transition"
              >
                <div className="aspect-square bg-slate-100 grid place-items-center overflow-hidden">
                  {isImage && url ? (
                    <img src={url} alt={it.alt_text ?? it.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icon size={36} className="text-slate-400" />
                  )}
                </div>
                <div className="p-2.5">
                  <div className="text-xs font-medium text-slate-800 truncate" title={it.name}>
                    {it.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>{humanSize(it.size_bytes)}</span>
                    <span>{it.mime_type?.split("/")[1] ?? ""}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <DetailDrawer
          asset={selected}
          onClose={() => setSelected(null)}
          onDelete={() => {
            if (confirm(`删除「${selected.name}」？（存储中的文件也会被删除）`)) del.mutate(selected.id);
          }}
          onSave={(patch) => updateMeta.mutate({ id: selected.id, ...patch })}
        />
      )}
    </div>
  );
}

function DetailDrawer({
  asset,
  onClose,
  onDelete,
  onSave,
}: {
  asset: MediaAsset;
  onClose: () => void;
  onDelete: () => void;
  onSave: (p: { alt_text?: string; tags?: string[] }) => void;
}) {
  const url = mediaUrl(asset.path);
  const isImage = asset.mime_type?.startsWith("image/");
  const [alt, setAlt] = useState(asset.alt_text ?? "");
  const [tagsStr, setTagsStr] = useState(asset.tags.join(", "));

  function copy(v: string) {
    navigator.clipboard.writeText(v).then(() => toast.success("已复制"));
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-6 py-4">
          <div className="min-w-0">
            <div className="text-sm text-slate-500">文件详情</div>
            <div className="font-semibold text-slate-900 truncate">{asset.name}</div>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            关闭
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 grid place-items-center min-h-[180px]">
            {isImage && url ? (
              <img src={url} alt={asset.alt_text ?? asset.name} className="max-h-64 object-contain" />
            ) : (
              <div className="p-8 text-slate-400 text-sm">非图片文件</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
            <Stat label="大小" value={humanSize(asset.size_bytes)} />
            <Stat label="MIME" value={asset.mime_type ?? "—"} />
            <Stat label="上传时间" value={new Date(asset.created_at).toLocaleString()} />
            <Stat label="Bucket" value={asset.bucket} />
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-medium text-slate-600">存储路径</div>
            <div className="flex gap-2">
              <Input readOnly value={asset.path} className="text-xs" />
              <Button variant="outline" size="sm" onClick={() => copy(asset.path)}>
                <Copy size={12} />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-medium text-slate-600">公共访问 URL</div>
            <div className="flex gap-2">
              <Input readOnly value={url ?? ""} className="text-xs" />
              <Button variant="outline" size="sm" onClick={() => url && copy(url)}>
                <Copy size={12} />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-medium text-slate-600">Alt 文本</div>
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="用于无障碍与 SEO" />
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-medium text-slate-600">标签（逗号分隔）</div>
            <Input
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="hero, logo, blog"
            />
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4 flex justify-between">
          <Button variant="ghost" className="text-red-600" onClick={onDelete}>
            <Trash2 size={14} className="mr-1" /> 删除
          </Button>
          <Button
            onClick={() =>
              onSave({
                alt_text: alt.trim() || undefined,
                tags: tagsStr
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          >
            保存修改
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50 p-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-slate-700 truncate">{value}</div>
    </div>
  );
}
