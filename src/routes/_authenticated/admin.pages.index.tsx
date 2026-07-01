import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminListPages,
  adminTogglePageVisibility,
  adminDeletePage,
  adminMovePage,
} from "@/lib/pages-admin.functions";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { ArrowDown, ArrowUp, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/pages/")({
  component: PagesList,
});

const PAGE_TYPE_LABEL: Record<string, string> = {
  content: "普通内容页面",
  tools: "实用工具页面",
  blank: "空白自定义页面",
};

function PagesList() {
  const qc = useQueryClient();
  const list = useServerFn(adminListPages);
  const toggle = useServerFn(adminTogglePageVisibility);
  const del = useServerFn(adminDeletePage);
  const move = useServerFn(adminMovePage);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "pages"], queryFn: () => list() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "pages"] });

  const mToggle = useMutation({ mutationFn: toggle, onSuccess: refresh });
  const mDelete = useMutation({
    mutationFn: del,
    onSuccess: () => { toast.success("已删除"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const mMove = useMutation({ mutationFn: move, onSuccess: refresh });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">页面管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理网站前台导航中显示的自定义页面。</p>
        </div>
        <Button asChild><Link to="/admin/pages/$id" params={{ id: "new" }}>+ 增加页面</Link></Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">排序</TableHead>
              <TableHead>页面名称</TableHead>
              <TableHead>页面地址</TableHead>
              <TableHead className="w-32">类型</TableHead>
              <TableHead className="w-28">导航栏</TableHead>
              <TableHead className="w-24">状态</TableHead>
              <TableHead className="w-48 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">加载中…</TableCell></TableRow>}
            {!isLoading && (data?.length ?? 0) === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">还没有自定义页面</TableCell></TableRow>
            )}
            {data?.map((p, i) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground w-6">{p.sort_order}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7" disabled={i === 0}
                      onClick={() => mMove.mutate({ data: { id: p.id, sort_order: (data[i-1].sort_order ?? 0) - 1 } })}>
                      <ArrowUp size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" disabled={i === data.length - 1}
                      onClick={() => mMove.mutate({ data: { id: p.id, sort_order: (data[i+1].sort_order ?? 0) + 1 } })}>
                      <ArrowDown size={14} />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div>{p.title}</div>
                  <div className="text-xs text-muted-foreground">导航名：{p.nav_label}</div>
                </TableCell>
                <TableCell>
                  <a
                    href={`/p/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    /p/{p.slug}
                    <ExternalLink size={12} />
                  </a>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {PAGE_TYPE_LABEL[p.page_type] ?? p.page_type}
                </TableCell>
                <TableCell>
                  <span className={p.show_in_nav ? "text-foreground text-sm" : "text-muted-foreground text-sm"}>
                    {p.show_in_nav ? "显示" : "隐藏"}
                  </span>
                </TableCell>
                <TableCell>
                  <Switch checked={p.is_visible}
                    onCheckedChange={(v) => mToggle.mutate({ data: { id: p.id, is_visible: v } })} />
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/admin/pages/$id" params={{ id: p.id }}><Pencil size={14} className="mr-1" />编辑</Link>
                  </Button>
                  <Button size="sm" variant="ghost"
                    onClick={() => { if (confirm(`删除页面 "${p.title}"？`)) mDelete.mutate({ data: { id: p.id } }); }}>
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
