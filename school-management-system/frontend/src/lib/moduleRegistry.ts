/**
 * Live vs demo module registry (Phase 0–18).
 */

export type ModuleStatus = "LIVE_API" | "PARTIAL_API" | "UI_ONLY_DEMO" | "PORTAL_DEMO" | "STATIC_CONTENT";

export type ModuleEntry = {
  path: string;
  label: string;
  status: ModuleStatus;
  notes: string;
};

export const MODULE_REGISTRY: ModuleEntry[] = [
  { path: "/app/dashboard", label: "Dashboard", status: "LIVE_API", notes: "Role dashboards; KPIs from /api/dashboard (+ analytics)" },
  { path: "/app/branches", label: "Branches", status: "LIVE_API", notes: "/api/branches" },
  { path: "/app/users", label: "Users & Roles", status: "LIVE_API", notes: "/api/users" },
  { path: "/app/academic-years", label: "Academic Years", status: "LIVE_API", notes: "/api/academic-years" },
  { path: "/app/classes", label: "Classes & sections", status: "LIVE_API", notes: "/api/classes" },
  { path: "/app/subjects", label: "Subjects", status: "LIVE_API", notes: "/api/subjects" },
  { path: "/app/students", label: "Students", status: "LIVE_API", notes: "/api/students + workspace" },
  { path: "/app/guardians", label: "Parents & Guardians", status: "LIVE_API", notes: "GET/POST /api/guardians" },
  { path: "/app/teachers", label: "Teachers", status: "LIVE_API", notes: "/api/staff" },
  { path: "/app/staff", label: "Staff", status: "LIVE_API", notes: "/api/staff" },
  { path: "/app/timetable", label: "Timetable", status: "LIVE_API", notes: "/api/timetable" },
  { path: "/app/attendance", label: "Student attendance", status: "LIVE_API", notes: "/api/attendance" },
  { path: "/app/homework", label: "Homework", status: "LIVE_API", notes: "/api/homework" },
  { path: "/app/exams", label: "Exams", status: "LIVE_API", notes: "/api/exams" },
  { path: "/app/marks", label: "Marks / Results", status: "LIVE_API", notes: "/api/exams + /api/report-cards" },
  { path: "/app/fees", label: "Fee Structures", status: "LIVE_API", notes: "/api/fee-structures" },
  { path: "/app/invoices", label: "Student Fees", status: "LIVE_API", notes: "/api/invoices" },
  { path: "/app/payments", label: "Payments", status: "LIVE_API", notes: "GET/POST payments + ledger + offline confirm" },
  { path: "/app/receipts", label: "Receipts", status: "LIVE_API", notes: "GET /api/receipts" },
  { path: "/app/pending-fees", label: "Pending fees", status: "LIVE_API", notes: "GET /api/invoices?status=PENDING" },
  { path: "/app/library", label: "Library", status: "LIVE_API", notes: "Catalogue add/issue/return" },
  { path: "/app/transport", label: "Transport", status: "LIVE_API", notes: "/api/transport/my + routes/trips + GPS pings" },
  { path: "/app/notices", label: "Notices", status: "LIVE_API", notes: "/api/notices" },
  { path: "/app/notifications", label: "Notifications", status: "LIVE_API", notes: "/api/notifications" },
  { path: "/app/complaints", label: "Complaints", status: "LIVE_API", notes: "/api/complaints" },
  { path: "/app/leave", label: "Leave", status: "LIVE_API", notes: "/api/leave" },
  { path: "/app/leave-approvals", label: "Leave approvals", status: "LIVE_API", notes: "/api/leave review" },
  { path: "/app/reports", label: "Reports", status: "LIVE_API", notes: "Summary + CSV spreadsheet exports" },
  { path: "/app/analytics", label: "Analytics", status: "LIVE_API", notes: "Dashboard + enrollment + finance KPIs" },
  { path: "/app/audit", label: "Audit Logs", status: "LIVE_API", notes: "/api/audit-logs" },
  { path: "/app/settings", label: "Settings", status: "LIVE_API", notes: "/api/settings workspace flags" },
  { path: "/app/children", label: "My children", status: "LIVE_API", notes: "Scoped /api/students" },
  { path: "/app/enquiries", label: "Enquiries", status: "LIVE_API", notes: "/api/admissions/enquiries" },
  { path: "/app/applications", label: "Applications", status: "LIVE_API", notes: "/api/admissions/applications" },
  { path: "/app/entrance-tests", label: "Entrance tests", status: "LIVE_API", notes: "/api/campus-records?type=ENTRANCE_TEST" },
  { path: "/app/interviews", label: "Interviews", status: "LIVE_API", notes: "/api/campus-records?type=INTERVIEW" },
  { path: "/app/admissions", label: "Admissions", status: "LIVE_API", notes: "Pipeline from applications + enroll" },
  { path: "/app/promotions", label: "Promotions", status: "LIVE_API", notes: "/api/campus-records?type=PROMOTION" },
  { path: "/app/transfers", label: "Transfer / TC", status: "LIVE_API", notes: "/api/campus-records?type=TRANSFER" },
  { path: "/app/documents", label: "Documents", status: "LIVE_API", notes: "Hub to student docs + /api/files" },
  { path: "/app/events", label: "Events", status: "LIVE_API", notes: "/api/events CRUD" },
  { path: "/app/inventory", label: "Inventory", status: "LIVE_API", notes: "/api/inventory CRUD (V5)" },
  { path: "/app/hr", label: "HR & Payroll", status: "LIVE_API", notes: "Staff + /api/payroll" },
  { path: "/app/health", label: "Health", status: "LIVE_API", notes: "/api/campus-records?type=HEALTH" },
  { path: "/app/discipline", label: "Discipline", status: "LIVE_API", notes: "/api/campus-records?type=DISCIPLINE" },
  { path: "/app/sports", label: "Sports", status: "LIVE_API", notes: "/api/campus-records?type=SPORTS" },
  { path: "/app/labs", label: "Labs", status: "LIVE_API", notes: "/api/campus-records?type=LAB" },
  { path: "/app/ptm", label: "PTM", status: "LIVE_API", notes: "/api/campus-records?type=PTM" },
  { path: "/app/alumni", label: "Alumni", status: "LIVE_API", notes: "/api/campus-records?type=ALUMNI" },
  { path: "/app/website-content", label: "Website content", status: "STATIC_CONTENT", notes: "Frontend content inventory only" },
  { path: "/app/bus-tracking", label: "Bus Tracking", status: "LIVE_API", notes: "Trip GPS via /api/transport/trips/{id}/locations" },
  { path: "/app/staff-attendance", label: "Staff attendance", status: "LIVE_API", notes: "/api/staff-attendance" },
  { path: "/app/attendance-reports", label: "Attendance reports", status: "LIVE_API", notes: "/api/attendance/report + summary" },
  { path: "/app/communication", label: "Notices hub", status: "LIVE_API", notes: "Hub to notices/complaints/notifications — no chat in v1" },
  { path: "/app/study-materials", label: "Study materials", status: "LIVE_API", notes: "Homework + /api/study-papers workflow" },
  { path: "/app/tasks", label: "Teacher tasks", status: "LIVE_API", notes: "/api/teacher-tasks" },
];

export const DEMO_ONLY_PATHS = new Set(
  MODULE_REGISTRY.filter((m) => m.status === "UI_ONLY_DEMO" || m.status === "PORTAL_DEMO" || m.status === "STATIC_CONTENT").map(
    (m) => m.path
  )
);

export function moduleStatusForPath(pathname: string): ModuleEntry | undefined {
  const path = pathname.split("?")[0].replace(/\/$/, "");
  return MODULE_REGISTRY.find((m) => path === m.path || path.startsWith(`${m.path}/`));
}
