import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { api, post } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useChildScope } from "../lib/child";
import { asId, asName, asRecord, formatDate, str, todayIso, unwrapList } from "../lib/format";
import { canTeach, isAdminLike } from "../lib/roles";
import type { AcademicYear, ExamRow, PageResponse, SchoolClass, Section, StaffRow, Student, Subject } from "../lib/types";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  TableShell,
  Tabs,
  Textarea,
  statusTone,
} from "../components/ui";
import { DemoChip } from "../components/brand";
import { useLiveOrDemo } from "../demo/useLiveOrDemo";
import { demoExams, demoHomework, demoTimetable, demoYears } from "../demo";
import { SCHOOL_NAME } from "../demo/config";
import { AttendanceCalendarPage } from "./PortalPages";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function TimetablePage() {
  const { user } = useAuth();
  const { selected } = useChildScope();
  const yearsQ = useQuery({ queryKey: ["years"], queryFn: () => api<AcademicYear[]>("/api/academic-years") });
  const years = useLiveOrDemo(yearsQ, demoYears);
  const [yearId, setYearId] = useState("");
  const selectedYear = yearId || years.data?.[0]?.id || "";
  const familyId = user?.role === "PARENT" || user?.role === "STUDENT" ? selected?.id : undefined;
  const skipApi = selectedYear.startsWith("demo-") || Boolean(familyId?.startsWith("demo-"));
  const slotsQ = useQuery({
    queryKey: ["timetable", selectedYear, familyId],
    enabled: Boolean(selectedYear) && !skipApi,
    queryFn: () =>
      api<unknown[]>(
        familyId
          ? `/api/timetable?academicYearId=${selectedYear}&studentId=${familyId}`
          : `/api/timetable?academicYearId=${selectedYear}`
      ),
  });
  const slots = useLiveOrDemo(slotsQ, demoTimetable);
  const [open, setOpen] = useState(false);
  const rows = unwrapList(slots.data);
  const byDay = useMemo(() => {
    const map: Record<number, Array<Record<string, unknown>>> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
    rows.forEach((r) => {
      const rec = asRecord(r);
      const day = Number(rec.dayOfWeek ?? 1);
      (map[day] ?? (map[day] = [])).push(rec);
    });
    return map;
  }, [rows]);

  return (
    <div>
      <PageHeader
        crumbs={["Academics"]}
        title="Timetable"
        subtitle={
          selected
            ? `${selected.fullName} · ${years.data?.find((y) => y.id === selectedYear)?.name ?? "Schedule"}`
            : years.data?.find((y) => y.id === selectedYear)?.name ?? "Select an academic year"
        }
        action={
          <div className="flex gap-2">
            <Select className="w-48" value={selectedYear} onChange={(e) => setYearId(e.target.value)}>
              {(years.data ?? []).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
            </Select>
            {isAdminLike(user?.role) ? <Button onClick={() => setOpen(true)}>Add period</Button> : null}
          </div>
        }
      />
      {slots.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      {slots.isLoading ? <Skeleton className="h-80" /> : rows.length === 0 ? (
        <EmptyState title="No periods yet" body="Timetable slots appear after admins publish the schedule for this year." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((day) => (
            <Card key={day} className="bg-gradient-to-b from-white to-slate-50">
              <p className="mb-3 text-sm font-semibold text-ink-900">{DAYS[day - 1]}</p>
              <div className="grid gap-2">
                {(byDay[day] ?? []).length === 0 ? <p className="text-xs text-slate-400">No periods</p> : (byDay[day] ?? []).map((slot, i) => (
                  <div key={asId(slot.id) || i} className="rounded-xl border border-line/80 bg-white px-3 py-2 shadow-sm">
                    <p className="text-sm font-semibold">{str(slot.startTime)} – {str(slot.endTime)}</p>
                    <p className="text-xs text-slate-500">{asName(slot.subject) || "Subject"} · {str(slot.room, "Room TBA")}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
      <TimetableForm open={open} yearId={selectedYear.startsWith("demo-") ? "" : selectedYear} onClose={() => setOpen(false)} />
    </div>
  );
}

function TimetableForm({ open, yearId, onClose }: { open: boolean; yearId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const classes = useQuery({ queryKey: ["classes"], queryFn: () => api<SchoolClass[]>("/api/classes") });
  const subjects = useQuery({ queryKey: ["subjects"], queryFn: () => api<Subject[]>("/api/subjects") });
  const staff = useQuery({ queryKey: ["staff"], queryFn: () => api<StaffRow[]>("/api/staff") });
  const [classId, setClassId] = useState("");
  const sections = useQuery({
    queryKey: ["sections", classId],
    enabled: Boolean(classId),
    queryFn: () => api<Section[]>(`/api/classes/${classId}/sections`),
  });
  const [form, setForm] = useState({
    classId: "",
    sectionId: "",
    subjectId: "",
    staffId: "",
    dayOfWeek: "1",
    startTime: "09:00",
    endTime: "09:45",
    room: "",
  });
  const save = useMutation({
    mutationFn: () =>
      post("/api/timetable", {
        academicYearId: yearId,
        classId: form.classId,
        sectionId: form.sectionId,
        subjectId: form.subjectId,
        staffId: form.staffId,
        dayOfWeek: Number(form.dayOfWeek),
        startTime: form.startTime,
        endTime: form.endTime,
        room: form.room,
      }),
    onSuccess: () => {
      toast.success("Period saved");
      qc.invalidateQueries({ queryKey: ["timetable"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Modal open={open} title="Add period" onClose={onClose} wide>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Class">
          <Select value={form.classId} onChange={(e) => { setForm({ ...form, classId: e.target.value, sectionId: "" }); setClassId(e.target.value); }}>
            <option value="">Select</option>
            {(classes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Section">
          <Select value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })}>
            <option value="">Select</option>
            {(sections.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Subject">
          <Select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
            <option value="">Select</option>
            {(subjects.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Teacher">
          <Select value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })}>
            <option value="">Select</option>
            {(staff.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
          </Select>
        </Field>
        <Field label="Day">
          <Select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}>
            {DAYS.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
          </Select>
        </Field>
        <Field label="Room"><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></Field>
        <Field label="Start"><Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></Field>
        <Field label="End"><Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={() => save.mutate()}>Save period</Button>
      </div>
    </Modal>
  );
}

export function AttendancePage() {
  const { user } = useAuth();
  const canMark = canTeach(user?.role);
  const classes = useQuery({ queryKey: ["classes"], queryFn: () => api<SchoolClass[]>("/api/classes") });
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(todayIso());
  const [marks, setMarks] = useState<Record<string, string>>({});
  const sections = useQuery({
    queryKey: ["sections", classId],
    enabled: Boolean(classId),
    queryFn: () => api<Section[]>(`/api/classes/${classId}/sections`),
  });
  const scoped = useQuery({
    queryKey: ["students", classId],
    enabled: Boolean(classId),
    queryFn: () => api<PageResponse<Student>>(`/api/students?classId=${classId}&size=100`),
  });
  const roster = (scoped.data?.items ?? []).filter((s) => !sectionId || s.sectionId === sectionId);
  const years = useQuery({ queryKey: ["years"], queryFn: () => api<AcademicYear[]>("/api/academic-years") });
  const save = useMutation({
    mutationFn: () =>
      post("/api/attendance", {
        sectionId,
        academicYearId: years.data?.[0]?.id,
        date,
        session: "FULL_DAY",
        entries: roster.map((s) => ({ studentId: s.id, status: marks[s.id] || "PRESENT" })),
      }),
    onSuccess: () => toast.success("Attendance saved"),
    onError: (e: Error) => toast.error(e.message),
  });

  if (!canMark) {
    return <AttendanceCalendarPage />;
  }

  return (
    <div>
      <PageHeader
        crumbs={["Academics"]}
        title="Attendance"
        subtitle="Mark a section for a date. Already-marked sessions are rejected by the API."
        action={<Button disabled={!sectionId || roster.length === 0 || save.isPending} onClick={() => save.mutate()}>Save attendance</Button>}
      />
      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <Select value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}>
          <option value="">Class</option>
          {(classes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
          <option value="">Section</option>
          {(sections.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setMarks(Object.fromEntries(roster.map((s) => [s.id, "PRESENT"])))}>All present</Button>
        </div>
      </div>
      {!sectionId ? (
        <EmptyState title="Choose a class and section" body="The roster is loaded from real student records for that class." />
      ) : roster.length === 0 ? (
        <EmptyState title="No students in this section" body="Assign students to the section first." />
      ) : (
        <TableShell columns={["Student", "Admission", "Status"]}>
          {roster.map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-3 font-medium">{s.fullName}</td>
              <td className="px-4 py-3">{s.admissionNumber}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {["PRESENT", "ABSENT", "LATE"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${ (marks[s.id] || "PRESENT") === st ? "bg-ink-900 text-white" : "bg-slate-100 text-slate-600"}`}
                      onClick={() => setMarks((m) => ({ ...m, [s.id]: st }))}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}

export function HomeworkPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const homeworkQ = useQuery({ queryKey: ["homework"], queryFn: () => api<unknown[]>("/api/homework") });
  const homework = useLiveOrDemo(homeworkQ, demoHomework);
  const rows = unwrapList(homework.data);
  const today = todayIso();
  const tabRows = (kind: string) =>
    rows.filter((r) => {
      const due = String(asRecord(r).dueDate ?? "");
      if (kind === "overdue") return due && due < today;
      if (kind === "upcoming") return due >= today;
      return true;
    });
  const [tab, setTab] = useState("all");
  const shown = tab === "all" ? rows : tabRows(tab);
  const submit = useMutation({
    mutationFn: (id: string) => post(`/api/homework/${id}/submit`),
    onSuccess: () => toast.success("Homework submitted"),
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <PageHeader
        crumbs={["Academics"]}
        title="Homework"
        subtitle="Assignments published to sections you can see."
        action={canTeach(user?.role) ? <Button onClick={() => setOpen(true)}>New assignment</Button> : null}
      />
      {homework.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      <div className="mb-4">
        <Tabs value={tab} onChange={setTab} tabs={[{ id: "all", label: "All" }, { id: "upcoming", label: "Upcoming" }, { id: "overdue", label: "Overdue" }]} />
      </div>
      {homework.isLoading ? <Skeleton className="h-64" /> : homework.isError ? (
        <EmptyState title="Could not load homework" body="The homework API did not respond." />
      ) : shown.length === 0 ? (
        <EmptyState title="No homework" body="Assignments will appear here when teachers publish them." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {shown.map((item, i) => {
            const r = asRecord(item);
            const due = str(r.dueDate);
            const overdue = due !== "—" && due < today;
            return (
              <Card key={asId(r.id) || i}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{str(r.title)}</p>
                    <p className="mt-1 text-sm text-slate-500">{str(r.subject) !== "—" ? `${str(r.subject)} · ` : ""}{str(r.description)}</p>
                {str(r.teacher) !== "—" ? <p className="mt-1 text-xs text-slate-400">{str(r.teacher)}</p> : null}
                  </div>
                  <Badge tone={overdue ? "bad" : "info"}>Due {formatDate(due === "—" ? undefined : due)}</Badge>
                </div>
                {user?.role === "STUDENT" ? (
                  <Button className="mt-4" size="sm" onClick={() => submit.mutate(asId(r.id))}>Submit</Button>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
      <HomeworkForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function HomeworkForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const years = useQuery({ queryKey: ["years"], queryFn: () => api<AcademicYear[]>("/api/academic-years") });
  const classes = useQuery({ queryKey: ["classes"], queryFn: () => api<SchoolClass[]>("/api/classes") });
  const subjects = useQuery({ queryKey: ["subjects"], queryFn: () => api<Subject[]>("/api/subjects") });
  const [classId, setClassId] = useState("");
  const sections = useQuery({
    queryKey: ["sections", classId],
    enabled: Boolean(classId),
    queryFn: () => api<Section[]>(`/api/classes/${classId}/sections`),
  });
  const [form, setForm] = useState({ title: "", description: "", dueDate: todayIso(), classId: "", sectionId: "", subjectId: "", academicYearId: "" });
  const save = useMutation({
    mutationFn: () => post("/api/homework", { ...form, academicYearId: form.academicYearId || years.data?.[0]?.id }),
    onSuccess: () => {
      toast.success("Assignment published successfully");
      qc.invalidateQueries({ queryKey: ["homework"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Modal open={open} title="New assignment" onClose={onClose} wide>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" required><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Due date" required><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
        <Field label="Class">
          <Select value={form.classId} onChange={(e) => { setForm({ ...form, classId: e.target.value, sectionId: "" }); setClassId(e.target.value); }}>
            <option value="">Select</option>
            {(classes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Section">
          <Select value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })}>
            <option value="">Select</option>
            {(sections.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Subject">
          <Select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
            <option value="">Select</option>
            {(subjects.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Year">
          <Select value={form.academicYearId} onChange={(e) => setForm({ ...form, academicYearId: e.target.value })}>
            <option value="">Active / default</option>
            {(years.data ?? []).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Description" required><Textarea className="mt-3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={() => save.mutate()}>Publish</Button>
      </div>
    </Modal>
  );
}

export function ExamsPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [examId, setExamId] = useState("");
  const [studentId, setStudentId] = useState("");
  const examsQ = useQuery({ queryKey: ["exams"], queryFn: () => api<ExamRow[]>("/api/exams") });
  const exams = useLiveOrDemo(examsQ, demoExams);
  const years = useQuery({ queryKey: ["years"], queryFn: () => api<AcademicYear[]>("/api/academic-years") });
  const students = useQuery({ queryKey: ["students"], queryFn: () => api<PageResponse<Student>>("/api/students?size=50") });
  const subjects = useQuery({
    queryKey: ["exam-subjects", examId],
    enabled: Boolean(examId) && !examId.startsWith("demo-"),
    queryFn: () => api<Array<{ id: string; subject: string; className: string; maxMarks: number }>>(`/api/exams/${examId}/subjects`),
  });
  const report = useQuery({
    queryKey: ["report-card", studentId, examId],
    enabled: Boolean(studentId && examId) && !examId.startsWith("demo-") && !studentId.startsWith("demo-"),
    queryFn: () => api<{ student: string; total: number; max: number; percentage: number; grade: string; subjects: number }>(
      `/api/report-cards?studentId=${studentId}&examId=${examId}`
    ),
  });
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", examType: "TERM", startDate: todayIso(), endDate: todayIso(), academicYearId: "" });
  const create = useMutation({
    mutationFn: () => post("/api/exams", { ...form, academicYearId: form.academicYearId || years.data?.[0]?.id }),
    onSuccess: () => {
      toast.success("Exam created successfully");
      qc.invalidateQueries({ queryKey: ["exams"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        crumbs={["Academics"]}
        title="Exams & results"
        subtitle="Schedules, subject papers and report cards. Marks cannot exceed the maximum set on each paper."
        action={canTeach(user?.role) ? <Button onClick={() => setOpen(true)}>Create exam</Button> : null}
      />
      {exams.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      {exams.isLoading ? <Skeleton className="h-48" /> : (exams.data ?? []).length === 0 ? (
        <EmptyState title="No exams yet" body="Create an exam to start scheduling papers. Subject papers appear only after they exist in the database." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(exams.data ?? []).map((e) => (
            <Card key={e.id} className={examId === e.id ? "ring-2 ring-accent-600" : ""}>
              <button className="w-full text-left" onClick={() => setExamId(e.id)}>
                <div className="flex items-start justify-between">
                  <p className="font-semibold">{e.name}</p>
                  <Badge tone={statusTone(e.status)}>{e.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">{e.examType} · {formatDate(e.startDate)} – {formatDate(e.endDate)}</p>
                <p className="text-xs text-slate-400">{e.academicYear}</p>
              </button>
            </Card>
          ))}
        </div>
      )}

      {examId ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <p className="mb-3 font-semibold">Exam papers</p>
            {(subjects.data ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">No subject papers are linked to this exam yet. Marks entry needs an exam subject id from this list.</p>
            ) : (
              <div className="grid gap-2">
                {(subjects.data ?? []).map((s) => (
                  <div key={s.id} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    <span>{s.subject} · {s.className}</span>
                    <span className="text-slate-500">Max {s.maxMarks}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card>
            <p className="mb-3 font-semibold">Report card</p>
            <Field label="Student">
              <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                <option value="">Select student</option>
                {(students.data?.items ?? []).map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </Select>
            </Field>
            {report.data ? (
              <div className="mt-4 rounded-2xl border border-line bg-canvas p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{SCHOOL_NAME}</p>
                <p className="mt-2 font-display text-2xl">{report.data.student}</p>
                <p className="mt-4 font-display text-4xl">{report.data.percentage}%</p>
                <p className="text-sm text-slate-500">Grade {report.data.grade} · {report.data.total} / {report.data.max} · {report.data.subjects} subjects</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Select a student to load a real report card for this exam.</p>
            )}
          </Card>
        </div>
      ) : null}

      <Modal open={open} title="Create exam" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          <Field label="Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Type">
            <Select value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
              <option>TERM</option><option>UNIT</option><option>FINAL</option>
            </Select>
          </Field>
          <Field label="Start"><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
          <Field label="End"><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
          <Field label="Year">
            <Select value={form.academicYearId} onChange={(e) => setForm({ ...form, academicYearId: e.target.value })}>
              {(years.data ?? []).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
            </Select>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => create.mutate()}>Create</Button>
        </div>
      </Modal>
    </div>
  );
}
