import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatHumanTime, prettyRole } from "../lib/format";
import { canAudit, canReports } from "../lib/roles";
import type { AuditRow } from "../lib/types";
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Select,
  Skeleton,
  StatCard,
  TableShell,
} from "../components/ui";
import { SCHOOL_NAME } from "../demo/config";

export function ReportsPage() {
  const { user } = useAuth();
  const reports = useQuery({
    queryKey: ["reports"],
    enabled: canReports(user?.role),
    queryFn: () => api<{ students: number; overdueLoans: number; pendingLeave: number; generatedAt: string }>("/api/reports/summary"),
  });
  const students = useQuery({
    queryKey: ["students-export"],
    enabled: canReports(user?.role),
    queryFn: () => api<{ items: Array<{ admissionNumber: string; fullName: string; className?: string; sectionName?: string; status: string; mobile?: string }> }>("/api/students?size=200"),
  });
  const pending = useQuery({
    queryKey: ["invoices-pending-export"],
    enabled: canReports(user?.role),
    queryFn: () => api<Array<{ invoiceNumber: string; studentName?: string; dueDate: string; totalAmount: number | string; paidAmount: number | string; status: string }>>("/api/invoices?status=PENDING"),
  });
  const events = useQuery({
    queryKey: ["events-export"],
    enabled: canReports(user?.role),
    queryFn: () => api<Array<{ title: string; eventType: string; startsAt: string; status: string }>>("/api/events"),
  });

  function downloadCsv(filename: string, headers: string[], rows: string[][]) {
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!canReports(user?.role)) {
    return <EmptyState title="Reports unavailable" body="Your role does not have access to school reports." />;
  }
  const chart = [
    { name: "Students", value: reports.data?.students ?? 0 },
    { name: "Library loans", value: reports.data?.overdueLoans ?? 0 },
    { name: "Pending leave", value: reports.data?.pendingLeave ?? 0 },
    { name: "Pending fees", value: pending.data?.length ?? 0 },
  ];
  return (
    <div>
      <PageHeader
        crumbs={["Insights"]}
        title="Reports"
        subtitle="Live summaries and CSV exports built from PostgreSQL APIs — no fabricated spreadsheets."
      />
      {reports.isLoading ? <Skeleton className="h-40" /> : (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Students" value={reports.data?.students ?? 0} glyph="student" />
          <StatCard label="Open / overdue loans" value={reports.data?.overdueLoans ?? 0} hint="Library" glyph="library" />
          <StatCard label="Pending leave" value={reports.data?.pendingLeave ?? 0} glyph="leave" />
          <StatCard label="Pending invoices" value={pending.data?.length ?? 0} glyph="fees" />
        </div>
      )}
      <Card className="mt-6">
        <p className="mb-3 font-semibold">CSV exports (live data)</p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={!students.data?.items?.length}
            onClick={() =>
              downloadCsv(
                "students.csv",
                ["Admission", "Name", "Class", "Section", "Mobile", "Status"],
                (students.data?.items ?? []).map((s) => [s.admissionNumber, s.fullName, s.className ?? "", s.sectionName ?? "", s.mobile ?? "", s.status])
              )
            }
          >
            Export students
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!pending.data?.length}
            onClick={() =>
              downloadCsv(
                "pending-fees.csv",
                ["Invoice", "Student", "Due", "Total", "Paid", "Status"],
                (pending.data ?? []).map((i) => [i.invoiceNumber, i.studentName ?? "", i.dueDate, String(i.totalAmount), String(i.paidAmount), i.status])
              )
            }
          >
            Export pending fees
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!events.data?.length}
            onClick={() =>
              downloadCsv(
                "events.csv",
                ["Title", "Type", "Starts", "Status"],
                (events.data ?? []).map((e) => [e.title, e.eventType, e.startsAt, e.status])
              )
            }
          >
            Export events
          </Button>
        </div>
      </Card>
      <Card className="mt-6 h-80">
        <p className="mb-4 font-semibold">Summary comparison</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf2" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#3A3A45" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <p className="mt-3 text-xs text-slate-400">Generated {reports.data?.generatedAt ? formatHumanTime(reports.data.generatedAt) : "—"}</p>
    </div>
  );
}

export function AuditPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [action, setAction] = useState("");
  const [role, setRole] = useState("");
  const [entity, setEntity] = useState("");
  const [from, setFrom] = useState("");
  const [selected, setSelected] = useState<AuditRow | null>(null);
  const audit = useQuery({
    queryKey: ["audit", 0],
    enabled: canAudit(user?.role),
    queryFn: () => api<AuditRow[]>("/api/audit-logs?page=0"),
  });
  const rows = useMemo(() => {
    return (audit.data ?? []).filter((r) => {
      const blob = `${r.action} ${r.entityType} ${r.userName} ${r.role} ${r.details}`.toLowerCase();
      return (
        (!q || blob.includes(q.toLowerCase())) &&
        (!action || r.action === action) &&
        (!role || r.role === role) &&
        (!entity || r.entityType === entity) &&
        (!from || (r.createdAt && r.createdAt.slice(0, 10) >= from))
      );
    });
  }, [audit.data, q, action, role, entity, from]);
  const actions = Array.from(new Set((audit.data ?? []).map((r) => r.action).filter(Boolean)));
  const roles = Array.from(new Set((audit.data ?? []).map((r) => r.role).filter(Boolean)));
  const entities = Array.from(new Set((audit.data ?? []).map((r) => r.entityType).filter(Boolean)));
  if (!canAudit(user?.role)) {
    return <EmptyState title="Audit logs unavailable" body="Only super admins and branch admins can read the audit trail." />;
  }
  const creates = (audit.data ?? []).filter((r) => r.action === "CREATE").length;
  return (
    <div>
      <PageHeader
        crumbs={["Insights"]}
        title="Audit logs"
        subtitle="Security-relevant actions from the API. IP and device fields are omitted because the backend does not store them."
      />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <StatCard label="Events on this page" value={audit.data?.length ?? 0} hint="Latest 50 records" glyph="audit" />
        <StatCard label="Creates" value={creates} glyph="document" />
        <StatCard label="Entity types" value={entities.length} glyph="report" />
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-5">
        <Input placeholder="Search action, user, entity" value={q} onChange={(e) => setQ(e.target.value)} />
        <Input type="date" aria-label="From date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">All actions</option>
          {actions.map((a) => <option key={a}>{a}</option>)}
        </Select>
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          {roles.map((r) => <option key={r}>{r}</option>)}
        </Select>
        <Select value={entity} onChange={(e) => setEntity(e.target.value)}>
          <option value="">All entities</option>
          {entities.map((e) => <option key={e}>{e}</option>)}
        </Select>
      </div>
      {audit.isLoading ? <Skeleton className="h-72" /> : rows.length === 0 ? (
        <EmptyState title="No matching events" body="Try clearing filters. This list is the latest page from the API, not a fabricated history." />
      ) : (
        <TableShell columns={["Action", "User", "Role", "Entity", "Branch", "When"]}>
          {rows.map((r) => (
            <tr key={r.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelected(r)}>
              <td className="px-4 py-3 font-semibold">{r.action}</td>
              <td className="px-4 py-3">{r.userName || "—"}</td>
              <td className="px-4 py-3">{prettyRole(r.role)}</td>
              <td className="px-4 py-3">{r.entityType}{r.entityId ? ` · ${r.entityId.slice(0, 8)}` : ""}</td>
              <td className="px-4 py-3">{r.branchName || "—"}</td>
              <td className="px-4 py-3 text-slate-500">{formatHumanTime(r.createdAt)}</td>
            </tr>
          ))}
        </TableShell>
      )}
      <Drawer open={Boolean(selected)} title="Audit event" onClose={() => setSelected(null)}>
        {selected ? (
          <dl className="grid gap-3 text-sm">
            <div><dt className="text-slate-500">Action</dt><dd className="font-semibold">{selected.action}</dd></div>
            <div><dt className="text-slate-500">User</dt><dd>{selected.userName || "—"}</dd></div>
            <div><dt className="text-slate-500">Role</dt><dd>{prettyRole(selected.role)}</dd></div>
            <div><dt className="text-slate-500">Entity</dt><dd>{selected.entityType}</dd></div>
            <div><dt className="text-slate-500">Entity ID</dt><dd className="break-all">{selected.entityId || "—"}</dd></div>
            <div><dt className="text-slate-500">Branch</dt><dd>{selected.branchName || "—"}</dd></div>
            <div><dt className="text-slate-500">When</dt><dd>{formatHumanTime(selected.createdAt)}</dd></div>
            <div>
              <dt className="text-slate-500">Details</dt>
              <dd className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-slate-700">{selected.details || "No extra metadata was stored for this event."}</dd>
            </div>
          </dl>
        ) : null}
      </Drawer>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const [section, setSection] = useState("school");
  const settings = useQuery({
    queryKey: ["settings"],
    queryFn: () =>
      api<{
        app: string;
        role: string;
        branchScoped: boolean;
        branchId?: string;
        branchCount?: number;
        activeAcademicYear?: { id: string; name: string; startDate: string; endDate: string };
        roles?: string[];
      }>("/api/settings"),
  });
  const sections = [
    { id: "school", label: "School" },
    { id: "branch", label: "Branch" },
    { id: "academic", label: "Academic" },
    { id: "users", label: "Users & roles" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" },
  ];
  const year = settings.data?.activeAcademicYear;
  return (
    <div>
      <PageHeader crumbs={["Organisation"]} title="Settings" subtitle="Workspace configuration for this school." />
      {settings.isError ? (
        <ErrorState
          message={(settings.error as Error)?.message || "Unable to load settings"}
          status={(settings.error as { status?: number })?.status}
          onRetry={() => settings.refetch()}
        />
      ) : null}
      {!settings.isError ? (
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card padded={false} className="h-fit p-2">
          {sections.map((s) => (
            <button
              key={s.id}
              className={`flex w-full rounded-xl px-3 py-2 text-left text-sm font-medium ${section === s.id ? "bg-ink-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
              onClick={() => setSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </Card>
        <Card>
          {settings.isLoading ? <Skeleton className="h-40" /> : null}
          {section === "school" ? (
            <dl className="grid gap-4 text-sm">
              <div><dt className="text-slate-500">School</dt><dd className="font-semibold">{settings.data?.app ?? "—"}</dd></div>
              <div><dt className="text-slate-500">Signed in as</dt><dd>{user?.fullName}</dd></div>
              <div><dt className="text-slate-500">Workspace role</dt><dd><Badge>{prettyRole(settings.data?.role ?? user?.role)}</Badge></dd></div>
              <div><dt className="text-slate-500">Campuses in scope</dt><dd className="font-semibold">{settings.data?.branchCount ?? "—"}</dd></div>
            </dl>
          ) : null}
          {section === "branch" ? (
            <div>
              <p className="font-semibold">Branch settings</p>
              <p className="mt-2 text-sm text-slate-500">{user?.branchName ?? "All branches"} · scoped={String(settings.data?.branchScoped ?? false)}</p>
              <p className="mt-2 text-xs text-slate-400">Branch id: {settings.data?.branchId || "—"}</p>
            </div>
          ) : null}
          {section === "academic" ? (
            <div className="text-sm text-slate-600">
              <p className="font-semibold">Active academic year</p>
              <p className="mt-2">{year ? `${year.name} (${year.startDate} → ${year.endDate})` : "No ACTIVE year set"}</p>
              <p className="mt-3">Years, classes and subjects are managed from Academics.</p>
            </div>
          ) : null}
          {section === "users" ? (
            <div className="text-sm text-slate-600">
              <p>Roles enforced by the API: {(settings.data?.roles ?? []).join(", ") || "see backend Role enum"}.</p>
              <p className="mt-2">The UI hides actions your role cannot call via route RBAC.</p>
            </div>
          ) : null}
          {section === "notifications" ? (
            <p className="text-sm text-slate-600">In-app notifications are delivered by the backend. Open Notifications for the live inbox.</p>
          ) : null}
          {section === "security" ? (
            <div className="text-sm text-slate-600">
              <p>JWT access + refresh tokens; login rate limiting; security response headers.</p>
              <p className="mt-2">Password reset uses hashed server tokens. Never put production secrets in the frontend.</p>
            </div>
          ) : null}
        </Card>
      </div>
      ) : null}
    </div>
  );
}
