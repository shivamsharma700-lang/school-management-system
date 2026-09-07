// DEMO DATA ONLY — REMOVE/REPLACE WHEN REAL API IS AVAILABLE
export const demoHomework = [
  { id: "demo-hw-1", title: "Quadratic equations worksheet", description: "Complete exercise 4.2, Q1–Q12.", dueDate: "2026-09-08", subject: "Mathematics", teacher: "Rohan Mehta", status: "PENDING" },
  { id: "demo-hw-2", title: "Letter to the editor", description: "Draft 180 words on water conservation.", dueDate: "2026-09-10", subject: "English", teacher: "Priya Sharma", status: "UPCOMING" },
];

export const demoTimetable = [
  { id: "1", dayOfWeek: 1, startTime: "08:00", endTime: "08:45", subject: "Mathematics", room: "B-12" },
  { id: "2", dayOfWeek: 1, startTime: "08:50", endTime: "09:35", subject: "English", room: "B-12" },
  { id: "3", dayOfWeek: 1, startTime: "09:50", endTime: "10:35", subject: "Science", room: "Lab-2" },
  { id: "4", dayOfWeek: 1, startTime: "10:40", endTime: "11:25", subject: "Hindi", room: "B-12" },
  { id: "5", dayOfWeek: 1, startTime: "11:40", endTime: "12:25", subject: "Social Science", room: "B-12" },
  { id: "6", dayOfWeek: 2, startTime: "08:00", endTime: "08:45", subject: "Social Science", room: "B-12" },
  { id: "7", dayOfWeek: 2, startTime: "08:50", endTime: "09:35", subject: "Mathematics", room: "B-12" },
  { id: "8", dayOfWeek: 2, startTime: "09:50", endTime: "10:35", subject: "English", room: "B-12" },
  { id: "9", dayOfWeek: 2, startTime: "10:40", endTime: "11:25", subject: "Computer", room: "Lab-1" },
  { id: "10", dayOfWeek: 3, startTime: "08:00", endTime: "08:45", subject: "Science", room: "Lab-2" },
  { id: "11", dayOfWeek: 3, startTime: "08:50", endTime: "09:35", subject: "Mathematics", room: "B-12" },
  { id: "12", dayOfWeek: 3, startTime: "09:50", endTime: "10:35", subject: "Art", room: "Studio" },
  { id: "13", dayOfWeek: 4, startTime: "08:00", endTime: "08:45", subject: "English", room: "B-12" },
  { id: "14", dayOfWeek: 4, startTime: "08:50", endTime: "09:35", subject: "Physical Education", room: "Ground" },
  { id: "15", dayOfWeek: 4, startTime: "09:50", endTime: "10:35", subject: "Mathematics", room: "B-12" },
  { id: "16", dayOfWeek: 5, startTime: "08:00", endTime: "08:45", subject: "Science", room: "Lab-2" },
  { id: "17", dayOfWeek: 5, startTime: "08:50", endTime: "09:35", subject: "Hindi", room: "B-12" },
  { id: "18", dayOfWeek: 5, startTime: "09:50", endTime: "10:35", subject: "Library", room: "LIB" },
];

export const demoNotices = [
  { id: "demo-n-1", title: "Independence Day assembly", body: "Students to assemble in the amphitheatre at 7:40 AM in house colours.", audienceType: "SCHOOL", createdAt: new Date().toISOString() },
  { id: "demo-n-2", title: "PTM — Classes VI to VIII", body: "Parent-teacher meeting this Saturday, 9:00 AM to 12:30 PM.", audienceType: "BRANCH", createdAt: new Date().toISOString() },
];

export const demoLeave = [
  { id: "demo-lv-1", leaveType: "SICK", startDate: "2026-09-09", endDate: "2026-09-10", reason: "Seasonal fever", status: "PENDING", requester: "Sanjay Sharma", student: "Aarav Sharma", createdAt: new Date().toISOString() },
];

export const demoLibrary = [
  { id: "demo-bk-1", title: "The Hidden Life of Trees", copyCode: "LIB-3321", status: "AVAILABLE" },
  { id: "demo-bk-2", title: "NCERT Mathematics VIII", copyCode: "LIB-1180", status: "ISSUED" },
];

export const demoDashboard = {
  students: 4240,
  teachers: 96,
  staff: 312,
  staffMembers: 216,
  pendingInvoices: 186,
  unreadNotifications: 0,
  role: "SUPER_ADMIN",
  branches: 8,
  attendanceToday: 94.1,
  attendancePercent: 94.1,
  feeCollected: 290300000,
  feeTotal: 366500000,
  todayCollected: 0,
  overdueInvoices: 0,
  feeCollection: 1.24,
  newAdmissions: 38,
  activeBuses: 21,
  openComplaints: 6,
  pendingLeave: 11,
};
