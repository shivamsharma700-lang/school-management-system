import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Pause, Play, X } from "lucide-react";
import { MediaImage } from "./media";
import { SCHOOL } from "../lib/schoolMedia";

/**
 * Campus tour.
 *
 * This was a 10MB MP4 whose licence could not be verified, with a "fallback"
 * source that pointed at the same file and so could never rescue a failed load.
 * The product rule is that a beautiful still beats a poor film, so the tour is
 * now a cinematic sequence built from the curated Indian-school photography in
 * `sources.json` — every frame licensed, attributable and already optimised to
 * AVIF/WebP.
 */

type Slide = { src: string; title: string; caption: string; position: string };

const SLIDES: Slide[] = [
  {
    src: SCHOOL.campus.hero,
    title: "The campus",
    caption: "Morning assembly on the main forecourt.",
    position: "center 45%",
  },
  {
    src: SCHOOL.campus.entrance,
    title: "Arrival",
    caption: "The portico at the start of the school day.",
    position: "center 50%",
  },
  {
    src: SCHOOL.classroomsLesson,
    title: "Classrooms",
    caption: "Small-group teaching across Nursery to Class XII.",
    position: "center 40%",
  },
  {
    src: SCHOOL.library,
    title: "Library",
    caption: "Reading rooms and reference collections.",
    position: "center 45%",
  },
  {
    src: SCHOOL.scienceLab,
    title: "Laboratories",
    caption: "Practical science from the middle school upward.",
    position: "center 40%",
  },
  {
    src: SCHOOL.sports,
    title: "Sport",
    caption: "Cricket, athletics and inter-house competition.",
    position: "center 45%",
  },
  {
    src: SCHOOL.transport,
    title: "Transport",
    caption: "Supervised routes across Delhi-NCR.",
    position: "center 50%",
  },
];

const SLIDE_MS = 4200;

export function VirtualTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [fs, setFs] = useState(false);

  const reduced = useMemo(
    () => typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const go = useCallback((delta: number) => {
    setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setPlaying(!reduced);
  }, [open, reduced]);

  // Auto-advance
  useEffect(() => {
    if (!open || !playing) return;
    const id = window.setInterval(() => go(1), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [open, playing, go]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, go]);

  useEffect(() => {
    const onFs = () => setFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  if (!open) return null;

  const slide = SLIDES[index];

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Campus tour"
      onClick={onClose}
    >
      <div
        ref={boxRef}
        className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/20 bg-[#08080A] shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 bg-gradient-to-b from-[#08080A]/85 to-transparent p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gilt-400">
              Campus tour
            </p>
            <h2 className="font-display text-2xl text-white">{slide.title}</h2>
            <p className="mt-1 max-w-xl text-xs text-white/75">{slide.caption}</p>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            onClick={onClose}
            aria-label="Close tour"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative aspect-[16/9] w-full bg-black">
          {SLIDES.map((s, i) => (
            <div
              key={s.src}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={i !== index}
            >
              <MediaImage
                src={s.src}
                alt={i === index ? `${s.title} — ${s.caption}` : ""}
                position={s.position}
                className="h-full w-full"
                loading={i === 0 ? "eager" : "lazy"}
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08080A]/70 via-transparent to-[#08080A]/40" />

          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous view"
            className="absolute left-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next view"
            className="absolute right-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#08080A] via-[#08080A]/80 to-transparent px-5 pb-5 pt-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              aria-label={playing ? "Pause tour" : "Play tour"}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <ol className="flex flex-1 items-center gap-1.5" aria-label="Tour progress">
              {SLIDES.map((s, i) => (
                <li key={s.src} className="flex-1">
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`View ${i + 1}: ${s.title}`}
                    aria-current={i === index}
                    className={`block h-1 w-full rounded-full transition ${
                      i === index ? "bg-gilt-400" : "bg-white/25 hover:bg-white/45"
                    }`}
                  />
                </li>
              ))}
            </ol>

            <span className="text-xs tabular-nums text-white/70">
              {index + 1} / {SLIDES.length}
            </span>

            <button
              type="button"
              onClick={() => {
                if (document.fullscreenElement) void document.exitFullscreen();
                else void boxRef.current?.requestFullscreen?.();
              }}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              aria-label={fs ? "Exit full screen" : "Full screen"}
            >
              {fs ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
