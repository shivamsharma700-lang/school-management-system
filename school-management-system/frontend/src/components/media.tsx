import { useState, type ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LOGIN_HERO, sectionVisualForPath } from "../lib/mediaCatalog";
import { glyphForPath, type GlyphName, SchoolGlyph } from "./glyphs";

function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

export { sectionImageForPath } from "../lib/mediaCatalog";
export { campusPhoto } from "../lib/mediaCatalog";

export function MediaImage({
  src,
  alt = "",
  className,
  position = "center 32%",
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  position?: string;
}) {
  const [ok, setOk] = useState(true);
  if (!src || !ok) {
    return (
      <div
        className={cn("bg-gradient-to-br from-[#07131c] via-[#0a2418] to-[#053321]", className)}
        aria-hidden
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ objectPosition: position }}
      loading="lazy"
      decoding="async"
      onError={() => setOk(false)}
    />
  );
}

/**
 * Premium module header: title block + separate framed school image.
 * Image never sits behind or over the title.
 */
export function CinematicBanner({
  title,
  subtitle,
  image,
  compact,
  className,
  glyph,
  position,
  pathname,
  showImage = true,
  action,
}: {
  title: string;
  subtitle?: string;
  image?: string;
  compact?: boolean;
  className?: string;
  glyph?: GlyphName;
  position?: string;
  pathname?: string;
  showImage?: boolean;
  action?: ReactNode;
}) {
  const visual = sectionVisualForPath(pathname, title);
  const src = image || visual.image || LOGIN_HERO;
  const pos = position || visual.position;
  const mark = glyph ?? glyphForPath(pathname, title);

  return (
    <header
      className={cn(
        "module-hero overflow-hidden rounded-[28px] border border-[#053321]/8 bg-gradient-to-br from-white via-white to-[#f7faf8] shadow-card",
        className
      )}
    >
      <div
        className={cn(
          "grid items-stretch",
          showImage && "lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.9fr)]"
        )}
      >
        <div
          className={cn(
            "flex flex-col justify-center gap-5 px-5 py-6 sm:px-8",
            compact ? "sm:py-7" : "sm:py-9"
          )}
        >
          <div className="flex items-start gap-4">
            <span className="glyph-tile glyph-tile--hero shrink-0">
              <SchoolGlyph name={mark} tone="light" className="h-[3.35rem] w-[3.35rem]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="stat-kicker text-[#8a7340]">Delhi Public School</p>
              <h1 className="mt-1.5 font-display text-[2.15rem] font-semibold leading-[1.05] tracking-[-0.02em] text-[#053321] sm:text-[2.55rem]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2.5 max-w-xl text-[15px] font-medium leading-6 text-slate-500">{subtitle}</p>
              ) : null}
            </div>
          </div>
          {action ? <div className="flex flex-wrap items-center gap-2 pl-[4.5rem]">{action}</div> : null}
        </div>

        {showImage ? (
          <div className="relative min-h-[176px] border-t border-[#053321]/6 bg-[linear-gradient(160deg,#eef5f1_0%,#f7f4ec_100%)] lg:min-h-full lg:border-l lg:border-t-0">
            <div className="absolute inset-3 overflow-hidden rounded-[22px] shadow-[0_14px_36px_rgba(4,24,15,0.14)] ring-1 ring-[#053321]/10 sm:inset-4">
              <MediaImage
                src={src}
                alt=""
                position={pos}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04180f]/25 via-transparent to-white/10" />
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
