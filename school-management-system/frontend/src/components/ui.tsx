import {
  forwardRef,
  useEffect,
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AlertCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { initials } from "../lib/format";
import { CinematicBanner } from "./media";
import { glyphForPath, SchoolGlyph, type GlyphName } from "./glyphs";
import { dashArtForLabel, type DashArtName } from "./DashArt";
import { Premium3DIcon } from "./3d/Premium3DIcon";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

export function PageHeader({
  title,
  subtitle,
  action,
  crumbs,
  image,
  hero = true,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  crumbs?: string[];
  image?: string;
  hero?: boolean;
}) {
  const location = useLocation();

  return (
    <div className="mb-5">
      {crumbs?.length ? (
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:mb-3 sm:text-[11px] sm:tracking-[0.2em]">
          {crumbs.join(" · ")}
        </p>
      ) : null}

      {hero ? (
        <CinematicBanner
          className="mb-1"
          title={title}
          subtitle={subtitle}
          image={image}
          pathname={location.pathname}
          compact
          showImage={false}
          action={action}
        />
      ) : (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink-900">{title}</h1>
            {subtitle ? <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
        </div>
      )}
    </div>
  );
}

export function Card({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <section
      className={cn(
        "border border-ink-900/8 bg-white shadow-[0_1px_2px_rgba(7,19,26,0.03)]",
        padded && "p-5 sm:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}

const buttonStyles = {
  primary:
    "bg-ink-900 text-white shadow-[0_10px_22px_rgba(12,27,36,0.18)] hover:-translate-y-px hover:bg-ink-800 active:translate-y-0",
  secondary:
    "bg-white text-ink-900 border border-line shadow-sm hover:-translate-y-px hover:bg-ivory-100 hover:border-ink-900/15",
  danger: "bg-rose-600 text-white shadow-[0_8px_18px_rgba(225,29,72,0.2)] hover:-translate-y-px hover:bg-rose-500",
  ghost: "text-slate-600 hover:bg-ivory-200 hover:text-ink-900",
  accent: "bg-forest-600 text-white shadow-[0_8px_18px_rgba(15,82,64,0.2)] hover:-translate-y-px hover:bg-forest-700",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonStyles; size?: "sm" | "md" }
>(function Button({ children, className, variant = "primary", size = "md", type = "button", ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-3 py-2" : "px-4 py-2.5",
        buttonStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return (
    <input
      {...props}
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-ink-900/10 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-ink-900/30 focus:ring-4 focus:ring-ink-900/[0.06]",
        className
      )}
    />
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select
      {...props}
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-ink-900/10 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-ink-900/30 focus:ring-4 focus:ring-ink-900/[0.06]",
        className
      )}
    >
      {children}
    </select>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref
) {
  return (
    <textarea
      {...props}
      ref={ref}
      className={cn(
        "min-h-[110px] w-full rounded-2xl border border-ink-900/10 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-ink-900/30 focus:ring-4 focus:ring-ink-900/[0.06]",
        className
      )}
    />
  );
});

export function Field({
  label,
  children,
  hint,
  error,
  required,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <label className="grid gap-1.5 text-sm" htmlFor={id}>
      <span className="text-[13px] font-semibold tracking-wide text-ink-900/80">
        {label}
        {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
      </span>
      <div id={id}>{children}</div>
      {hint && !error ? <span className="text-xs text-slate-400">{hint}</span> : null}
      {error ? (
        <span className="flex items-center gap-1 text-xs text-rose-600">
          <AlertCircle size={12} /> {error}
        </span>
      ) : null}
    </label>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
}) {
  const tones = {
    neutral: "bg-slate-100/90 text-slate-700 ring-slate-200/90",
    good: "bg-emerald-50 text-emerald-800 ring-emerald-200/70",
    warn: "bg-amber-50 text-amber-900 ring-amber-200/70",
    bad: "bg-rose-50 text-rose-700 ring-rose-200/70",
    info: "bg-sky-50 text-sky-800 ring-sky-200/70",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ring-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status?: string | null): "neutral" | "good" | "warn" | "bad" | "info" {
  const s = (status ?? "").toUpperCase();
  if (["ACTIVE", "PAID", "APPROVED", "PRESENT", "AVAILABLE", "RETURNED", "READ", "OPEN"].includes(s)) return "good";
  if (["PENDING", "PARTIAL", "LATE", "SCHEDULED", "ISSUED", "SEASONAL"].includes(s)) return "warn";
  if (["INACTIVE", "OVERDUE", "FAILED", "REJECTED", "ABSENT", "CANCELLED"].includes(s)) return "bad";
  if (["PUBLISHED", "NEW"].includes(s)) return "info";
  return "neutral";
}

export function Avatar({ name, size = "md" }: { name?: string | null; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "h-8 w-8 text-[11px]" : size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-900 to-forest-700 font-semibold text-gilt-400",
        dim
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-ink-900/12 bg-gradient-to-b from-white to-ivory-100 px-6 py-16 text-center shadow-card">
      <div className="glyph-tile mx-auto mb-5 h-[4.75rem] w-[4.75rem]">
        {icon ?? <SchoolGlyph name={glyphForPath(undefined, title)} tone="light" className="h-14 w-14" />}
      </div>
      <h3 className="font-display text-2xl text-ink-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-slate-200", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  status,
}: {
  message: string;
  onRetry?: () => void;
  status?: number;
}) {
  const forbidden = status === 403;
  const unauthorized = status === 401;
  return (
    <div className={`rounded-2xl border px-6 py-10 text-center ${forbidden ? "border-amber-200 bg-amber-50" : "border-rose-200 bg-rose-50"}`}>
      <p className={`font-semibold ${forbidden ? "text-amber-900" : "text-rose-800"}`}>
        {unauthorized ? "Session required" : forbidden ? "Access denied" : "Something went wrong"}
      </p>
      <p className={`mt-1 text-sm ${forbidden ? "text-amber-800" : "text-rose-700"}`}>{message}</p>
      {onRetry && !unauthorized ? (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: _icon,
  glyph,
  art,
  trend,
  tone = "emerald",
  to,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  glyph?: GlyphName;
  art?: DashArtName;
  trend?: string;
  tone?: "emerald" | "sky" | "gold" | "violet" | "rose" | "navy";
  /** Navigate to the full module / detail list for this KPI */
  to?: string;
}) {
  const illustration = art ?? dashArtForLabel(label);
  void tone;
  void _icon;
  /*
   * The value is the reason this card exists, so it leads at a size nothing else
   * competes with; the label sits above it as a quiet caption and the icon is
   * demoted to a tinted tile. Previously all three sat at similar weight, which
   * left the KPI row reading as flat boxes.
   */
  const body = (
    <div className="relative flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500">{label}</p>
        <p className="mt-2 font-display text-[1.85rem] font-semibold leading-none tracking-tight text-ink-900 sm:text-[2.1rem]">
          {value}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {trend ? (
            <span className="rounded-full bg-forest-50 px-2 py-0.5 text-[11px] font-bold text-forest-700">
              {trend}
            </span>
          ) : null}
          {hint ? <p className="text-xs font-medium text-slate-500">{hint}</p> : null}
        </div>
      </div>
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest-50 ring-1 ring-forest-800/8 transition group-hover:bg-forest-100"
        title={glyph}
      >
        <Premium3DIcon kind={illustration} label={label} size={26} />
      </span>
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="stat-card group relative block overflow-hidden rounded-2xl border border-ink-900/8 bg-surface p-4 shadow-card transition hover:border-forest-600/25 hover:bg-white sm:p-5"
        aria-label={`Open ${label}`}
      >
        {body}
        <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-[0.14em] text-forest-700 opacity-0 transition group-hover:opacity-100">
          View all →
        </span>
      </Link>
    );
  }

  return (
    <Card className="stat-card group relative overflow-hidden border-ink-900/8 bg-[#FFFFFF] !p-4 sm:!p-5">
      {body}
    </Card>
  );
}

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ id: string; label: string }>;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="portal-tabs -mx-1 overflow-x-auto px-1" role="tablist">
      <div className="flex min-w-max gap-1.5 rounded-2xl border border-ink-900/8 bg-forest-50 p-1.5 sm:min-w-0 sm:flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={cn(
            "shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-3.5 sm:text-sm",
            value === tab.id
              ? "bg-white text-ink-900 shadow-[0_4px_14px_rgba(12,27,36,0.1)] ring-1 ring-ink-900/8"
              : "text-slate-500 hover:text-ink-900"
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
      </div>
    </div>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose,
  wide,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-[#08080A]/55 backdrop-blur-[2px]" aria-label="Close dialog" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-[26px] border border-ink-900/8 bg-white p-6 shadow-pop modal-panel",
          wide ? "max-w-3xl" : "max-w-lg"
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-ink-900/6 pb-4">
          <h2 className="font-display text-[1.75rem] font-semibold leading-tight text-ink-900">{title}</h2>
          <button
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-ivory-100 hover:text-ink-900"
            onClick={onClose}
            aria-label="Close"
          >
            Ã—
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-[#08080A]/55 backdrop-blur-[2px]" aria-label="Close drawer" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-ink-900/8 bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-ink-900/6 px-5 py-4">
          <h2 className="font-display text-2xl font-semibold text-ink-900">{title}</h2>
          <button
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-ivory-100 hover:text-ink-900"
            onClick={onClose}
            aria-label="Close"
          >
            Ã—
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm leading-6 text-slate-600">{body}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export function TableShell({
  columns,
  children,
  toolbar,
}: {
  columns: string[];
  children: ReactNode;
  toolbar?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-line bg-white shadow-card">
      {toolbar ? (
        <div className="flex flex-col gap-3 border-b border-line bg-ivory-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          {toolbar}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="portal-table min-w-full text-left text-sm">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c || "actions"}
                  className="whitespace-nowrap px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-900/70"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
