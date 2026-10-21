import ts from 'typescript';

export function exportPathAllowed(path: string) {
  return /^(src\/|supabase\/migrations\/)/.test(path) && !path.includes('\\') && !path.split('/').some(p => p === '..' || p.startsWith('.'))
    && !/(^|\/)(node_modules|dist|build|integrations)(\/|$)/.test(path)
    && !/\.(asset\.json|map)$/.test(path)
    && !/module-(inventory|export-snapshot|export-payloads)\.server\./.test(path);
}

// Conservative, whole-file exclusion: never rewrite source to conceal a secret.
export function sensitiveReasons(text: string) {
  const reasons = new Set<string>();
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:sk_live_|sk_test_|sb_secret_)[A-Za-z0-9_]+|\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(text)) reasons.add('疑似私有密钥或令牌');
  const source = ts.createSourceFile('source.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const secretName = /password|passwd|secret|api_?key|access_?token|refresh_?token|authorization|credential/i;
  const secretValue = (node: ts.Node | undefined) => node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && node.text.length > 3;
  function walk(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && secretName.test(node.name.getText(source)) && secretValue(node.initializer)) reasons.add('硬编码敏感凭据');
    if (ts.isPropertyAssignment(node) && secretName.test(node.name.getText(source)) && secretValue(node.initializer)) reasons.add('硬编码敏感凭据');
    if (ts.isBinaryExpression(node) && secretName.test(node.left.getText(source)) && secretValue(node.right)) reasons.add('硬编码敏感凭据');
    ts.forEachChild(node, walk);
  }
  walk(source);
  return [...reasons];
}

export function migrationHasData(text: string) {
  return /\b(?:insert\s+into|update\s+(?:public\.|auth\.|storage\.)?[a-z_][a-z0-9_]*\s+set|delete\s+from|copy\s+|truncate\s+)/i.test(text);
}

export function findCycles(graph: Map<string, string[]>) {
  const cycles: string[][] = []; const done = new Set<string>(); const active: string[] = [];
  function visit(path: string) {
    const index = active.indexOf(path);
    if (index >= 0) { cycles.push([...active.slice(index),path]); return; }
    if (done.has(path)) return;
    active.push(path);
    for (const next of graph.get(path) ?? []) visit(next);
    active.pop(); done.add(path);
  }
  for (const path of graph.keys()) visit(path);
  return cycles;
}