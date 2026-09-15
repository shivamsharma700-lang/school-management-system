/**
 * Build the Indian-school image library.
 *
 * Two curated sources, both free to use commercially:
 *   - Unsplash (Unsplash Licence)      : documentary Indian school photography
 *   - Wikimedia Commons (CC BY-SA/CC0) : real Indian school buildings and buses
 *
 * Why both: Unsplash has excellent Indian classroom/student photography but
 * almost no Indian school *architecture*; Commons has genuine Indian school
 * campuses and yellow school buses. Neither alone covers the site, and using
 * Western/American stock for the gaps is what produced the previous mismatch
 * (US university buildings, a Chinese classroom labelled "Noida", a rock concert
 * as "auditorium"). Nothing here is scraped from a school's own website.
 *
 * Outputs, per asset: AVIF + WebP + a JPEG fallback at responsive widths, plus
 * src/assets/sources.json recording licence and attribution.
 *
 * Usage: node scripts/fetch-school-assets.mjs [--only=key,key]
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { fetchImage, fileMeta, sleep } from "./lib/commons.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(here, "..", "public", "assets", "school");
const SOURCES = join(here, "..", "src", "assets", "sources.json");

/** Widths emitted for each asset; the largest is also the JPEG fallback. */
const WIDTHS = [640, 1280, 1920];

const unsplash = (id, w = 2000, h = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=82`;

/**
 * crop: how the subject should survive a tight frame.
 *   position — sharp gravity/position used when cropping to the target ratio.
 *   ratio    — target aspect for the stored master (the CSS frame matches it).
 */
const ASSETS = {
  // ---------------------------------------------------- campus & architecture
  "campus/hero": {
    // Scored 94 punch / 48 saturation / 0% blown highlights. The previous hero
    // measured 8/100 saturation with a 21% blown sky, which is why the page read
    // as washed out regardless of the scrim. See scripts/score-images.mjs.
    commons: "Devamatha CMI Public School Thrissur kerala.jpg",
    alt: "Aerial view of a modern Indian school campus with playing fields",
    use: "Home hero / campus hero",
    ratio: 21 / 9, position: "attention",
  },
  "campus/wide": {
    // Promoted from the old hero slot: a full school assembled in the forecourt.
    commons: "Primary Campus.jpg",
    alt: "Indian school assembly in the campus forecourt",
    use: "Campus wide / about",
    ratio: 16 / 9, position: "attention",
  },
  "campus/entrance": {
    commons: "Arya Central School.jpg",
    alt: "Indian school entrance with school buses lined up at the portico",
    use: "Campus entrance / admissions arrival",
    ratio: 16 / 9, position: "attention",
  },
  "campus/dusk": {
    // Replaced a hazy frame that measured 11/100 saturation with 36% of the
    // pixels blown out - the single flattest asset in the set.
    commons: "MSHSS Ranni, Pathanamthitta, Kerala.jpg",
    alt: "Indian school building among palms in evening light",
    use: "Campus secondary / architecture",
    ratio: 16 / 9, position: "attention",
    grade: { saturation: 1.1, contrast: 1.06, black: 6 },
  },
  "campus/aerial": {
    commons: "Central-india-academy-dewas-cis-1.jpg",
    alt: "Aerial view of an Indian school campus with its bus fleet",
    use: "Campus aerial / branches",
    ratio: 16 / 9, position: "attention",
  },

  // ------------------------------------------------------------- the dashboard
  // A deliberately panoramic master so the dashboard welcome band crops to its
  // 40:9 frame without slicing the subject in half.
  "dashboard/hero": {
    commons: "Primary Campus.jpg",
    alt: "Indian school campus with students assembled in the forecourt",
    use: "Dashboard welcome band (panoramic master)",
    ratio: 40 / 9, position: "attention",
  },
  "dashboard/promo": {
    unsplash: "1573894998033-c0cef4ed722b",
    alt: "Indian schoolgirls in uniform in class",
    use: "Dashboard 'Education beyond classrooms' card (portrait)",
    ratio: 4 / 5, position: "top",
  },

  // ------------------------------------------------------------------ students
  "students/portrait": {
    unsplash: "1524069290683-0457abfe42c3",
    alt: "Portrait of an Indian schoolboy",
    use: "Student portrait", ratio: 4 / 5, position: "top",
  },
  "students/classroom": {
    unsplash: "1709290749293-c6152a187b14",
    alt: "Indian classroom full of students with their teacher",
    use: "Academics / classroom", ratio: 16 / 9, position: "attention",
  },
  "students/group": {
    unsplash: "1573894998033-c0cef4ed722b",
    alt: "Group of Indian schoolgirls in uniform",
    use: "About / student body", ratio: 16 / 9, position: "attention",
  },
  "students/uniform": {
    unsplash: "1623863568368-69e4cbe6cc0b",
    alt: "Indian school students sharing lunch on the school lawn",
    use: "Student life / uniform", ratio: 16 / 9, position: "attention",
  },
  "students/books": {
    unsplash: "1623303366639-0e330d7c3d9f",
    alt: "Indian student holding school books",
    use: "Middle school / reading", ratio: 4 / 5, position: "top",
  },
  "student-life/campus": {
    unsplash: "1573894999291-f440466112cc",
    alt: "Indian students in a busy classroom",
    use: "Student life", ratio: 16 / 9, position: "attention",
  },
  "student-life/friends": {
    unsplash: "1509062522246-3755977927d7",
    alt: "School students together in class",
    use: "Clubs / friendships", ratio: 16 / 9, position: "attention",
  },

  // ------------------------------------------------------ teaching & academics
  "teachers/faculty": {
    // Same photograph as students/classroom, so it is framed differently: a
    // tighter 3:2 crop weighted to the teacher rather than the whole room, which
    // keeps the file distinct instead of byte-identical.
    unsplash: "1709290749293-c6152a187b14",
    alt: "Teacher leading a lesson in an Indian classroom",
    use: "Faculty / teachers", ratio: 3 / 2, position: "right top",
  },
  "classrooms/lesson": {
    unsplash: "1719159381916-062fa9f435a6",
    alt: "Indian students at desks during a lesson",
    use: "Classroom lesson", ratio: 16 / 9, position: "attention",
  },
  "classrooms/digital": {
    unsplash: "1719159381962-4170890ada4e",
    alt: "Indian classroom with a digital display board",
    use: "Smart classroom / technology", ratio: 16 / 9, position: "attention",
  },

  // ------------------------------------------------------------- facilities
  "library/reading": {
    commons: "Kv kanjikode library.jpg",
    alt: "School library in an Indian Kendriya Vidyalaya",
    use: "Library", ratio: 16 / 9, position: "attention",
  },
  "science-lab/bench": {
    // The Unsplash candidate previously used here returned a library interior,
    // not a laboratory. This is a real Indian teaching laboratory with students.
    commons: "Prof Satish Chandra Garkoti with his students in his Plant Ecology Laboratory, School of Environmental Sciences, Jawaharlal Nehru University, New Delhi, India.jpg",
    alt: "Students working with their teacher in an Indian science laboratory",
    use: "Science laboratory", ratio: 16 / 9, position: "attention",
  },
  "computer-lab/lab": {
    // Previously resolved to an empty classroom with a blackboard.
    commons: "Baramati, Maharashtra, India. Computers in a lab.jpg",
    alt: "Rows of computers in an Indian school computer laboratory",
    use: "Computer laboratory", ratio: 16 / 9, position: "attention",
  },
  "auditorium/hall": {
    // Must not repeat the campus hero photograph; this is a distinct school block.
    commons: "Arwachin International School main building.jpg",
    alt: "Main block of an Indian school housing the assembly hall",
    use: "Auditorium / assembly hall", ratio: 16 / 9, position: "attention",
  },

  // ---------------------------------------------------------------- activities
  "sports/field": {
    unsplash: "1593766787879-e8c78e09cbbe",
    alt: "School sports ground",
    use: "Sports", ratio: 16 / 9, position: "attention",
  },
  "sports/athletics": {
    // Cricket is the dominant school sport in India; a Western track photo would
    // read as the wrong country.
    unsplash: "1531415074968-036ba1b575da",
    alt: "Cricket ball on a school playing field",
    use: "Athletics / inter-house sport", ratio: 16 / 9, position: "attention",
  },
  "sports/basketball": {
    // Football and basketball previously shared one cricket photograph.
    commons: "Basketball CGHSS Tura Oct24 A7CR 03806.jpg",
    alt: "Basketball court at an Indian higher secondary school",
    use: "Basketball", ratio: 16 / 9, position: "attention",
  },
  "sports/football": {
    commons: "Football Match.jpg",
    alt: "Football match on a ground in India",
    use: "Football", ratio: 16 / 9, position: "attention",
  },
  "events/cultural": {
    commons: "Chau Dance at Techno India Group Public School, Ariadaha.jpg",
    alt: "Chau dance performed by students at an Indian school",
    use: "Cultural programme / dance", ratio: 16 / 9, position: "attention",
  },
  "parents/meeting": {
    // The Commons parent-teacher-meeting candidate was an empty school building
    // with no people in it, which does not carry a Parents section.
    unsplash: "1780329940878-c9b6d3f32c14",
    alt: "An Indian parent and her daughter",
    use: "Parents / family", ratio: 16 / 9, position: "attention",
  },
  "events/assembly": {
    commons: "Primary Campus.jpg",
    alt: "Indian school morning assembly",
    use: "Assembly / events", ratio: 16 / 9, position: "attention",
  },
  "events/yoga": {
    unsplash: "1649008726820-d90aeb70c32e",
    alt: "Indian school students at a yoga day event",
    use: "Yoga day / cultural events", ratio: 16 / 9, position: "attention",
  },

  // ----------------------------------------------------------------- transport
  "transport/bus": {
    commons: "SOSV school bus.jpg",
    alt: "Indian schoolchildren boarding a yellow school bus",
    use: "Transport / bus", ratio: 16 / 9, position: "attention",
  },
  "transport/fleet": {
    commons: "Advaith Transport.jpg",
    alt: "Fleet of Indian yellow school buses",
    use: "Transport fleet / bus tracking", ratio: 21 / 9, position: "attention",
  },

  // ------------------------------------------------- admissions & achievements
  "admissions/desk": {
    // Was byte-identical to campus/entrance; this is a different Indian school.
    commons: "Taktse International School Main Building.jpg",
    alt: "Families arriving at an Indian school for admissions",
    use: "Admissions", ratio: 16 / 9, position: "attention",
  },
  "achievements/boards": {
    // Was a Western graduation cap; this is an Indian student portrait shot for
    // exactly this "bright future" framing.
    unsplash: "1659985281435-d8d3ea55b55c",
    alt: "Indian school student looking ahead",
    use: "Achievements / board results", ratio: 16 / 9, position: "attention",
  },
  "leadership/principal": {
    // Previously a Western stock portrait. Uses the Indian classroom photograph
    // at a portrait crop so the teacher, not the room, is the subject.
    unsplash: "1709290749293-c6152a187b14",
    alt: "Teacher addressing her class in an Indian school",
    use: "Principal / leadership (portrait crop)", ratio: 4 / 5, position: "right top",
  },
};

const only = process.argv.find((a) => a.startsWith("--only="));
const filter = only ? new Set(only.slice(7).split(",")) : null;
/** Skip re-encoding assets already on disk; still records their manifest entry. */
const resume = process.argv.includes("--resume");

async function source(key, spec) {
  if (spec.commons) {
    const buf = await fetchImage(spec.commons, 2600);
    const meta = await fileMeta(spec.commons);
    await sleep(400);
    return {
      buf,
      record: {
        source: "Wikimedia Commons",
        file: meta.title,
        licence: meta.licence,
        author: meta.author,
        page: meta.page,
        permission: "licensed_reuse_with_attribution",
      },
    };
  }
  const url = unsplash(spec.unsplash);
  const res = await fetch(url, { headers: { "User-Agent": "DPS-SMS-assets/2.0" } });
  if (!res.ok) throw new Error(`unsplash ${res.status} for ${key}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 10_000) throw new Error(`unsplash payload too small for ${key}`);
  return {
    buf,
    record: {
      source: "Unsplash",
      photoId: spec.unsplash,
      licence: "Unsplash License",
      page: `https://unsplash.com/photos/${spec.unsplash}`,
      permission: "licensed_free_commercial",
    },
  };
}

const records = [];
const failures = [];

for (const [key, spec] of Object.entries(ASSETS)) {
  if (filter && !filter.has(key)) continue;
  try {
    const base = join(PUBLIC, key);
    if (resume && existsSync(`${base}.jpg`)) {
      const meta = spec.commons
        ? await fileMeta(spec.commons)
        : null;
      records.push({
        path: `/assets/school/${key}.jpg`,
        widths: WIDTHS.filter((w) => existsSync(`${base}-${w}.avif`)),
        formats: ["avif", "webp", "jpg"],
        alt: spec.alt,
        use: spec.use,
        aspect: Number(spec.ratio.toFixed(3)),
        ...(spec.commons
          ? {
              source: "Wikimedia Commons", file: meta.title, licence: meta.licence,
              author: meta.author, page: meta.page,
              permission: "licensed_reuse_with_attribution",
            }
          : {
              source: "Unsplash", photoId: spec.unsplash, licence: "Unsplash License",
              page: `https://unsplash.com/photos/${spec.unsplash}`,
              permission: "licensed_free_commercial",
            }),
      });
      console.log(`SKIP ${key} (already built)`);
      if (spec.commons) await sleep(250);
      continue;
    }

    const { buf, record } = await source(key, spec);
    mkdirSync(dirname(base), { recursive: true });

    const meta = await sharp(buf).metadata();
    const targetH = Math.round((meta.width || 2000) / spec.ratio);
    // Crop to the intended aspect first, so every derivative shares one
    // deliberate composition instead of each CSS frame slicing it differently.
    const master = sharp(buf).resize({
      width: meta.width,
      height: Math.min(targetH, meta.height || targetH),
      fit: "cover",
      position: spec.position || "attention",
    });
    /*
     * Grade before encoding.
     *
     * Several sources are hazy, flat-lit Indian daylight shots — one campus
     * photo measured 8/100 saturation with 21% blown highlights, which reads as
     * "washed out" on the page no matter how strong the scrim is. A modest
     * linear black-point lift plus saturation restores punch without looking
     * filtered. Measured by scripts/score-images.mjs.
     */
    const masterBuf = await master
      .modulate({ saturation: spec.grade?.saturation ?? 1.22 })
      .linear(spec.grade?.contrast ?? 1.12, -(spec.grade?.black ?? 12))
      .gamma(spec.grade?.gamma ?? 1.05)
      .toBuffer();

    const emitted = [];
    for (const w of WIDTHS) {
      if ((meta.width || 0) < w && w !== WIDTHS[0]) continue;
      await sharp(masterBuf).resize({ width: w }).avif({ quality: 52 }).toFile(`${base}-${w}.avif`);
      await sharp(masterBuf).resize({ width: w }).webp({ quality: 76 }).toFile(`${base}-${w}.webp`);
      emitted.push(w);
    }
    // JPEG fallback at the largest emitted width.
    const fallbackWidth = emitted[emitted.length - 1] || WIDTHS[0];
    await sharp(masterBuf).resize({ width: fallbackWidth }).jpeg({ quality: 80, mozjpeg: true })
      .toFile(`${base}.jpg`);

    records.push({
      path: `/assets/school/${key}.jpg`,
      widths: emitted,
      formats: ["avif", "webp", "jpg"],
      alt: spec.alt,
      use: spec.use,
      aspect: Number(spec.ratio.toFixed(3)),
      ...record,
    });
    console.log(`OK   ${key}  ${emitted.join("/")}  ${record.source}`);
  } catch (err) {
    failures.push(`${key}: ${err.message}`);
    console.log(`FAIL ${key}  ${err.message}`);
  }
}

// Merge into sources.json, preserving the policy block.
let existing = {};
if (existsSync(SOURCES)) {
  try { existing = JSON.parse(readFileSync(SOURCES, "utf8")); } catch { /* rewrite */ }
}
writeFileSync(SOURCES, JSON.stringify({
  policy: {
    summary:
      "Every image is either Unsplash-licensed or Wikimedia Commons under a licence permitting commercial reuse. " +
      "No school's own website assets are scraped or hotlinked. Commons images under CC BY-SA require the " +
      "attribution recorded below to be shown on the site credits page.",
    rules: [
      "No American or European university imagery",
      "No Chinese/East-Asian classrooms presented as Indian campuses",
      "No Western corporate stock standing in for school scenes",
      "No concert, unrelated-vehicle or generic-building filler",
      "No watermarked assets, no AI-generated faces or architecture",
      "One purposeful image per section - no universal filler",
    ],
    note:
      "Commons full-text search for 'Indian school' returns Native American boarding schools; " +
      "candidates are chosen by explicit file name after visual review, never by bulk search.",
  },
  generated: new Date().toISOString().slice(0, 10),
  assets: records,
  ...(existing.references_not_redistributed
    ? { references_not_redistributed: existing.references_not_redistributed }
    : {}),
}, null, 2));

console.log(`\n${records.length} assets written, ${failures.length} failed`);
if (failures.length) {
  console.log(failures.join("\n"));
  process.exitCode = 1;
}
