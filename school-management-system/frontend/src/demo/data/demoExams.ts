// DEMO DATA ONLY — REMOVE/REPLACE WHEN REAL API IS AVAILABLE
import type { ExamRow } from "../../lib/types";

export const demoExams: ExamRow[] = [
  { id: "demo-ex-1", name: "Term 1 Assessment", examType: "TERM", startDate: "2026-09-18", endDate: "2026-09-28", status: "SCHEDULED", academicYear: "2026-27" },
  { id: "demo-ex-2", name: "Unit Test 2", examType: "UNIT", startDate: "2026-08-04", endDate: "2026-08-08", status: "COMPLETED", academicYear: "2026-27" },
];

export const demoReportCard = {
  student: "Aarav Sharma",
  total: 462,
  max: 500,
  percentage: 92.4,
  grade: "A+",
  subjects: 5,
};
