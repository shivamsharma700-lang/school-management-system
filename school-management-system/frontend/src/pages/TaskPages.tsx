import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, post, put } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate } from "../lib/format";
import { isAdminLike } from "../lib/roles";
import { Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader, Select, Skeleton, StatCard, Textarea, statusTone } from "../components/ui";

type TaskRow = {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string;
  overdue: boolean;
  assigneeStaffId: string;
  assigneeName: string;
  assignedByName: string;
  className: string;
  sectionName: string;
  subjectName: string;
};

type StaffRow = { id: string; fullName: string; employeeCode?: string; designation?: string; staffType?: string };
type ClassRow = { id: string; name: string };
type SectionRow = { id: string; name: string };
type SubjectRow = { id: string; name: string };

export function TeacherTasksPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const canAssign = isAdminLike(user?.role) || user?.role === "PRINCIPAL";
  const [statusFilter, setStatusFilter] = useState("");
  const [open, setOpen] = useState(false);
  const summary = useQuery({
    queryKey: ["teacher-tasks-summary"],
    queryFn: () => api<{ todo: number; inProgress: number; completed: number; overdue: number; total: number }>("/api/teacher-tasks/summary"),
  });
  const list = useQuery({
    queryKey: ["teacher-tasks", statusFilter],
    queryFn: () => api<TaskRow[]>(`/api/teacher-tasks${statusFilter ? `?status=${statusFilter}` : ""}`),
  });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => put(`/api/teacher-tasks/${id}/status`, { status }),
    onSuccess: () => {
      toast.success("Task updated");
      void qc.invalidateQueries({ queryKey: ["teacher-tasks"] });
      void qc.invalidateQueries({ queryKey: ["teacher-tasks-summary"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const rows = list.data ?? [];
  return (
    <div>
      <PageHeader
        crumbs={["Staff"]}
        title="Teacher tasks"
        subtitle={canAssign ? "Assign work to teachers and track completion." : "Tasks assigned to you by Admin or Principal."}
        action={canAssign ? <Button onClick={() => setOpen(true)}>Assign task</Button> : null}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="To do" value={summary.data?.todo ?? "—"} to="/app/tasks?status=TODO" />
        <StatCard label="In progress" value={summary.data?.inProgress ?? "—"} to="/app/tasks?status=IN_PROGRESS" />
        <StatCard label="Completed" value={summary.data?.completed ?? "—"} to="/app/tasks?status=COMPLETED" />
        <StatCard label="Overdue" value={summary.data?.overdue ?? "—"} />
      </div>
      <div className="mb-4 max-w-xs">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </Select>
      </div>
      {list.isLoading ? <Skeleton className="h-48" /> : list.isError ? (
        <EmptyState title="Could not load tasks" body="Retry when the API is reachable." />
      ) : rows.length === 0 ? (
        <EmptyState title="No tasks" body={canAssign ? "Assign the first task to a teacher." : "No tasks assigned to you yet."} />
      ) : (
        <div className="space-y-3">
          {rows.map((t) => (
            <Card key={t.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink-900">{t.title}</p>
                    <Badge tone={t.priority === "HIGH" ? "bad" : t.priority === "MEDIUM" ? "warn" : "info"}>{t.priority}</Badge>
                    <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                    {t.overdue ? <Badge tone="bad">Overdue</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{t.description}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {canAssign ? `Assignee: ${t.assigneeName}` : `From: ${t.assignedByName}`}
                    {" · "}Due {formatDate(t.dueDate)}
                    {t.className ? ` · ${t.className}${t.sectionName ? `-${t.sectionName}` : ""}` : ""}
                    {t.subjectName ? ` · ${t.subjectName}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {t.status === "TODO" ? (
                    <Button size="sm" variant="secondary" disabled={update.isPending} onClick={() => update.mutate({ id: t.id, status: "IN_PROGRESS" })}>
                      Start
                    </Button>
                  ) : null}
                  {t.status !== "COMPLETED" ? (
                    <Button size="sm" disabled={update.isPending} onClick={() => update.mutate({ id: t.id, status: "COMPLETED" })}>
                      Complete
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {canAssign ? <AssignTaskModal open={open} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

function AssignTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const staff = useQuery({
    queryKey: ["staff-for-tasks"],
    enabled: open,
    queryFn: () => api<StaffRow[]>("/api/staff"),
  });
  const classes = useQuery({ queryKey: ["classes"], enabled: open, queryFn: () => api<ClassRow[]>("/api/classes") });
  const subjects = useQuery({ queryKey: ["subjects"], enabled: open, queryFn: () => api<SubjectRow[]>("/api/subjects") });
  const [form, setForm] = useState({
    assigneeStaffId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: new Date().toISOString().slice(0, 10),
    classId: "",
    sectionId: "",
    subjectId: "",
  });
  const sections = useQuery({
    queryKey: ["sections", form.classId],
    enabled: open && Boolean(form.classId),
    queryFn: () => api<SectionRow[]>(`/api/classes/${form.classId}/sections`),
  });
  const teachers = useMemo(() => {
    const all = staff.data ?? [];
    const filtered = all.filter(
      (s) =>
        String(s.staffType ?? "").toUpperCase().includes("TEACH") ||
        String(s.designation ?? "").toLowerCase().includes("teach")
    );
    return filtered.length ? filtered : all;
  }, [staff.data]);
  const create = useMutation({
    mutationFn: () =>
      post("/api/teacher-tasks", {
        branchId: user?.branchId || undefined,
        assigneeStaffId: form.assigneeStaffId,
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate,
        classId: form.classId || undefined,
        sectionId: form.sectionId || undefined,
        subjectId: form.subjectId || undefined,
      }),
    onSuccess: () => {
      toast.success("Task assigned");
      void qc.invalidateQueries({ queryKey: ["teacher-tasks"] });
      void qc.invalidateQueries({ queryKey: ["teacher-tasks-summary"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Modal open={open} title="Assign teacher task" onClose={onClose} wide>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Teacher" required>
          <Select value={form.assigneeStaffId} onChange={(e) => setForm((f) => ({ ...f, assigneeStaffId: e.target.value }))}>
            <option value="">Select</option>
            {teachers.map((s) => (
              <option key={s.id} value={s.id}>{s.fullName}{s.employeeCode ? ` (${s.employeeCode})` : ""}</option>
            ))}
          </Select>
        </Field>
        <Field label="Priority">
          <Select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </Select>
        </Field>
        <Field label="Title" required>
          <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Prepare Class 5 Maths Question Paper" />
        </Field>
        <Field label="Description" required>
          <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
        </Field>
        <Field label="Due date" required>
          <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
        </Field>
        <Field label="Subject">
          <Select value={form.subjectId} onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}>
            <option value="">Optional</option>
            {(subjects.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Class">
          <Select value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value, sectionId: "" }))}>
            <option value="">Optional</option>
            {(classes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Section">
          <Select value={form.sectionId} onChange={(e) => setForm((f) => ({ ...f, sectionId: e.target.value }))} disabled={!form.classId}>
            <option value="">Optional</option>
            {(sections.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button
          disabled={!form.assigneeStaffId || !form.title || !form.description || create.isPending}
          onClick={() => create.mutate()}
        >
          Assign
        </Button>
      </div>
    </Modal>
  );
}
