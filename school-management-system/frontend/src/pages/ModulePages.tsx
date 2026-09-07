import { useMemo, useState } from "react";
import { DemoChip } from "../components/brand";
import { Badge, Drawer, EmptyState, Input, PageHeader, Select, StatCard, TableShell, statusTone } from "../components/ui";
import { glyphForPath } from "../components/glyphs";
import {
  demoAdmissions,
  demoAlumni,
  demoApplications,
  demoDiscipline,
  demoDocuments,
  demoEnquiries,
  demoEvents,
  demoHealth,
  demoInventory,
  demoLabs,
  demoLms,
  demoPayroll,
  demoPromotions,
  demoPtm,
  demoSports,
  demoTransfers,
} from "../demo";

type Row = Record<string, string>;

function Workspace({
  title,
  subtitle,
  columns,
  rows,
  note,
}: {
  title: string;
  subtitle: string;
  columns: string[];
  rows: Row[];
  note: string;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const statuses = useMemo(() => Array.from(new Set(rows.map((r) => r.status).filter(Boolean))), [rows]);
  const filtered = rows.filter((r) => {
    const blob = Object.values(r).join(" ").toLowerCase();
    return (!q || blob.includes(q.toLowerCase())) && (!status || r.status === status);
  });
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Records" value={rows.length} hint="In this workspace" glyph={glyphForPath(undefined, title)} />
        <StatCard label="Visible now" value={filtered.length} hint={q || status ? "After filters" : "All rows"} glyph={glyphForPath(undefined, title)} tone="sky" />
        <StatCard label="Statuses" value={statuses.length || "—"} hint="Distinct states" glyph={glyphForPath(undefined, title)} tone="gold" />
      </div>
      <div className="portal-notify mb-4 flex flex-wrap items-center gap-2 px-3.5 py-2.5">
        <DemoChip show />
        <p className="text-xs leading-5 text-amber-900/90">{note}</p>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No records in this module yet" body="This workspace is labelled demo-only. Nothing is written to PostgreSQL from this screen." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matching records" body="Try clearing search or filters." />
      ) : (
        <TableShell
          columns={[...columns.map((c) => c.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())), ""]}
          toolbar={
            <>
              <Input className="max-w-sm" placeholder={`Search ${title.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} />
              {statuses.length ? (
                <Select className="max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">All statuses</option>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              ) : null}
            </>
          }
        >
          {filtered.map((r) => (
            <tr key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
              {columns.map((c) => (
                <td key={c} className="px-4 font-medium text-slate-700 first:text-[#053321]">
                  {c === "status" ? <Badge tone={statusTone(r.status)}>{r.status}</Badge> : r[c] ?? "—"}
                </td>
              ))}
              <td className="px-4 text-right text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">View</td>
            </tr>
          ))}
        </TableShell>
      )}
      <Drawer open={Boolean(selected)} title={selected?.name || selected?.title || selected?.student || "Record"} onClose={() => setSelected(null)}>
        {selected ? (
          <dl className="grid gap-3 text-sm">
            {Object.entries(selected).map(([k, v]) => (
              <div key={k}>
                <dt className="capitalize text-slate-500">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Drawer>
    </div>
  );
}

const note = "DEMO DATA ONLY — there is no dedicated backend module for this screen yet. Records are isolated and never written to PostgreSQL.";

export function EnquiriesPage() {
  return <Workspace title="Admissions enquiries" subtitle="Front-office enquiry desk." columns={["name", "classFor", "campus", "status", "date"]} rows={demoEnquiries} note={note} />;
}
export function ApplicationsPage() {
  return <Workspace title="Applications" subtitle="Submitted admission applications." columns={["ref", "student", "className", "status"]} rows={demoApplications} note={note} />;
}
export function EntranceTestsPage() {
  return <Workspace title="Entrance tests" subtitle="Scheduled admission assessments." columns={["ref", "student", "className", "status"]} rows={demoApplications.map((a) => ({ ...a, status: "SCHEDULED" }))} note={note} />;
}
export function InterviewsPage() {
  return <Workspace title="Admission interviews" subtitle="Panel slots for shortlisted applicants." columns={["ref", "student", "className", "status"]} rows={demoApplications} note={note} />;
}
export function AdmissionsPage() {
  return <Workspace title="Admissions" subtitle="Offers and enrolments across campuses." columns={["name", "className", "campus", "status", "when"]} rows={demoAdmissions} note={note} />;
}
export function PromotionsPage() {
  return <Workspace title="Student promotion" subtitle="Year-end class movement. Confirmations must be posted by a future API." columns={["student", "from", "to", "status"]} rows={demoPromotions} note={note} />;
}
export function TransfersPage() {
  return <Workspace title="Transfer / TC" subtitle="Inter-campus transfers and certificates." columns={["student", "from", "to", "status"]} rows={demoTransfers} note={note} />;
}
export function DocumentsPage() {
  return <Workspace title="Documents" subtitle="Admission and school files. Binary upload is not exposed yet." columns={["name", "type", "status"]} rows={demoDocuments} note={note} />;
}
export function EventsPage() {
  return <Workspace title="Events & calendar" subtitle="Exams, PTM, sports and holidays." columns={["date", "title", "type", "audience"]} rows={demoEvents.map((e) => ({ ...e, status: e.type }))} note={note} />;
}
export function InventoryPage() {
  return <Workspace title="Inventory" subtitle="Assets and stock by campus." columns={["id", "category", "item", "branch", "location", "status"]} rows={demoInventory} note={note} />;
}
export function HrPage() {
  return <Workspace title="HR & payroll" subtitle="Payslips and salary runs. No payroll posting API yet." columns={["name", "department", "month", "amount", "status"]} rows={demoPayroll} note={note} />;
}
export function HealthPage() {
  return <Workspace title="Health" subtitle="Infirmary visits. Medical details stay restricted on the server when APIs exist." columns={["student", "visit", "date", "nurse"]} rows={demoHealth.map((h) => ({ ...h, status: "RECORDED" }))} note={note} />;
}
export function DisciplinePage() {
  return <Workspace title="Discipline" subtitle="Behaviour records and counsellor notes." columns={["student", "incident", "action", "date"]} rows={demoDiscipline.map((d) => ({ ...d, status: "OPEN" }))} note={note} />;
}
export function SportsPage() {
  return <Workspace title="Sports" subtitle="Teams, coaches and fixtures." columns={["team", "coach", "next"]} rows={demoSports.map((s) => ({ ...s, status: "ACTIVE" }))} note={note} />;
}
export function LabsPage() {
  return <Workspace title="Lab management" subtitle="Labs, schedules and safety status." columns={["name", "campus", "next", "status"]} rows={demoLabs} note={note} />;
}
export function PtmPage() {
  return <Workspace title="Parent-teacher meetings" subtitle="Slots and bookings." columns={["teacher", "slot", "parent", "status"]} rows={demoPtm} note={note} />;
}
export function AlumniPage() {
  return <Workspace title="Alumni" subtitle="Batch directory and achievements." columns={["name", "batch", "profession", "campus"]} rows={demoAlumni.map((a) => ({ ...a, status: "ACTIVE" }))} note={note} />;
}
export function LmsAliasPage() {
  return <Workspace title="Study materials" subtitle="Lessons and assignments catalogue." columns={["title", "type", "subject"]} rows={demoLms.map((l) => ({ ...l, status: l.type }))} note={note} />;
}
export function HostelPage() {
  return (
    <Workspace
      title="Hostel"
      subtitle="Boarding houses on Greater Noida and selected NCR campuses."
      columns={["name", "campus", "capacity", "status"]}
      rows={[
        { id: "h1", name: "Ashoka House", campus: "DPS Greater Noida", capacity: "120", status: "ACTIVE" },
        { id: "h2", name: "Tagore House", campus: "DPS Greater Noida", capacity: "96", status: "ACTIVE" },
        { id: "h3", name: "Day-boarder lounge", campus: "DPS Gurgaon", capacity: "40", status: "OPEN" },
      ]}
      note={note}
    />
  );
}
export function CanteenPage() {
  return (
    <Workspace
      title="Canteen"
      subtitle="Campus cafeterias and meal plans."
      columns={["name", "campus", "menu", "status"]}
      rows={[
        { id: "c1", name: "Main dining hall", campus: "DPS Main Campus", menu: "Veg / Jain", status: "OPEN" },
        { id: "c2", name: "Junior cafe", campus: "DPS North Delhi", menu: "Snack service", status: "OPEN" },
        { id: "c3", name: "Sports canteen", campus: "DPS Noida", menu: "Match-day menu", status: "SEASONAL" },
      ]}
      note={note}
    />
  );
}
