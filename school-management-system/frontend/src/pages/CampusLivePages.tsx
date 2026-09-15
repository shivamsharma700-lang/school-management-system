import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api, post } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatHumanTime, prettyStatus } from "../lib/format";
import { isAdminLike } from "../lib/roles";
import type { Branch, PageResponse, Student } from "../lib/types";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  TableShell,
  Textarea,
  statusTone,
} from "../components/ui";

type CampusRow = {
  id: string;
  title: string;
  category: string;
  status: string;
  scheduledAt: string;
  location: string;
  referenceCode: string;
  details: string;
  studentName: string;
  staffName: string;
  branchName: string;
  updatedAt: string;
};

const MODULES: Record<string, { title: string; subtitle: string; type: string; categoryHint: string }> = {
  entrance: { title: "Entrance tests", subtitle: "Scheduled written and oral entrance assessments for applicants.", type: "ENTRANCE_TEST", categoryHint: "WRITTEN" },
  interviews: { title: "Interviews", subtitle: "Admission interviews tracked in PostgreSQL.", type: "INTERVIEW", categoryHint: "PANEL" },
  promotions: { title: "Promotions", subtitle: "Class promotion decisions and batches.", type: "PROMOTION", categoryHint: "YEARLY" },
  transfers: { title: "Transfer / TC", subtitle: "Transfer certificate and exit requests.", type: "TRANSFER", categoryHint: "TC" },
  health: { title: "Health", subtitle: "Clinic visits and medical notes.", type: "HEALTH", categoryHint: "CLINIC" },
  discipline: { title: "Discipline", subtitle: "Conduct incidents and counselling notes.", type: "DISCIPLINE", categoryHint: "WARNING" },
  sports: { title: "Sports", subtitle: "Teams, meets and sports activity logs.", type: "SPORTS", categoryHint: "TEAM" },
  labs: { title: "Labs", subtitle: "Science / computer lab session records.", type: "LAB", categoryHint: "SCIENCE" },
  ptm: { title: "PTM", subtitle: "Parent–teacher meeting slots.", type: "PTM", categoryHint: "SLOT" },
  alumni: { title: "Alumni", subtitle: "Alumni directory entries.", type: "ALUMNI", categoryHint: "BATCH" },
};

function CampusModulePage({ moduleKey }: { moduleKey: keyof typeof MODULES }) {
  const meta = MODULES[moduleKey];
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: meta.categoryHint,
    status: "OPEN",
    scheduledAt: "",
    location: "",
    referenceCode: "",
    details: "",
    studentId: "",
    branchId: "",
  });
  const list = useQuery({
    queryKey: ["campus-records", meta.type],
    queryFn: () => api<CampusRow[]>(`/api/campus-records?type=${meta.type}`),
  });
  const branches = useQuery({ queryKey: ["branches"], queryFn: () => api<Branch[]>("/api/branches") });
  const students = useQuery({
    queryKey: ["students-lite"],
    enabled: isAdminLike(user?.role),
    queryFn: () => api<PageResponse<Student>>("/api/students?size=100"),
  });
  const create = useMutation({
    mutationFn: () =>
      post("/api/campus-records", {
        moduleType: meta.type,
        title: form.title,
        category: form.category,
        status: form.status,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
        location: form.location,
        referenceCode: form.referenceCode,
        details: form.details,
        studentId: form.studentId || null,
        branchId: form.branchId || user?.branchId || undefined,
      }),
    onSuccess: () => {
      toast.success("Record saved");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["campus-records", meta.type] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const rows = list.data ?? [];
  return (
    <div>
      <PageHeader
        crumbs={["Campus"]}
        title={meta.title}
        subtitle={meta.subtitle}
        action={isAdminLike(user?.role) || user?.role === "TEACHER" ? <Button onClick={() => setOpen(true)}>Add record</Button> : null}
      />
      {list.isLoading ? <Skeleton className="h-64" /> : list.isError ? (
        <ErrorState message="Could not load records." onRetry={() => list.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="No records yet" body="Create the first live record for this module." />
      ) : (
        <TableShell columns={["Title", "Category", "Student", "When", "Status", "Campus"]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3 font-medium">{r.title}</td>
              <td className="px-4 py-3">{r.category || "—"}</td>
              <td className="px-4 py-3">{r.studentName || "—"}</td>
              <td className="px-4 py-3">{r.scheduledAt ? formatHumanTime(r.scheduledAt) : formatHumanTime(r.updatedAt)}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(r.status)}>{prettyStatus(r.status)}</Badge></td>
              <td className="px-4 py-3">{r.branchName}</td>
            </tr>
          ))}
        </TableShell>
      )}
      <Modal open={open} title={`Add — ${meta.title}`} onClose={() => setOpen(false)} wide>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title" required><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
          <Field label="Category"><Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} /></Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="OPEN">Open</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="ISSUED">Issued</option>
            </Select>
          </Field>
          <Field label="Scheduled"><Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))} /></Field>
          <Field label="Location"><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></Field>
          <Field label="Reference"><Input value={form.referenceCode} onChange={(e) => setForm((f) => ({ ...f, referenceCode: e.target.value }))} /></Field>
          <Field label="Student">
            <Select value={form.studentId} onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}>
              <option value="">Optional</option>
              {(students.data?.items ?? []).map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </Select>
          </Field>
          {user?.role === "SUPER_ADMIN" ? (
            <Field label="Campus">
              <Select value={form.branchId} onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}>
                <option value="">Select campus</option>
                {(branches.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </Field>
          ) : null}
          <div className="sm:col-span-2">
            <Field label="Details"><Textarea value={form.details} onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))} /></Field>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!form.title || create.isPending} onClick={() => create.mutate()}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}

export function EntranceTestsPage() { return <CampusModulePage moduleKey="entrance" />; }
export function InterviewsPage() { return <CampusModulePage moduleKey="interviews" />; }
export function PromotionsPage() { return <CampusModulePage moduleKey="promotions" />; }
export function TransfersPage() { return <CampusModulePage moduleKey="transfers" />; }
export function HealthPage() { return <CampusModulePage moduleKey="health" />; }
export function DisciplinePage() { return <CampusModulePage moduleKey="discipline" />; }
export function SportsPage() { return <CampusModulePage moduleKey="sports" />; }
export function LabsPage() { return <CampusModulePage moduleKey="labs" />; }
export function PtmPage() { return <CampusModulePage moduleKey="ptm" />; }
export function AlumniPage() { return <CampusModulePage moduleKey="alumni" />; }

export function DocumentsHubPage() {
  const students = useQuery({
    queryKey: ["students-docs"],
    queryFn: () => api<PageResponse<Student>>("/api/students?size=50"),
  });
  return (
    <div>
      <PageHeader
        crumbs={["People"]}
        title="Documents"
        subtitle="Open a student profile and use the Documents tab to upload. This hub lists students with records on file."
      />
      {(students.data?.items ?? []).length === 0 ? (
        <EmptyState title="No students" body="Add students first, then attach documents on their profile." />
      ) : (
        <TableShell columns={["Admission", "Name", "Class", ""]}>
          {(students.data?.items ?? []).map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-3">{s.admissionNumber}</td>
              <td className="px-4 py-3 font-medium">{s.fullName}</td>
              <td className="px-4 py-3">{s.className ?? "—"} / {s.sectionName ?? "—"}</td>
              <td className="px-4 py-3 text-right">
                <Link className="font-semibold text-forest-700" to={`/app/students/${s.id}`}>Open 360</Link>
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}
