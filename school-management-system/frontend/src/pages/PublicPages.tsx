import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  Award,
  BookOpen,
  Bus,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Play,
  Users,
  X,
} from "lucide-react";
import { PublicChrome } from "../components/PublicChrome";
import { FeatureIcon, SiteCta, SiteHeading, SiteKicker, SiteSection } from "../components/SiteChrome";
import { MediaImage, FieldMedia } from "../components/media";
import { VirtualTour } from "../components/VirtualTour";
import { CAMPUS_MEDIA } from "../lib/mediaCatalog";
import { SITE_MEDIA, SCHOOL_CROP } from "../lib/schoolMedia";
import {
  AWARDS,
  SPORTS_OFFERED,
  DEPARTMENTS,
  EVENTS,
  FACILITIES,
  FACULTY_SPOTLIGHT,
  GALLERY,
  LIFE,
  MISSION,
  PRINCIPAL_MESSAGE,
  PROGRAMMES,
  SCHOOL_FACTS,
  STEPS,
  TOPPERS,
  VALUES,
  VISION,
} from "./homeContent";

function HeroBand({ image, kicker, title, body, position }: { image: string; kicker: string; title: string; body: string; position?: string }) {
  return (
    <section className="relative max-h-[min(48svh,22rem)] min-h-[min(36svh,16rem)] overflow-hidden px-4 py-12 text-white sm:min-h-[min(42svh,18rem)] sm:px-5 sm:py-16 lg:px-10">
      <MediaImage src={image} alt="" position={position ?? "center 38%"} fit="cover" className="absolute inset-0 h-full w-full" loading="eager" />
      <div className="absolute inset-0 bg-ink-950/65" />
      <div className="relative z-10 mx-auto max-w-[1100px]">
        <SiteKicker light>{kicker}</SiteKicker>
        <h1 className="type-hero mt-3 max-w-2xl font-display font-medium tracking-[-0.03em]">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:mt-4 sm:text-[15px] sm:leading-7">{body}</p>
      </div>
    </section>
  );
}

export function AboutPage() {
  const [more, setMore] = useState(false);
  const icons = [GraduationCap, Users, Award, BookOpen];
  return (
    <PublicChrome>
      <HeroBand
        image={SITE_MEDIA.aboutImage}
        position={SCHOOL_CROP.campusWide}
        kicker="About the school"
        title={`${SCHOOL_FACTS.name} — CBSE education from Nursery to Class XII`}
        body={`${SCHOOL_FACTS.type} · ${SCHOOL_FACTS.campuses} · Established ${SCHOOL_FACTS.established}.`}
      />
      <SiteSection>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SiteKicker>Our school</SiteKicker>
            <SiteHeading
              title="An established CBSE school community in Delhi-NCR"
              body={`${SCHOOL_FACTS.name} follows the ${SCHOOL_FACTS.affiliation}. We operate as a ${SCHOOL_FACTS.type.toLowerCase()} with English as the medium of instruction, serving families from Nursery through Class XII.`}
            />
            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div className="border-t border-ink-900/10 pt-3"><dt className="text-xs text-slate-500">Board</dt><dd className="font-semibold">{SCHOOL_FACTS.board}</dd></div>
              <div className="border-t border-ink-900/10 pt-3"><dt className="text-xs text-slate-500">Classes</dt><dd className="font-semibold">{SCHOOL_FACTS.classes}</dd></div>
              <div className="border-t border-ink-900/10 pt-3"><dt className="text-xs text-slate-500">Established</dt><dd className="font-semibold">{SCHOOL_FACTS.established}</dd></div>
              <div className="border-t border-ink-900/10 pt-3"><dt className="text-xs text-slate-500">Office</dt><dd className="font-semibold">{SCHOOL_FACTS.officeHours}</dd></div>
            </dl>
          </div>
          <FieldMedia src={SITE_MEDIA.visionImage} alt="Students on campus" frame="section" />
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <article className="border-t border-ink-900/10 pt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gilt-600">Vision</p>
            <p className="mt-4 text-[15px] leading-7 text-slate-600">{VISION}</p>
          </article>
          <article className="border-t border-ink-900/10 pt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gilt-600">Mission</p>
            <p className="mt-4 text-[15px] leading-7 text-slate-600">{MISSION}</p>
          </article>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((item, i) => {
            const Icon = icons[i] ?? BookOpen;
            return (
              <article key={item.title}>
                <FeatureIcon icon={Icon} />
                <h2 className="mt-4 font-display text-xl font-medium">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            );
          })}
        </div>
      </SiteSection>
      <SiteSection tone="white">
        <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <FieldMedia src={PRINCIPAL_MESSAGE.image} alt={PRINCIPAL_MESSAGE.name} frame="portrait" position={SCHOOL_CROP.principal} className="mx-auto" />
          <div>
            <SiteKicker>Principal’s message</SiteKicker>
            <SiteHeading title="From the Principal’s desk" />
            <p className="mt-5 text-[15px] leading-7 text-slate-600">{PRINCIPAL_MESSAGE.excerpt}</p>
            {more ? <p className="mt-4 text-[15px] leading-7 text-slate-600">{PRINCIPAL_MESSAGE.body}</p> : null}
            <button type="button" className="mt-6 text-sm font-semibold text-forest-700" onClick={() => setMore((v) => !v)}>
              {more ? "Show less" : "Read full message"}
            </button>
            <p className="mt-6 text-sm font-semibold">
              {PRINCIPAL_MESSAGE.name} · {PRINCIPAL_MESSAGE.title}
            </p>
          </div>
        </div>
      </SiteSection>
    </PublicChrome>
  );
}

export function AcademicsPage() {
  return (
    <PublicChrome>
      <HeroBand
        image={SITE_MEDIA.academicImage}
        position={SCHOOL_CROP.classroom}
        kicker="Academics"
        title="CBSE curriculum from Early Years to Class XII"
        body="Science, Commerce and Humanities streams in Classes XI–XII, with laboratory practicals and board preparation."
      />
      <SiteSection tone="white">
        <div className="grid gap-8 lg:grid-cols-2">
          {PROGRAMMES.map((p) => (
            <article key={p.title} className="border border-ink-900/10">
              <FieldMedia src={p.img} alt={p.title} frame="card" />
              <div className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-600">{p.range}</p>
                <h2 className="type-card mt-1.5 font-display font-medium">{p.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{p.body}</p>
                <dl className="mt-4 grid gap-2 border-t border-ink-900/8 pt-3 text-xs text-slate-600 sm:grid-cols-2">
                  <div><dt className="font-semibold text-ink-800">Subjects</dt><dd className="mt-1">{p.subjects}</dd></div>
                  <div><dt className="font-semibold text-ink-800">Approach</dt><dd className="mt-1">{p.approach}</dd></div>
                </dl>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-14">
          <SiteKicker>Departments</SiteKicker>
          <SiteHeading title="Faculty departments" body="Subject teams plan schemes of work, assessments and remedial support." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEPARTMENTS.map((d) => (
              <article key={d.name} className="border border-ink-900/10 bg-canvas/50 p-4">
                <h3 className="font-semibold text-ink-900">{d.name}</h3>
                <p className="mt-1 text-xs text-forest-700">{d.head}</p>
                <p className="mt-2 text-sm text-slate-600">{d.focus}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-14">
          <SiteKicker>Faculty</SiteKicker>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FACULTY_SPOTLIGHT.map((f) => (
              <article key={f.name} className="border border-ink-900/10 bg-white p-3">
                <FieldMedia src={f.img} alt={f.name} frame="profile" className="mx-auto" />
                <h3 className="mt-3 text-center font-semibold">{f.name}</h3>
                <p className="text-center text-xs text-slate-500">{f.role}</p>
                <p className="mt-1 text-center text-[11px] text-slate-400">{f.qual}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-16 bg-ink-950 p-8 text-white sm:p-12">
          <SiteKicker light>Honour board</SiteKicker>
          <h2 className="type-section mt-3 font-display font-medium">Illustrative board results</h2>
          <p className="mt-2 text-xs text-gilt-400">Labelled demo scores — not live CBSE result data.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TOPPERS.map((t) => (
              <article key={t.name} className="border-t border-white/15 pt-4">
                <p className="font-display type-module text-gilt-400">{t.score}</p>
                <p className="mt-3 font-semibold">{t.name}</p>
                <p className="text-sm text-white/60">{t.klass}</p>
                <p className="mt-1 text-[11px] text-white/40">{t.note}</p>
              </article>
            ))}
          </div>
        </div>
      </SiteSection>
    </PublicChrome>
  );
}

export function AdmissionsPagePublic() {
  const enquire = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (!String(data.get("name")).trim() || !String(data.get("email")).trim()) {
      toast.error("Please add your name and email.");
      return;
    }
    toast.success("Thank you. Admissions will reply from the School Portal queue.");
    e.currentTarget.reset();
  };
  return (
    <PublicChrome>
      <HeroBand
        image={SITE_MEDIA.admissionsImage}
        position="center 40%"
        kicker="Admissions"
        title="Admissions open for 2026–27."
        body="Nursery through Class VIII, and limited meritorious places in senior classes. Offers are confirmed in the School Portal."
      />
      <SiteSection tone="white">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="grid gap-6 sm:grid-cols-2">
              {STEPS.map((s) => (
                <article key={s.n} className="border-t border-ink-900/10 pt-5">
                  <p className="font-display text-2xl text-gilt-600">{s.n}</p>
                  <h2 className="mt-2 font-semibold">{s.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{s.body}</p>
                </article>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <SiteCta to="/login" variant="primary">
                Apply now
              </SiteCta>
              <SiteCta to="/contact" variant="secondary">
                Contact admissions
              </SiteCta>
            </div>
          </div>
          <form className="border border-ink-900/10 bg-canvas p-8" onSubmit={enquire}>
            <p className="font-display text-2xl font-medium">Start an enquiry</p>
            <p className="mt-2 text-sm text-slate-500">This form does not create a live admission record.</p>
            <label className="mt-6 block text-sm font-medium">Parent name</label>
            <input name="name" className="mt-1.5 w-full border border-ink-900/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-forest-600" />
            <label className="mt-4 block text-sm font-medium">Email</label>
            <input name="email" type="email" className="mt-1.5 w-full border border-ink-900/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-forest-600" />
            <label className="mt-4 block text-sm font-medium">Class seeking</label>
            <input name="klass" placeholder="e.g. Nursery, VI, XI" className="mt-1.5 w-full border border-ink-900/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-forest-600" />
            <button type="submit" className="mt-6 w-full rounded-full bg-ink-900 py-3 text-sm font-semibold text-white">
              Submit enquiry
            </button>
          </form>
        </div>
      </SiteSection>
    </PublicChrome>
  );
}

export function CampusPage() {
  const [tour, setTour] = useState(false);
  return (
    <PublicChrome>
      <HeroBand
        image={SITE_MEDIA.campusImage}
        position={SCHOOL_CROP.campusWide}
        kicker="Campus"
        title="Places built for teaching, not for show."
        body="Laboratories, libraries, grounds and quiet courtyards across eight Delhi-NCR campuses."
      />
      <SiteSection>
        <div className="grid gap-8 sm:grid-cols-2">
          {FACILITIES.map((f) => (
            <article key={f.title}>
              <FieldMedia src={f.img} alt={f.title} frame="card" />
              <h2 className="type-card mt-4 font-display font-medium">{f.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{f.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-16">
          <SiteKicker>Eight campuses</SiteKicker>
          <SiteHeading title="Delhi-NCR, under one pastoral thread." />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {CAMPUS_MEDIA.map((c) => (
              <article key={c.code}>
                <FieldMedia src={c.hero} alt={c.name} frame="card" position="center 35%" />
                <p className="mt-4 font-display text-xl font-medium">{c.name}</p>
                <p className="mt-1 text-sm text-slate-500">{c.location}</p>
              </article>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setTour(true)}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white"
          >
            <Play size={14} fill="currentColor" /> Virtual campus tour
          </button>
        </div>
      </SiteSection>
      <VirtualTour open={tour} onClose={() => setTour(false)} />
    </PublicChrome>
  );
}

export function StudentLifePage() {
  return (
    <PublicChrome>
      <HeroBand
        image={SITE_MEDIA.studentLifeImage}
        position="center 30%"
        kicker="Student life"
        title="The hours after the last bell matter as much as the ones before it."
        body="Arts, clubs, houses and service — not as extras, but as the school day."
      />
      <SiteSection tone="white">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {LIFE.map((item) => (
            <article key={item.title}>
              <FieldMedia src={item.img} alt={item.title} frame="portrait" className="mx-auto !max-h-72" />
              <h2 className="type-card mt-4 font-display font-medium">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </SiteSection>
    </PublicChrome>
  );
}

export function SportsPagePublic() {
  return (
    <PublicChrome>
      <HeroBand
        image={SITE_MEDIA.sportsImage}
        position={SCHOOL_CROP.sports}
        kicker="Sports"
        title="Fields, courts and a culture of fair play."
        body="Athletics, cricket, football, basketball and house matches. Coaches treat fitness as part of education."
      />

      {/* Each sport carries its own photograph. Football, basketball and
          athletics previously shared one cricket image, which made the page
          read as filler. */}
      <SiteSection>
        <SiteKicker>What we play</SiteKicker>
        <SiteHeading title="Sport across the school week" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SPORTS_OFFERED.map((sport) => (
            <article
              key={sport.name}
              className="group overflow-hidden rounded-2xl border border-ink-900/10 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-pop"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <MediaImage
                  src={sport.img}
                  alt={sport.name}
                  position="center 45%"
                  className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-medium text-ink-900">{sport.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{sport.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </SiteSection>

      <SiteSection>
        <SiteKicker>Recent results</SiteKicker>
        <SiteHeading title="How our teams have done" />
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {AWARDS.map((a) => (
            <article key={a.title} className="border-t border-ink-900/10 pt-5">
              <h3 className="font-display text-2xl font-medium">{a.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{a.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <SiteCta to="/admissions" variant="gilt">
            Join a campus
          </SiteCta>
        </div>
      </SiteSection>
    </PublicChrome>
  );
}

export function EventsPagePublic() {
  return (
    <PublicChrome>
      <HeroBand image={SITE_MEDIA.eventImage} position="center 40%" kicker="Events & calendar" title="Examinations, meetings and school programmes" body="Key dates for assessments, parent–teacher meetings, sports and holidays across campuses." />
      <SiteSection tone="white">
        <div className="grid gap-10 md:grid-cols-2">
          {EVENTS.map((ev) => (
            <article key={ev.title} className="border border-ink-900/10">
              <FieldMedia src={ev.img} alt="" frame="event" />
              <div className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-forest-600">
                  {ev.category} · {ev.date} {ev.year}
                </p>
                <h2 className="type-card mt-1.5 font-display font-medium">{ev.title}</h2>
                <p className="mt-1 text-xs text-slate-500">{ev.location}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{ev.body}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <SiteCta to="/gallery" variant="ghost">
            Campus photographs <ArrowRight size={14} />
          </SiteCta>
        </div>
      </SiteSection>
    </PublicChrome>
  );
}

export function GalleryPage() {
  const [shot, setShot] = useState<(typeof GALLERY)[number] | null>(null);
  const [tour, setTour] = useState(false);
  return (
    <PublicChrome>
      <HeroBand
        image={SITE_MEDIA.galleryNoida}
        position="center 40%"
        kicker="Gallery"
        title="Campus, classrooms, sport and celebration."
        body="Licensed stills and a demo campus film. Click any photograph to open it."
      />
      <SiteSection>
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
          {GALLERY.map((g) => (
            <button key={g.src + g.label} type="button" className="mb-4 block w-full break-inside-avoid overflow-hidden" onClick={() => setShot(g)}>
              <span className="relative block">
                <FieldMedia
                  src={g.src}
                  alt={g.label}
                  frame={g.span === "tall" ? "portrait" : g.span === "wide" ? "banner" : "gallery"}
                  className={g.span === "tall" ? "!max-h-72 max-w-none" : g.span === "wide" ? "!max-h-40" : "!max-h-48"}
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/80 px-4 py-3 text-left text-sm font-medium text-white">{g.label}</span>
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setTour(true)}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white"
        >
          <Play size={14} fill="currentColor" /> Virtual campus tour
        </button>
      </SiteSection>
      <VirtualTour open={tour} onClose={() => setTour(false)} />
      {shot ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/85 p-4" onClick={() => setShot(null)}>
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <MediaImage src={shot.src} alt={shot.label} fit="contain" className="max-h-[90vh] w-full" />
            <p className="absolute bottom-4 left-5 font-display text-2xl text-white">{shot.label}</p>
            <button type="button" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white" onClick={() => setShot(null)} aria-label="Close photograph">
              <X size={18} />
            </button>
          </div>
        </div>
      ) : null}
    </PublicChrome>
  );
}

export function TransportPagePublic() {
  return (
    <PublicChrome>
      <HeroBand
        image={SITE_MEDIA.transportImage}
        position={SCHOOL_CROP.bus}
        kicker="Transport"
        title="Routes that families can actually follow."
        body="Dedicated buses serve each campus. Live GPS is not connected; the School Portal shows a labelled demo tracker."
      />
      <SiteSection tone="white">
        <div className="grid gap-10 lg:grid-cols-2">
          <ul className="grid gap-4 text-sm">
            {["Morning and afternoon shifts", "Attendant on junior routes", "GPS demo inside the parent portal", "Depot at Gurugram and Main Campus"].map((line) => (
              <li key={line} className="flex items-center gap-3 border-l-2 border-forest-600 pl-4 py-2">
                <CheckCircle2 size={16} className="text-forest-600" /> {line}
              </li>
            ))}
          </ul>
          <SiteCta to="/login" variant="primary">
            <Bus size={16} /> Open School Portal
          </SiteCta>
        </div>
      </SiteSection>
    </PublicChrome>
  );
}

export function ContactPage() {
  return (
    <PublicChrome>
      <HeroBand
        image={SITE_MEDIA.admissionsImage}
        position="center 40%"
        kicker="Contact"
        title="Admissions desk and campus offices."
        body="Demo contact details for this platform. Live offers are issued only through the School Portal."
      />
      <SiteSection>
        <div className="grid gap-10 md:grid-cols-3">
          <article>
            <MapPin className="text-forest-600" size={20} strokeWidth={1.6} />
            <h2 className="mt-4 font-display text-2xl font-medium">Address</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Mathura Road, New Delhi — flagship campus, with seven sister campuses across Delhi-NCR.</p>
          </article>
          <article>
            <Phone className="text-forest-600" size={20} strokeWidth={1.6} />
            <h2 className="mt-4 font-display text-2xl font-medium">Admissions desk</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">011-4300-1000 · Mon–Fri, 8:30–15:30</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Clock3 size={14} /> Office hours follow the academic calendar.
            </p>
          </article>
          <article>
            <Mail className="text-forest-600" size={20} strokeWidth={1.6} />
            <h2 className="mt-4 font-display text-2xl font-medium">Email</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">admissions.demo@touchwood.edu.in</p>
            <Link to="/login" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
              School Portal <ArrowRight size={14} />
            </Link>
          </article>
        </div>
      </SiteSection>
    </PublicChrome>
  );
}
