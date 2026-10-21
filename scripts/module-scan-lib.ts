import ts from 'typescript';

export function sourceReferences(text: string) {
  const imports = new Set<string>();
  const file = ts.createSourceFile('source.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  function walk(node: ts.Node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) imports.add(node.moduleSpecifier.text);
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) imports.add(arg.text);
    }
    ts.forEachChild(node, walk);
  }
  walk(file);
  return {
    imports: [...imports],
    tables: [...text.matchAll(/\.from\(\s*["']([^"']+)["']/g)].map(m => m[1]),
    rpcs: [...text.matchAll(/\.rpc\(\s*["']([^"']+)["']/g)].map(m => m[1]),
    apiHosts: [...new Set([...text.matchAll(/https?:\/\/([a-zA-Z0-9.-]+)/g)].map(m => m[1]))],
  };
}

export function allowedSourcePath(path: string) {
  return path.startsWith('src/') && !path.split('/').includes('..') && !/(^|\/)(\.env[^/]*|\.git|node_modules)(\/|$)/.test(path);
}

export function previewScope(modules: { privateFiles: string[]; sharedFiles: string[] }[]) {
  const sharedFiles = new Set(modules.flatMap(m => m.sharedFiles));
  const privateFiles = new Set(modules.flatMap(m => m.privateFiles));
  for (const path of sharedFiles) privateFiles.delete(path);
  return { privateFiles: [...privateFiles].sort(), sharedFiles: [...sharedFiles].sort() };
}