/* ============================================================
   The K.D. Constructions credit, written into a photo file (4 Nov 2026)
   ------------------------------------------------------------
   EXIF Artist and Copyright, IPTC By-line, Credit and Copyright Notice,
   XMP dc:creator, photoshop:Credit and dc:rights. All of them say
   "K.D. Constructions", the copyright lines "© K.D. Constructions".

   LOSSLESS BY CONSTRUCTION. The credit is spliced into the file's
   container and nothing else is touched: a JPEG gains three APP segments
   after its header, a WebP gains an EXIF and an XMP chunk. The compressed
   picture data is the same bytes, so no re-encode can have happened, and
   taking the segments out again gives back the original file byte for
   byte (scripts/credit-photos.mjs proves it for every file it touches).

   ONLY THIS CREDIT IS EVER WRITTEN, never anything read from a file, so
   a phone's GPS or camera data cannot ride along.

   Used by three things, one code path:
     · scripts/credit-photos.mjs   the photographs in the repo;
     · src/lib/image-service.ts    the renditions /_image serves of them,
                                   which sharp would otherwise leave bare;
     · src/lib/gallery-media.ts    studio uploads, as they are stored.

   Which photographs get it is scripts/photo-classes.mjs, not this file:
   a logo, a rendering, a representative image or anything not plainly
   K.D.'s own work goes without.

   PURE, no imports, so plain Node can load it for the script.
   ============================================================ */

const CREATOR = "K.D. Constructions";
const COPYRIGHT = "© K.D. Constructions";

const utf8 = (s: string) => new TextEncoder().encode(s);

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

function same(a: Uint8Array, at: number, b: Uint8Array): boolean {
  if (at + b.length > a.length) return false;
  for (let i = 0; i < b.length; i++) if (a[at + i] !== b[i]) return false;
  return true;
}

const fourcc = (bytes: Uint8Array, at: number) => String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);

/* ---------- The three blocks ---------- */

/* A little-endian TIFF with one directory: Artist (0x013B), Copyright
   (0x8298). The values follow the directory, each on an even offset. */
function exifTiff(): Uint8Array {
  const artist = concat(utf8(CREATOR), new Uint8Array(1));
  const copyright = concat(utf8(COPYRIGHT), new Uint8Array(1));
  const first = 8 + 2 + 2 * 12 + 4;
  const second = first + artist.length + (artist.length % 2);
  const tiff = new Uint8Array(second + copyright.length);
  const view = new DataView(tiff.buffer);
  tiff.set([0x49, 0x49, 42, 0], 0);
  view.setUint32(4, 8, true);
  view.setUint16(8, 2, true);
  const entry = (at: number, tag: number, count: number, offset: number) => {
    view.setUint16(at, tag, true);
    view.setUint16(at + 2, 2, true); // ASCII
    view.setUint32(at + 4, count, true);
    view.setUint32(at + 8, offset, true);
  };
  entry(10, 0x013b, artist.length, first);
  entry(22, 0x8298, copyright.length, second);
  view.setUint32(34, 0, true);
  tiff.set(artist, first);
  tiff.set(copyright, second);
  return tiff;
}

const XMP_PACKET = utf8(
  `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>` +
    `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">` +
    `<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/">` +
    `<dc:creator><rdf:Seq><rdf:li>${CREATOR}</rdf:li></rdf:Seq></dc:creator>` +
    `<dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${COPYRIGHT}</rdf:li></rdf:Alt></dc:rights>` +
    `<photoshop:Credit>${CREATOR}</photoshop:Credit>` +
    `</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>`
);

/* IPTC IIM in a Photoshop resource block, as a JPEG carries it. 1:90 says
   the strings are UTF-8, which the © needs. */
function iptcBlock(): Uint8Array {
  const dataset = (record: number, id: number, value: Uint8Array) =>
    concat(new Uint8Array([0x1c, record, id, value.length >> 8, value.length & 255]), value);
  const iim = concat(
    dataset(1, 90, new Uint8Array([0x1b, 0x25, 0x47])),
    dataset(2, 0, new Uint8Array([0, 4])),
    dataset(2, 80, utf8(CREATOR)),
    dataset(2, 110, utf8(CREATOR)),
    dataset(2, 116, utf8(COPYRIGHT))
  );
  const size = new Uint8Array(4);
  new DataView(size.buffer).setUint32(0, iim.length);
  return concat(
    utf8("Photoshop 3.0\0"),
    utf8("8BIM"),
    new Uint8Array([0x04, 0x04, 0, 0]),
    size,
    iim,
    new Uint8Array(iim.length % 2)
  );
}

function jpegSegment(marker: number, payload: Uint8Array): Uint8Array {
  const size = payload.length + 2;
  return concat(new Uint8Array([0xff, marker, size >> 8, size & 255]), payload);
}

const XMP_PAYLOAD = concat(utf8("http://ns.adobe.com/xap/1.0/\0"), XMP_PACKET);

/** The three segments withCredit() puts into a JPEG, in file order. */
export const JPEG_CREDIT: readonly Uint8Array[] = [
  jpegSegment(0xe1, concat(utf8("Exif\0\0"), exifTiff())),
  jpegSegment(0xe1, XMP_PAYLOAD),
  jpegSegment(0xed, iptcBlock()),
];

/* ---------- JPEG ---------- */

const isJpeg = (b: Uint8Array) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;

/** Where the header segments end up to, and whether one is our XMP. */
function scanJpeg(b: Uint8Array): { insertAt: number; credited: boolean } {
  let at = 2;
  let insertAt = 2;
  let credited = false;
  while (at + 4 <= b.length && b[at] === 0xff) {
    const marker = b[at + 1];
    if (marker === 0xda) break; // start of scan: the picture itself
    const size = (b[at + 2] << 8) | b[at + 3];
    if (at === 2 && marker === 0xe0) insertAt = at + 2 + size; // after JFIF, which must stay first
    if (marker === 0xe1 && size - 2 === XMP_PAYLOAD.length && same(b, at + 4, XMP_PAYLOAD)) credited = true;
    at += 2 + size;
  }
  return { insertAt, credited };
}

/* ---------- WebP ---------- */

const isWebp = (b: Uint8Array) => b.length > 20 && fourcc(b, 0) === "RIFF" && fourcc(b, 8) === "WEBP";

function* webpChunks(b: Uint8Array): Generator<{ id: string; at: number; size: number }> {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let at = 12;
  while (at + 8 <= b.length) {
    const size = view.getUint32(at + 4, true);
    yield { id: fourcc(b, at), at, size };
    at += 8 + size + (size % 2);
  }
}

function webpChunk(id: string, data: Uint8Array): Uint8Array {
  const head = new Uint8Array(8);
  head.set(utf8(id), 0);
  new DataView(head.buffer).setUint32(4, data.length, true);
  return concat(head, data, new Uint8Array(data.length % 2));
}

/** The canvas of a simple (no VP8X) WebP, from its bitstream's header. */
function webpCanvas(b: Uint8Array, chunk: { id: string; at: number }): { width: number; height: number } | null {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const data = chunk.at + 8;
  if (chunk.id === "VP8 ") {
    return { width: view.getUint16(data + 6, true) & 0x3fff, height: view.getUint16(data + 8, true) & 0x3fff };
  }
  if (chunk.id === "VP8L") {
    const bits = view.getUint32(data + 1, true);
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
  }
  return null;
}

function webpWithCredit(b: Uint8Array): Uint8Array {
  const chunks = [...webpChunks(b)];
  const body = b.subarray(12);
  const credit = concat(webpChunk("EXIF", exifTiff()), webpChunk("XMP ", XMP_PACKET));
  let extended: Uint8Array;
  if (chunks[0]?.id === "VP8X") {
    extended = concat(body, credit);
    extended[8] |= 0x0c; // the first chunk's flags: EXIF and XMP are here
  } else {
    const canvas = chunks[0] && webpCanvas(b, chunks[0]);
    if (!canvas) return b;
    const vp8x = new Uint8Array(10);
    vp8x[0] = 0x0c;
    const w = canvas.width - 1;
    const h = canvas.height - 1;
    vp8x.set([w & 255, (w >> 8) & 255, (w >> 16) & 255, h & 255, (h >> 8) & 255, (h >> 16) & 255], 4);
    extended = concat(webpChunk("VP8X", vp8x), body, credit);
  }
  const head = new Uint8Array(12);
  head.set(utf8("RIFF"), 0);
  new DataView(head.buffer).setUint32(4, extended.length + 4, true);
  head.set(utf8("WEBP"), 8);
  return concat(head, extended);
}

/* ---------- The two questions ---------- */

/** Does this file carry the credit, exactly as written here? */
export function hasCredit(bytes: Uint8Array): boolean {
  if (isJpeg(bytes)) return scanJpeg(bytes).credited;
  if (isWebp(bytes)) {
    for (const c of webpChunks(bytes)) {
      if (c.id === "XMP " && c.size === XMP_PACKET.length && same(bytes, c.at + 8, XMP_PACKET)) return true;
    }
  }
  return false;
}

/** The file with the credit in it. One that has it already, or that is
    neither a JPEG nor a WebP, comes back as it was. */
export function withCredit(bytes: Uint8Array): Uint8Array {
  if (hasCredit(bytes)) return bytes;
  if (isJpeg(bytes)) {
    const { insertAt } = scanJpeg(bytes);
    return concat(bytes.subarray(0, insertAt), ...JPEG_CREDIT, bytes.subarray(insertAt));
  }
  if (isWebp(bytes)) return webpWithCredit(bytes);
  return bytes;
}
