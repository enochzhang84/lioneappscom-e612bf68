import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Download, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { previewModuleExport, downloadModuleExport } from '@/lib/module-export.functions';
import { base64Blob, deliverFile } from '@/lib/download-file';

export function ModuleExportDialog({ids,onClose}:{ids:string[];onClose:()=>void}) {
  const previewFn = useServerFn(previewModuleExport);
  const downloadFn = useServerFn(downloadModuleExport);
  const query = useQuery({queryKey:['admin','module-export',...ids.slice().sort()],queryFn:()=>previewFn({data:{ids}}),staleTime:0});
  const [confirmed,setConfirmed] = useState(false);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [ready,setReady] = useState<{blob:Blob;filename:string}|null>(null);
  const allowed = query.data?.modules.every(m=>m.canExport) ?? false;
  async function generate() {
    if (!query.data || !confirmed || !allowed) return;
    setBusy(true);setError('');
    try {
      const result = await downloadFn({data:{ids,digest:query.data.digest,confirmed:true}});
      setReady({blob:base64Blob(result.base64,'application/zip'),filename:result.filename});
    } catch (e) { setError(e instanceof Error ? e.message : '生成失败，请重试。'); }
    finally { setBusy(false); }
  }
  return <Dialog open onOpenChange={open=>{if(!open&&!busy)onClose();}}><DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>导出预检查与确认 · {ids.length} 个模块</DialogTitle><DialogDescription>真实源代码审查包 · 非可安装插件</DialogDescription></DialogHeader>
    {query.isPending && <p className="flex gap-2 items-center text-muted-foreground"><Loader2 className="animate-spin" size={16}/>读取预检查…</p>}
    {query.isError && <p role="alert" className="text-destructive">{query.error instanceof Error?query.error.message:'预检查失败'}</p>}
    {query.data?.modules.map(m=><section key={m.id} className="space-y-3 border-b border-border pb-5"><h3 className="font-semibold">{m.name} <span className="text-xs font-mono text-muted-foreground">{m.id} · {m.version}</span></h3>
      <p className="flex gap-2 items-center text-sm"><ShieldCheck size={16}/>{m.canExport?'安全筛查通过 · 可导出审查包':'安全筛查未通过 · 禁止导出'} · {(m.bytes/1024).toFixed(1)} KB · {m.files.length} 文件</p>
      {m.errors.map(e=><p role="alert" key={e} className="text-sm text-destructive">{e}</p>)}
      <p className="text-xs text-muted-foreground">SHA-256：<span className="font-mono break-all">{m.digest}</span></p>
      {(['private','shared','asset','migration'] as const).map(kind=>{const files=m.files.filter(f=>f.kind===kind);return files.length?<div key={kind}><h4 className="text-sm font-medium">{{private:'模块专用文件',shared:'共享依赖文件（包内副本，目标平台需核对）',asset:'源文件资源',migration:'数据库迁移文件（仅供审查）'}[kind]} · {files.length}</h4><ul className="mt-2 space-y-1 text-xs font-mono text-muted-foreground">{files.map(f=><li key={f.path} className="flex justify-between gap-3"><span className="break-all">{f.path}</span><span className="shrink-0">{f.bytes} B</span></li>)}</ul></div>:null;})}
      <details className="text-sm"><summary className="cursor-pointer font-medium">外部 npm 依赖 · {m.dependencies.length}</summary><ul className="mt-2 text-xs font-mono space-y-1">{m.dependencies.map(d=><li key={d.name}>{d.name} {d.version}</li>)}</ul></details>
      <details className="text-sm"><summary className="cursor-pointer font-medium">配置要求与数据库引用</summary><ul className="mt-2 text-xs font-mono space-y-1">{m.configuration.map(c=><li key={c}>{c}（不包含值）</li>)}{m.database.map(c=><li key={c}>{c}</li>)}</ul></details>
      <details open={m.excluded.length>0} className="text-sm"><summary className="cursor-pointer font-medium">无法自动提取 / 排除 · {m.excluded.length}</summary><ul className="mt-2 space-y-2 text-xs text-muted-foreground">{m.excluded.map(e=><li key={e.path}><span className="font-mono break-all">{e.path}</span> — {e.reason}</li>)}</ul></details>
      <details className="text-sm"><summary className="cursor-pointer font-medium">循环依赖、项目耦合与审核限制</summary><ul className="mt-2 space-y-2 text-xs text-muted-foreground">{m.warnings.map(w=><li key={w}>{w}</li>)}</ul>{m.cycles.map((cycle,i)=><p key={i} className="text-xs font-mono break-all">{cycle.join(' → ')}</p>)}</details>
    </section>)}
    {query.data && <div className="space-y-4"><p className="text-sm text-muted-foreground flex items-start gap-2"><AlertTriangle size={16} className="shrink-0"/>所有包均为 installable=false；未执行安装、数据库操作或完整独立运行验证。</p><label className="flex items-start gap-3 text-sm cursor-pointer"><Checkbox checked={confirmed} disabled={busy||!!ready} onCheckedChange={value=>setConfirmed(value===true)}/>我已审核真实文件、排除项和依赖，确认生成源码审查 ZIP。</label></div>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {ready && <p role="status" className="text-sm text-primary">ZIP 已准备好：{ready.filename} · {(ready.blob.size/1024).toFixed(1)} KB</p>}
    <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4"><Button variant="outline" onClick={onClose} disabled={busy}>关闭</Button>{ready?<Button onClick={()=>deliverFile(ready.blob,ready.filename)}><Download size={16}/>下载 ZIP</Button>:<Button disabled={!confirmed||!allowed||busy||query.isFetching} onClick={generate}>{busy?<Loader2 size={16} className="animate-spin"/>:<Download size={16}/>}确认生成 ZIP</Button>}</div>
  </DialogContent></Dialog>;
}