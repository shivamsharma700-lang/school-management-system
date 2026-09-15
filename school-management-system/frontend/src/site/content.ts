/**
 * Marketing copy and data for the public product site.
 *
 * Rule followed throughout: nothing here invents a customer, a school count, a
 * rating or a testimonial. Claims are capability statements about what the
 * application actually does, and the module list is derived from
 * `lib/moduleRegistry`, which tracks real API coverage.
 */
import {
  Album, BarChart3, Bell, BookOpen, Bus, CalendarDays, ClipboardCheck, CreditCard,
  FileText, FlaskConical, GraduationCap, Landmark, LayoutDashboard, LifeBuoy, Lock,
  MessageSquare, Package, Receipt, ScrollText, Shield, Users, UserCog, Wallet,
  type LucideIcon,
} from "lucide-react";
import { MODULE_REGISTRY } from "../lib/moduleRegistry";
import { SCHOOL } from "../lib/schoolMedia";

export const PRODUCT = {
  name: "School Management Application",
  shortName: "School Management",
  vendor: "Softcubical Technologies Pvt. Ltd.",
  vendorShort: "by Softcubical",
  eyebrow: "School Management Application",
  headline: "Empowering Schools With Smarter Management",
  subhead:
    "One connected platform for students, teachers, parents, administration, academics and finance — built for the way Indian schools actually run.",
  footerBlurb:
    "A unified school management platform covering admissions to alumni: academics, attendance, examinations, fees, transport and communication, with role-based access throughout.",
} as const;

/** The five audiences the platform serves, matching real portal roles. */
export const AUDIENCES = [
  { label: "Students", icon: GraduationCap },
  { label: "Teachers", icon: Users },
  { label: "Parents", icon: MessageSquare },
  { label: "Administration", icon: Landmark },
  { label: "Academics", icon: BookOpen },
  { label: "Finance", icon: Wallet },
] as const;

/* ----------------------------------------------------------------- features */

export type Feature = {
  title: string;
  body: string;
  icon: LucideIcon;
  points: string[];
};

export const FEATURES: Feature[] = [
  {
    title: "Student lifecycle",
    body: "From the first admission enquiry to transfer certificates, every record stays in one place.",
    icon: Users,
    points: ["Enquiries, applications and entrance tests", "Profiles, guardians and documents", "Promotions, transfers and TCs"],
  },
  {
    title: "Academics & examinations",
    body: "Timetables, homework, study material, marks entry and published results.",
    icon: BookOpen,
    points: ["Class and section timetables", "Homework with submissions", "Exams, marks and report cards"],
  },
  {
    title: "Attendance",
    body: "Daily student attendance and staff attendance with reports by class and by day.",
    icon: ClipboardCheck,
    points: ["Session-wise marking", "Per-student percentages", "Class-day overview reports"],
  },
  {
    title: "Fees & finance",
    body: "Fee structures, invoices, payments and receipts — with an auditable adjustment trail.",
    icon: Wallet,
    points: ["Structures and components", "Discounts, late fees and refunds", "Receipts and outstanding dues"],
  },
  {
    title: "Transport",
    body: "Vehicles, drivers, routes, stops and trips, with live tracking for parents.",
    icon: Bus,
    points: ["Fleet and driver records", "Route and stop assignment", "Trip tracking and boarding"],
  },
  {
    title: "Communication",
    body: "Notices, notifications and complaints reach exactly the right audience.",
    icon: Bell,
    points: ["School and branch notices", "Role-targeted notifications", "Complaint threads with replies"],
  },
  {
    title: "Multi-branch control",
    body: "Run several campuses from one account, with data scoped to each branch.",
    icon: Landmark,
    points: ["Branch-wise data isolation", "Cross-branch comparison", "Central master data"],
  },
  {
    title: "Insight & audit",
    body: "Dashboards per role, reporting across the school, and a full audit trail.",
    icon: BarChart3,
    points: ["Role-specific dashboards", "Enrolment and collection reporting", "Audit log of sensitive actions"],
  },
];

/* ------------------------------------------------------------------ modules */

const MODULE_ICONS: Record<string, LucideIcon> = {
  Students: Users,
  Attendance: ClipboardCheck,
  Fees: Wallet,
  Exams: FileText,
  Homework: BookOpen,
  Staff: UserCog,
  Library: Album,
  Transport: Bus,
  Inventory: Package,
  Notices: ScrollText,
  Communication: MessageSquare,
  Reporting: BarChart3,
  Admissions: GraduationCap,
  Timetable: CalendarDays,
  Payments: CreditCard,
  Receipts: Receipt,
  Laboratories: FlaskConical,
  Dashboard: LayoutDashboard,
};

export type ModuleCardData = {
  name: string;
  body: string;
  icon: LucideIcon;
  image: string;
  /** How many registry entries back this group — evidence, not marketing. */
  screens: number;
};

/** Counts real registry paths so the number shown is never invented. */
function countScreens(...prefixes: string[]) {
  return MODULE_REGISTRY.filter((m) => prefixes.some((p) => m.path.startsWith(p))).length;
}

export const MODULES: ModuleCardData[] = [
  {
    name: "Students",
    body: "Profiles, guardians, documents, promotions and transfers across every branch.",
    icon: MODULE_ICONS.Students,
    image: SCHOOL.studentsGroup,
    screens: countScreens("/app/students", "/app/guardians", "/app/children", "/app/promotions", "/app/transfers"),
  },
  {
    name: "Admissions",
    body: "Enquiries, applications, entrance tests and interviews through to enrolment.",
    icon: MODULE_ICONS.Admissions,
    image: SCHOOL.admissions,
    screens: countScreens("/app/enquiries", "/app/applications", "/app/entrance-tests", "/app/interviews", "/app/admissions"),
  },
  {
    name: "Attendance",
    body: "Student and staff attendance with class-day overviews and per-student percentages.",
    icon: MODULE_ICONS.Attendance,
    image: SCHOOL.classroomsLesson,
    screens: countScreens("/app/attendance", "/app/staff-attendance", "/app/attendance-reports"),
  },
  {
    name: "Academics",
    body: "Timetables, homework, study material and the full examination cycle.",
    icon: MODULE_ICONS.Homework,
    image: SCHOOL.studentsClassroom,
    screens: countScreens("/app/timetable", "/app/homework", "/app/exams", "/app/marks", "/app/study-materials", "/app/results", "/app/report-cards"),
  },
  {
    name: "Fees & payments",
    body: "Structures, invoices, payments, receipts, discounts, late fees and refunds.",
    icon: MODULE_ICONS.Fees,
    image: SCHOOL.achievements,
    screens: countScreens("/app/fees", "/app/invoices", "/app/payments", "/app/receipts", "/app/pending-fees"),
  },
  {
    name: "Staff & HR",
    body: "Teacher and staff records, assignments, leave approvals and payroll entries.",
    icon: MODULE_ICONS.Staff,
    image: SCHOOL.teachers,
    screens: countScreens("/app/teachers", "/app/staff", "/app/hr", "/app/leave", "/app/leave-approvals", "/app/tasks"),
  },
  {
    name: "Transport",
    body: "Vehicles, drivers, routes, stops, student assignment and live trip tracking.",
    icon: MODULE_ICONS.Transport,
    image: SCHOOL.transportFleet,
    screens: countScreens("/app/transport", "/app/bus-tracking"),
  },
  {
    name: "Library",
    body: "Catalogue, copies, issue and return, with overdue tracking.",
    icon: MODULE_ICONS.Library,
    image: SCHOOL.library,
    screens: countScreens("/app/library"),
  },
  {
    name: "Communication",
    body: "Notices, notifications, complaints and parent–teacher messaging.",
    icon: MODULE_ICONS.Communication,
    image: SCHOOL.events,
    screens: countScreens("/app/notices", "/app/notifications", "/app/communication", "/app/complaints"),
  },
  {
    name: "Campus operations",
    body: "Events, inventory, health records, discipline, sports and laboratories.",
    icon: MODULE_ICONS.Inventory,
    image: SCHOOL.campus.aerial,
    screens: countScreens("/app/events", "/app/inventory", "/app/health", "/app/discipline", "/app/sports", "/app/labs", "/app/ptm"),
  },
  {
    name: "Reporting & analytics",
    body: "Role dashboards, school-wide reports and branch comparison.",
    icon: MODULE_ICONS.Reporting,
    image: SCHOOL.classrooms,
    screens: countScreens("/app/dashboard", "/app/reports", "/app/analytics"),
  },
  {
    name: "Administration",
    body: "Branches, academic years, users and roles, settings and the audit log.",
    icon: MODULE_ICONS.Dashboard,
    image: SCHOOL.campus.wide,
    screens: countScreens("/app/branches", "/app/academic-years", "/app/users", "/app/settings", "/app/audit", "/app/documents"),
  },
];

/** Total distinct screens in the registry — a real, checkable figure. */
export const TOTAL_MODULE_SCREENS = MODULE_REGISTRY.length;

/* ---------------------------------------------------------------- the story */

export const STORY = [
  {
    step: "01",
    title: "The challenge",
    body: "Attendance in one register, fees in a spreadsheet, results in another system, and parents phoning the office for everything.",
  },
  {
    step: "02",
    title: "The solution",
    body: "One application where admissions, academics, attendance, fees and transport share the same records.",
  },
  {
    step: "03",
    title: "The ecosystem",
    body: "Students, teachers, parents, accountants, transport staff and administrators each see exactly their own view.",
  },
  {
    step: "04",
    title: "The intelligence",
    body: "Live dashboards and reporting turn day-to-day entries into attendance trends, collection positions and academic insight.",
  },
  {
    step: "05",
    title: "The outcome",
    body: "Less paperwork, fewer phone calls, and a school that can answer any question from one source of truth.",
  },
] as const;

/* --------------------------------------------------------------- capability */

/**
 * Capability statements, not metrics. The brief explicitly forbids inventing
 * customer counts, so these describe what the product does.
 */
export const CAPABILITIES = [
  { value: "8", label: "Role types", detail: "Each with its own dashboard and permissions" },
  { value: `${TOTAL_MODULE_SCREENS}+`, label: "Working screens", detail: "Backed by live APIs, not mock-ups" },
  { value: "Multi", label: "Branch ready", detail: "Run several campuses from one account" },
  { value: "Real-time", label: "Insight", detail: "Dashboards update from live school data" },
] as const;

export const TRUST = [
  {
    title: "Role-based access",
    body: "Eight roles with server-enforced permissions. Hiding a button is not access control, so every rule is checked on the server and covered by an automated permission suite.",
    icon: Shield,
  },
  {
    title: "Branch-level isolation",
    body: "Users assigned to a branch cannot read or write another branch's records. Parents see only their linked children; students see only themselves.",
    icon: Lock,
  },
  {
    title: "Auditable by design",
    body: "Sensitive actions — fee adjustments, refunds, approvals — are recorded with the actor, the amount and the reason.",
    icon: ScrollText,
  },
  {
    title: "Built to scale",
    body: "PostgreSQL with versioned migrations and a stateless API, so a single campus and a multi-branch group run the same code.",
    icon: LifeBuoy,
  },
] as const;

/* -------------------------------------------------------------- image bands */

export const IMAGE_STORIES = [
  {
    eyebrow: "Modern learning",
    title: "Classrooms that stay in sync with the record",
    body: "Teachers mark attendance, set homework and enter marks from the same screen they teach with — so the register, the report card and the parent's phone never disagree.",
    image: SCHOOL.studentsClassroom,
    to: "/features",
  },
  {
    eyebrow: "Connected parents",
    title: "Parents stop phoning the front office",
    body: "Attendance, homework, exam results, fee dues, bus location and notices reach parents directly, scoped to their own children and nothing else.",
    image: SCHOOL.studentsGroup,
    to: "/solutions",
  },
  {
    eyebrow: "Complete ecosystem",
    title: "One campus or eight, one source of truth",
    body: "Branch administrators run their own campus while the school group sees every campus side by side — the same records, correctly scoped.",
    image: SCHOOL.campus.aerial,
    to: "/modules",
  },
] as const;
