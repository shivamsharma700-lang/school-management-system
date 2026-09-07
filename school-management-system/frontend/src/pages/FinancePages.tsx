import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { api, post } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useChildScope } from "../lib/child";
import { formatDate, formatMoney, str } from "../lib/format";
import { canFinance } from "../lib/roles";
import type { AcademicYear, FeeStructure, Invoice, PageResponse, SchoolClass, Student } from "../lib/types";
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
  StatCard,
  TableShell,
  statusTone,
} from "../components/ui";
import { Wallet, CircleDollarSign, CalendarClock } from "lucide-react";
import { DemoChip } from "../components/brand";
import { useLiveOrDemo } from "../demo/useLiveOrDemo";
import { demoFeeStructures, demoInvoices } from "../demo";

function invoiceTone(status?: string) {
  return statusTone(status);
}

export function FeesPage() {
  const { user } = useAuth();
  if (canFinance(user?.role)) return <FeeStructuresAdmin />;
  return <FamilyFees />;
}

function FeeStructuresAdmin() {
  const [open, setOpen] = useState(false);
  const structuresQ = useQuery({ queryKey: ["fee-structures"], queryFn: () => api<FeeStructure[]>("/api/fee-structures") });
  const structures = useLiveOrDemo(structuresQ, demoFeeStructures);
  const years = useQuery({ queryKey: ["years"], queryFn: () => api<AcademicYear[]>("/api/academic-years") });
  const classes = useQuery({ queryKey: ["classes"], queryFn: () => api<SchoolClass[]>("/api/classes") });
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", academicYearId: "", classId: "" });
  const create = useMutation({
    mutationFn: () => post("/api/fee-structures", form),
    onSuccess: () => {
      toast.success("Fee structure created successfully");
      qc.invalidateQueries({ queryKey: ["fee-structures"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <PageHeader crumbs={["Finance"]} title="Fee structures" subtitle="Amounts and components are stored on the server. Never treat the UI as the source of truth." action={<Button onClick={() => setOpen(true)}>New structure</Button>} />
      {structures.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      {structures.isLoading ? <Skeleton className="h-64" /> : (structures.data ?? []).length === 0 ? (
        <EmptyState title="No fee structures" body="Create a structure, then attach components and generate invoices." />
      ) : (
        <TableShell columns={["Name", "Class", "Year", "Status"]}>
          {(structures.data ?? []).map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-3 font-medium">{s.name}</td>
              <td className="px-4 py-3">{classes.data?.find((c) => c.id === s.classId)?.name ?? s.classId}</td>
              <td className="px-4 py-3">{years.data?.find((y) => y.id === s.academicYearId)?.name ?? "—"}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(s.status)}>{s.status}</Badge></td>
            </tr>
          ))}
        </TableShell>
      )}
      <Modal open={open} title="Create fee structure" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          <Field label="Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Academic year" required>
            <Select value={form.academicYearId} onChange={(e) => setForm({ ...form, academicYearId: e.target.value })}>
              <option value="">Select</option>
              {(years.data ?? []).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
            </Select>
          </Field>
          <Field label="Class" required>
            <Select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
              <option value="">Select</option>
              {(classes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => create.mutate()}>Create</Button>
        </div>
      </Modal>
    </div>
  );
}

function FamilyFees() {
  const { selected: child } = useChildScope();
  const students = useQuery({ queryKey: ["students"], queryFn: () => api<PageResponse<Student>>("/api/students?size=20") });
  const [studentId, setStudentId] = useState("");
  const selected = studentId || child?.id || students.data?.items[0]?.id || "";
  const skipApi = selected.startsWith("demo-");
  const invoicesQ = useQuery({
    queryKey: ["invoices", selected],
    enabled: Boolean(selected) && !skipApi,
    queryFn: () => api<Invoice[]>(`/api/invoices?studentId=${selected}`),
  });
  const invoices = useLiveOrDemo(invoicesQ, demoInvoices);
  const pay = useMutation({
    mutationFn: (invoiceId: string) => post("/api/payments/orders", { invoiceId, method: "GATEWAY", idempotencyKey: crypto.randomUUID() }),
    onSuccess: () => toast.success("Payment order created. The gateway webhook must confirm before a receipt is issued."),
    onError: (e: Error) => toast.error(e.message),
  });
  const list = invoices.data ?? [];
  const pending = list.filter((i) => i.status === "PENDING" || i.status === "PARTIAL").length;
  const paid = list.filter((i) => i.status === "PAID").length;
  const options = students.data?.items?.length ? students.data.items : child ? [child] : [];
  return (
    <div>
      <PageHeader crumbs={["Finance"]} title="Fees & payments" subtitle="Invoice totals are calculated by the backend. A frontend success flag is never trusted." />
      {invoices.isDemo ? <div className="mb-3"><DemoChip show /></div> : null}
      <div className="mb-5 max-w-xs">
        <Select value={selected} onChange={(e) => setStudentId(e.target.value)}>
          {options.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
        </Select>
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Invoices" value={list.length} icon={<Wallet size={18} />} />
        <StatCard label="Pending / partial" value={pending} icon={<CalendarClock size={18} />} />
        <StatCard label="Paid" value={paid} icon={<CircleDollarSign size={18} />} />
      </div>
      {list.length === 0 ? (
        <EmptyState title="No invoices" body="No fee invoices are visible for the selected student." />
      ) : (
        <div className="grid gap-3">
          {list.map((inv) => (
            <Card key={inv.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{inv.invoiceNumber}</p>
                <p className="text-sm text-slate-500">Due {formatDate(inv.dueDate)} · {formatMoney(inv.totalAmount)} · paid {formatMoney(inv.paidAmount)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={invoiceTone(inv.status)}>{inv.status}</Badge>
                {inv.status !== "PAID" && !inv.id.startsWith("demo-") ? <Button onClick={() => pay.mutate(inv.id)}>Pay</Button> : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function InvoicesPage() {
  const { user } = useAuth();
  const students = useQuery({ queryKey: ["students"], queryFn: () => api<PageResponse<Student>>("/api/students?size=50") });
  const structures = useQuery({ queryKey: ["fee-structures"], enabled: canFinance(user?.role), queryFn: () => api<FeeStructure[]>("/api/fee-structures") });
  const [studentId, setStudentId] = useState("");
  const [open, setOpen] = useState(false);
  const selected = studentId || students.data?.items[0]?.id || "";
  const invoices = useQuery({
    queryKey: ["invoices", selected],
    enabled: Boolean(selected),
    queryFn: () => api<Invoice[]>(`/api/invoices?studentId=${selected}`),
  });
  const qc = useQueryClient();
  const [form, setForm] = useState({ studentId: "", feeStructureId: "", dueDate: new Date().toISOString().slice(0, 10) });
  const generate = useMutation({
    mutationFn: () => post("/api/invoices", form),
    onSuccess: () => {
      toast.success("Invoice generated");
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <PageHeader
        crumbs={["Finance"]}
        title="Invoices"
        subtitle="Invoices are always generated from a fee structure and a student. There is no all-branch invoice dump."
        action={canFinance(user?.role) ? <Button onClick={() => setOpen(true)}>Generate invoice</Button> : null}
      />
      <div className="mb-4 max-w-sm">
        <Select value={selected} onChange={(e) => setStudentId(e.target.value)}>
          {(students.data?.items ?? []).map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
        </Select>
      </div>
      {!selected ? <EmptyState title="Select a student" body="Invoices are loaded per student by the API." /> : (invoices.data ?? []).length === 0 ? (
        <EmptyState title="No invoices" body="Generate an invoice from a fee structure when you are ready." />
      ) : (
        <TableShell columns={["Invoice", "Due", "Total", "Paid", "Status"]}>
          {(invoices.data ?? []).map((inv) => (
            <tr key={inv.id}>
              <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
              <td className="px-4 py-3">{formatDate(inv.dueDate)}</td>
              <td className="px-4 py-3">{formatMoney(inv.totalAmount)}</td>
              <td className="px-4 py-3">{formatMoney(inv.paidAmount)}</td>
              <td className="px-4 py-3"><Badge tone={invoiceTone(inv.status)}>{inv.status}</Badge></td>
            </tr>
          ))}
        </TableShell>
      )}
      <Modal open={open} title="Generate invoice" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          <Field label="Student">
            <Select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
              <option value="">Select</option>
              {(students.data?.items ?? []).map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </Select>
          </Field>
          <Field label="Fee structure">
            <Select value={form.feeStructureId} onChange={(e) => setForm({ ...form, feeStructureId: e.target.value })}>
              <option value="">Select</option>
              {(structures.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="Due date"><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => generate.mutate()}>Generate</Button>
        </div>
      </Modal>
    </div>
  );
}

export function PaymentsPage() {
  const { user } = useAuth();
  const students = useQuery({ queryKey: ["students"], queryFn: () => api<PageResponse<Student>>("/api/students?size=50") });
  const [studentId, setStudentId] = useState("");
  const selected = studentId || students.data?.items[0]?.id || "";
  const invoices = useQuery({
    queryKey: ["invoices", selected],
    enabled: Boolean(selected),
    queryFn: () => api<Invoice[]>(`/api/invoices?studentId=${selected}`),
  });
  const pay = useMutation({
    mutationFn: (invoiceId: string) => post("/api/payments/orders", { invoiceId, method: user?.role === "ACCOUNTANT" ? "CASH" : "GATEWAY", idempotencyKey: crypto.randomUUID() }),
    onSuccess: () => toast.success("Payment order recorded. Settlement still depends on webhook or offline confirmation."),
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <PageHeader crumbs={["Finance"]} title="Payments" subtitle="There is no card vault in this product. Orders are created here; receipts appear only after confirmation." />
      <div className="mb-4 max-w-sm">
        <Select value={selected} onChange={(e) => setStudentId(e.target.value)}>
          {(students.data?.items ?? []).map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
        </Select>
      </div>
      {(invoices.data ?? []).length === 0 ? (
        <EmptyState title="No payable invoices" body="Pick a student with invoices to record a payment order." />
      ) : (
        <TableShell columns={["Invoice", "Amount", "Status", ""]}>
          {(invoices.data ?? []).map((inv) => (
            <tr key={inv.id}>
              <td className="px-4 py-3">{inv.invoiceNumber}</td>
              <td className="px-4 py-3">{formatMoney(inv.totalAmount)}</td>
              <td className="px-4 py-3"><Badge tone={invoiceTone(inv.status)}>{inv.status}</Badge></td>
              <td className="px-4 py-3 text-right">
                {inv.status !== "PAID" ? <Button size="sm" onClick={() => pay.mutate(inv.id)}>Create order</Button> : str(inv.status)}
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}
