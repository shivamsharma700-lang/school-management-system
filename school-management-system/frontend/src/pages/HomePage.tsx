import { Suspense, lazy, useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Clock3, Mail, MapPin, Phone, Play } from "lucide-react";
import { PublicChrome } from "../components/PublicChrome";
import { SiteCta, SiteHeading, SiteKicker, SiteSection } from "../components/SiteChrome";
import { FieldMedia, MediaImage } from "../components/media";
import { SchoolVideo } from "../components/SchoolVideo";
import { VirtualTour } from "../components/VirtualTour";
import { useGsapReveal } from "../hooks/useGsapReveal";
import { SITE_MEDIA, SCHOOL_CROP } from "../lib/schoolMedia";
import {
  CALENDAR_HIGHLIGHTS,
  DEPARTMENTS,
  EVENTS,
  FACILITIES,
  FAQS,
  FEE_NOTES,
  LIFE,
  NEWS,
  PRINCIPAL_MESSAGE,
  PROGRAMMES,
  QUICK_INFO,
  SCHOOL_FACTS,
  SPORTS_OFFERED,
  STATS,
  STEPS,
  TESTIMONIALS,
  VALUES,
  VISION,
  MISSION,
} from "./homeContent";

const PhotoHero = lazy(() =>
  import("../components/3d/CinematicHero").then((m) => ({ default: m.CinematicHero }))
);

/** Photographic campus panel — layered stills with depth, in place of fake 3D. */
function CampusPanels() {
  const panels = [
    { src: SITE_MEDIA.campusImage, label: "Main block", position: "center 45%" },
    { src: SITE_MEDIA.libraryImage, label: "Library", position: "center 45%" },
    { src: SITE_MEDIA.laboratoryImage, label: "Laboratories", position: "center 40%" },
    { src: SITE_MEDIA.sportsImage, label: "Sports ground", position: "center 45%" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3" data-reveal>
      {panels.map((p, i) => (
        <figure
          key={p.label}
          className={`group relative overflow-hidden rounded-2xl border border-ink-900/10 shadow-soft ${
            i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]"
          }`}
        >
          <MediaImage
            src={p.src}
            alt={p.label}
            position={p.position}
            className="h-full w-full transition-transform duration-700 group-hover:scale-[1.04]"
            sizes="(max-width: 1024px) 50vw, 30vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/10 to-transparent" />
          <figcaption className="absolute bottom-3 left-4 text-sm font-semibold text-white drop-shadow">
            {p.label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/**
 * Floating glass panels over the hero photograph.
 *
 * Gives the hero an actual foreground plane — the page previously had a single
 * flat image behind text, which is what made it read as empty. Pure CSS
 * transforms: GPU-composited, crisp at any density, no WebGL context.
 */
function HeroPanels() {
  /*
   * Facts only. An earlier draft of this panel carried an invented "100% CBSE
   * pass rate" — the school has published no such figure, so these now read
   * straight from SCHOOL_FACTS.
   */
  const cards = [
    { k: "Board", v: SCHOOL_FACTS.board, d: SCHOOL_FACTS.affiliation, tone: "light" as const, delay: 0 },
    { k: "Established", v: SCHOOL_FACTS.established, d: SCHOOL_FACTS.type, tone: "gold" as const, delay: 900 },
    { k: "Campuses", v: "8", d: "Across Delhi-NCR", tone: "dark" as const, delay: 1800 },
  ];
  return (
    <div
      className="relative hidden h-[380px] lg:block"
      style={{ perspective: "1400px" }}
      data-reveal
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", transform: "rotateY(-9deg) rotateX(3deg)" }}
      >
        {cards.map((c, i) => (
          <div
            key={c.k}
            className={[
              "hero-float absolute w-[264px] rounded-2xl border p-5 backdrop-blur-xl",
              c.tone === "light"
                ? "border-white/70 bg-white/92 text-ink-900 shadow-[0_28px_60px_rgba(8,8,10,0.38)]"
                : c.tone === "gold"
                  ? "border-gilt-400/60 bg-gilt-500/95 text-ink-950 shadow-[0_28px_60px_rgba(8,8,10,0.42)]"
                  : "border-white/18 bg-ink-950/75 text-white shadow-[0_28px_60px_rgba(8,8,10,0.5)]",
              i === 0 ? "left-0 top-0" : i === 1 ? "right-0 top-[7.5rem]" : "left-6 bottom-0",
            ].join(" ")}
            style={{ ["--d" as string]: `${c.delay}ms`, transform: `translateZ(${i * 26}px)` }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">{c.k}</p>
            <p className="mt-1.5 font-display text-4xl font-semibold leading-none tracking-tight">{c.v}</p>
            <p className="mt-1.5 text-xs leading-5 opacity-75">{c.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const root = document.querySelector(".public-page");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / 1000);
          setN(Math.round(to * (1 - (1 - p) ** 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      },
      { root: root instanceof Element ? root : undefined, threshold: 0.3 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [to]);
  return (
    <span ref={ref}>
      {n.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function HomePage() {
  const [tour, setTour] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const revealRef = useGsapReveal<HTMLDivElement>([]);

  const enquire = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (!String(data.get("name")).trim() || !String(data.get("email")).trim()) {
      toast.error("Please add your name and email.");
      return;
    }
    toast.success("Enquiry received. Admissions will follow up from the School Portal queue.");
    e.currentTarget.reset();
  };

  return (
    <PublicChrome overlay>
      <div ref={revealRef}>
        {/* HERO */}
        <section className="relative -mt-[64px] min-h-[var(--hero-min-h)] overflow-hidden text-white sm:-mt-[72px]">
          <Suspense fallback={<div className="absolute inset-0 bg-[#15151A]" />}>
            <PhotoHero />
          </Suspense>
          <div className="relative z-10 mx-auto grid min-h-[var(--hero-min-h)] max-w-[1180px] items-center gap-10 px-4 pb-10 pt-24 sm:px-5 sm:pb-12 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-16">
            <div data-reveal className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFBE3D] sm:text-[11px]">
                {SCHOOL_FACTS.name} · {SCHOOL_FACTS.board} · {SCHOOL_FACTS.classes}
              </p>
              <h1 className="type-hero mt-3 font-display font-medium tracking-[-0.02em]">
                {SCHOOL_FACTS.name}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/80 sm:text-[15px] sm:leading-7">
                A co-educational CBSE day school from Nursery to Class XII, with eight campuses across Delhi-NCR.
                Rigorous classrooms, laboratories, sports grounds and a School Portal for families and staff.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-7">
                <SiteCta to="/admissions" variant="gilt">
                  Admissions 2026–27
                </SiteCta>
                <SiteCta to="/about" variant="light">
                  About the school
                </SiteCta>
                <button
                  type="button"
                  onClick={() => setTour(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white/90 hover:text-white"
                >
                  <Play size={14} fill="currentColor" /> Campus tour
                </button>
              </div>
            </div>

            {/* Depth stack: real layered panels in perspective, so the hero has
                foreground as well as a background photograph. */}
            <HeroPanels />
          </div>
        </section>

        {/* QUICK INFORMATION */}
        <section className="border-b border-ink-900/10 bg-white">
          <div className="mx-auto grid max-w-[1100px] gap-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {QUICK_INFO.map((item) => (
              <div key={item.label} className="border-ink-900/8 px-4 py-4 sm:border-r sm:px-5 sm:py-5 [&:nth-child(3n)]:lg:border-r-0 [&:nth-child(6n)]:xl:border-r-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-700">{item.label}</p>
                <p className="mt-1.5 text-sm font-semibold text-ink-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT + PRINCIPAL */}
        <SiteSection id="about">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12" data-reveal>
            <div>
              <SiteKicker>About the school</SiteKicker>
              <SiteHeading
                title="A CBSE school community across Delhi-NCR."
                body={`${SCHOOL_FACTS.name} is a co-educational day school affiliated to the ${SCHOOL_FACTS.affiliation}. We teach from ${SCHOOL_FACTS.classes}, with pastoral care, laboratories, sports and a parent portal for attendance, fees and notices.`}
              />
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <article className="border-t border-ink-900/10 pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gilt-600">Vision</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{VISION}</p>
                </article>
                <article className="border-t border-ink-900/10 pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gilt-600">Mission</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{MISSION}</p>
                </article>
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {VALUES.map((v) => (
                  <article key={v.title}>
                    <h3 className="font-display text-lg text-ink-900">{v.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{v.body}</p>
                  </article>
                ))}
              </div>
              <div className="mt-8">
                <SiteCta to="/about" variant="primary">
                  Read more about us <ArrowRight size={14} />
                </SiteCta>
              </div>
            </div>
            <div className="grid gap-4">
              <FieldMedia src={SITE_MEDIA.aboutImage} alt="School campus entrance" frame="section" position={SCHOOL_CROP.campusWide} />
              <article className="border border-ink-900/10 bg-white p-5 sm:p-6">
                <div className="flex gap-4">
                  <FieldMedia
                    src={PRINCIPAL_MESSAGE.image}
                    alt={PRINCIPAL_MESSAGE.name}
                    frame="profile"
                    position={SCHOOL_CROP.principal}
                    className="!max-w-[5.5rem] shrink-0"
                  />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-700">Principal’s message</p>
                    <p className="mt-2 font-display text-xl text-ink-900">{PRINCIPAL_MESSAGE.name}</p>
                    <p className="text-xs text-slate-500">{PRINCIPAL_MESSAGE.title}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{PRINCIPAL_MESSAGE.excerpt}</p>
                <Link to="/about" className="mt-4 inline-flex text-sm font-semibold text-forest-700 hover:underline">
                  Full message →
                </Link>
              </article>
            </div>
          </div>
        </SiteSection>

        {/* ACADEMICS */}
        <SiteSection tone="white" id="academics">
          <div data-reveal>
            <SiteKicker>Academics</SiteKicker>
            <SiteHeading
              title="CBSE programmes from Early Years to Class XII"
              body="Five stages of schooling with clear subject pathways, assessment calendars and university counselling in the senior years."
            />
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {PROGRAMMES.map((p) => (
              <article key={p.title} className="border border-ink-900/10 bg-canvas/40" data-reveal>
                <FieldMedia src={p.img} alt={p.title} frame="card" />
                <div className="p-4 sm:p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-forest-700">{p.range}</p>
                  <h3 className="type-card mt-1 font-display text-ink-900">{p.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{p.body}</p>
                  <dl className="mt-4 space-y-2 border-t border-ink-900/8 pt-3 text-xs text-slate-600">
                    <div>
                      <dt className="font-semibold text-ink-800">Subjects</dt>
                      <dd className="mt-0.5">{p.subjects}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink-800">Learning approach</dt>
                      <dd className="mt-0.5">{p.approach}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
            <article className="border border-ink-900/10 bg-ink-950 p-5 text-white md:col-span-2 xl:col-span-1" data-reveal>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gilt-400">Departments</p>
              <ul className="mt-4 space-y-3">
                {DEPARTMENTS.slice(0, 5).map((d) => (
                  <li key={d.name} className="border-b border-white/10 pb-3 last:border-0">
                    <p className="text-sm font-semibold">{d.name}</p>
                    <p className="mt-1 text-xs text-white/65">{d.focus}</p>
                  </li>
                ))}
              </ul>
              <Link to="/academics" className="mt-5 inline-flex text-sm font-semibold text-gilt-400 hover:text-gilt-300">
                Academic programmes →
              </Link>
            </article>
          </div>
        </SiteSection>

        {/* FACILITIES */}
        <SiteSection id="facilities">
          <div data-reveal>
            <SiteKicker>Facilities</SiteKicker>
            <SiteHeading title="Classrooms, laboratories, library and grounds" body="Infrastructure that supports the CBSE timetable — not display spaces for a brochure." />
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FACILITIES.map((f) => (
              <article key={f.title} data-reveal>
                <FieldMedia src={f.img} alt={f.title} frame="card" />
                <h3 className="type-card mt-3 font-display">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{f.body}</p>
                <ul className="mt-3 space-y-1 text-xs text-slate-500">
                  {f.features.map((feat) => (
                    <li key={feat}>· {feat}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </SiteSection>

        {/* CAMPUS */}
        <SiteSection tone="white" id="campus">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12" data-reveal>
            <div>
              <SiteKicker>Campus</SiteKicker>
              <SiteHeading
                title="Eight campuses under one academic framework"
                body="Main Campus on Mathura Road and sister campuses across Delhi-NCR share curriculum, assessment calendars and the School Portal."
              />
              <ul className="mt-6 space-y-2 text-sm text-slate-600">
                <li>· Secure entry and visitor protocols</li>
                <li>· Library, labs and sports grounds on each major campus</li>
                <li>· Interactive campus map for orientation visits</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <SiteCta to="/campus" variant="primary">
                  Campus details
                </SiteCta>
                <SiteCta to="/gallery" variant="secondary">
                  Photo gallery
                </SiteCta>
              </div>
            </div>
            {/* Replaced a low-poly WebGL campus: at this size it read as a game,
                not a school. Real photography with depth does the job better and
                costs no GPU context. */}
            <CampusPanels />
          </div>
        </SiteSection>

        {/* STUDENT LIFE + SPORTS */}
        <SiteSection id="student-life">
          <div className="grid gap-12 lg:grid-cols-2">
            <div data-reveal>
              <SiteKicker>Student life</SiteKicker>
              <SiteHeading title="Clubs, houses and cultural programmes" body="Activity periods sit inside the school week alongside academics." />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {LIFE.map((item) => (
                  <article key={item.title} className="border border-ink-900/10 bg-white">
                    <FieldMedia src={item.img} alt={item.title} frame="thumbnail" />
                    <div className="p-3.5">
                      <h3 className="font-display text-lg">{item.title}</h3>
                      <p className="mt-1.5 text-xs leading-5 text-slate-600">{item.body}</p>
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-forest-700">{item.schedule}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-6">
                <SiteCta to="/student-life" variant="primary">
                  Student life →
                </SiteCta>
              </div>
            </div>
            <div data-reveal>
              <SiteKicker>Sports</SiteKicker>
              <SiteHeading title="Athletics, team sports and fitness" body="Physical Education is on the timetable; house matches run through the year." />
              <div className="mt-8 space-y-3">
                {SPORTS_OFFERED.map((s) => (
                  <article key={s.name} className="flex gap-3 border border-ink-900/10 bg-white p-2.5">
                    <FieldMedia src={s.img} alt={s.name} frame="thumbnail" className="!max-h-20 w-28 shrink-0 !aspect-[4/3]" />
                    <div className="min-w-0 py-1">
                      <h3 className="font-semibold text-ink-900">{s.name}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{s.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-6">
                <SiteCta to="/sports" variant="primary">
                  Sports at TWHPS →
                </SiteCta>
              </div>
            </div>
          </div>
        </SiteSection>

        {/* SCHOOL LIFE FILM */}
        <SiteSection>
          <SchoolVideo />
        </SiteSection>

        {/* NEWS + EVENTS */}
        <SiteSection tone="white" id="news">
          <div className="grid gap-12 lg:grid-cols-2">
            <div data-reveal>
              <SiteKicker>Latest news</SiteKicker>
              <SiteHeading title="Notices families should know" body="Circulars are also published inside the School Portal for signed-in parents." />
              <div className="mt-8 space-y-4">
                {NEWS.map((n) => (
                  <article key={n.title} className="flex gap-3 border-b border-ink-900/10 pb-4">
                    <FieldMedia src={n.img} alt="" frame="thumbnail" className="!max-h-[4.5rem] w-24 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gilt-700">
                        {n.category} · {n.date}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-ink-900">{n.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{n.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div data-reveal>
              <SiteKicker>Upcoming events</SiteKicker>
              <SiteHeading title="Examinations, PTM and sports calendar" body="Full calendars are campus-specific; key school-wide dates appear below." />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {EVENTS.map((ev) => (
                  <article key={ev.title} className="border border-ink-900/10 bg-canvas/50">
                    <FieldMedia src={ev.img} alt="" frame="event" />
                    <div className="p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-forest-700">
                        {ev.date} {ev.year} · {ev.category}
                      </p>
                      <h3 className="mt-1 font-display text-lg text-ink-900">{ev.title}</h3>
                      <p className="mt-1 text-[11px] text-slate-500">{ev.location}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-600">{ev.body}</p>
                      <Link to="/events" className="mt-3 inline-flex text-xs font-semibold text-forest-700">
                        View details →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </SiteSection>

        {/* ACHIEVEMENTS + CALENDAR */}
        <SiteSection tone="ink">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]" data-reveal>
            <div>
              <SiteKicker light>At a glance</SiteKicker>
              <h2 className="type-section mt-3 font-display text-white">School strength and calendar</h2>
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {STATS.map((item) => (
                  <div key={item.label} className="border-t border-white/15 pt-3">
                    <p className="font-display text-2xl text-[#FFBE3D] sm:text-3xl">
                      <CountUp to={item.to} suffix={item.suffix} />
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-[11px] text-white/50">{item.hint}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gilt-400">Academic calendar highlights</p>
              <ul className="mt-4 space-y-3">
                {CALENDAR_HIGHLIGHTS.map((c) => (
                  <li key={c.when} className="flex gap-3 border-b border-white/10 pb-3 text-sm">
                    <span className="w-20 shrink-0 font-semibold text-gilt-400">{c.when}</span>
                    <span className="text-white/80">{c.what}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SiteSection>

        {/* ADMISSIONS */}
        <SiteSection tone="white" id="admissions">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div data-reveal>
              <SiteKicker>Admissions</SiteKicker>
              <SiteHeading
                title="Admissions open for academic year 2026–27"
                body="Nursery through Class VIII, with limited seats in senior classes subject to vacancy and assessment."
              />
              <ol className="mt-8 grid gap-4 sm:grid-cols-2">
                {STEPS.map((s) => (
                  <li key={s.n} className="border-t border-ink-900/10 pt-4">
                    <p className="font-display text-xl text-gilt-600">{s.n}</p>
                    <h3 className="mt-1 font-semibold text-ink-900">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">{s.body}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-700">Fee information</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {FEE_NOTES.map((f) => (
                    <article key={f.title} className="bg-canvas px-3.5 py-3">
                      <p className="text-sm font-semibold">{f.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{f.detail}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
            <div data-reveal>
              <FieldMedia src={SITE_MEDIA.admissionsImage} alt="Admissions desk" frame="section" className="mb-5" />
              <form onSubmit={enquire} className="border border-ink-900/10 bg-canvas/60 p-5 sm:p-6">
                <p className="font-display text-xl text-ink-900">Admission enquiry</p>
                <p className="mt-1 text-xs text-slate-500">We respond on working days during office hours.</p>
                <label className="mt-4 block text-xs font-semibold">Parent / guardian name</label>
                <input name="name" className="mt-1 w-full border border-ink-900/15 bg-white px-3 py-2.5 text-sm" />
                <label className="mt-3 block text-xs font-semibold">Email</label>
                <input name="email" type="email" className="mt-1 w-full border border-ink-900/15 bg-white px-3 py-2.5 text-sm" />
                <label className="mt-3 block text-xs font-semibold">Preferred class</label>
                <input name="class" placeholder="e.g. Class III" className="mt-1 w-full border border-ink-900/15 bg-white px-3 py-2.5 text-sm" />
                <button type="submit" className="mt-5 w-full bg-[#15151A] px-4 py-3 text-sm font-semibold text-white">
                  Submit enquiry
                </button>
                <Link to="/admissions" className="mt-3 block text-center text-xs font-semibold text-forest-700">
                  Full admissions guide →
                </Link>
              </form>
            </div>
          </div>
        </SiteSection>

        {/* TRANSPORT + CONTACT STRIP */}
        <section className="relative max-h-[min(38svh,17rem)] overflow-hidden px-4 py-12 text-white sm:px-5 lg:px-10">
          <MediaImage src={SITE_MEDIA.transportImage} alt="" position={SCHOOL_CROP.bus} fit="cover" className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-[#15151A]/80" />
          <div className="relative z-10 mx-auto flex max-w-[1100px] flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" data-reveal>
            <div className="max-w-lg">
              <SiteKicker light>Transport & contact</SiteKicker>
              <h2 className="type-section mt-2 font-display">Routes, timings and the admissions desk</h2>
              <p className="mt-2 text-sm text-white/75">
                Office hours {SCHOOL_FACTS.officeHours}. Bus routes are assigned per campus in the School Portal.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <SiteCta to="/transport" variant="light">
                Transport
              </SiteCta>
              <SiteCta to="/contact" variant="gilt">
                Contact
              </SiteCta>
              <SiteCta to="/login" variant="primary">
                School Portal
              </SiteCta>
            </div>
          </div>
        </section>

        {/* PARENT VOICES + FAQ */}
        <SiteSection>
          <div className="grid gap-12 lg:grid-cols-2">
            <div data-reveal>
              <SiteKicker>Parent information</SiteKicker>
              <SiteHeading title="What families tell us" />
              <div className="mt-6 space-y-4">
                {TESTIMONIALS.map((t) => (
                  <blockquote key={t.name} className="border-l-2 border-forest-600 pl-4">
                    <p className="text-sm leading-6 text-slate-700">“{t.quote}”</p>
                    <footer className="mt-2 text-xs font-semibold text-ink-900">
                      {t.name} · <span className="font-normal text-slate-500">{t.role}</span>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
            <div data-reveal>
              <SiteKicker>FAQs</SiteKicker>
              <SiteHeading title="Common questions" />
              <div className="mt-6 divide-y divide-ink-900/10 border-y border-ink-900/10">
                {FAQS.map((f, i) => (
                  <button
                    key={f.q}
                    type="button"
                    className="flex w-full items-start justify-between gap-4 py-3.5 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  >
                    <span>
                      <span className="block text-sm font-semibold text-ink-900">
                        {f.q} {openFaq === i ? "−" : "+"}
                      </span>
                      {openFaq === i ? <span className="mt-2 block text-sm leading-6 text-slate-600">{f.a}</span> : null}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SiteSection>

        {/* CONTACT CARD */}
        <SiteSection tone="white" id="contact">
          <div className="grid gap-8 border border-ink-900/10 bg-canvas/50 p-6 sm:p-8 lg:grid-cols-3" data-reveal>
            <div className="lg:col-span-1">
              <SiteKicker>Contact</SiteKicker>
              <h2 className="type-section mt-2 font-display">{SCHOOL_FACTS.name}</h2>
              <p className="mt-3 text-sm text-slate-600">{SCHOOL_FACTS.address}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
              <div className="flex gap-3">
                <Phone size={18} className="mt-0.5 text-forest-700" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                  <p className="mt-1 text-sm font-semibold">{SCHOOL_FACTS.phone}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail size={18} className="mt-0.5 text-forest-700" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                  <p className="mt-1 text-sm font-semibold">{SCHOOL_FACTS.email}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock3 size={18} className="mt-0.5 text-forest-700" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Office hours</p>
                  <p className="mt-1 text-sm font-semibold">{SCHOOL_FACTS.officeHours}</p>
                </div>
              </div>
              <div className="flex gap-3 sm:col-span-3">
                <MapPin size={18} className="mt-0.5 text-forest-700" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">School timings</p>
                  <p className="mt-1 text-sm text-slate-700">{SCHOOL_FACTS.timings}</p>
                </div>
              </div>
            </div>
          </div>
        </SiteSection>

        <VirtualTour open={tour} onClose={() => setTour(false)} />
      </div>
    </PublicChrome>
  );
}
