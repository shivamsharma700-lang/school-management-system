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
import { useLocation } from "react-router-dom";
import { initials } from "../lib/format";
import { CinematicBanner } from "./media";
import { glyphForPath, SchoolGlyph, type GlyphName } from "./glyphs";

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
    <div className="mb-8">
      {crumbs?.length ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
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
          showImage
          action={action}
        />
      ) : (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-[#053321]">{title}</h1>
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
        "rounded-[22px] border border-[#053321]/8 bg-white shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-pop",
        padded && "p-5",
        className
      )}
    >
      {children}
    </section>
  );
}

const buttonStyles = {
  primary:
    "bg-[#053321] text-white shadow-[0_10px_22px_rgba(5,51,33,0.22)] hover:-translate-y-px hover:bg-[#0b4a32] active:translate-y-0",
  secondary:
    "bg-white text-[#053321] border border-[#053321]/12 shadow-sm hover:-translate-y-px hover:bg-[#f7f4ec] hover:border-[#053321]/20",
  danger: "bg-rose-600 text-white shadow-[0_8px_18px_rgba(225,29,72,0.2)] hover:-translate-y-px hover:bg-rose-500",
  ghost: "text-slate-600 hover:bg-[#f3f7f4] hover:text-[#053321]",
  accent: "bg-[#0c6b45] text-white shadow-[0_8px_18px_rgba(20,102,58,0.22)] hover:-translate-y-px hover:bg-[#0a5a3a]",
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
        "w-full rounded-2xl border border-[#053321]/10 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-[#053321]/30 focus:ring-4 focus:ring-[#053321]/[0.06]",
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
        "w-full rounded-2xl border border-[#053321]/10 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-[#053321]/30 focus:ring-4 focus:ring-[#053321]/[0.06]",
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
        "min-h-[110px] w-full rounded-2xl border border-[#053321]/10 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-[#053321]/30 focus:ring-4 focus:ring-[#053321]/[0.06]",
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
      <span className="text-[13px] font-semibold tracking-wide text-[#053321]/80">
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
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#053321] to-[#0c6b45] font-semibold text-gilt-400",
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
    <div className="rounded-[24px] border border-dashed border-[#053321]/12 bg-gradient-to-b from-white to-[#f7f4ec] px-6 py-16 text-center shadow-card">
      <div className="glyph-tile mx-auto mb-5 h-[4.75rem] w-[4.75rem]">
        {icon ?? <SchoolGlyph name={glyphForPath(undefined, title)} tone="light" className="h-14 w-14" />}
      </div>
      <h3 className="font-display text-2xl text-[#053321]">{title}</h3>
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

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
      <p className="font-semibold text-rose-800">Something went wrong</p>
      <p className="mt-1 text-sm text-rose-700">{message}</p>
      {onRetry ? (
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
  trend,
  tone = "emerald",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  glyph?: GlyphName;
  trend?: string;
  tone?: "emerald" | "sky" | "gold" | "violet" | "rose" | "navy";
}) {
  const tones = {
    emerald: "from-[#f3faf6] via-white to-white",
    sky: "from-[#f2f8fc] via-white to-white",
    gold: "from-[#fbf7ef] via-white to-white",
    violet: "from-[#f7f4fc] via-white to-white",
    rose: "from-[#fcf4f5] via-white to-white",
    navy: "from-[#f6f3ec] via-white to-white",
  };
  const mark = glyph ?? glyphForPath(undefined, label);
  return (
    <Card className={cn("stat-card group relative overflow-hidden bg-gradient-to-br", tones[tone])}>
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#053321]/[0.04] blur-2xl transition group-hover:bg-[#053321]/[0.07]" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
          <p className="mt-2.5 font-display text-[1.85rem] leading-none tracking-tight text-[#053321]">{value}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {trend ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                {trend}
              </span>
            ) : null}
            {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
          </div>
        </div>
        <div className="glyph-tile shrink-0 transition duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.04]">
          <SchoolGlyph name={mark} tone="light" className="h-11 w-11" />
        </div>
      </div>
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
    <div className="flex flex-wrap gap-1.5 rounded-2xl border border-[#053321]/8 bg-[#f4f7f5] p-1.5" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={cn(
            "rounded-xl px-3.5 py-2 text-sm font-semibold transition",
            value === tab.id
              ? "bg-white text-[#053321] shadow-[0_4px_14px_rgba(5,51,33,0.1)] ring-1 ring-[#053321]/8"
              : "text-slate-500 hover:text-[#053321]"
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
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
      <button className="absolute inset-0 bg-[#04180f]/55 backdrop-blur-[2px]" aria-label="Close dialog" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-[26px] border border-[#053321]/8 bg-white p-6 shadow-pop",
          wide ? "max-w-3xl" : "max-w-lg"
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#053321]/6 pb-4">
          <h2 className="font-display text-[1.75rem] font-semibold leading-tight text-[#053321]">{title}</h2>
          <button
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-[#f3f7f4] hover:text-[#053321]"
            onClick={onClose}
            aria-label="Close"
          >
            ×
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
      <button className="absolute inset-0 bg-[#04180f]/55 backdrop-blur-[2px]" aria-label="Close drawer" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-[#053321]/8 bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-[#053321]/6 px-5 py-4">
          <h2 className="font-display text-2xl font-semibold text-[#053321]">{title}</h2>
          <button
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-[#f3f7f4] hover:text-[#053321]"
            onClick={onClose}
            aria-label="Close"
          >
            ×
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
    <div className="overflow-hidden rounded-[22px] border border-[#053321]/8 bg-white shadow-card">
      {toolbar ? (
        <div className="flex flex-col gap-3 border-b border-[#053321]/6 bg-[#fbfaf7] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
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
                  className="whitespace-nowrap px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#053321]/75"
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
