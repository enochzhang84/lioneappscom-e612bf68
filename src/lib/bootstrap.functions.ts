// Admin detection + first-admin bootstrap.
// The public RLS INSERT policy on user_roles has been removed to eliminate
// the race where any authenticated user could self-claim admin. All writes go
// through this server function using the service-role client with a strict
// "no admin exists yet" precondition.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // 1) Am I already an admin? (uses caller's session — no service role needed)
    const { data: mine, error: mineErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (mineErr) throw new Error(mineErr.message);
    if (mine) return { is_admin: true, claimed: false };

    // 2) Not an admin yet. Bootstrap only if no admin exists at all.
    //    Uses the service-role client because the public "self-claim" RLS
    //    policy has been dropped for security. The `unique(user_id, role)`
    //    constraint + the pre-check together prevent duplicate/late claims.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count, error: countErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countErr) throw new Error(countErr.message);
    if ((count ?? 0) > 0) return { is_admin: false, claimed: false };

    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (insErr) {
      console.error("[claimFirstAdmin] bootstrap failed:", insErr.message);
      return { is_admin: false, claimed: false };
    }
    return { is_admin: true, claimed: true };
  });
