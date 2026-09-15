import { useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, post, put } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useChildScope } from "../lib/child";
import { formatDate, formatMoney, formatNumber } from "../lib/format";
import { isAdminLike } from "../lib/roles";
import type { DashboardAnalytics, DashboardData, ExamRow, Invoice, LeaveRow, PageResponse, Student } from "../lib/types";
import { Badge, Button, Card, EmptyState, ErrorState, Field, Input, Modal, PageHeader, Select, Skeleton, StatCard, TableShell, Textarea, statusTone } from "../components/ui";
import { DemoChip } from "../components/brand";
import { CampusMosaic, InsightKicker, Ornament, PersonCard } from "../components/visual";
import { MediaImage } from "../components/media";
import { sectionImageForPath } from "../lib/mediaCatalog";
import { useLiveOrDemo } from "../demo/useLiveOrDemo";
import { demoExams } from "../demo";
import { SCHOOL_NAME } from "../demo/config";

const BusScene = lazy(() => import("../components/3d/BusScene").then((m) => ({ default: m.BusScene })));

export function BusTrackingPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { selected } = useChildScope();
  const trips = useQuery({
    queryKey: ["transport-trips-live"],
    queryFn: () => api<Array<{
      id: string;
      route: string;
      tripType: string;
      status: string;
      latitude?: number | string;
      longitude?: number | string;
      speedKmh?: number | string;
      lastPingAt?: string;
    }>>("/api/transport/trips"),
  });
  const rows = trips.data ?? [];
  const [activeId, setActiveId] = useState("");
  const active = rows.find((t) => t.id === activeId) ?? rows[0];
  const ping = useMutation({
    mutationFn: (tripId: string) =>
      post(`/api/transport/trips/${tripId}/locations`, {
        latitude: 28.6139 + Math.random() * 0.02,
        longitude: 77.209 + Math.random() * 0.02,
        speedKmh: 20 + Math.round(Math.random() * 15),
        note: "Portal ping",
      }),
    onSuccess: () => {
      toast.success("Location ping recorded");
      void qc.invalidateQueries({ queryKey: ["transport-trips-live"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const hasLive = rows.some((r) => r.latitude != null);
  return (
    <div>
      <PageHeader
        crumbs={["Transport"]}
        title="Bus tracking"
        subtitle="Live trips and GPS pings. The map shows an indicative route until the first ping arrives."
        action={hasLive ? <Badge tone="good">Live GPS</Badge> : <Badge tone="warn">Awaiting GPS ping</Badge>}
      />
      {trips.isLoading ? <Skeleton className="h-64" /> : rows.length === 0 ? (
        <EmptyState title="No trips today" body="Create or seed trips for today’s date, then ping a location from an admin account." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card padded={false} className="relative min-h-[320px] overflow-hidden p-6">
            {active?.latitude != null ? (
              <div>
                <p className="font-display text-2xl">{active.route}</p>
                <p className="mt-2 text-sm text-slate-600">{active.tripType} · {active.status}</p>
                <dl className="mt-6 grid gap-3 sm:grid-cols-2 text-sm">
                  <div><dt className="text-slate-500">Latitude</dt><dd className="font-semibold">{String(active.latitude)}</dd></div>
                  <div><dt className="text-slate-500">Longitude</dt><dd className="font-semibold">{String(active.longitude)}</dd></div>
                  <div><dt className="text-slate-500">Speed</dt><dd className="font-semibold">{active.speedKmh ? `${active.speedKmh} km/h` : "—"}</dd></div>
                  <div><dt className="text-slate-500">Last ping</dt><dd className="font-semibold">{active.lastPingAt ? formatDate(active.lastPingAt) : "—"}</dd></div>
                </dl>
                <p className="mt-4 text-xs text-slate-500">Child scope: {selected?.fullName ?? "—"}</p>
              </div>
            ) : (
              <div>
                <p className="font-display text-2xl">{active?.route ?? "Trip"}</p>
                <p className="mt-2 text-sm text-slate-600">No GPS ping yet for this trip.</p>
                <div className="mt-4 min-h-[220px]">
                  <Suspense fallback={<div className="min-h-[220px] animate-pulse bg-[#F4F4F5]" />}>
                    <BusScene progress={0.35} code={active?.route?.slice(0, 6) ?? "BUS"} className="h-full min-h-[220px]" />
                  </Suspense>
                </div>
              </div>
            )}
          </Card>
          <div className="grid gap-3">
            {rows.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveId(t.id)}
                className={`rounded-2xl border p-4 text-left ${active?.id === t.id ? "border-forest-600 bg-white shadow-card" : "border-line bg-white/70"}`}
              >
                <p className="font-semibold">{t.route}</p>
                <p className="text-sm text-slate-500">{t.tripType}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                  {t.latitude != null ? <span className="text-xs text-forest-700">GPS</span> : null}
                </div>
                {isAdminLike(user?.role) ? (
                  <Button className="mt-3" size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); ping.mutate(t.id); }}>
                    Ping location
                  </Button>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ChildrenHubPage() {
  const { children, selected, setSelectedId, isDemo } = useChildScope();
  if (!children.length) return <EmptyState title="No children linked" body="The API did not return linked students for this parent account." />;
  return (
    <div>
      <PageHeader title="My children" subtitle={`${SCHOOL_NAME} family portal — switch child from the header or here.`} />
      {isDemo ? <p className="mb-4 text-sm text-amber-800">Demo children — shown only because the API returned no linked students.</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {children.map((c) => (
          <PersonCard
            key={c.id}
            name={c.fullName}
            meta={`${c.admissionNumber} · ${c.className}-${c.sectionName}`}
            detail={`${c.branchName} · Class teacher: Rohan Mehta`}
            active={selected?.id === c.id}
            onClick={() => setSelectedId(c.id)}
            image={sectionImageForPath("/app/students")}
          />
        ))}
      </div>
      {selected ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/app/attendance">
            <Button variant="secondary" className="w-full">
              Attendance
            </Button>
          </Link>
          <Link to="/app/timetable">
            <Button variant="secondary" className="w-full">
              Timetable
            </Button>
          </Link>
          <Link to="/app/homework">
            <Button variant="secondary" className="w-full">
              Homework
            </Button>
          </Link>
          <Link to="/app/bus-tracking">
            <Button variant="secondary" className="w-full">
              Bus
            </Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function MarksResultsPage() {
  const { user } = useAuth();
  const { selected } = useChildScope();
  const qc = useQueryClient();
  const canEnter = isAdminLike(user?.role) || user?.role === "TEACHER";
  const examsQ = useQuery({ queryKey: ["exams"], queryFn: () => api<ExamRow[]>("/api/exams") });
  const exams = useLiveOrDemo(examsQ, demoExams);
  const [examId, setExamId] = useState("");
  const [examSubjectId, setExamSubjectId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [marksObtained, setMarksObtained] = useState("");
  const [remarks, setRemarks] = useState("");
  const liveExam = (exams.data ?? []).find((e) => e.id === examId) ?? (exams.data ?? []).find((e) => e.id && !e.id.startsWith("demo-"));
  const subjects = useQuery({
    queryKey: ["exam-subjects", examId || liveExam?.id],
    enabled: Boolean(examId || liveExam?.id) && !(examId || liveExam?.id || "").startsWith("demo-"),
    queryFn: () =>
      api<Array<{ id: string; subject?: string; subjectName?: string; name?: string; maxMarks: number }>>(
        `/api/exams/${examId || liveExam!.id}/subjects`
      ),
  });
  const students = useQuery({
    queryKey: ["students-for-marks"],
    enabled: canEnter,
    queryFn: () => api<PageResponse<Student>>("/api/students?size=100"),
  });
  const canLiveCard = Boolean(selected?.id && liveExam?.id && !selected.id.startsWith("demo-"));
  const report = useQuery({
    queryKey: ["report-card", selected?.id, liveExam?.id],
    enabled: canLiveCard,
    queryFn: () =>
      api<{ student: string; total: number; max: number; percentage: number; grade: string; subjects: number }>(
        `/api/report-cards?studentId=${selected!.id}&examId=${liveExam!.id}`
      ),
  });
  const saveMarks = useMutation({
    mutationFn: () =>
      post("/api/marks", {
        examSubjectId,
        studentId,
        marksObtained: Number(marksObtained),
        remarks: remarks || undefined,
      }),
    onSuccess: () => {
      toast.success("Marks saved");
      setMarksObtained("");
      setRemarks("");
      void qc.invalidateQueries({ queryKey: ["report-card"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <PageHeader
        title="Marks, results & report cards"
        subtitle={
          canEnter
            ? "Enter or update marks for exam subjects. Parents and students only see published results."
            : selected
              ? `${selected.fullName} · ${selected.className}-${selected.sectionName}`
              : "Exam records and published report cards."
        }
      />
      {exams.isDemo ? <DemoChip show /> : null}
      {canEnter ? (
        <Card className="mb-6">
          <p className="font-display text-xl text-ink-900">Enter / update marks</p>
          <p className="mt-1 text-sm text-slate-500">Saving the same student + exam subject again updates the existing mark.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Exam" required>
              <Select value={examId} onChange={(e) => { setExamId(e.target.value); setExamSubjectId(""); }}>
                <option value="">Select exam</option>
                {(exams.data ?? []).filter((e) => !String(e.id).startsWith("demo-")).map((e) => (
                  <option key={e.id} value={e.id}>{e.name} ({e.status})</option>
                ))}
              </Select>
            </Field>
            <Field label="Exam subject" required>
              <Select value={examSubjectId} onChange={(e) => setExamSubjectId(e.target.value)} disabled={!examId}>
                <option value="">Select subject</option>
                {(subjects.data ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.subject || s.subjectName || s.name || "Subject"} · max {s.maxMarks}</option>
                ))}
              </Select>
            </Field>
            <Field label="Student" required>
              <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                <option value="">Select student</option>
                {(students.data?.items ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName} · {s.admissionNumber}</option>
                ))}
              </Select>
            </Field>
            <Field label="Marks obtained" required>
              <Input type="number" min={0} step="0.5" value={marksObtained} onChange={(e) => setMarksObtained(e.target.value)} />
            </Field>
            <Field label="Remarks">
              <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </Field>
          </div>
          <div className="mt-4">
            <Button
              disabled={!examSubjectId || !studentId || marksObtained === "" || saveMarks.isPending}
              onClick={() => saveMarks.mutate()}
            >
              Save marks
            </Button>
          </div>
        </Card>
      ) : null}
      {exams.isLoading ? (
        <Skeleton className="h-40" />
      ) : exams.isError ? (
        <EmptyState title="Could not load exams" body="Retry after the API is reachable." />
      ) : (exams.data ?? []).length === 0 ? (
        <EmptyState title="No exams published" body="Exam windows appear here once the academic office creates them." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(exams.data ?? []).map((e) => (
            <Card key={e.id}>
              <div className="flex justify-between">
                <p className="font-semibold">{e.name}</p>
                <Badge tone={statusTone(e.status)}>{e.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {formatDate(e.startDate)} – {formatDate(e.endDate)}
              </p>
              <p className="text-xs text-slate-400">{e.examType}</p>
            </Card>
          ))}
        </div>
      )}
      {report.isLoading ? <Skeleton className="mt-6 h-48" /> : report.data ? (
        <Card className="mt-6">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{SCHOOL_NAME}</p>
          <p className="mt-2 font-display text-3xl">{report.data.student}</p>
          <p className="mt-4 font-display text-[clamp(1.75rem,4vw,2.5rem)]">{report.data.percentage}%</p>
          <p className="text-sm text-slate-500">
            Grade {report.data.grade} · {report.data.total}/{report.data.max} · {report.data.subjects} subjects
          </p>
        </Card>
      ) : (
        <div className="mt-6">
          <EmptyState
            title={selected ? "No report card for this exam yet" : "Select a student to load a report card"}
            body={selected ? "Marks exist for a subset of students. Open a student with published papers, or wait until results are entered." : "Parents and students see a card when a child is linked. Staff can open a student profile first."}
          />
        </div>
      )}
    </div>
  );
}

export function StaffAttendancePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const canMark = isAdminLike(user?.role);
  const canView = canMark || user?.role === "ACCOUNTANT" || user?.role === "TEACHER";
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [view, setView] = useState<"day" | "month">("day");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const list = useQuery({
    queryKey: ["staff-attendance", date, user?.role],
    enabled: canView && (view === "day" || user?.role === "TEACHER"),
    queryFn: () =>
      api<{ id: string; staffId: string; name: string; employeeCode: string; status: string; remarks: string; date?: string }[]>(
        user?.role === "TEACHER" ? "/api/staff-attendance" : `/api/staff-attendance?date=${date}`
      ),
  });
  const summary = useQuery({
    queryKey: ["staff-attendance-summary", month],
    enabled: canView && view === "month" && user?.role !== "TEACHER",
    queryFn: () => {
      const [y, m] = month.split("-").map(Number);
      const from = `${month}-01`;
      const last = new Date(y, m, 0).getDate();
      const to = `${month}-${String(last).padStart(2, "0")}`;
      return api<{
        from: string;
        to: string;
        staff: Array<{ staffId: string; name: string; employeeCode: string; present: number; absent: number; late: number; leave: number; total: number; percentage: number }>;
      }>(`/api/staff-attendance/summary?from=${from}&to=${to}`);
    },
  });
  const teacherMonth = useQuery({
    queryKey: ["staff-attendance-summary-mine", month],
    enabled: user?.role === "TEACHER" && view === "month",
    queryFn: () => {
      const [y, m] = month.split("-").map(Number);
      const from = `${month}-01`;
      const last = new Date(y, m, 0).getDate();
      const to = `${month}-${String(last).padStart(2, "0")}`;
      return api<{
        staff: Array<{ name: string; present: number; absent: number; late: number; leave: number; total: number; percentage: number }>;
      }>(`/api/staff-attendance/summary?from=${from}&to=${to}`);
    },
  });
  const staff = useQuery({
    queryKey: ["staff-roster"],
    enabled: canMark,
    queryFn: () => api<Array<{ id: string; fullName: string; employeeCode: string }>>("/api/staff"),
  });
  const markedIds = new Set((list.data ?? []).map((r) => r.staffId));
  const unmarked = (staff.data ?? []).filter((s) => !markedIds.has(s.id));
  const save = useMutation({
    mutationFn: () => {
      const entries = unmarked
        .map((s) => ({ staffId: s.id, status: draft[s.id] || "PRESENT", remarks: "" }))
        .filter((e) => draft[e.staffId]);
      if (!entries.length) throw new Error("Set status for at least one staff member");
      return post("/api/staff-attendance", { date, entries });
    },
    onSuccess: () => {
      toast.success("Staff attendance saved");
      setDraft({});
      void qc.invalidateQueries({ queryKey: ["staff-attendance"] });
      void qc.invalidateQueries({ queryKey: ["staff-attendance-summary"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  if (!canView) {
    return <EmptyState title="Staff attendance" body="Only campus admins, accountants, and teachers (own history) can view staff attendance." />;
  }
  const monthRows = user?.role === "TEACHER" ? (teacherMonth.data?.staff ?? []) : (summary.data?.staff ?? []);
  return (
    <div>
      <PageHeader
        title="Staff attendance"
        subtitle={user?.role === "TEACHER" ? "Your attendance history and monthly percentage." : "Mark teacher/staff attendance. Separate from student attendance."}
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <Select className="w-40" value={view} onChange={(e) => setView(e.target.value as "day" | "month")}>
          <option value="day">Day view</option>
          <option value="month">Monthly report</option>
        </Select>
        {view === "day" && user?.role !== "TEACHER" ? (
          <Input type="date" className="max-w-xs" value={date} onChange={(e) => setDate(e.target.value)} />
        ) : null}
        {view === "month" ? (
          <Input type="month" className="max-w-xs" value={month} onChange={(e) => setMonth(e.target.value)} />
        ) : null}
      </div>
      {view === "month" ? (
        (user?.role === "TEACHER" ? teacherMonth.isLoading : summary.isLoading) ? (
          <Skeleton className="h-48" />
        ) : monthRows.length === 0 ? (
          <EmptyState title="No attendance in this month" body="Mark daily attendance to build the monthly report." />
        ) : (
          <TableShell columns={["Staff", "Present", "Absent", "Late", "Leave", "Total", "%"]}>
            {monthRows.map((r, i) => (
              <tr key={"staffId" in r ? String((r as { staffId?: string }).staffId) : String(i)}>
                <td className="px-4 py-3">{r.name}{"employeeCode" in r && (r as { employeeCode?: string }).employeeCode ? ` (${(r as { employeeCode?: string }).employeeCode})` : ""}</td>
                <td className="px-4 py-3">{r.present}</td>
                <td className="px-4 py-3">{r.absent}</td>
                <td className="px-4 py-3">{r.late}</td>
                <td className="px-4 py-3">{r.leave}</td>
                <td className="px-4 py-3">{r.total}</td>
                <td className="px-4 py-3 font-semibold">{r.percentage}%</td>
              </tr>
            ))}
          </TableShell>
        )
      ) : (
        <>
          {canMark && unmarked.length > 0 ? (
            <Card className="mb-6">
              <p className="font-display text-xl">Mark attendance · {formatDate(date)}</p>
              <div className="mt-3 space-y-2">
                {unmarked.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 py-2">
                    <div>
                      <p className="text-sm font-medium">{s.fullName}</p>
                      <p className="text-xs text-slate-400">{s.employeeCode}</p>
                    </div>
                    <Select
                      className="w-40"
                      value={draft[s.id] ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, [s.id]: e.target.value }))}
                    >
                      <option value="">Skip</option>
                      <option value="PRESENT">PRESENT</option>
                      <option value="ABSENT">ABSENT</option>
                      <option value="LATE">LATE</option>
                      <option value="LEAVE">LEAVE</option>
                    </Select>
                  </div>
                ))}
              </div>
              <Button className="mt-4" disabled={save.isPending} onClick={() => save.mutate()}>
                Save marked rows
              </Button>
            </Card>
          ) : null}
          {list.isLoading ? <Skeleton className="h-48" /> : list.isError ? (
            <EmptyState title="Could not load" body="Staff attendance API failed." />
          ) : (list.data ?? []).length === 0 ? (
            <EmptyState title="No rows yet" body={canMark ? "Use the form above to mark today's attendance." : "No attendance records found."} />
          ) : (
            <TableShell columns={user?.role === "TEACHER" ? ["Date", "Status", "Remarks"] : ["Staff", "Code", "Status", "Remarks"]}>
              {(list.data ?? []).map((r) => (
                <tr key={r.id}>
                  {user?.role === "TEACHER" ? (
                    <td className="px-4 py-3">{formatDate(r.date)}</td>
                  ) : (
                    <>
                      <td className="px-4 py-3">{r.name}</td>
                      <td className="px-4 py-3">{r.employeeCode}</td>
                    </>
                  )}
                  <td className="px-4 py-3"><Badge tone={statusTone(r.status)}>{r.status}</Badge></td>
                  <td className="px-4 py-3">{r.remarks || "—"}</td>
                </tr>
              ))}
            </TableShell>
          )}
        </>
      )}
    </div>
  );
}

export function CommunicationPage() {
  return (
    <div>
      <PageHeader
        title="Notices & alerts"
        subtitle="v1 communication is Notices, Complaints, and in-app Notifications. Private messaging/chat is not included."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="font-semibold">Notices</p>
          <p className="mt-2 text-sm text-slate-500">School circulars and announcements (live API).</p>
          <Link className="mt-4 inline-block text-sm font-semibold text-forest-700" to="/app/notices">Open notices</Link>
        </Card>
        <Card>
          <p className="font-semibold">Complaints</p>
          <p className="mt-2 text-sm text-slate-500">Parent/staff tickets with comments (live API).</p>
          <Link className="mt-4 inline-block text-sm font-semibold text-forest-700" to="/app/complaints">Open complaints</Link>
        </Card>
        <Card>
          <p className="font-semibold">In-app notifications</p>
          <p className="mt-2 text-sm text-slate-500">Fee, attendance and leave alerts.</p>
          <Link className="mt-4 inline-block text-sm font-semibold text-forest-700" to="/app/notifications">Open notifications</Link>
        </Card>
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const dashQ = useQuery({ queryKey: ["dashboard"], queryFn: () => api<DashboardData>("/api/dashboard") });
  const analyticsQ = useQuery({ queryKey: ["dashboard-analytics"], queryFn: () => api<DashboardAnalytics>("/api/dashboard/analytics") });
  const pending = useQuery({
    queryKey: ["invoices-pending-analytics"],
    queryFn: () => api<Array<{ id: string }>>("/api/invoices?status=PENDING"),
  });
  const liveEnrollment = analyticsQ.data?.enrollmentByClass ?? [];
  const feeBars = [
    { name: "Collected", value: Number(dashQ.data?.feeCollected ?? 0) },
    { name: "Pending invoices", value: pending.data?.length ?? 0 },
  ];
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Live enrollment and finance KPIs from dashboard APIs — no fabricated campus charts." />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <StatCard label="Students" value={dashQ.data?.students != null ? formatNumber(dashQ.data.students) : "—"} hint="PostgreSQL headcount" glyph="student" />
        <StatCard label="Attendance" value={dashQ.data?.attendancePercent != null ? `${dashQ.data.attendancePercent}%` : "—"} glyph="attendance" tone="rose" />
        <StatCard label="Fee collected" value={dashQ.data?.feeCollected != null ? formatMoney(dashQ.data.feeCollected) : "—"} glyph="fees" tone="gold" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="h-80">
          <p className="mb-3 font-semibold text-[#111114]">Enrollment by class</p>
          {liveEnrollment.length === 0 ? (
            <EmptyState title="No enrollment series" body="Analytics populate once classes have enrolled students." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={liveEnrollment}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf2" />
                <XAxis dataKey="name" hide={liveEnrollment.length > 10} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Students" fill="#3A3A45" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card className="h-80">
          <p className="mb-3 font-semibold text-[#111114]">Finance snapshot</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={feeBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf2" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" name="Value" fill="#F0A500" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div className="mt-8">
        <InsightKicker>Campuses</InsightKicker>
        <h2 className="mb-4 mt-2 font-display text-3xl text-[#111114]">Branch comparison</h2>
        <CampusMosaic />
      </div>
    </div>
  );
}

export function AttendanceCalendarPage() {
  const { selected } = useChildScope();
  const summaryQ = useQuery({
    queryKey: ["attendance", selected?.id],
    enabled: Boolean(selected?.id) && !selected?.id.startsWith("demo-"),
    queryFn: () => api<{
      percentage: number;
      present: number;
      total: number;
      late: number;
      absent: number;
      today?: string;
      history?: Array<{ date: string; day?: number; status: string; session: string }>;
    }>(`/api/attendance/summary?studentId=${selected?.id}`),
  });
  const live = summaryQ.data;
  const history = live?.history ?? [];
  if (!selected) return <EmptyState title="No student selected" body="Choose a linked student to view attendance." />;
  if (summaryQ.isLoading) return <Skeleton className="h-64" />;
  if (summaryQ.isError) {
    return <ErrorState message="Could not load attendance." onRetry={() => summaryQ.refetch()} status={(summaryQ.error as { status?: number })?.status} />;
  }
  return (
    <div>
      <PageHeader title="Attendance" subtitle={`${selected.fullName} · ${selected.className}`} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Today" value={live?.today || "—"} glyph="attendance" />
        <StatCard label="Percentage" value={`${live?.percentage ?? 0}%`} glyph="report" />
        <StatCard label="Present" value={`${live?.present ?? 0} / ${live?.total ?? 0}`} glyph="attendance" />
        <StatCard label="Absent / late" value={`${live?.absent ?? 0} / ${live?.late ?? 0}`} glyph="leave" />
      </div>
      {!history.length ? (
        <div className="mt-6"><EmptyState title="No attendance records" body="Marked sessions for this student will appear here." /></div>
      ) : (
        <div className="mt-6 grid grid-cols-7 gap-2">
          {history.slice(0, 28).map((d) => (
            <div
              key={`${d.date}-${d.session}`}
              className={`rounded-xl px-2 py-3 text-center text-xs font-semibold ${
                d.status === "PRESENT" ? "bg-forest-50 text-forest-700" : d.status === "LATE" ? "bg-amber-50 text-amber-800" : "bg-rose-50 text-rose-700"
              }`}
              title={`${d.date} · ${d.session}`}
            >
              {d.day ?? d.date.slice(-2)}
              <div>{d.status[0]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReceiptsPage() {
  const { user } = useAuth();
  const { selected } = useChildScope();
  const isFinance = isAdminLike(user?.role) || user?.role === "ACCOUNTANT";
  const students = useQuery({
    queryKey: ["students"],
    enabled: !isFinance && (user?.role === "PARENT" || user?.role === "STUDENT"),
    queryFn: () => api<PageResponse<Student>>("/api/students?size=20"),
  });
  const studentId = selected?.id || students.data?.items[0]?.id;
  const receipts = useQuery({
    queryKey: ["receipts", studentId, isFinance],
    enabled: isFinance || Boolean(studentId),
    queryFn: () => {
      const q = studentId && !isFinance ? `?studentId=${studentId}` : "";
      return api<Array<{
        id: string;
        receiptNumber: string;
        issuedAt: string;
        invoiceNumber: string;
        studentName: string;
        amount: number | string;
        method: string;
      }>>(`/api/receipts${q}`);
    },
  });
  const rows = receipts.data ?? [];
  return (
    <div>
      <PageHeader title="Receipts" subtitle="Receipts issued after each confirmed payment." />
      {receipts.isLoading ? <Skeleton className="h-40" /> : rows.length === 0 ? (
        <EmptyState title="No receipts" body="Receipts appear after offline confirmation or gateway settlement." />
      ) : (
        <TableShell columns={["Receipt", "Student", "Invoice", "Amount", "Method", "Issued"]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3 font-medium">{r.receiptNumber}</td>
              <td className="px-4 py-3">{r.studentName}</td>
              <td className="px-4 py-3">{r.invoiceNumber}</td>
              <td className="px-4 py-3">{formatMoney(r.amount)}</td>
              <td className="px-4 py-3">{r.method}</td>
              <td className="px-4 py-3">{formatDate(r.issuedAt)}</td>
            </tr>
          ))}
        </TableShell>
      )}
      {user?.role === "ACCOUNTANT" ? <p className="mt-3 text-xs text-slate-400">Create payment orders from Payments. Settlement is server-side.</p> : null}
    </div>
  );
}

export function PendingFeesPage() {
  const { user } = useAuth();
  const { selected } = useChildScope();
  const adminPending = useQuery({
    queryKey: ["invoices-pending"],
    enabled: isAdminLike(user?.role) || user?.role === "ACCOUNTANT",
    queryFn: () => api<(Invoice & { studentName?: string })[]>("/api/invoices?status=PENDING"),
  });
  const students = useQuery({
    queryKey: ["students"],
    enabled: !(isAdminLike(user?.role) || user?.role === "ACCOUNTANT"),
    queryFn: () => api<PageResponse<Student>>("/api/students?size=20"),
  });
  const studentId = selected?.id || students.data?.items[0]?.id;
  const invoicesQ = useQuery({
    queryKey: ["invoices", studentId],
    enabled: Boolean(studentId) && !String(studentId).startsWith("demo-") && !(isAdminLike(user?.role) || user?.role === "ACCOUNTANT"),
    queryFn: () => api<Invoice[]>(`/api/invoices?studentId=${studentId}`),
  });
  if (isAdminLike(user?.role) || user?.role === "ACCOUNTANT") {
    const rows = adminPending.data ?? [];
    return (
      <div>
        <PageHeader title="Pending fees" subtitle="Open invoices awaiting payment across the campus." />
        {adminPending.isLoading ? <Skeleton className="h-48" /> : rows.length === 0 ? (
          <EmptyState title="Nothing pending" body="No unpaid invoices in this branch scope." />
        ) : (
          <TableShell columns={["Invoice", "Student", "Due", "Total", "Paid", "Status", ""]}>
            {rows.map((inv) => (
              <tr key={inv.id}>
                <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
                <td className="px-4 py-3">{inv.studentName || "—"}</td>
                <td className="px-4 py-3">{formatDate(inv.dueDate)}</td>
                <td className="px-4 py-3">{formatMoney(inv.totalAmount)}</td>
                <td className="px-4 py-3">{formatMoney(inv.paidAmount)}</td>
                <td className="px-4 py-3"><Badge tone={statusTone(inv.status)}>{inv.status}</Badge></td>
                <td className="px-4 py-3"><Link className="font-semibold text-forest-700" to={`/app/students/${inv.studentId}`}>Ledger</Link></td>
              </tr>
            ))}
          </TableShell>
        )}
      </div>
    );
  }
  const pending = (invoicesQ.data ?? []).filter((i) => i.status !== "PAID");
  return (
    <div>
      <PageHeader title="Pending fees" subtitle="Open invoices for the selected child." />
      {pending.length === 0 ? (
        <EmptyState title="Nothing pending" body="No unpaid invoices are visible in this scope." />
      ) : (
        <TableShell columns={["Invoice", "Due", "Total", "Paid", "Status"]}>
          {pending.map((inv) => (
            <tr key={inv.id}>
              <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
              <td className="px-4 py-3">{formatDate(inv.dueDate)}</td>
              <td className="px-4 py-3">{formatMoney(inv.totalAmount)}</td>
              <td className="px-4 py-3">{formatMoney(inv.paidAmount)}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(inv.status)}>{inv.status}</Badge></td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}

export function LeaveApprovalsPage() {
  const { user } = useAuth();
  const leaveQ = useQuery({ queryKey: ["leave"], queryFn: () => api<LeaveRow[]>("/api/leave") });
  const pending = (leaveQ.data ?? []).filter((r) => r.status === "PENDING");
  if (!isAdminLike(user?.role)) {
    return <EmptyState title="Approvals unavailable" body="Only campus administrators and principals can review leave." />;
  }
  return (
    <div>
      <PageHeader title="Leave approvals" subtitle="Requests awaiting review. Approve or decline from the leave queue." action={<Link to="/app/leave"><Button>Open leave queue</Button></Link>} />
      {leaveQ.isLoading ? (
        <Skeleton className="h-48" />
      ) : pending.length === 0 ? (
        <EmptyState title="No pending approvals" body="New requests appear here after they are submitted." />
      ) : (
        <TableShell columns={["Requester", "Type", "Dates", "Status"]}>
          {pending.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3">{r.requester || r.student || "—"}</td>
              <td className="px-4 py-3">{r.leaveType}</td>
              <td className="px-4 py-3">
                {formatDate(r.startDate)} – {formatDate(r.endDate)}
              </td>
              <td className="px-4 py-3">
                <Badge tone={statusTone(r.status)}>{r.status}</Badge>
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}

export function StudyMaterialsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subjectName: "",
    className: "",
    sectionName: "",
    examName: "",
    paperType: "QUESTION_PAPER",
    description: "",
    branchId: "",
    status: "DRAFT",
    fileId: "",
  });
  const [uploading, setUploading] = useState(false);
  const homework = useQuery({
    queryKey: ["homework-materials"],
    queryFn: () => api<Array<{ id: string; title: string; subject?: string; description?: string; dueDate?: string; status?: string }>>("/api/homework"),
  });
  const papers = useQuery({
    queryKey: ["study-papers"],
    queryFn: () =>
      api<Array<{
        id: string;
        title: string;
        subjectName: string;
        className: string;
        sectionName?: string;
        examName?: string;
        paperType: string;
        status: string;
        fileId: string;
        reviewNotes?: string;
        createdByName?: string;
      }>>("/api/study-papers"),
  });
  const branches = useQuery({ queryKey: ["branches"], queryFn: () => api<{ id: string; name: string }[]>("/api/branches") });
  const create = useMutation({
    mutationFn: () =>
      post("/api/study-papers", {
        ...form,
        branchId: form.branchId || user?.branchId || undefined,
        fileId: form.fileId || undefined,
      }),
    onSuccess: () => {
      toast.success("Paper saved");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["study-papers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  async function uploadPaperFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const stored = await api<{ id: string }>("/api/files", { method: "POST", body });
      setForm((f) => ({ ...f, fileId: stored.id }));
      toast.success("File attached");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }
  const transition = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "submit" | "approve" | "reject" | "publish" }) =>
      put(`/api/study-papers/${id}/${action}`, action === "reject" ? { notes: "Needs revision" } : {}),
    onSuccess: () => {
      toast.success("Paper updated");
      void qc.invalidateQueries({ queryKey: ["study-papers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const hw = homework.data ?? [];
  const docs = papers.data ?? [];
  const canManage = isAdminLike(user?.role) || user?.role === "TEACHER";
  return (
    <div>
      <PageHeader
        title="Question papers & study materials"
        subtitle="Teachers draft and submit papers. Principal/Admin approve and publish. Students/parents only see published items."
        action={
          <div className="flex flex-wrap gap-2">
            <Link className="text-sm font-semibold text-forest-700" to="/app/homework">Homework</Link>
            {canManage ? <Button onClick={() => setOpen(true)}>Add paper</Button> : null}
          </div>
        }
      />
      <h2 className="mb-3 font-display text-xl">Paper catalogue</h2>
      {papers.isLoading ? <Skeleton className="h-32" /> : docs.length === 0 ? (
        <EmptyState title="No papers yet" body="Create a draft question paper or worksheet, then submit for approval." />
      ) : (
        <TableShell columns={["Title", "Class", "Type", "Status", "Actions"]}>
          {docs.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3">
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-slate-400">{p.subjectName || "—"}{p.examName ? ` · ${p.examName}` : ""}{p.createdByName ? ` · ${p.createdByName}` : ""}</p>
              </td>
              <td className="px-4 py-3">{p.className || "—"}{p.sectionName ? `-${p.sectionName}` : ""}</td>
              <td className="px-4 py-3">{p.paperType}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {p.fileId ? (
                    <a className="mr-1 text-xs font-semibold text-forest-700" href={`/api/files/${p.fileId}`} target="_blank" rel="noreferrer">File</a>
                  ) : null}
                  {canManage && (p.status === "DRAFT" || p.status === "REJECTED") ? (
                    <Button size="sm" variant="secondary" onClick={() => transition.mutate({ id: p.id, action: "submit" })}>Submit</Button>
                  ) : null}
                  {isAdminLike(user?.role) && p.status === "SUBMITTED" ? (
                    <>
                      <Button size="sm" onClick={() => transition.mutate({ id: p.id, action: "approve" })}>Approve</Button>
                      <Button size="sm" variant="secondary" onClick={() => transition.mutate({ id: p.id, action: "reject" })}>Reject</Button>
                      <Button size="sm" onClick={() => transition.mutate({ id: p.id, action: "publish" })}>Publish</Button>
                    </>
                  ) : null}
                  {isAdminLike(user?.role) && p.status === "APPROVED" ? (
                    <Button size="sm" onClick={() => transition.mutate({ id: p.id, action: "publish" })}>Publish</Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </TableShell>
      )}
      <h2 className="mb-3 mt-8 font-display text-xl">Homework references</h2>
      {homework.isLoading ? <Skeleton className="h-32" /> : hw.length === 0 ? (
        <EmptyState title="No homework yet" body="Assignments published by teachers will appear here." />
      ) : (
        <TableShell columns={["Subject", "Title", "Due", "Status"]}>
          {hw.map((h) => (
            <tr key={h.id}>
              <td className="px-4 py-3">{h.subject || "—"}</td>
              <td className="px-4 py-3 font-medium">{h.title}</td>
              <td className="px-4 py-3">{h.dueDate ? formatDate(h.dueDate) : "—"}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(h.status)}>{h.status || "—"}</Badge></td>
            </tr>
          ))}
        </TableShell>
      )}
      <Modal open={open} title="Add question paper / worksheet" onClose={() => setOpen(false)} wide>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title" required><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
          <Field label="Subject"><Input value={form.subjectName} onChange={(e) => setForm((f) => ({ ...f, subjectName: e.target.value }))} /></Field>
          <Field label="Class"><Input value={form.className} onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))} placeholder="Class 5" /></Field>
          <Field label="Section"><Input value={form.sectionName} onChange={(e) => setForm((f) => ({ ...f, sectionName: e.target.value }))} placeholder="A" /></Field>
          <Field label="Exam (optional)"><Input value={form.examName} onChange={(e) => setForm((f) => ({ ...f, examName: e.target.value }))} /></Field>
          <Field label="Type">
            <Select value={form.paperType} onChange={(e) => setForm((f) => ({ ...f, paperType: e.target.value }))}>
              <option value="QUESTION_PAPER">Question paper</option>
              <option value="WORKSHEET">Worksheet</option>
              <option value="NOTES">Study material</option>
              <option value="ASSIGNMENT">Assignment</option>
            </Select>
          </Field>
          <Field label="Initial status">
            <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
            </Select>
          </Field>
          <Field label="Attachment">
            <Input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" onChange={(e) => void uploadPaperFile(e.target.files?.[0] ?? null)} />
            {form.fileId ? <p className="mt-1 text-xs text-forest-700">Attached</p> : null}
            {uploading ? <p className="mt-1 text-xs text-slate-400">Uploading…</p> : null}
          </Field>
          {user?.role === "SUPER_ADMIN" ? (
            <Field label="Campus">
              <Select value={form.branchId} onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}>
                <option value="">Select</option>
                {(branches.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </Field>
          ) : null}
        </div>
        <Field label="Instructions / description"><Textarea className="mt-3" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!form.title || create.isPending || uploading} onClick={() => create.mutate()}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}

export function AttendanceReportsPage() {
  const { user } = useAuth();
  const { selected } = useChildScope();
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const classes = useQuery({ queryKey: ["classes"], queryFn: () => api<{ id: string; name: string }[]>("/api/classes") });
  const sections = useQuery({
    queryKey: ["sections", classId],
    enabled: Boolean(classId),
    queryFn: () => api<{ id: string; name: string }[]>(`/api/classes/${classId}/sections`),
  });
  const report = useQuery({
    queryKey: ["attendance-report", sectionId, date],
    enabled: Boolean(sectionId),
    queryFn: () => api<{
      className: string; sectionName: string; percentage: number; present: number; absent: number; late: number; marked: number;
      entries: { studentId: string; studentName: string; status: string }[];
    }>(`/api/attendance/report?sectionId=${sectionId}&date=${date}`),
  });
  const childSummary = useQuery({
    queryKey: ["attendance-summary", selected?.id],
    enabled: Boolean(selected?.id) && (user?.role === "PARENT" || user?.role === "STUDENT"),
    queryFn: () => api<{ percentage: number; monthlyPercentage: number; yearlyPercentage: number; present: number; absent: number; late: number }>(
      `/api/attendance/summary?studentId=${selected!.id}`
    ),
  });
  return (
    <div>
      <PageHeader title="Attendance reports" subtitle="Class-day overview with per-student attendance percentages." />
      {(user?.role === "PARENT" || user?.role === "STUDENT") && childSummary.data ? (
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <StatCard label="Overall" value={`${childSummary.data.percentage}%`} glyph="attendance" />
          <StatCard label="This month" value={`${childSummary.data.monthlyPercentage}%`} glyph="attendance" />
          <StatCard label="This year" value={`${childSummary.data.yearlyPercentage}%`} glyph="attendance" />
        </div>
      ) : null}
      {isAdminLike(user?.role) || user?.role === "TEACHER" ? (
        <>
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <Select value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}>
              <option value="">Class</option>
              {(classes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}>
              <option value="">Section</option>
              {(sections.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {report.data ? (
            <>
              <div className="mb-4 grid gap-4 md:grid-cols-4">
                <StatCard label={`${report.data.className}-${report.data.sectionName}`} value={`${report.data.percentage}%`} hint={`${report.data.marked} marked`} glyph="attendance" />
                <StatCard label="Present" value={report.data.present} glyph="attendance" />
                <StatCard label="Absent" value={report.data.absent} glyph="leave" />
                <StatCard label="Late" value={report.data.late} glyph="attendance" />
              </div>
              <TableShell columns={["Student", "Status", ""]}>
                {report.data.entries.map((e) => (
                  <tr key={e.studentId}>
                    <td className="px-4 py-3">{e.studentName}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone(e.status)}>{e.status}</Badge></td>
                    <td className="px-4 py-3"><Link className="font-semibold text-forest-700" to={`/app/students/${e.studentId}`}>History</Link></td>
                  </tr>
                ))}
              </TableShell>
            </>
          ) : sectionId ? (
            report.isLoading ? <Skeleton className="h-40" /> : <EmptyState title="No marks for this day" body="Take attendance for the section first." />
          ) : (
            <EmptyState title="Select class and section" body="Choose a section and date to load the live attendance report." />
          )}
        </>
      ) : null}
    </div>
  );
}
