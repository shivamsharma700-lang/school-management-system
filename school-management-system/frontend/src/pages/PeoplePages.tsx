import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Download, Plus } from "lucide-react";
import { api, post, put } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate, formatMoney, formatNumber, prettyRole, prettyStatus, str, unwrapList } from "../lib/format";
import { isAdminLike, isSuper, canManageUsers, canSeeStaff } from "../lib/roles";
import type { AcademicYear, Branch, GuardianRow, PageResponse, SchoolClass, Section, StaffRow, StaffWorkspace, Student, StudentSummary, StudentWorkspace, UserRow } from "../lib/types";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  StatCard,
  TableShell,
  Tabs,
  statusTone,
} from "../components/ui";
import { DemoChip } from "../components/brand";
import { useLiveOrDemo } from "../demo/useLiveOrDemo";
import { DEMO_MODE, demoGuardians, demoStudentPage, demoStudents, demoTeachers } from "../demo";

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function StudentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState("");
  const [branchId, setBranchId] = useState(() => sessionStorage.getItem("dps_branch_ui") || params.get("branchId") || "");
  const [classId, setClassId] = useState(params.get("classId") || "");
  const [sectionId, setSectionId] = useState(params.get("sectionId") || "");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [yearId, setYearId] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [open, setOpen] = useState(false);
  const dq = useDebounced(q);

  useEffect(() => {
    const onBranch = (e: Event) => {
      const id = (e as CustomEvent<string>).detail ?? "";
      setBranchId(id);
      setPage(0);
    };
    window.addEventListener("dps-branch", onBranch as EventListener);
    return () => window.removeEventListener("dps-branch", onBranch as EventListener);
  }, []);

  useEffect(() => {
    setPage(0);
  }, [dq, branchId, classId, sectionId, status, gender, yearId, size]);

  const query = useMemo(() => {
    const p = new URLSearchParams({ page: String(page), size: String(size) });
    if (dq) p.set("q", dq);
    if (branchId) p.set("branchId", branchId);
    if (classId) p.set("classId", classId);
    if (sectionId) p.set("sectionId", sectionId);
    if (status) p.set("status", status);
    if (gender) p.set("gender", gender);
    if (yearId) p.set("academicYearId", yearId);
    return p.toString();
  }, [page, size, dq, branchId, classId, sectionId, status, gender, yearId]);

  const studentsQ = useQuery({
    queryKey: ["students", query],
    queryFn: () => api<PageResponse<Student>>(`/api/students?${query}`),
  });
  const summaryQ = useQuery({
    queryKey: ["students-summary", query],
    queryFn: () => api<StudentSummary>(`/api/students/summary?${query.replace(/page=\d+&size=\d+&?/, "")}`),
  });
  const liveOk = studentsQ.isSuccess;
  const students = liveOk ? studentsQ.data : (DEMO_MODE && studentsQ.isError ? demoStudentPage : studentsQ.data);
  const isDemo = !liveOk && DEMO_MODE && studentsQ.isError;
  const classes = useQuery({
    queryKey: ["classes", branchId],
    queryFn: () => api<SchoolClass[]>(`/api/classes${branchId ? `?branchId=${branchId}` : ""}`),
  });
  const sections = useQuery({
    queryKey: ["sections", classId],
    enabled: Boolean(classId),
    queryFn: () => api<Section[]>(`/api/classes/${classId}/sections`),
  });
  const branches = useQuery({ queryKey: ["branches"], queryFn: () => api<Branch[]>("/api/branches") });
  const years = useQuery({ queryKey: ["years"], queryFn: () => api<AcademicYear[]>("/api/academic-years") });
  const rows = students?.items ?? [];
  const total = students?.total ?? 0;
  const from = total === 0 ? 0 : page * size + 1;
  const to = Math.min(total, page * size + rows.length);
  const pages = Math.max(1, Math.ceil(total / size));
  const summary = summaryQ.data;
  const boysPct = summary && summary.total ? ((summary.boys / summary.total) * 100).toFixed(1) : "0";
  const girlsPct = summary && summary.total ? ((summary.girls / summary.total) * 100).toFixed(1) : "0";

  return (
    <div>
      <PageHeader
        crumbs={["Dashboard", "Students", "All Students"]}
        title="All Students"
        subtitle="Manage and view student information across all 8 branches."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => toast.message("Bulk CSV import is not wired. Use Add Student to create a live record.")}>
              Import
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const csv = ["Admission,Name,Class,Section,Father,Contact,Status", ...rows.map((s) =>
                  [s.admissionNumber, s.fullName, s.className, s.sectionName, s.fatherName, s.mobile, s.status].join(",")
                )].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "students-page.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={14} /> Export
            </Button>
            {isAdminLike(user?.role) ? (
              <Button className="bg-forest-600 hover:bg-forest-700" onClick={() => setOpen(true)}>
                <Plus size={16} /> Add Student
              </Button>
            ) : null}
          </div>
        }
      />
      {isDemo ? <p className="mb-3 text-sm text-amber-800">Showing fallback demo rows because the students API was unavailable.</p> : null}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total Students" value={formatNumber(summary?.total ?? total)} hint="In current filters" glyph="student" tone="emerald" />
        <StatCard label="Boys" value={formatNumber(summary?.boys ?? 0)} hint={`${boysPct}%`} glyph="student" tone="sky" />
        <StatCard label="Girls" value={formatNumber(summary?.girls ?? 0)} hint={`${girlsPct}%`} glyph="student" tone="rose" />
        <StatCard label="Classes" value={formatNumber(summary?.classes ?? 0)} hint="Nursery–12" glyph="class" tone="violet" />
        <StatCard label="Branches" value={formatNumber(summary?.branches ?? 0)} hint="Demo campuses" glyph="campus" tone="gold" />
        <StatCard label="Active Students" value={summary && summary.total ? `${Math.round((summary.active / summary.total) * 100)}%` : "—"} hint={formatNumber(summary?.active ?? 0)} glyph="student" />
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {isSuper(user?.role) ? (
          <Select value={branchId} onChange={(e) => { setBranchId(e.target.value); setClassId(""); setSectionId(""); }}>
            <option value="">All Branches</option>
            {(branches.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
        ) : null}
        <Select value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}>
          <option value="">All classes</option>
          {(classes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}>
          <option value="">All sections</option>
          {(sections.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ALUMNI">Alumni</option>
        </Select>
        <Select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">All genders</option>
          <option value="MALE">Boys</option>
          <option value="FEMALE">Girls</option>
        </Select>
        <Select value={yearId} onChange={(e) => setYearId(e.target.value)}>
          <option value="">Academic year</option>
          {(years.data ?? []).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
        </Select>
        <Input placeholder="Search name, admission, father, phone" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {studentsQ.isLoading ? <Skeleton className="h-72" /> : studentsQ.isError && !isDemo ? (
        <ErrorState message="Could not load students." onRetry={() => studentsQ.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="No students found" body="Try another search, or add a student if you have permission." />
      ) : (
        <TableShell columns={["#", "Photo", "Admission No.", "Student Name", "Class", "Section", "Father Name", "Contact", "Address", "Status", ""]}>
          {rows.map((s, idx) => (
            <tr key={s.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/app/students/${s.id}`)}>
              <td className="px-4 py-3 text-slate-400">{page * size + idx + 1}</td>
              <td className="px-4 py-3"><Avatar name={s.fullName} size="sm" /></td>
              <td className="px-4 py-3 font-medium text-slate-700">{s.admissionNumber}</td>
              <td className="px-4 py-3 font-semibold">{s.fullName}</td>
              <td className="px-4 py-3">{s.className ?? "—"}</td>
              <td className="px-4 py-3">{s.sectionName ?? "—"}</td>
              <td className="px-4 py-3">{s.fatherName || "—"}</td>
              <td className="px-4 py-3 text-slate-600">{s.mobile || "—"}</td>
              <td className="max-w-[180px] truncate px-4 py-3 text-slate-500">{s.address || "—"}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(s.status)}>{prettyStatus(s.status)}</Badge></td>
              <td className="px-4 py-3 text-right">
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/app/students/${s.id}`); }}>View</Button>
              </td>
            </tr>
          ))}
        </TableShell>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <p>Showing {from}–{to} of {formatNumber(total)} students</p>
        <div className="flex items-center gap-2">
          <Select className="w-24" value={String(size)} onChange={(e) => setSize(Number(e.target.value))}>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
          <Button size="sm" variant="secondary" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span>Page {page + 1} / {pages}</span>
          <Button size="sm" variant="secondary" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
      <StudentForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function StudentForm({ open, onClose, existing }: { open: boolean; onClose: () => void; existing?: Student }) {
  const qc = useQueryClient();
  const years = useQuery({ queryKey: ["years"], queryFn: () => api<AcademicYear[]>("/api/academic-years") });
  const classes = useQuery({ queryKey: ["classes"], queryFn: () => api<SchoolClass[]>("/api/classes") });
  const branches = useQuery({ queryKey: ["branches"], queryFn: () => api<Branch[]>("/api/branches") });
  const guardians = useQuery({
    queryKey: ["guardians"],
    queryFn: async () => unwrapList<GuardianRow>(await api(`/api/guardians?size=100`)),
  });
  const [classId, setClassId] = useState(existing?.classId ?? "");
  const sections = useQuery({
    queryKey: ["sections", classId],
    enabled: Boolean(classId),
    queryFn: () => api<Section[]>(`/api/classes/${classId}/sections`),
  });
  const [form, setForm] = useState({
    fullName: existing?.fullName ?? "",
    admissionNumber: existing?.admissionNumber ?? "",
    studentCode: existing?.studentCode ?? "",
    gender: existing?.gender ?? "MALE",
    dateOfBirth: existing?.dateOfBirth ?? "",
    admissionDate: existing?.admissionDate ?? new Date().toISOString().slice(0, 10),
    academicYearId: existing?.academicYearId ?? "",
    classId: existing?.classId ?? "",
    sectionId: existing?.sectionId ?? "",
    branchId: existing?.branchId ?? "",
    mobile: existing?.mobile ?? "",
    email: existing?.email ?? "",
    address: existing?.address ?? "",
    guardianId: "",
    guardianRelationship: "PARENT",
    status: existing?.status ?? "ACTIVE",
  });
  const save = useMutation({
    mutationFn: () => {
      const body = {
        ...form,
        branchId: form.branchId || null,
        classId: form.classId || null,
        sectionId: form.sectionId || null,
        guardianId: form.guardianId || null,
      };
      return existing ? put(`/api/students/${existing.id}`, body) : post("/api/students", body);
    },
    onSuccess: () => {
      toast.success(existing ? "Student updated" : "Student created successfully");
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["students-dash"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <Modal open={open} title={existing ? "Edit student" : "Add student"} onClose={onClose} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required><Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} /></Field>
        <Field label="Admission number" required><Input value={form.admissionNumber} onChange={(e) => set("admissionNumber", e.target.value)} /></Field>
        <Field label="Student code" required><Input value={form.studentCode} onChange={(e) => set("studentCode", e.target.value)} /></Field>
        <Field label="Gender" required>
          <Select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
            <option>MALE</option><option>FEMALE</option><option>OTHER</option>
          </Select>
        </Field>
        <Field label="Date of birth" required><Input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} /></Field>
        <Field label="Admission date" required><Input type="date" value={form.admissionDate} onChange={(e) => set("admissionDate", e.target.value)} /></Field>
        <Field label="Academic year" required>
          <Select value={form.academicYearId} onChange={(e) => set("academicYearId", e.target.value)}>
            <option value="">Select</option>
            {(years.data ?? []).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </Select>
        </Field>
        <Field label="Class">
          <Select value={form.classId} onChange={(e) => { set("classId", e.target.value); setClassId(e.target.value); set("sectionId", ""); }}>
            <option value="">Unassigned</option>
            {(classes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Section">
          <Select value={form.sectionId} onChange={(e) => set("sectionId", e.target.value)}>
            <option value="">Unassigned</option>
            {(sections.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Branch">
          <Select value={form.branchId} onChange={(e) => set("branchId", e.target.value)}>
            <option value="">Default</option>
            {(branches.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
        </Field>
        <Field label="Mobile"><Input value={form.mobile} onChange={(e) => set("mobile", e.target.value)} /></Field>
        <Field label="Email"><Input value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="Guardian">
          <Select value={form.guardianId} onChange={(e) => set("guardianId", e.target.value)}>
            <option value="">None</option>
            {(guardians.data ?? []).map((g) => <option key={g.id} value={g.id}>{g.fullName}</option>)}
          </Select>
        </Field>
        <Field label="Relationship"><Input value={form.guardianRelationship} onChange={(e) => set("guardianRelationship", e.target.value)} /></Field>
      </div>
      <Field label="Address"><Input className="mt-4" value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={save.isPending} onClick={() => save.mutate()}>{existing ? "Save changes" : "Create student"}</Button>
      </div>
    </Modal>
  );
}

export function StudentProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [edit, setEdit] = useState(false);
  const isDemoId = Boolean(id?.startsWith("demo-"));
  const student = useQuery({
    queryKey: ["student", id],
    enabled: Boolean(id) && !isDemoId,
    queryFn: () => api<Student>(`/api/students/${id}`),
  });
  const workspace = useQuery({
    queryKey: ["student-workspace", id],
    enabled: Boolean(id) && !isDemoId,
    queryFn: () => api<StudentWorkspace>(`/api/students/${id}/workspace`),
  });
  const s = isDemoId && DEMO_MODE ? demoStudents.find((row) => row.id === id) : student.data;
  const pack = workspace.data;
  if (!isDemoId && student.isLoading) return <Skeleton className="h-80" />;
  if (!s) return <EmptyState title="Student not found" body="This record is not in your authorised scope." />;
  return (
    <div>
      <PageHeader
        crumbs={["People", "Students"]}
        title={s.fullName}
        subtitle={`${s.admissionNumber} · ${s.branchName ?? "Campus"}`}
        action={isAdminLike(user?.role) && !isDemoId ? <Button variant="secondary" onClick={() => setEdit(true)}>Edit</Button> : null}
      />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card><p className="text-xs text-slate-500">Class</p><p className="mt-1 font-semibold">{s.className ?? "—"} / {s.sectionName ?? "—"}</p></Card>
        <Card><p className="text-xs text-slate-500">Attendance</p><p className="mt-1 font-semibold">{pack?.attendance.percentage ?? 0}%</p></Card>
        <Card><p className="text-xs text-slate-500">Status</p><div className="mt-1"><Badge tone={statusTone(s.status)}>{prettyStatus(s.status)}</Badge></div></Card>
        <Card><p className="text-xs text-slate-500">Year</p><p className="mt-1 font-semibold">{s.academicYear ?? "—"}</p></Card>
      </div>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "academic", label: "Academic" },
          { id: "parents", label: "Parents" },
          { id: "attendance", label: "Attendance" },
          { id: "homework", label: "Homework" },
          { id: "exams", label: "Exams" },
          { id: "results", label: "Results" },
          { id: "fees", label: "Fees" },
          { id: "transport", label: "Transport" },
          { id: "library", label: "Library" },
          { id: "health", label: "Health" },
          { id: "discipline", label: "Discipline" },
          { id: "documents", label: "Documents" },
          { id: "activity", label: "Activity" },
        ]}
      />
      <div className="mt-5">
        {tab === "overview" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <p className="mb-3 font-semibold">Personal</p>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-slate-500">Father</dt><dd>{s.fatherName || "—"}</dd></div>
                <div><dt className="text-slate-500">Mother</dt><dd>{s.motherName || "—"}</dd></div>
                <div><dt className="text-slate-500">Blood group</dt><dd>{s.bloodGroup || "—"}</dd></div>
                <div><dt className="text-slate-500">Gender</dt><dd>{s.gender}</dd></div>
                <div><dt className="text-slate-500">Date of birth</dt><dd>{formatDate(s.dateOfBirth)}</dd></div>
                <div><dt className="text-slate-500">Mobile</dt><dd>{s.mobile || "—"}</dd></div>
                <div><dt className="text-slate-500">Email</dt><dd>{s.email || "—"}</dd></div>
                <div className="col-span-2"><dt className="text-slate-500">Address</dt><dd>{s.address || "—"}</dd></div>
              </dl>
            </Card>
            <Card>
              <p className="mb-3 font-semibold">Academic</p>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-slate-500">Student code</dt><dd>{s.studentCode}</dd></div>
                <div><dt className="text-slate-500">Admitted</dt><dd>{formatDate(s.admissionDate)}</dd></div>
                <div><dt className="text-slate-500">Class</dt><dd>{s.className ?? "—"}</dd></div>
                <div><dt className="text-slate-500">Section</dt><dd>{s.sectionName ?? "—"}</dd></div>
              </dl>
            </Card>
          </div>
        ) : null}
        {tab === "academic" ? (
          <div className="grid gap-4">
            <Card>
              <p className="font-semibold">Academic snapshot</p>
              <p className="mt-2 text-sm text-slate-500">{s.className}-{s.sectionName} · {s.branchName} · Roll {s.rollNumber || "—"}</p>
            </Card>
            {(pack?.timetable ?? []).length === 0 ? <p className="text-sm text-slate-500">No timetable slots stored for this section yet.</p> : (
              <TableShell columns={["Day", "Time", "Subject", "Teacher", "Room"]}>
                {pack!.timetable.map((slot) => (
                  <tr key={slot.id}>
                    <td className="px-4 py-3">{["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][slot.dayOfWeek] ?? slot.dayOfWeek}</td>
                    <td className="px-4 py-3">{slot.startTime}–{slot.endTime}</td>
                    <td className="px-4 py-3">{slot.subject}</td>
                    <td className="px-4 py-3">{slot.teacher}</td>
                    <td className="px-4 py-3">{slot.room || "—"}</td>
                  </tr>
                ))}
              </TableShell>
            )}
          </div>
        ) : null}
        {tab === "parents" ? (
          <Card>
            <p className="font-semibold">{s.fatherName || "Primary guardian"}</p>
            <p className="text-sm text-slate-500">Father · {s.emergencyContact || s.mobile || "—"}</p>
            <p className="mt-2 text-sm text-slate-500">Mother · {s.motherName || "—"}</p>
            <p className="mt-2 text-xs text-slate-400">Linked from the student record stored in PostgreSQL.</p>
          </Card>
        ) : null}
        {tab === "attendance" ? (
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <Card><p className="text-xs text-slate-500">Present</p><p className="font-display text-2xl">{pack?.attendance.present ?? 0}</p></Card>
              <Card><p className="text-xs text-slate-500">Late</p><p className="font-display text-2xl">{pack?.attendance.late ?? 0}</p></Card>
              <Card><p className="text-xs text-slate-500">Absent</p><p className="font-display text-2xl">{pack?.attendance.absent ?? 0}</p></Card>
              <Card><p className="text-xs text-slate-500">Sessions</p><p className="font-display text-2xl">{pack?.attendance.total ?? 0}</p></Card>
            </div>
            {(pack?.attendance.records ?? []).length === 0 ? (
              <EmptyState title="No attendance rows" body="Mark attendance for this student to populate the register." />
            ) : (
              <TableShell columns={["Date", "Session", "Status"]}>
                {pack!.attendance.records.map((r) => (
                  <tr key={`${r.date}-${r.session}`}>
                    <td className="px-4 py-3">{formatDate(r.date)}</td>
                    <td className="px-4 py-3">{r.session}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone(r.status)}>{r.status}</Badge></td>
                  </tr>
                ))}
              </TableShell>
            )}
          </div>
        ) : null}
        {tab === "homework" ? (
          (pack?.homework ?? []).length === 0 ? <EmptyState title="No homework" body="Homework assigned to this section will appear here." /> : (
            <TableShell columns={["Title", "Subject", "Teacher", "Due", "Status"]}>
              {pack!.homework.map((h) => (
                <tr key={h.id}>
                  <td className="px-4 py-3 font-medium">{h.title}</td>
                  <td className="px-4 py-3">{h.subject}</td>
                  <td className="px-4 py-3">{h.teacher}</td>
                  <td className="px-4 py-3">{formatDate(h.dueDate)}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(h.status)}>{h.status}</Badge></td>
                </tr>
              ))}
            </TableShell>
          )
        ) : null}
        {tab === "exams" ? (
          (pack?.exams ?? []).length === 0 ? <EmptyState title="No exam rows" body="Published exams with marks for this student will appear here." /> : (
            <TableShell columns={["Exam", "Type", "Starts", "Status"]}>
              {pack!.exams.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-medium">{e.name}</td>
                  <td className="px-4 py-3">{e.examType}</td>
                  <td className="px-4 py-3">{formatDate(e.startDate)}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(e.status)}>{e.status}</Badge></td>
                </tr>
              ))}
            </TableShell>
          )
        ) : null}
        {tab === "results" ? (
          (pack?.marks ?? []).length === 0 ? <EmptyState title="No marks" body="Marks appear after teachers publish results for an exam." /> : (
            <TableShell columns={["Exam", "Subject", "Marks", "Grade"]}>
              {pack!.marks.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3">{m.exam}</td>
                  <td className="px-4 py-3">{m.subject}</td>
                  <td className="px-4 py-3">{str(m.marksObtained)} / {str(m.maxMarks)}</td>
                  <td className="px-4 py-3"><Badge>{m.grade}</Badge></td>
                </tr>
              ))}
            </TableShell>
          )
        ) : null}
        {tab === "fees" ? (
          (pack?.invoices ?? []).length === 0 ? (
            <EmptyState title="No invoices" body="Fee invoices for this student will appear after they are generated." />
          ) : (
            <TableShell columns={["Invoice", "Due", "Total", "Paid", "Status"]}>
              {pack!.invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3">{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-3">{formatMoney(inv.totalAmount)}</td>
                  <td className="px-4 py-3">{formatMoney(inv.paidAmount)}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(inv.status)}>{inv.status}</Badge></td>
                </tr>
              ))}
            </TableShell>
          )
        ) : null}
        {tab === "transport" ? (
          (pack?.transport ?? []).length === 0 ? <EmptyState title="No transport assignment" body="This student is not assigned to a bus route in PostgreSQL." /> : (
            <div className="grid gap-3 md:grid-cols-2">
              {pack!.transport.map((t) => (
                <Card key={`${t.route}-${t.stop}`}>
                  <p className="font-semibold">{t.route}</p>
                  <p className="mt-1 text-sm text-slate-500">Stop {t.stop} · {t.vehicle || "Vehicle TBA"}</p>
                  <p className="text-sm text-slate-500">Driver {t.driver || "—"}</p>
                  <div className="mt-2"><Badge tone={statusTone(t.status)}>{t.status}</Badge></div>
                </Card>
              ))}
            </div>
          )
        ) : null}
        {tab === "library" ? (
          (pack?.library ?? []).length === 0 ? <EmptyState title="No loans" body="Issued copies for this student will appear here." /> : (
            <TableShell columns={["Title", "Copy", "Due", "Status"]}>
              {pack!.library.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 font-medium">{l.title}</td>
                  <td className="px-4 py-3">{l.copyCode}</td>
                  <td className="px-4 py-3">{formatDate(l.dueDate)}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(l.status)}>{l.status}</Badge></td>
                </tr>
              ))}
            </TableShell>
          )
        ) : null}
        {tab === "health" ? (
          <Card>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><dt className="text-slate-500">Blood group</dt><dd>{s.bloodGroup || "Not recorded"}</dd></div>
              <div><dt className="text-slate-500">Emergency contact</dt><dd>{s.emergencyContact || s.mobile || "—"}</dd></div>
            </dl>
            <p className="mt-4 text-sm text-slate-500">No clinic visit rows are stored for this student. The health register stays empty until a visit is recorded.</p>
          </Card>
        ) : null}
        {tab === "discipline" ? (
          <Card>
            <p className="font-semibold">Conduct standing</p>
            <p className="mt-2 text-sm text-slate-500">No discipline cases are stored for {s.fullName}. Standing is clear on the current record.</p>
          </Card>
        ) : null}
        {tab === "documents" ? (
          <TableShell columns={["Document", "Reference", "Source"]}>
            <tr><td className="px-4 py-3">Admission number</td><td className="px-4 py-3">{s.admissionNumber}</td><td className="px-4 py-3">Student record</td></tr>
            <tr><td className="px-4 py-3">Student code</td><td className="px-4 py-3">{s.studentCode}</td><td className="px-4 py-3">Student record</td></tr>
            <tr><td className="px-4 py-3">Uploaded files</td><td className="px-4 py-3">None</td><td className="px-4 py-3">No document API rows</td></tr>
          </TableShell>
        ) : null}
        {tab === "activity" ? (
          (pack?.activity ?? []).length === 0 ? <EmptyState title="No activity" body="Attendance and invoice events will appear as they are stored." /> : (
            <div className="grid gap-2">
              {pack!.activity.map((e, i) => (
                <Card key={`${e.when}-${i}`}>
                  <p className="text-xs text-slate-400">{formatDate(e.when)}</p>
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-sm text-slate-500">{e.detail}</p>
                </Card>
              ))}
            </div>
          )
        ) : null}
      </div>
      <StudentForm open={edit} onClose={() => setEdit(false)} existing={s} />
    </div>
  );
}

export function ChildrenPage() {
  return <StudentsPage />;
}

export function UsersPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const users = useQuery({ queryKey: ["users"], queryFn: () => api<UserRow[]>("/api/users") });
  const branches = useQuery({ queryKey: ["branches"], queryFn: () => api<Branch[]>("/api/branches") });
  const all = users.data ?? [];
  const rows = all.filter((u) => {
    const match = !q || `${u.fullName} ${u.email}`.toLowerCase().includes(q.toLowerCase());
    return match && (!role || u.role === role) && (!status || u.status === status);
  });
  const activeCount = all.filter((u) => (u.status || "").toUpperCase() === "ACTIVE").length;
  const roleCount = new Set(all.map((u) => u.role)).size;
  const qc = useQueryClient();
  const [form, setForm] = useState({ fullName: "", email: "", username: "", password: "", role: "TEACHER", branchId: "", mobile: "" });
  const create = useMutation({
    mutationFn: () => post("/api/users", { ...form, branchId: form.branchId || null }),
    onSuccess: () => {
      toast.success("User created successfully");
      qc.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        crumbs={["Organisation"]}
        title="Users & roles"
        subtitle="Directory of authorised accounts across campuses. Role changes take effect on the next signed-in session."
        action={
          canManageUsers(user?.role) ? (
            <Button onClick={() => setOpen(true)}>+ Add user</Button>
          ) : null
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total users" value={formatNumber(all.length)} hint="In current directory" glyph="users" />
        <StatCard label="Active" value={formatNumber(activeCount)} hint="Ready to sign in" glyph="users" tone="sky" />
        <StatCard label="Roles in use" value={formatNumber(roleCount)} hint="Distinct role types" glyph="users" tone="navy" />
      </div>

      {users.isLoading ? (
        <Skeleton className="h-72" />
      ) : rows.length === 0 && !q && !role && !status ? (
        <EmptyState title="No users yet" body="Create the first account to populate the directory." />
      ) : (
        <TableShell
          columns={["User", "Role", "Branch", "Status"]}
          toolbar={
            <>
              <Input
                className="max-w-sm"
                placeholder="Search name or email…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Select className="min-w-[160px]" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="">All roles</option>
                  {["SUPER_ADMIN", "BRANCH_ADMIN", "PRINCIPAL", "TEACHER", "ACCOUNTANT", "PARENT", "STUDENT"].map((r) => (
                    <option key={r} value={r}>
                      {prettyRole(r)}
                    </option>
                  ))}
                </Select>
                <Select className="min-w-[140px]" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">All statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Select>
              </div>
            </>
          }
        >
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                No users match these filters.
              </td>
            </tr>
          ) : (
            rows.map((u) => (
              <tr key={u.id}>
                <td className="px-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.fullName} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#053321]">{u.fullName}</p>
                      <p className="truncate text-xs font-medium text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4">
                  <Badge tone="info">{prettyRole(u.role)}</Badge>
                </td>
                <td className="px-4 text-slate-600">
                  {(branches.data ?? []).find((b) => b.id === u.branchId)?.name || u.branchId || "All campuses"}
                </td>
                <td className="px-4">
                  <Badge tone={statusTone(u.status)}>{u.status || "—"}</Badge>
                </td>
              </tr>
            ))
          )}
        </TableShell>
      )}

      <Modal open={open} title="Add user" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          <Field label="Full name" required>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </Field>
          <Field label="Email" required>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Username" required>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </Field>
          <Field label="Password" required hint="Minimum length is enforced by the API.">
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <Field label="Role">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {["BRANCH_ADMIN", "PRINCIPAL", "TEACHER", "ACCOUNTANT", "PARENT", "STUDENT"].map((r) => (
                <option key={r}>{r}</option>
              ))}
              {isSuper(user?.role) ? <option>SUPER_ADMIN</option> : null}
            </Select>
          </Field>
          <Field label="Branch">
            <Select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
              <option value="">None</option>
              {(branches.data ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Mobile">
            <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={create.isPending} onClick={() => create.mutate()}>
            Create user
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export function StaffPage() {
  const [q, setQ] = useState("");
  const staffQ = useQuery({
    queryKey: ["staff"],
    queryFn: () => api<StaffRow[]>("/api/staff"),
  });
  const staff = useLiveOrDemo(staffQ, demoTeachers);
  const rows = (staff.data ?? []).filter((s) => !q || `${s.fullName} ${s.designation} ${s.employeeCode}`.toLowerCase().includes(q.toLowerCase()));
  const { user } = useAuth();
  if (!canSeeStaff(user?.role)) {
    return <EmptyState title="Staff directory unavailable" body="Your role cannot list staff records." />;
  }
  return (
    <div>
      <PageHeader crumbs={["People"]} title="Teachers & staff" subtitle="Staff records returned by the API. Create/update staff endpoints are not available yet." action={<Input className="w-64" placeholder="Search staff" value={q} onChange={(e) => setQ(e.target.value)} />} />
      {staff.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      {staff.isLoading ? <Skeleton className="h-72" /> : rows.length === 0 ? (
        <EmptyState title="No staff in scope" body="Staff will appear here once records exist for your branch." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((s) => (
            <Card key={s.id}>
              <div className="flex items-start gap-3">
                <Avatar name={s.fullName} />
                <div>
                  <p className="font-semibold">{s.fullName}</p>
                  <p className="text-sm text-slate-500">{s.designation}</p>
                  <p className="mt-1 text-xs text-slate-400">{s.employeeCode} · {s.staffType}</p>
                  <div className="mt-2"><Badge tone={statusTone(s.status)}>{s.status}</Badge></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function TeachersPage() {
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("");
  const [branch, setBranch] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const staffQ = useQuery({ queryKey: ["staff"], queryFn: () => api<StaffRow[]>("/api/staff") });
  const staff = useLiveOrDemo(staffQ, demoTeachers);
  const all = (staff.data ?? []).filter((s) => s.staffType !== "NON_TEACHING" && s.staffType !== "STAFF");
  const subjects = [...new Set(all.map((s) => s.designation).filter(Boolean))];
  const campuses = [...new Set(all.map((s) => s.branchName).filter(Boolean))] as string[];
  const rows = all.filter((s) => {
    const match = !q || `${s.fullName} ${s.designation} ${s.employeeCode}`.toLowerCase().includes(q.toLowerCase());
    return match && (!subject || s.designation === subject) && (!branch || s.branchName === branch) && (!status || s.status === status);
  });
  const { user } = useAuth();
  if (!canSeeStaff(user?.role) && user?.role !== "TEACHER") {
    return <EmptyState title="Teachers unavailable" body="Your role cannot list teaching staff." />;
  }
  return (
    <div>
      <PageHeader crumbs={["Staff"]} title="Teachers" subtitle="Subject teachers in your authorised scope." />
      {staff.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Total teachers" value={rows.length} glyph="teacher" />
        <StatCard label="Active" value={rows.filter((s) => s.status === "ACTIVE").length} glyph="teacher" tone="sky" />
        <StatCard label="Subjects" value={new Set(all.map((s) => s.designation)).size} glyph="subject" tone="violet" />
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Input placeholder="Search teachers" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">All subjects</option>
          {subjects.map((name) => <option key={name}>{name}</option>)}
        </Select>
        <Select value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="">All branches</option>
          {campuses.map((name) => <option key={name}>{name}</option>)}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option>ACTIVE</option>
          <option>INACTIVE</option>
        </Select>
      </div>
      {staff.isLoading ? <Skeleton className="h-72" /> : rows.length === 0 ? (
        <EmptyState title="No teachers" body="Teaching staff records will appear here." />
      ) : (
        <TableShell columns={["Photo", "Employee ID", "Teacher Name", "Subject", "Branch", "Contact", "Status", ""]}>
          {rows.map((s) => (
            <tr key={s.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/app/teachers/${s.id}`)}>
              <td className="px-4 py-3"><Avatar name={s.fullName} size="sm" /></td>
              <td className="px-4 py-3">{s.employeeCode}</td>
              <td className="px-4 py-3 font-semibold">{s.fullName}</td>
              <td className="px-4 py-3">{s.designation}</td>
              <td className="px-4 py-3">{s.branchName || "—"}</td>
              <td className="px-4 py-3">{s.email}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(s.status)}>{s.status}</Badge></td>
              <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/app/teachers/${s.id}`); }}>View</Button></td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}

export function TeacherProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const staff = useQuery({
    queryKey: ["staff", id],
    enabled: Boolean(id),
    queryFn: () => api<StaffRow>(`/api/staff/${id}`),
  });
  const pack = useQuery({
    queryKey: ["staff-workspace", id],
    enabled: Boolean(id),
    queryFn: () => api<StaffWorkspace>(`/api/staff/${id}/workspace`),
  });
  const [tab, setTab] = useState("overview");
  if (staff.isLoading) return <Skeleton className="h-80" />;
  const s = staff.data;
  if (!s) return <EmptyState title="Teacher not found" body="This staff record is outside your authorised scope." />;
  const ws = pack.data;
  return (
    <div>
      <PageHeader crumbs={["Staff", "Teachers"]} title={s.fullName} subtitle={`${s.employeeCode} · ${s.designation} · ${s.branchName ?? ""}`} />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "subjects", label: "Subjects" },
          { id: "classes", label: "Classes" },
          { id: "students", label: "Students" },
          { id: "timetable", label: "Timetable" },
          { id: "attendance", label: "Attendance" },
          { id: "homework", label: "Homework" },
          { id: "exams", label: "Exams" },
          { id: "marks", label: "Marks" },
          { id: "leave", label: "Leave" },
          { id: "documents", label: "Documents" },
        ]}
      />
      <div className="mt-5">
        {tab === "overview" ? (
          <Card>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><dt className="text-slate-500">Email</dt><dd>{s.email}</dd></div>
              <div><dt className="text-slate-500">Type</dt><dd>{s.staffType}</dd></div>
              <div><dt className="text-slate-500">Qualification</dt><dd>{s.qualification || "—"}</dd></div>
              <div><dt className="text-slate-500">Joined</dt><dd>{s.joiningDate ? formatDate(s.joiningDate) : "—"}</dd></div>
              <div><dt className="text-slate-500">Campus</dt><dd>{s.branchName || "—"}</dd></div>
              <div><dt className="text-slate-500">Status</dt><dd>{s.status}</dd></div>
            </dl>
          </Card>
        ) : null}
        {tab === "subjects" ? (
          (ws?.assignments ?? []).length === 0 ? <Card><p className="text-sm text-slate-500">{s.designation}. No subject assignments stored yet.</p></Card> : (
            <TableShell columns={["Subject", "Class", "Section", "Year"]}>
              {ws!.assignments.map((a) => (
                <tr key={a.id}><td className="px-4 py-3">{a.subject}</td><td className="px-4 py-3">{a.className}</td><td className="px-4 py-3">{a.sectionName}</td><td className="px-4 py-3">{a.year}</td></tr>
              ))}
            </TableShell>
          )
        ) : null}
        {tab === "classes" ? (
          (ws?.assignments ?? []).length === 0 ? <EmptyState title="No classes" body="Assignments appear after a teacher is mapped to a section." /> : (
            <div className="grid gap-3 sm:grid-cols-2">
              {ws!.assignments.map((a) => (
                <button key={a.id} type="button" className="rounded-2xl border border-line bg-white p-4 text-left shadow-card" onClick={() => navigate(`/app/classes/${a.classId}/sections/${a.sectionId}`)}>
                  <p className="font-semibold">{a.className} · {a.sectionName}</p>
                  <p className="text-sm text-slate-500">{a.subject} · {a.year}</p>
                </button>
              ))}
            </div>
          )
        ) : null}
        {tab === "students" ? (
          (ws?.students ?? []).length === 0 ? <EmptyState title="No roster preview" body="Assigned section students will list here." /> : (
            <TableShell columns={["Admission", "Student", "Class"]}>
              {ws!.students.map((row) => (
                <tr key={row.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/app/students/${row.id}`)}>
                  <td className="px-4 py-3">{row.admissionNumber}</td>
                  <td className="px-4 py-3 font-medium">{row.fullName}</td>
                  <td className="px-4 py-3">{row.className} {row.sectionName}</td>
                </tr>
              ))}
            </TableShell>
          )
        ) : null}
        {tab === "timetable" ? (
          (ws?.timetable ?? []).length === 0 ? <EmptyState title="No periods" body="Timetable slots for this teacher will appear after they are published." /> : (
            <TableShell columns={["Day", "Time", "Class", "Subject", "Room"]}>
              {ws!.timetable.map((slot) => (
                <tr key={slot.id}>
                  <td className="px-4 py-3">{["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][slot.dayOfWeek] ?? slot.dayOfWeek}</td>
                  <td className="px-4 py-3">{slot.startTime}–{slot.endTime}</td>
                  <td className="px-4 py-3">{slot.className} {slot.sectionName}</td>
                  <td className="px-4 py-3">{slot.subject}</td>
                  <td className="px-4 py-3">{slot.room}</td>
                </tr>
              ))}
            </TableShell>
          )
        ) : null}
        {tab === "attendance" ? (
          <Card><p className="text-sm text-slate-500">Staff daily attendance is recorded on Staff Attendance. This teacher has {ws?.leave.length ?? 0} leave rows and {ws?.assignments.length ?? 0} teaching assignments.</p></Card>
        ) : null}
        {tab === "homework" ? (
          (ws?.homework ?? []).length === 0 ? <EmptyState title="No homework" body="Homework created by this teacher will appear here." /> : (
            <TableShell columns={["Title", "Class", "Due"]}>
              {ws!.homework.map((h) => (
                <tr key={h.id}><td className="px-4 py-3">{h.title}</td><td className="px-4 py-3">{h.className} {h.sectionName}</td><td className="px-4 py-3">{formatDate(h.dueDate)}</td></tr>
              ))}
            </TableShell>
          )
        ) : null}
        {tab === "exams" || tab === "marks" ? (
          <Card><p className="text-sm text-slate-500">Exam schedules and mark entry live in Exams & Results. This profile is scoped to {s.fullName}'s assigned classes.</p></Card>
        ) : null}
        {tab === "leave" ? (
          (ws?.leave ?? []).length === 0 ? <EmptyState title="No leave" body="Leave requests for this teacher will appear here." /> : (
            <TableShell columns={["Type", "Dates", "Status"]}>
              {ws!.leave.map((l) => (
                <tr key={l.id}><td className="px-4 py-3">{l.leaveType}</td><td className="px-4 py-3">{formatDate(l.startDate)} – {formatDate(l.endDate)}</td><td className="px-4 py-3"><Badge tone={statusTone(l.status)}>{l.status}</Badge></td></tr>
              ))}
            </TableShell>
          )
        ) : null}
        {tab === "documents" ? (
          <TableShell columns={["Document", "Reference"]}>
            <tr><td className="px-4 py-3">Employee ID</td><td className="px-4 py-3">{s.employeeCode}</td></tr>
            <tr><td className="px-4 py-3">Qualification</td><td className="px-4 py-3">{s.qualification || "—"}</td></tr>
          </TableShell>
        ) : null}
      </div>
    </div>
  );
}

export function GuardiansPage() {
  const [q, setQ] = useState("");
  const queryQ = useQuery({
    queryKey: ["guardians", q],
    queryFn: () => api<PageResponse<GuardianRow>>(`/api/guardians?q=${encodeURIComponent(q)}&size=25`),
  });
  const query = useLiveOrDemo(queryQ, { items: demoGuardians, total: demoGuardians.length, page: 0, size: 25 });
  const rows = query.data?.items ?? [];
  return (
    <div>
      <PageHeader crumbs={["People"]} title="Guardians" subtitle="Linked family contacts. Guardian create is only available while adding a student." action={<Input className="w-64" placeholder="Search guardians" value={q} onChange={(e) => setQ(e.target.value)} />} />
      {query.isLoading ? <Skeleton className="h-64" /> : rows.length === 0 ? (
        <EmptyState title="No guardians" body="Guardian rows appear after they are stored in the directory." />
      ) : (
        <TableShell columns={["Guardian", "Mobile", "Email", "Status"]}>
          {rows.map((g) => (
            <tr key={g.id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={g.fullName} size="sm" />
                  <span className="font-medium text-ink-900">{g.fullName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">{g.mobile}</td>
              <td className="px-4 py-3 text-slate-600">{g.email || "—"}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(g.status)}>{g.status ?? "—"}</Badge></td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}
