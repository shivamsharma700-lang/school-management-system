import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { CAMPUS_MEDIA } from "../lib/mediaCatalog";
import { Avatar, cn } from "./ui";
import { FieldMedia, MediaImage } from "./media";
import { Premium3DIcon } from "./3d/Premium3DIcon";

export function InsightKicker({
  children,
  light,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return <p className={cn("stat-kicker", light ? "text-gilt-400" : "text-gilt-600")}>{children}</p>;
}

/** Compact operational welcome band. Prefer no photo on data desks. */
export function DashHero({
  kicker,
  title,
  body,
  meta,
  image,
  aside,
  position = "center 40%",
  dataFirst = false,
}: {
  kicker: string;
  title: string;
  body?: string;
  meta?: string;
  image?: string;
  aside?: ReactNode;
  position?: string;
  /** When true, skip large background photo (ERP desks). */
  dataFirst?: boolean;
}) {
  const showImage = Boolean(image) && !dataFirst;
  return (
    // The photo band previously carried `!aspect-auto max-h-[9.5rem]`, which
    // cancelled the frame's aspect-ratio and squeezed a 16:9 source into roughly
    // 6.35:1 — discarding ~72% of the image. The frame now owns the ratio
    // (media-frame-dashboard) so the crop is deliberate and the subject survives.
    <section
      className={cn(
        "relative isolate overflow-hidden border border-ink-900/5 text-white",
        showImage
          ? "media-frame-dashboard bg-[#15151A]"
          : "min-h-[104px] bg-gradient-to-r from-[#15151A] via-[#26262E] to-[#3A3A45] sm:min-h-[120px]"
      )}
    >
      {showImage ? (
        <div className="absolute inset-0">
          <MediaImage
            src={image!}
            alt=""
            position={position}
            className="h-full w-full"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#15151A]/95 via-[#15151A]/70 to-[#15151A]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#15151A]/55 via-transparent to-[#111114]/25" />
        </div>
      ) : null}
      <div className="relative z-10 grid gap-3 p-3 sm:gap-4 sm:p-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gilt-400 sm:text-[11px]">{kicker}</p>
          <h1 className="mt-1.5 font-display text-xl font-medium tracking-[-0.02em] sm:text-2xl">{title}</h1>
          {body ? <p className="mt-1.5 max-w-xl text-xs leading-5 text-white/75 sm:text-sm sm:leading-6">{body}</p> : null}
          {meta ? <p className="mt-2 text-[11px] font-medium text-white/60 sm:text-xs">{meta}</p> : null}
        </div>
        {aside ? <div className="justify-self-start lg:justify-self-end">{aside}</div> : null}
      </div>
    </section>
  );
}

export function QuickActions({ items }: { items: Array<{ label: string; to: string }> }) {
  return (
    <div className="mt-6 grid gap-px overflow-hidden border border-ink-900/8 bg-ink-900/8 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          className="flex flex-col items-center gap-2.5 bg-[#FFFFFF] px-3 py-5 text-center transition hover:bg-white"
        >
          <span className="block h-10 w-10">
            <Premium3DIcon label={item.label} size={40} />
          </span>
          <span className="text-[12px] font-semibold leading-tight text-ink-900">{item.label}</span>
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
        "overflow-hidden border bg-white text-left transition hover:border-forest-600/30",
        active ? "border-forest-700 ring-1 ring-forest-700/25" : "border-ink-900/8"
      )}
    >
      {image ? <FieldMedia src={image} alt="" frame="thumbnail" position="center 24%" className="!max-h-20 sm:!max-h-24" /> : null}
      <div className="flex items-start gap-3 p-3 sm:p-4">
        <Avatar name={name} size="sm" />
        <div className="min-w-0">
          <p className="font-display text-lg text-ink-900 sm:text-xl">{name}</p>
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
  rows: Array<{ id: string; title: string; meta?: string; when?: string; href?: string }>;
  action?: ReactNode;
}) {
  return (
    <section className="border border-ink-900/8 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-display text-lg text-ink-900 sm:text-xl">{title}</p>
        {action}
      </div>
      <div className="grid gap-0">
        {rows.length === 0 ? (
          <p className="py-6 text-sm text-slate-500">Nothing to show yet.</p>
        ) : (
          rows.map((row) => {
            const inner = (
              <>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">{row.title}</p>
                  {row.meta ? <p className="text-xs text-slate-400">{row.meta}</p> : null}
                </div>
                {row.when ? <span className="shrink-0 text-xs text-slate-400">{row.when}</span> : null}
              </>
            );
            return row.href ? (
              <Link
                key={row.id}
                to={row.href}
                className="flex items-start justify-between gap-3 border-b border-ink-900/6 py-2.5 transition last:border-0 hover:bg-ivory-100/80"
              >
                {inner}
              </Link>
            ) : (
              <div key={row.id} className="flex items-start justify-between gap-3 border-b border-ink-900/6 py-2.5 last:border-0">
                {inner}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export function CampusMosaic({ limit = 8 }: { limit?: number }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
      {CAMPUS_MEDIA.slice(0, limit).map((campus) => (
        <Link
          key={campus.code}
          to={`/app/branches`}
          className="overflow-hidden border border-ink-900/8 bg-white transition hover:border-forest-600/30"
        >
          <div className="relative overflow-hidden">
            <FieldMedia src={campus.hero} alt="" frame="thumbnail" position="center 40%" className="!max-h-28 sm:!max-h-32" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#15151A]/80 to-transparent" />
            <div className="absolute bottom-2.5 left-2.5 text-white sm:bottom-3 sm:left-3">
              <p className="font-display text-base leading-tight sm:text-lg">{campus.name}</p>
              <p className="text-[10px] text-white/75 sm:text-[11px]">
                {campus.city} · {campus.students} students
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Ornament({ src, className }: { src: string; className?: string }) {
  return <img src={src} alt="" className={cn("pointer-events-none select-none", className)} />;
}
