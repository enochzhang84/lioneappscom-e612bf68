// On-demand loader for Noto Sans SC used exclusively by PDF export.
// Font files are bundled by Vite from @fontsource/noto-sans-sc and served
// from the same origin (Lovable infra). Dynamic imports keep them out of
// the first-paint bundle. A module-level promise caches the result for the
// rest of the session so repeated exports don't refetch or re-inject.

export const PDF_FONT_FAMILY = "LioneNotoSC";

let loadPromise: Promise<void> | null = null;

async function fetchAndLoad(url: string, weight: number): Promise<FontFace> {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`font fetch failed: ${res.status}`);
  const buf = await res.arrayBuffer();
  const face = new FontFace(PDF_FONT_FAMILY, buf, {
    weight: String(weight),
    style: "normal",
    display: "swap",
  });
  await face.load();
  (document as unknown as { fonts: FontFaceSet }).fonts.add(face);
  return face;
}

export function loadPdfFonts(): Promise<void> {
  if (loadPromise) return loadPromise;
  if (typeof document === "undefined" || !(document as unknown as { fonts?: unknown }).fonts || typeof FontFace === "undefined") {
    return Promise.reject(new Error("FontFace API unavailable"));
  }
  loadPromise = (async () => {
    // Dynamically import the WOFF2 asset URLs. Vite emits hashed files under
    // /assets/... served from the same origin.
    const [
      { default: latin400 },
      { default: latin700 },
      { default: cjk400 },
      { default: cjk700 },
    ] = await Promise.all([
      import("@fontsource/noto-sans-sc/files/noto-sans-sc-latin-400-normal.woff2?url"),
      import("@fontsource/noto-sans-sc/files/noto-sans-sc-latin-700-normal.woff2?url"),
      import("@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff2?url"),
      import("@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff2?url"),
    ]);
    // Load latin first (small, fast) then CJK subset (~1.1MB each).
    await Promise.all([
      fetchAndLoad(latin400, 400),
      fetchAndLoad(latin700, 700),
      fetchAndLoad(cjk400, 400),
      fetchAndLoad(cjk700, 700),
    ]);
    // Ensure the browser has finished computing font metrics for the family
    // before html2canvas rasterizes the offscreen template.
    await (document as unknown as { fonts: FontFaceSet }).fonts.ready;
  })();
  loadPromise.catch(() => {
    // Reset so the user can retry after transient failures.
    loadPromise = null;
  });
  return loadPromise;
}
