import { useCallback, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LOGIN_HERO, sectionVisualForPath } from "../lib/mediaCatalog";
import { glyphForPath, type GlyphName, SchoolGlyph } from "./glyphs";

function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

export { sectionImageForPath } from "../lib/mediaCatalog";
export { campusPhoto } from "../lib/mediaCatalog";

/** Field-specific media frames — do not use one global crop for all uploads. */
export type MediaFrame =
  | "hero"
  | "banner"
  | "section"
  | "card"
  | "thumbnail"
  | "portrait"
  | "profile"
  | "logo"
  | "video"
  | "event"
  | "gallery"
  | "detail"
  | "dashboard";

const FRAME_CLASS: Record<MediaFrame, string> = {
  hero: "media-frame-hero w-full",
  banner: "media-frame-banner w-full",
  section: "media-frame-section w-full",
  card: "media-frame-card w-full",
  thumbnail: "media-frame-thumb w-full",
  portrait: "media-frame-portrait w-full max-w-sm",
  profile: "media-frame-profile w-full",
  logo: "media-frame-logo",
  video: "media-frame-video w-full",
  event: "media-frame-event w-full",
  gallery: "media-frame-gallery w-full",
  detail: "media-frame-detail w-full",
  dashboard: "media-frame-dashboard w-full",
};

const FRAME_FIT: Record<MediaFrame, "cover" | "contain"> = {
  hero: "cover",
  banner: "cover",
  section: "cover",
  card: "cover",
  thumbnail: "cover",
  portrait: "cover",
  profile: "cover",
  logo: "contain",
  video: "contain",
  event: "cover",
  gallery: "cover",
  detail: "cover",
  dashboard: "cover",
};

const FRAME_POS: Partial<Record<MediaFrame, string>> = {
  hero: "center 38%",
  banner: "center 40%",
  section: "center 42%",
  portrait: "center 22%",
  profile: "center 20%",
  event: "center 35%",
  gallery: "center 40%",
  detail: "center 35%",
  dashboard: "center 40%",
  thumbnail: "center 35%",
};

export function FieldMedia({
  src,
  alt = "",
  frame = "card",
  className,
  position,
  loading = "lazy",
}: {
  src?: string | null;
  alt?: string;
  frame?: MediaFrame;
  className?: string;
  position?: string;
  loading?: "lazy" | "eager";
}) {
  return (
    <MediaImage
      src={src}
      alt={alt}
      fit={FRAME_FIT[frame]}
      position={position ?? FRAME_POS[frame] ?? "center 35%"}
      loading={loading}
      className={cn(FRAME_CLASS[frame], className)}
    />
  );
}

/** Widths emitted by scripts/fetch-school-assets.mjs for curated school imagery. */
const RESPONSIVE_WIDTHS = [640, 1280, 1920];

/**
 * Curated assets under /assets/school/** ship as AVIF + WebP + JPEG at three
 * widths. Anything else (legacy paths, uploads, remote URLs) is served as-is.
 */
function responsiveSources(src: string) {
  const [path, query = ""] = src.split("?");
  if (!path.startsWith("/assets/school/") || !path.endsWith(".jpg")) return null;
  const stem = path.slice(0, -4);
  const suffix = query ? `?${query}` : "";
  const set = (ext: string) =>
    RESPONSIVE_WIDTHS.map((w) => `${stem}-${w}.${ext}${suffix} ${w}w`).join(", ");
  return { avif: set("avif"), webp: set("webp") };
}

export function MediaImage({
  src,
  alt = "",
  className,
  position = "center 35%",
  loading = "lazy",
  fit = "cover",
  sizes = "100vw",
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  position?: string;
  loading?: "lazy" | "eager";
  fit?: "cover" | "contain";
  /** Layout hint for srcset selection; pass a narrower value for cards. */
  sizes?: string;
}) {
  const [ok, setOk] = useState(true);
  const [loaded, setLoaded] = useState(false);

  // An image restored from cache can finish before React attaches onLoad, which
  // would strand it at opacity-0 forever. Reading `complete` off the node closes
  // that race.
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) setLoaded(true);
  }, []);

  if (!src || !ok) {
    return (
      <div
        className={cn("animate-pulse bg-gradient-to-br from-[#08080A] via-[#1C1C21] to-[#111114]", className)}
        aria-hidden
      />
    );
  }

  const responsive = responsiveSources(src);

  return (
    <span className={cn("relative block overflow-hidden", className)}>
      {!loaded ? (
        <span
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-ivory-100 via-[#EDEAE4] to-ivory-200"
          aria-hidden
        />
      ) : null}
      <picture>
        {responsive ? <source type="image/avif" srcSet={responsive.avif} sizes={sizes} /> : null}
        {responsive ? <source type="image/webp" srcSet={responsive.webp} sizes={sizes} /> : null}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            "h-full w-full transition-opacity duration-500",
            fit === "contain" ? "object-contain" : "object-cover",
            loaded ? "opacity-100" : "opacity-0"
          )}
          style={{ objectPosition: position }}
          loading={loading}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setOk(false)}
        />
      </picture>
    </span>
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
        "module-hero overflow-hidden rounded-xl border border-line bg-white shadow-card sm:rounded-2xl",
        className
      )}
    >
      <div
        className={cn(
          "grid items-stretch",
          showImage && "lg:grid-cols-[minmax(0,1.35fr)_minmax(180px,0.55fr)]"
        )}
      >
        <div
          className={cn(
            "flex flex-col justify-center gap-2 px-3 py-3 sm:gap-3 sm:px-5",
            compact ? "sm:py-4" : "sm:py-5"
          )}
        >
          <div className="flex items-start gap-2.5 sm:gap-3">
            <span className="glyph-tile glyph-tile--hero shrink-0 !h-9 !w-9 sm:!h-10 sm:!w-10">
              <SchoolGlyph name={mark} tone="light" className="h-7 w-7 sm:h-8 sm:w-8" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="stat-kicker text-gilt-600">Touch Wood High Public School</p>
              <h1 className="mt-0.5 font-display text-xl font-semibold tracking-[-0.02em] text-ink-900 sm:text-2xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-5">{subtitle}</p>
              ) : null}
            </div>
          </div>
          {action ? <div className="flex flex-wrap items-center gap-2 sm:pl-12">{action}</div> : null}
        </div>

        {showImage ? (
          <div className="relative max-h-36 border-t border-line bg-ivory-100 sm:max-h-none sm:min-h-[120px] lg:min-h-full lg:border-l lg:border-t-0">
            <div className="relative aspect-[16/9] max-h-36 overflow-hidden sm:absolute sm:inset-2 sm:aspect-auto sm:max-h-none sm:rounded-xl sm:shadow-soft sm:ring-1 sm:ring-ink-900/10 lg:inset-3 lg:rounded-[16px]">
              <MediaImage
                src={src}
                alt=""
                position={pos}
                className="h-full w-full"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/15 via-transparent to-transparent" />
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
