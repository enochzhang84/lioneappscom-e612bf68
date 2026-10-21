import { test, expect } from 'bun:test';
import { exportPathAllowed, sensitiveReasons, migrationHasData, findCycles } from './module-export-lib';
import { authorizeExport, reviewSelection } from '../src/lib/module-export-policy';
import type { ExportSnapshot, ModuleExportPreview } from '../src/lib/module-export.types';

test('source exports exclude environments, traversal and generated connection files', () => {
  for (const path of ['.env','src/.env.local','src/../.env','src/integrations/supabase/client.ts','src/a.asset.json','src/module-export-payloads.server.ts']) expect(exportPathAllowed(path)).toBe(false);
  expect(exportPathAllowed('src/components/calculator/Calculator.tsx')).toBe(true);
});
test('hardcoded passwords are blocked but environment references are allowed', () => {
  expect(sensitiveReasons('const ADMIN_SECRET = "private-example-value"')).toContain('硬编码敏感凭据');
  expect(sensitiveReasons('const apiKey = process.env.LOVABLE_API_KEY')).toEqual([]);
});
test('migrations with literal data inserts are excluded from source archives', () => {
  expect(migrationHasData('INSERT INTO public.quiz_questions (id) VALUES (1);')).toBe(true);
  expect(migrationHasData('CREATE TABLE public.exam (id uuid); GRANT SELECT ON public.exam TO authenticated;')).toBe(false);
});
test('cycles are disclosed by precheck', () => {
  expect(findCycles(new Map([['src/a.ts',['src/b.ts']],['src/b.ts',['src/a.ts']]]))).toEqual([['src/a.ts','src/b.ts','src/a.ts']]);
});
const module = {id:'calculator',digest:'source-hash',canExport:true,installable:false} as ModuleExportPreview;
const snapshot: ExportSnapshot = { generatedAt:'2026-10-21',modules:[module] };
test('export requires explicit confirmation of the reviewed digest', () => {
  const review = reviewSelection(snapshot,['calculator']);
  expect(() => authorizeExport(snapshot,['calculator'],review.digest,false)).toThrow('确认');
  expect(() => authorizeExport(snapshot,['calculator'],'stale',true)).toThrow('更新');
  expect(authorizeExport(snapshot,['calculator'],review.digest,true).modules[0].installable).toBe(false);
});
test('unknown modules and unsafe prechecks cannot be downloaded', () => {
  expect(() => reviewSelection(snapshot,['../../.env'])).toThrow('未知模块');
  const unsafe = {...snapshot,modules:[{...module,canExport:false}]};
  expect(() => authorizeExport(unsafe,['calculator'],'calculator:source-hash',true)).toThrow('安全预检查');
});