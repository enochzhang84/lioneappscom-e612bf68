// PDF export via html2canvas-pro rendering a hidden template. Chinese
// glyphs are guaranteed by loading Noto Sans SC on demand before render;
// see ./pdfFontLoader.ts for the caching + fetch logic.
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { formatMoney } from "@/lib/solution-builder/calc";
import type { LineItem, CompatWarning, ToolKey, SbSettings } from "@/lib/solution-builder/types";
import type { Lang } from "@/lib/solution-builder/i18n";
import { loadPdfFonts, PDF_FONT_FAMILY } from "./pdfFontLoader";


type Args = {
  lang: Lang;
  settings: SbSettings;
  tool: ToolKey;
  title: string;
  items: LineItem[];
  totals: {
    subtotal: number; service_fee: number; tax_rate: number; tax_amount: number;
    discount: number; one_time_total: number; monthly_total: number; annual_total: number;
  };
  compat: CompatWarning[];
  computed: Record<string, any>;
  solutionNumber?: string | null;
  paper?: "a4" | "letter";
};

export async function exportSolutionPdf(args: Args): Promise<void> {
  // Guarantee CJK glyphs before rasterizing. Errors bubble up so callers
  // can show the friendly font-load-failed toast and abort.
  await loadPdfFonts();

  const isZh = args.lang === "zh";
  const dateStr = new Date().toLocaleDateString(isZh ? "zh-CN" : "en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
  const solutionNo = args.solutionNumber || `LA-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-DRAFT`;

  const doc = document.createElement("div");
  doc.style.cssText = `position:fixed;left:-99999px;top:0;width:794px;padding:40px;background:#ffffff;color:#111827;font-family:'${PDF_FONT_FAMILY}','PingFang SC','Microsoft YaHei','Noto Sans SC','Noto Sans CJK SC',-apple-system,Helvetica,Arial,sans-serif;line-height:1.55;font-size:12px`;


  const cur = args.settings.currency;
  const rows = args.items.map((i) => `
    <tr style="border-top:1px solid #E5E7EB">
      <td style="padding:8px 6px;vertical-align:top">
        <div style="color:#111827;font-weight:500">${escapeHtml(isZh ? i.name_zh : i.name_en)}</div>
        <div style="color:#6B7280;font-size:11px">${escapeHtml([i.brand, i.model].filter(Boolean).join(" · "))}</div>
      </td>
      <td style="padding:8px 6px;text-align:right;color:#374151">${i.qty}</td>
      <td style="padding:8px 6px;text-align:right;color:#374151">${formatMoney(i.unit_price, cur, args.lang)}</td>
      <td style="padding:8px 6px;text-align:right;color:#111827;font-weight:500">${formatMoney(i.qty * i.unit_price, cur, args.lang)}</td>
    </tr>
  `).join("");

  const compatItems = args.compat.map((c) => `
    <li style="color:${c.level === "error" ? "#B91C1C" : c.level === "notice" ? "#92400E" : "#065F46"};margin-bottom:4px">
      · ${escapeHtml(isZh ? c.message_zh : c.message_en)}
    </li>
  `).join("");

  const computedRows = Object.entries(args.computed || {}).slice(0, 12).map(([k, v]) =>
    `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #E5E7EB"><span style="color:#6B7280">${escapeHtml(k)}</span><span style="color:#111827">${escapeHtml(String(v))}</span></div>`
  ).join("");

  doc.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #2563EB;padding-bottom:12px;margin-bottom:16px">
      <div>
        <div style="font-size:20px;font-weight:700;color:#111827">Lione Apps</div>
        <div style="color:#6B7280;font-size:11px;margin-top:2px">${isZh ? "家庭与小型企业 IT 解决方案" : "Home & Small Business IT Solutions"}</div>
      </div>
      <div style="text-align:right">
        <div style="color:#2563EB;font-weight:600;font-size:14px">${isZh ? "Lione Apps IT 解决方案与预算" : "Lione Apps IT Solution & Estimate"}</div>
        <div style="color:#6B7280;font-size:11px;margin-top:4px">${isZh ? "方案编号" : "Solution #"}: <b style="color:#111827">${escapeHtml(solutionNo)}</b></div>
        <div style="color:#6B7280;font-size:11px">${isZh ? "创建日期" : "Date"}: ${dateStr}</div>
      </div>
    </div>

    <div style="margin-bottom:16px">
      <div style="font-size:16px;font-weight:600;color:#111827">${escapeHtml(args.title)}</div>
      <div style="color:#6B7280;font-size:11px;margin-top:2px">${isZh ? "工具" : "Tool"}: ${escapeHtml(args.tool)}</div>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:12px">
      <thead>
        <tr style="background:#F3F4F6;color:#374151">
          <th style="padding:8px 6px;text-align:left;font-weight:600">${isZh ? "配置项" : "Item"}</th>
          <th style="padding:8px 6px;text-align:right;font-weight:600;width:60px">${isZh ? "数量" : "Qty"}</th>
          <th style="padding:8px 6px;text-align:right;font-weight:600;width:100px">${isZh ? "单价" : "Unit"}</th>
          <th style="padding:8px 6px;text-align:right;font-weight:600;width:110px">${isZh ? "小计" : "Amount"}</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="4" style="padding:16px;text-align:center;color:#9CA3AF">${isZh ? "尚未添加配置项" : "No items"}</td></tr>`}</tbody>
    </table>

    <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
      <table style="min-width:260px">
        ${sumRow(isZh ? "设备小计" : "Subtotal", formatMoney(args.totals.subtotal, cur, args.lang))}
        ${args.totals.service_fee > 0 ? sumRow(isZh ? "服务费" : "Service Fee", formatMoney(args.totals.service_fee, cur, args.lang)) : ""}
        ${args.totals.discount > 0 ? sumRow(isZh ? "折扣" : "Discount", "− " + formatMoney(args.totals.discount, cur, args.lang)) : ""}
        ${args.totals.tax_amount > 0 ? sumRow(`${isZh ? "税费" : "Tax"} (${(args.totals.tax_rate * 100).toFixed(2)}%)`, formatMoney(args.totals.tax_amount, cur, args.lang)) : ""}
        <tr><td colspan="2" style="border-top:2px solid #2563EB"></td></tr>
        ${sumRow(isZh ? "一次性总价" : "One-time Total", formatMoney(args.totals.one_time_total, cur, args.lang), true)}
        ${args.totals.monthly_total > 0 ? sumRow(isZh ? "每月费用" : "Monthly", formatMoney(args.totals.monthly_total, cur, args.lang) + "/mo") : ""}
        ${args.totals.annual_total > 0 ? sumRow(isZh ? "年度费用" : "Annual", formatMoney(args.totals.annual_total, cur, args.lang) + "/yr") : ""}
      </table>
    </div>

    ${computedRows ? `
    <div style="margin-bottom:16px">
      <div style="font-weight:600;color:#111827;margin-bottom:6px">${isZh ? "关键指标" : "Key Metrics"}</div>
      <div>${computedRows}</div>
    </div>` : ""}

    ${compatItems ? `
    <div style="margin-bottom:16px;padding:10px;background:#F9FAFB;border-radius:8px;border:1px solid #E5E7EB">
      <div style="font-weight:600;color:#111827;margin-bottom:6px">${isZh ? "兼容性与提示" : "Compatibility & Notes"}</div>
      <ul style="margin:0;padding-left:16px;list-style:none">${compatItems}</ul>
    </div>` : ""}

    <div style="border-top:1px solid #E5E7EB;padding-top:10px;color:#6B7280;font-size:10px;line-height:1.5">
      <div>${escapeHtml(isZh ? args.settings.disclaimer_zh : args.settings.disclaimer_en)}</div>
      <div style="margin-top:6px">
        ${isZh ? "联系方式" : "Contact"}: ${escapeHtml(args.settings.contact_email)}${args.settings.contact_phone ? " · " + escapeHtml(args.settings.contact_phone) : ""}
        · ${isZh ? "有效期" : "Valid"}: ${args.settings.proposal_validity_days} ${isZh ? "天" : "days"}
      </div>
    </div>
  `;

  document.body.appendChild(doc);
  let canvas: HTMLCanvasElement | null = null;
  try {
    canvas = await html2canvas(doc, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
    const pdf = new jsPDF({ unit: "mm", format: args.paper === "letter" ? "letter" : "a4", orientation: "portrait" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    let heightLeft = imgH;
    let position = 0;

    const img = canvas.toDataURL("image/jpeg", 0.92);
    pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position = heightLeft - imgH;
      pdf.addPage();
      pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pageH;
    }

    const stamp = new Date().toISOString().slice(0, 10);
    pdf.save(`${solutionNo}_${stamp}.pdf`);
  } finally {
    // Explicit cleanup — helps GC across many consecutive exports and
    // prevents the offscreen node from accumulating in the DOM.
    document.body.removeChild(doc);
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  }
}



function sumRow(label: string, value: string, bold = false): string {
  return `<tr>
    <td style="padding:5px 8px;color:#6B7280;text-align:right">${escapeHtml(label)}</td>
    <td style="padding:5px 8px;text-align:right;color:${bold ? "#2563EB" : "#111827"};font-weight:${bold ? 700 : 500};font-size:${bold ? 14 : 12}px">${escapeHtml(value)}</td>
  </tr>`;
}

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
