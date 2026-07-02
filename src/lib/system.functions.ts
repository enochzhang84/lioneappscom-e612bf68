// Admin: Notifications + Activity Logs. Requires auth + admin role.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

async function ensureAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

export type AdminNotification = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  link_url: string | null;
  is_global: boolean;
  target_user_id: string | null;
  read_by: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminActivityLog = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  summary: string | null;
  metadata: Record<string, string | number | boolean | null>;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

// ---------- Notifications ----------

export const adminListNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminNotification[];
  });

const notifInput = z.object({
  title: z.string().min(1).max(160),
  body: z.string().max(4000).optional().nullable(),
  type: z.enum(["info", "success", "warning", "error", "system"]).default("info"),
  link_url: z.string().max(500).optional().nullable(),
  is_global: z.boolean().default(true),
  target_user_id: z.string().uuid().optional().nullable(),
});

export const adminCreateNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => notifInput.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("admin_notifications")
      .insert({ ...data, created_by: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as AdminNotification;
  });

export const adminMarkNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: current } = await context.supabase
      .from("admin_notifications")
      .select("read_by")
      .eq("id", data.id)
      .maybeSingle();
    const readBy: string[] = ((current?.read_by as string[]) ?? []).slice();
    if (!readBy.includes(context.userId)) readBy.push(context.userId);
    const { error } = await context.supabase
      .from("admin_notifications")
      .update({ read_by: readBy })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminMarkAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: rows } = await context.supabase
      .from("admin_notifications")
      .select("id, read_by");
    for (const r of rows ?? []) {
      const readBy: string[] = ((r.read_by as string[]) ?? []).slice();
      if (readBy.includes(context.userId)) continue;
      readBy.push(context.userId);
      await context.supabase
        .from("admin_notifications")
        .update({ read_by: readBy })
        .eq("id", r.id);
    }
    return { ok: true };
  });

export const adminDeleteNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("admin_notifications")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Activity Logs ----------

const logsInput = z.object({
  search: z.string().optional(),
  action: z.string().optional(),
  entity_type: z.string().optional(),
  limit: z.number().int().min(1).max(500).default(200),
});

export const adminListActivityLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => logsInput.parse(d ?? {}))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    let q = context.supabase
      .from("admin_activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.action) q = q.eq("action", data.action);
    if (data.entity_type) q = q.eq("entity_type", data.entity_type);
    if (data.search) {
      const s = `%${data.search}%`;
      q = q.or(`summary.ilike.${s},actor_email.ilike.${s},entity_id.ilike.${s}`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as AdminActivityLog[];
  });

const logWriteInput = z.object({
  action: z.string().min(1).max(80),
  entity_type: z.string().max(80).optional().nullable(),
  entity_id: z.string().max(120).optional().nullable(),
  summary: z.string().max(500).optional().nullable(),
  metadata: z.record(z.string(), z.any()).default({}),
});

export const adminWriteActivityLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => logWriteInput.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: userRes } = await context.supabase.auth.getUser();
    const { error } = await context.supabase.from("admin_activity_logs").insert({
      actor_id: context.userId,
      actor_email: userRes.user?.email ?? null,
      action: data.action,
      entity_type: data.entity_type ?? null,
      entity_id: data.entity_id ?? null,
      summary: data.summary ?? null,
      metadata: data.metadata,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminClearOldLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { days: number }) => z.object({ days: z.number().int().min(1).max(365) }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const cutoff = new Date(Date.now() - data.days * 86400_000).toISOString();
    const { error } = await context.supabase
      .from("admin_activity_logs")
      .delete()
      .lt("created_at", cutoff);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Unread badge count for shell
export const adminUnreadNotificationsCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("admin_notifications")
      .select("id, read_by")
      .order("created_at", { ascending: false })
      .limit(200);
    const uid = context.userId;
    const count = (data ?? []).filter((r) => !((r.read_by as string[]) ?? []).includes(uid)).length;
    return { count };
  });
