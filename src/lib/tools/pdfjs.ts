// Client-only pdfjs loader. Importing pdfjs-dist at module scope crashes SSR
// (DOMMatrix is not defined in workerd). Callers must `await getPdfjs()` from
// event handlers or effects, never at module scope of a shared component.

type PdfjsModule = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfjsModule> | null = null;

export async function getPdfjs(): Promise<PdfjsModule> {
  if (typeof window === "undefined") {
    throw new Error("pdfjs can only be used in the browser");
  }
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import("pdfjs-dist");
      const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}
