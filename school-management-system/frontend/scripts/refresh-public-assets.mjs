import { mkdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "assets");

function u(id, w = 1800, h = 1100) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

/** Fresh public-site photography — force replace weak assets. */
const publicForce = {
  "campuses/main.jpg": u("1541829070764-84a7d30dd3a3"),
  "campuses/dusk.jpg": u("1562774053-701939374585"),
  "campuses/noida.jpg": u("1523050854058-8df90110c9f1"),
  "campuses/east.jpg": u("1498243691581-b145c3f54a5a"),
  "sections/academics.jpg": u("1509062522246-3755977927d7"),
  "sections/classes.jpg": u("1580582932707-520aed937b7b"),
  "sections/library.jpg": u("1521587760476-6c12a4b040da"),
  "sections/labs.jpg": u("1532094349884-543bc11b234d"),
  "sections/computer.jpg": u("1516321318423-f06f85e504b3"),
  "sections/sports.jpg": u("1574629810360-7efbbe195018"),
  "sections/students.jpg": u("1427504494785-3a9ca7044f45"),
  "sections/teachers.jpg": u("1524178232363-1fb2b075b655"),
  "sections/principal.jpg": u("1573496359142-b8d87734a5a2"),
  "sections/events.jpg": u("1540575467063-178a50c2df87"),
  "sections/arts.jpg": u("1511379938547-c1f69419868d"),
  "sections/culture.jpg": u("1501281668745-f2f9c4abe0e8"),
  "sections/admissions.jpg": u("1523050854058-8df90110c9f1"),
  "sections/transport.jpg": u("1544620347-c4fd4a3d5957"),
  "sections/bus-tracking.jpg": u("1558618666-fcd25c85f82e"),
  "sections/auditorium.jpg": u("1478146896983-b04e14d4b8d5"),
  "sections/early-years.jpg": u("1588075598002-c43ee3fb509d"),
  "sections/exams.jpg": u("1434030216411-0b793f4b4173"),
  "sections/parents.jpg": u("1476703993599-0035a21b17a9"),
  "sections/field-trips.jpg": u("1469854523086-cc02fe5d8800"),
  "sections/clubs.jpg": u("1523240795612-9a054b0db644"),
  "site/hero-still.jpg": u("1541829070764-84a7d30dd3a3", 1920, 1080),
  "site/campus-wide.jpg": u("1562774053-701939374585", 1920, 1080),
  "site/digital-class.jpg": u("1509062522246-3755977927d7"),
  "site/science-lab.jpg": u("1532094349884-543bc11b234d"),
  "site/library-wide.jpg": u("1521587760476-6c12a4b040da", 1800, 1200),
  "site/sports-field.jpg": u("1461896836934-ffe607ba6851"),
  "site/student-life.jpg": u("1427504494785-3a9ca7044f45"),
  "site/leadership.jpg": u("1573496359142-b8d87734a5a2"),
  "site/gallery-1.jpg": u("1541339907198-e08756dedf3f"),
  "site/gallery-2.jpg": u("1498243691581-b145c3f54a5a"),
  "site/gallery-3.jpg": u("1571260899304-425eee4c7efc"),
  "site/gallery-4.jpg": u("1511379938547-c1f69419868d"),
  "site/gallery-5.jpg": u("1540575467063-178a50c2df87"),
  "site/gallery-6.jpg": u("1580582932707-520aed937b7b"),
};

const videos = {
  "videos/campus-hero.mp4": [
    // Outdoor school / campus atmosphere (Pexels free)
    "https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4",
    "https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4",
    "https://videos.pexels.com/video-files/855282/855282-hd_1280_720_24fps.mp4",
    "https://videos.pexels.com/video-files/8471966/8471966-hd_1280_720_25fps.mp4",
  ],
};

async function download(url, dest, { replace = false } = {}) {
  if (!replace && existsSync(dest) && statSync(dest).size > 12000) {
    console.log("SKIP", dest);
    return true;
  }
  mkdirSync(dirname(dest), { recursive: true });
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DPS-SMS-assets/2.0)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = res.headers.get("content-type") || "";
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 8000) throw new Error(`too small ${buf.length}`);
    const head = buf.slice(0, 80).toString("utf8").toLowerCase();
    if (head.includes("<!doctype") || head.includes("<html")) throw new Error(`html payload ${type}`);
    writeFileSync(dest, buf);
    console.log("OK", dest, buf.length);
    return true;
  } catch (err) {
    console.log("FAIL", dest, err.message);
    return false;
  }
}

for (const [rel, url] of Object.entries(publicForce)) {
  await download(url, join(root, rel), { replace: true });
}

for (const [rel, urls] of Object.entries(videos)) {
  const dest = join(root, rel);
  for (const url of urls) {
    if (await download(url, dest, { replace: true })) break;
  }
}

console.log("public assets done");
