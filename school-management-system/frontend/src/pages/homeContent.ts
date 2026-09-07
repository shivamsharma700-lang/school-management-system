export const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/academics", label: "Academics" },
  { to: "/admissions", label: "Admissions" },
  { to: "/campus", label: "Campus" },
  { to: "/student-life", label: "Student Life" },
  { to: "/sports", label: "Sports" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/transport", label: "Transport" },
  { to: "/contact", label: "Contact" },
] as const;

export const VALUES = [
  { title: "Academic excellence", body: "Rigorous classroom teaching, from first phonics to senior-secondary boards, with teachers who know every child." },
  { title: "Holistic development", body: "Arts, sport, service and leadership sit beside the timetable — not as extras, but as the school day." },
  { title: "Leadership", body: "Prefects, houses and student councils practise responsibility long before they leave the gates." },
  { title: "Global outlook", body: "Languages, exchange of ideas and a curriculum that prepares students for universities in India and abroad." },
];

export const PROGRAMMES = [
  { title: "Early Years", range: "Nursery · LKG · UKG", body: "Play-based classrooms, language-rich corners and a gentle first rhythm of school.", img: "/assets/sections/early-years.jpg" },
  { title: "Primary", range: "Classes I – V", body: "Foundations in literacy, numeracy and curiosity, with specialist art, music and sport.", img: "/assets/sections/classes.jpg" },
  { title: "Middle School", range: "Classes VI – VIII", body: "Subject depth, laboratories and a wider house programme as independence grows.", img: "/assets/sections/academics.jpg" },
  { title: "Secondary", range: "Classes IX – X", body: "Board preparation with pastoral care, co-curricular choice and study skills.", img: "/assets/sections/exams.jpg" },
  { title: "Senior Secondary", range: "Classes XI – XII", body: "Science, Commerce and Humanities pathways with university counselling.", img: "/assets/sections/admissions.jpg" },
];

export const FACILITIES = [
  { title: "Smart Classrooms", img: "/assets/sections/classes.jpg" },
  { title: "Library", img: "/assets/sections/library.jpg" },
  { title: "Science Labs", img: "/assets/sections/labs.jpg" },
  { title: "Computer Labs", img: "/assets/sections/computer.jpg" },
  { title: "Sports Facilities", img: "/assets/sections/sports.jpg" },
  { title: "Auditorium", img: "/assets/sections/auditorium.jpg" },
  { title: "Campus", img: "/assets/campuses/dusk.jpg" },
  { title: "Cafeteria", img: "/assets/sections/canteen.jpg" },
  { title: "Transport", img: "/assets/sections/transport.jpg" },
];

export const LIFE = [
  { title: "Sports", img: "/assets/sections/sports.jpg", body: "Football, basketball, athletics and swimming across eight campuses." },
  { title: "Arts", img: "/assets/sections/arts.jpg", body: "Music, dance, theatre and visual arts in dedicated studios." },
  { title: "Cultural activities", img: "/assets/sections/culture.jpg", body: "House festivals, language days and performing-arts evenings." },
  { title: "Clubs", img: "/assets/sections/clubs.jpg", body: "Debate, robotics, environment and literary societies." },
  { title: "Competitions", img: "/assets/sections/exams.jpg", body: "Inter-house and inter-school olympiads, quizzes and meets." },
  { title: "Field trips", img: "/assets/sections/field-trips.jpg", body: "Museums, ecology walks and senior study visits." },
  { title: "Events", img: "/assets/sections/events.jpg", body: "Investiture, annual day, sports carnival and national festivals." },
  { title: "Leadership", img: "/assets/sections/teachers.jpg", body: "Councils, prefects and peer mentoring." },
  { title: "Community", img: "/assets/sections/parents.jpg", body: "Service projects with families and neighbourhood partners." },
];

export const EVENTS = [
  { date: "10 Dec", year: "2026", title: "Term assessments begin", body: "Classes VI–XII sit the first terminal papers across all campuses.", img: "/assets/sections/exams.jpg" },
  { date: "12 Dec", year: "2026", title: "Parent–teacher meeting", body: "Families meet class teachers for the mid-year pastoral review.", img: "/assets/sections/parents.jpg" },
  { date: "16 Dec", year: "2026", title: "Annual sports heats", body: "Junior-wing athletics and house relays on the main ground.", img: "/assets/sections/sports.jpg" },
  { date: "25 Dec", year: "2026", title: "Winter break", body: "The school closes for the festive fortnight. Term 2 resumes in January.", img: "/assets/campuses/dusk.jpg" },
];

export const TOPPERS = [
  { name: "Aarav Sharma", klass: "XII Science", score: "98.4%", note: "CBSE · Demo result card" },
  { name: "Ananya Verma", klass: "XII Commerce", score: "97.8%", note: "CBSE · Demo result card" },
  { name: "Vihaan Kapoor", klass: "X", score: "98.2%", note: "CBSE · Demo result card" },
  { name: "Myra Singh", klass: "X", score: "97.6%", note: "CBSE · Demo result card" },
];

export const AWARDS = [
  { title: "Inter-NCR basketball", body: "Senior girls finished as runners-up in the winter invitational." },
  { title: "Science congress", body: "Middle-school teams presented water-conservation prototypes." },
  { title: "Music ensemble", body: "The choir represented the school at a city festival of schools." },
];

export const GALLERY = [
  { src: "/assets/sections/arts.jpg", label: "Arts" },
  { src: "/assets/campuses/dusk.jpg", label: "Campus at dusk", span: "wide" },
  { src: "/assets/sections/students.jpg", label: "Students", span: "tall" },
  { src: "/assets/sections/sports.jpg", label: "Sports" },
  { src: "/assets/sections/library.jpg", label: "Library" },
  { src: "/assets/sections/labs.jpg", label: "Laboratories" },
  { src: "/assets/sections/classes.jpg", label: "Classrooms", span: "wide" },
  { src: "/assets/sections/events.jpg", label: "Events" },
  { src: "/assets/sections/teachers.jpg", label: "Faculty" },
  { src: "/assets/campuses/main.jpg", label: "Main Campus" },
  { src: "/assets/sections/transport.jpg", label: "Transport" },
  { src: "/assets/campuses/noida.jpg", label: "Noida grounds" },
  { src: "/assets/sections/canteen.jpg", label: "Cafeteria" },
];

export const STEPS = [
  { n: "01", title: "Register", body: "Share the child’s details and preferred campus for 2026–27." },
  { n: "02", title: "Assessment", body: "Age-appropriate interaction or written paper, depending on class." },
  { n: "03", title: "Offer", body: "A place is confirmed in writing, with fee and document lists." },
  { n: "04", title: "Enrol", body: "Complete admission in the School Portal and collect the kit." },
];
