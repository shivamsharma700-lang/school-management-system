// DEMO DATA ONLY — REMOVE/REPLACE WHEN REAL API IS AVAILABLE
export const demoEvents = [
  { id: "e1", date: "10 Dec", title: "Term 1 Assessment begins", type: "Exam", audience: "Classes VI–XII" },
  { id: "e2", date: "12 Dec", title: "Parent-teacher meeting", type: "Meeting", audience: "All campuses" },
  { id: "e3", date: "16 Dec", title: "Annual sports heats", type: "Event", audience: "Junior wing" },
  { id: "e4", date: "25 Dec", title: "Winter break", type: "Holiday", audience: "School-wide" },
];

export const demoAdmissions = [
  { id: "a1", name: "Kabir Malhotra", className: "VI", campus: "Touch Wood Main Campus", when: "2 hours ago", status: "OFFERED" },
  { id: "a2", name: "Sara Nair", className: "I", campus: "Touch Wood Junior Campus", when: "5 hours ago", status: "INTERVIEW" },
  { id: "a3", name: "Ishaan Bose", className: "IX", campus: "Touch Wood East Campus", when: "Yesterday", status: "APPLIED" },
  { id: "a4", name: "Diya Reddy", className: "Nursery", campus: "Touch Wood North Campus", when: "Yesterday", status: "ENROLLED" },
  { id: "a5", name: "Reyansh Jain", className: "XI Sci", campus: "Touch Wood South Campus", when: "2 days ago", status: "TEST" },
];

export const demoRecentPayments = [
  { id: "p1", name: "Aarav Sharma", amount: "₹ 45,000", when: "Today, 9:12 AM", status: "PAID" },
  { id: "p2", name: "Ananya Verma", amount: "₹ 22,500", when: "Today, 8:40 AM", status: "PAID" },
  { id: "p3", name: "Vihaan Kapoor", amount: "₹ 48,500", when: "Yesterday", status: "PAID" },
];

export const demoEnrollment = [
  { name: "Apr", y1: 410, y2: 448 },
  { name: "May", y1: 422, y2: 460 },
  { name: "Jun", y1: 418, y2: 455 },
  { name: "Jul", y1: 430, y2: 472 },
  { name: "Aug", y1: 441, y2: 481 },
  { name: "Sep", y1: 438, y2: 490 },
];

export const demoAttendanceMix = [
  { name: "Present", value: 94, color: "#3A3A45" },
  { name: "Absent", value: 3, color: "#e11d48" },
  { name: "Late", value: 2, color: "#d97706" },
  { name: "Leave", value: 1, color: "#0284c7" },
];

export const demoEnquiries = [
  { id: "q1", name: "Rohit Khanna", classFor: "VI", campus: "Main", status: "OPEN", date: "2026-09-04" },
  { id: "q2", name: "Nandini Iyer", classFor: "I", campus: "Junior", status: "SCHEDULED", date: "2026-09-05" },
];

export const demoApplications = [
  { id: "ap1", ref: "APP-24091", student: "Kabir Malhotra", className: "VI", status: "REVIEW" },
  { id: "ap2", ref: "APP-24088", student: "Sara Nair", className: "I", status: "INTERVIEW" },
];

export const demoInventory = [
  { id: "INV-1022", category: "IT", item: "Projector Epson", branch: "Main", location: "Lab 2", status: "IN_USE" },
  { id: "INV-0881", category: "Furniture", item: "Lab stools (24)", branch: "East", location: "Store", status: "STOCK" },
];

export const demoPayroll = [
  { id: "pr1", name: "Rohan Mehta", department: "Academics", month: "Aug 2026", status: "PAID", amount: "₹ 86,400" },
  { id: "pr2", name: "Priya Sharma", department: "Academics", month: "Aug 2026", status: "PAID", amount: "₹ 82,100" },
];

export const demoHealth = [
  { id: "h1", student: "Aarav Sharma", visit: "Seasonal cold", date: "2026-08-21", nurse: "Ms. Lata" },
  { id: "h2", student: "Myra Singh", visit: "Sports sprain", date: "2026-08-12", nurse: "Ms. Lata" },
];

export const demoDiscipline = [
  { id: "d1", student: "Vihaan Kapoor", incident: "Late to assembly", action: "Counsellor note", date: "2026-08-18" },
];

export const demoDocuments = [
  { id: "doc1", name: "Aarav Sharma — Birth certificate", type: "Admission", status: "VERIFIED" },
  { id: "doc2", name: "Transfer certificate template", type: "School", status: "ACTIVE" },
];

export const demoLms = [
  { id: "l1", title: "Photosynthesis — Class VIII", type: "Lesson", subject: "Science" },
  { id: "l2", title: "Quadratic equations worksheet", type: "Assignment", subject: "Mathematics" },
];

export const demoSports = [
  { id: "sp1", team: "U-14 Football", coach: "Kabir Ahuja", next: "Inter-house 12 Sep" },
  { id: "sp2", team: "Senior Basketball", coach: "Neha Kapoor", next: "Practice daily 3:30" },
];

export const demoLabs = [
  { id: "lb1", name: "Physics Lab", campus: "Main", status: "OPEN", next: "Class X — 10:40" },
  { id: "lb2", name: "Computer Lab 1", campus: "East", status: "MAINTENANCE", next: "—" },
];

export const demoPtm = [
  { id: "pt1", teacher: "Rohan Mehta", slot: "Sat 09:00", parent: "Sanjay Sharma", status: "BOOKED" },
  { id: "pt2", teacher: "Priya Sharma", slot: "Sat 09:20", parent: "Open", status: "OPEN" },
];

export const demoAlumni = [
  { id: "al1", name: "Meera Joshi", batch: "2014", profession: "Architect", campus: "Main" },
  { id: "al2", name: "Arjun Sen", batch: "2011", profession: "Public policy", campus: "East" },
];

export const demoPromotions = [
  { id: "pr1", student: "Aarav Sharma", from: "VII-A", to: "VIII-A", status: "READY" },
  { id: "pr2", student: "Ananya Verma", from: "VII-A", to: "VIII-A", status: "READY" },
];

export const demoTransfers = [
  { id: "tc1", student: "Demo student (Riya)", from: "East", to: "Main", status: "PENDING" },
];
