import * as React from "react";
import { UAParser } from "ua-parser-js";
import { LookupTool, KV, CopyIconBtn } from "./LookupTool";
import {
  lookupIp, lookupWhois, lookupDns, pingHost, checkPort, checkSsl, inspectHeaders,
} from "@/lib/network.functions";

export type NetworkKind =
  | "ip" | "whois" | "dns" | "ping" | "port" | "ssl" | "useragent" | "headers";

export function NetworkTool({ kind }: { kind: NetworkKind }) {
  switch (kind) {
    case "ip": return <IpTool />;
    case "whois": return <WhoisTool />;
    case "dns": return <DnsTool />;
    case "ping": return <PingTool />;
    case "port": return <PortTool />;
    case "ssl": return <SslTool />;
    case "useragent": return <UserAgentTool />;
    case "headers": return <HeadersTool />;
  }
}

// ---------- IP ----------
function IpTool() {
  return (
    <LookupTool
      title="IP 地址查询"
      icon="🌐"
      intro="查询任意 IP 的国家、地区、城市、运营商与时区。留空则查询当前访问者 IP。"
      fields={[{ key: "ip", label: "IP 地址", placeholder: "例如 8.8.8.8（留空查询本机）", optional: true }]}
      run={(v) => lookupIp({ data: { ip: v.ip } })}
      render={(r) => (
        <KV items={[
          ["IP", <span>{r.ip} {r.flag ?? ""}</span>],
          ["类型", r.type],
          ["国家", `${r.country ?? ""} ${r.country_code ? `(${r.country_code})` : ""}`],
          ["省 / 州", r.region],
          ["城市", r.city],
          ["邮编", r.postal],
          ["经纬度", r.latitude ? `${r.latitude}, ${r.longitude}` : ""],
          ["时区", r.timezone ? `${r.timezone}${r.utc ? ` (UTC${r.utc})` : ""}` : ""],
          ["ISP", r.isp],
          ["组织", r.org],
          ["ASN", r.asn ? `AS${r.asn}` : ""],
        ]} />
      )}
      howto={[
        "留空点击查询即可看到当前访问者的公网 IP。",
        "支持 IPv4 与 IPv6 地址查询。",
        "数据来源：ipwho.is，用于展示地理位置与运营商，非精确定位。",
      ]}
      faqs={[
        { q: "为什么显示的城市和我实际位置不一致？", a: "IP 归属地由运营商登记，通常精确到城市级别，与 GPS 定位无关。" },
        { q: "会记录我的 IP 吗？", a: "不会。查询在浏览器与第三方公开 API 之间完成，我们不做持久化记录。" },
      ]}
    />
  );
}

// ---------- Whois ----------
function WhoisTool() {
  return (
    <LookupTool
      title="Whois 域名查询"
      icon="📇"
      intro="通过 RDAP（新一代 Whois 协议）查询域名注册商、注册时间、到期时间与 DNS 服务器。"
      fields={[{ key: "domain", label: "域名", placeholder: "例如 google.com" }]}
      run={(v) => lookupWhois({ data: { domain: v.domain } })}
      render={(r) => (
        <div className="space-y-3">
          <KV items={[
            ["域名", r.domain],
            ["注册商", r.registrar],
            ["注册时间", formatDate(r.createdAt)],
            ["最后更新", formatDate(r.updatedAt)],
            ["到期时间", formatDate(r.expiresAt)],
            ["状态", r.status?.join(", ")],
          ]} />
          {r.nameServers?.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">DNS 服务器</div>
              <ul className="text-sm font-mono space-y-0.5">
                {r.nameServers.map((n) => <li key={n}>{n.toLowerCase()}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
      howto={["支持所有开放 RDAP 的顶级域（.com/.net/.org/.io 等）。", "部分国家域名可能未开放 RDAP，会显示未找到。"]}
      faqs={[
        { q: "RDAP 和 Whois 有什么区别？", a: "RDAP 是 Whois 的现代替代协议，返回 JSON，被 ICANN 强制推广，数据更结构化。" },
      ]}
    />
  );
}

// ---------- DNS ----------
function DnsTool() {
  return (
    <LookupTool
      title="DNS 记录查询"
      icon="🧭"
      intro="通过 Cloudflare DoH 查询 A / AAAA / CNAME / MX / TXT / NS 记录。"
      fields={[{ key: "domain", label: "域名", placeholder: "例如 lioneapps.com" }]}
      run={(v) => lookupDns({ data: { domain: v.domain } })}
      render={(r) => (
        <div className="space-y-4">
          {r.results.map((row) => (
            <div key={row.type}>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">{row.type}</span>
                <span className="text-xs text-muted-foreground">{row.answers.length} 条记录</span>
              </div>
              {row.answers.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">无记录</p>
              ) : (
                <ul className="text-sm font-mono space-y-0.5">
                  {row.answers.map((a, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="break-all">{a.value}</span>
                      <span className="text-xs text-muted-foreground">TTL {a.ttl}</span>
                      <CopyIconBtn text={a.value} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
      howto={["数据来源 Cloudflare 公共 DNS（1.1.1.1），全球缓存分布。"]}
      faqs={[
        { q: "为什么查到的 IP 和我 ping 到的不一样？", a: "CDN 会根据地理位置解析到不同边缘节点，属于正常现象。" },
      ]}
    />
  );
}

// ---------- Ping ----------
function PingTool() {
  return (
    <LookupTool
      title="Ping 测试（HTTP）"
      icon="📶"
      intro="向目标域名发送 4 次 HTTPS HEAD 请求，测量往返延迟。适合网站可用性检查。"
      fields={[{ key: "host", label: "域名或 IP", placeholder: "例如 google.com" }]}
      run={(v) => pingHost({ data: { host: v.host } })}
      render={(r) => (
        <div className="space-y-3">
          <KV items={[
            ["目标", r.host],
            ["发送 / 收到", `${r.sent} / ${r.received}`],
            ["丢包率", `${r.loss}%`],
            ["最短 / 平均 / 最长", `${r.min} / ${r.avg} / ${r.max} ms`],
          ]} />
          <div>
            <div className="text-sm text-muted-foreground mb-1">明细</div>
            <ul className="text-sm font-mono space-y-0.5">
              {r.attempts.map((a, i) => (
                <li key={i} className={a.ok ? "" : "text-destructive"}>
                  #{i + 1} · {a.ok ? `${a.ms} ms · HTTP ${a.status}` : `失败 · ${a.error}`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      howto={[
        "浏览器不允许原生 ICMP Ping，本工具改用 HTTPS HEAD 请求测量，结果与真实 ICMP 略有差异。",
        "首次请求可能包含 DNS + TLS 握手时间，通常比后续请求慢。",
      ]}
    />
  );
}

// ---------- Port ----------
function PortTool() {
  return (
    <LookupTool
      title="端口连通检测"
      icon="🔌"
      intro="检测目标主机的指定端口是否可访问。基于 HTTP/HTTPS 探测，适合 Web 服务端口。"
      fields={[
        { key: "host", label: "域名或 IP", placeholder: "例如 lioneapps.com" },
        { key: "port", label: "端口号", type: "number", placeholder: "例如 443", defaultValue: 443 },
      ]}
      run={(v) => checkPort({ data: { host: v.host, port: Number(v.port) } })}
      render={(r) => (
        <div className="space-y-2">
          <KV items={[
            ["主机", r.host],
            ["端口", r.port],
            ["状态", r.open
              ? <span className="text-green-600 font-semibold">✓ 可达（{r.scheme?.toUpperCase()} {r.status}）</span>
              : <span className="text-destructive font-semibold">✗ 不可达</span>],
            ["耗时", `${r.ms} ms`],
          ]} />
          <p className="text-xs text-muted-foreground">{r.note}</p>
        </div>
      )}
      howto={[
        "由于浏览器和 Serverless 环境无法直接建立 TCP 连接，本工具通过 HTTP/HTTPS 请求探测。",
        "常见 Web 端口（80、443、8080、8443）识别最准确；SSH（22）、数据库端口无法探测。",
      ]}
    />
  );
}

// ---------- SSL ----------
function SslTool() {
  return (
    <LookupTool
      title="SSL 证书检测"
      icon="🔒"
      intro="查询目标域名的 HTTPS 证书颁发机构、有效期与剩余天数。"
      fields={[{ key: "domain", label: "域名", placeholder: "例如 lioneapps.com" }]}
      run={(v) => checkSsl({ data: { domain: v.domain } })}
      render={(r) => (
        <div className="space-y-3">
          <KV items={[
            ["域名", r.host],
            ["解析 IP", r.resolvedIp],
            ["证书颁发者", r.issuer],
            ["Issuer CN", r.issuerCn],
            ["签发对象", r.issuedTo],
            ["生效时间", r.validFrom],
            ["到期时间", r.validUntil],
            ["剩余天数", r.daysLeft != null ? `${r.daysLeft} 天` : ""],
            ["协议版本", r.protocol],
            ["主机名匹配", r.hostnameMatch == null ? "" : (r.hostnameMatch ? "✓ 匹配" : "✗ 不匹配")],
            ["状态", r.valid == null ? "" : (r.valid
              ? <span className="text-green-600 font-semibold">✓ 有效</span>
              : <span className="text-destructive font-semibold">✗ 无效 / 已过期</span>)],
          ]} />
          {r.sans?.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">SAN 列表</div>
              <div className="flex flex-wrap gap-1.5">
                {r.sans.map((s) => (
                  <span key={s} className="inline-flex items-center px-2 py-0.5 rounded bg-muted text-xs font-mono">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      howto={["数据来源 ssl-checker.io。若域名不开放 443 端口或使用自签名证书会查询失败。"]}
    />
  );
}

// ---------- User Agent ----------
function UserAgentTool() {
  const [ua, setUa] = React.useState<string>(() =>
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );
  const parsed = React.useMemo(() => new UAParser(ua).getResult(), [ua]);

  return (
    <LookupTool
      title="User Agent 解析"
      icon="🧬"
      intro="解析浏览器、操作系统、设备类型与渲染引擎。默认显示当前浏览器的 UA。"
      fields={[{ key: "ua", label: "User Agent", placeholder: "留空使用当前浏览器 UA", defaultValue: ua, optional: true }]}
      run={async (v) => {
        const value = (v.ua || ua).trim();
        setUa(value);
        return new UAParser(value).getResult();
      }}
      actionLabel="解析"
      render={() => (
        <KV items={[
          ["Raw UA", <span className="font-mono text-xs break-all">{ua}</span>],
          ["浏览器", `${parsed.browser.name ?? "-"} ${parsed.browser.version ?? ""}`],
          ["渲染引擎", `${parsed.engine.name ?? "-"} ${parsed.engine.version ?? ""}`],
          ["操作系统", `${parsed.os.name ?? "-"} ${parsed.os.version ?? ""}`],
          ["设备类型", parsed.device.type ?? "desktop"],
          ["设备厂商", parsed.device.vendor],
          ["设备型号", parsed.device.model],
          ["CPU 架构", parsed.cpu.architecture],
        ]} />
      )}
      howto={["User Agent 是浏览器发送给服务器的身份标识字符串。", "可粘贴任意 UA 字符串进行解析（例如后端日志中获取的 UA）。"]}
    />
  );
}

// ---------- HTTP Headers ----------
function HeadersTool() {
  return (
    <LookupTool
      title="HTTP Header 查看"
      icon="📨"
      intro="发起真实 HTTP 请求，查看目标网址返回的状态码与响应头。"
      fields={[{ key: "url", label: "网址", placeholder: "例如 https://lioneapps.com" }]}
      run={(v) => inspectHeaders({ data: { url: v.url } })}
      render={(r) => (
        <div className="space-y-3">
          <KV items={[
            ["最终 URL", r.url],
            ["状态", `${r.status} ${r.statusText}`],
          ]} />
          <div>
            <div className="text-sm text-muted-foreground mb-1">Response Headers</div>
            <div className="rounded-lg bg-muted/50 p-3 font-mono text-xs space-y-0.5 max-h-80 overflow-auto">
              {Object.entries(r.headers).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-primary shrink-0">{k}:</span>
                  <span className="break-all">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      howto={["工具会跟随 3xx 跳转直到最终地址。", "部分站点针对 Bot 返回 403 属正常现象。"]}
    />
  );
}

// ---------- utils ----------
function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
