import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { api, post } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useChildScope } from "../lib/child";
import { asId, asName, asRecord, formatDate, formatHumanTime, str, todayIso, unwrapList } from "../lib/format";
import { canLibraryAdmin, isAdminLike } from "../lib/roles";
import type { LeaveRow, NotificationRow, PageResponse, Student } from "../lib/types";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Drawer,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  TableShell,
  Tabs,
  Textarea,
  statusTone,
} from "../components/ui";
import { DemoChip } from "../components/brand";
import { useLiveOrDemo } from "../demo/useLiveOrDemo";
import { demoLeave, demoLibrary, demoNotices, demoTransportAssignment } from "../demo";

export function NoticesPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const noticesQ = useQuery({ queryKey: ["notices"], queryFn: () => api<unknown>("/api/notices") });
  const notices = useLiveOrDemo(noticesQ, demoNotices);
  const rows = unwrapList(notices.data).filter((n) => {
    const r = asRecord(n);
    return !q || String(r.title ?? "").toLowerCase().includes(q.toLowerCase());
  });
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", body: "", audienceType: "BRANCH" });
  const create = useMutation({
    mutationFn: () => post("/api/notices", form),
    onSuccess: () => {
      toast.success("Notice published successfully");
      qc.invalidateQueries({ queryKey: ["notices"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <PageHeader
        crumbs={["Campus"]}
        title="Notices"
        subtitle="Visible notices for your role and branch. School-wide notices appear for everyone."
        action={isAdminLike(user?.role) ? <Button onClick={() => setOpen(true)}>Create notice</Button> : null}
      />
      <Input className="mb-4 max-w-sm" placeholder="Search titles" value={q} onChange={(e) => setQ(e.target.value)} />
      {notices.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      {notices.isLoading ? <Skeleton className="h-64" /> : rows.length === 0 ? (
        <EmptyState title="No notices" body="Published notices in your visibility set will show here." />
      ) : (
        <div className="grid gap-4">
          {rows.map((item, i) => {
            const n = asRecord(item);
            return (
              <Card key={asId(n.id) || i}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{str(n.title)}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{str(n.body)}</p>
                  </div>
                  <div className="text-right">
                    <Badge>{str(n.audienceType)}</Badge>
                    <p className="mt-2 text-xs text-slate-400">{n.createdAt ? formatHumanTime(String(n.createdAt)) : ""}</p>
                    <p className="text-xs text-slate-400">{asName(n.createdBy)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={open} title="Create notice" onClose={() => setOpen(false)} wide>
        <div className="grid gap-3">
          <Field label="Title" required><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Audience">
            <Select value={form.audienceType} onChange={(e) => setForm({ ...form, audienceType: e.target.value })}>
              <option>SCHOOL</option><option>BRANCH</option><option>ROLE</option><option>CLASS</option>
            </Select>
          </Field>
          <Field label="Body" required><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => create.mutate()}>Publish</Button>
        </div>
      </Modal>
    </div>
  );
}

export function ComplaintsPage() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Record<string, unknown> | null>(null);
  const [comment, setComment] = useState("");
  const complaints = useQuery({ queryKey: ["complaints"], queryFn: () => api<unknown>("/api/complaints") });
  const students = useQuery({ queryKey: ["students"], queryFn: () => api<PageResponse<Student>>("/api/students?size=20") });
  const rows = unwrapList(complaints.data);
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", category: "GENERAL", description: "", studentId: "" });
  const create = useMutation({
    mutationFn: () => post("/api/complaints", { ...form, studentId: form.studentId || students.data?.items[0]?.id }),
    onSuccess: () => {
      toast.success("Complaint submitted");
      qc.invalidateQueries({ queryKey: ["complaints"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const addComment = useMutation({
    mutationFn: () => post(`/api/complaints/${asId(active?.id)}/comments`, { body: comment }),
    onSuccess: () => {
      toast.success("Comment added");
      setComment("");
      qc.invalidateQueries({ queryKey: ["complaints"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <PageHeader crumbs={["Campus"]} title="Complaints" subtitle="Your own tickets, or branch tickets if you are an administrator." action={<Button onClick={() => setOpen(true)}>New complaint</Button>} />
      {complaints.isLoading ? <Skeleton className="h-64" /> : rows.length === 0 ? (
        <EmptyState title="No complaints" body="Raise a complaint to start a tracked conversation." />
      ) : (
        <TableShell columns={["Title", "Category", "Status", ""]}>
          {rows.map((item, i) => {
            const c = asRecord(item);
            return (
              <tr key={asId(c.id) || i}>
                <td className="px-4 py-3 font-medium">{str(c.title)}</td>
                <td className="px-4 py-3">{str(c.category)}</td>
                <td className="px-4 py-3"><Badge tone={statusTone(str(c.status, ""))}>{str(c.status)}</Badge></td>
                <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost" onClick={() => setActive(c)}>Open</Button></td>
              </tr>
            );
          })}
        </TableShell>
      )}
      <Modal open={open} title="New complaint" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          <Field label="Title" required><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
          <Field label="Student">
            <Select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
              <option value="">Linked / first in scope</option>
              {(students.data?.items ?? []).map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </Select>
          </Field>
          <Field label="Description" required><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => create.mutate()}>Submit</Button>
        </div>
      </Modal>
      <Drawer open={Boolean(active)} title={str(active?.title, "Complaint")} onClose={() => setActive(null)}>
        <p className="text-sm text-slate-600">{str(active?.description)}</p>
        <p className="mt-3 text-xs text-slate-400">Status {str(active?.status)}</p>
        <Field label="Add comment">
          <Textarea className="mt-3" value={comment} onChange={(e) => setComment(e.target.value)} />
        </Field>
        <Button className="mt-3" onClick={() => addComment.mutate()}>Send comment</Button>
      </Drawer>
    </div>
  );
}

export function NotificationsPage() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<PageResponse<NotificationRow>>("/api/notifications"),
  });
  const markAll = useMutation({
    mutationFn: () => post("/api/notifications/read-all"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread"] });
      toast.success("All notifications marked read");
    },
  });
  const markOne = useMutation({
    mutationFn: (id: string) => post(`/api/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread"] });
    },
  });
  const items = query.data?.items ?? [];
  return (
    <div>
      <PageHeader crumbs={["Insights"]} title="Notifications" subtitle="System messages for your account." action={<Button variant="secondary" onClick={() => markAll.mutate()}>Mark all read</Button>} />
      {query.isLoading ? <Skeleton className="h-64" /> : items.length === 0 ? (
        <EmptyState title="You're up to date" body="No notifications yet." />
      ) : (
        <div className="grid gap-3">
          {items.map((n) => (
            <Card key={n.id} className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-slate-500">{n.body}</p>
                <p className="mt-1 text-xs text-slate-400">{formatHumanTime(n.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={n.read ? "neutral" : "good"}>{n.read ? "Read" : "New"}</Badge>
                {!n.read ? <Button size="sm" variant="ghost" onClick={() => markOne.mutate(n.id)}>Mark read</Button> : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function LeavePage() {
  const { user } = useAuth();
  const canReview = isAdminLike(user?.role);
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState(false);
  const leaveQ = useQuery({ queryKey: ["leave"], queryFn: () => api<LeaveRow[]>("/api/leave") });
  const leave = useLiveOrDemo(leaveQ, demoLeave);
  const students = useQuery({ queryKey: ["students"], queryFn: () => api<PageResponse<Student>>("/api/students?size=20") });
  const rows = (leave.data ?? []).filter((r) => tab === "all" || r.status === tab.toUpperCase());
  const qc = useQueryClient();
  const [form, setForm] = useState({ leaveType: "CASUAL", startDate: todayIso(), endDate: todayIso(), reason: "", studentId: "" });
  const submit = useMutation({
    mutationFn: () => post("/api/leave", { ...form, studentId: form.studentId || undefined }),
    onSuccess: () => {
      toast.success("Leave submitted");
      qc.invalidateQueries({ queryKey: ["leave"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const [review, setReview] = useState<{ id: string; approved: boolean } | null>(null);
  const doReview = useMutation({
    mutationFn: () => post(`/api/leave/${review?.id}/review?approved=${review?.approved}`),
    onSuccess: () => {
      toast.success(review?.approved ? "Leave approved" : "Leave rejected");
      qc.invalidateQueries({ queryKey: ["leave"] });
      setReview(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <PageHeader
        crumbs={["Campus"]}
        title="Leave"
        subtitle={canReview ? "Review pending requests for your branch." : "Submit and track your own leave requests."}
        action={<Button onClick={() => setOpen(true)}>New request</Button>}
      />
      {leave.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      <div className="mb-4">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
          ]}
        />
      </div>
      {leave.isLoading ? <Skeleton className="h-64" /> : rows.length === 0 ? (
        <EmptyState title="No leave requests" body="New requests appear here after they are submitted." />
      ) : (
        <TableShell columns={["Requester", "Type", "Dates", "Status", ""]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3">
                <p className="font-medium">{r.requester || "—"}</p>
                <p className="text-xs text-slate-500">{r.student || r.reason}</p>
              </td>
              <td className="px-4 py-3">{r.leaveType}</td>
              <td className="px-4 py-3">{formatDate(r.startDate)} – {formatDate(r.endDate)}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(r.status)}>{r.status}</Badge></td>
              <td className="px-4 py-3 text-right">
                {canReview && r.status === "PENDING" ? (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => setReview({ id: r.id, approved: true })}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => setReview({ id: r.id, approved: false })}>Reject</Button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </TableShell>
      )}
      <Modal open={open} title="Leave request" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          {(user?.role === "PARENT" || user?.role === "STUDENT") ? (
            <Field label="Student">
              <Select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
                <option value="">Select</option>
                {(students.data?.items ?? []).map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </Select>
            </Field>
          ) : null}
          <Field label="Type">
            <Select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
              <option>CASUAL</option><option>SICK</option><option>EMERGENCY</option>
            </Select>
          </Field>
          <Field label="Start"><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
          <Field label="End"><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
          <Field label="Reason" required><Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => submit.mutate()}>Submit request</Button>
        </div>
      </Modal>
      <ConfirmDialog
        open={Boolean(review)}
        title={review?.approved ? "Approve leave?" : "Reject leave?"}
        body="This decision is stored on the server and the requester is notified."
        confirmLabel={review?.approved ? "Approve" : "Reject"}
        danger={!review?.approved}
        onClose={() => setReview(null)}
        onConfirm={() => doReview.mutate()}
      />
    </div>
  );
}

export function LibraryPage() {
  const { user } = useAuth();
  const copiesQ = useQuery({ queryKey: ["library-copies"], queryFn: () => api<Array<{ id: string; title: string; copyCode: string; status: string }>>("/api/library/copies") });
  const copies = useLiveOrDemo(copiesQ, demoLibrary);
  const loans = useQuery({
    queryKey: ["library-loans"],
    queryFn: () => api<Array<{ id: string; title: string; copyCode: string; student: string; status: string; dueDate: string }>>("/api/library/loans"),
  });
  const students = useQuery({
    queryKey: ["students"],
    enabled: canLibraryAdmin(user?.role),
    queryFn: () => api<PageResponse<Student>>("/api/students?size=50"),
  });
  const [tab, setTab] = useState("catalogue");
  const [issueFor, setIssueFor] = useState<string | null>(null);
  const [studentId, setStudentId] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [bookForm, setBookForm] = useState({ title: "", author: "", category: "General", copyCode: "", isbn: "", branchId: "" });
  const branches = useQuery({
    queryKey: ["branches"],
    enabled: user?.role === "SUPER_ADMIN",
    queryFn: () => api<Array<{ id: string; name: string }>>("/api/branches"),
  });
  const qc = useQueryClient();
  const issue = useMutation({
    mutationFn: () => post(`/api/library/issue?copyId=${issueFor}&studentId=${studentId}`),
    onSuccess: () => {
      toast.success("Book issued");
      qc.invalidateQueries({ queryKey: ["library-copies"] });
      qc.invalidateQueries({ queryKey: ["library-loans"] });
      setIssueFor(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const giveBack = useMutation({
    mutationFn: (loanId: string) => post(`/api/library/return?loanId=${loanId}`),
    onSuccess: () => {
      toast.success("Book returned");
      qc.invalidateQueries({ queryKey: ["library-copies"] });
      qc.invalidateQueries({ queryKey: ["library-loans"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const addBook = useMutation({
    mutationFn: () =>
      post("/api/library/books", {
        ...bookForm,
        branchId: bookForm.branchId || user?.branchId || undefined,
      }),
    onSuccess: () => {
      toast.success("Book added to catalogue");
      setAddOpen(false);
      setBookForm({ title: "", author: "", category: "General", copyCode: "", isbn: "", branchId: "" });
      void qc.invalidateQueries({ queryKey: ["library-copies"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const overdue = (loans.data ?? []).filter((l) => l.status === "ISSUED" && l.dueDate && l.dueDate < todayIso());
  return (
    <div>
      <PageHeader
        crumbs={["Campus"]}
        title="Library"
        subtitle="Catalogue, loans and returns from the library API."
        action={canLibraryAdmin(user?.role) ? <Button onClick={() => setAddOpen(true)}>Add book</Button> : null}
      />
      {copies.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      <div className="mb-4">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "catalogue", label: "Catalogue" },
            { id: "loans", label: "Issued" },
            { id: "overdue", label: "Overdue" },
          ]}
        />
      </div>
      {tab === "catalogue" ? (
        copies.isLoading ? <Skeleton className="h-64" /> : (copies.data ?? []).length === 0 ? (
          <EmptyState title="No copies" body="Add a book to populate the library catalogue." />
        ) : (
          <TableShell columns={["Title", "Copy", "Status", ""]}>
            {(copies.data ?? []).map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3">{c.copyCode}</td>
                <td className="px-4 py-3"><Badge tone={statusTone(c.status)}>{c.status}</Badge></td>
                <td className="px-4 py-3 text-right">
                  {canLibraryAdmin(user?.role) && c.status === "AVAILABLE" ? (
                    <Button size="sm" onClick={() => setIssueFor(c.id)}>Issue</Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </TableShell>
        )
      ) : (
        ((tab === "overdue" ? overdue : loans.data) ?? []).length === 0 ? (
          <EmptyState title={tab === "overdue" ? "No overdue loans" : "No issued books"} body="Issued and returned copies appear here once books start circulating." />
        ) : (
          <TableShell columns={["Title", "Copy", "Student", "Due", "Status", ""]}>
            {(tab === "overdue" ? overdue : loans.data ?? []).map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3">{l.title}</td>
                <td className="px-4 py-3">{l.copyCode}</td>
                <td className="px-4 py-3">{l.student}</td>
                <td className="px-4 py-3">{formatDate(l.dueDate)}</td>
                <td className="px-4 py-3"><Badge tone={statusTone(l.status)}>{l.status}</Badge></td>
                <td className="px-4 py-3 text-right">
                  {canLibraryAdmin(user?.role) && l.status === "ISSUED" ? (
                    <Button size="sm" variant="secondary" onClick={() => giveBack.mutate(l.id)}>Return</Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </TableShell>
        )
      )}
      <Modal open={Boolean(issueFor)} title="Issue copy" onClose={() => setIssueFor(null)}>
        <Field label="Student">
          <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">Select</option>
            {(students.data?.items ?? []).map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
          </Select>
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setIssueFor(null)}>Cancel</Button>
          <Button disabled={!studentId || issue.isPending} onClick={() => issue.mutate()}>Issue</Button>
        </div>
      </Modal>
      <Modal open={addOpen} title="Add book copy" onClose={() => setAddOpen(false)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title" required><Input value={bookForm.title} onChange={(e) => setBookForm((f) => ({ ...f, title: e.target.value }))} /></Field>
          <Field label="Copy code" required><Input value={bookForm.copyCode} onChange={(e) => setBookForm((f) => ({ ...f, copyCode: e.target.value }))} /></Field>
          <Field label="Author"><Input value={bookForm.author} onChange={(e) => setBookForm((f) => ({ ...f, author: e.target.value }))} /></Field>
          <Field label="Category"><Input value={bookForm.category} onChange={(e) => setBookForm((f) => ({ ...f, category: e.target.value }))} /></Field>
          <Field label="ISBN"><Input value={bookForm.isbn} onChange={(e) => setBookForm((f) => ({ ...f, isbn: e.target.value }))} /></Field>
          {user?.role === "SUPER_ADMIN" ? (
            <Field label="Campus" required>
              <Select value={bookForm.branchId} onChange={(e) => setBookForm((f) => ({ ...f, branchId: e.target.value }))}>
                <option value="">Select campus</option>
                {(branches.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </Field>
          ) : null}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button
            disabled={!bookForm.title || !bookForm.copyCode || (user?.role === "SUPER_ADMIN" && !bookForm.branchId) || addBook.isPending}
            onClick={() => addBook.mutate()}
          >
            Save
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export function TransportPage() {
  const { user } = useAuth();
  const { selected: child } = useChildScope();
  const students = useQuery({ queryKey: ["students"], queryFn: () => api<PageResponse<Student>>("/api/students?size=20") });
  const [studentId, setStudentId] = useState("");
  const selected = studentId || child?.id || students.data?.items[0]?.id;
  const skipApi = Boolean(selected?.startsWith("demo-"));
  const rowsQ = useQuery({
    queryKey: ["transport", selected],
    enabled: Boolean(selected) && !skipApi,
    queryFn: () => api<Array<{ route: string; stop: string; vehicle: string; driver: string; status: string }>>(`/api/transport/my?studentId=${selected}`),
  });
  const routes = useQuery({
    queryKey: ["transport-routes"],
    enabled: isAdminLike(user?.role),
    queryFn: () => api<Array<{ id: string; name: string; vehicle: string; driver: string; status: string }>>("/api/transport/routes"),
  });
  const trips = useQuery({
    queryKey: ["transport-trips"],
    enabled: isAdminLike(user?.role),
    queryFn: () => api<Array<{ id: string; route: string; tripType: string; status: string; tripDate: string }>>("/api/transport/trips"),
  });
  const rows = useLiveOrDemo(rowsQ, demoTransportAssignment);
  return (
    <div>
      <PageHeader crumbs={["Campus"]} title="Transport" subtitle="Student assignments plus live routes, trips and GPS pings for admins." action={<a href="/app/bus-tracking" className="text-sm font-semibold text-forest-700">Open bus tracking</a>} />
      <div className="mb-4 max-w-sm">
        <Select value={selected ?? ""} onChange={(e) => setStudentId(e.target.value)}>
          {(students.data?.items?.length ? students.data.items : child ? [child] : []).map((s) => (
            <option key={s.id} value={s.id}>{s.fullName}</option>
          ))}
        </Select>
      </div>
      {rows.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      {!selected ? (
        <EmptyState title="No transport profile" body="Transport is shown only for linked children or the signed-in student." />
      ) : rows.isLoading ? (
        <Skeleton className="h-48" />
      ) : (rows.data ?? []).length === 0 ? (
        <EmptyState title="No assignment" body="This student does not have a transport assignment yet." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(rows.data ?? []).map((r, i) => (
            <Card key={i}>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Route</p>
              <p className="mt-1 font-display text-2xl">{r.route}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-slate-500">Stop</dt><dd>{r.stop}</dd></div>
                <div><dt className="text-slate-500">Vehicle</dt><dd>{r.vehicle || "—"}</dd></div>
                <div><dt className="text-slate-500">Driver</dt><dd>{r.driver || "—"}</dd></div>
                <div><dt className="text-slate-500">Status</dt><dd><Badge tone={statusTone(r.status)}>{r.status}</Badge></dd></div>
              </dl>
            </Card>
          ))}
        </div>
      )}
      {isAdminLike(user?.role) ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 font-display text-xl">Routes</h2>
            {(routes.data ?? []).length === 0 ? <p className="text-sm text-slate-500">No routes in this branch.</p> : (
              <TableShell columns={["Route", "Vehicle", "Driver", "Status"]}>
                {(routes.data ?? []).map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3">{r.vehicle || "—"}</td>
                    <td className="px-4 py-3">{r.driver || "—"}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone(r.status)}>{r.status}</Badge></td>
                  </tr>
                ))}
              </TableShell>
            )}
          </div>
          <div>
            <h2 className="mb-3 font-display text-xl">Today&apos;s trips</h2>
            {(trips.data ?? []).length === 0 ? <p className="text-sm text-slate-500">No trips scheduled for today.</p> : (
              <TableShell columns={["Route", "Type", "Status", "Date"]}>
                {(trips.data ?? []).map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3">{t.route}</td>
                    <td className="px-4 py-3">{t.tripType}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone(t.status)}>{t.status}</Badge></td>
                    <td className="px-4 py-3">{t.tripDate}</td>
                  </tr>
                ))}
              </TableShell>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
