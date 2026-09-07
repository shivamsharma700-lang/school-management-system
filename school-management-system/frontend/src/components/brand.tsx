import type { LucideIcon } from "lucide-react";
import { useId, type ReactNode } from "react";
import { SCHOOL_SHORT, SCHOOL_TAGLINE } from "../demo/config";
import { glyphForPath, SchoolGlyph } from "./glyphs";
import { cn } from "./ui";

export function DpsCrest({ className, size = 40 }: { className?: string; size?: number }) {
  const gid = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" className={cn("shrink-0 drop-shadow-lg", className)} aria-hidden>
      <defs>
        <radialGradient id={`${gid}-face`} cx="35%" cy="28%" r="75%">
          <stop offset="0%" stopColor="#1a7a4d" />
          <stop offset="55%" stopColor="#0b4a32" />
          <stop offset="100%" stopColor="#052318" />
        </radialGradient>
        <linearGradient id={`${gid}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3e0a6" />
          <stop offset="50%" stopColor="#c5a059" />
          <stop offset="100%" stopColor="#8d6b2a" />
        </linearGradient>
      </defs>
      <circle cx="36" cy="36" r="34" fill={`url(#${gid}-face)`} />
      <circle cx="36" cy="36" r="31.5" fill="none" stroke={`url(#${gid}-gold)`} strokeWidth="2.4" />
      <circle cx="36" cy="36" r="27" fill="none" stroke="#f8f4e8" strokeWidth="1" opacity="0.35" />
      <path d="M36 16 L52 26 V40 C52 49 36 56 36 56 C36 56 20 49 20 40 V26 Z" fill="#f8f4e8" />
      <path d="M36 20 L48 27 V39 C48 46 36 52 36 52 C36 52 24 46 24 39 V27 Z" fill={`url(#${gid}-face)`} />
      <rect x="33.4" y="28" width="5.2" height="16" rx="1.2" fill={`url(#${gid}-gold)`} />
      <path d="M27 31 H45 L36 24 Z" fill={`url(#${gid}-gold)`} />
      <text x="36" y="49" textAnchor="middle" fontSize="8" fontWeight="800" fill="#f8f4e8">
        {SCHOOL_SHORT}
      </text>
    </svg>
  );
}

export function BrandMark({ size = 44, light = false }: { size?: number; light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <DpsCrest size={size} />
      <div>
        <p className={cn("font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.01em]", light ? "text-white" : "text-[#053321]")}>
          Delhi Public School
        </p>
        <p className={cn("text-[10px] font-bold tracking-[0.22em]", light ? "text-gilt-400" : "text-gilt-600")}>{SCHOOL_TAGLINE}</p>
      </div>
    </div>
  );
}

export function PremiumIcon({
  icon: _Icon,
  to,
  label,
  active,
  className,
}: {
  icon?: LucideIcon;
  to?: string;
  label?: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "nav-glyph glyph-tile glyph-tile--nav grid h-10 w-10 shrink-0 place-items-center",
        active && "glyph-tile--active",
        className
      )}
    >
      <SchoolGlyph name={glyphForPath(to, label)} tone="sidebar" className="h-9 w-9" />
    </span>
  );
}

export function FeatureOrb({ icon: _Icon, label, to }: { icon?: LucideIcon; label: string; to?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="glyph-tile glyph-tile--nav grid h-14 w-14 place-items-center">
        <SchoolGlyph name={glyphForPath(to, label)} tone="sidebar" className="h-11 w-11" />
      </span>
      <p className="max-w-[7.5rem] text-[11px] font-semibold leading-tight text-white/90">{label}</p>
    </div>
  );
}

export { CinematicBanner, campusPhoto } from "./media";

export function CampusHero() {
  return (
    <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-[24px] shadow-pop" aria-hidden>
      <img src="/assets/campuses/dusk.jpg" alt="" className="h-full w-full object-cover" style={{ objectPosition: "center 40%" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#04180f]/70 to-transparent" />
    </div>
  );
}

export function SchoolHeroArt() {
  return (
    <div className="relative h-36 w-40 shrink-0 [perspective:800px]" aria-hidden>
      <CampusHero />
    </div>
  );
}

export function StudentFigure() {
  return (
    <div className="hidden h-36 w-28 shrink-0 lg:block" aria-hidden>
      <img src="/assets/3d/student.svg" alt="" className="h-full w-full" />
    </div>
  );
}

export function DepthCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("group [perspective:1000px]", className)}>
      <div className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-card backdrop-blur transition duration-300 group-hover:-translate-y-1 group-hover:shadow-pop [transform:rotateX(4deg)]">
        {children}
      </div>
    </div>
  );
}

export function DemoChip({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
      Demo data
    </span>
  );
}

export function CapBooks3D() {
  return (
    <div className="pointer-events-none absolute -top-16 left-1/2 z-10 w-40 -translate-x-1/2 [perspective:900px]" aria-hidden>
      <div className="relative h-32 w-40 [transform:rotateX(12deg)_rotateY(-18deg)]">
        <div className="absolute bottom-6 left-8 h-4 w-24 rounded-sm bg-sky-700 shadow-lg" />
        <div className="absolute bottom-9 left-10 h-4 w-24 rounded-sm bg-amber-700 shadow-md" />
        <div className="absolute bottom-12 left-12 h-4 w-24 rounded-sm bg-forest-600 shadow-md" />
        <div className="absolute bottom-16 left-6 h-16 w-28 origin-bottom [transform:rotateX(8deg)]">
          <div className="h-10 w-28 rounded-t-[80%] bg-gradient-to-br from-forest-500 to-ink-800 shadow-pop" />
          <div className="mx-auto h-8 w-1.5 bg-gilt-400" />
          <div className="absolute right-2 top-8 h-6 w-6 rounded-sm bg-gilt-500 shadow" />
        </div>
      </div>
    </div>
  );
}
