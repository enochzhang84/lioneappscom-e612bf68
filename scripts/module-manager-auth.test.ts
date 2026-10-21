import { test, expect } from 'bun:test';
import { ensureAdmin } from '../src/lib/platform';

function context(role: string | null) {
  const filters: [string,string][] = [];
  const query = {
    select: () => query,
    eq: (key: string, value: string) => { filters.push([key,value]);return query; },
    maybeSingle: async () => ({ data: role === 'admin' ? { role } : null, error: null }),
  };
  return { context: { userId: 'requesting-user', supabase: { from: () => query } } as unknown as Parameters<typeof ensureAdmin>[0], filters };
}
test('module inventory admin authorization rejects non-admin accounts', async () => {
  const mock = context('viewer');
  await expect(ensureAdmin(mock.context)).rejects.toThrow('Forbidden: admin role required');
});
test('module inventory authorizes the authenticated caller through an admin role row', async () => {
  const mock = context('admin');
  await expect(ensureAdmin(mock.context)).resolves.toBeUndefined();
  expect(mock.filters).toEqual([['user_id','requesting-user'],['role','admin']]);
});