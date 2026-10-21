import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Package, Search, GitBranch, Eye, RefreshCw, Upload, ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';
import { FormPanel } from '@/components/admin/FormPanel';
import { EmptyState } from '@/components/admin/EmptyState';
import { getModuleInventory } from '@/lib/module-manager.functions';
import type { ModuleManifest } from '@/lib/module-manager.types';
import { ModuleExportDialog } from '@/components/admin/ModuleExportDialog';

type View = 'details' | 'dependencies' | 'preview';
function Paths({ paths }: { paths: string[] }) {
  return paths.length ? <ul className="space-y-1 text-xs font-mono">{paths.map(p => <li className="break-all text-muted-foreground" key={p}>{p}</li>)}</ul> : <p className="text-sm text-muted-foreground">未发现</p>;
}

export function ModuleManager() {
  const inventoryFn = useServerFn(getModuleInventory);
  const query = useQuery({ queryKey: ['admin', 'module-inventory'], queryFn: () => inventoryFn() });
  const [inspection, setInspection] = useState<{ modules: ModuleManifest[]; view: View } | null>(null);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [exportIds,setExportIds] = useState<string[] | null>(null);
  const open = (row: ModuleManifest, view: View) => setInspection({ modules: [row], view });
  const columns: DataTableColumn<ModuleManifest>[] = [
    { key: 'name', header: '模块', sortValue: r => r.name, cell: r => <div className="min-w-44"><div className="font-medium text-foreground">{r.name}</div><div className="text-xs font-mono text-muted-foreground mt-1">{r.id} · {r.category}</div><div className="text-xs text-muted-foreground mt-1 max-w-64">{r.description}</div></div> },
    { key: 'version', header: '版本 / 状态', cell: r => <div className="min-w-28 text-xs space-y-2"><div>{r.version}</div><div className="text-primary">{reviewed.has(r.id) ? '本次会话已查阅' : r.status}</div></div> },
    { key: 'entry', header: '入口源文件', cell: r => <div className="max-w-64"><Paths paths={r.entries} /></div> },
    { key: 'deps', header: '依赖', sortValue: r => r.sharedFiles.length + r.npm.length, cell: r => <div className="text-xs min-w-24 space-y-1"><div>共享文件 {r.sharedFiles.length}</div><div>npm {r.npm.length}</div><div>私有文件 {r.privateFiles.length}</div></div> },
    { key: 'db', header: '数据库', cell: r => <div className="text-xs min-w-24">{r.tables.length} 表 / {r.rpcs.length} SQL 函数</div> },
    { key: 'actions', header: '操作', cell: r => <div className="flex flex-col gap-1 items-start min-w-28"><Button variant="ghost" size="sm" onClick={() => open(r,'details')}><Search size={14} />查看详情</Button><Button variant="ghost" size="sm" onClick={() => open(r,'dependencies')}><GitBranch size={14} />依赖分析</Button><Button variant="outline" size="sm" onClick={() => open(r,'preview')}><Eye size={14} />提取预览</Button><Button variant="outline" size="sm" onClick={() => setExportIds([r.id])}><Download size={14}/>导出模块</Button></div> },
  ];
  const modules = inspection?.modules ?? [];
  const shared = [...new Set(modules.flatMap(m => m.sharedFiles))].sort();
  const privatePaths = [...new Set(modules.flatMap(m => m.privateFiles))].filter(p => !shared.includes(p)).sort();
  return (
    <section className="p-6 space-y-4 border-t border-border">
      <PageHeader title="模块管理" actions={<Button variant="outline" size="sm" disabled={query.isFetching} onClick={() => query.refetch()}><RefreshCw size={14} />刷新清单</Button>} />
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground items-center"><span className="font-medium text-foreground">LioneApps Module Manager V1.1</span><span className="inline-flex items-center gap-1"><ShieldCheck size={14} />管理员源码审查</span>{query.data && <><span>{query.data.modules.length} 个候选模块</span><span>清单生成：{new Date(query.data.generatedAt).toLocaleString()}</span></>}</div>
      <Tabs defaultValue="extract">
        <TabsList className="max-w-full"><TabsTrigger value="extract">模块提取</TabsTrigger><TabsTrigger value="repository">模块仓库</TabsTrigger><TabsTrigger value="install">安装管理</TabsTrigger></TabsList>
        <TabsContent value="extract" className="space-y-5 mt-5">
          {query.isError ? <EmptyState title="无法读取模块清单" description={query.error instanceof Error ? query.error.message : '请检查管理员权限。'} action={<Button variant="outline" onClick={() => query.refetch()}>重试</Button>} /> : <DataTable rows={query.data?.modules ?? []} columns={columns} rowKey={r => r.id} searchable={r => `${r.name} ${r.id} ${r.category} ${r.entries.join(' ')}`} searchPlaceholder="搜索模块、分类、源文件…" loading={query.isPending} pageSize={10} selectionControls batchActions={[{ label:'批量提取预览',clearSelectionOnRun:false, onRun: rows => setInspection({ modules:rows, view:'preview' }) },{label:'导出选中模块',clearSelectionOnRun:false,onRun:rows=>setExportIds(rows.map(r=>r.id))}]} />}
          {query.data && <FormPanel title="项目技术栈与扫描边界"><dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{query.data.stack.map(s => <div key={s.name}><dt className="text-xs text-muted-foreground">{s.name}</dt><dd className="text-sm font-mono mt-1">{s.version}</dd></div>)}</dl><p className="text-xs text-muted-foreground">{query.data.method}。清单不代表模块已经可以独立安装；运行时资源、全局样式、权限及数据库依赖须人工审核。刷新只重新读取已生成清单，不执行实时文件扫描。</p></FormPanel>}
        </TabsContent>
        <TabsContent value="repository" className="mt-5 space-y-5"><EmptyState icon={<Package size={24} />} title="暂无模块安装包" description="仓库存储未启用 · V1.1" /><FormPanel title="模块仓库"><div className="flex flex-wrap gap-2">{['版本记录','下载','删除','分类管理'].map(label => <Button key={label} variant="outline" disabled>{label}</Button>)}</div></FormPanel></TabsContent>
        <TabsContent value="install" className="mt-5 space-y-5"><EmptyState icon={<Upload size={24} />} title="安装管理尚未启用" description="V1.1 不安装或改动模块。" /><FormPanel title="安装操作"><div className="flex flex-wrap gap-2">{['ZIP 上传','兼容性检测','安装','停用','卸载','备份','回滚'].map(label => <Button key={label} variant="outline" disabled>{label}</Button>)}</div></FormPanel></TabsContent>
      </Tabs>
      {exportIds && <ModuleExportDialog key={exportIds.join(',')} ids={exportIds} onClose={()=>setExportIds(null)}/>}
      <Dialog open={!!inspection} onOpenChange={open => { if (!open) setInspection(null); }}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{inspection?.view === 'preview' ? '提取预览' : inspection?.view === 'dependencies' ? '依赖分析' : '模块详情'} · {modules.length === 1 ? modules[0].name : `${modules.length} 个模块`}</DialogTitle><DialogDescription>源文件路径与依赖元数据；不包含源代码、密钥或用户数据。</DialogDescription></DialogHeader>
          {inspection?.view === 'preview' ? <div className="space-y-6"><div className="border-b border-border pb-4 text-sm"><p>候选私有文件：{privatePaths.length} · 共享依赖文件：{shared.length}</p><p className="text-muted-foreground mt-2">全局样式：src/styles.css · 项目配置与共享组件由目标平台提供。历史迁移只供核对，不自动打包。</p><p className="text-destructive mt-2">排除环境变量、密钥、登录会话、用户记录、Git、依赖目录及构建产物。尚未生成 ZIP，尚未执行安装。</p></div><h3 className="font-medium">候选私有文件（去重）</h3><Paths paths={privatePaths} /><h3 className="font-medium">共享文件（需平台提供，不重复打包）</h3><Paths paths={shared} /><h3 className="font-medium">未解析依赖</h3><Paths paths={modules.flatMap(m => m.unresolved.map(r => `${r.file} → ${r.name}`))} /></div> : modules.map(m => <div key={m.id} className="space-y-5"><dl className="grid sm:grid-cols-2 gap-3 text-sm"><div><dt className="text-muted-foreground">模块 ID</dt><dd>{m.id}</dd></div><div><dt className="text-muted-foreground">版本</dt><dd>{m.version}</dd></div></dl>{inspection?.view === 'details' && <><h3 className="font-medium">入口文件</h3><Paths paths={m.entries} /><h3 className="font-medium">候选私有文件</h3><Paths paths={m.privateFiles} /></>}<h3 className="font-medium">共享依赖</h3><Paths paths={m.sharedFiles} /><h3 className="font-medium">样式</h3><Paths paths={[...m.styles,'src/styles.css（平台全局样式；非独立模块）']} /><h3 className="font-medium">npm 依赖 / 引用文件</h3>{m.npm.map(d => <div key={d.name} className="border-b border-border pb-2"><p className="text-sm font-mono mb-1">{d.name} {d.version}</p><Paths paths={d.files} /></div>)}<h3 className="font-medium">数据库表 / SQL 函数</h3>{[...m.tables,...m.rpcs].length ? [...m.tables.map(t => ({...t,label:'表'})),...m.rpcs.map(r => ({...r,label:'SQL 函数'}))].map(d => <div key={`${d.label}-${d.name}`}><p className="text-sm mb-1">{d.label}：{d.name}</p><Paths paths={d.files} /></div>) : <p className="text-sm text-muted-foreground">未发现字面量调用；不代表没有运行时依赖。</p>}<h3 className="font-medium">相关迁移（仅引用）</h3><Paths paths={m.migrations} /><h3 className="font-medium">服务函数与外部 API 候选</h3><Paths paths={m.privateFiles.concat(m.sharedFiles).filter(p => /\.(functions|server)\./.test(p))} />{m.apis.map(a => <div key={a.name}><p className="text-sm">{a.name}</p><Paths paths={a.files} /></div>)}<h3 className="font-medium">认证 / 权限引用</h3><Paths paths={m.authFiles} /><h3 className="font-medium">耦合模块</h3><Paths paths={m.coupledModules} /><h3 className="font-medium">未解析依赖</h3><Paths paths={m.unresolved.map(r => `${r.file} → ${r.name}`)} /><ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">{m.warnings.map(w => <li key={w}>{w}</li>)}</ul></div>)}
          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4"><Button variant="outline" onClick={() => setInspection(null)}>关闭</Button><Button onClick={() => {setReviewed(prev => new Set([...prev,...modules.map(m => m.id)]));setInspection(null);}}>标记本次已查阅</Button></div>
        </DialogContent>
      </Dialog>
    </section>
  );
}