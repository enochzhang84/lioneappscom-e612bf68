import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  adminListCategories,
  adminUpsertCategory,
  adminDeleteCategory,
  type BlogCategory,
} from "@/lib/blog.functions";

export const Route = createFileRoute("/_authenticated/admin/blog/categories")({
  component: BlogCategoriesAdmin,
});

type Draft = {
  id?: string;
  slug: string;
  name_zh: string;
  name_en: string;
  description_zh: string;
  description_en: string;
  sort_order: number;
  is_active: boolean;
};
const EMPTY: Draft = {
  slug: "", name_zh: "", name_en: "", description_zh: "",
  description_en: "", sort_order: 0, is_active: true,
};

function BlogCategoriesAdmin() {
  const listFn = useServerFn(adminListCategories);
  const upFn = useServerFn(adminUpsertCategory);
  const delFn = useServerFn(adminDeleteCategory);
  const qc = useQueryClient();

  const list = useQuery({ queryKey: ["admin", "blog", "cats"], queryFn: () => listFn() });
  const [editing, setEditing] = useState<Draft | null>(null);

  const save = useMutation({
    mutationFn: (d: Draft) =>
      upFn({
        data: {
          id: d.id,
          slug: d.slug.trim(),
          name_zh: d.name_zh.trim(),
          name_en: d.name_en.trim(),
          description_zh: d.description_zh.trim() || null,
          description_en: d.description_en.trim() || null,
          sort_order: Number(d.sort_order) || 0,
          is_active: d.is_active,
        },
      }),
    onSuccess: () => {
      toast.success("已保存");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "blog", "cats"] });
      qc.invalidateQueries({ queryKey: ["blog", "categories"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("已删除");
      qc.invalidateQueries({ queryKey: ["admin", "blog", "cats"] });
      qc.invalidateQueries({ queryKey: ["blog", "categories"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = list.data ?? [];

  return (
    <div className="p-6 md:p-8 max-w-[1200px] space-y-6">
      <PageHeader
        title="博客分类"
        description="为博客文章设置多语言分类。分类会同步显示在博客首页的过滤条与文章详情页。"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/blog"><ArrowLeft size={14} className="mr-1" /> 返回文章</Link>
            </Button>
            <Button onClick={() => setEditing({ ...EMPTY, sort_order: rows.length })}>
              <Plus size={14} className="mr-1" /> 新建分类
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium">名称</th>
                    <th className="px-4 py-3 font-medium">Slug</th>
                    <th className="px-4 py-3 font-medium">排序</th>
                    <th className="px-4 py-3 font-medium">启用</th>
                    <th className="px-4 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{c.name_zh}</div>
                        <div className="text-xs text-slate-500">{c.name_en}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">/{c.slug}</td>
                      <td className="px-4 py-3 text-slate-600">{c.sort_order}</td>
                      <td className="px-4 py-3">
                        {c.is_active ? (
                          <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">启用</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500">隐藏</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setEditing(fromRow(c))}>
                            <Pencil size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => { if (confirm(`删除「${c.name_zh}」？`)) del.mutate(c.id); }}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">暂无分类</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {editing && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  {editing.id ? "编辑分类" : "新建分类"}
                </div>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                  <X size={14} />
                </Button>
              </div>
              <div>
                <Label className="text-xs">Slug *</Label>
                <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  className="mt-1 font-mono text-sm" placeholder="home-network" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">中文名称 *</Label>
                  <Input value={editing.name_zh} onChange={(e) => setEditing({ ...editing, name_zh: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">English *</Label>
                  <Input value={editing.name_en} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">中文描述</Label>
                <Textarea rows={2} value={editing.description_zh}
                  onChange={(e) => setEditing({ ...editing, description_zh: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">English description</Label>
                <Textarea rows={2} value={editing.description_en}
                  onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">排序</Label>
                  <Input type="number" value={editing.sort_order}
                    onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} className="mt-1" />
                </div>
                <div className="flex items-end justify-between">
                  <Label className="text-sm">启用</Label>
                  <Switch checked={editing.is_active}
                    onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => save.mutate(editing)}
                disabled={save.isPending || !editing.slug || !editing.name_zh || !editing.name_en}
              >
                <Save size={14} className="mr-1" /> 保存
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function fromRow(c: BlogCategory): Draft {
  return {
    id: c.id,
    slug: c.slug,
    name_zh: c.name_zh,
    name_en: c.name_en,
    description_zh: c.description_zh ?? "",
    description_en: c.description_en ?? "",
    sort_order: c.sort_order,
    is_active: c.is_active,
  };
}
