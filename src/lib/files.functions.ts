// Media/file library CRUD. Admin-only. Uploads to site-media bucket
// and registers metadata in media_assets for search/reuse.
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

export type MediaAsset = {
  id: string;
  bucket: string;
  path: string;
  name: string;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  tags: string[];
  uploaded_by: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export const adminListMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { search?: string; tag?: string; limit?: number } | undefined) =>
    z.object({
      search: z.string().max(120).optional(),
      tag: z.string().max(60).optional(),
      limit: z.number().int().min(1).max(500).default(200),
    }).parse(d ?? {}))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    let q = context.supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.search) q = q.ilike("name", `%${data.search}%`);
    if (data.tag) q = q.contains("tags", [data.tag]);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as MediaAsset[];
  });

export const adminUploadMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    filename: string;
    data_url: string;
    folder?: string;
    alt_text?: string;
    tags?: string[];
  }) => z.object({
    filename: z.string().min(1).max(200),
    data_url: z.string().min(20).max(20_000_000),
    folder: z.string().max(40).regex(/^[a-z0-9_-]+$/).optional(),
    alt_text: z.string().max(300).optional(),
    tags: z.array(z.string().min(1).max(40)).max(20).optional(),
  }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const m = /^data:([a-zA-Z0-9/+.-]+);base64,(.*)$/.exec(data.data_url);
    if (!m) throw new Error("无效的数据格式");
    const contentType = m[1];
    const buf = Buffer.from(m[2], "base64");
    const safeName = data.filename.replace(/[^\w.\-]+/g, "_").slice(0, 120);
    const ext = (safeName.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 6);
    const folder = data.folder || "library";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: upErr } = await context.supabase.storage
      .from("site-media").upload(path, buf, { contentType, upsert: false });
    if (upErr) throw new Error(upErr.message);

    const { data: row, error } = await context.supabase
      .from("media_assets")
      .insert({
        bucket: "site-media",
        path,
        name: safeName,
        mime_type: contentType,
        size_bytes: buf.byteLength,
        alt_text: data.alt_text ?? null,
        tags: data.tags ?? [],
        uploaded_by: context.userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as MediaAsset;
  });

export const adminUpdateMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; alt_text?: string; tags?: string[] }) =>
    z.object({
      id: z.string().uuid(),
      alt_text: z.string().max(300).nullable().optional(),
      tags: z.array(z.string().min(1).max(40)).max(20).optional(),
    }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const patch: { alt_text?: string | null; tags?: string[] } = {};
    if (data.alt_text !== undefined) patch.alt_text = data.alt_text;
    if (data.tags !== undefined) patch.tags = data.tags;
    const { error } = await context.supabase
      .from("media_assets").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: row, error: getErr } = await context.supabase
      .from("media_assets").select("bucket,path").eq("id", data.id).maybeSingle();
    if (getErr) throw new Error(getErr.message);
    if (row) {
      await context.supabase.storage.from(row.bucket).remove([row.path]);
    }
    const { error } = await context.supabase.from("media_assets").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
