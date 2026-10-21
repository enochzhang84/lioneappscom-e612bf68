import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import JSZip from 'jszip';
import { exportSnapshot } from '../src/lib/module-export-snapshot.server';
import { exportPayloads } from '../src/lib/module-export-payloads.server';
import { sensitiveReasons, migrationHasData } from './module-export-lib';

for (const module of exportSnapshot.modules) test(`actual ${module.id} archive excludes secrets and verifies every checksum`,async()=>{
  expect(module.installable).toBe(false);
  if (!module.canExport) { expect(exportPayloads[module.id]).toBeUndefined();return; }
  const payload = exportPayloads[module.id];
  expect(typeof payload).toBe('string');
  const zip=await JSZip.loadAsync(payload,{base64:true});
  const checksums=await zip.file(`${module.id}/checksums.sha256`)?.async('string');
  expect(checksums).toBeDefined();
  for (const line of checksums?.trim().split('\n') ?? []) {
    const [expected,path]=line.split('  ');
    const bytes=await zip.file(`${module.id}/${path}`)?.async('uint8array');
    if (!bytes) throw new Error(`Missing checksum entry ${path}`);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(expected);
  }
  for (const file of module.files) {
    const bytes=await zip.file(`${module.id}/${file.path}`)?.async('uint8array');
    if (!bytes) throw new Error(`Missing source ${file.path}`);
    expect(Buffer.from(bytes).equals(readFileSync(file.sourcePath))).toBe(true);
    expect(file.sourcePath).not.toContain('/integrations/');
    if (/\.(tsx?|jsx?|sql|css|json|svg)$/.test(file.path)) {
      const text=Buffer.from(bytes).toString('utf8');
      expect(sensitiveReasons(text)).toEqual([]);
      if (file.kind==='migration') expect(migrationHasData(text)).toBe(false);
    }
  }
  for (const excluded of module.excluded) expect(module.files.some(f=>f.sourcePath===excluded.path)).toBe(false);
});