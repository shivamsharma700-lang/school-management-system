import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api, post } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatHumanTime, prettyStatus } from "../lib/format";
import { isAdminLike } from "../lib/roles";
import type { Branch } from "../lib/types";
import {
  Badge,
  Button,
  Card,
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

type SchoolEvent = {
  id: string;
  title: string;
  eventType: string;
  audience: string;
  location: string;
  startsAt: string;
  endsAt: string;
  description: string;
  status: string;
  branchName: string;
};

export function EventsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SchoolEvent | null>(null);
  const [form, setForm] = useState({
    title: "",
    eventType: "ACADEMIC",
    audience: "ALL",
    location: "",
    startsAt: new Date().toISOString().slice(0, 16),
    description: "",
    branchId: "",
  });
  const list = useQuery({ queryKey: ["events"], queryFn: () => api<SchoolEvent[]>("/api/events") });
  const branches = useQuery({ queryKey: ["branches"], queryFn: () => api<Branch[]>("/api/branches") });
  const create = useMutation({
    mutationFn: () =>
      post("/api/events", {
        ...form,
        branchId: form.branchId || user?.branchId || undefined,
        startsAt: new Date(form.startsAt).toISOString(),
      }),
    onSuccess: () => {
      toast.success("Event created");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const rows = list.data ?? [];
  return (
    <div>
      <PageHeader
        crumbs={["Campus"]}
        title="Events"
        subtitle="Assemblies, examinations, holidays and campus activities."
        action={isAdminLike(user?.role) ? <Button onClick={() => setOpen(true)}>Add event</Button> : null}
      />
      {list.isLoading ? <Skeleton className="h-64" /> : list.isError ? (
        <ErrorState message="Could not load events." onRetry={() => list.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="No events" body="Create an event to populate the school calendar." />
      ) : (
        <TableShell columns={["When", "Title", "Type", "Audience", "Status", ""]}>
          {rows.map((e) => (
            <tr key={e.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelected(e)}>
              <td className="px-4 py-3">{formatHumanTime(e.startsAt)}</td>
              <td className="px-4 py-3 font-medium">{e.title}</td>
              <td className="px-4 py-3">{e.eventType}</td>
              <td className="px-4 py-3">{e.audience}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(e.status)}>{prettyStatus(e.status)}</Badge></td>
              <td className="px-4 py-3"><button type="button" className="font-semibold text-forest-700" onClick={() => setSelected(e)}>Open</button></td>
            </tr>
          ))}
        </TableShell>
      )}
      {selected ? (
        <Card className="mt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-2xl">{selected.title}</p>
              <p className="mt-1 text-sm text-slate-500">{selected.branchName} · {selected.location || "Campus"}</p>
            </div>
            <Badge tone={statusTone(selected.status)}>{prettyStatus(selected.status)}</Badge>
          </div>
          <p className="mt-4 text-sm text-slate-600 whitespace-pre-wrap">{selected.description || "No description."}</p>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-slate-500">Starts</dt><dd>{formatHumanTime(selected.startsAt)}</dd></div>
            <div><dt className="text-slate-500">Ends</dt><dd>{selected.endsAt ? formatHumanTime(selected.endsAt) : "—"}</dd></div>
            <div><dt className="text-slate-500">Type</dt><dd>{selected.eventType}</dd></div>
            <div><dt className="text-slate-500">Audience</dt><dd>{selected.audience}</dd></div>
          </dl>
          <Button className="mt-4" variant="secondary" size="sm" onClick={() => setSelected(null)}>Close</Button>
        </Card>
      ) : null}
      <Modal open={open} title="New event" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Type">
            <Select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
              <option value="ACADEMIC">Academic</option>
              <option value="SPORTS">Sports</option>
              <option value="CULTURAL">Cultural</option>
              <option value="HOLIDAY">Holiday</option>
              <option value="PTM">PTM</option>
            </Select>
          </Field>
          <Field label="Starts"><Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} /></Field>
          <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <Field label="Branch">
            <Select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
              <option value="">Default / assigned</option>
              {(branches.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Button disabled={!form.title || create.isPending} onClick={() => create.mutate()}>Save event</Button>
        </div>
      </Modal>
      <p className="mt-4 text-sm text-slate-500">
        Dashboard calendar links here. Bus tracking remains separate at <Link className="font-semibold text-forest-700" to="/app/bus-tracking">/app/bus-tracking</Link>.
      </p>
    </div>
  );
}
