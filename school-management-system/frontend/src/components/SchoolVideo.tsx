import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { MediaImage } from "./media";
import { SCHOOL } from "../lib/schoolMedia";

/**
 * School life film.
 *
 * Licensed CC BY 3.0 (see src/assets/sources.json) and served locally — no
 * hotlinking. The video element is only mounted once the section scrolls into
 * view, so the 3MB file never competes with the hero for bandwidth; until then
 * the poster image stands in, which also covers the case where the browser
 * cannot play WebM.
 */
export function SchoolVideo({
  title = "A day at Touch Wood",
  body = "Assembly, lessons, the ground at lunch, and the bus home.",
}: {
  title?: string;
  body?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  /**
   * Pressing play must work even if the observer never fires. Gating the <video>
   * on IntersectionObserver alone left a dead control whenever IO was
   * unavailable or throttled — the same fail-open lesson as the scroll reveals.
   */
  const [wantsPlay, setWantsPlay] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "250px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) {
      // Not mounted yet (observer has not fired): mount now and autoplay below.
      setWantsPlay(true);
      return;
    }
    if (v.paused) {
      void v.play().then(() => setPlaying(true)).catch(() => setFailed(true));
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  // Start playback as soon as the element exists after an explicit request.
  useEffect(() => {
    if (!wantsPlay) return;
    const v = videoRef.current;
    if (!v) return;
    void v.play().then(() => setPlaying(true)).catch(() => setFailed(true));
  }, [wantsPlay]);

  return (
    <div ref={hostRef} className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gilt-700">School life</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.02em] text-ink-900 sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-7 text-slate-600">{body}</p>
      </div>

      <figure className="relative overflow-hidden rounded-3xl border border-ink-900/8 shadow-pop">
        <div className="relative aspect-video bg-ink-950">
          {/* Poster always renders: it is the fallback if WebM cannot play. */}
          <MediaImage
            src={SCHOOL.studentsGroup}
            alt=""
            position="center 40%"
            className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
              playing && !failed ? "opacity-0" : "opacity-100"
            }`}
            sizes="(max-width: 1024px) 100vw, 55vw"
          />

          {(inView || wantsPlay) && !failed ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              preload="metadata"
              playsInline
              muted={muted}
              loop
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onError={() => setFailed(true)}
            >
              <source src="/assets/videos/school-life.webm" type="video/webm" />
            </video>
          ) : null}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/55 via-transparent to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-4">
            <button
              type="button"
              onClick={toggle}
              disabled={failed}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink-900 shadow-soft transition hover:bg-white disabled:opacity-50"
              aria-label={playing ? "Pause film" : "Play film"}
            >
              {playing ? <Pause size={17} /> : <Play size={17} />}
            </button>
            <button
              type="button"
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                v.muted = !v.muted;
                setMuted(v.muted);
              }}
              disabled={failed || !playing}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30 disabled:opacity-40"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
            {failed ? (
              <p className="text-xs font-medium text-white/85">
                Film unavailable — showing a still instead.
              </p>
            ) : null}
          </div>
        </div>
        <figcaption className="sr-only">
          Students at an Indian school. Video licensed CC BY 3.0.
        </figcaption>
      </figure>
    </div>
  );
}
