import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api, post, put } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatMoney, prettyStatus } from "../lib/format";
import { isAdminLike } from "../lib/roles";
import type { Branch, PageResponse, StaffRow } from "../lib/types";
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

type InventoryRow = {
  id: string;
  category: string;
  itemName: string;
  sku: string;
  location: string;
  quantity: number;
  unit: string;
  status: string;
  branchName: string;
  branchId: string;
  notes: string;
};

export function InventoryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    category: "FURNITURE",
    itemName: "",
    sku: "",
    location: "",
    quantity: "1",
    unit: "PCS",
    status: "IN_STOCK",
    branchId: "",
    notes: "",
  });
  const list = useQuery({ queryKey: ["inventory"], queryFn: () => api<InventoryRow[]>("/api/inventory") });
  const branches = useQuery({ queryKey: ["branches"], queryFn: () => api<Branch[]>("/api/branches") });
  const create = useMutation({
    mutationFn: () =>
      post("/api/inventory", {
        ...form,
        quantity: Number(form.quantity) || 0,
        branchId: form.branchId || user?.branchId || undefined,
      }),
    onSuccess: () => {
      toast.success("Inventory item added");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const adjust = useMutation({
    mutationFn: (row: InventoryRow) =>
      put(`/api/inventory/${row.id}`, {
        category: row.category,
        itemName: row.itemName,
        sku: row.sku,
        location: row.location,
        quantity: Math.max(0, row.quantity - 1),
        unit: row.unit,
        status: row.quantity - 1 <= 0 ? "OUT_OF_STOCK" : row.status,
        notes: row.notes,
        branchId: row.branchId,
      }),
    onSuccess: () => {
      toast.success("Quantity updated");
      void qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const rows = list.data ?? [];
  return (
    <div>
      <PageHeader
        crumbs={["Campus"]}
        title="Inventory"
        subtitle="Campus assets, stock levels and issue records."
        action={isAdminLike(user?.role) ? <Button onClick={() => setOpen(true)}>Add item</Button> : null}
      />
      {list.isLoading ? <Skeleton className="h-64" /> : list.isError ? (
        <ErrorState message="Could not load inventory." onRetry={() => list.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="No inventory items" body="Add furniture, lab kits, or store stock for this campus." />
      ) : (
        <TableShell columns={["Item", "Category", "Campus", "Location", "Qty", "Status", ""]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3 font-medium">{r.itemName}{r.sku ? ` · ${r.sku}` : ""}</td>
              <td className="px-4 py-3">{r.category}</td>
              <td className="px-4 py-3">{r.branchName}</td>
              <td className="px-4 py-3">{r.location || "—"}</td>
              <td className="px-4 py-3">{r.quantity} {r.unit}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(r.status)}>{prettyStatus(r.status)}</Badge></td>
              <td className="px-4 py-3 text-right">
                {isAdminLike(user?.role) && r.quantity > 0 ? (
                  <Button size="sm" variant="secondary" onClick={() => adjust.mutate(r)}>Issue 1</Button>
                ) : null}
              </td>
            </tr>
          ))}
        </TableShell>
      )}
      <Modal open={open} title="Add inventory item" onClose={() => setOpen(false)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Item name" required><Input value={form.itemName} onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))} /></Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              <option value="FURNITURE">Furniture</option>
              <option value="LAB">Lab</option>
              <option value="SPORTS">Sports</option>
              <option value="IT">IT</option>
              <option value="STORE">Store</option>
              <option value="OTHER">Other</option>
            </Select>
          </Field>
          <Field label="SKU"><Input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} /></Field>
          <Field label="Location"><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></Field>
          <Field label="Quantity"><Input type="number" min={0} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} /></Field>
          <Field label="Unit"><Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} /></Field>
          {user?.role === "SUPER_ADMIN" ? (
            <Field label="Campus">
              <Select value={form.branchId} onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}>
                <option value="">Select campus</option>
                {(branches.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </Field>
          ) : null}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={create.isPending || !form.itemName} onClick={() => create.mutate()}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}

export function HrPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ staffId: "", payMonth: new Date().toISOString().slice(0, 7), grossAmount: "", netAmount: "", status: "DRAFT", notes: "" });
  const staff = useQuery({
    queryKey: ["staff-hr"],
    queryFn: async () => {
      const raw = await api<PageResponse<StaffRow> | StaffRow[]>("/api/staff?size=100");
      return Array.isArray(raw) ? raw : (raw.items ?? []);
    },
  });
  const payroll = useQuery({
    queryKey: ["payroll"],
    queryFn: () => api<Array<{ id: string; staffName: string; department: string; payMonth: string; amount: number | string; status: string }>>("/api/payroll"),
  });
  const create = useMutation({
    mutationFn: () =>
      post("/api/payroll", {
        staffId: form.staffId,
        payMonth: form.payMonth,
        grossAmount: Number(form.grossAmount),
        netAmount: Number(form.netAmount),
        status: form.status,
        notes: form.notes,
        branchId: user?.branchId,
      }),
    onSuccess: () => {
      toast.success("Payroll entry saved");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["payroll"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const rows = staff.data ?? [];
  const pays = payroll.data ?? [];
  return (
    <div>
      <PageHeader
        crumbs={["People"]}
        title="HR & payroll"
        subtitle="Staff directory with payroll entries and salary runs."
        action={
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex items-center text-sm font-semibold text-forest-700" to="/app/staff">Staff module</Link>
            {(isAdminLike(user?.role) || user?.role === "ACCOUNTANT") ? <Button onClick={() => setOpen(true)}>Add payroll</Button> : null}
          </div>
        }
      />
      <h2 className="mb-3 font-display text-xl">Staff directory</h2>
      {staff.isLoading ? <Skeleton className="h-40" /> : rows.length === 0 ? (
        <EmptyState title="No staff records" body="Add staff from the Staff module first." />
      ) : (
        <TableShell columns={["Name", "Designation", "Campus", "Employee code", "Status"]}>
          {rows.map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-3 font-medium">
                <Link className="text-forest-700" to={`/app/staff/${s.id}`}>{s.fullName}</Link>
              </td>
              <td className="px-4 py-3">{s.designation || "—"}</td>
              <td className="px-4 py-3">{s.branchName || "—"}</td>
              <td className="px-4 py-3">{s.employeeCode || "—"}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(s.status)}>{s.status}</Badge></td>
            </tr>
          ))}
        </TableShell>
      )}
      <h2 className="mb-3 mt-8 font-display text-xl">Payroll entries</h2>
      {payroll.isLoading ? <Skeleton className="h-40" /> : pays.length === 0 ? (
        <EmptyState title="No payroll entries" body="Create a draft or posted payslip row for a staff member." />
      ) : (
        <TableShell columns={["Staff", "Department", "Month", "Net", "Status"]}>
          {pays.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 font-medium">{p.staffName}</td>
              <td className="px-4 py-3">{p.department}</td>
              <td className="px-4 py-3">{p.payMonth}</td>
              <td className="px-4 py-3">{formatMoney(p.amount)}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
            </tr>
          ))}
        </TableShell>
      )}
      <Modal open={open} title="Add payroll entry" onClose={() => setOpen(false)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Staff" required>
            <Select value={form.staffId} onChange={(e) => setForm((f) => ({ ...f, staffId: e.target.value }))}>
              <option value="">Select</option>
              {rows.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </Select>
          </Field>
          <Field label="Month (YYYY-MM)"><Input value={form.payMonth} onChange={(e) => setForm((f) => ({ ...f, payMonth: e.target.value }))} /></Field>
          <Field label="Gross"><Input type="number" value={form.grossAmount} onChange={(e) => setForm((f) => ({ ...f, grossAmount: e.target.value }))} /></Field>
          <Field label="Net"><Input type="number" value={form.netAmount} onChange={(e) => setForm((f) => ({ ...f, netAmount: e.target.value }))} /></Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="DRAFT">Draft</option>
              <option value="POSTED">Posted</option>
              <option value="PAID">Paid</option>
            </Select>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!form.staffId || create.isPending} onClick={() => create.mutate()}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
