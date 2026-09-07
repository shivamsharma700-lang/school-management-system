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
  Card,
  Drawer,
  EmptyState,
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
  if (!canReports(user?.role)) {
    return <EmptyState title="Reports unavailable" body="Your role cannot read the reports summary endpoint." />;
  }
  const chart = [
    { name: "Students", value: reports.data?.students ?? 0 },
    { name: "Library loans", value: reports.data?.overdueLoans ?? 0 },
    { name: "Pending leave", value: reports.data?.pendingLeave ?? 0 },
  ];
  return (
    <div>
      <PageHeader
        crumbs={["Insights"]}
        title="Reports"
        subtitle="Live summary from /api/reports/summary. There is no export endpoint yet, so no fake CSV download is shown."
      />
      {reports.isLoading ? <Skeleton className="h-40" /> : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Students" value={reports.data?.students ?? 0} glyph="student" />
          <StatCard label="Open / overdue loans" value={reports.data?.overdueLoans ?? 0} hint="Library" glyph="library" />
          <StatCard label="Pending leave" value={reports.data?.pendingLeave ?? 0} glyph="leave" />
        </div>
      )}
      <Card className="mt-6 h-80">
        <p className="mb-4 font-semibold">Summary comparison</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf2" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#12885a" radius={[8, 8, 0, 0]} />
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
  const settings = useQuery({ queryKey: ["settings"], queryFn: () => api<{ app: string; role: string; branchScoped: boolean }>("/api/settings") });
  const sections = [
    { id: "school", label: "School" },
    { id: "branch", label: "Branch" },
    { id: "academic", label: "Academic" },
    { id: "users", label: "Users & roles" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" },
  ];
  return (
    <div>
      <PageHeader crumbs={["Organisation"]} title="Settings" subtitle="Workspace preferences. Mutable school settings are not persisted yet besides what the API already stores." />
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
          {section === "school" ? (
            <dl className="grid gap-4 text-sm">
              <div><dt className="text-slate-500">School</dt><dd className="font-semibold">{SCHOOL_NAME}</dd></div>
              <div><dt className="text-slate-500">Application</dt><dd className="font-semibold">{settings.data?.app ?? "School Management System"}</dd></div>
              <div><dt className="text-slate-500">Signed in as</dt><dd>{user?.fullName}</dd></div>
              <div><dt className="text-slate-500">Workspace role</dt><dd><Badge>{prettyRole(settings.data?.role ?? user?.role)}</Badge></dd></div>
            </dl>
          ) : null}
          {section === "branch" ? (
            <div>
              <p className="font-semibold">Branch settings</p>
              <p className="mt-2 text-sm text-slate-500">{user?.branchName ?? "All branches"} · scoped={String(settings.data?.branchScoped ?? false)}</p>
            </div>
          ) : null}
          {section === "academic" ? (
            <p className="text-sm text-slate-600">Academic years, classes and subjects are managed from the Academics section. Those records are the live settings.</p>
          ) : null}
          {section === "users" ? (
            <p className="text-sm text-slate-600">Roles are enforced by the Spring Boot API. The UI only hides actions your role cannot call.</p>
          ) : null}
          {section === "notifications" ? (
            <p className="text-sm text-slate-600">In-app notifications are delivered by the backend. There is no preference API to persist email/SMS toggles yet.</p>
          ) : null}
          {section === "security" ? (
            <div className="text-sm text-slate-600">
              <p>JWT access tokens authenticate every /api call. Refresh tokens are stored locally after login.</p>
              <p className="mt-2">Password reset uses a hashed token on the server. Never paste production secrets into the frontend.</p>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
