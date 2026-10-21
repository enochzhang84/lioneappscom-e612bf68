import type { ExportSnapshot, ExportReview } from './module-export.types';

export function reviewSelection(snapshot: ExportSnapshot, ids: string[]): ExportReview {
  const unique = [...new Set(ids)].sort();
  if (!unique.length || unique.length > 19) throw new Error('请选择 1 至 19 个模块。');
  const modules = unique.map(id => {
    const module = snapshot.modules.find(m => m.id === id);
    if (!module) throw new Error('未知模块；不允许指定文件路径。');
    return module;
  });
  return { generatedAt: snapshot.generatedAt, digest: modules.map(m => `${m.id}:${m.digest}`).join('|'), modules };
}

export function authorizeExport(snapshot: ExportSnapshot, ids: string[], digest: string, confirmed: boolean) {
  const review = reviewSelection(snapshot, ids);
  if (!confirmed) throw new Error('请先确认真实文件预览。');
  if (review.digest !== digest) throw new Error('清单已更新，请重新预览并确认。');
  if (review.modules.some(m => !m.canExport)) throw new Error('存在未通过安全预检查的模块，禁止导出。');
  return review;
}