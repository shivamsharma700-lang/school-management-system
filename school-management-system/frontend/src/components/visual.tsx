import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { CAMPUS_MEDIA } from "../lib/mediaCatalog";
import { Avatar, cn } from "./ui";
import { MediaImage } from "./media";
import { glyphForPath, SchoolGlyph } from "./glyphs";

export function InsightKicker({
  children,
  light,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return <p className={cn("stat-kicker", light ? "text-gilt-400" : "text-gilt-600")}>{children}</p>;
}

export function QuickActions({ items }: { items: Array<{ label: string; to: string }> }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          className="rounded-2xl border border-[#053321]/8 bg-white px-4 py-4 text-center text-sm font-semibold text-[#053321] shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
        >
          <SchoolGlyph name={glyphForPath(item.to, item.label)} className="mx-auto mb-2 h-11 w-11" />
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function PersonCard({
  name,
  meta,
  detail,
  active,
  onClick,
  image,
}: {
  name: string;
  meta: string;
  detail?: string;
  active?: boolean;
  onClick?: () => void;
  image?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "overflow-hidden rounded-[24px] border bg-white text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-pop",
        active ? "border-[#0c6b45] ring-2 ring-[#0c6b45]/20" : "border-white"
      )}
    >
      {image ? <MediaImage src={image} alt="" position="center 24%" className="h-28 w-full object-cover" /> : null}
      <div className="flex items-start gap-3 p-4">
        <Avatar name={name} />
        <div className="min-w-0">
          <p className="font-display text-xl text-[#053321]">{name}</p>
          <p className="text-sm text-slate-500">{meta}</p>
          {detail ? <p className="mt-1 text-xs text-slate-400">{detail}</p> : null}
        </div>
      </div>
    </button>
  );
}

export function ActivityFeed({
  title,
  rows,
  action,
}: {
  title: string;
  rows: Array<{ id: string; title: string; meta?: string; when?: string }>;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-white/80 bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-semibold text-[#053321]">{title}</p>
        {action}
      </div>
      <div className="grid gap-0">
        {rows.length === 0 ? (
          <p className="py-6 text-sm text-slate-500">Nothing to show yet.</p>
        ) : rows.map((row) => (
          <div key={row.id} className="flex items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{row.title}</p>
              {row.meta ? <p className="text-xs text-slate-400">{row.meta}</p> : null}
            </div>
            {row.when ? <span className="shrink-0 text-xs text-slate-400">{row.when}</span> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function CampusMosaic({ limit = 8 }: { limit?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {CAMPUS_MEDIA.slice(0, limit).map((campus) => (
        <article key={campus.code} className="overflow-hidden rounded-[22px] bg-white shadow-card">
          <div className="relative h-28">
            <MediaImage src={campus.hero} alt="" position="center 40%" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04180f]/75 to-transparent" />
            <div className="absolute bottom-3 left-3 text-white">
              <p className="font-display text-lg leading-tight">{campus.name}</p>
              <p className="text-[11px] text-white/75">{campus.city} · {campus.students} students</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function Ornament({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return <img src={src} alt="" className={cn("pointer-events-none select-none", className)} />;
}
