import * as pdfjs from "pdfjs-dist";
// Vite: import worker as URL and register once.
// The .mjs?url pattern is the recommended integration for pdfjs-dist v4+.
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
}

export { pdfjs };
