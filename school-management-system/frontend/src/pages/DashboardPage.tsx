import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useChildScope } from "../lib/child";
import { asName, asRecord, formatDate, formatHumanTime, formatMoney, formatNumber, str, unwrapList } from "../lib/format";
import { canAudit } from "../lib/roles";
import type { AcademicYear, AuditRow, Branch, DashboardAnalytics, DashboardData, ExamRow, StudentWorkspace } from "../lib/types";
import { Card, EmptyState, ErrorState, Skeleton, StatCard } from "../components/ui";
import { DemoChip } from "../components/brand";
import { ActivityFeed, CampusMosaic, DashHero, InsightKicker, PersonCard, QuickActions } from "../components/visual";
import { Premium3DIcon } from "../components/3d/Premium3DIcon";
import { sectionImageForPath } from "../lib/mediaCatalog";
import { SCHOOL, SCHOOL_CROP } from "../lib/schoolMedia";
import { FieldMedia, MediaImage } from "../components/media";
import { useLiveOrDemo } from "../demo/useLiveOrDemo";
import { DEMO_MODE, demoBranches, demoDashboard, demoExams, demoHomework, demoNotices, demoTimetable, demoAdmissions, demoRecentPayments, demoEvents, demoEnrollment, demoAttendanceMix, demoYears } from "../demo";
import { SCHOOL_NAME } from "../demo/config";

function greeting(name?: string) {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${part}, ${name?.split(" ")[0] ?? "there"}`;
}

const collectionTrend = [
  { name: "May", value: 86 },
  { name: "Jun", value: 91 },
  { name: "Jul", value: 88 },
  { name: "Aug", value: 94 },
  { name: "Sep", value: 90 },
];

export function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === "PARENT") return <ParentDash />;
  if (user?.role === "STUDENT") return <StudentDash />;
  if (user?.role === "TEACHER") return <TeacherDash />;
  if (user?.role === "ACCOUNTANT") return <AccountantDash />;
  if (user?.role === "PRINCIPAL") return <PrincipalDash />;
  if (user?.role === "BRANCH_ADMIN") return <CampusDash />;
  if (user?.role === "TRANSPORT") return <TransportDash />;
  return <SuperDash />;
}

function SuperDash() {
  const { user } = useAuth();
  const dashQ = useQuery({ queryKey: ["dashboard"], queryFn: () => api<DashboardData>("/api/dashboard") });
  const dash = useLiveOrDemo(dashQ, demoDashboard);
  const analyticsQ = useQuery({ queryKey: ["dashboard-analytics"], queryFn: () => api<DashboardAnalytics>("/api/dashboard/analytics") });
  const branchesQ = useQuery({ queryKey: ["branches"], queryFn: () => api<Branch[]>("/api/branches") });
  const branches = useLiveOrDemo(branchesQ, demoBranches);
  const auditQ = useQuery({ queryKey: ["audit", 0], enabled: canAudit(user?.role), queryFn: () => api<AuditRow[]>("/api/audit-logs?page=0") });
  const live = dash.data;
  const extras = dash.isDemo;
  const charts = analyticsQ.data;
  const branchCount = live?.branches ?? branches.data?.length ?? (extras ? demoDashboard.branches : 0);
  const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const mix = (charts?.attendanceMix ?? []).map((row, i) => ({
    ...row,
    color: ["#15151A", "#9A6205", "#F0A500", "#64748b"][i % 4],
  }));
  const attendanceSlices = mix.length
    ? mix
    : DEMO_MODE
      ? demoAttendanceMix.map((row, i) => ({
          ...row,
          color: ["#15151A", "#9A6205", "#F0A500", "#64748b"][i % 4],
        }))
      : [];
  const presentPct = live?.attendancePercent ?? (extras ? demoDashboard.attendanceToday : null);
  const enrollment = charts?.enrollmentByClass?.length
    ? charts.enrollmentByClass
    : DEMO_MODE
      ? demoEnrollment.map((d) => ({ name: d.name, value: d.y2 }))
      : [];
  const feePct = Number(live?.feeTotal) ? Math.min(100, (Number(live?.feeCollected) / Number(live?.feeTotal)) * 100) : (extras ? 79 : 0);
  const admissions = charts?.recentAdmissions ?? (DEMO_MODE ? demoAdmissions : []);
  const payments = charts?.recentPayments ?? (DEMO_MODE ? demoRecentPayments : []);
  const branchCompare =
    charts?.branchComparison?.length
      ? charts.branchComparison.map((row) => ({ name: row.name, students: row.value }))
      : DEMO_MODE
        ? (branches.data ?? demoBranches).slice(0, 8).map((b, i) => ({
            name: b.code || b.name?.split(" ").pop() || `C${i + 1}`,
            students: Math.round(((Number(live?.students) || demoDashboard.students) / Math.max(1, branchCount)) * (0.85 + (i % 5) * 0.06)),
          }))
        : (branches.data ?? []).slice(0, 8).map((b) => ({
            name: b.code || b.name?.split(" ").pop() || b.name,
            students: 0,
          }));
  const branchCompareLive = Boolean(charts?.branchComparison?.length);
  const eventsQ = useQuery({ queryKey: ["events"], queryFn: () => api<Array<{ id: string; title: string; eventType: string; audience: string; startsAt: string }>>("/api/events") });
  const liveEvents = eventsQ.data ?? [];
  const showEvents = liveEvents.length ? liveEvents.slice(0, 4) : (DEMO_MODE ? demoEvents.map((e) => ({ id: e.title + e.date, title: e.title, eventType: e.type, audience: e.audience, startsAt: e.date })) : []);
  const activities = [
    ...admissions.slice(0, 2).map((a) => ({
      id: `a-${a.id}`,
      title: `New admission · ${a.name}`,
      meta: `${a.className} · ${a.campus}`,
      when: a.when,
      tone: "good" as const,
    })),
    ...payments.slice(0, 2).map((p) => ({
      id: `p-${p.id}`,
      title: `Fee payment · ${p.name}`,
      meta: String(p.amount),
      when: p.when,
      tone: "gold" as const,
    })),
    ...(auditQ.data ?? []).slice(0, 2).map((r) => ({
      id: r.id,
      title: r.action,
      meta: "Audit",
      when: formatHumanTime(r.createdAt),
      tone: "info" as const,
    })),
  ].slice(0, 5);

  return (
    <div className="fade-up space-y-8">
      <DashHero
        kicker="School management overview"
        title={greeting(user?.fullName)}
        body={`${SCHOOL_NAME} operations desk — students, attendance, fees, notices and campus administration.`}
        meta={`${today} · ${branchCount || 8} campuses`}
        image={SCHOOL.dashboardHero}
        position="center 40%"
        aside={
          <div className="rounded-2xl border border-white/15 bg-ink-950/55 p-5 backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gilt-400">Today</p>
            <ul className="mt-3 space-y-2 text-sm text-white/85">
              <li className="flex justify-between gap-6 border-b border-white/10 pb-2">
                <span>Attendance</span>
                <span className="font-semibold text-gilt-400">{presentPct != null ? `${presentPct}%` : "—"}</span>
              </li>
              <li className="flex justify-between gap-6 border-b border-white/10 pb-2">
                <span>Fees collected</span>
                <span className="font-semibold">{formatMoney(live?.feeCollected)}</span>
              </li>
              <li className="flex justify-between gap-6">
                <span>Pending invoices</span>
                <span className="font-semibold">{formatNumber(live?.pendingInvoices)}</span>
              </li>
            </ul>
          </div>
        }
      />

      {dash.isLoading ? (
        <Skeleton className="h-36" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard label="Students" value={formatNumber(live?.students ?? (extras ? demoDashboard.students : 0))} hint="On roll" art="student" to="/app/students" />
          <StatCard label="Teachers" value={formatNumber(live?.teachers ?? live?.staff ?? (extras ? demoDashboard.teachers : 0))} hint="Teaching staff" art="teacher" to="/app/teachers" />
          <StatCard label="Staff" value={formatNumber(live?.staffMembers ?? live?.staff ?? 0)} hint="Non-teaching" art="staff" to="/app/staff" />
          <StatCard label="Branches" value={formatNumber(branchCount)} hint="Campuses" art="campus" to="/app/branches" />
          <StatCard label="Fees collected" value={formatMoney(live?.feeCollected ?? (extras ? demoDashboard.feeCollected : 0))} hint={live?.feeTotal != null ? `${formatMoney(live.feeTotal)} billed` : "Invoices"} art="fees" to="/app/invoices" />
          <StatCard
            label="Attendance"
            value={live?.attendancePercent != null ? `${live.attendancePercent}%` : presentPct != null ? `${presentPct}%` : "—"}
            hint={live?.attendanceDate ? formatDate(live.attendanceDate) : "Latest marked day"}
            art="attendance"
            to="/app/attendance"
          />
        </div>
      )}

      <div>
        <InsightKicker>Quick actions</InsightKicker>
        <h2 className="mt-1 font-display text-2xl text-ink-900">School operations</h2>
        <QuickActions
          items={[
            { label: "Add Student", to: "/app/students?action=new" },
            { label: "New Admission", to: "/app/admissions" },
            { label: "Take Attendance", to: "/app/attendance" },
            { label: "Collect Fee", to: "/app/payments" },
            { label: "Generate Report", to: "/app/reports" },
            { label: "Send Notice", to: "/app/notices" },
          ]}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="portal-chart xl:col-span-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <InsightKicker>Academics</InsightKicker>
              <Link to="/app/classes" className="mt-1 block font-display text-xl text-ink-900 hover:text-forest-700 sm:text-2xl">
                Enrollment by class
              </Link>
            </div>
            {!charts ? <DemoChip show /> : null}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={enrollment}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E0DA" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} hide={enrollment.length > 12} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={36} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "rgba(6,60,50,0.06)" }} contentStyle={{ borderRadius: 0, border: "1px solid #E3E0DA", fontSize: 12 }} />
              <Bar dataKey="value" name="Students" fill="#15151A" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="portal-chart xl:col-span-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <InsightKicker>Attendance</InsightKicker>
              <Link to="/app/attendance" className="mt-1 block font-display text-xl text-ink-900 hover:text-forest-700 sm:text-2xl">
                Overview
              </Link>
            </div>
            {!mix.length ? <DemoChip show /> : null}
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={attendanceSlices} dataKey="value" nameKey="name" innerRadius={52} outerRadius={74} paddingAngle={2} stroke="#fff" strokeWidth={2}>
                  {attendanceSlices.map((s) => (
                    <Cell key={s.name} fill={"color" in s ? String(s.color) : "#15151A"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 0, border: "1px solid #E3E0DA", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-2xl text-ink-900 sm:text-[1.75rem]">{presentPct}%</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Present</p>
            </div>
          </div>
          <div className="mt-1 flex flex-wrap justify-center gap-3 text-xs font-semibold text-slate-500">
            {attendanceSlices.map((s) => (
              <span key={s.name} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2" style={{ background: "color" in s ? String(s.color) : "#15151A" }} />
                {s.name}
              </span>
            ))}
          </div>
          <Link to="/app/attendance" className="mt-3 inline-block text-sm font-semibold text-forest-700">
            Open attendance →
          </Link>
        </Card>

        <Card className="xl:col-span-3">
          <InsightKicker>Finance</InsightKicker>
          <Link to="/app/invoices" className="mt-1 block font-display text-xl text-ink-900 hover:text-forest-700 sm:text-2xl">
            Fee collection
          </Link>
          <p className="mt-4 font-display text-2xl text-ink-900 sm:text-[1.75rem]">{formatMoney(live?.feeCollected)}</p>
          <div className="mt-4 h-2 overflow-hidden bg-ivory-200">
            <div className="h-full bg-forest-800 transition-all" style={{ width: `${feePct}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold text-forest-700">{Math.round(feePct)}% of billed</p>
          <p className="mt-3 text-sm text-slate-500">
            {formatMoney(live?.feeTotal)} billed · {formatNumber(live?.pendingInvoices)} pending
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Today {formatMoney(live?.todayCollected ?? 0)} · Overdue {formatNumber(live?.overdueInvoices ?? 0)}
          </p>
          <Link to="/app/payments" className="mt-5 inline-block text-sm font-semibold text-forest-700">
            Open payments →
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <InsightKicker>Activity</InsightKicker>
              <h2 className="mt-1 font-display text-2xl text-ink-900">Recent</h2>
            </div>
            <Link className="text-sm font-semibold text-forest-700" to="/app/audit">
              Audit
            </Link>
          </div>
          <div className="space-y-3">
            {activities.length ? (
              activities.map((row) => (
                <div key={row.id} className="flex gap-3 border-b border-line/70 pb-3 last:border-0">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 ${
                      row.tone === "good" ? "bg-forest-700" : row.tone === "gold" ? "bg-gilt-500" : "bg-ink-600"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{row.title}</p>
                    <p className="text-xs text-slate-400">{row.meta}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-slate-400">{row.when}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No recent activity.</p>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <InsightKicker>Calendar</InsightKicker>
              <h2 className="mt-1 font-display text-2xl text-ink-900">Upcoming events</h2>
            </div>
            <Link className="text-sm font-semibold text-forest-700" to="/app/events">
              View
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {showEvents.map((e) => (
              <Link key={e.id ?? e.title} to="/app/events" className="overflow-hidden border border-ink-900/8 bg-surface transition hover:border-forest-600/30">
                <FieldMedia
                  src={String(e.title).toLowerCase().includes("sport") ? SCHOOL.sports : SCHOOL.events}
                  alt=""
                  frame="thumbnail"
                  position="center 40%"
                />
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gilt-700">{e.startsAt ? formatHumanTime(e.startsAt) : ""}</p>
                  <p className="mt-1 text-sm font-semibold text-ink-900">{e.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {e.eventType} · {e.audience}
                  </p>
                </div>
              </Link>
            ))}
            {!showEvents.length ? (
              <p className="col-span-full text-sm text-slate-500">
                No upcoming events. Create one in the Events module.
              </p>
            ) : null}
          </div>
          <div className="mt-3">
            <DemoChip show={DEMO_MODE && !liveEvents.length} />
          </div>
        </Card>

        <Link to="/about" className="group relative isolate overflow-hidden border border-ink-900/8 lg:col-span-3">
          <div className="absolute inset-0">
            <MediaImage
              src={SCHOOL.dashboardPromo}
              alt="Students in an Indian classroom"
              position={SCHOOL_CROP.dashboardPromo}
              className="h-full w-full transition duration-700 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#15151A]/90 via-[#15151A]/45 to-[#15151A]/20" />
          <div className="relative flex media-frame-portrait !max-h-[18rem] !aspect-auto min-h-[200px] flex-col justify-end p-4 text-white sm:min-h-[220px] lg:h-full lg:max-h-none lg:p-5">
            <p className="font-display text-xl leading-tight sm:text-2xl">Education beyond classrooms</p>
            <p className="mt-1.5 text-xs text-white/75 sm:mt-2 sm:text-sm">Our vision for every campus.</p>
            <span className="mt-3 inline-flex text-sm font-semibold text-gilt-400 sm:mt-4">Our vision →</span>
          </div>
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="portal-chart xl:col-span-7">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <InsightKicker>Branches</InsightKicker>
              <h2 className="mt-1 font-display text-2xl text-ink-900">Campus comparison</h2>
              <p className="mt-1 text-sm text-slate-500">
                {branchCompareLive
                  ? "Enrolment by campus for the current academic year."
                  : "Relative student load across authorised campuses."}
              </p>
            </div>
            {!branchCompareLive ? <DemoChip show /> : null}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={branchCompare}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E0DA" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={40} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 0, border: "1px solid #E3E0DA", fontSize: 12 }} />
              <Bar dataKey="students" name="Students" fill="#26262E" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <div className="xl:col-span-5">
          <InsightKicker>Campuses</InsightKicker>
          <h2 className="mt-2 mb-4 font-display text-2xl text-ink-900">Delhi-NCR at a glance</h2>
          <CampusMosaic limit={4} />
        </div>
      </div>
    </div>
  );
}

function CampusDash() {
  const { user } = useAuth();
  const dashQ = useQuery({ queryKey: ["dashboard"], queryFn: () => api<DashboardData>("/api/dashboard") });
  const dash = useLiveOrDemo(dashQ, demoDashboard);
  const noticesQ = useQuery({ queryKey: ["notices"], queryFn: () => api<unknown>("/api/notices") });
  const notices = useLiveOrDemo(noticesQ, demoNotices);
  const noticeRows = unwrapList<{ id?: string; title?: string; audienceType?: string; createdAt?: string }>(notices.data).slice(0, 6);
  return (
    <div className="space-y-6">
      <DashHero
        kicker="Campus operations"
        title={greeting(user?.fullName)}
        body={`${user?.branchName ?? "Campus"} · live counts from PostgreSQL`}
        dataFirst
      />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="Students" value={formatNumber(dash.data?.students)} art="student" to="/app/students" />
        <StatCard label="Staff" value={formatNumber(dash.data?.staff)} art="staff" to="/app/staff" />
        <StatCard label="Pending fees" value={formatNumber(dash.data?.pendingInvoices)} art="fees" to="/app/pending-fees" />
        <StatCard label="Attendance" value={dash.data?.attendancePercent != null ? `${dash.data.attendancePercent}%` : dash.isDemo ? `${demoDashboard.attendanceToday}%` : "—"} hint={dash.data?.attendanceDate ? formatDate(dash.data.attendanceDate) : "Latest marked day"} art="attendance" to="/app/attendance" />
      </div>
      <ActivityFeed
        title="Campus notices"
        rows={noticeRows.map((n) => ({
          id: n.id ?? n.title ?? "n",
          title: n.title ?? "Notice",
          meta: n.audienceType,
          when: n.createdAt,
          href: "/app/notices",
        }))}
        action={notices.isDemo ? <DemoChip show /> : undefined}
      />
      <QuickActions items={[
        { label: "Mark attendance", to: "/app/attendance" },
        { label: "Notices", to: "/app/notices" },
        { label: "Approvals", to: "/app/leave" },
        { label: "Transport", to: "/app/transport" },
        { label: "Students", to: "/app/students" },
        { label: "Reports", to: "/app/reports" },
      ]} />
    </div>
  );
}

function PrincipalDash() {
  const { user } = useAuth();
  const dashQ = useQuery({ queryKey: ["dashboard"], queryFn: () => api<DashboardData>("/api/dashboard") });
  const dash = useLiveOrDemo(dashQ, demoDashboard);
  const noticesQ = useQuery({ queryKey: ["notices"], queryFn: () => api<unknown>("/api/notices") });
  const notices = useLiveOrDemo(noticesQ, demoNotices);
  const examsQ = useQuery({ queryKey: ["exams"], queryFn: () => api<ExamRow[]>("/api/exams") });
  const exams = useLiveOrDemo(examsQ, demoExams);
  const taskSummary = useQuery({
    queryKey: ["teacher-tasks-summary"],
    queryFn: () => api<{ todo: number; inProgress: number; completed: number; overdue: number }>("/api/teacher-tasks/summary"),
  });
  return (
    <div className="space-y-6">
      <DashHero
        kicker="Principal desk"
        title={greeting(user?.fullName)}
        body="Today's attendance, teacher work and campus approvals."
        dataFirst
      />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="Students" value={formatNumber(dash.data?.students)} art="student" to="/app/students" />
        <StatCard label="Student attendance" value={dash.data?.attendancePercent != null ? `${dash.data.attendancePercent}%` : dash.isDemo ? `${demoDashboard.attendanceToday}%` : "—"} hint={dash.data?.attendanceDate ? formatDate(dash.data.attendanceDate) : "Latest marked day"} art="attendance" to="/app/attendance" />
        <StatCard label="Teacher tasks" value={formatNumber((taskSummary.data?.todo ?? 0) + (taskSummary.data?.inProgress ?? 0))} hint={`${taskSummary.data?.overdue ?? 0} overdue`} art="homework" to="/app/tasks" />
        <StatCard label="Pending fees" value={formatNumber(dash.data?.pendingInvoices)} art="fees" to="/app/pending-fees" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityFeed
          title="Upcoming exams"
          rows={(exams.data ?? []).slice(0, 5).map((e) => ({
            id: e.id,
            title: e.name,
            meta: e.examType ?? "Assessment",
            when: e.startDate,
            href: "/app/exams",
          }))}
          action={exams.isDemo ? <DemoChip show /> : undefined}
        />
        <ActivityFeed
          title="Recent notices"
          rows={unwrapList<{ id?: string; title?: string; audienceType?: string }>(notices.data).slice(0, 4).map((n) => ({
            id: n.id ?? n.title ?? "n",
            title: n.title ?? "Notice",
            meta: n.audienceType,
            href: "/app/notices",
          }))}
        />
      </div>
      <QuickActions items={[
        { label: "Assign teacher task", to: "/app/tasks" },
        { label: "Staff attendance", to: "/app/staff-attendance" },
        { label: "Review papers", to: "/app/study-materials" },
        { label: "Leave approvals", to: "/app/leave-approvals" },
        { label: "Homework", to: "/app/homework" },
        { label: "Results", to: "/app/results" },
      ]} />
    </div>
  );
}

function TeacherDash() {
  const { user } = useAuth();
  const today = ((new Date().getDay() + 6) % 7) + 1;
  const desk = useQuery({
    queryKey: ["teacher-desk"],
    queryFn: () =>
      api<{
        assignments: Array<{ id: string; subject: string; className: string; sectionName: string; sectionId: string }>;
        timetable: unknown[];
        homework: unknown[];
        students: unknown[];
      }>("/api/staff/me/workspace"),
  });
  const taskSummary = useQuery({
    queryKey: ["teacher-tasks-summary"],
    queryFn: () => api<{ todo: number; inProgress: number; overdue: number }>("/api/teacher-tasks/summary"),
  });
  const examsQ = useQuery({ queryKey: ["exams"], queryFn: () => api<ExamRow[]>("/api/exams") });
  const papers = useQuery({
    queryKey: ["study-papers-desk"],
    queryFn: () => api<Array<{ id: string; title: string; status: string }>>("/api/study-papers"),
  });
  const notices = useQuery({ queryKey: ["notices"], queryFn: () => api<unknown[]>("/api/notices") });
  const unread = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: () => api<{ count: number }>("/api/notifications/unread-count"),
  });
  const slots = unwrapList(desk.data?.timetable);
  const periods = slots.filter((r) => Number(asRecord(r).dayOfWeek ?? 1) === today);
  const shown = periods.length ? periods : slots;
  const hwRows = unwrapList(desk.data?.homework);
  const assigns = desk.data?.assignments ?? [];
  const draftPapers = (papers.data ?? []).filter((p) => p.status === "DRAFT" || p.status === "SUBMITTED" || p.status === "REJECTED");
  const openExams = (examsQ.data ?? []).filter((e) => e.status !== "PUBLISHED");
  return (
    <div className="space-y-6">
      <DashHero
        kicker="Teaching desk"
        title={greeting(user?.fullName)}
        body="Today's classes, assigned sections, tasks, homework and papers."
        dataFirst
        aside={
          <Link to="/app/attendance" className="inline-flex border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15">
            Mark attendance
          </Link>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Today's periods" value={shown.length} art="timetable" to="/app/timetable" />
        <StatCard label="Sections" value={assigns.length} art="student" to="/app/classes" />
        <StatCard label="My tasks" value={formatNumber((taskSummary.data?.todo ?? 0) + (taskSummary.data?.inProgress ?? 0))} hint={`${taskSummary.data?.overdue ?? 0} overdue`} art="homework" to="/app/tasks" />
        <StatCard label="Homework" value={hwRows.length} art="homework" to="/app/homework" />
        <StatCard label="Papers pending" value={draftPapers.length} art="exam" to="/app/study-materials" />
        <StatCard label="Unread alerts" value={formatNumber(unread.data?.count)} art="homework" to="/app/notifications" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <Link to="/app/classes" className="font-display text-xl text-ink-900 hover:text-forest-700">Assigned sections</Link>
          {desk.isLoading ? <Skeleton className="mt-3 h-28" /> : assigns.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No teacher assignments yet. Admin must map you to a class/section/subject.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {assigns.slice(0, 8).map((a) => (
                <li key={a.id} className="flex justify-between border-b border-line/60 py-2 text-sm">
                  <span className="font-medium">{a.className}-{a.sectionName}</span>
                  <span className="text-slate-400">{a.subject}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <Link to="/app/timetable" className="font-display text-xl text-ink-900 hover:text-forest-700">Today's timetable</Link>
          {desk.isLoading ? <Skeleton className="mt-3 h-28" /> : shown.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No periods scheduled for today.</p>
          ) : shown.slice(0, 8).map((t, i) => {
            const rec = asRecord(t);
            return (
              <div key={str(rec.id, String(i))} className="flex justify-between border-b border-line/60 py-2 text-sm">
                <span className="font-medium">{str(rec.startTime)} · {asName(rec.subject) || "Subject"}</span>
                <span className="text-slate-400">{str(rec.room, "Room TBA")}</span>
              </div>
            );
          })}
        </Card>
        <Card>
          <Link to="/app/homework" className="font-display text-xl text-ink-900 hover:text-forest-700">Homework queue</Link>
          {hwRows.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No homework published yet.</p>
          ) : hwRows.slice(0, 6).map((h, i) => {
            const rec = asRecord(h);
            return (
              <div key={str(rec.id, String(i))} className="border-b border-line/60 py-2 text-sm">
                <p className="font-medium">{str(rec.title)}</p>
                <p className="text-xs text-slate-400">{asName(rec.subject)} · due {str(rec.dueDate)}</p>
              </div>
            );
          })}
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityFeed
          title="Upcoming exams"
          rows={openExams.slice(0, 5).map((e) => ({
            id: e.id,
            title: e.name,
            meta: e.status,
            when: e.startDate,
            href: "/app/exams",
          }))}
        />
        <ActivityFeed
          title="Notices"
          rows={unwrapList<{ id?: string; title?: string; audienceType?: string }>(notices.data).slice(0, 5).map((n) => ({
            id: n.id ?? n.title ?? "n",
            title: n.title ?? "Notice",
            meta: n.audienceType,
            href: "/app/notices",
          }))}
        />
      </div>
      <QuickActions items={[
        { label: "My tasks", to: "/app/tasks" },
        { label: "Create homework", to: "/app/homework" },
        { label: "Enter marks", to: "/app/marks" },
        { label: "Question papers", to: "/app/study-materials" },
        { label: "Mark attendance", to: "/app/attendance" },
        { label: "My attendance", to: "/app/staff-attendance" },
      ]} />
    </div>
  );
}

type FleetRow = {
  id: string;
  registrationNumber?: string;
  vehicleType?: string;
  capacity?: number;
  status?: string;
};

type DriverRow = { id: string; fullName?: string; licenseNumber?: string; mobile?: string; status?: string };

type RouteRow = { id: string; name?: string; vehicleNumber?: string; driverName?: string; status?: string };

/**
 * Fleet command centre for the TRANSPORT role.
 *
 * Deliberately narrow: this role has no academic or financial reach, so the
 * dashboard only surfaces what it can actually act on. Every query here is one
 * the server permits for TRANSPORT - see PermissionMatrix.
 */
function TransportDash() {
  const { user } = useAuth();
  const vehiclesQ = useQuery({
    queryKey: ["transport-vehicles"],
    queryFn: () => api<FleetRow[]>("/api/transport/vehicles"),
  });
  const driversQ = useQuery({
    queryKey: ["transport-drivers"],
    queryFn: () => api<DriverRow[]>("/api/transport/drivers"),
  });
  const routesQ = useQuery({
    queryKey: ["transport-routes"],
    queryFn: () => api<RouteRow[]>("/api/transport/routes"),
  });

  const vehicles = vehiclesQ.data ?? [];
  const drivers = driversQ.data ?? [];
  const routes = routesQ.data ?? [];

  const active = vehicles.filter((v) => v.status !== "RETIRED");
  const onRoad = active.filter((v) => v.status === "ACTIVE").length;
  const outOfService = active.length - onRoad;
  const seats = active.reduce((sum, v) => sum + (v.capacity ?? 0), 0);
  const unassigned = routes.filter((r) => !r.vehicleNumber || !r.driverName);

  const loading = vehiclesQ.isLoading || driversQ.isLoading || routesQ.isLoading;
  const failed = vehiclesQ.isError || driversQ.isError || routesQ.isError;

  return (
    <div className="space-y-6">
      <DashHero
        kicker="Transport control"
        title={greeting(user?.fullName)}
        body="Vehicles, drivers, routes and daily trips for the campus fleet."
        image={SCHOOL.transportFleet}
        position={SCHOOL_CROP.bus}
        aside={
          <div className="rounded-2xl border border-white/15 bg-ink-950/55 p-5 backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gilt-400">Today</p>
            <ul className="mt-3 space-y-2 text-sm text-white/85">
              <li className="flex justify-between gap-6 border-b border-white/10 pb-2">
                <span>Buses on road</span>
                <span className="font-semibold text-gilt-400">{formatNumber(onRoad)}</span>
              </li>
              <li className="flex justify-between gap-6 border-b border-white/10 pb-2">
                <span>Routes</span>
                <span className="font-semibold">{formatNumber(routes.length)}</span>
              </li>
              <li className="flex justify-between gap-6">
                <span>Drivers</span>
                <span className="font-semibold">{formatNumber(drivers.length)}</span>
              </li>
            </ul>
          </div>
        }
      />

      {failed ? <ErrorState message="Fleet data is unavailable right now. Please try again shortly." /> : null}

      {loading ? (
        <Skeleton className="h-28" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Buses on road" value={formatNumber(onRoad)} hint="Marked active" art="bus" to="/app/transport" />
          <StatCard label="Out of service" value={formatNumber(outOfService)} hint="Needs attention" art="bus" to="/app/transport" />
          <StatCard label="Routes" value={formatNumber(routes.length)} hint="Configured" art="transport" to="/app/transport" />
          <StatCard label="Seats" value={formatNumber(seats)} hint="Total capacity" art="student" to="/app/transport" />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <p className="font-display text-xl text-ink-900">Routes needing a vehicle or driver</p>
          <p className="mt-1 text-sm text-slate-500">Assign before the next trip is scheduled.</p>
          {unassigned.length === 0 ? (
            <EmptyState title="Every route is crewed" body="All configured routes have a vehicle and a driver assigned." />
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {unassigned.slice(0, 6).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-900">{r.name ?? "Unnamed route"}</p>
                    <p className="text-xs text-slate-500">
                      {r.vehicleNumber ? `Vehicle ${r.vehicleNumber}` : "No vehicle"} ·{" "}
                      {r.driverName ? r.driverName : "No driver"}
                    </p>
                  </div>
                  <Link to="/app/transport" className="shrink-0 text-sm font-semibold text-forest-700 hover:underline">
                    Assign
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <ActivityFeed
          title="Fleet"
          rows={active.slice(0, 8).map((v) => ({
            id: v.id,
            title: v.registrationNumber ?? "Vehicle",
            meta: `${v.vehicleType ?? "BUS"} · ${v.capacity ?? "-"} seats`,
            when: v.status ?? "",
          }))}
        />
      </div>

      <QuickActions
        items={[
          { label: "Bus tracking", to: "/app/bus-tracking" },
          { label: "Routes & stops", to: "/app/transport" },
          { label: "Notices", to: "/app/notices" },
          { label: "My leave", to: "/app/leave" },
        ]}
      />
    </div>
  );
}

function AccountantDash() {
  const dashQ = useQuery({ queryKey: ["dashboard"], queryFn: () => api<DashboardData>("/api/dashboard") });
  const dash = useLiveOrDemo(dashQ, demoDashboard);
  const analyticsQ = useQuery({ queryKey: ["dashboard-analytics"], queryFn: () => api<DashboardAnalytics>("/api/dashboard/analytics") });
  const payments = analyticsQ.data?.recentPayments ?? [];
  return (
    <div className="space-y-6">
      <DashHero
        kicker="Finance desk"
        title="Collections overview"
        body="Invoices, collections and outstanding fees from PostgreSQL."
        dataFirst
      />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="Pending invoices" value={formatNumber(dash.data?.pendingInvoices)} art="fees" to="/app/pending-fees" />
        <StatCard label="Fee collected" value={formatMoney(dash.data?.feeCollected)} hint={dash.data?.feeTotal != null ? `${formatMoney(dash.data.feeTotal)} billed` : "Live when API returns totals"} art="fees" to="/app/invoices" />
        <StatCard label="Today's collection" value={formatMoney(dash.data?.todayCollected ?? 0)} hint="Gateway payments recorded today" art="report" to="/app/payments" />
        <StatCard label="Overdue invoices" value={formatNumber(dash.data?.overdueInvoices ?? 0)} hint="Pending or partial past due date" art="fees" to="/app/pending-fees" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card className="portal-chart h-80">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-xl text-ink-900">Collection trend</p>
            {DEMO_MODE ? <DemoChip show /> : null}
          </div>
          {DEMO_MODE ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={collectionTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E0DA" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 0, border: "1px solid #E3E0DA", fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="#15151A" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          ) : (
            <p className="pt-8 text-sm text-slate-500">No fee time-series API yet. Recent payments below use live dashboard analytics when available.</p>
          )}
        </Card>
        <ActivityFeed
          title="Recent payments"
          rows={(payments.length ? payments : dash.isDemo ? demoRecentPayments : []).map((p) => ({ id: p.id, title: p.name, meta: String(p.amount), when: p.when }))}
          action={!payments.length && dash.isDemo ? <DemoChip show /> : undefined}
        />
      </div>
      <QuickActions items={[
        { label: "Invoices", to: "/app/invoices" },
        { label: "Record payment", to: "/app/payments" },
        { label: "Receipts", to: "/app/receipts" },
        { label: "Fee structures", to: "/app/fees" },
        { label: "Pending fees", to: "/app/pending-fees" },
        { label: "Fee reports", to: "/app/reports" },
      ]} />
    </div>
  );
}

function ParentDash() {
  const { user } = useAuth();
  const { selected, children, isDemo, setSelectedId } = useChildScope();
  const pack = useQuery({
    queryKey: ["student-workspace", selected?.id],
    enabled: Boolean(selected?.id) && !selected?.id.startsWith("demo-"),
    queryFn: () => api<StudentWorkspace>(`/api/students/${selected!.id}/workspace`),
  });
  const transport = pack.data?.transport?.[0];
  const loadingStats = pack.isLoading || pack.isFetching;
  return (
    <div className="space-y-6">
      <DashHero
        kicker="Family workspace"
        title={greeting(user?.fullName)}
        body="Follow every child from one place — attendance, homework, fees and transport."
        image={SCHOOL.studentsGroup}
        position="center 30%"
      />
      {isDemo ? <p className="text-sm text-amber-800">Demo children — shown only because DEMO_MODE is enabled and the API returned no linked students.</p> : null}
      {!isDemo && pack.isError ? <ErrorState message="Could not load student workspace." onRetry={() => pack.refetch()} status={(pack.error as { status?: number })?.status} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {children.map((c) => (
          <PersonCard
            key={c.id}
            name={c.fullName}
            meta={`${c.admissionNumber} · ${c.className}-${c.sectionName}`}
            detail={c.branchName}
            active={selected?.id === c.id}
            onClick={() => setSelectedId(c.id)}
            image={sectionImageForPath("/app/students")}
          />
        ))}
      </div>
      {!children.length && !isDemo ? <EmptyState title="No linked students" body="Ask the school office to link your guardian account to a student." /> : null}
      {selected && !pack.isError ? (
        <div className="grid gap-3 md:grid-cols-4">
          <StatCard label="Attendance" value={loadingStats ? "…" : pack.data ? `${pack.data.attendance.percentage}%` : "—"} art="attendance" to="/app/attendance" />
          <StatCard label="Pending homework" value={loadingStats ? "…" : pack.data?.homework.length ?? 0} art="homework" to="/app/homework" />
          <StatCard label="Next exam" value={loadingStats ? "…" : pack.data?.exams[0]?.name ?? "—"} art="exam" to="/app/exams" />
          <StatCard label="Pending fees" value={loadingStats ? "…" : (pack.data?.invoices ?? []).filter((i) => i.status !== "PAID").length} art="fees" to="/app/pending-fees" />
        </div>
      ) : null}
      <Card className="flex items-center gap-4">
        <div className="h-14 w-14 shrink-0">
          <Premium3DIcon kind="bus" size={56} />
        </div>
        <div>
          <p className="font-semibold text-ink-900">School bus</p>
          {loadingStats ? (
            <p className="mt-1 text-sm text-slate-500">Loading transport…</p>
          ) : transport ? (
            <p className="mt-1 text-sm text-slate-500">
              {transport.route} · Stop {transport.stop}
              {transport.vehicle ? ` · ${transport.vehicle}` : ""}
              {transport.driver ? ` · Driver ${transport.driver}` : ""}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">No transport assignment on file for this student.</p>
          )}
        </div>
      </Card>
      <QuickActions items={[
        { label: "Bus tracking", to: "/app/bus-tracking" },
        { label: "Attendance", to: "/app/attendance" },
        { label: "Timetable", to: "/app/timetable" },
        { label: "Fees", to: "/app/fees" },
        { label: "Leave", to: "/app/leave" },
        { label: "Notices", to: "/app/notices" },
      ]} />
    </div>
  );
}

function StudentDash() {
  const { user } = useAuth();
  const { selected } = useChildScope();
  const name = selected?.fullName ?? user?.fullName;
  const pack = useQuery({
    queryKey: ["student-workspace", selected?.id],
    enabled: Boolean(selected?.id) && !selected?.id.startsWith("demo-"),
    queryFn: () => api<StudentWorkspace>(`/api/students/${selected!.id}/workspace`),
  });
  const today = ((new Date().getDay() + 6) % 7) + 1;
  const periods = (pack.data?.timetable ?? []).filter((slot) => slot.dayOfWeek === today);
  const loadingStats = pack.isLoading || pack.isFetching;
  const timetableRows = periods.length ? periods : (pack.data?.timetable ?? []).slice(0, 4);
  const homeworkRows = pack.data?.homework ?? [];
  return (
    <div className="space-y-6">
      <DashHero
        kicker="Student desk"
        title={greeting(name)}
        body={`${selected?.className ?? ""} ${selected?.sectionName ?? ""} · ${SCHOOL_NAME}`.trim()}
        image={SCHOOL.studentsUniform}
        position="center 30%"
      />
      {pack.isError ? <ErrorState message="Could not load your workspace." onRetry={() => pack.refetch()} status={(pack.error as { status?: number })?.status} /> : null}
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="Attendance" value={loadingStats ? "…" : pack.data ? `${pack.data.attendance.percentage}%` : "—"} art="attendance" to="/app/attendance" />
        <StatCard label="Next class" value={loadingStats ? "…" : periods[0]?.subject ?? pack.data?.timetable[0]?.subject ?? "—"} hint={periods[0] ? `${periods[0].startTime} · ${periods[0].room}` : "No period today"} art="timetable" to="/app/timetable" />
        <StatCard label="Pending homework" value={loadingStats ? "…" : homeworkRows.length} art="homework" to="/app/homework" />
        <StatCard label="Library books" value={loadingStats ? "…" : pack.data?.library.length ?? 0} art="library" to="/app/library" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <p className="mb-3 font-display text-xl text-ink-900">Today&apos;s classes</p>
          {loadingStats ? <Skeleton className="h-24" /> : null}
          {!loadingStats && !timetableRows.length ? <p className="text-sm text-slate-500">No timetable slots for today.</p> : null}
          {timetableRows.map((slot) => (
            <p key={slot.id} className="flex justify-between border-b border-line/70 py-2.5 text-sm"><span className="font-medium">{slot.startTime} · {slot.subject}</span><span className="text-slate-400">{slot.room}</span></p>
          ))}
        </Card>
        <ActivityFeed
          title="Homework"
          rows={homeworkRows.map((h) => ({ id: h.id, title: h.title, meta: h.subject, when: h.dueDate }))}
        />
      </div>
      <QuickActions items={[
        { label: "Homework", to: "/app/homework" },
        { label: "Exams", to: "/app/exams" },
        { label: "Bus", to: "/app/bus-tracking" },
        { label: "Library", to: "/app/library" },
        { label: "Results", to: "/app/results" },
        { label: "Notices", to: "/app/notices" },
      ]} />
    </div>
  );
}
