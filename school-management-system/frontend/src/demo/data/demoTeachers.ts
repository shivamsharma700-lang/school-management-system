// DEMO DATA ONLY — REMOVE/REPLACE WHEN REAL API IS AVAILABLE
import type { StaffRow, UserRow, GuardianRow } from "../../lib/types";

export const demoTeachers: StaffRow[] = [
  { id: "demo-t-rohan", fullName: "Rohan Mehta", email: "rohan.mehta@touchwood.demo", employeeCode: "T-1044", designation: "Mathematics", staffType: "TEACHING", status: "ACTIVE" },
  { id: "demo-t-priya", fullName: "Priya Sharma", email: "priya.sharma@touchwood.demo", employeeCode: "T-1088", designation: "English", staffType: "TEACHING", status: "ACTIVE" },
  { id: "demo-t-neha", fullName: "Neha Kapoor", email: "neha.kapoor@touchwood.demo", employeeCode: "T-1112", designation: "Science", staffType: "TEACHING", status: "ACTIVE" },
  { id: "demo-t-kabir", fullName: "Kabir Ahuja", email: "kabir.ahuja@touchwood.demo", employeeCode: "NT-022", designation: "Transport Head", staffType: "NON_TEACHING", status: "ACTIVE" },
];

export const demoUsers: UserRow[] = [
  { id: "demo-u-1", fullName: "Kavita Rao", email: "super.admin@sms.local", role: "SUPER_ADMIN", status: "ACTIVE", branchId: "" },
  { id: "demo-u-2", fullName: "Rohan Mehta", email: "teacher@sms.local", role: "TEACHER", status: "ACTIVE", branchId: "demo-br-main" },
];

export const demoGuardians: GuardianRow[] = [
  { id: "demo-g-1", fullName: "Sanjay Sharma", mobile: "98100 11122", email: "parent@sms.local", status: "ACTIVE" },
  { id: "demo-g-2", fullName: "Meera Verma", mobile: "98100 22233", email: "meera.verma@touchwood.demo", status: "ACTIVE" },
];
