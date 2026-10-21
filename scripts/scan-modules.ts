import { readdirSync, readFileSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { dirname, posix } from 'node:path';
import { sourceReferences, allowedSourcePath } from './module-scan-lib';
import type { ModuleManifest, ModuleInventory } from '../src/lib/module-manager.types';

// Offline only. Never imported by the application or run in a Worker.
const definitions = [
  ['calculator','计算器中心','换算','通用计算器与领域计算公式。',['src/components/calculator/Calculator.tsx']],
  ['converter','单位换算','换算','通用单位转换与单位定义。',['src/components/converter/UnitConverter.tsx']],
  ['currency','汇率换算','换算','货币汇率查询与换算。',['src/components/currency/CurrencyConverter.tsx']],
  ['bible','圣经阅读器','阅读','CUV、CUNP、KJV 阅读组件。',['src/components/bible/BibleCUV.tsx','src/components/bible/BibleCUNP.tsx','src/components/bible/BibleKJV.tsx']],
  ['c1-exam','C1 模拟考试','考试','现有随机模拟考试。',['src/components/exam/C1MockExamHub.tsx']],
  ['c1-bank','C1 顺序题库','考试','顺序练习、收藏与错题记录。',['src/components/exam/C1QuestionBank.tsx','src/routes/dmv.c1.question-bank.tsx']],
  ['automotive','汽车工具中心','换算','汽车相关计算与工具聚合。',['src/components/automotive/AutomotiveHub.tsx']],
  ['photo-wall','Photo Wall Studio','创作','照片墙编辑、时间轴、场景与导出。',['src/routes/tools.photo-wall.index.tsx','src/components/photowall/StudioEditor.tsx','src/routes/tools.photo-wall.$id.tsx','src/routes/display.photo-wall-preview.$id.tsx']],
  ['solution-builder','Solution Builder','方案','硬件配置、兼容规则、PDF 和分享。',['src/components/solution-builder/BuilderShell.tsx','src/routes/tools.solution-builder.index.tsx','src/lib/solution-builder.functions.ts']],
  ['ai-tools','AI 助手','AI','统一 AI 工具与服务调用。',['src/components/ai/AiToolByKey.tsx']],
  ['dev-tools','开发工具','工具','文本与开发格式处理。',['src/components/tools/DevTool.tsx']],
  ['text-tools','文本工具','工具','文本处理工具组。',['src/components/tools/TextTool.tsx']],
  ['image-tools','图片工具','工具','图片处理与转换。',['src/components/tools/ImageTool.tsx']],
  ['pdf-tools','PDF 工具','工具','PDF 处理工具组。',['src/components/tools/PdfTool.tsx']],
  ['file-hash','文件哈希','工具','文件摘要计算。',['src/components/tools/FileHashTool.tsx']],
  ['network-tools','网络工具','工具','网络查询工具与服务调用。',['src/components/tools/NetworkTool.tsx']],
  ['lookup-tools','查询工具','工具','信息查询工具组。',['src/components/tools/LookupTool.tsx']],
  ['time-tools','时间工具','工具','时间处理工具组。',['src/components/tools/TimeTool.tsx']],
  ['simple-tools','通用实用工具','工具','现有简易工具集合。',['src/components/tools/SimpleTool.tsx']],
] as const;
function list(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap(e => e.isDirectory() ? list(`${path}/${e.name}`) : [`${path}/${e.name}`]);
}
const all = list('src');
const sourceFiles = all.filter(p => /\.(tsx?|jsx?|css)$/.test(p) && !/module-(inventory|export-snapshot|export-payloads)\.server\./.test(p));
const refs = new Map(sourceFiles.map(p => [p, sourceReferences(readFileSync(p,'utf8'))]));
const pkg = JSON.parse(readFileSync('package.json','utf8'));
function resolve(file: string, spec: string) {
  const path = spec.startsWith('@/') ? `src/${spec.slice(2)}` : spec.startsWith('.') ? posix.normalize(`${dirname(file)}/${spec}`) : undefined;
  if (!path || !allowedSourcePath(path)) return undefined;
  const clean = path.split('?')[0];
  return [clean, ...['.ts','.tsx','.js','.jsx','.json','.css','/index.ts','/index.tsx'].map(ext => clean+ext)].find(p => existsSync(p) && statSync(p).isFile());
}
const graphs = definitions.map(([id,name,category,description,entryList]) => {
  const files = new Set<string>(); const unresolved: ModuleManifest['unresolved'] = [];
  const visit = (path: string) => {
    if (files.has(path)) return; files.add(path);
    for (const spec of refs.get(path)?.imports ?? []) {
      if (!(spec.startsWith('.') || spec.startsWith('@/'))) continue;
      const resolved = resolve(path,spec);
      if (resolved) visit(resolved); else unresolved.push({name:spec,file:path});
    }
  };
  const entries = entryList.filter(p => existsSync(p));
  entries.forEach(visit);
  return {id,name,category,description,entries,files,unresolved};
});
const migrations = existsSync('supabase/migrations') ? list('supabase/migrations').filter(p => p.endsWith('.sql')).map(p => ({path:p,text:readFileSync(p,'utf8')})) : [];
const modules: ModuleManifest[] = graphs.map(g => {
  const sharedFiles = [...g.files].filter(p => graphs.filter(other => other.files.has(p)).length > 1 || /^src\/(integrations|components\/ui)\//.test(p) || /src\/(styles.css|components\/SiteLayout.tsx|lib\/(platform|i18n|utils))/.test(p));
  const mapRefs = (key:'tables'|'rpcs'|'apiHosts') => {
    const names = new Map<string,Set<string>>();
    for (const file of g.files) for (const name of refs.get(file)?.[key] ?? []) {const paths = names.get(name) ?? new Set();paths.add(file);names.set(name,paths);}
    return [...names].map(([name,files]) => ({name,files:[...files].sort()}));
  };
  const deps = new Map<string,Set<string>>();
  for (const file of g.files) for (const spec of refs.get(file)?.imports ?? []) {
    if (spec.startsWith('.') || spec.startsWith('@/')) continue;
    const name = spec.startsWith('@') ? spec.split('/').slice(0,2).join('/') : spec.split('/')[0];
    const files = deps.get(name) ?? new Set(); files.add(file);deps.set(name,files);
  }
  const tables = mapRefs('tables'), rpcs = mapRefs('rpcs');
  const authFiles = [...g.files].filter(p => /auth|platform\.ts/.test(p) || refs.get(p)?.imports.some(s => /auth-middleware/.test(s)));
  return {id:g.id,name:g.name,category:g.category,description:g.description,version:'未单独版本化',entries:g.entries,
    privateFiles:[...g.files].filter(p => !sharedFiles.includes(p)).sort(),sharedFiles:sharedFiles.sort(),styles:[...g.files].filter(p => p.endsWith('.css')),
    npm:[...deps].map(([name,files]) => ({name,version:pkg.dependencies[name] ?? pkg.devDependencies[name] ?? '需确认',files:[...files].sort()})),
    tables,rpcs,apis:mapRefs('apiHosts'),migrations:migrations.filter(m => [...tables,...rpcs].some(r => new RegExp(`\\b${r.name}\\b`).test(m.text))).map(m => m.path),
    authFiles,unresolved:g.unresolved,coupledModules:graphs.filter(other => other.id !== g.id && other.entries.some(e => g.files.has(e))).map(other => other.id),status:'待管理员审核',
    warnings:[
      '基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。',
      '共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。',
      '表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。',
      ...(g.id === 'photo-wall' ? ['依赖浏览器 IndexedDB、图片/音乐资源与浏览器视频编码能力；清单不包含用户项目或媒体。'] : []),
      ...(g.id === 'ai-tools' ? ['依赖目标平台的 AI Gateway 凭据与服务额度；清单不包含密钥。'] : []),
      ...(g.id === 'bible' || g.id === 'currency' ? ['依赖外部查询服务可用性与跨域访问；需在目标平台验证。'] : []),
      ...(tables.length || rpcs.length ? ['需要核对 Lovable Cloud 表结构、SQL 函数、RLS 与历史迁移；不包含任何记录。'] : []),
      ...(authFiles.length ? ['包含登录或管理员权限依赖；目标项目需提供兼容的认证及角色机制。'] : []),
      ...(g.unresolved.length ? ['存在未解析路径，提取范围尚不完整。'] : []),
    ],
  };
});
const result: ModuleInventory = {generatedAt:new Date().toISOString(),method:'离线源文件静态清单 · 字面量 import / from / rpc 分析',
  stack:['@tanstack/react-start','@tanstack/react-router','react','vite','tailwindcss','@supabase/supabase-js'].map(name => ({name,version:pkg.dependencies[name] ?? pkg.devDependencies[name]})), modules};
writeFileSync('src/lib/module-inventory.server.ts',`// Generated offline by scripts/scan-modules.ts. Metadata only; no source, secrets or database rows.\nimport type { ModuleInventory } from './module-manager.types';\nexport const moduleInventory: ModuleInventory = ${JSON.stringify(result,null,2)};\n`);
console.log(`Identified ${modules.length} candidate modules; ${sourceFiles.length} source files inspected.`);