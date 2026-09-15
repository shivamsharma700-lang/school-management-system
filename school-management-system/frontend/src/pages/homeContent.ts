import { SITE_MEDIA } from "../lib/schoolMedia";

/** Public navigation — school website, not portfolio. */
export const NAV = [
  { to: "/about", label: "About" },
  { to: "/academics", label: "Academics" },
  { to: "/campus", label: "Campus" },
  { to: "/student-life", label: "Student Life" },
  { to: "/sports", label: "Sports" },
  { to: "/events", label: "Events" },
  { to: "/admissions", label: "Admissions" },
  { to: "/contact", label: "Contact" },
] as const;

export const SCHOOL_FACTS = {
  name: "Touch Wood High Public School",
  board: "CBSE",
  type: "Co-educational day school",
  classes: "Nursery to Class XII",
  established: "1998",
  campuses: "8 campuses across Delhi-NCR",
  medium: "English",
  affiliation: "Central Board of Secondary Education",
  schoolCode: "TWHPS-NCR (demo directory)",
  timings: "Monday–Friday · 7:50 a.m. – 2:10 p.m. (junior & senior shifts vary by campus)",
  officeHours: "Monday–Friday · 8:30 a.m. – 3:30 p.m.",
  address: "Mathura Road, New Delhi — with sister campuses across Delhi-NCR",
  phone: "011-4300-1000",
  admissionsPhone: "011-4300-1000",
  email: "admissions.demo@touchwood.edu.in",
  principal: "Dr. Kavita Sharma",
  principalTitle: "Principal",
} as const;

export const QUICK_INFO = [
  { label: "Board", value: "CBSE" },
  { label: "Classes", value: "Nursery–XII" },
  { label: "School type", value: "Co-ed day school" },
  { label: "Established", value: "1998" },
  { label: "Campuses", value: "8 · Delhi-NCR" },
  { label: "Admissions desk", value: "011-4300-1000" },
] as const;

export const VALUES = [
  {
    title: "Academic excellence",
    body: "Continuous classroom teaching, formative assessment and board preparation from the primary years through Classes X and XII.",
  },
  {
    title: "Pastoral care",
    body: "Class teachers, counsellors and house tutors track attendance, wellbeing and parent communication for every child on roll.",
  },
  {
    title: "Co-curricular balance",
    body: "Sports, arts, clubs and community service are scheduled inside the school week, not treated as optional afterthoughts.",
  },
  {
    title: "Values & leadership",
    body: "House systems, prefects and student councils practise responsibility, service and respectful conduct across campuses.",
  },
];

export const VISION =
  "To educate children who think clearly, work diligently and act with integrity — prepared for university, work and citizenship in India and abroad.";

export const MISSION =
  "To provide a safe, disciplined CBSE learning environment with rigorous teaching, modern facilities and close partnership with parents across our Delhi-NCR campuses.";

export const PRINCIPAL_MESSAGE = {
  name: SCHOOL_FACTS.principal,
  title: SCHOOL_FACTS.principalTitle,
  image: SITE_MEDIA.principalImage,
  excerpt:
    "Each academic year begins with a simple expectation: every child who enters our gates should feel known, challenged and safe. Our teachers plan lessons carefully; our houses build belonging; our parents remain partners in the journey from Nursery to Class XII.",
  body: "Touch Wood High Public School follows the CBSE curriculum with equal emphasis on classroom learning, sports, arts and character. We welcome families who seek steady academic progress, clear communication and a campus culture of respect.",
};

export const PROGRAMMES = [
  {
    title: "Early Years",
    range: "Nursery · LKG · UKG",
    body: "Play-based classrooms with phonics, number sense, motor skills and a gentle first rhythm of school routines.",
    subjects: "Language · Numeracy · Art · Music · Outdoor play",
    approach: "Observation-based assessment; small-group activity corners",
    img: SITE_MEDIA.earlyYearsImage,
  },
  {
    title: "Primary",
    range: "Classes I – V",
    body: "Foundations in literacy, numeracy, EVS and languages, with specialist periods for art, music, PE and library.",
    subjects: "English · Hindi · Mathematics · EVS · Computer · Art · PE",
    approach: "Continuous assessment with term reports shared in the School Portal",
    img: SITE_MEDIA.primaryImage,
  },
  {
    title: "Middle School",
    range: "Classes VI – VIII",
    body: "Subject depth begins in earnest: laboratories, project work, house activities and study skills workshops.",
    subjects: "Languages · Mathematics · Science · Social Science · ICT · Third language",
    approach: "Unit tests, practicals and mid-year parent–teacher meetings",
    img: SITE_MEDIA.middleImage,
  },
  {
    title: "Secondary",
    range: "Classes IX – X",
    body: "Structured CBSE board preparation with remedial support, career awareness sessions and co-curricular choice.",
    subjects: "As per CBSE secondary scheme including skill electives where offered",
    approach: "Pre-board examinations, counselling and attendance monitoring",
    img: SITE_MEDIA.secondaryImage,
  },
  {
    title: "Senior Secondary",
    range: "Classes XI – XII",
    body: "Science, Commerce and Humanities streams with laboratory work, project files and university counselling.",
    subjects: "PCM / PCB · Commerce · Humanities · Physical Education · elective labs",
    approach: "Board-focused timetable, PTMs and higher-education guidance",
    img: SITE_MEDIA.seniorImage,
  },
];

export const DEPARTMENTS = [
  { name: "Languages", head: "English, Hindi & third-language faculty", focus: "Reading, writing, oracy and literature across stages" },
  { name: "Mathematics", head: "Primary to senior mathematics", focus: "Concept mastery, problem-solving and board practice" },
  { name: "Sciences", head: "Physics, Chemistry, Biology", focus: "Laboratory enquiry and CBSE practical files" },
  { name: "Social Sciences", head: "History, Geography, Political Science, Economics", focus: "Inquiry projects and map work" },
  { name: "Computer Science & ICT", head: "Computer labs", focus: "Digital literacy, coding foundations and ICT applications" },
  { name: "Physical Education", head: "Sports department", focus: "Fitness, team sports and annual athletics" },
];

export const FACULTY_SPOTLIGHT = [
  { name: "Ms. Kavita Rao", role: "Senior Teacher · English", dept: "Languages", qual: "M.A. English · B.Ed.", img: SITE_MEDIA.facultyImage },
  { name: "Mr. Rohan Mehta", role: "PGT · Physics", dept: "Sciences", qual: "M.Sc. Physics · B.Ed.", img: SITE_MEDIA.laboratoryImage },
  { name: "Ms. Ananya Iyer", role: "TGT · Mathematics", dept: "Mathematics", qual: "M.Sc. Mathematics · B.Ed.", img: SITE_MEDIA.academicImage },
  { name: "Mr. Sameer Khan", role: "Sports Coach", dept: "Physical Education", qual: "B.P.Ed. · NIS certification", img: SITE_MEDIA.athleticsImage },
];

export const FACILITIES = [
  {
    title: "Smart classrooms",
    img: SITE_MEDIA.primaryImage,
    body: "Interactive boards, subject content libraries and seating arranged for focused teaching.",
    features: ["Interactive display", "Subject content packs", "Attendance linked to sections"],
  },
  {
    title: "Library",
    img: SITE_MEDIA.libraryImage,
    body: "Reading floors, reference sections and supervised research desks for middle and senior students.",
    features: ["Fiction & reference", "Periodical racks", "Issue desk via School Portal"],
  },
  {
    title: "Science laboratories",
    img: SITE_MEDIA.laboratoryImage,
    body: "Separate Physics, Chemistry and Biology labs for Classes VI–XII practical work.",
    features: ["Safety protocols", "CBSE practical apparatus", "Lab records"],
  },
  {
    title: "Computer laboratories",
    img: SITE_MEDIA.computerLabImage,
    body: "ICT and Computer Science periods with supervised internet access and coding foundations.",
    features: ["Desktop labs", "ICT curriculum", "Project workstations"],
  },
  {
    title: "Sports facilities",
    img: SITE_MEDIA.sportsImage,
    body: "Fields and courts for athletics, football, basketball and house matches.",
    features: ["Main ground", "Basketball courts", "PE periods on timetable"],
  },
  {
    title: "Auditorium",
    img: SITE_MEDIA.auditoriumImage,
    body: "Assembly hall for morning prayer, annual day, guest lectures and cultural programmes.",
    features: ["Stage & seating", "AV support", "House events"],
  },
  {
    title: "Transport",
    img: SITE_MEDIA.transportImage,
    body: "Campus bus routes with attendants on junior shifts; route details in the parent portal.",
    features: ["Morning & afternoon shifts", "Route list by campus", "GPS demo in portal"],
  },
  {
    title: "Campus grounds",
    img: SITE_MEDIA.campusImage,
    body: "Courtyards, corridors and supervised open spaces between wings.",
    features: ["Secure entry", "Infirmary access", "Visitor protocols"],
  },
];

export const LIFE = [
  { title: "Arts & culture", img: SITE_MEDIA.cultureImage, body: "Music, dance, theatre and visual arts with annual day and house festivals.", schedule: "Weekly club slots + term showcases" },
  { title: "Clubs & societies", img: SITE_MEDIA.clubsImage, body: "Debate, robotics, environment, literary and community-service clubs.", schedule: "After mid-day break / activity periods" },
  { title: "House system", img: SITE_MEDIA.assemblyImage, body: "Four houses compete in sports, academics and cultural events through the year.", schedule: "House meetings on Fridays" },
  { title: "Leadership & service", img: SITE_MEDIA.studentLifeImage, body: "Prefects, class monitors and student council roles with teacher mentors.", schedule: "Leadership briefing each term" },
];

export const SPORTS_OFFERED = [
  { name: "Athletics & cricket", detail: "Track events, relays and the annual sports day", img: SITE_MEDIA.sportsImage },
  { name: "Football", detail: "Junior and senior inter-house leagues", img: SITE_MEDIA.footballImage },
  { name: "Basketball", detail: "Court practice and inter-school invitational teams", img: SITE_MEDIA.basketballImage },
  { name: "Yoga & fitness", detail: "Morning fitness and wellness sessions", img: SITE_MEDIA.yogaImage },
];

export const EVENTS = [
  {
    date: "10 Dec",
    year: "2026",
    title: "Term 1 assessments",
    location: "All campuses · Classes VI–XII",
    category: "Examinations",
    body: "First terminal written papers begin. Timetable is published on the School Portal notice board.",
    img: SITE_MEDIA.secondaryImage,
  },
  {
    date: "12 Dec",
    year: "2026",
    title: "Parent–teacher meeting",
    location: "Respective campuses",
    category: "Academic",
    body: "Class teachers share mid-year progress, attendance and next-term goals with families.",
    img: SITE_MEDIA.facultyImage,
  },
  {
    date: "16 Dec",
    year: "2026",
    title: "Annual sports heats",
    location: "Main ground · Junior wing",
    category: "Sports",
    body: "Athletics, relays and house marches for junior classes. Spectators register at the sports desk.",
    img: SITE_MEDIA.athleticsImage,
  },
  {
    date: "25 Dec",
    year: "2026",
    title: "Winter break begins",
    location: "School-wide",
    category: "Holiday",
    body: "The school closes for the festive fortnight. Term 2 reporting dates are shared with parents in advance.",
    img: SITE_MEDIA.campusDuskImage,
  },
];

export const NEWS = [
  {
    date: "8 Sep 2026",
    category: "Announcement",
    title: "Academic year 2025–26 mid-term circular",
    body: "Uniform checks, library return deadlines and bus route updates for all campuses are posted in the School Portal.",
    img: SITE_MEDIA.newsImage,
  },
  {
    date: "1 Sep 2026",
    category: "Academics",
    title: "Science practical schedule released",
    body: "Classes IX–XII practical slots for Physics, Chemistry and Biology are available under Examinations → Timetable.",
    img: SITE_MEDIA.laboratoryImage,
  },
  {
    date: "20 Aug 2026",
    category: "Admissions",
    title: "Nursery–Class VIII registration window",
    body: "Online enquiry for 2026–27 remains open. Shortlisted applicants receive assessment dates by email.",
    img: SITE_MEDIA.admissionsImage,
  },
];

export const TOPPERS = [
  { name: "Aarav Sharma", klass: "XII Science", score: "98.4%", note: "CBSE · Illustrative honour board (not live board data)" },
  { name: "Ananya Verma", klass: "XII Commerce", score: "97.8%", note: "CBSE · Illustrative honour board (not live board data)" },
  { name: "Vihaan Kapoor", klass: "X", score: "98.2%", note: "CBSE · Illustrative honour board (not live board data)" },
  { name: "Myra Singh", klass: "X", score: "97.6%", note: "CBSE · Illustrative honour board (not live board data)" },
];

export const AWARDS = [
  { title: "Inter-NCR basketball", body: "Senior girls finished as runners-up in the winter invitational." },
  { title: "Science congress", body: "Middle-school teams presented water-conservation prototypes." },
  { title: "Music ensemble", body: "The choir represented the school at a city festival of schools." },
];

export const GALLERY = [
  { src: SITE_MEDIA.galleryCampus, label: "Main campus entrance", span: undefined },
  { src: SITE_MEDIA.galleryClassroom, label: "Smart classroom", span: "wide" as const },
  { src: SITE_MEDIA.galleryStudents, label: "Students", span: "tall" as const },
  { src: SITE_MEDIA.gallerySports, label: "Sports field", span: undefined },
  { src: SITE_MEDIA.galleryLibrary, label: "Library", span: undefined },
  { src: SITE_MEDIA.galleryLab, label: "Science laboratory", span: undefined },
  { src: SITE_MEDIA.galleryLesson, label: "Classroom learning", span: "wide" as const },
  { src: SITE_MEDIA.galleryEvents, label: "Morning assembly", span: undefined },
  { src: SITE_MEDIA.galleryFaculty, label: "Faculty", span: undefined },
  { src: SITE_MEDIA.galleryArts, label: "Arts programme", span: undefined },
  { src: SITE_MEDIA.galleryBus, label: "School transport", span: undefined },
  { src: SITE_MEDIA.galleryEast, label: "East Delhi campus", span: undefined },
];

export const STEPS = [
  { n: "01", title: "Online enquiry", body: "Submit child details, preferred class and campus for academic year 2026–27." },
  { n: "02", title: "Document check", body: "Birth certificate, previous report card and address proof as listed in the prospectus." },
  { n: "03", title: "Assessment / interaction", body: "Age-appropriate interaction (Early Years) or written assessment (Primary upwards)." },
  { n: "04", title: "Offer & enrolment", body: "Offer letter, fee schedule and portal enrolment to confirm the seat." },
];

export const FEE_NOTES = [
  { title: "Tuition", detail: "Charged term-wise as per campus fee structure published in the School Portal." },
  { title: "Transport", detail: "Optional; billed by route distance where the child uses school buses." },
  { title: "Activity / lab", detail: "Applied where laboratories, sports academies or special programmes are opted." },
  { title: "Payment", detail: "Online payment and receipts are available to parents after login." },
];

export const CALENDAR_HIGHLIGHTS = [
  { when: "Apr 2026", what: "New session begins · Orientation for Nursery–I" },
  { when: "Jul 2026", what: "First unit tests · House induction" },
  { when: "Sep 2026", what: "Mid-term assessments · PTM" },
  { when: "Dec 2026", what: "Term examinations · Winter break" },
  { when: "Feb–Mar 2027", what: "Annual examinations · Result declaration" },
];

export const STATS = [
  { to: 4240, suffix: "+", label: "Students on roll", hint: "Across eight campuses" },
  { to: 200, suffix: "+", label: "Faculty & staff", hint: "Teaching and support" },
  { to: 8, suffix: "", label: "Campuses", hint: "Delhi-NCR" },
  { to: 120, suffix: "+", label: "Sections", hint: "Nursery–XII" },
  { to: 25, suffix: "+", label: "Years", hint: "Serving families" },
];

export const TESTIMONIALS = [
  {
    quote: "Class teachers reply on the portal, share attendance and keep homework visible. That transparency matters to working parents.",
    name: "Priya Nair",
    role: "Parent · Class IV · North Campus",
  },
  {
    quote: "Board preparation was organised — pre-boards, practicals and counselling — without treating Class XII as a panic year.",
    name: "Kabir Mehta",
    role: "Alumnus · Class of 2024",
  },
  {
    quote: "Sports and academics share the same timetable language. Our son’s PE coach and class teacher actually speak to each other.",
    name: "Anika Bose",
    role: "Parent · Class IX · Main Campus",
  },
];

export const FAQS = [
  {
    q: "Which board does the school follow?",
    a: "CBSE from Nursery through Class XII, with Science, Commerce and Humanities streams in the senior years.",
  },
  {
    q: "How do I apply for 2026–27?",
    a: "Submit an enquiry from the Admissions page or School Portal. Shortlisted applicants receive assessment dates by email and SMS.",
  },
  {
    q: "Is transport GPS live?",
    a: "Route assignments are live in the parent portal. Live GPS tracking is shown as a labelled demonstration until fleet telemetry is connected.",
  },
  {
    q: "Can I tour the campus before applying?",
    a: "Yes. Book a campus visit through Admissions (Mon–Fri). A virtual campus tour is also available on this website.",
  },
  {
    q: "Where do I see fees and receipts?",
    a: "Parents sign in to the School Portal → Fees / Invoices to view structures, pending dues and downloadable receipts.",
  },
];

/** Website content inventory for the admin Website Content module (frontend-managed until CMS APIs exist). */
export const WEBSITE_CONTENT_BLOCKS = [
  { id: "hero", title: "Homepage hero", fields: ["School name", "Introduction", "Admissions CTA", "heroImage"], media: "heroImage" },
  { id: "about", title: "About the school", fields: ["Description", "Vision", "Mission", "aboutImage"], media: "aboutImage" },
  { id: "principal", title: "Principal’s message", fields: ["Name", "Title", "Message", "principalImage"], media: "principalImage" },
  { id: "academics", title: "Academic programmes", fields: ["Early Years–Senior Secondary", "Subjects", "Approach"], media: "academicImage" },
  { id: "facilities", title: "Facilities", fields: ["Library", "Labs", "Sports", "Auditorium", "Transport"], media: "libraryImage" },
  { id: "events", title: "Events calendar", fields: ["Title", "Date", "Location", "Description", "eventImage"], media: "eventImage" },
  { id: "news", title: "News & announcements", fields: ["Title", "Date", "Category", "Body", "newsImage"], media: "newsImage" },
  { id: "gallery", title: "Gallery", fields: ["Caption", "Image", "Category"], media: "galleryCampus" },
  { id: "admissions", title: "Admissions", fields: ["Process steps", "Eligibility", "Dates", "Enquiry"], media: "admissionsImage" },
  { id: "contact", title: "Contact", fields: ["Address", "Phone", "Email", "Timings"], media: "campusImage" },
] as const;
