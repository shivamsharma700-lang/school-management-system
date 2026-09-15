import { useEffect, useRef } from "react";
import { MediaImage } from "../media";
import { cn } from "../ui";
import { SITE_MEDIA, SCHOOL_CROP } from "../../lib/schoolMedia";

/**
 * Premium cinematic hero — photographic depth layers + subtle parallax.
 * Replaces the low-poly WebGL campus diorama.
 */
export function CinematicHero({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const mid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (back.current) back.current.style.transform = `scale(1.08) translate(${x * -8}px, ${y * -6}px)`;
      if (mid.current) mid.current.style.transform = `scale(1.04) translate(${x * -18}px, ${y * -10}px)`;
    };

    const scroller = document.querySelector(".public-page");
    const onScroll = () => {
      if (!back.current) return;
      const top = scroller instanceof HTMLElement ? scroller.scrollTop : window.scrollY;
      const shift = Math.min(90, top * 0.18);
      back.current.style.transform = `scale(1.08) translate3d(0, ${shift}px, 0)`;
    };

    el.addEventListener("pointermove", onMove);
    scroller?.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onMove);
      scroller?.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={root} className={cn("absolute inset-0 overflow-hidden bg-ink-950", className)} aria-hidden>
      <div
        ref={back}
        className="absolute inset-[-4%] will-change-transform transition-transform duration-500 ease-out"
        style={{ transform: "scale(1.08)" }}
      >
        <MediaImage
          src={SITE_MEDIA.heroImage}
          alt=""
          position={SCHOOL_CROP.hero}
          className="h-full w-full"
          loading="eager"
        />
      </div>

      <div
        ref={mid}
        className="pointer-events-none absolute inset-0 opacity-20 will-change-transform transition-transform duration-700 ease-out"
      >
        <MediaImage
          src={SITE_MEDIA.campusDuskImage}
          alt=""
          position="center 25%"
          className="h-full w-full scale-105 opacity-70"
          loading="eager"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/75 to-ink-950/55" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-ink-950/55" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,transparent_0%,rgba(8,8,10,0.55)_100%)]" />
      <div className="cinema-grain pointer-events-none absolute inset-0 opacity-[0.03]" />
    </div>
  );
}
