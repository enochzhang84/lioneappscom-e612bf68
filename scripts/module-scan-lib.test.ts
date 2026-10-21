import { test, expect } from 'bun:test';
import { allowedSourcePath, sourceReferences, previewScope } from './module-scan-lib';

test('module scope never accepts environment, dependency or arbitrary traversal paths', () => {
  expect(allowedSourcePath('.env')).toBe(false);
  expect(allowedSourcePath('src/../../.env')).toBe(false);
  expect(allowedSourcePath('src/.env.local')).toBe(false);
  expect(allowedSourcePath('src/node_modules/key.ts')).toBe(false);
  expect(allowedSourcePath('src/components/exam/C1QuestionBank.tsx')).toBe(true);
});
test('scan tracks literal dynamic imports and database dependencies without exposing source', () => {
  const refs = sourceReferences(`import {x} from '@/lib/x'; await import('./y'); db.from('quiz_questions'); db.rpc('grade_quiz_questions');`);
  expect(refs.imports).toEqual(['@/lib/x', './y']);
  expect(refs.tables).toEqual(['quiz_questions']);
  expect(refs.rpcs).toEqual(['grade_quiz_questions']);
});
test('batch extraction separates shared dependencies and deduplicates source files', () => {
  expect(previewScope([{privateFiles:['src/a.ts'],sharedFiles:['src/ui.ts']},{privateFiles:['src/a.ts','src/b.ts'],sharedFiles:['src/ui.ts']}])).toEqual({privateFiles:['src/a.ts','src/b.ts'],sharedFiles:['src/ui.ts']});
});