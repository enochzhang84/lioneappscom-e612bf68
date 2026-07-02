// Site analytics: public write for page views, admin read for dashboards.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createClient } from "@supabase/supabase-js";

async function ensureAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

// ---------- Public write ----------
export const trackPageView = createServerFn({ method: "POST" })
  .inputValidator((d: { path: string; referrer?: string; sessionId?: string }) =>
    z.object({
      path: z.string().min(1).max(400),
      referrer: z.string().max(500).optional(),
      sessionId: z.string().max(80).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const supa = publicClient();
    await supa.from("page_views").insert({
      path: data.path,
      referrer: data.referrer ?? null,
      session_id: data.sessionId ?? null,
    });
    return { ok: true };
  });

// ---------- Admin dashboards ----------
export type AnalyticsSummary = {
  totals: { views: number; sessions: number; posts: number; users: number; exams: number };
  daily: { date: string; views: number; sessions: number }[];
  topPaths: { path: string; views: number }[];
  topReferrers: { referrer: string; views: number }[];
  recentExams: {
    id: string; exam_slug: string; score: number; total: number; passed: boolean; created_at: string;
  }[];
  examStats: { exam_slug: string; attempts: number; passed: number; avg_score: number }[];
};

export const adminAnalyticsSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [pvRes, examRes, postsRes] = await Promise.all([
      context.supabase.from("page_views")
        .select("path, referrer, session_id, created_at")
        .gte("created_at", since).order("created_at", { ascending: false }).limit(5000),
      context.supabase.from("exam_attempts")
        .select("id, exam_slug, score, total, passed, created_at")
        .gte("created_at", since).order("created_at", { ascending: false }).limit(2000),
      context.supabase.from("blog_posts").select("id", { count: "exact", head: true }),
    ]);
    if (pvRes.error) throw new Error(pvRes.error.message);
    if (examRes.error) throw new Error(examRes.error.message);

    // Users count via admin API
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
    const usersTotal = (usersData as unknown as { total?: number } | null)?.total ?? (usersData?.users?.length ?? 0);

    const pv = pvRes.data ?? [];
    const exams = examRes.data ?? [];

    // Daily view/session buckets over last 30 days
    const dayMap = new Map<string, { views: number; sessions: Set<string> }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      dayMap.set(d, { views: 0, sessions: new Set() });
    }
    for (const row of pv) {
      const d = row.created_at.slice(0, 10);
      const b = dayMap.get(d);
      if (!b) continue;
      b.views++;
      if (row.session_id) b.sessions.add(row.session_id);
    }
    const daily = Array.from(dayMap.entries()).map(([date, b]) => ({
      date, views: b.views, sessions: b.sessions.size,
    }));

    // Top paths
    const pathMap = new Map<string, number>();
    for (const r of pv) pathMap.set(r.path, (pathMap.get(r.path) ?? 0) + 1);
    const topPaths = Array.from(pathMap.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views).slice(0, 10);

    // Top referrers
    const refMap = new Map<string, number>();
    for (const r of pv) {
      const ref = (r.referrer ?? "").trim();
      if (!ref) continue;
      try {
        const host = new URL(ref).hostname;
        refMap.set(host, (refMap.get(host) ?? 0) + 1);
      } catch { /* ignore */ }
    }
    const topReferrers = Array.from(refMap.entries())
      .map(([referrer, views]) => ({ referrer, views }))
      .sort((a, b) => b.views - a.views).slice(0, 10);

    // Exam stats
    const examMap = new Map<string, { attempts: number; passed: number; scoreSum: number }>();
    for (const e of exams) {
      const b = examMap.get(e.exam_slug) ?? { attempts: 0, passed: 0, scoreSum: 0 };
      b.attempts++;
      if (e.passed) b.passed++;
      b.scoreSum += e.total > 0 ? (e.score / e.total) * 100 : 0;
      examMap.set(e.exam_slug, b);
    }
    const examStats = Array.from(examMap.entries()).map(([exam_slug, b]) => ({
      exam_slug, attempts: b.attempts, passed: b.passed,
      avg_score: b.attempts > 0 ? Math.round(b.scoreSum / b.attempts) : 0,
    })).sort((a, b) => b.attempts - a.attempts);

    const sessions = new Set(pv.map((r) => r.session_id).filter(Boolean) as string[]).size;

    const summary: AnalyticsSummary = {
      totals: {
        views: pv.length,
        sessions,
        posts: postsRes.count ?? 0,
        users: usersTotal,
        exams: exams.length,
      },
      daily,
      topPaths,
      topReferrers,
      recentExams: exams.slice(0, 20),
      examStats,
    };
    return summary;
  });
