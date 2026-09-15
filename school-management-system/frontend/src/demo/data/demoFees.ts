// DEMO DATA ONLY — REMOVE/REPLACE WHEN REAL API IS AVAILABLE
import type { FeeStructure, Invoice } from "../../lib/types";

export const demoFeeStructures: FeeStructure[] = [
  { id: "demo-fs-1", name: "Class VIII Term 1", branchId: "demo-br-main", academicYearId: "demo-y-1", classId: "demo-c-8", status: "ACTIVE" },
];

export const demoInvoices: Invoice[] = [
  { id: "demo-inv-1", invoiceNumber: "INV-TWHPS-24081", studentId: "demo-st-aarav", totalAmount: 48500, paidAmount: 48500, status: "PAID", dueDate: "2026-07-15" },
  { id: "demo-inv-2", invoiceNumber: "INV-TWHPS-24102", studentId: "demo-st-aarav", totalAmount: 24250, paidAmount: 0, status: "PENDING", dueDate: "2026-10-15" },
];
