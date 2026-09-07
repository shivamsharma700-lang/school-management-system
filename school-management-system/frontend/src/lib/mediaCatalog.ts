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

export const LOGIN_HERO = "/assets/campuses/dusk.jpg";
export const TOUR_VIDEO = "/assets/videos/campus-hero.mp4";
export const TOUR_VIDEO_FALLBACK = "/assets/videos/campus-tour.mp4";
export const TOUR_POSTER = "/assets/campuses/dusk.jpg";

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
    email: "main.demo@dps.local",
    hero: "/assets/campuses/main.jpg",
    gallery: ["/assets/campuses/main.jpg", "/assets/campuses/main-2.jpg", "/assets/sections/academics.jpg"],
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
    email: "east.demo@dps.local",
    hero: "/assets/campuses/east.jpg",
    gallery: ["/assets/campuses/east.jpg", "/assets/campuses/east-2.jpg", "/assets/sections/students.jpg"],
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
    email: "north.demo@dps.local",
    hero: "/assets/campuses/north.jpg",
    gallery: ["/assets/campuses/north.jpg", "/assets/campuses/north-2.jpg", "/assets/sections/sports.jpg"],
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
    email: "south.demo@dps.local",
    hero: "/assets/campuses/south.jpg",
    gallery: ["/assets/campuses/south.jpg", "/assets/campuses/south-2.jpg", "/assets/sections/library.jpg"],
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
    email: "west.demo@dps.local",
    hero: "/assets/campuses/west.jpg",
    gallery: ["/assets/campuses/west.jpg", "/assets/campuses/west-2.jpg", "/assets/sections/labs.jpg"],
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
    email: "noida.demo@dps.local",
    hero: "/assets/campuses/noida.jpg",
    gallery: ["/assets/campuses/noida.jpg", "/assets/campuses/noida-2.jpg", "/assets/sections/events.jpg"],
  },
  {
    code: "HLS",
    aliases: ["HLS", "JNR"],
    name: "Greater Noida",
    city: "Knowledge Park",
    location: "Knowledge Park, Greater Noida",
    description: "Greater Noida Campus sits in Knowledge Park with hostels, labs and expansive grounds.",
    facilities: ["Hostel", "Research labs", "Indoor stadium", "Canteen court"],
    students: 530,
    classes: "Nursery–Class 12",
    phone: "0120-430-1007",
    email: "gnoida.demo@dps.local",
    hero: "/assets/campuses/greater-noida.jpg",
    gallery: ["/assets/campuses/greater-noida.jpg", "/assets/campuses/greater-noida-2.jpg", "/assets/sections/hostel.jpg"],
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
    email: "gurgaon.demo@dps.local",
    hero: "/assets/campuses/gurgaon.jpg",
    gallery: ["/assets/campuses/gurgaon.jpg", "/assets/campuses/gurgaon-2.jpg", "/assets/sections/transport.jpg"],
  },
];

export type SectionVisual = { image: string; position: string };

/** Cache-bust after banner asset refresh so browsers pick up new crops. */
const ASSET_V = "v=20260327g";

function asset(path: string) {
  return `${path}?${ASSET_V}`;
}

const FACE = "center 22%";
const MID = "center 32%";
const GROUND = "center 46%";
const BUILDING = "center 40%";

const SECTION_BY_PATH: Array<{ test: RegExp; image: string; position?: string }> = [
  { test: /^\/app\/dashboard/, image: asset("/assets/sections/dashboard.jpg"), position: BUILDING },
  { test: /^\/app\/branches/, image: asset("/assets/sections/branches.jpg"), position: BUILDING },
  { test: /^\/app\/users/, image: asset("/assets/sections/users.jpg"), position: FACE },
  { test: /^\/app\/academic-years/, image: asset("/assets/sections/years.jpg"), position: MID },
  { test: /^\/app\/settings/, image: asset("/assets/sections/settings.jpg"), position: MID },
  { test: /^\/app\/audit/, image: asset("/assets/sections/audit.jpg"), position: MID },
  { test: /^\/app\/enquir/, image: asset("/assets/sections/admissions.jpg"), position: FACE },
  { test: /^\/app\/applications/, image: asset("/assets/sections/admissions.jpg"), position: FACE },
  { test: /^\/app\/entrance/, image: asset("/assets/sections/exams.jpg"), position: FACE },
  { test: /^\/app\/interviews/, image: asset("/assets/sections/ptm.jpg"), position: FACE },
  { test: /^\/app\/admissions/, image: asset("/assets/sections/admissions.jpg"), position: FACE },
  { test: /^\/app\/students/, image: asset("/assets/sections/students.jpg"), position: "center 48%" },
  { test: /^\/app\/promotions/, image: asset("/assets/sections/promotions.jpg"), position: FACE },
  { test: /^\/app\/transfers/, image: asset("/assets/sections/transfers.jpg"), position: BUILDING },
  { test: /^\/app\/documents/, image: asset("/assets/sections/documents.jpg"), position: MID },
  { test: /^\/app\/guardians/, image: asset("/assets/sections/parents.jpg"), position: FACE },
  { test: /^\/app\/children/, image: asset("/assets/sections/parents.jpg"), position: FACE },
  { test: /^\/app\/teachers/, image: asset("/assets/sections/teachers.jpg"), position: FACE },
  { test: /^\/app\/staff/, image: asset("/assets/sections/staff.jpg"), position: FACE },
  { test: /^\/app\/hr/, image: asset("/assets/sections/hr.jpg"), position: FACE },
  { test: /^\/app\/classes/, image: asset("/assets/sections/classes.jpg"), position: MID },
  { test: /^\/app\/subjects/, image: asset("/assets/sections/subjects.jpg"), position: MID },
  { test: /^\/app\/timetable/, image: asset("/assets/sections/timetable.jpg"), position: MID },
  { test: /^\/app\/homework/, image: asset("/assets/sections/homework.jpg"), position: FACE },
  { test: /^\/app\/exams/, image: asset("/assets/sections/exams.jpg"), position: FACE },
  { test: /^\/app\/marks/, image: asset("/assets/sections/marks.jpg"), position: FACE },
  { test: /^\/app\/results/, image: asset("/assets/sections/results.jpg"), position: FACE },
  { test: /^\/app\/report-cards/, image: asset("/assets/sections/results.jpg"), position: FACE },
  { test: /^\/app\/study-materials/, image: asset("/assets/sections/study.jpg"), position: MID },
  { test: /^\/app\/attendance-reports/, image: asset("/assets/sections/reports.jpg"), position: MID },
  { test: /^\/app\/staff-attendance/, image: asset("/assets/sections/staff.jpg"), position: FACE },
  { test: /^\/app\/attendance/, image: asset("/assets/sections/attendance.jpg"), position: FACE },
  { test: /^\/app\/fees/, image: asset("/assets/sections/fees.jpg"), position: MID },
  { test: /^\/app\/invoices/, image: asset("/assets/sections/fees.jpg"), position: MID },
  { test: /^\/app\/payments/, image: asset("/assets/sections/fees.jpg"), position: MID },
  { test: /^\/app\/receipts/, image: asset("/assets/sections/fees.jpg"), position: MID },
  { test: /^\/app\/pending-fees/, image: asset("/assets/sections/fees.jpg"), position: MID },
  { test: /^\/app\/library/, image: asset("/assets/sections/library.jpg"), position: MID },
  { test: /^\/app\/transport/, image: asset("/assets/sections/transport.jpg"), position: GROUND },
  { test: /^\/app\/bus-tracking/, image: asset("/assets/sections/bus-tracking.jpg"), position: GROUND },
  { test: /^\/app\/notices/, image: asset("/assets/sections/notices.jpg"), position: MID },
  { test: /^\/app\/notifications/, image: asset("/assets/sections/notices.jpg"), position: MID },
  { test: /^\/app\/complaints/, image: asset("/assets/sections/complaints.jpg"), position: FACE },
  { test: /^\/app\/communication/, image: asset("/assets/sections/communication.jpg"), position: FACE },
  { test: /^\/app\/leave-approvals/, image: asset("/assets/sections/leave.jpg"), position: MID },
  { test: /^\/app\/leave/, image: asset("/assets/sections/leave.jpg"), position: MID },
  { test: /^\/app\/reports/, image: asset("/assets/sections/reports.jpg"), position: MID },
  { test: /^\/app\/analytics/, image: asset("/assets/sections/reports.jpg"), position: MID },
  { test: /^\/app\/inventory/, image: asset("/assets/sections/inventory.jpg"), position: MID },
  { test: /^\/app\/events/, image: asset("/assets/sections/events.jpg"), position: FACE },
  { test: /^\/app\/health/, image: asset("/assets/sections/health.jpg"), position: MID },
  { test: /^\/app\/discipline/, image: asset("/assets/sections/discipline.jpg"), position: FACE },
  { test: /^\/app\/sports/, image: asset("/assets/sections/sports.jpg"), position: "78% 38%" },
  { test: /^\/app\/labs/, image: asset("/assets/sections/labs.jpg"), position: MID },
  { test: /^\/app\/ptm/, image: asset("/assets/sections/ptm.jpg"), position: FACE },
  { test: /^\/app\/alumni/, image: asset("/assets/sections/alumni.jpg"), position: FACE },
  { test: /^\/app\/hostel/, image: asset("/assets/sections/hostel.jpg"), position: BUILDING },
  { test: /^\/app\/canteen/, image: asset("/assets/sections/canteen.jpg"), position: "center 42%" },
];

const TITLE_HINTS: Array<{ test: RegExp; image: string; position?: string }> = [
  { test: /library/i, image: asset("/assets/sections/library.jpg"), position: MID },
  { test: /sport/i, image: asset("/assets/sections/sports.jpg"), position: GROUND },
  { test: /lab/i, image: asset("/assets/sections/labs.jpg"), position: MID },
  { test: /bus|transport/i, image: asset("/assets/sections/transport.jpg"), position: GROUND },
  { test: /fee|invoice|payment|finance/i, image: asset("/assets/sections/fees.jpg"), position: MID },
  { test: /exam|mark|result/i, image: asset("/assets/sections/exams.jpg"), position: FACE },
  { test: /homework|study/i, image: asset("/assets/sections/homework.jpg"), position: FACE },
  { test: /attend/i, image: asset("/assets/sections/attendance.jpg"), position: FACE },
  { test: /teacher/i, image: asset("/assets/sections/teachers.jpg"), position: FACE },
  { test: /guardian|parent/i, image: asset("/assets/sections/parents.jpg"), position: FACE },
  { test: /student/i, image: asset("/assets/sections/students.jpg"), position: FACE },
  { test: /admission|enquir|application/i, image: asset("/assets/sections/admissions.jpg"), position: FACE },
  { test: /event/i, image: asset("/assets/sections/events.jpg"), position: FACE },
  { test: /hostel/i, image: asset("/assets/sections/hostel.jpg"), position: BUILDING },
  { test: /canteen|cafeteria/i, image: asset("/assets/sections/canteen.jpg"), position: MID },
  { test: /report|analytic/i, image: asset("/assets/sections/reports.jpg"), position: MID },
  { test: /campus|branch/i, image: asset("/assets/sections/branches.jpg"), position: BUILDING },
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
  return { image: asset("/assets/campuses/dusk.jpg"), position: BUILDING };
}

export function sectionImageForPath(pathname?: string | null, title?: string | null) {
  return sectionVisualForPath(pathname, title).image;
}
