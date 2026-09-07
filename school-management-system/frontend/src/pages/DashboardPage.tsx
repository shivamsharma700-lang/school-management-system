import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useChildScope } from "../lib/child";
import { asName, asRecord, formatDate, formatHumanTime, formatMoney, formatNumber, str, unwrapList } from "../lib/format";
import { canAudit } from "../lib/roles";
import type { AcademicYear, AuditRow, Branch, DashboardAnalytics, DashboardData, ExamRow, StudentWorkspace } from "../lib/types";
import { Button, Card, EmptyState, PageHeader, Skeleton, StatCard } from "../components/ui";
import { DemoChip, CinematicBanner, StudentFigure } from "../components/brand";
import { ActivityFeed, CampusMosaic, InsightKicker, Ornament, PersonCard, QuickActions } from "../components/visual";
import { sectionImageForPath } from "../lib/mediaCatalog";
import { useLiveOrDemo } from "../demo/useLiveOrDemo";
import { demoAttendance, demoBranches, demoBuses, demoDashboard, demoExams, demoHomework, demoInvoices, demoNotices, demoTimetable, demoAdmissions, demoRecentPayments, demoEvents, demoEnrollment, demoAttendanceMix, demoYears } from "../demo";
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
  const today = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date());
  const bus = demoBuses[0];
  const mix = (charts?.attendanceMix ?? []).map((row, i) => ({
    ...row,
    color: ["#12885a", "#c9a227", "#e11d48", "#64748b"][i % 4],
  }));
  const enrollment = charts?.enrollmentByClass?.length ? charts.enrollmentByClass : demoEnrollment.map((d) => ({ name: d.name, value: d.y2 }));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gilt-600">Operations desk</p>
          <h1 className="mt-1 font-display text-4xl text-[#053321]">Welcome back, {user?.fullName?.split(" ")[0] ?? "Super Admin"}</h1>
          <p className="mt-1 text-sm text-slate-500">Here's what's happening across all {branchCount || 8} branches today.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
          <span className="rounded-full bg-white px-3 py-1.5 shadow-card">{today}</span>
          <span className="rounded-full bg-white px-3 py-1.5 shadow-card">Academic year 2025-26</span>
          <span className="rounded-full bg-white px-3 py-1.5 shadow-card">{branchCount} campuses</span>
        </div>
      </div>
      <CinematicBanner
        className="mb-6"
        pathname="/app/dashboard"
        title="Where Potential Meets Purpose"
        subtitle={`Live operations across ${SCHOOL_NAME}. API totals win; labelled demo chips mark fallback charts.`}
        showImage
      />
      {dash.isLoading ? <Skeleton className="h-32" /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total students" value={formatNumber(live?.students ?? demoDashboard.students)} hint="PostgreSQL headcount" glyph="student" tone="emerald" />
          <StatCard label="Teachers" value={formatNumber(live?.teachers ?? live?.staff)} hint="Teaching staff" glyph="teacher" tone="sky" />
          <StatCard label="Staff members" value={formatNumber(live?.staffMembers ?? live?.staff)} hint="Non-teaching + leadership" glyph="staff" tone="violet" />
          <StatCard label="Branches" value={formatNumber(branchCount)} hint="Delhi NCR demo campuses" glyph="campus" tone="navy" />
          <StatCard label="Fee collection" value={formatMoney(live?.feeCollected)} hint={live?.feeTotal != null ? `${formatMoney(live.feeTotal)} billed` : "From invoices"} glyph="fees" tone="gold" />
          <StatCard label="Attendance" value={live?.attendancePercent != null ? `${live.attendancePercent}%` : "—"} hint={live?.attendanceDate ? `${formatNumber(live.attendancePresent)} / ${formatNumber(live.attendanceMarked)} on ${formatDate(live.attendanceDate)}` : "Latest marked day"} glyph="attendance" tone="rose" />
        </div>
      )}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="portal-chart h-80 xl:col-span-1">
          <div className="mb-3 flex items-center justify-between"><p className="font-display text-xl text-[#053321]">Student enrollment</p>{charts ? null : <DemoChip show />}</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={enrollment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf2" />
              <XAxis dataKey="name" hide={enrollment.length > 10} /><YAxis /><Tooltip />
              <Bar dataKey="value" name="Students" fill="#12885a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="h-80">
          <div className="mb-3 flex items-center justify-between"><p className="font-semibold">Attendance overview</p>{mix.length ? null : <DemoChip show />}</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={mix.length ? mix : demoAttendanceMix} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={3}>
                {(mix.length ? mix : demoAttendanceMix).map((s) => <Cell key={s.name} fill={"color" in s ? s.color : "#12885a"} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="h-80">
          <p className="font-semibold">Fee collection</p>
          <p className="mt-4 font-display text-4xl">{formatMoney(live?.feeCollected)}</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-forest-600 to-gilt-500" style={{ width: `${Math.min(100, Number(live?.feeTotal) ? (Number(live?.feeCollected) / Number(live?.feeTotal)) * 100 : 0)}%` }} />
          </div>
          <p className="mt-2 text-sm text-slate-500">{formatMoney(live?.feeTotal)} billed · {formatNumber(live?.pendingInvoices)} pending invoices</p>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="mb-3 flex justify-between"><p className="font-semibold">Recent admissions</p><Link className="text-sm text-forest-700" to="/app/admissions">View</Link></div>
          {(charts?.recentAdmissions ?? demoAdmissions).map((a) => (
            <div key={a.id} className="flex items-center justify-between border-b border-slate-100 py-2.5 text-sm">
              <div><p className="font-medium">{a.name}</p><p className="text-xs text-slate-400">{a.className} · {a.campus}</p></div>
              <span className="text-xs text-slate-400">{a.when}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div className="mb-3 flex justify-between"><p className="font-semibold">Recent payments</p><Link className="text-sm text-forest-700" to="/app/payments">View</Link></div>
          {(charts?.recentPayments ?? demoRecentPayments).map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b border-slate-100 py-2.5 text-sm">
              <div><p className="font-medium">{p.name}</p><p className="text-xs text-slate-400">{p.when}</p></div>
              <span className="font-semibold text-forest-700">{typeof p.amount === "number" || /^\d/.test(String(p.amount)) ? formatMoney(p.amount) : p.amount}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div className="mb-3 flex justify-between"><p className="font-semibold">Campus notices</p><Link className="text-sm text-forest-700" to="/app/notices">View</Link></div>
          {(charts?.recentNotices?.length
            ? charts.recentNotices
            : extras
              ? demoEvents.map((e) => ({ id: e.id, title: e.title, when: e.date }))
              : []
          ).map((e) => (
            <div key={e.id} className="flex gap-3 border-b border-slate-100 py-2.5 text-sm">
              <span className="w-28 shrink-0 font-semibold text-ink-800">{formatDate(e.when) || e.when}</span>
              <div><p className="font-medium">{e.title}</p></div>
            </div>
          ))}
          {!charts?.recentNotices?.length && !extras ? (
            <p className="text-sm text-slate-500">No notices returned by the analytics API yet.</p>
          ) : extras && !charts?.recentNotices?.length ? <DemoChip show /> : null}
        </Card>
      </div>
      <QuickActions items={[
        { label: "Add student", to: "/app/students" },
        { label: "Add teacher", to: "/app/teachers" },
        { label: "Create notice", to: "/app/notices" },
        { label: "Record payment", to: "/app/payments" },
        { label: "Add branch", to: "/app/branches" },
        { label: "Create exam", to: "/app/exams" },
      ]} />
      <div className="mt-8">
        <InsightKicker>Campuses</InsightKicker>
        <h2 className="mt-2 font-display text-3xl text-[#053321]">Eight Delhi-NCR campuses at a glance</h2>
        <p className="mt-2 mb-5 max-w-2xl text-sm text-slate-500">Each campus card uses licensed stills stored locally. Headcount on the dashboard comes from PostgreSQL.</p>
        <CampusMosaic />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Ornament src="/assets/3d/bus.svg" className="h-20 w-32 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><p className="font-semibold">Bus tracking</p><span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">Demo tracking</span></div>
            <p className="mt-2 font-display text-2xl">{bus.code}</p>
            <p className="text-sm text-slate-500">{bus.route} · {bus.status} · Next {bus.nextStop} · ETA {bus.etaMinutes} min</p>
            <Link to="/app/bus-tracking" className="mt-3 inline-block text-sm font-semibold text-forest-700">Open map</Link>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <StudentFigure />
          <div>
            <p className="font-display text-xl text-[#053321]">Campus pulse</p>
            <p className="mt-1 text-sm text-slate-500">Recent audited actions across the group.</p>
            <div className="mt-3 flex justify-between text-sm"><span>Recent activity</span><Link className="text-forest-700" to="/app/audit">Audit</Link></div>
            {(auditQ.data ?? []).slice(0, 2).map((r) => (
              <p key={r.id} className="text-xs text-slate-400">{r.action} · {formatHumanTime(r.createdAt)}</p>
            ))}
          </div>
        </Card>
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
    <div>
      <p className="stat-kicker text-gilt-600">Campus operations</p>
      <CinematicBanner className="mb-6 mt-2" pathname="/app/dashboard" title={greeting(user?.fullName)} subtitle={`${user?.branchName ?? "Campus"} · live counts from PostgreSQL`} showImage />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Students" value={formatNumber(dash.data?.students)} />
        <StatCard label="Staff" value={formatNumber(dash.data?.staff)} />
        <StatCard label="Pending fees" value={formatNumber(dash.data?.pendingInvoices)} tone="gold" />
        <StatCard label="Attendance" value={dash.data?.attendancePercent != null ? `${dash.data.attendancePercent}%` : `${demoDashboard.attendanceToday}%`} hint={dash.data?.attendanceDate ? formatDate(dash.data.attendanceDate) : "Latest marked day"} tone="rose" />
      </div>
      <div className="mt-6">
        <ActivityFeed
          title="Campus notices"
          rows={noticeRows.map((n) => ({ id: n.id ?? n.title ?? "n", title: n.title ?? "Notice", meta: n.audienceType, when: n.createdAt }))}
          action={notices.isDemo ? <DemoChip show /> : undefined}
        />
      </div>
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
  return (
    <div>
      <p className="stat-kicker text-gilt-600">Principal desk</p>
      <CinematicBanner className="mb-6 mt-2" pathname="/app/dashboard" title={greeting(user?.fullName)} subtitle="Academic and pastoral operations for your campus." showImage />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Students" value={formatNumber(dash.data?.students)} />
        <StatCard label="Attendance" value={dash.data?.attendancePercent != null ? `${dash.data.attendancePercent}%` : `${demoDashboard.attendanceToday}%`} hint={dash.data?.attendanceDate ? formatDate(dash.data.attendanceDate) : "Latest marked day"} tone="rose" />
        <StatCard label="Staff on roll" value={formatNumber(dash.data?.staff)} tone="sky" />
        <StatCard label="Pending fees" value={formatNumber(dash.data?.pendingInvoices)} tone="gold" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ActivityFeed
          title="Upcoming exams"
          rows={(exams.data ?? []).slice(0, 5).map((e) => ({ id: e.id, title: e.name, meta: e.examType ?? "Assessment", when: e.startDate }))}
          action={exams.isDemo ? <DemoChip show /> : undefined}
        />
        <ActivityFeed
          title="Recent notices"
          rows={unwrapList<{ id?: string; title?: string; audienceType?: string }>(notices.data).slice(0, 4).map((n) => ({
            id: n.id ?? n.title ?? "n",
            title: n.title ?? "Notice",
            meta: n.audienceType,
          }))}
        />
      </div>
      <QuickActions items={[
        { label: "Pending approvals", to: "/app/leave-approvals" },
        { label: "Homework", to: "/app/homework" },
        { label: "Complaints", to: "/app/complaints" },
        { label: "Students", to: "/app/students" },
        { label: "Results", to: "/app/results" },
        { label: "PTM", to: "/app/ptm" },
      ]} />
    </div>
  );
}

function TeacherDash() {
  const { user } = useAuth();
  const today = ((new Date().getDay() + 6) % 7) + 1;
  const yearsQ = useQuery({ queryKey: ["years"], queryFn: () => api<AcademicYear[]>("/api/academic-years") });
  const years = useLiveOrDemo(yearsQ, demoYears);
  const yearId = years.data?.[0]?.id ?? "";
  const skipYear = !yearId || yearId.startsWith("demo-");
  const ttQ = useQuery({
    queryKey: ["timetable", yearId],
    enabled: Boolean(yearId) && !skipYear,
    queryFn: () => api<unknown[]>(`/api/timetable?academicYearId=${yearId}`),
  });
  const slots = useLiveOrDemo(ttQ, demoTimetable);
  const hwQ = useQuery({ queryKey: ["homework"], queryFn: () => api<unknown[]>("/api/homework") });
  const homework = useLiveOrDemo(hwQ, demoHomework);
  const examsQ = useQuery({ queryKey: ["exams"], queryFn: () => api<ExamRow[]>("/api/exams") });
  const exams = useLiveOrDemo(examsQ, demoExams);
  const rows = unwrapList(slots.data);
  const periods = rows.filter((r) => Number(asRecord(r).dayOfWeek ?? 1) === today);
  const shown = periods.length ? periods : rows.filter((r) => Number(asRecord(r).dayOfWeek ?? 1) === 1);
  const hwRows = unwrapList(homework.data);
  return (
    <div>
      <PageHeader title={greeting(user?.fullName)} subtitle="Your classes, timetable and marking queue." action={<Link to="/app/attendance"><Button>Mark attendance</Button></Link>} />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Today's periods" value={shown.length} />
        <StatCard label="Homework out" value={hwRows.length} tone="sky" />
        <StatCard label="Upcoming exam" value={exams.data?.[0]?.name ?? "—"} tone="gold" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-[#053321]">Today's timetable</p>
            {slots.isDemo ? <DemoChip show /> : null}
          </div>
          {slots.isLoading ? <Skeleton className="h-40" /> : shown.length === 0 ? (
            <EmptyState title="No periods today" body="Timetable slots appear after the academic year schedule is published." />
          ) : shown.map((t, i) => {
            const rec = asRecord(t);
            return (
              <p key={str(rec.id, String(i))} className="flex justify-between border-b border-slate-100 py-2.5 text-sm">
                <span className="font-medium">{str(rec.startTime)} · {asName(rec.subject) || "Subject"}</span>
                <span className="text-slate-400">{str(rec.room, "Room TBA")}</span>
              </p>
            );
          })}
        </Card>
        <ActivityFeed
          title="Homework queue"
          rows={hwRows.slice(0, 6).map((h, i) => {
            const rec = asRecord(h);
            return { id: str(rec.id, String(i)), title: str(rec.title, "Homework"), meta: asName(rec.subject), when: str(rec.dueDate) };
          })}
          action={homework.isDemo ? <DemoChip show /> : undefined}
        />
      </div>
      <QuickActions items={[
        { label: "Create homework", to: "/app/homework" },
        { label: "Enter marks", to: "/app/marks" },
        { label: "My students", to: "/app/students" },
        { label: "Timetable", to: "/app/timetable" },
        { label: "Study materials", to: "/app/study-materials" },
        { label: "PTM", to: "/app/ptm" },
      ]} />
    </div>
  );
}

function AccountantDash() {
  const dashQ = useQuery({ queryKey: ["dashboard"], queryFn: () => api<DashboardData>("/api/dashboard") });
  const dash = useLiveOrDemo(dashQ, demoDashboard);
  const analyticsQ = useQuery({ queryKey: ["dashboard-analytics"], queryFn: () => api<DashboardAnalytics>("/api/dashboard/analytics") });
  const payments = analyticsQ.data?.recentPayments ?? [];
  return (
    <div>
      <PageHeader title="Finance desk" subtitle="Collections and overdue counts come from PostgreSQL. Trend chart is labelled demo until a time-series API exists." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Pending invoices" value={formatNumber(dash.data?.pendingInvoices)} tone="gold" />
        <StatCard label="Fee collected" value={formatMoney(dash.data?.feeCollected)} hint={dash.data?.feeTotal != null ? `${formatMoney(dash.data.feeTotal)} billed` : "Live when API returns totals"} />
        <StatCard label="Today's collection" value={formatMoney(dash.data?.todayCollected ?? 0)} hint="Gateway payments recorded today" tone="sky" />
        <StatCard label="Overdue invoices" value={formatNumber(dash.data?.overdueInvoices ?? 0)} hint="Pending or partial past due date" tone="rose" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="h-80">
          <div className="mb-3 flex items-center justify-between"><p className="font-semibold text-[#053321]">Collection trend</p><DemoChip show /></div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={collectionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf2" />
              <XAxis dataKey="name" /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="value" stroke="#14663a" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
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
  const bus = demoBuses[0];
  return (
    <div>
      <PageHeader title={greeting(user?.fullName)} subtitle="Follow every child from one family workspace." />
      {isDemo ? <p className="mb-4 text-sm text-amber-800">Showing demo children because no linked students were returned by the API.</p> : null}
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
      {selected ? (
        <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Attendance" value={pack.data ? `${pack.data.attendance.percentage}%` : `${demoAttendance.percentage}%`} />
        <StatCard label="Pending homework" value={pack.data?.homework.length ?? (pack.isFetched ? 0 : demoHomework.length)} tone="sky" />
        <StatCard label="Next exam" value={pack.data?.exams[0]?.name ?? (pack.isFetched ? "—" : demoExams[0]?.name ?? "—")} tone="gold" />
        <StatCard label="Pending fees" value={(pack.data?.invoices ?? (pack.isFetched ? [] : demoInvoices)).filter((i) => i.status !== "PAID").length} tone="rose" />
        </div>
      ) : null}
      <Card className="mt-6 flex items-center gap-4">
        <Ornament src="/assets/3d/bus.svg" className="h-16 w-28" />
        <div>
          <div className="flex items-center gap-2"><p className="font-semibold">School bus</p><span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">Demo tracking</span></div>
          <p className="mt-1 text-sm text-slate-500">{bus.code} · {bus.route} · ETA {bus.etaMinutes} min</p>
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
  const periods = (pack.data?.timetable ?? []).filter((t) => t.dayOfWeek === today);
  return (
    <div>
      <CinematicBanner className="mb-6" pathname="/app/students" title={greeting(name)} subtitle={`${selected?.className ?? ""} ${selected?.sectionName ?? ""} · ${SCHOOL_NAME}`} showImage />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Attendance" value={pack.data ? `${pack.data.attendance.percentage}%` : `${demoAttendance.percentage}%`} />
        <StatCard label="Next class" value={periods[0]?.subject ?? pack.data?.timetable[0]?.subject ?? "—"} hint={periods[0] ? `${periods[0].startTime} · ${periods[0].room}` : "No period today"} />
        <StatCard label="Pending homework" value={pack.data?.homework.length ?? (pack.isFetched ? 0 : demoHomework.length)} />
        <StatCard label="Library books" value={pack.data?.library.length ?? 0} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <p className="mb-3 font-semibold text-[#053321]">Today's classes</p>
          {(periods.length ? periods : pack.data?.timetable.slice(0, 4) ?? demoTimetable.filter((t) => t.dayOfWeek === 1)).map((t) => (
            <p key={t.id} className="flex justify-between py-2.5 text-sm"><span className="font-medium">{t.startTime} · {t.subject}</span><span className="text-slate-400">{t.room}</span></p>
          ))}
        </Card>
        <ActivityFeed
          title="Homework"
          rows={(pack.data?.homework?.length ? pack.data.homework : pack.isFetched ? [] : demoHomework).map((h) => ({ id: h.id, title: h.title, meta: h.subject, when: h.dueDate }))}
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
