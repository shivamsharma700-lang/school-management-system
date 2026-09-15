import { SCHOOL } from "./schoolMedia";

export type CampusMedia = {
  code: string;
  aliases: string[];
  name: string;
  city: string;
  location: string;
  description: string;
  facilities: string[];
  students: number;
  classes: string;
  phone: string;
  email: string;
  hero: string;
  gallery: string[];
};

export const LOGIN_HERO = `${SCHOOL.dashboardHero}?v=20260908e`;


export const TOUR_POSTER = SCHOOL.campus.hero;

export const CAMPUS_MEDIA: CampusMedia[] = [
  {
    code: "CTR",
    aliases: ["MAIN", "CTR"],
    name: "Main Campus",
    city: "New Delhi",
    location: "Mathura Road, New Delhi",
    description: "The flagship Delhi campus with senior-secondary blocks, performing-arts studios and a landscaped quad.",
    facilities: ["Science block", "Auditorium", "Olympic-size pool", "Innovation lab", "Library"],
    students: 530,
    classes: "Nursery–Class 12",
    phone: "011-4300-1000",
    email: "main.demo@touchwood.local",
    hero: SCHOOL.campus.wide,
    gallery: [SCHOOL.campus.wide, SCHOOL.campus.wide, SCHOOL.classrooms],
  },
  {
    code: "EST",
    aliases: ["EST", "EAST"],
    name: "East Delhi",
    city: "Preet Vihar",
    location: "Preet Vihar, East Delhi",
    description: "A compact urban campus focused on junior-wing pastoral care and after-school enrichment.",
    facilities: ["Junior playground", "Art studio", "STEM makerspace", "Infirmary"],
    students: 530,
    classes: "Nursery–Class 12",
    phone: "011-4300-1002",
    email: "east.demo@touchwood.local",
    hero: SCHOOL.campus.dusk,
    gallery: [SCHOOL.campus.dusk, SCHOOL.studentLife, SCHOOL.students],
  },
  {
    code: "NTH",
    aliases: ["NTH", "NORTH"],
    name: "North Delhi",
    city: "Model Town",
    location: "Model Town, North Delhi",
    description: "North Campus pairs traditional academics with a strong sports and music programme.",
    facilities: ["Athletics track", "Music suite", "Boarding day rooms", "Cafeteria"],
    students: 530,
    classes: "Nursery–Class 12",
    phone: "011-4300-1001",
    email: "north.demo@touchwood.local",
    hero: SCHOOL.campus.wide,
    gallery: [SCHOOL.campus.wide, SCHOOL.sports, SCHOOL.sportsAthletics],
  },
  {
    code: "STH",
    aliases: ["STH", "SOUTH"],
    name: "South Delhi",
    city: "Saket",
    location: "Saket, South Delhi",
    description: "South Campus is known for humanities, debate and a tree-lined senior quadrangle.",
    facilities: ["Debate hall", "Language lab", "Green courtyard", "Career centre"],
    students: 530,
    classes: "Nursery–Class 12",
    phone: "011-4300-1003",
    email: "south.demo@touchwood.local",
    hero: SCHOOL.library,
    gallery: [SCHOOL.library, SCHOOL.campus.dusk, SCHOOL.classroomsLesson],
  },
  {
    code: "WST",
    aliases: ["WST", "WEST"],
    name: "West Delhi",
    city: "Janakpuri",
    location: "Janakpuri, West Delhi",
    description: "West Campus emphasises technology, robotics and community outreach.",
    facilities: ["Robotics lab", "Computer centre", "Community hall", "Transport depot"],
    students: 530,
    classes: "Nursery–Class 12",
    phone: "011-4300-1004",
    email: "west.demo@touchwood.local",
    hero: SCHOOL.scienceLab,
    gallery: [SCHOOL.scienceLab, SCHOOL.computerLab, SCHOOL.auditorium],
  },
  {
    code: "LKV",
    aliases: ["LKV"],
    name: "Noida",
    city: "Sector 27",
    location: "Sector 27, Noida",
    description: "A modern NCR campus with wide playing fields and a dedicated junior learning village.",
    facilities: ["Junior village", "Football field", "Design studio", "Parent lounge"],
    students: 530,
    classes: "Nursery–Class 12",
    phone: "0120-430-1006",
    email: "noida.demo@touchwood.local",
    hero: SCHOOL.campus.aerial,
    gallery: [SCHOOL.campus.aerial, SCHOOL.studentLifeFriends, SCHOOL.events],
  },
  {
    code: "HLS",
    aliases: ["HLS", "JNR"],
    name: "Greater Noida",
    city: "Knowledge Park",
    location: "Knowledge Park, Greater Noida",
    description: "Greater Noida Campus sits in Knowledge Park with labs and expansive grounds.",
    facilities: ["Research labs", "Indoor stadium", "Library", "Sports complex"],
    students: 530,
    classes: "Nursery–Class 12",
    phone: "0120-430-1007",
    email: "gnoida.demo@touchwood.local",
    hero: SCHOOL.sports,
    gallery: [SCHOOL.sports, SCHOOL.sportsAthletics, SCHOOL.auditorium],
  },
  {
    code: "RVR",
    aliases: ["RVR", "INT"],
    name: "Gurgaon",
    city: "Sushant Lok",
    location: "Sushant Lok, Gurugram",
    description: "Gurugram Campus serves the millennium city with international-style studios and a bus hub.",
    facilities: ["Media studio", "Bus hub", "Wellness clinic", "Innovation loft"],
    students: 530,
    classes: "Nursery–Class 12",
    phone: "0124-430-1008",
    email: "gurgaon.demo@touchwood.local",
    hero: SCHOOL.transport,
    gallery: [SCHOOL.transport, SCHOOL.campus.dusk, SCHOOL.studentsUniform],
  },
];

export type SectionVisual = { image: string; position: string };

/** Cache-bust after banner asset refresh so browsers pick up new crops. */
const ASSET_V = "v=20260908e";

function asset(path: string) {
  return path.includes("?") ? path : `${path}?${ASSET_V}`;
}

const FACE = "center 28%";
const MID = "center 40%";
const GROUND = "center 55%";
const BUILDING = "center 42%";

const SECTION_BY_PATH: Array<{ test: RegExp; image: string; position?: string }> = [
  { test: /^\/app\/dashboard/, image: asset(SCHOOL.dashboardHero), position: BUILDING },
  { test: /^\/app\/branches/, image: asset(SCHOOL.campus.wide), position: BUILDING },
  { test: /^\/app\/users/, image: asset(SCHOOL.teachers), position: FACE },
  { test: /^\/app\/academic-years/, image: asset(SCHOOL.achievements), position: MID },
  { test: /^\/app\/settings/, image: asset(SCHOOL.campus.entrance), position: MID },
  { test: /^\/app\/audit/, image: asset(SCHOOL.campus.dusk), position: MID },
  { test: /^\/app\/enquir/, image: asset(SCHOOL.admissions), position: FACE },
  { test: /^\/app\/applications/, image: asset(SCHOOL.admissions), position: FACE },
  { test: /^\/app\/entrance/, image: asset(SCHOOL.achievements), position: FACE },
  { test: /^\/app\/interviews/, image: asset(SCHOOL.teachers), position: FACE },
  { test: /^\/app\/admissions/, image: asset(SCHOOL.admissions), position: FACE },
  { test: /^\/app\/students/, image: asset(SCHOOL.students), position: FACE },
  { test: /^\/app\/promotions/, image: asset(SCHOOL.studentsGroup), position: FACE },
  { test: /^\/app\/transfers/, image: asset(SCHOOL.campus.entrance), position: BUILDING },
  { test: /^\/app\/documents/, image: asset(SCHOOL.library), position: MID },
  { test: /^\/app\/guardians/, image: asset(SCHOOL.teachers), position: FACE },
  { test: /^\/app\/children/, image: asset(SCHOOL.studentsUniform), position: FACE },
  { test: /^\/app\/teachers/, image: asset(SCHOOL.teachers), position: FACE },
  { test: /^\/app\/staff/, image: asset(SCHOOL.leadership), position: FACE },
  { test: /^\/app\/hr/, image: asset(SCHOOL.leadership), position: FACE },
  { test: /^\/app\/classes/, image: asset(SCHOOL.classrooms), position: MID },
  { test: /^\/app\/subjects/, image: asset(SCHOOL.classroomsLesson), position: MID },
  { test: /^\/app\/timetable/, image: asset(SCHOOL.classrooms), position: MID },
  { test: /^\/app\/homework/, image: asset(SCHOOL.studentsClassroom), position: FACE },
  { test: /^\/app\/exams/, image: asset(SCHOOL.achievements), position: FACE },
  { test: /^\/app\/marks/, image: asset(SCHOOL.achievements), position: FACE },
  { test: /^\/app\/results/, image: asset(SCHOOL.achievements), position: FACE },
  { test: /^\/app\/report-cards/, image: asset(SCHOOL.achievements), position: FACE },
  { test: /^\/app\/study-materials/, image: asset(SCHOOL.library), position: MID },
  { test: /^\/app\/attendance-reports/, image: asset(SCHOOL.studentsGroup), position: MID },
  { test: /^\/app\/staff-attendance/, image: asset(SCHOOL.teachers), position: FACE },
  { test: /^\/app\/attendance/, image: asset(SCHOOL.studentsClassroom), position: FACE },
  { test: /^\/app\/fees/, image: asset(SCHOOL.admissions), position: MID },
  { test: /^\/app\/invoices/, image: asset(SCHOOL.admissions), position: MID },
  { test: /^\/app\/payments/, image: asset(SCHOOL.admissions), position: MID },
  { test: /^\/app\/receipts/, image: asset(SCHOOL.admissions), position: MID },
  { test: /^\/app\/pending-fees/, image: asset(SCHOOL.admissions), position: MID },
  { test: /^\/app\/library/, image: asset(SCHOOL.library), position: MID },
  { test: /^\/app\/transport/, image: asset(SCHOOL.transport), position: GROUND },
  { test: /^\/app\/bus-tracking/, image: asset(SCHOOL.transport), position: GROUND },
  { test: /^\/app\/notices/, image: asset(SCHOOL.events), position: MID },
  { test: /^\/app\/notifications/, image: asset(SCHOOL.events), position: MID },
  { test: /^\/app\/complaints/, image: asset(SCHOOL.leadership), position: FACE },
  { test: /^\/app\/communication/, image: asset(SCHOOL.teachers), position: FACE },
  { test: /^\/app\/leave-approvals/, image: asset(SCHOOL.campus.entrance), position: MID },
  { test: /^\/app\/leave/, image: asset(SCHOOL.campus.entrance), position: MID },
  { test: /^\/app\/reports/, image: asset(SCHOOL.achievements), position: MID },
  { test: /^\/app\/analytics/, image: asset(SCHOOL.campus.wide), position: MID },
  { test: /^\/app\/inventory/, image: asset(SCHOOL.library), position: MID },
  { test: /^\/app\/events/, image: asset(SCHOOL.events), position: FACE },
  { test: /^\/app\/health/, image: asset(SCHOOL.studentLife), position: MID },
  { test: /^\/app\/discipline/, image: asset(SCHOOL.studentsUniform), position: FACE },
  { test: /^\/app\/sports/, image: asset(SCHOOL.sports), position: GROUND },
  { test: /^\/app\/labs/, image: asset(SCHOOL.scienceLab), position: MID },
  { test: /^\/app\/ptm/, image: asset(SCHOOL.teachers), position: FACE },
  { test: /^\/app\/alumni/, image: asset(SCHOOL.studentsGroup), position: FACE },
];

const TITLE_HINTS: Array<{ test: RegExp; image: string; position?: string }> = [
  { test: /library/i, image: asset(SCHOOL.library), position: MID },
  { test: /sport/i, image: asset(SCHOOL.sports), position: GROUND },
  { test: /lab/i, image: asset(SCHOOL.scienceLab), position: MID },
  { test: /bus|transport/i, image: asset(SCHOOL.transport), position: GROUND },
  { test: /fee|invoice|payment|finance/i, image: asset(SCHOOL.admissions), position: MID },
  { test: /exam|mark|result/i, image: asset(SCHOOL.achievements), position: FACE },
  { test: /homework|study/i, image: asset(SCHOOL.studentsClassroom), position: FACE },
  { test: /attend/i, image: asset(SCHOOL.studentsClassroom), position: FACE },
  { test: /teacher/i, image: asset(SCHOOL.teachers), position: FACE },
  { test: /guardian|parent/i, image: asset(SCHOOL.teachers), position: FACE },
  { test: /student/i, image: asset(SCHOOL.students), position: FACE },
  { test: /admission|enquir|application/i, image: asset(SCHOOL.admissions), position: FACE },
  { test: /event/i, image: asset(SCHOOL.events), position: FACE },
  { test: /report|analytic/i, image: asset(SCHOOL.achievements), position: MID },
  { test: /campus|branch/i, image: asset(SCHOOL.campus.wide), position: BUILDING },
];

export function campusMedia(code?: string | null, name?: string | null): CampusMedia {
  const key = (code ?? "").toUpperCase();
  const byCode = CAMPUS_MEDIA.find((c) => c.aliases.includes(key) || c.code === key);
  if (byCode) return byCode;
  const blob = `${code ?? ""} ${name ?? ""}`.toLowerCase();
  return (
    CAMPUS_MEDIA.find((c) => blob.includes(c.city.toLowerCase()) || blob.includes(c.name.toLowerCase().replace("delhi", "").trim())) ??
    CAMPUS_MEDIA[0]
  );
}

export function campusPhoto(code?: string | null, name?: string | null) {
  return campusMedia(code, name).hero;
}

export function sectionVisualForPath(pathname?: string | null, title?: string | null): SectionVisual {
  const path = pathname ?? "";
  const hit = SECTION_BY_PATH.find((row) => row.test.test(path));
  if (hit) return { image: hit.image, position: hit.position ?? MID };
  if (title) {
    const titled = TITLE_HINTS.find((row) => row.test.test(title));
    if (titled) return { image: titled.image, position: titled.position ?? MID };
  }
  return { image: asset(SCHOOL.campus.dusk), position: BUILDING };
}

export function sectionImageForPath(pathname?: string | null, title?: string | null) {
  return sectionVisualForPath(pathname, title).image;
}
