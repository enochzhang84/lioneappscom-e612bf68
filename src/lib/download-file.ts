export function base64Blob(base64: string, type: string) {
  const decoded = atob(base64);
  const bytes = new Uint8Array(decoded.length);
  for (let i=0;i<decoded.length;i++) bytes[i]=decoded.charCodeAt(i);
  return new Blob([bytes],{type});
}

export async function deliverFile(blob: Blob, filename: string) {
  const file = new File([blob],filename,{type:blob.type});
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({files:[file]})) {
    try { await navigator.share({files:[file],title:filename});return; }
    catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href=url;anchor.download=filename;
  document.body.appendChild(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30_000);
}