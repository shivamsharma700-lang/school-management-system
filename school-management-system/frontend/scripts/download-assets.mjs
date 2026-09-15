import { mkdirSync, writeFileSync, existsSync, statSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "assets");

function u(id) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1800&h=1100&q=72`;
}

function p(id) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1800&h=1100&fit=crop`;
}

/** Unique licensed stills — school/campus subjects, landscape 18:11 crop. */
const files = {
  "campuses/dusk.jpg": u("1607237138185-eedd9c632b0b"),
  "campuses/main.jpg": u("1596495577886-d920f1fb2235"),
  "campuses/main-2.jpg": u("1541339907198-e08756dedf3f"),
  "campuses/east.jpg": u("1541829070764-84a7d30dd3a3"),
  "campuses/east-2.jpg": u("1523050854058-8df90110c9f1"),
  "campuses/north.jpg": u("1498243691581-b145c3f54a5a"),
  "campuses/north-2.jpg": u("1571260899304-425eee4c7efc"),
  "campuses/south.jpg": u("1521587760476-6c12a4b040da"),
  "campuses/south-2.jpg": u("1462530266553-d31d3e0c0c1d"),
  "campuses/west.jpg": u("1509062522246-3755977927d7"),
  "campuses/west-2.jpg": u("1582719471384-894fbb16e074"),
  "campuses/noida.jpg": u("1523580494863-6f3031224c94"),
  "campuses/noida-2.jpg": u("1497366216548-37526070297c"),
  "campuses/greater-noida.jpg": u("1576495199013-c3101c197480"),
  "campuses/greater-noida-2.jpg": u("1590496793929-dfad078942cc"),
  "campuses/gurgaon.jpg": u("1606761568499-6d2451b23c66"),
  "campuses/gurgaon-2.jpg": u("1558618666-fcd25c85f82e"),

  "sections/dashboard.jpg": u("1562774053-701939374585"),
  "sections/students.jpg": u("1427504494785-3a9ca7044f45"),
  "sections/teachers.jpg": u("1524178232363-1fb2b075b655"),
  "sections/staff.jpg": u("1517048676732-d65bc937f952"),
  "sections/parents.jpg": u("1476703993599-0035a21b17a9"),
  "sections/admissions.jpg": u("1523240795612-9a054b0db644"),
  "sections/classes.jpg": u("1580582932707-520aed937b7b"),
  "sections/library.jpg": u("1481627834876-b7833e8f5570"),
  "sections/sports.jpg": u("1574629810360-7efbbe195018"),
  "sections/labs.jpg": u("1532094349884-543bc11b234d"),
  "sections/fees.jpg": u("1454165804606-c3d57bc86b40"),
  "sections/transport.jpg": u("1602248406547-bda7af9fb7e9"),
  "sections/bus-tracking.jpg": u("1718552267513-b1bb31cd12f7"),
  "sections/exams.jpg": u("1434030216411-0b793f4b4173"),
  "sections/homework.jpg": u("1456513080852-a5b3c18f240e"),
  "sections/attendance.jpg": u("1503676260728-1c00da094a0b"),
  "sections/events.jpg": u("1540575467063-178a50c2df87"),
  "sections/health.jpg": u("1576091160550-2173dba950ef"),
  "sections/reports.jpg": u("1551288049-bebda4e38f71"),
  "sections/settings.jpg": u("1497366754035-f090982b67d4"),
  "sections/academics.jpg": u("1522202176988-66273c2fd55f"),
  "sections/computer.jpg": u("1516321318423-f06f85e504b3"),
  "sections/principal.jpg": u("1573496359142-b8d87734a5a2"),
  "sections/auditorium.jpg": u("1478146896983-b04e14d4b8d5"),
  "sections/arts.jpg": u("1511379938547-c1f69419868d"),
  "sections/early-years.jpg": u("1588075598002-c43ee3fb509d"),
  "sections/culture.jpg": u("1501281668745-f2f9c4abe0e8"),
  "sections/clubs.jpg": p(3184338),
  "sections/field-trips.jpg": u("1469854523086-cc02fe5d8800"),
  "sections/notices.jpg": u("1511578314322-379afb476865"),
  "sections/branches.jpg": u("1541339907198-e08756dedf3f"),
  "sections/users.jpg": u("1517048676732-d65bc937f952"),
  "sections/years.jpg": u("1580582932707-520aed937b7b"),
  "sections/audit.jpg": u("1551288049-bebda4e38f71"),
  "sections/ptm.jpg": u("1511895426328-dc8714191300"),
  "sections/promotions.jpg": u("1523240795612-9a054b0db644"),
  "sections/transfers.jpg": u("1541339907198-e08756dedf3f"),
  "sections/documents.jpg": u("1434030216411-0b793f4b4173"),
  "sections/hr.jpg": u("1517048676732-d65bc937f952"),
  "sections/subjects.jpg": u("1481627834876-b7833e8f5570"),
  "sections/timetable.jpg": u("1580582932707-520aed937b7b"),
  "sections/marks.jpg": u("1434030216411-0b793f4b4173"),
  "sections/results.jpg": u("1523240795612-9a054b0db644"),
  "sections/study.jpg": u("1456513080852-a5b3c18f240e"),
  "sections/complaints.jpg": u("1573496359142-b8d87734a5a2"),
  "sections/communication.jpg": u("1573496359142-b8d87734a5a2"),
  "sections/leave.jpg": u("1503676260728-1c00da094a0b"),
  "sections/inventory.jpg": u("1532094349884-543bc11b234d"),
  "sections/discipline.jpg": u("1580582932707-520aed937b7b"),
  "sections/alumni.jpg": u("1523240795612-9a054b0db644"),
};

/** Force-refresh weak / mislabelled module banners. */
const force = new Set([]);

const aliases = {};

const fallbacks = {
  "campuses/dusk.jpg": "https://picsum.photos/id/1015/1800/1100",
  "campuses/main.jpg": "https://picsum.photos/id/1018/1800/1100",
  "campuses/noida-2.jpg": "https://picsum.photos/id/1016/1800/1100",
  "campuses/gurgaon-2.jpg": "https://picsum.photos/id/111/1800/1100",
  "sections/parents.jpg": u("1476703993599-0035a21b17a9"),
  "sections/ptm.jpg": u("1609220136736-443140cff224"),
  "sections/transport.jpg": u("1602248406547-bda7af9fb7e9"),
  "sections/bus-tracking.jpg": u("1718552267513-b1bb31cd12f7"),
  "sections/homework.jpg": p(4145197),
  "sections/health.jpg": p(4021775),
  "sections/communication.jpg": p(3184418),
  "sections/study.jpg": p(256417),
  "sections/clubs.jpg": "https://picsum.photos/id/0/1800/1100",
};

const videos = {
  "videos/campus-hero.mp4": [
    "https://videos.pexels.com/video-files/8471966/8471966-hd_1280_720_25fps.mp4",
    "https://videos.pexels.com/video-files/5192158/5192158-hd_1280_720_25fps.mp4",
    "https://videos.pexels.com/video-files/3209298/3209298-hd_1280_720_25fps.mp4",
  ],
  "videos/campus-tour.mp4": [
    "https://videos.pexels.com/video-files/855282/855282-hd_1280_720_24fps.mp4",
    "https://videos.pexels.com/video-files/855282/855282-sd_640_360_24fps.mp4",
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
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DPS-SMS-assets/1.0)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = res.headers.get("content-type") || "";
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 8000) throw new Error(`too small ${buf.length}`);
    const head = buf.slice(0, 80).toString("utf8").toLowerCase();
    if (head.includes("<!doctype") || head.includes("<html")) throw new Error(`html payload ${type}`);
    if (type && !/image|video|octet|jpeg|png|mp4/i.test(type) && !dest.endsWith(".mp4")) {
      throw new Error(`not media ${type}`);
    }
    writeFileSync(dest, buf);
    console.log("OK", dest, buf.length);
    return true;
  } catch (err) {
    console.log("FAIL", dest, err.message);
    return false;
  }
}

for (const [rel, url] of Object.entries(files)) {
  const dest = join(root, rel);
  const replace = force.has(rel);
  const ok = await download(url, dest, { replace });
  if (!ok && fallbacks[rel]) await download(fallbacks[rel], dest, { replace: true });
}

for (const [rel, srcRel] of Object.entries(aliases)) {
  const dest = join(root, rel);
  const src = join(root, srcRel);
  if (existsSync(dest) && statSync(dest).size > 12000 && !force.has(rel)) continue;
  if (existsSync(src) && statSync(src).size > 12000) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    console.log("COPY", srcRel, "->", rel);
  }
}

for (const [rel, urls] of Object.entries(videos)) {
  const dest = join(root, rel);
  const replace = force.has(rel);
  let ok = false;
  for (const url of urls) {
    ok = await download(url, dest, { replace: replace && !ok });
    if (ok) break;
  }
}
