/**
 * Wikimedia Commons search helper for curating Indian school photography.
 *
 * Discovery only — it prints candidates (title, size, licence, author) so a human
 * can choose. Nothing is downloaded here; see fetch-school-assets.mjs for that.
 *
 * Usage:
 *   node scripts/commons-search.mjs "cat:School buses in India" "Indian school library"
 *   (prefix a term with cat: to list a category instead of a full-text search)
 */
import { writeFileSync } from "node:fs";

const API = "https://commons.wikimedia.org/w/api.php";
const UA = {
  "User-Agent": "SchoolSMS-asset-curation/1.0 (school management demo; contact: sagun@softcubical.com)",
};
const MIN_WIDTH = Number(process.env.MIN_WIDTH || 1600);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: UA });
    const text = await res.text();
    if (text.startsWith("{")) return JSON.parse(text);
    await sleep(1500 * (i + 1)); // Commons throttles aggressively
  }
  throw new Error("throttled by Commons");
}

function normalise(pages) {
  return Object.values(pages || {})
    .map((page) => {
      const info = page.imageinfo?.[0] || {};
      const meta = info.extmetadata || {};
      const strip = (v) => (v?.value || "").replace(/<[^>]+>/g, "").trim();
      return {
        title: page.title.replace(/^File:/, ""),
        width: info.width,
        height: info.height,
        licence: strip(meta.LicenseShortName),
        author: strip(meta.Artist).slice(0, 70),
        description: strip(meta.ImageDescription).slice(0, 120),
        page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
      };
    })
    .filter((x) => (x.width || 0) >= MIN_WIDTH && /\.(jpe?g|png)$/i.test(x.title));
}

async function search(term, limit = 40) {
  const url = `${API}?${new URLSearchParams({
    action: "query", generator: "search", gsrsearch: `filetype:bitmap ${term}`,
    gsrnamespace: "6", gsrlimit: String(limit), prop: "imageinfo",
    iiprop: "url|size|extmetadata", iiurlwidth: "1000", format: "json",
  })}`;
  return normalise((await getJson(url)).query?.pages);
}

async function category(name, limit = 60) {
  const url = `${API}?${new URLSearchParams({
    action: "query", generator: "categorymembers", gcmtitle: `Category:${name}`,
    gcmtype: "file", gcmlimit: String(limit), prop: "imageinfo",
    iiprop: "url|size|extmetadata", iiurlwidth: "1000", format: "json",
  })}`;
  return normalise((await getJson(url)).query?.pages);
}

const terms = process.argv.slice(2);
if (terms.length === 0) {
  console.error('Usage: node scripts/commons-search.mjs "term" "cat:Category name" ...');
  process.exit(1);
}

const all = [];
const seen = new Set();
for (const term of terms) {
  const isCat = term.startsWith("cat:");
  const rows = isCat ? await category(term.slice(4)) : await search(term);
  let added = 0;
  for (const row of rows) {
    if (seen.has(row.title)) continue;
    seen.add(row.title);
    all.push({ ...row, query: term });
    added++;
  }
  console.log(`${isCat ? "category" : "search"} "${term}" -> ${added}`);
  await sleep(1200);
}

for (const [i, row] of all.entries()) {
  console.log(`[${i}] ${row.title} (${row.width}x${row.height}) ${row.licence} — ${row.author}`);
}

if (process.env.OUT) {
  writeFileSync(process.env.OUT, JSON.stringify(all, null, 1));
  console.log(`\nwrote ${all.length} candidates -> ${process.env.OUT}`);
}
