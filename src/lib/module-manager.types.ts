export type ModuleManifest = {
  id: string; name: string; description: string; category: string; version: string;
  entries: string[]; privateFiles: string[]; sharedFiles: string[]; styles: string[];
  npm: { name: string; version: string; files: string[] }[];
  tables: { name: string; files: string[] }[]; rpcs: { name: string; files: string[] }[];
  apis: { name: string; files: string[] }[]; migrations: string[];
  unresolved: { name: string; file: string }[]; coupledModules: string[];
  authFiles: string[]; warnings: string[]; status: string;
};
export type ModuleInventory = {
  generatedAt: string; method: string;
  stack: { name: string; version: string }[];
  modules: ModuleManifest[];
};