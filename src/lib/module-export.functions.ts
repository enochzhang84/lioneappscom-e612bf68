import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { setResponseHeader } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { ensureAdmin } from '@/lib/platform';
import { reviewSelection, authorizeExport } from './module-export-policy';

const selection = z.object({ ids:z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1).max(19) });
export const previewModuleExport = createServerFn({method:'POST'})
  .middleware([requireSupabaseAuth])
  .inputValidator(selection)
  .handler(async ({data,context}) => {
    await ensureAdmin(context);
    setResponseHeader('Cache-Control','private, no-store');
    const {exportSnapshot} = await import('./module-export-snapshot.server');
    return reviewSelection(exportSnapshot,data.ids);
  });

export const downloadModuleExport = createServerFn({method:'POST'})
  .middleware([requireSupabaseAuth])
  .inputValidator(selection.extend({digest:z.string().max(3000),confirmed:z.literal(true)}))
  .handler(async ({data,context}) => {
    await ensureAdmin(context);
    setResponseHeader('Cache-Control','private, no-store');
    const {exportSnapshot} = await import('./module-export-snapshot.server');
    const review = authorizeExport(exportSnapshot,data.ids,data.digest,data.confirmed);
    const {exportPayloads} = await import('./module-export-payloads.server');
    const modules = review.modules;
    if (modules.reduce((sum,m)=>sum+m.bytes,0) > 7_000_000) throw new Error('所选包过大，请分批导出。');
    if (modules.length === 1) {
      const module = modules[0];
      const base64 = exportPayloads[module.id];
      if (!base64) throw new Error('导出包不可用，请重新生成清单。');
      return {base64,filename:`${module.id}-source.zip`};
    }
    const {default:JSZip} = await import('jszip');
    const zip = new JSZip();
    for (const module of modules) {
      const base64 = exportPayloads[module.id];
      if (!base64) throw new Error('导出包不可用，请重新生成清单。');
      const archive = await JSZip.loadAsync(base64,{base64:true});
      for (const file of Object.values(archive.files)) if (!file.dir) zip.file(file.name,await file.async('uint8array'));
    }
    return {base64:await zip.generateAsync({type:'base64',compression:'DEFLATE',compressionOptions:{level:6}}),filename:`lioneapps-${modules.length}-modules-source.zip`};
  });