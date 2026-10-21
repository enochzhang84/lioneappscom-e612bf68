import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { ensureAdmin } from '@/lib/platform';

export const getModuleInventory = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { moduleInventory } = await import('./module-inventory.server');
    return moduleInventory;
  });