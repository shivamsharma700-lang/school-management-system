/**
 * Download licensed Unsplash photography curated for Indian / South-Asian school life.
 * Official DPS sites are visual references only — their assets are NOT scraped.
 */
import { mkdirSync, writeFileSync, existsSync, copyFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "assets");

function u(id, w = 1800, h = 1200) {
  const path = id.includes("/") ? id : `photo-${id}`;
  return `https://images.unsplash.com/${path}?auto=format&fit=crop&w=${w}&h=${h}&q=85`;
}

/** Distinct Indian-school-leaning free Unsplash photos (no Unsplash+). */
const assets = {
  // Campus / interiors — Indian classrooms preferred over Western collegiate exteriors
  "school/campus/hero.jpg": u("1709290749293-c6152a187b14", 1920, 1080),
  "school/campus/wide.jpg": u("1719159381962-4170890ada4e", 1920, 1080),
  "school/campus/dusk.jpg": u("1572847748080-bac263fae977", 1920, 1080),
  "school/campus/entrance.jpg": u("1650192139655-77eb926ec6fa", 1800, 1200),
  "campuses/main.jpg": u("1654366677760-b1aaa51b9e02"),
  "campuses/dusk.jpg": u("1572847748080-bac263fae977"),
  "campuses/east.jpg": u("1719159381916-062fa9f435a6"),
  "campuses/noida.jpg": u("1636772523547-5577d04e8dc1"),

  // Students
  "school/students/portrait.jpg": u("1524069290683-0457abfe42c3", 1400, 1600),
  "school/students/classroom.jpg": u("1709290749293-c6152a187b14", 1800, 1200),
  "school/students/group.jpg": u("1573894998033-c0cef4ed722b", 1800, 1200),
  "school/students/uniform.jpg": u("1623863568368-69e4cbe6cc0b", 1600, 1200),
  "school/students/books.jpg": u("1623303366639-0e330d7c3d9f", 1400, 1600),
  "school/student-life/campus.jpg": u("1573894999291-f440466112cc", 1800, 1200),
  "school/student-life/friends.jpg": u("flagged/photo-1574097656146-0b43b7660cb6", 1800, 1200),

  // Teachers / leadership
  "school/teachers/faculty.jpg": u("1659985281435-d8d3ea55b55c", 1600, 1200),
  "school/leadership/principal.jpg": u("1573496359142-b8d87734a5a2", 1400, 1600),

  // Classrooms / academics
  "school/classrooms/digital.jpg": u("1650192139655-77eb926ec6fa", 1800, 1200),
  "school/classrooms/lesson.jpg": u("1719159381916-062fa9f435a6", 1800, 1200),
  "sections/classes.jpg": u("1650192139655-77eb926ec6fa"),
  "sections/academics.jpg": u("1709290749293-c6152a187b14"),
  "sections/early-years.jpg": u("1524069290683-0457abfe42c3"),
  "sections/students.jpg": u("1623863568368-69e4cbe6cc0b"),
  "sections/teachers.jpg": u("1659985281435-d8d3ea55b55c"),

  // Library
  "school/library/reading.jpg": u("1521587760476-6c12a4b040da", 1800, 1200),
  "sections/library.jpg": u("1507842217343-583bb7270b66", 1800, 1200),

  // Science / computer
  "school/science-lab/bench.jpg": u("1532094349884-543bc11b234d", 1800, 1200),
  "school/computer-lab/lab.jpg": u("1516321318423-f06f85e504b3", 1800, 1200),
  "sections/labs.jpg": u("1532094349884-543bc11b234d"),
  "sections/computer.jpg": u("1516321318423-f06f85e504b3"),

  // Auditorium / events
  "school/auditorium/hall.jpg": u("1501281668745-f7f57925c3b4", 1800, 1200),
  "school/events/assembly.jpg": u("1551731409-43eb3e517a1a", 1800, 1200),
  "school/events/yoga.jpg": u("1649008726820-d90aeb70c32e", 1800, 1200),
  "sections/events.jpg": u("1551731409-43eb3e517a1a"),
  "sections/auditorium.jpg": u("1501281668745-f7f57925c3b4"),
  "sections/culture.jpg": u("1649008726820-d90aeb70c32e"),

  // Sports — cricket more India-relevant
  "school/sports/field.jpg": u("1531415074968-036ba1b575da", 1920, 1080),
  "school/sports/athletics.jpg": u("1531415074968-036ba1b575da", 1800, 1200),
  "sections/sports.jpg": u("1531415074968-036ba1b575da"),

  // Transport
  "school/transport/bus.jpg": u("1544620347-c4fd4a3d5957", 1800, 1200),
  "sections/transport.jpg": u("1544620347-c4fd4a3d5957"),
  "sections/bus-tracking.jpg": u("1544620347-c4fd4a3d5957"),

  // Admissions / achievements
  "school/admissions/desk.jpg": u("1523240795612-9a054b0db644", 1800, 1200),
  "school/achievements/boards.jpg": u("1434030216411-0b793f4b4173", 1800, 1200),
  "sections/admissions.jpg": u("1523240795612-9a054b0db644"),
  "sections/exams.jpg": u("1434030216411-0b793f4b4173"),
  "sections/parents.jpg": u("1476703993599-0035a21b17a9"),

  // Arts / clubs
  "sections/arts.jpg": u("1511379938547-c1f69419868d"),
  "sections/clubs.jpg": u("1523240795612-9a054b0db644"),
  "sections/field-trips.jpg": u("1469854523086-cc02fe5d8800"),

  // Site aliases
  "site/hero-still.jpg": u("1709290749293-c6152a187b14", 1920, 1080),
  "site/campus-wide.jpg": u("1719159381962-4170890ada4e", 1920, 1080),
  "site/digital-class.jpg": u("1650192139655-77eb926ec6fa"),
  "site/science-lab.jpg": u("1532094349884-543bc11b234d"),
  "site/library-wide.jpg": u("1521587760476-6c12a4b040da", 1800, 1200),
  "site/sports-field.jpg": u("1531415074968-036ba1b575da"),
  "site/student-life.jpg": u("1572847748080-bac263fae977"),
  "site/leadership.jpg": u("1573496359142-b8d87734a5a2"),
  "site/gallery-1.jpg": u("1650192139655-77eb926ec6fa"),
  "site/gallery-2.jpg": u("1709290749293-c6152a187b14"),
  "site/gallery-3.jpg": u("1531415074968-036ba1b575da"),
  "site/gallery-4.jpg": u("1511379938547-c1f69419868d"),
  "site/gallery-5.jpg": u("1551731409-43eb3e517a1a"),
  "site/gallery-6.jpg": u("1623863568368-69e4cbe6cc0b"),

  // Dashboard
  "school/dashboard/promo.jpg": u("1573894998033-c0cef4ed722b", 1400, 1800),
  "school/dashboard/hero.jpg": u("1719159381962-4170890ada4e", 1920, 900),
};

async function download(url, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DPS-SMS-assets/3.0)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 8000) throw new Error(`too small ${buf.length}`);
    const head = buf.slice(0, 80).toString("utf8").toLowerCase();
    if (head.includes("<!doctype") || head.includes("<html")) throw new Error("html payload");
    writeFileSync(dest, buf);
    console.log("OK", dest.replace(root + "\\", "").replace(root + "/", ""), buf.length);
    return true;
  } catch (err) {
    console.log("FAIL", dest, err.message);
    return false;
  }
}

for (const [rel, url] of Object.entries(assets)) {
  await download(url, join(root, rel));
}

const videoPath = join(root, "videos/campus-hero.mp4");
if (!existsSync(videoPath) || statSync(videoPath).size < 100000) {
  console.log("VIDEO: keeping photographic stills as primary (no weak stock video forced)");
}

console.log("indian school assets done");
