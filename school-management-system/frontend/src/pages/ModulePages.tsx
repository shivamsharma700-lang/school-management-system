import { useMemo, useState } from "react";
import { DemoChip } from "../components/brand";
import { Badge, Button, Drawer, EmptyState, Input, PageHeader, Select, StatCard, TableShell, statusTone } from "../components/ui";
import { glyphForPath } from "../components/glyphs";
import { FieldMedia } from "../components/media";
import { SITE_MEDIA } from "../lib/schoolMedia";
import { WEBSITE_CONTENT_BLOCKS } from "./homeContent";
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

function labelize(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
}

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
  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    rows.forEach((r) => Object.keys(r).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [rows]);
  const statuses = useMemo(() => Array.from(new Set(rows.map((r) => r.status).filter(Boolean))), [rows]);
  const filtered = rows.filter((r) => {
    const blob = Object.values(r).join(" ").toLowerCase();
    return (!q || blob.includes(q.toLowerCase())) && (!status || r.status === status);
  });
  const tableCols = columns.length ? columns : allKeys.filter((k) => k !== "id").slice(0, 6);

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Records" value={rows.length} hint="In this workspace" glyph={glyphForPath(undefined, title)} to={undefined} />
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
          columns={[...tableCols.map(labelize), ""]}
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
            <tr key={r.id ?? Object.values(r).join("-")} className="cursor-pointer" onClick={() => setSelected(r)}>
              {tableCols.map((c) => (
                <td key={c} className="px-4 font-medium text-slate-700 first:text-[#111114]">
                  {c === "status" ? <Badge tone={statusTone(r.status)}>{r.status}</Badge> : r[c] ?? "—"}
                </td>
              ))}
              <td className="px-4 text-right">
                <button
                  type="button"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(r);
                  }}
                >
                  View all
                </button>
              </td>
            </tr>
          ))}
        </TableShell>
      )}
      <Drawer open={Boolean(selected)} title={selected?.name || selected?.title || selected?.student || selected?.ref || "Record details"} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-5">
            <p className="text-xs text-slate-500">Complete record — every field available for this item.</p>
            <dl className="grid gap-3 text-sm">
              {Object.entries(selected).map(([k, v]) => (
                <div key={k} className="grid gap-0.5 border-b border-ink-900/6 pb-2.5 last:border-0">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{labelize(k)}</dt>
                  <dd className="font-medium text-ink-900">{v || "—"}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-2 border-t border-ink-900/8 pt-4">
              <Button size="sm" variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button size="sm" variant="ghost" onClick={() => alert("Edit is not available for this demo workspace yet.")}>
                Edit
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

const note =
  "DEMO WORKSPACE — no dedicated PostgreSQL module for this screen yet. All fields below are shown for review; nothing is written to the live database from here.";

export function EnquiriesPage() {
  return <Workspace title="Admissions enquiries" subtitle="Front-office enquiry desk — search, filter and open full records." columns={["name", "classFor", "campus", "status", "date"]} rows={demoEnquiries} note={note} />;
}
export function ApplicationsPage() {
  return <Workspace title="Applications" subtitle="Submitted admission applications — open any row for every field." columns={["ref", "student", "className", "status"]} rows={demoApplications} note={note} />;
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
  return <Workspace title="Events & calendar" subtitle="Exams, PTM, sports and holidays — click a row to see the full event record." columns={["date", "title", "type", "audience"]} rows={demoEvents.map((e) => ({ ...e, id: e.title + e.date, status: e.type }))} note={note} />;
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

/** Public website content inventory — frontend-managed until CMS publish APIs exist. */
export function WebsiteContentPage() {
  const [selected, setSelected] = useState<(typeof WEBSITE_CONTENT_BLOCKS)[number] | null>(null);
  return (
    <div>
      <PageHeader
        title="Website content"
        subtitle="School website sections and media fields. Notices remain editable via Communication → Notices (live API)."
      />
      <div className="portal-notify mb-4 flex flex-wrap items-center gap-2 px-3.5 py-2.5">
        <DemoChip show />
        <p className="text-xs leading-5 text-amber-900/90">
          Public pages (hero, about, gallery, admissions copy) are managed in the frontend content model today. There is no CMS publish API yet — view fields here; edits require a content deployment. Live announcements use /api/notices.
        </p>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Content blocks" value={WEBSITE_CONTENT_BLOCKS.length} hint="Public site sections" glyph={glyphForPath(undefined, "Website")} />
        <StatCard label="Media fields" value={Object.keys(SITE_MEDIA).length} hint="Named SITE_MEDIA keys" glyph={glyphForPath(undefined, "Gallery")} tone="sky" />
        <StatCard label="Live notices API" value="Yes" hint="/api/notices" glyph={glyphForPath(undefined, "Notices")} tone="gold" />
      </div>
      <TableShell columns={["Section", "Fields", "Media key", ""]}>
        {WEBSITE_CONTENT_BLOCKS.map((block) => (
          <tr key={block.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelected(block)}>
            <td className="px-4 py-3 font-medium">{block.title}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{block.fields.join(" · ")}</td>
            <td className="px-4 py-3 text-xs text-slate-500">{block.media}</td>
            <td className="px-4 py-3 text-right">
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelected(block); }}>
                View
              </Button>
            </td>
          </tr>
        ))}
      </TableShell>
      <Drawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? "Content block"}>
        {selected ? (
          <div className="space-y-4">
            <FieldMedia src={SITE_MEDIA[selected.media as keyof typeof SITE_MEDIA]} alt="" frame="banner" />
            <p className="text-xs text-slate-500">Media field: {selected.media}</p>
            <dl className="grid gap-2">
              {selected.fields.map((f) => (
                <div key={f} className="border-b border-ink-900/6 pb-2 text-sm">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Field</dt>
                  <dd className="mt-0.5 font-medium">{f}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-2 border-t border-ink-900/8 pt-4">
              <Button size="sm" variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button size="sm" variant="ghost" onClick={() => alert("CMS edit/publish APIs are not available yet. Update homeContent.ts / SITE_MEDIA for now.")}>
                Edit (not wired)
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
