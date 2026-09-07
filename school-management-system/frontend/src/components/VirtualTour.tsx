import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { TOUR_POSTER, TOUR_VIDEO, TOUR_VIDEO_FALLBACK } from "../lib/mediaCatalog";

export function VirtualTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fs, setFs] = useState(false);
  const [ready, setReady] = useState(true);
  const [still, setStill] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.muted = true;
    setMuted(true);
    setStill(null);
    void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      el.pause();
    };
  }, [open]);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (still) setStill(null);
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  const toggleFs = async () => {
    const node = boxRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setFs(false);
    } else {
      await node.requestFullscreen();
      setFs(true);
    }
  };

  const fmt = (s: number) => {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#04180f]/80 p-3 backdrop-blur-md" onClick={onClose}>
      <div
        ref={boxRef}
        className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/25 bg-[#04180f] shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 bg-gradient-to-b from-[#04180f]/80 to-transparent p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gilt-400">Demo campus tour</p>
            <h2 className="font-display text-2xl text-white">A walk through a licensed campus film</h2>
            <p className="mt-1 max-w-xl text-xs text-white/70">
              This is a freely licensed demo walkthrough, not an official Delhi Public School production.
            </p>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white" onClick={onClose} aria-label="Close tour">
            <X size={18} />
          </button>
        </div>
        <video
          ref={videoRef}
          className="aspect-video h-auto w-full bg-black object-cover"
          poster={TOUR_POSTER}
          playsInline
          muted
          onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setPlaying(false)}
          onError={() => setReady(false)}
        >
          <source src={TOUR_VIDEO} type="video/mp4" />
          <source src={TOUR_VIDEO_FALLBACK} type="video/mp4" />
        </video>
        {!ready ? (
          <div className="absolute inset-0 grid place-items-center bg-[#04180f]/70 p-6 text-center text-white">
            <p className="max-w-md text-sm">The demo tour file is still downloading or unavailable. Campus photographs remain in Our Campuses below.</p>
          </div>
        ) : null}
        {still ? <img src={still} alt="Campus still" className="absolute inset-0 h-full w-full object-cover" /> : null}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#04180f] via-[#04180f]/80 to-transparent px-5 pb-5 pt-10">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={progress}
            aria-label="Tour progress"
            className="w-full accent-[#c5a059]"
            onChange={(e) => {
              const el = videoRef.current;
              const next = Number(e.target.value);
              if (el) el.currentTime = next;
              setProgress(next);
            }}
          />
          <div className="mt-3 flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-2">
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-gilt-600 text-ink-900" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              </button>
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white/15" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <span className="text-xs text-white/70">{fmt(progress)} / {fmt(duration)}</span>
            </div>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white/15" onClick={() => void toggleFs()} aria-label={fs ? "Exit fullscreen" : "Fullscreen"}>
              {fs ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              ["/assets/campuses/main.jpg", "Campus"],
              ["/assets/sections/library.jpg", "Library"],
              ["/assets/sections/sports.jpg", "Sports"],
              ["/assets/sections/classes.jpg", "Classrooms"],
            ].map(([src, label]) => (
              <button
                key={src}
                type="button"
                className="overflow-hidden rounded-xl border border-white/15"
                onClick={() => {
                  const el = videoRef.current;
                  if (el) {
                    el.pause();
                    setPlaying(false);
                  }
                  setStill(src);
                }}
                aria-label={label}
              >
                <img src={src} alt={label} className="h-16 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
