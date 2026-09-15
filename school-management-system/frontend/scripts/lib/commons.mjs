/** Shared helpers for fetching curated Wikimedia Commons images. */

export const UA = {
  "User-Agent": "SchoolSMS-asset-curation/1.0 (school management demo; contact: sagun@softcubical.com)",
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Canonical download URL for a Commons file at a given render width.
 * Special:FilePath is the documented, stable entry point — rewriting an
 * upload.wikimedia.org thumbnail URL by hand breaks for many files.
 */
export function filePath(title, width) {
  const file = String(title).replace(/^File:/, "");
  const w = width ? `?width=${width}` : "";
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}${w}`;
}

export async function fetchImage(title, width = 2400, tries = 3) {
  let lastError;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      const res = await fetch(filePath(title, width), { headers: UA, redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 10_000) throw new Error(`suspiciously small (${buf.length}b)`);
      return buf;
    } catch (err) {
      lastError = err;
      await sleep(1200 * (attempt + 1));
    }
  }
  throw new Error(`${title}: ${lastError?.message || "failed"}`);
}

/** Licence + author metadata, needed for the attribution record. */
export async function fileMeta(title) {
  const url = `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
    action: "query", titles: `File:${String(title).replace(/^File:/, "")}`,
    prop: "imageinfo", iiprop: "url|size|extmetadata", format: "json",
  })}`;
  const res = await fetch(url, { headers: UA });
  const data = await res.json();
  const page = Object.values(data.query?.pages || {})[0] || {};
  const info = page.imageinfo?.[0] || {};
  const meta = info.extmetadata || {};
  const strip = (v) => (v?.value || "").replace(/<[^>]+>/g, "").trim();
  return {
    title: String(title).replace(/^File:/, ""),
    width: info.width,
    height: info.height,
    licence: strip(meta.LicenseShortName) || "unknown",
    licenceUrl: strip(meta.LicenseUrl),
    author: strip(meta.Artist).slice(0, 120),
    page: `https://commons.wikimedia.org/wiki/${encodeURIComponent("File:" + String(title).replace(/^File:/, ""))}`,
  };
}
