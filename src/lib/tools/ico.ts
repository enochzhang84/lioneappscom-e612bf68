// Minimal ICO encoder: packs multiple PNGs as an .ico file.
// Follows the standard ICONDIR + ICONDIRENTRY + PNG payload layout.
export function encodeIco(pngs: { size: number; data: Uint8Array }[]): Uint8Array {
  const header = 6; // ICONDIR
  const entrySize = 16;
  const totalHeader = header + entrySize * pngs.length;
  const totalPayload = pngs.reduce((s, p) => s + p.data.length, 0);
  const buf = new Uint8Array(totalHeader + totalPayload);
  const view = new DataView(buf.buffer);
  view.setUint16(0, 0, true);   // reserved
  view.setUint16(2, 1, true);   // type = 1 (icon)
  view.setUint16(4, pngs.length, true);
  let offset = totalHeader;
  pngs.forEach((p, i) => {
    const base = header + i * entrySize;
    const sizeByte = p.size >= 256 ? 0 : p.size;
    buf[base] = sizeByte;      // width
    buf[base + 1] = sizeByte;  // height
    buf[base + 2] = 0;         // color palette
    buf[base + 3] = 0;         // reserved
    view.setUint16(base + 4, 1, true);   // color planes
    view.setUint16(base + 6, 32, true);  // bpp
    view.setUint32(base + 8, p.data.length, true);
    view.setUint32(base + 12, offset, true);
    buf.set(p.data, offset);
    offset += p.data.length;
  });
  return buf;
}
