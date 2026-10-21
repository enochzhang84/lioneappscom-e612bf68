import { readFileSync, writeFileSync, existsSync, lstatSync, realpathSync } from 'node:fs';
import { resolve, dirname, posix } from 'node:path';
import { createHash } from 'node:crypto';
import JSZip from 'jszip';
import { moduleInventory } from '../src/lib/module-inventory.server';
import type { ModuleExportPreview, ExportFile } from '../src/lib/module-export.types';
import { exportPathAllowed, sensitiveReasons, migrationHasData, findCycles } from './module-export-lib';
import { sourceReferences } from './module-scan-lib';

const root = realpathSync('.');
const hash = (bytes: string | Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const previews: ModuleExportPreview[] = [];
const payloads: Record<string,string> = {};
for (const module of moduleInventory.modules) {
  const zip = new JSZip();
  const files: ExportFile[] = []; const excluded: ModuleExportPreview['excluded'] = [];
  const errors: string[] = []; const configuration = new Set<string>();
  const graph = new Map<string,string[]>();
  const paths = [...new Set([...module.privateFiles,...module.sharedFiles,'src/styles.css',...module.migrations])].sort();
  const add = (path: string, reason: string) => {
    excluded.push({path,reason});
    if (module.privateFiles.includes(path) || module.entries.includes(path)) errors.push(`${path}：必需私有文件未包含（${reason}）`);
  };
  const allowed = new Set(paths);
  for (const path of paths) {
    if (!exportPathAllowed(path)) { add(path,'平台连接配置、资产指针或受限制路径；目标平台需提供'); continue; }
    if (!existsSync(path) || !lstatSync(path).isFile() || lstatSync(path).isSymbolicLink() || !realpathSync(path).startsWith(`${root}/`)) { add(path,'文件不存在或非允许的真实项目文件'); continue; }
    const bytes = readFileSync(path);
    const textFile = /\.(tsx?|jsx?|css|json|sql|svg)$/.test(path);
    if (bytes.length > 2_000_000) { add(path,'资源超过单文件安全预算，需要单独迁移'); continue; }
    if (textFile) {
      const text = bytes.toString('utf8');
      const reasons = sensitiveReasons(text);
      if (reasons.length) { add(path,reasons.join('；')); continue; }
      if (path.endsWith('.sql') && migrationHasData(text)) { add(path,'历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化'); continue; }
      for (const match of text.matchAll(/(?:process\.env\.(\w+)|process\.env\[['"](\w+)['"]\]|import\.meta\.env\.(\w+))/g)) configuration.add(match[1] ?? match[2] ?? match[3]);
      const imports = sourceReferences(text).imports;
      const local = imports.filter(s => s.startsWith('.') || s.startsWith('@/')).map(s => s.startsWith('@/') ? `src/${s.slice(2)}` : posix.normalize(`${dirname(path)}/${s}`)).map(p => p.split('?')[0]);
      graph.set(path,local.flatMap(p => [p,...['.ts','.tsx','.js','.json','/index.ts','/index.tsx'].map(ext => p+ext)].filter(p => allowed.has(p))));
    }
    const kind = path.startsWith('supabase/migrations/') ? 'migration' : /\.(png|jpg|jpeg|webp|gif|svg|woff2?)$/.test(path) ? 'asset' : module.privateFiles.includes(path) ? 'private' : 'shared';
    // Preserve original import-relative paths for assets; no fake empty directories.
    const archivePath = kind === 'migration' ? `database/migrations/${path.split('/').at(-1)}` : path;
    zip.file(`${module.id}/${archivePath}`,bytes);
    files.push({path:archivePath,sourcePath:path,kind,bytes:bytes.length,sha256:hash(bytes)});
  }
  for (const entry of module.entries) if (!files.some(f => f.sourcePath === entry)) errors.push(`入口文件未通过检查：${entry}`);
  if (!module.entries.length) errors.push('无实际入口文件');
  const cycles = findCycles(graph);
  const warnings = [...module.warnings,
    '这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。',
    '源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。',
    ...excluded.map(e => `${e.path}：${e.reason}`),
    ...module.unresolved.map(r => `未解析：${r.file} → ${r.name}`),
    ...module.npm.filter(d => d.version === '需确认').map(d => `npm 版本未明确：${d.name}`),
    ...(cycles.length ? ['发现循环引用，需要人工审查。'] : []),
    ...(module.coupledModules.length ? [`模块耦合：${module.coupledModules.join(', ')}`] : []),
    '静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。',
  ];
  const version = '0.0.0-source-snapshot';
  const dependencies = Object.fromEntries(module.npm.filter(d => d.version !== '需确认').map(d => [d.name,d.version]));
  const peers = Object.fromEntries(moduleInventory.stack.filter(s => ['react','@tanstack/react-start','@tanstack/react-router','tailwindcss'].includes(s.name)).map(s => [s.name,s.version]));
  const manifest = {
    id:module.id,name:module.name,version,description:module.description,entry:module.entries,
    framework:'TanStack Start / React', frameworkVersion:peers['@tanstack/react-start'], moduleType:module.category,
    dependencies,peerDependencies:peers,sourceVersion:module.version,generatedAt:moduleInventory.generatedAt,
    privateFiles:files.filter(f => f.kind === 'private').map(f => f.path),sharedFiles:files.filter(f => f.kind === 'shared').map(f => f.path),
    assets:files.filter(f => f.kind === 'asset').map(f => f.path),database:{tables:module.tables,rpcs:module.rpcs,includedMigrations:files.filter(f => f.kind === 'migration').map(f => f.path),referencedMigrations:module.migrations},
    configuration:[...configuration].sort(),excluded,unresolved:module.unresolved,coupledModules:module.coupledModules,cycles,precheck:{errors,warnings},installable:false,
  };
  const docs: Record<string,string> = {
    'manifest.json': JSON.stringify(manifest,null,2),
    'package.json': JSON.stringify({name:`@lioneapps/${module.id}`,version,private:true,type:'module',dependencies,peerDependencies:peers},null,2),
    'README.md': `# ${module.name}\n\n${module.description}\n\n真实源代码快照：${moduleInventory.generatedAt}\n\n版本 ${version} 仅表示源码快照，不是现有独立产品版本。\n\n**不可直接安装。** 请先阅读 docs/installation.md 与 docs/dependencies.md。\n\n包含 ${files.length} 个经过筛查的实际文件；不包含环境文件、密钥、数据库记录或用户媒体。\n`,
    'docs/installation.md': `# 安装审查\n\n本包不自动安装、不修改数据库。installable=false。\n\n1. 审查 manifest.json 的排除项、耦合和预检查。\n2. 由目标平台提供缺失共享组件、路由、主题、认证和角色验证。\n3. 配置下列环境变量名称（值未导出）：\n${[...configuration].map(k=>`- ${k}`).join('\n')}\n4. 单独审查历史迁移，只在目标平台确认后处理；不要在生产运行未经审核的迁移。\n5. 安装 npm 依赖后，针对实际入口完成编译与业务验证。\n\n没有经过独立运行验证。\n`,
    'docs/dependencies.md': `# 依赖与限制\n\n## npm\n${module.npm.map(d=>`- ${d.name}: ${d.version}`).join('\n')}\n\n## 共享与排除\n${excluded.map(e=>`- ${e.path}: ${e.reason}`).join('\n')}\n\n## 审查事项\n${warnings.map(w=>`- ${w}`).join('\n')}\n\n## 数据库引用\n${[...module.tables,...module.rpcs].map(t=>`- ${t.name}`).join('\n')}\n`,
  };
  for (const [path,text] of Object.entries(docs)) zip.file(`${module.id}/${path}`,text);
  zip.file(`${module.id}/checksums.sha256`,[...files.map(f=>`${f.sha256}  ${f.path}`),...Object.entries(docs).map(([p,t])=>`${hash(t)}  ${p}`)].join('\n')+'\n');
  const archive = await zip.generateAsync({type:'uint8array',compression:'DEFLATE',compressionOptions:{level:6}});
  const canExport = !errors.length && archive.length < 4_000_000;
  previews.push({id:module.id,name:module.name,version,digest:hash(archive),bytes:archive.length,files,excluded,errors,warnings,cycles,configuration:[...configuration].sort(),dependencies:module.npm,database:[...module.tables,...module.rpcs].map(t=>t.name),installable:false,canExport});
  if (canExport) payloads[module.id] = Buffer.from(archive).toString('base64');
}
writeFileSync('src/lib/module-export-snapshot.server.ts',`// Generated offline. Metadata only.\nimport type { ExportSnapshot } from './module-export.types';\nexport const exportSnapshot: ExportSnapshot = ${JSON.stringify({generatedAt:moduleInventory.generatedAt,modules:previews},null,2)};\n`);
writeFileSync('src/lib/module-export-payloads.server.ts',`// PRIVATE: generated source archives; import only after administrator authorization.\nexport const exportPayloads: Record<string,string> = ${JSON.stringify(payloads)};\n`);
console.log(JSON.stringify({modules:previews.length,exportable:previews.filter(m=>m.canExport).length,payloadBytes:JSON.stringify(payloads).length,blocked:previews.filter(m=>!m.canExport).map(m=>({id:m.id,errors:m.errors}))},null,2));