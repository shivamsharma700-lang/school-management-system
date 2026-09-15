/**
 * Measure photographic punch, so "this looks washed out" becomes a number.
 *
 * Subject relevance was never the problem with the last asset pass — several
 * images were genuinely Indian schools but hazy, flat-lit and low-contrast,
 * which is what makes a page read as faded no matter how good the layout is.
 *
 *   contrast   — mean per-channel standard deviation. Flat/hazy images score low.
 *   saturation — mean distance from grey in HSL terms. Washed images score low.
 *   highlight  — share of near-white pixels. A blown-out sky spikes this.
 *   dark       — share of near-black pixels. Images with no true blacks look milky.
 *
 * Usage: node scripts/score-images.mjs [glob-root]
 */
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import sharp from "sharp";

const ROOT = process.argv[2] || "public/assets/school";

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.jpg$/i.test(name)) out.push(p);
  }
  return out;
}

async function score(file) {
  const img = sharp(file);
  const stats = await img.stats();
  const rgb = stats.channels.slice(0, 3);

  const contrast = rgb.reduce((s, c) => s + c.stdev, 0) / 3;
  const brightness = rgb.reduce((s, c) => s + c.mean, 0) / 3;

  // Saturation: average spread between channel means is a cheap proxy, but a
  // per-pixel sample is far more honest for hazy images.
  const { data, info } = await img
    .resize(96, 96, { fit: "cover" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let sat = 0;
  let hi = 0;
  let lo = 0;
  const px = info.width * info.height;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    sat += max === 0 ? 0 : (max - min) / max;
    const l = (max + min) / 2;
    if (l > 240) hi++;
    if (l < 28) lo++;
  }
  sat = (sat / px) * 100;

  // A single 0-100 "punch" score. Contrast dominates; true blacks help; a blown
  // sky and low saturation are penalised.
  const punch = Math.max(0, Math.min(100, Math.round(
    contrast * 1.05 +
    sat * 0.55 +
    (lo / px) * 100 * 0.5 -
    (hi / px) * 100 * 0.8
  )));

  return {
    file: relative(ROOT, file).replace(/\\/g, "/"),
    punch,
    contrast: Math.round(contrast),
    saturation: Math.round(sat),
    brightness: Math.round(brightness),
    blownPct: Math.round((hi / px) * 100),
    blackPct: Math.round((lo / px) * 100),
  };
}

const files = walk(ROOT);
const rows = [];
for (const f of files) {
  try { rows.push(await score(f)); } catch (e) { console.log("FAIL", f, e.message); }
}

rows.sort((a, b) => a.punch - b.punch);
console.log("punch  contr  sat  bright  blown  black   file");
for (const r of rows) {
  const flag = r.punch < 45 ? "  <-- FLAT" : "";
  console.log(
    `${String(r.punch).padStart(4)}  ${String(r.contrast).padStart(5)}  ` +
    `${String(r.saturation).padStart(3)}  ${String(r.brightness).padStart(6)}  ` +
    `${String(r.blownPct).padStart(5)}  ${String(r.blackPct).padStart(5)}   ${r.file}${flag}`
  );
}
const weak = rows.filter((r) => r.punch < 45);
console.log(`\n${rows.length} images, ${weak.length} below the punch floor (45).`);
