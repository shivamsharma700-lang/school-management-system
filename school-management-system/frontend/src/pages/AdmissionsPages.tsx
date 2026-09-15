import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api, post, put } from "../lib/api";
import { useAuth } from "../lib/auth";
import { prettyStatus } from "../lib/format";
import { isAdminLike } from "../lib/roles";
import type { AcademicYear, Branch, PageResponse, SchoolClass, Section } from "../lib/types";
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
  statusTone,
} from "../components/ui";

type Enquiry = {
  id: string;
  branchId: string;
  branchName: string;
  studentName: string;
  parentName?: string;
  mobile: string;
  email?: string;
  source?: string;
  notes?: string;
  status: string;
};

type Application = {
  id: string;
  branchId: string;
  branchName: string;
  academicYearId: string;
  academicYear: string;
  classId?: string;
  sectionId?: string;
  applicationNumber: string;
  studentName: string;
  dateOfBirth: string;
  gender: string;
  parentName: string;
  parentMobile: string;
  parentEmail?: string;
  address?: string;
  documentsVerified: boolean;
  status: string;
  reviewNotes?: string;
  enrolledStudentId?: string;
};

export function EnquiriesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ studentName: "", parentName: "", mobile: "", email: "", source: "Walk-in", notes: "", branchId: "", interestedClassId: "" });
  const list = useQuery({
    queryKey: ["admissions-enquiries", q, status],
    queryFn: () => api<PageResponse<Enquiry>>(`/api/admissions/enquiries?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}&size=50`),
  });
  const branches = useQuery({ queryKey: ["branches"], queryFn: () => api<Branch[]>("/api/branches") });
  const classes = useQuery({ queryKey: ["classes"], queryFn: () => api<SchoolClass[]>("/api/classes") });
  const create = useMutation({
    mutationFn: () => post("/api/admissions/enquiries", {
      ...form,
      branchId: form.branchId || user?.branchId || undefined,
      interestedClassId: form.interestedClassId || undefined,
    }),
    onSuccess: () => {
      toast.success("Enquiry saved");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["admissions-enquiries"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const rows = list.data?.items ?? [];
  return (
    <div>
      <PageHeader
        crumbs={["Admissions"]}
        title="Enquiries"
        subtitle="Live front-office enquiry desk (PostgreSQL)."
        action={isAdminLike(user?.role) ? <Button onClick={() => setOpen(true)}>New enquiry</Button> : null}
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input className="max-w-xs" placeholder="Search name or mobile" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="NEW">NEW</option>
          <option value="CONTACTED">CONTACTED</option>
          <option value="CONVERTED">CONVERTED</option>
          <option value="CLOSED">CLOSED</option>
        </Select>
      </div>
      {list.isLoading ? <Skeleton className="h-64" /> : list.isError ? (
        <ErrorState message="Could not load enquiries." onRetry={() => list.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="No enquiries" body="Create an enquiry to start the admissions funnel." />
      ) : (
        <TableShell columns={["Student", "Parent", "Mobile", "Campus", "Status"]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3 font-medium">{r.studentName}</td>
              <td className="px-4 py-3">{r.parentName || "—"}</td>
              <td className="px-4 py-3">{r.mobile}</td>
              <td className="px-4 py-3">{r.branchName}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(r.status)}>{prettyStatus(r.status)}</Badge></td>
            </tr>
          ))}
        </TableShell>
      )}
      <Modal open={open} title="New enquiry" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          <Field label="Student name"><Input value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} /></Field>
          <Field label="Parent name"><Input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} /></Field>
          <Field label="Mobile"><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Branch">
            <Select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
              <option value="">Default / assigned</option>
              {(branches.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </Field>
          <Field label="Interested class">
            <Select value={form.interestedClassId} onChange={(e) => setForm({ ...form, interestedClassId: e.target.value })}>
              <option value="">Optional</option>
              {(classes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Button disabled={create.isPending || !form.studentName || !form.mobile} onClick={() => create.mutate()}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}

export function ApplicationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    studentName: "", dateOfBirth: "", gender: "MALE", parentName: "", parentMobile: "", parentEmail: "", address: "",
    branchId: "", academicYearId: "", classId: "", sectionId: "",
  });
  const list = useQuery({
    queryKey: ["admissions-applications", q, status],
    queryFn: () => api<PageResponse<Application>>(`/api/admissions/applications?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}&size=50`),
  });
  const years = useQuery({ queryKey: ["years"], queryFn: () => api<AcademicYear[]>("/api/academic-years") });
  const branches = useQuery({ queryKey: ["branches"], queryFn: () => api<Branch[]>("/api/branches") });
  const classes = useQuery({ queryKey: ["classes", form.branchId], queryFn: () => api<SchoolClass[]>(`/api/classes${form.branchId ? `?branchId=${form.branchId}` : ""}`) });
  const sections = useQuery({
    queryKey: ["sections", form.classId],
    enabled: Boolean(form.classId),
    queryFn: () => api<Section[]>(`/api/classes/${form.classId}/sections`),
  });
  const create = useMutation({
    mutationFn: () => post("/api/admissions/applications", {
      ...form,
      branchId: form.branchId || user?.branchId || undefined,
      classId: form.classId || undefined,
      sectionId: form.sectionId || undefined,
    }),
    onSuccess: () => {
      toast.success("Application created");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["admissions-applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: ({ id, status: next, documentsVerified }: { id: string; status: string; documentsVerified?: boolean }) =>
      put(`/api/admissions/applications/${id}`, { status: next, documentsVerified }),
    onSuccess: () => {
      toast.success("Application updated");
      void qc.invalidateQueries({ queryKey: ["admissions-applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const rows = list.data?.items ?? [];
  return (
    <div>
      <PageHeader
        crumbs={["Admissions"]}
        title="Applications"
        subtitle="Admission applications with verify → approve → enroll workflow."
        action={isAdminLike(user?.role) ? <Button onClick={() => setOpen(true)}>New application</Button> : null}
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input className="max-w-xs" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {["SUBMITTED", "VERIFIED", "APPROVED", "REJECTED", "ENROLLED"].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>
      {list.isLoading ? <Skeleton className="h-64" /> : list.isError ? (
        <ErrorState message="Could not load applications." onRetry={() => list.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="No applications" body="Convert an enquiry or create an application." />
      ) : (
        <TableShell columns={["Ref", "Student", "Parent", "Campus", "Status", "Actions"]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3 font-medium">{r.applicationNumber}</td>
              <td className="px-4 py-3">{r.studentName}</td>
              <td className="px-4 py-3">{r.parentName}<div className="text-xs text-slate-400">{r.parentMobile}</div></td>
              <td className="px-4 py-3">{r.branchName}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(r.status)}>{prettyStatus(r.status)}</Badge></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {r.status === "SUBMITTED" ? (
                    <Button size="sm" variant="secondary" onClick={() => update.mutate({ id: r.id, status: "VERIFIED", documentsVerified: true })}>Verify</Button>
                  ) : null}
                  {r.status === "VERIFIED" ? (
                    <Button size="sm" variant="secondary" onClick={() => update.mutate({ id: r.id, status: "APPROVED" })}>Approve</Button>
                  ) : null}
                  {r.status === "APPROVED" || r.status === "VERIFIED" ? (
                    <Button size="sm" onClick={() => update.mutate({ id: r.id, status: "ENROLLED", documentsVerified: true })}>Enroll</Button>
                  ) : null}
                  {r.enrolledStudentId ? (
                    <Link className="text-sm font-semibold text-forest-700" to={`/app/students/${r.enrolledStudentId}`}>Student</Link>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </TableShell>
      )}
      <Modal open={open} title="New application" onClose={() => setOpen(false)}>
        <div className="grid max-h-[70vh] gap-3 overflow-y-auto">
          <Field label="Student name"><Input value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} /></Field>
          <Field label="Date of birth"><Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></Field>
          <Field label="Gender">
            <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </Select>
          </Field>
          <Field label="Parent name"><Input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} /></Field>
          <Field label="Parent mobile"><Input value={form.parentMobile} onChange={(e) => setForm({ ...form, parentMobile: e.target.value })} /></Field>
          <Field label="Parent email"><Input value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} /></Field>
          <Field label="Academic year">
            <Select value={form.academicYearId} onChange={(e) => setForm({ ...form, academicYearId: e.target.value })}>
              <option value="">Select</option>
              {(years.data ?? []).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
            </Select>
          </Field>
          <Field label="Branch">
            <Select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value, classId: "", sectionId: "" })}>
              <option value="">Default / assigned</option>
              {(branches.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </Field>
          <Field label="Class">
            <Select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value, sectionId: "" })}>
              <option value="">Required for enroll</option>
              {(classes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Section">
            <Select value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })} disabled={!form.classId}>
              <option value="">Required for enroll</option>
              {(sections.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Button
            disabled={create.isPending || !form.studentName || !form.dateOfBirth || !form.parentName || !form.parentMobile || !form.academicYearId}
            onClick={() => create.mutate()}
          >
            Submit application
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export function AdmissionsPage() {
  const list = useQuery({
    queryKey: ["admissions-applications", "pipeline"],
    queryFn: () => api<PageResponse<Application>>("/api/admissions/applications?size=50"),
  });
  const rows = list.data?.items ?? [];
  const enrolled = rows.filter((r) => r.status === "ENROLLED");
  return (
    <div>
      <PageHeader
        crumbs={["Admissions"]}
        title="Admissions pipeline"
        subtitle="Applications progressing to enrollment. Enrolled students open in Student 360."
      />
      {list.isLoading ? <Skeleton className="h-64" /> : list.isError ? (
        <ErrorState message="Could not load admissions." onRetry={() => list.refetch()} />
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-500">{enrolled.length} enrolled · {rows.length} applications total</p>
          <TableShell columns={["Ref", "Student", "Year", "Status", "Enrolled"]}>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">{r.applicationNumber}</td>
                <td className="px-4 py-3 font-medium">{r.studentName}</td>
                <td className="px-4 py-3">{r.academicYear}</td>
                <td className="px-4 py-3"><Badge tone={statusTone(r.status)}>{prettyStatus(r.status)}</Badge></td>
                <td className="px-4 py-3">
                  {r.enrolledStudentId ? <Link className="font-semibold text-forest-700" to={`/app/students/${r.enrolledStudentId}`}>Open profile</Link> : "—"}
                </td>
              </tr>
            ))}
          </TableShell>
          {rows.length === 0 ? <EmptyState title="No admissions yet" body="Create applications from the Applications screen." /> : null}
        </>
      )}
    </div>
  );
}
