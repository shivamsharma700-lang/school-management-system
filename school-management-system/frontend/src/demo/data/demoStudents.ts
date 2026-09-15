// DEMO DATA ONLY — REMOVE/REPLACE WHEN REAL API IS AVAILABLE
import type { Student } from "../../lib/types";

export const demoStudents: Student[] = [
  { id: "demo-st-aarav", fullName: "Aarav Sharma", admissionNumber: "TWHPS/2024/1102", studentCode: "AARAV24", className: "VIII", sectionName: "A", branchName: "Touch Wood Main Campus", branchId: "demo-br-main", gender: "MALE", status: "ACTIVE", email: "aarav.demo@touchwood.local", academicYear: "2026-27" },
  { id: "demo-st-ananya", fullName: "Ananya Verma", admissionNumber: "TWHPS/2024/1188", studentCode: "ANANYA24", className: "VIII", sectionName: "A", branchName: "Touch Wood Main Campus", branchId: "demo-br-main", gender: "FEMALE", status: "ACTIVE", academicYear: "2026-27" },
  { id: "demo-st-vihaan", fullName: "Vihaan Kapoor", admissionNumber: "TWHPS/2023/0901", studentCode: "VIHAAN23", className: "X", sectionName: "B", branchName: "Touch Wood East Campus", branchId: "demo-br-east", gender: "MALE", status: "ACTIVE", academicYear: "2026-27" },
  { id: "demo-st-myra", fullName: "Myra Singh", admissionNumber: "TWHPS/2025/0044", studentCode: "MYRA25", className: "VI", sectionName: "C", branchName: "Touch Wood North Campus", branchId: "demo-br-north", gender: "FEMALE", status: "ACTIVE", academicYear: "2026-27" },
  { id: "demo-st-arjun", fullName: "Arjun Mehta", admissionNumber: "TWHPS/2022/2210", studentCode: "ARJUN22", className: "XII", sectionName: "Sci", branchName: "Touch Wood South Campus", branchId: "demo-br-south", gender: "MALE", status: "ACTIVE", academicYear: "2026-27" },
];

export const demoStudentPage = { items: demoStudents, total: demoStudents.length, page: 0, size: 20 };
