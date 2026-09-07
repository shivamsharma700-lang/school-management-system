export type PageResponse<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
};

export type Branch = {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: string;
  city?: string;
  state?: string;
  pincode?: string;
  principalName?: string;
};

export type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status?: string;
};

export type SchoolClass = {
  id: string;
  branchId?: string;
  name: string;
  gradeLevel?: number;
  status?: string;
};

export type Section = {
  id: string;
  classId?: string;
  name: string;
  capacity?: number;
  status?: string;
  className?: string;
  gradeLevel?: number;
  branchId?: string;
  branchName?: string;
  studentCount?: number;
  classTeacherName?: string;
};

export type StudentSummary = {
  total: number;
  boys: number;
  girls: number;
  classes: number;
  branches: number;
  active: number;
};

export type Subject = {
  id: string;
  branchId?: string;
  name: string;
  code: string;
  status?: string;
};

export type Student = {
  id: string;
  branchId?: string;
  branchName?: string;
  academicYearId?: string;
  academicYear?: string;
  classId?: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  admissionNumber?: string;
  studentCode?: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  mobile?: string;
  email?: string;
  address?: string;
  admissionDate?: string;
  status?: string;
  fatherName?: string;
  motherName?: string;
  bloodGroup?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContact?: string;
  rollNumber?: string;
};

export type UserRow = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  branchId?: string;
};

export type StaffRow = {
  id: string;
  fullName: string;
  email: string;
  employeeCode: string;
  designation: string;
  staffType: string;
  status: string;
  qualification?: string;
  joiningDate?: string;
  branchId?: string;
  branchName?: string;
};

export type GuardianRow = {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  status?: string;
};

export type DashboardData = {
  students: number;
  teachers?: number;
  staff: number;
  staffMembers?: number;
  pendingInvoices: number;
  feeCollected?: number | string;
  feeTotal?: number | string;
  todayCollected?: number | string;
  overdueInvoices?: number;
  attendanceDate?: string;
  attendancePresent?: number;
  attendanceMarked?: number;
  attendancePercent?: number | string;
  unreadNotifications?: number;
  role: string;
  branches?: number;
};

export type DashboardAnalytics = {
  enrollmentByClass: Array<{ name: string; value: number }>;
  attendanceMix: Array<{ name: string; value: number }>;
  branchComparison: Array<{ name: string; value: number }>;
  recentAdmissions: Array<{ id: string; name: string; className: string; campus: string; when: string }>;
  recentPayments: Array<{ id: string; name: string; amount: number | string; when: string; status: string }>;
  recentNotices: Array<{ id: string; title: string; when: string }>;
};

export type StudentWorkspace = {
  studentId: string;
  attendance: {
    percentage: number;
    present: number;
    late: number;
    absent: number;
    leave: number;
    total: number;
    records: Array<{ date: string; status: string; session: string }>;
  };
  homework: Array<{ id: string; title: string; description: string; dueDate: string; subject: string; teacher: string; className: string; sectionName: string; status: string }>;
  invoices: Array<{ id: string; invoiceNumber: string; status: string; totalAmount: number | string; paidAmount: number | string; dueDate: string }>;
  marks: Array<{ id: string; exam: string; subject: string; marksObtained: number | string; maxMarks: number | string; grade: string; remarks?: string }>;
  exams: Array<{ id: string; name: string; examType: string; startDate: string; endDate: string; status: string }>;
  library: Array<{ id: string; title: string; copyCode: string; status: string; dueDate: string; issuedAt: string }>;
  transport: Array<{ route: string; stop: string; vehicle: string; driver: string; status: string }>;
  leave: Array<{ id: string; leaveType: string; startDate: string; endDate: string; reason: string; status: string }>;
  timetable: Array<{ id: string; dayOfWeek: number; startTime: string; endTime: string; room: string; subject: string; teacher: string; className: string; sectionName: string }>;
  activity: Array<{ when: string; title: string; detail: string }>;
};

export type StaffWorkspace = {
  staffId: string;
  assignments: Array<{ id: string; subject: string; className: string; sectionName: string; sectionId: string; classId: string; year: string }>;
  timetable: StudentWorkspace["timetable"];
  homework: StudentWorkspace["homework"];
  leave: StudentWorkspace["leave"];
  students: Array<{ id: string; fullName: string; admissionNumber: string; className: string; sectionName: string }>;
};

export type AuditRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  role: string;
  createdAt: string;
  userName?: string;
  branchName?: string;
  details?: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  studentId: string;
  totalAmount: number | string;
  paidAmount: number | string;
  status: string;
  dueDate: string;
};

export type FeeStructure = {
  id: string;
  name: string;
  branchId: string;
  academicYearId: string;
  classId: string;
  status: string;
};

export type NotificationRow = {
  id: string;
  type?: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type ExamRow = {
  id: string;
  name: string;
  examType: string;
  startDate: string;
  endDate: string;
  status: string;
  academicYear?: string;
  academicYearId?: string;
};

export type LeaveRow = {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  requester?: string;
  student?: string;
  reviewNote?: string;
  createdAt?: string;
};
