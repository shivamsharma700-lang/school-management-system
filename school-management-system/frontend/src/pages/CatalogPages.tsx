import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { MapPin, Phone, Mail } from "lucide-react";
import { api, post, put } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate, prettyStatus } from "../lib/format";
import { isAdminLike, isSuper } from "../lib/roles";
import type { AcademicYear, Branch, PageResponse, SchoolClass, Section, StaffRow, Student, Subject } from "../lib/types";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  TableShell,
  Tabs,
  statusTone,
} from "../components/ui";
import { DemoChip, campusPhoto } from "../components/brand";
import { MediaImage } from "../components/media";
import { campusMedia } from "../lib/mediaCatalog";
import { useLiveOrDemo } from "../demo/useLiveOrDemo";
import { demoBranches, demoClasses, demoSubjects, demoYears } from "../demo";

export function BranchesPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [open, setOpen] = useState(false);
  const branchesQ = useQuery({ queryKey: ["branches"], queryFn: () => api<Branch[]>("/api/branches") });
  const branches = useLiveOrDemo(branchesQ, demoBranches);
  const rows = (branches.data ?? []).filter((b) => {
    const match = !q || `${b.name} ${b.code} ${b.email}`.toLowerCase().includes(q.toLowerCase());
    return match && (!status || b.status === status);
  });
  return (
    <div>
      <PageHeader
        crumbs={["Organisation"]}
        title="Branches"
        subtitle="Campuses in the school group. Counts on a campus page use live student queries."
        action={isSuper(user?.role) ? <Button onClick={() => setOpen(true)}>Add branch</Button> : null}
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input className="max-w-xs" placeholder="Search branches" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option>ACTIVE</option>
          <option>INACTIVE</option>
        </Select>
        <Tabs value={view} onChange={(v) => setView(v as "cards" | "table")} tabs={[{ id: "cards", label: "Cards" }, { id: "table", label: "Table" }]} />
      </div>
      {branches.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      {branches.isLoading ? <Skeleton className="h-64" /> : rows.length === 0 ? (
        <EmptyState title="No branches" body="Create a campus to start enrolling students." />
      ) : view === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((b) => (
            <Link key={b.id} to={`/app/branches/${b.id}`}>
              <Card padded={false} className="h-full overflow-hidden transition hover:-translate-y-0.5">
                <div className="relative h-28">
                  <MediaImage src={campusPhoto(b.code, b.name)} alt="" position="center 40%" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04180f]/70 to-transparent" />
                  <span className="absolute right-3 top-3"><Badge tone={statusTone(b.status)}>{prettyStatus(b.status)}</Badge></span>
                </div>
                <div className="p-5">
                  <p className="font-semibold text-[#053321]">{b.name}</p>
                  <p className="text-xs uppercase tracking-wider text-slate-400">{b.code}</p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2"><MapPin size={14} /> {b.address || "Address not set"}</p>
                    <p className="flex items-center gap-2"><Phone size={14} /> {b.phone || "—"}</p>
                    <p className="flex items-center gap-2"><Mail size={14} /> {b.email || "—"}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <TableShell columns={["Branch", "Code", "Email", "Phone", "Status"]}>
          {rows.map((b) => (
            <tr key={b.id}>
              <td className="px-4 py-3 font-medium"><Link className="hover:underline" to={`/app/branches/${b.id}`}>{b.name}</Link></td>
              <td className="px-4 py-3">{b.code}</td>
              <td className="px-4 py-3">{b.email || "—"}</td>
              <td className="px-4 py-3">{b.phone || "—"}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(b.status)}>{prettyStatus(b.status)}</Badge></td>
            </tr>
          ))}
        </TableShell>
      )}
      <BranchForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function BranchForm({ open, onClose, existing }: { open: boolean; onClose: () => void; existing?: Branch }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: existing?.name ?? "",
    code: existing?.code ?? "",
    address: existing?.address ?? "",
    phone: existing?.phone ?? "",
    email: existing?.email ?? "",
    status: existing?.status ?? "ACTIVE",
  });
  const save = useMutation({
    mutationFn: () => (existing ? put(`/api/branches/${existing.id}`, form) : post("/api/branches", form)),
    onSuccess: () => {
      toast.success(existing ? "Branch updated" : "Branch created successfully");
      qc.invalidateQueries({ queryKey: ["branches"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Modal open={open} title={existing ? "Edit branch" : "Add branch"} onClose={onClose}>
      <div className="grid gap-3">
        <Field label="Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Code" required><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
        <Field label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
        <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>ACTIVE</option><option>INACTIVE</option>
          </Select>
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={save.isPending} onClick={() => save.mutate()}>Save</Button>
      </div>
    </Modal>
  );
}

export function BranchDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [edit, setEdit] = useState(false);
  const isDemoId = Boolean(id?.startsWith("demo-"));
  const branchesQ = useQuery({ queryKey: ["branches"], enabled: !isDemoId, queryFn: () => api<Branch[]>("/api/branches") });
  const branches = useLiveOrDemo(branchesQ, demoBranches);
  const branch = (branches.data ?? []).find((b) => b.id === id) ?? (isDemoId ? demoBranches.find((b) => b.id === id) : undefined);
  const students = useQuery({
    queryKey: ["students", "branch", id],
    enabled: Boolean(id) && !isDemoId,
    queryFn: () => api<PageResponse<Student>>(`/api/students?branchId=${id}&size=50`),
  });
  const staff = useQuery({
    queryKey: ["staff"],
    enabled: isAdminLike(user?.role) || user?.role === "ACCOUNTANT",
    queryFn: () => api<StaffRow[]>("/api/staff"),
  });
  const classes = useQuery({
    queryKey: ["classes", id],
    enabled: Boolean(id) && !isDemoId,
    queryFn: () => api<SchoolClass[]>(`/api/classes?branchId=${id}`),
  });
  if (!isDemoId && branches.isLoading) return <Skeleton className="h-64" />;
  if (!branch) return <EmptyState title="Branch not found" body="This campus is not in your authorised list." />;
  return (
    <div>
      <PageHeader
        crumbs={["Organisation", "Branches"]}
        title={branch.name}
        subtitle={`${branch.code} · ${branch.address || "Delhi NCR"}`}
        image={campusPhoto(branch.code, branch.name)}
        action={isSuper(user?.role) && !isDemoId ? <Button variant="secondary" onClick={() => setEdit(true)}>Edit</Button> : null}
      />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card><p className="text-xs text-slate-500">Students (this query)</p><p className="mt-1 font-display text-3xl">{students.data?.total ?? 0}</p></Card>
        <Card><p className="text-xs text-slate-500">Classes</p><p className="mt-1 font-display text-3xl">{classes.data?.length ?? 0}</p></Card>
        <Card><p className="text-xs text-slate-500">Status</p><div className="mt-2"><Badge tone={statusTone(branch.status)}>{prettyStatus(branch.status)}</Badge></div></Card>
      </div>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "students", label: "Students" },
          { id: "staff", label: "Staff" },
          { id: "classes", label: "Classes" },
        ]}
      />
      <div className="mt-5">
        {tab === "overview" ? (
          <div className="grid gap-4">
            <Card padded={false} className="overflow-hidden">
              <div className="grid gap-2 p-3 sm:grid-cols-3">
                {campusMedia(branch.code, branch.name).gallery.map((src) => (
                  <img key={src} src={src} alt="" className="h-36 w-full rounded-2xl object-cover" />
                ))}
              </div>
            </Card>
            <Card>
              <p className="text-sm leading-6 text-slate-600">{campusMedia(branch.code, branch.name).description}</p>
              <p className="mt-3 flex gap-2 text-sm text-slate-600"><MapPin size={16} /> {branch.address || campusMedia(branch.code, branch.name).location}</p>
              <p className="mt-2 flex gap-2 text-sm text-slate-600"><Phone size={16} /> {branch.phone || campusMedia(branch.code, branch.name).phone}</p>
              <p className="mt-2 flex gap-2 text-sm text-slate-600"><Mail size={16} /> {branch.email || campusMedia(branch.code, branch.name).email}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Facilities</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {campusMedia(branch.code, branch.name).facilities.map((f) => <Badge key={f}>{f}</Badge>)}
              </div>
              <p className="mt-4 text-sm text-slate-500">{campusMedia(branch.code, branch.name).classes} · about {students.data?.total || campusMedia(branch.code, branch.name).students} students</p>
            </Card>
          </div>
        ) : null}
        {tab === "students" ? (
          (students.data?.items ?? []).length === 0 ? <EmptyState title="No students" body="No student records returned for this branch." /> : (
            <TableShell columns={["Student", "Class", "Status"]}>
              {(students.data?.items ?? []).map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3"><Link className="font-medium hover:underline" to={`/app/students/${s.id}`}>{s.fullName}</Link></td>
                  <td className="px-4 py-3">{s.className ?? "—"}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(s.status)}>{s.status}</Badge></td>
                </tr>
              ))}
            </TableShell>
          )
        ) : null}
        {tab === "staff" ? (
          (staff.data ?? []).length === 0 ? <EmptyState title="No staff listed" body="Staff API is branch-scoped for non super-admins." /> : (
            <TableShell columns={["Name", "Designation", "Type"]}>
              {(staff.data ?? []).map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">{s.fullName}</td>
                  <td className="px-4 py-3">{s.designation}</td>
                  <td className="px-4 py-3">{s.staffType}</td>
                </tr>
              ))}
            </TableShell>
          )
        ) : null}
        {tab === "classes" ? (
          (classes.data ?? []).length === 0 ? <EmptyState title="No classes" body="Create classes for this campus from the Classes page." /> : (
            <TableShell columns={["Class", "Grade", "Status"]}>
              {(classes.data ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.gradeLevel}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(c.status)}>{c.status}</Badge></td>
                </tr>
              ))}
            </TableShell>
          )
        ) : null}
      </div>
      <BranchForm open={edit} onClose={() => setEdit(false)} existing={branch} />
    </div>
  );
}

export function YearsPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const yearsQ = useQuery({ queryKey: ["years"], queryFn: () => api<AcademicYear[]>("/api/academic-years") });
  const years = useLiveOrDemo(yearsQ, demoYears);
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "", status: "ACTIVE" });
  const create = useMutation({
    mutationFn: () => post("/api/academic-years", form),
    onSuccess: () => {
      toast.success("Academic year created successfully");
      qc.invalidateQueries({ queryKey: ["years"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <PageHeader crumbs={["Organisation"]} title="Academic years" subtitle="Historical years stay in the system. They are never deleted when a new year starts." action={isAdminLike(user?.role) ? <Button onClick={() => setOpen(true)}>Add year</Button> : null} />
      {years.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      {years.isLoading ? <Skeleton className="h-48" /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(years.data ?? []).map((y) => (
            <Card key={y.id}>
              <div className="flex items-start justify-between">
                <p className="font-semibold">{y.name}</p>
                <Badge tone={statusTone(y.status)}>{y.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500">{formatDate(y.startDate)} – {formatDate(y.endDate)}</p>
            </Card>
          ))}
        </div>
      )}
      <Modal open={open} title="Create academic year" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          <Field label="Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Start" required><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
          <Field label="End" required><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => create.mutate()}>Create</Button>
        </div>
      </Modal>
    </div>
  );
}

export function ClassesPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [sectionClass, setSectionClass] = useState<SchoolClass | null>(null);
  const classesQ = useQuery({ queryKey: ["classes"], queryFn: () => api<SchoolClass[]>("/api/classes") });
  const classes = useLiveOrDemo(classesQ, demoClasses);
  const branchesQ = useQuery({ queryKey: ["branches"], queryFn: () => api<Branch[]>("/api/branches") });
  const branches = useLiveOrDemo(branchesQ, demoBranches);
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", gradeLevel: "1", branchId: "", status: "ACTIVE" });
  const create = useMutation({
    mutationFn: () => post("/api/classes", { ...form, gradeLevel: Number(form.gradeLevel), branchId: form.branchId || null }),
    onSuccess: () => {
      toast.success("Class created successfully");
      qc.invalidateQueries({ queryKey: ["classes"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <PageHeader crumbs={["Academics"]} title="Classes" subtitle="Manage grades and open sections without leaving this page." action={isAdminLike(user?.role) ? <Button onClick={() => setOpen(true)}>Add class</Button> : null} />
      {classes.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      {classes.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      {classes.isLoading ? <Skeleton className="h-64" /> : (classes.data ?? []).length === 0 ? (
        <EmptyState title="No classes yet" body="Create a class, then add sections." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(classes.data ?? []).map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-slate-500">Grade {c.gradeLevel}</p>
                </div>
                <Badge tone={statusTone(c.status)}>{c.status}</Badge>
              </div>
              {isAdminLike(user?.role) ? (
                <Button className="mt-4" size="sm" variant="secondary" onClick={() => setSectionClass(c)}>
                  Manage sections
                </Button>
              ) : null}
              <ClassSections classId={c.id} />
            </Card>
          ))}
        </div>
      )}
      <Modal open={open} title="Add class" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          <Field label="Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Grade" required><Input type="number" value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })} /></Field>
          <Field label="Branch">
            <Select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
              <option value="">Default</option>
              {(branches.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => create.mutate()}>Create</Button>
        </div>
      </Modal>
      <SectionManager schoolClass={sectionClass} onClose={() => setSectionClass(null)} />
    </div>
  );
}

function ClassSections({ classId }: { classId: string }) {
  const sections = useQuery({ queryKey: ["sections", classId], queryFn: () => api<Section[]>(`/api/classes/${classId}/sections`) });
  if (!sections.data?.length) return <p className="mt-3 text-sm text-slate-500">No sections yet.</p>;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {sections.data.map((s) => (
        <Link
          key={s.id}
          to={`/app/classes/${classId}/sections/${s.id}`}
          className="rounded-full bg-forest-50 px-3 py-1 text-sm font-semibold text-forest-700 hover:bg-forest-600 hover:text-white"
        >
          Section {s.name}
        </Link>
      ))}
    </div>
  );
}

export function SectionDetailPage() {
  const { classId, sectionId } = useParams();
  const navigate = useNavigate();
  const detail = useQuery({
    queryKey: ["section", classId, sectionId],
    enabled: Boolean(classId && sectionId),
    queryFn: () => api<Section>(`/api/classes/${classId}/sections/${sectionId}`),
  });
  const students = useQuery({
    queryKey: ["students", "section", sectionId],
    enabled: Boolean(sectionId),
    queryFn: () => api<PageResponse<Student>>(`/api/students?sectionId=${sectionId}&size=100`),
  });
  const homework = useQuery({
    queryKey: ["homework", sectionId],
    enabled: Boolean(sectionId),
    queryFn: () => api<unknown[]>(`/api/homework?sectionId=${sectionId}`),
  });
  const years = useQuery({ queryKey: ["years"], queryFn: () => api<AcademicYear[]>("/api/academic-years") });
  const yearId = years.data?.[0]?.id;
  const slots = useQuery({
    queryKey: ["timetable", yearId, sectionId],
    enabled: Boolean(yearId && sectionId),
    queryFn: () => api<unknown[]>(`/api/timetable?academicYearId=${yearId}&sectionId=${sectionId}`),
  });
  const s = detail.data;
  const rows = students.data?.items ?? [];
  return (
    <div>
      <PageHeader
        crumbs={["Academics", "Classes"]}
        title={`${s?.className ?? "Class"} · Section ${s?.name ?? ""}`}
        subtitle={s?.classTeacherName ? `Class teacher ${s.classTeacherName}` : "Section roster from PostgreSQL"}
      />
      {detail.isLoading ? <Skeleton className="h-40" /> : (
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Card><p className="text-xs text-slate-500">Class</p><p className="mt-1 font-semibold">{s?.className}</p></Card>
          <Card><p className="text-xs text-slate-500">Branch</p><p className="mt-1 font-semibold">{s?.branchName}</p></Card>
          <Card><p className="text-xs text-slate-500">Students</p><p className="mt-1 font-semibold">{s?.studentCount ?? rows.length}</p></Card>
          <Card><p className="text-xs text-slate-500">Homework</p><p className="mt-1 font-semibold">{(homework.data ?? []).length} open</p></Card>
          <Card><p className="text-xs text-slate-500">Timetable</p><p className="mt-1 font-semibold">{(slots.data ?? []).length} periods</p></Card>
        </div>
      )}
      {(slots.data ?? []).length ? (
        <Card className="mb-5">
          <p className="mb-2 font-semibold">Section timetable</p>
          <div className="grid gap-2 text-sm">
            {(slots.data ?? []).slice(0, 8).map((slot, i) => {
              const rec = slot as { id?: string; startTime?: string; subject?: { name?: string } | string; room?: string; dayOfWeek?: number };
              const subject = typeof rec.subject === "string" ? rec.subject : rec.subject?.name ?? "Subject";
              return <p key={rec.id ?? i}>{rec.startTime} · {subject} · {rec.room || "Room TBA"}</p>;
            })}
          </div>
        </Card>
      ) : null}
      {students.isLoading ? <Skeleton className="h-64" /> : rows.length === 0 ? (
        <EmptyState title="No students in this section" body="Enrol students into this section to populate the roster." />
      ) : (
        <TableShell columns={["Photo", "Admission", "Student", "Roll", "Father", "Status"]}>
          {rows.map((row) => (
            <tr key={row.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/app/students/${row.id}`)}>
              <td className="px-4 py-3"><span className="font-semibold">{row.fullName[0]}</span></td>
              <td className="px-4 py-3">{row.admissionNumber}</td>
              <td className="px-4 py-3 font-semibold">{row.fullName}</td>
              <td className="px-4 py-3">{row.rollNumber || "—"}</td>
              <td className="px-4 py-3">{row.fatherName || "—"}</td>
              <td className="px-4 py-3">{row.status}</td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}

function SectionManager({ schoolClass, onClose }: { schoolClass: SchoolClass | null; onClose: () => void }) {
  const qc = useQueryClient();
  const sections = useQuery({
    queryKey: ["sections", schoolClass?.id],
    enabled: Boolean(schoolClass),
    queryFn: () => api<Section[]>(`/api/classes/${schoolClass!.id}/sections`),
  });
  const [name, setName] = useState("A");
  const [capacity, setCapacity] = useState("40");
  const create = useMutation({
    mutationFn: () => post(`/api/classes/${schoolClass!.id}/sections`, { name, capacity: Number(capacity), status: "ACTIVE" }),
    onSuccess: () => {
      toast.success("Section created");
      qc.invalidateQueries({ queryKey: ["sections", schoolClass?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Modal open={Boolean(schoolClass)} title={`Sections · ${schoolClass?.name ?? ""}`} onClose={onClose}>
      {(sections.data ?? []).length === 0 ? <p className="text-sm text-slate-500">No sections yet.</p> : (
        <div className="mb-4 grid gap-2">
          {(sections.data ?? []).map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
              <Link className="font-medium hover:underline" to={`/app/classes/${schoolClass?.id}/sections/${s.id}`}>Section {s.name}</Link>
              <span className="text-slate-500">Cap {s.capacity ?? "—"}</span>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Section name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Capacity"><Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></Field>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => create.mutate()}>Add section</Button>
      </div>
    </Modal>
  );
}

export function SubjectsPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const subjectsQ = useQuery({ queryKey: ["subjects"], queryFn: () => api<Subject[]>("/api/subjects") });
  const subjects = useLiveOrDemo(subjectsQ, demoSubjects);
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", code: "", status: "ACTIVE" });
  const create = useMutation({
    mutationFn: () => post("/api/subjects", form),
    onSuccess: () => {
      toast.success("Subject created successfully");
      qc.invalidateQueries({ queryKey: ["subjects"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <PageHeader crumbs={["Academics"]} title="Subjects" subtitle="Curriculum subjects for the current campus scope." action={isAdminLike(user?.role) ? <Button onClick={() => setOpen(true)}>Add subject</Button> : null} />
      {subjects.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      {subjects.isLoading ? <Skeleton className="h-48" /> : (subjects.data ?? []).length === 0 ? (
        <EmptyState title="No subjects" body="Add subjects before building a timetable or homework." />
      ) : (
        <TableShell columns={["Subject", "Code", "Status"]}>
          {(subjects.data ?? []).map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-3 font-medium">{s.name}</td>
              <td className="px-4 py-3">{s.code}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(s.status)}>{s.status}</Badge></td>
            </tr>
          ))}
        </TableShell>
      )}
      <Modal open={open} title="Add subject" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          <Field label="Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Code" required><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => create.mutate()}>Create</Button>
        </div>
      </Modal>
    </div>
  );
}
