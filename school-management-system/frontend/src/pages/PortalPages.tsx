import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useChildScope } from "../lib/child";
import { formatDate, formatMoney, formatNumber } from "../lib/format";
import { isAdminLike } from "../lib/roles";
import type { DashboardAnalytics, DashboardData, ExamRow, Invoice, LeaveRow, PageResponse, Student } from "../lib/types";
import { Badge, Button, Card, EmptyState, PageHeader, Skeleton, StatCard, TableShell, statusTone } from "../components/ui";
import { DemoChip } from "../components/brand";
import { ActivityFeed, CampusMosaic, InsightKicker, Ornament, PersonCard, QuickActions } from "../components/visual";
import { MediaImage } from "../components/media";
import { sectionImageForPath } from "../lib/mediaCatalog";
import { useLiveOrDemo } from "../demo/useLiveOrDemo";
import {
  demoAttendance,
  demoBuses,
  demoExams,
  demoHomework,
  demoInvoices,
  demoReportCard,
  demoStaffAttendance,
  demoStops,
} from "../demo";
import { SCHOOL_NAME } from "../demo/config";

export function BusTrackingPage() {
  const [active, setActive] = useState(demoBuses[0].id);
  const bus = demoBuses.find((b) => b.id === active) ?? demoBuses[0];
  const { selected } = useChildScope();
  return (
    <div>
      <PageHeader
        crumbs={["Transport"]}
        title="Bus tracking"
        subtitle="There is no live GPS API. This map is labelled Demo Tracking and never presented as real location."
        action={<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">Demo tracking</span>}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card padded={false} className="relative min-h-[440px] overflow-hidden [perspective:900px]">
          <MediaImage src={sectionImageForPath("/app/bus-tracking")} alt="" position="center 46%" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          <svg viewBox="0 0 400 320" className="relative h-full w-full" role="img" aria-label="Demo map of a school bus route">
            <rect width="400" height="320" fill="#e8eef5" />
            <rect x="20" y="20" width="80" height="50" rx="8" fill="#0b1a2e" opacity="0.12" />
            <rect x="280" y="40" width="90" height="60" rx="8" fill="#14663a" opacity="0.12" />
            <path d="M40 280 C 80 200, 140 220, 180 140 S 280 80, 360 90" fill="none" stroke="#14663a" strokeWidth="8" strokeLinecap="round" opacity="0.35" />
            {demoStops.map((s, i) => (
              <g key={s} transform={`translate(${60 + i * 70} ${240 - i * 35})`}>
                <circle r="7" fill="#0b1a2e" />
                <text y="22" fontSize="9" fill="#334155">
                  {s}
                </text>
              </g>
            ))}
            <g transform={`translate(${80 + bus.progress * 2.4} ${230 - bus.progress * 1.4})`}>
              <g className="depth-float">
                <rect x="-16" y="-10" width="32" height="18" rx="5" fill="#c9a227" />
                <rect x="-12" y="-6" width="10" height="8" rx="2" fill="#0b1a2e" opacity="0.35" />
                <circle cx="-10" cy="10" r="3" fill="#0b1a2e" />
                <circle cx="10" cy="10" r="3" fill="#0b1a2e" />
              </g>
              <text y="-16" fontSize="9" textAnchor="middle" fill="#0b1a2e" fontWeight="700">
                {bus.code}
              </text>
            </g>
          </svg>
          <p className="absolute bottom-3 left-4 text-xs font-semibold text-amber-800">Simulated location — not live GPS</p>
        </Card>
        <div className="grid gap-3">
          {demoBuses.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setActive(b.id)}
              className={`rounded-2xl border p-4 text-left ${active === b.id ? "border-forest-600 bg-white shadow-card" : "border-line bg-white/70"}`}
            >
              <p className="font-semibold">{b.code}</p>
              <p className="text-sm text-slate-500">{b.route}</p>
              <p className="mt-1 text-xs text-slate-400">
                Driver {b.driver} · ETA {b.etaMinutes} min · Next {b.nextStop}
              </p>
              <div className="mt-2">
                <Badge tone={b.status === "On Route" ? "info" : "good"}>{b.status}</Badge>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="flex items-center gap-3">
          <Ornament src="/assets/3d/bus.svg" className="h-14 w-24" />
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">School bus</p>
            <p className="mt-1 font-display text-2xl">{bus.code}</p>
            <p className="text-sm text-slate-500">{bus.route}</p>
          </div>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Driver</p>
          <p className="mt-2 font-semibold">{bus.driver}</p>
          <p className="text-sm text-slate-500">Next stop {bus.nextStop}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Child pickup</p>
          <p className="mt-2 font-semibold">{selected?.fullName ?? "Linked child"}</p>
          <p className="text-sm text-slate-500">{bus.pickup}</p>
        </Card>
      </div>
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
  const { selected } = useChildScope();
  const examsQ = useQuery({ queryKey: ["exams"], queryFn: () => api<ExamRow[]>("/api/exams") });
  const exams = useLiveOrDemo(examsQ, demoExams);
  const liveExam = (exams.data ?? []).find((e) => e.id && !e.id.startsWith("demo-"));
  const canLiveCard = Boolean(selected?.id && liveExam?.id && !selected.id.startsWith("demo-"));
  const report = useQuery({
    queryKey: ["report-card", selected?.id, liveExam?.id],
    enabled: canLiveCard,
    queryFn: () =>
      api<{ student: string; total: number; max: number; percentage: number; grade: string; subjects: number }>(
        `/api/report-cards?studentId=${selected!.id}&examId=${liveExam!.id}`
      ),
  });
  return (
    <div>
      <PageHeader
        title="Marks, results & report cards"
        subtitle={selected ? `${selected.fullName} · ${selected.className}-${selected.sectionName}` : "Exam records from GET /api/exams. A live report card needs a linked student and exam."}
      />
      {exams.isDemo ? <DemoChip show /> : null}
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
          <p className="mt-4 font-display text-5xl">{report.data.percentage}%</p>
          <p className="text-sm text-slate-500">
            Grade {report.data.grade} · {report.data.total}/{report.data.max} · {report.data.subjects} subjects
          </p>
        </Card>
      ) : selected && !canLiveCard ? (
        <Card className="mt-6">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{SCHOOL_NAME}</p>
          <p className="mt-2 font-display text-3xl">{demoReportCard.student}</p>
          <p className="mt-4 font-display text-5xl">{demoReportCard.percentage}%</p>
          <p className="text-sm text-slate-500">
            Grade {demoReportCard.grade} · {demoReportCard.total}/{demoReportCard.max}
          </p>
          <p className="mt-2 text-xs text-amber-800">Sample card shown because this session is using demo exams, not a live student record.</p>
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
  return (
    <div>
      <PageHeader title="Staff attendance" subtitle="There is no staff attendance API yet. This table is demo-only." />
      <DemoChip show />
      <TableShell columns={["Staff", "In time", "Status"]}>
        {demoStaffAttendance.map((r) => (
          <tr key={r.id}>
            <td className="px-4 py-3">{r.name}</td>
            <td className="px-4 py-3">{r.inTime}</td>
            <td className="px-4 py-3">
              <Badge tone={statusTone(r.status)}>{r.status}</Badge>
            </td>
          </tr>
        ))}
      </TableShell>
    </div>
  );
}

export function CommunicationPage() {
  const threads = [
    { id: "t1", title: "Mathematics homework", meta: "Rohan Mehta · Class VIII-A", when: "Today, 8:40 AM" },
    { id: "t2", title: "PTM slot confirmation", meta: "Office · Main Campus", when: "Yesterday" },
    { id: "t3", title: "Bus delay notice", meta: "Transport desk", when: "Mon" },
  ];
  return (
    <div>
      <PageHeader
        title="Parent-teacher communication"
        subtitle="Threaded messaging is not in the backend. Official records stay on Notices and Complaints."
      />
      <DemoChip show />
      <p className="mb-4 mt-2 text-xs text-amber-800">Sample threads only — nothing here is posted to PostgreSQL.</p>
      <ActivityFeed title="Inbox" rows={threads} />
      <QuickActions items={[
        { label: "Notices", to: "/app/notices" },
        { label: "Complaints", to: "/app/complaints" },
        { label: "Leave", to: "/app/leave" },
      ]} />
    </div>
  );
}

export function AnalyticsPage() {
  const dashQ = useQuery({ queryKey: ["dashboard"], queryFn: () => api<DashboardData>("/api/dashboard") });
  const analyticsQ = useQuery({ queryKey: ["dashboard-analytics"], queryFn: () => api<DashboardAnalytics>("/api/dashboard/analytics") });
  const liveEnrollment = analyticsQ.data?.enrollmentByClass ?? [];
  const demoBranch = useMemo(
    () => [
      { name: "Main", students: 530, fees: 92 },
      { name: "East", students: 530, fees: 88 },
      { name: "North", students: 530, fees: 90 },
      { name: "South", students: 530, fees: 85 },
      { name: "West", students: 530, fees: 87 },
      { name: "Noida", students: 530, fees: 91 },
      { name: "G. Noida", students: 530, fees: 89 },
      { name: "Gurgaon", students: 530, fees: 93 },
    ],
    []
  );
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Live enrollment comes from /api/dashboard/analytics. Branch fee comparison is labelled demo until historical aggregates exist." />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <StatCard label="Students" value={dashQ.data?.students != null ? formatNumber(dashQ.data.students) : "—"} hint="PostgreSQL headcount" glyph="student" />
        <StatCard label="Attendance" value={dashQ.data?.attendancePercent != null ? `${dashQ.data.attendancePercent}%` : "—"} glyph="attendance" tone="rose" />
        <StatCard label="Fee collected" value={dashQ.data?.feeCollected != null ? formatMoney(dashQ.data.feeCollected) : "—"} glyph="fees" tone="gold" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="h-80">
          <p className="mb-3 font-semibold text-[#053321]">Enrollment by class</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={liveEnrollment.length ? liveEnrollment : demoBranch.map((d) => ({ name: d.name, value: d.students }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf2" />
              <XAxis dataKey="name" hide={liveEnrollment.length > 10} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" name="Students" fill="#12885a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="h-80">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-[#053321]">Collection by campus</p>
            <DemoChip show />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={demoBranch}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf2" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="fees" name="Collection %" fill="#c5a059" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div className="mt-8">
        <InsightKicker>Campuses</InsightKicker>
        <h2 className="mb-4 mt-2 font-display text-3xl text-[#053321]">Branch comparison</h2>
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
    queryFn: () => api<{ percentage: number; present: number; total: number }>(`/api/attendance/summary?studentId=${selected?.id}`),
  });
  const live = summaryQ.data;
  const pct = live?.percentage ?? demoAttendance.percentage;
  const present = live?.present ?? demoAttendance.present;
  const total = live?.total ?? demoAttendance.total;
  const usingDemo = !live;
  return (
    <div>
      <PageHeader title="Attendance" subtitle={selected ? `${selected.fullName} · ${selected.className}` : "Your linked student"} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Today" value={demoAttendance.today} hint={usingDemo ? "Daily status is demo until a day roster API exists" : undefined} glyph="attendance" />
        <StatCard label="Percentage" value={`${pct}%`} glyph="report" />
        <StatCard label="Present" value={`${present} / ${total}`} glyph="attendance" />
        <StatCard label="Absent / late" value={`${demoAttendance.absent} / ${demoAttendance.late}`} hint="Absent and late days need daily rows" glyph="leave" />
      </div>
      <div className="mt-6 grid grid-cols-7 gap-2">
        {demoAttendance.calendar.map((d) => (
          <div
            key={d.day}
            className={`rounded-xl px-2 py-3 text-center text-xs font-semibold ${
              d.status === "PRESENT" ? "bg-forest-50 text-forest-700" : d.status === "LATE" ? "bg-amber-50 text-amber-800" : "bg-rose-50 text-rose-700"
            }`}
          >
            {d.day}
            <div>{d.status[0]}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-amber-800">Calendar is demo unless a daily attendance list API is added. Percentage uses the live summary when it exists.</p>
    </div>
  );
}

export function ReceiptsPage() {
  const { user } = useAuth();
  const { selected } = useChildScope();
  const students = useQuery({ queryKey: ["students"], queryFn: () => api<PageResponse<Student>>("/api/students?size=20") });
  const studentId = selected?.id || students.data?.items[0]?.id;
  const invoicesQ = useQuery({
    queryKey: ["invoices", studentId],
    enabled: Boolean(studentId) && !String(studentId).startsWith("demo-"),
    queryFn: () => api<Invoice[]>(`/api/invoices?studentId=${studentId}`),
  });
  const invoices = useLiveOrDemo(invoicesQ, demoInvoices);
  const paid = (invoices.data ?? []).filter((i) => i.status === "PAID");
  return (
    <div>
      <PageHeader title="Receipts" subtitle="Paid invoices after the payment webhook or offline confirmation. There is no separate receipts table in the API." />
      {invoices.isDemo ? <DemoChip show /> : null}
      {paid.length === 0 ? (
        <EmptyState title="No receipts" body="Receipts appear after invoices are marked PAID by the backend." />
      ) : (
        <TableShell columns={["Invoice", "Amount", "Status", "Due"]}>
          {paid.map((inv) => (
            <tr key={inv.id}>
              <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
              <td className="px-4 py-3">{formatMoney(inv.totalAmount)}</td>
              <td className="px-4 py-3">
                <Badge tone={statusTone(inv.status)}>{inv.status}</Badge>
              </td>
              <td className="px-4 py-3">{formatDate(inv.dueDate)}</td>
            </tr>
          ))}
        </TableShell>
      )}
      {user?.role === "ACCOUNTANT" ? <p className="mt-3 text-xs text-slate-400">Create payment orders from Payments. Settlement is server-side.</p> : null}
    </div>
  );
}

export function PendingFeesPage() {
  const { selected } = useChildScope();
  const students = useQuery({ queryKey: ["students"], queryFn: () => api<PageResponse<Student>>("/api/students?size=20") });
  const studentId = selected?.id || students.data?.items[0]?.id;
  const invoicesQ = useQuery({
    queryKey: ["invoices", studentId],
    enabled: Boolean(studentId) && !String(studentId).startsWith("demo-"),
    queryFn: () => api<Invoice[]>(`/api/invoices?studentId=${studentId}`),
  });
  const invoices = useLiveOrDemo(invoicesQ, demoInvoices);
  const pending = (invoices.data ?? []).filter((i) => i.status !== "PAID");
  return (
    <div>
      <PageHeader title="Pending fees" subtitle="Open invoices for the selected student. All-branch overdue lists are not exposed by the API." />
      {invoices.isDemo ? <DemoChip show /> : null}
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
              <td className="px-4 py-3">
                <Badge tone={statusTone(inv.status)}>{inv.status}</Badge>
              </td>
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
      <PageHeader title="Leave approvals" subtitle="Pending requests from GET /api/leave. Review actions stay on the Leave page." action={<Link to="/app/leave"><Button>Open leave queue</Button></Link>} />
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
  return (
    <div>
      <PageHeader title="Study materials" subtitle="Question papers and attachments are not stored as a catalogue in the backend yet." />
      <EmptyState title="No document API" body="When papers are uploaded on the server they will appear here. Nothing is fabricated as a downloadable file." />
      <Card className="mt-4">
        <p className="font-semibold">Homework attachments</p>
        <p className="mt-1 text-sm text-slate-500">If a homework record includes a description, it is shown on Homework. Binary files are not listed unless the API returns them.</p>
        <div className="mt-3 grid gap-2">
          {demoHomework.map((h) => (
            <p key={h.id} className="text-sm">
              {h.subject}: {h.title}
            </p>
          ))}
        </div>
        <p className="mt-2 text-xs text-amber-800">Titles above are demo homework names, not downloadable papers.</p>
      </Card>
    </div>
  );
}

export function AttendanceReportsPage() {
  return (
    <div>
      <PageHeader title="Attendance reports" subtitle="There is no class-wise attendance export API. Use the live student summary and labelled demo calendar on Attendance." />
      <DemoChip show />
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <StatCard label="Group attendance today" value={`${demoAttendance.percentage}%`} hint="Demo aggregate" glyph="attendance" />
        <StatCard label="Present days (sample)" value={demoAttendance.present} glyph="attendance" />
        <StatCard label="Absent days (sample)" value={demoAttendance.absent} glyph="leave" />
      </div>
    </div>
  );
}
