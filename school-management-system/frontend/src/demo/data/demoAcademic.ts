// DEMO DATA ONLY — REMOVE/REPLACE WHEN REAL API IS AVAILABLE
import type { AcademicYear, SchoolClass, Subject } from "../../lib/types";

export const demoYears: AcademicYear[] = [
  { id: "demo-y-1", name: "2026-27", startDate: "2026-04-01", endDate: "2027-03-31", status: "ACTIVE" },
];

export const demoClasses: SchoolClass[] = [
  { id: "demo-c-8", name: "VIII", gradeLevel: 8, status: "ACTIVE", branchId: "demo-br-main" },
  { id: "demo-c-10", name: "X", gradeLevel: 10, status: "ACTIVE", branchId: "demo-br-east" },
  { id: "demo-c-12", name: "XII", gradeLevel: 12, status: "ACTIVE", branchId: "demo-br-south" },
];

export const demoSubjects: Subject[] = [
  { id: "demo-sub-m", name: "Mathematics", code: "MAT", status: "ACTIVE", branchId: "demo-br-main" },
  { id: "demo-sub-e", name: "English", code: "ENG", status: "ACTIVE", branchId: "demo-br-main" },
  { id: "demo-sub-s", name: "Science", code: "SCI", status: "ACTIVE", branchId: "demo-br-main" },
  { id: "demo-sub-h", name: "Hindi", code: "HIN", status: "ACTIVE", branchId: "demo-br-main" },
  { id: "demo-sub-ss", name: "Social Science", code: "SST", status: "ACTIVE", branchId: "demo-br-main" },
];
