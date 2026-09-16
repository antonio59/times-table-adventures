// Generates raster icons for Times Tables Fun — no dependencies.
// Draws Nova (the golden star mascot) and encodes PNG via zlib.
// Run: node scripts/generate-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

// --- Nova's geometry, in the same 100×100 space as Mascot.tsx ---
const STAR = [
  [50, 10], [60.4, 36.4], [88.1, 37.9], [66.6, 55], [73.4, 82.1],
  [50, 67], [26.6, 82.1], [33.4, 55], [11.9, 37.9], [39.6, 36.4],
];
const EYES = [[42, 48, 3.4], [58, 48, 3.4]];
const SPARKLES = [[43.2, 46.8, 1.1], [59.2, 46.8, 1.1]];
const CHEEKS = [[36, 53, 2.6], [64, 53, 2.6]];
const SMILE = { p0: [43, 55], c: [50, 61], p1: [57, 55], w: 2.6 };
const JOIN_R = 4.5; // strokeWidth/2 — fakes round stroke joins at vertices

const TEAL = [46, 194, 179]; // --primary  hsl(174 62% 47%)
const GOLD = [249, 195, 31]; // --warning  hsl(45 95% 55%)
const NAVY = [36, 46, 66]; // --warning-foreground
const ORANGE = [250, 159, 56]; // --secondary hsl(32 95% 60%)

const SS = 8; // supersample factor

function makeCanvas(px) {
  return { w: px * SS, h: px * SS, data: new Float32Array(px * SS * px * SS * 4) };
}

function blend(cv, x, y, [r, g, b], a = 1) {
  if (x < 0 || y < 0 || x >= cv.w || y >= cv.h) return;
  const i = (y * cv.w + x) * 4;
  const ia = 1 - a;
  cv.data[i] = r * a + cv.data[i] * ia;
  cv.data[i + 1] = g * a + cv.data[i + 1] * ia;
  cv.data[i + 2] = b * a + cv.data[i + 2] * ia;
  cv.data[i + 3] = Math.max(cv.data[i + 3], a);
}

function fillCircle(cv, cx, cy, r, color, a = 1) {
  const x0 = Math.floor(cx - r), x1 = Math.ceil(cx + r);
  const y0 = Math.floor(cy - r), y1 = Math.ceil(cy + r);
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++)
      if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r)
        blend(cv, x, y, color, a);
}

function fillPolygon(cv, pts, color) {
  const ys = pts.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
    const yc = y + 0.5;
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      if (y1 === y2) continue;
      if (yc >= Math.min(y1, y2) && yc < Math.max(y1, y2))
        xs.push(x1 + ((yc - y1) / (y2 - y1)) * (x2 - x1));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2)
      for (let x = Math.ceil(xs[i] - 0.5); x < xs[i + 1] - 0.5; x++)
        blend(cv, x, y, color);
  }
}

function strokeQuad(cv, p0, c, p1, w, color) {
  const steps = 64;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0];
    const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1];
    fillCircle(cv, x, y, w / 2, color);
  }
}

function drawNova(cv, px, { roundedTile = true } = {}) {
  const s = (px * SS * 0.52) / 100; // star occupies ~52% of canvas
  const ox = cv.w / 2 - 50 * s;
  const oy = cv.h / 2 - 48 * s; // nudge down — the star sits slightly high
  const T = (x, y) => [ox + x * s, oy + y * s];

  // Tile: teal, rounded for .ico, full-bleed for apple-touch-icon
  const rad = roundedTile ? px * SS * 0.22 : 0;
  for (let y = 0; y < cv.h; y++)
    for (let x = 0; x < cv.w; x++) {
      const dx = Math.max(rad - (x + 0.5), 0, x + 0.5 - (cv.w - rad));
      const dy = Math.max(rad - (y + 0.5), 0, y + 0.5 - (cv.h - rad));
      if (dx * dx + dy * dy <= rad * rad) blend(cv, x, y, TEAL);
    }

  // Star: filled polygon + a circle per vertex for the round joins
  fillPolygon(cv, STAR.map(([x, y]) => T(x, y)), GOLD);
  for (const [x, y] of STAR) fillCircle(cv, ...T(x, y), JOIN_R * s, GOLD);
  for (const [x, y, r] of EYES) fillCircle(cv, ...T(x, y), r * s, NAVY);
  for (const [x, y, r] of SPARKLES) fillCircle(cv, ...T(x, y), r * s, GOLD);
  strokeQuad(cv, T(...SMILE.p0), T(...SMILE.c), T(...SMILE.p1), SMILE.w * s, NAVY);
  for (const [x, y, r] of CHEEKS) fillCircle(cv, ...T(x, y), r * s, ORANGE, 0.55);
}

function downsample(cv, px) {
  const out = Buffer.alloc(px * px * 4);
  for (let y = 0; y < px; y++)
    for (let x = 0; x < px; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let dy = 0; dy < SS; dy++)
        for (let dx = 0; dx < SS; dx++) {
          const i = ((y * SS + dy) * cv.w + (x * SS + dx)) * 4;
          r += cv.data[i]; g += cv.data[i + 1];
          b += cv.data[i + 2]; a += cv.data[i + 3];
        }
      const n = SS * SS, o = (y * px + x) * 4;
      out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n;
      out[o + 3] = (a / n) * 255; // alpha is stored 0–1, PNG wants 0–255
    }
  return out;
}

function crc32(buf) {
  let c, table = crc32.t;
  if (!table) {
    table = crc32.t = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  c = ~0;
  for (const byte of buf) c = table[(c ^ byte) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(px, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(px, 0);
  ihdr.writeUInt32BE(px, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const raw = Buffer.alloc(px * (px * 4 + 1));
  for (let y = 0; y < px; y++) {
    const o = y * (px * 4 + 1);
    rgba.copy(raw, o + 1, y * px * 4, (y + 1) * px * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function encodeIco(png, px) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = px; entry[1] = px; // width, height (0 = 256)
  entry[4] = 1; // color planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12); // offset to image data
  return Buffer.concat([header, entry, png]);
}

function render(px, roundedTile) {
  const cv = makeCanvas(px);
  drawNova(cv, px, { roundedTile });
  return encodePng(px, downsample(cv, px));
}

const png48 = render(48, true);
writeFileSync("public/favicon.ico", encodeIco(png48, 48));
writeFileSync("public/apple-touch-icon.png", render(180, false));
console.log("Wrote public/favicon.ico and public/apple-touch-icon.png");
