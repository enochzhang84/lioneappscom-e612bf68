import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";

// ---------- helpers ----------

function normalizeHost(input: string): string {
  const s = input.trim();
  if (!s) throw new Error("请输入域名或 IP");
  // strip protocol / path
  try {
    if (s.includes("://")) {
      const u = new URL(s);
      return u.hostname;
    }
  } catch { /* noop */ }
  return s.replace(/^\/+|\/+$/g, "").split("/")[0];
}

function isIp(input: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(input) || /^[0-9a-fA-F:]+$/.test(input);
}

async function fetchJson(url: string, init?: RequestInit, timeoutMs = 8000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, headers: { accept: "application/json", ...(init?.headers ?? {}) } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally { clearTimeout(t); }
}

// ---------- 1. IP lookup ----------

export const lookupIp = createServerFn({ method: "POST" })
  .inputValidator((data: { ip?: string }) => data)
  .handler(async ({ data }) => {
    let ip = (data.ip ?? "").trim();
    if (!ip) {
      // detect caller ip
      ip = getRequestIP({ xForwardedFor: true }) ?? "";
      if (!ip) {
        const xff = getRequestHeader("x-forwarded-for");
        if (xff) ip = xff.split(",")[0].trim();
      }
    }
    const url = ip ? `https://ipwho.is/${encodeURIComponent(ip)}` : `https://ipwho.is/`;
    const j = await fetchJson(url) as Record<string, unknown> & { success?: boolean; message?: string };
    if (j.success === false) throw new Error((j.message as string) || "查询失败");
    return {
      ip: j.ip as string,
      type: j.type as string,
      country: j.country as string,
      country_code: j.country_code as string,
      region: j.region as string,
      city: j.city as string,
      latitude: j.latitude as number,
      longitude: j.longitude as number,
      postal: j.postal as string,
      timezone: (j.timezone as Record<string, unknown> | undefined)?.id as string | undefined,
      utc: (j.timezone as Record<string, unknown> | undefined)?.utc as string | undefined,
      isp: (j.connection as Record<string, unknown> | undefined)?.isp as string | undefined,
      org: (j.connection as Record<string, unknown> | undefined)?.org as string | undefined,
      asn: (j.connection as Record<string, unknown> | undefined)?.asn as number | undefined,
      flag: (j.flag as Record<string, unknown> | undefined)?.emoji as string | undefined,
    };
  });

// ---------- 2. Whois via RDAP ----------

export const lookupWhois = createServerFn({ method: "POST" })
  .inputValidator((data: { domain: string }) => data)
  .handler(async ({ data }) => {
    const host = normalizeHost(data.domain);
    const j = await fetchJson(`https://rdap.org/domain/${encodeURIComponent(host)}`) as Record<string, unknown>;
    const events = (j.events as Array<{ eventAction: string; eventDate: string }>) ?? [];
    const registrarEntity = ((j.entities as Array<Record<string, unknown>>) ?? [])
      .find((e) => (e.roles as string[] | undefined)?.includes("registrar"));
    let registrar: string | undefined;
    if (registrarEntity) {
      const vcard = registrarEntity.vcardArray as unknown[] | undefined;
      if (Array.isArray(vcard) && Array.isArray(vcard[1])) {
        const fn = (vcard[1] as unknown[]).find((x): x is unknown[] => Array.isArray(x) && (x as unknown[])[0] === "fn");
        if (fn) registrar = fn[3] as string;
      }
    }
    return {
      domain: (j.ldhName as string) || host,
      handle: j.handle as string | undefined,
      status: (j.status as string[]) ?? [],
      registrar,
      createdAt: events.find((e) => e.eventAction === "registration")?.eventDate,
      updatedAt: events.find((e) => e.eventAction === "last changed")?.eventDate,
      expiresAt: events.find((e) => e.eventAction === "expiration")?.eventDate,
      nameServers: ((j.nameservers as Array<{ ldhName?: string }>) ?? []).map((n) => n.ldhName).filter(Boolean) as string[],
    };
  });

// ---------- 3. DNS via Cloudflare DoH ----------

const DNS_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS"] as const;
type DnsType = typeof DNS_TYPES[number];

export const lookupDns = createServerFn({ method: "POST" })
  .inputValidator((data: { domain: string; types?: DnsType[] }) => data)
  .handler(async ({ data }) => {
    const host = normalizeHost(data.domain);
    const types = data.types ?? [...DNS_TYPES];
    const results = await Promise.all(types.map(async (type) => {
      try {
        const j = await fetchJson(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=${type}`,
          { headers: { accept: "application/dns-json" } }) as { Answer?: Array<{ data: string; TTL: number; type: number }>; Status: number };
        return { type, status: j.Status, answers: (j.Answer ?? []).map((a) => ({ value: a.data, ttl: a.TTL })) };
      } catch (e) {
        return { type, status: -1, answers: [] as { value: string; ttl: number }[], error: e instanceof Error ? e.message : "错误" };
      }
    }));
    return { host, results };
  });

// ---------- 4. Ping (HTTP-based) ----------

export const pingHost = createServerFn({ method: "POST" })
  .inputValidator((data: { host: string; count?: number }) => data)
  .handler(async ({ data }) => {
    const host = normalizeHost(data.host);
    const count = Math.min(Math.max(data.count ?? 4, 1), 6);
    const url = `https://${host}/`;
    const attempts: Array<{ ok: boolean; ms: number; status?: number; error?: string }> = [];
    for (let i = 0; i < count; i++) {
      const start = Date.now();
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 5000);
        const res = await fetch(url, { method: "HEAD", signal: ctrl.signal, redirect: "manual" });
        clearTimeout(t);
        attempts.push({ ok: true, ms: Date.now() - start, status: res.status });
      } catch (e) {
        attempts.push({ ok: false, ms: Date.now() - start, error: e instanceof Error ? e.message : "失败" });
      }
    }
    const successes = attempts.filter((a) => a.ok);
    const times = successes.map((a) => a.ms);
    return {
      host,
      attempts,
      sent: count,
      received: successes.length,
      loss: Math.round((1 - successes.length / count) * 100),
      min: times.length ? Math.min(...times) : 0,
      max: times.length ? Math.max(...times) : 0,
      avg: times.length ? Math.round(times.reduce((s, x) => s + x, 0) / times.length) : 0,
    };
  });

// ---------- 5. Port check (HTTP-based reachability) ----------

export const checkPort = createServerFn({ method: "POST" })
  .inputValidator((data: { host: string; port: number }) => data)
  .handler(async ({ data }) => {
    const host = normalizeHost(data.host);
    const port = Math.trunc(data.port);
    if (!port || port < 1 || port > 65535) throw new Error("端口范围 1–65535");
    // Try HTTPS first for 443/8443-like, HTTP otherwise; fall back
    const schemes = port === 443 || port === 8443 ? ["https", "http"] : ["http", "https"];
    const start = Date.now();
    let lastError: string | undefined;
    for (const scheme of schemes) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 5000);
        const res = await fetch(`${scheme}://${host}:${port}/`, { method: "HEAD", signal: ctrl.signal, redirect: "manual" });
        clearTimeout(t);
        return { host, port, open: true, ms: Date.now() - start, scheme, status: res.status,
          note: "基于 HTTP/HTTPS 探测：目标返回响应代表端口可达。非 HTTP 服务（SSH/MySQL 等）可能显示不可达。" };
      } catch (e) { lastError = e instanceof Error ? e.message : "失败"; }
    }
    return { host, port, open: false, ms: Date.now() - start, error: lastError,
      note: "基于 HTTP/HTTPS 探测：未收到响应，可能端口关闭或运行非 HTTP 协议。" };
  });

// ---------- 6. SSL certificate ----------

export const checkSsl = createServerFn({ method: "POST" })
  .inputValidator((data: { domain: string }) => data)
  .handler(async ({ data }) => {
    const host = normalizeHost(data.domain);
    const j = await fetchJson(`https://ssl-checker.io/api/v1/check/${encodeURIComponent(host)}`) as
      { result?: Record<string, unknown>; response?: Record<string, unknown> };
    const r = (j.result ?? j.response ?? {}) as Record<string, unknown>;
    if (!r || Object.keys(r).length === 0) throw new Error("未获取到证书信息");
    return {
      host: (r.host as string) ?? host,
      resolvedIp: r.resolved_ip as string | undefined,
      issuer: r.issuer_o as string | undefined,
      issuerCn: r.issuer_cn as string | undefined,
      issuedTo: r.issued_to as string | undefined,
      validFrom: r.valid_from as string | undefined,
      validUntil: r.valid_till as string | undefined,
      daysLeft: r.cert_exp as number | undefined,
      valid: r.cert_valid as boolean | undefined,
      protocol: r.protocol_version as string | undefined,
      sans: (r.cert_sans as string | undefined)?.split(/[; ,]+/).filter(Boolean) ?? [],
      hostnameMatch: r.hostname_match as boolean | undefined,
    };
  });

// ---------- 8. HTTP headers ----------

export const inspectHeaders = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string }) => data)
  .handler(async ({ data }) => {
    let target = data.url.trim();
    if (!target) throw new Error("请输入网址");
    if (!/^https?:\/\//i.test(target)) target = `https://${target}`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(target, { method: "GET", signal: ctrl.signal, redirect: "follow" });
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => { headers[k] = v; });
      return { url: res.url, status: res.status, statusText: res.statusText, headers };
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : "请求失败");
    } finally { clearTimeout(t); }
  });

// isIp export for client convenience
export { isIp as _isIp };
