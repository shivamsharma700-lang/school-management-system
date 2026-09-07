// DEMO DATA ONLY — REMOVE/REPLACE WHEN REAL API IS AVAILABLE
export const demoAttendance = {
  studentId: "demo-st-aarav",
  percentage: 94.5,
  present: 86,
  total: 91,
  late: 3,
  absent: 5,
  today: "PRESENT",
  calendar: Array.from({ length: 22 }, (_, i) => ({
    day: i + 1,
    status: i === 4 || i === 17 ? "ABSENT" : i === 11 ? "LATE" : "PRESENT",
  })),
};

export const demoStaffAttendance = [
  { id: "1", name: "Rohan Mehta", status: "PRESENT", inTime: "07:48" },
  { id: "2", name: "Priya Sharma", status: "PRESENT", inTime: "07:51" },
  { id: "3", name: "Neha Kapoor", status: "LATE", inTime: "08:12" },
];
