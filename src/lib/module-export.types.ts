export type ExportFile = { path: string; sourcePath: string; kind: 'private' | 'shared' | 'asset' | 'migration'; bytes: number; sha256: string };
export type ModuleExportPreview = {
  id: string; name: string; version: string; digest: string; bytes: number;
  files: ExportFile[]; excluded: { path: string; reason: string }[];
  errors: string[]; warnings: string[]; cycles: string[][];
  configuration: string[]; dependencies: { name: string; version: string; files: string[] }[];
  database: string[]; installable: false; canExport: boolean;
};
export type ExportSnapshot = { generatedAt: string; modules: ModuleExportPreview[] };
export type ExportReview = { generatedAt: string; digest: string; modules: ModuleExportPreview[] };