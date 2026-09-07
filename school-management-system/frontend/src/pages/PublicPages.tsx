import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Bus, CheckCircle2, Clock3, Mail, MapPin, Phone, Play, X } from "lucide-react";
import { PublicChrome } from "../components/PublicChrome";
import { MediaImage } from "../components/media";
import { VirtualTour } from "../components/VirtualTour";
import { CAMPUS_MEDIA } from "../lib/mediaCatalog";
import {
  AWARDS,
  EVENTS,
  FACILITIES,
  GALLERY,
  LIFE,
  PROGRAMMES,
  STEPS,
  TOPPERS,
  VALUES,
} from "./homeContent";

function HeroBand({ image, kicker, title, body }: { image: string; kicker: string; title: string; body: string }) {
  return (
    <section className="relative min-h-[280px] overflow-hidden px-5 py-20 text-white lg:px-10">
      <MediaImage src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[#07131c]/72" />
      <div className="relative z-10 mx-auto max-w-[1280px]">
        <p className="stat-kicker text-gilt-400">{kicker}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">{body}</p>
      </div>
    </section>
  );
}

export function AboutPage() {
  const [more, setMore] = useState(false);
  return (
    <PublicChrome>
      <HeroBand image="/assets/campuses/main.jpg" kicker="About" title="A CBSE school group that still knows every child by name." body="Eight campuses across Delhi-NCR. Nursery through Class 12. Original copy — this is not a replica of any other school’s prospectus." />
      <section className="bg-[#f4f1ea] px-5 py-16 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-2">
          <article className="rounded-[24px] bg-white p-7 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gilt-600">Vision</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">A generation of students who leave us ready for university, work and citizenship — not merely for the next examination.</p>
          </article>
          <article className="rounded-[24px] bg-white p-7 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gilt-600">Mission</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">To teach with rigour, to coach with patience, and to keep every campus safe, green and ambitious.</p>
          </article>
        </div>
        <div className="mx-auto mt-8 grid max-w-[1280px] gap-4 md:grid-cols-2 xl:grid-cols-4">
          {VALUES.map((item, i) => (
            <article key={item.title} className="rounded-[24px] bg-white p-6">
              <img src={["/assets/3d/books.svg", "/assets/3d/student.svg", "/assets/3d/teacher.svg", "/assets/3d/crest-orb.svg"][i]} alt="" className="h-11 w-11" />
              <h2 className="mt-4 font-display text-2xl">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-white px-5 py-16 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <MediaImage src="/assets/sections/principal.jpg" alt="Principal of Delhi Public School" className="h-[420px] w-full rounded-[28px] object-cover object-top shadow-pop" />
          <div>
            <p className="stat-kicker text-gilt-600">Principal</p>
            <h2 className="mt-3 font-display text-4xl">A letter from the Principal’s desk.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">We open each year with a simple hope: that every child who walks through our gates feels expected, challenged and safe.</p>
            {more ? <p className="mt-4 text-sm leading-7 text-slate-600">Our teachers are asked to know names, not just marks. Come and walk a campus. The buildings will speak; the children will speak more clearly.</p> : null}
            <button type="button" className="mt-6 text-sm font-semibold" onClick={() => setMore((v) => !v)}>{more ? "Show less" : "Read more"}</button>
            <p className="mt-4 text-sm font-semibold">Dr. Kavita Sharma · Principal</p>
          </div>
        </div>
      </section>
    </PublicChrome>
  );
}

export function AcademicsPage() {
  return (
    <PublicChrome>
      <HeroBand image="/assets/sections/academics.jpg" kicker="Academics" title="One pathway, five chapters." body="CBSE throughout, with Science, Commerce and Humanities in Classes XI–XII." />
      <section className="bg-white px-5 py-16 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-6 md:grid-cols-2">
          {PROGRAMMES.map((p) => (
            <article key={p.title} className="img-zoom overflow-hidden rounded-[24px] bg-[#f4f1ea] shadow-card">
              <MediaImage src={p.img} alt={p.title} className="h-56 w-full object-cover" />
              <div className="p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gilt-600">{p.range}</p>
                <h2 className="mt-2 font-display text-3xl">{p.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{p.body}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-[1280px] rounded-[28px] bg-[#07131c] p-8 text-white">
          <h2 className="font-display text-3xl">Honour board</h2>
          <p className="mt-2 text-xs text-gilt-400">Sample scores — labelled demo, not live board data.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {TOPPERS.map((t) => (
              <article key={t.name} className="rounded-2xl border border-white/10 p-4">
                <p className="font-display text-3xl text-gilt-400">{t.score}</p>
                <p className="mt-2 font-semibold">{t.name}</p>
                <p className="text-sm text-white/60">{t.klass}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
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
      <HeroBand image="/assets/sections/admissions.jpg" kicker="Admissions" title="Admissions Open for 2026–27." body="Nursery through Class VIII, and limited meritorious places in senior classes. Offers are confirmed in the School Portal." />
      <section className="bg-white px-5 py-16 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {STEPS.map((s) => (
                <article key={s.n} className="rounded-[22px] border border-[#053321]/10 p-5">
                  <p className="font-display text-2xl text-gilt-600">{s.n}</p>
                  <h2 className="mt-2 font-semibold">{s.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{s.body}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="rounded-full bg-[#053321] px-5 py-3 text-sm font-semibold text-white">Apply Now</Link>
              <Link to="/contact" className="rounded-full border border-[#053321]/20 px-5 py-3 text-sm font-semibold">Contact Admissions</Link>
              <Link to="/login" className="rounded-full px-5 py-3 text-sm font-semibold">Fee information in the portal</Link>
            </div>
          </div>
          <form className="rounded-[28px] bg-[#f4f1ea] p-7 shadow-card" onSubmit={enquire}>
            <p className="font-display text-2xl">Start an enquiry</p>
            <p className="mt-1 text-sm text-slate-500">This form does not create a live admission record.</p>
            <label className="mt-5 block text-sm font-medium">Parent name</label>
            <input name="name" className="mt-1 w-full rounded-xl border border-[#053321]/10 bg-white px-3 py-2.5 text-sm" />
            <label className="mt-4 block text-sm font-medium">Email</label>
            <input name="email" type="email" className="mt-1 w-full rounded-xl border border-[#053321]/10 bg-white px-3 py-2.5 text-sm" />
            <label className="mt-4 block text-sm font-medium">Class seeking</label>
            <input name="klass" placeholder="e.g. Nursery, VI, XI" className="mt-1 w-full rounded-xl border border-[#053321]/10 bg-white px-3 py-2.5 text-sm" />
            <button type="submit" className="mt-6 w-full rounded-full bg-[#053321] py-3 text-sm font-semibold text-white">Submit enquiry</button>
          </form>
        </div>
      </section>
    </PublicChrome>
  );
}

export function CampusPage() {
  const [tour, setTour] = useState(false);
  return (
    <PublicChrome>
      <HeroBand image="/assets/campuses/noida.jpg" kicker="Campus / Infrastructure" title="Places built for teaching, not for show." body="Laboratories, libraries, grounds and quiet courtyards. Photographs are licensed stills used to illustrate fictional Delhi-NCR campuses." />
      <section className="bg-[#f4f1ea] px-5 py-16 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FACILITIES.map((f, i) => (
            <article key={f.title} className={`img-zoom relative overflow-hidden rounded-[24px] ${i === 0 || i === 6 ? "sm:col-span-2" : ""}`}>
              <MediaImage src={f.img} alt={f.title} className={i === 0 || i === 6 ? "h-72 w-full object-cover lg:h-[22rem]" : "h-56 w-full object-cover"} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07131c]/80 to-transparent" />
              <h2 className="absolute bottom-4 left-5 font-display text-2xl text-white">{f.title}</h2>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-[1280px]">
          <h2 className="font-display text-4xl">Eight campuses</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {CAMPUS_MEDIA.map((c) => (
              <article key={c.code} className="overflow-hidden rounded-[22px] bg-white shadow-card">
                <MediaImage src={c.hero} alt={c.name} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <p className="font-display text-xl">{c.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{c.location}</p>
                </div>
              </article>
            ))}
          </div>
          <button type="button" onClick={() => setTour(true)} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#053321] px-5 py-3 text-sm font-semibold text-white">
            <Play size={14} fill="currentColor" /> Take a Virtual Campus Tour
          </button>
        </div>
      </section>
      <VirtualTour open={tour} onClose={() => setTour(false)} />
    </PublicChrome>
  );
}

export function StudentLifePage() {
  return (
    <PublicChrome>
      <HeroBand image="/assets/sections/students.jpg" kicker="Student life" title="The hours after the last bell matter as much as the ones before it." body="Sports, arts, houses, clubs and service — not as extras, but as the school day." />
      <section className="bg-white px-5 py-16 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LIFE.map((item) => (
            <article key={item.title} className="img-zoom overflow-hidden rounded-[24px] bg-[#f4f1ea] shadow-card">
              <MediaImage src={item.img} alt={item.title} className="h-44 w-full object-cover" />
              <div className="p-5">
                <h2 className="font-display text-2xl">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PublicChrome>
  );
}

export function SportsPagePublic() {
  return (
    <PublicChrome>
      <HeroBand image="/assets/sections/sports.jpg" kicker="Sports" title="Fields, courts and a culture of fair play." body="Athletics, football, basketball, swimming and house matches. Coaches treat fitness as part of education." />
      <section className="bg-[#f4f1ea] px-5 py-16 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-4 md:grid-cols-3">
          {AWARDS.map((a) => (
            <article key={a.title} className="rounded-[24px] bg-white p-6 shadow-card">
              <h2 className="font-display text-2xl">{a.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{a.body}</p>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-[1280px]">
          <Link to="/admissions" className="inline-flex rounded-full bg-gilt-600 px-5 py-3 text-sm font-semibold text-[#07131c]">Join a campus</Link>
        </div>
      </section>
    </PublicChrome>
  );
}

export function EventsPagePublic() {
  return (
    <PublicChrome>
      <HeroBand image="/assets/sections/events.jpg" kicker="Events & news" title="This term, on campus." body="Assessments, PTM, sport and the festive close of term." />
      <section className="bg-white px-5 py-16 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-5 md:grid-cols-2">
          {EVENTS.map((ev) => (
            <article key={ev.title} className="img-zoom overflow-hidden rounded-[24px] bg-[#f4f1ea] shadow-card">
              <MediaImage src={ev.img} alt="" className="h-52 w-full object-cover" />
              <div className="p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gilt-600">{ev.date} {ev.year}</p>
                <h2 className="mt-2 font-display text-3xl">{ev.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{ev.body}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-[1280px]">
          <Link to="/gallery" className="text-sm font-semibold">Campus photographs →</Link>
        </div>
      </section>
    </PublicChrome>
  );
}

export function GalleryPage() {
  const [shot, setShot] = useState<(typeof GALLERY)[number] | null>(null);
  const [tour, setTour] = useState(false);
  return (
    <PublicChrome>
      <HeroBand image="/assets/campuses/noida.jpg" kicker="Photo / video gallery" title="Campus, classrooms, sport and celebration." body="Licensed stills and a demo campus film. Click any photograph to open it." />
      <section className="bg-[#f4f1ea] px-5 py-16 lg:px-10">
        <div className="mx-auto max-w-[1280px] columns-1 gap-4 sm:columns-2 xl:columns-3">
          {GALLERY.map((g) => (
            <button key={g.src + g.label} type="button" className="img-zoom mb-4 block w-full break-inside-avoid overflow-hidden rounded-[22px]" onClick={() => setShot(g)}>
              <span className="relative block">
                <MediaImage src={g.src} alt={g.label} className={g.span === "tall" ? "h-80 w-full object-cover" : g.span === "wide" ? "h-52 w-full object-cover" : "h-56 w-full object-cover"} />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07131c]/85 px-4 py-3 text-left font-display text-lg text-white">{g.label}</span>
              </span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setTour(true)} className="mx-auto mt-8 flex items-center gap-2 rounded-full bg-[#053321] px-5 py-3 text-sm font-semibold text-white">
          <Play size={14} fill="currentColor" /> Take a Virtual Campus Tour
        </button>
      </section>
      <VirtualTour open={tour} onClose={() => setTour(false)} />
      {shot ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#07131c]/80 p-4 backdrop-blur-md" onClick={() => setShot(null)}>
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[24px]" onClick={(e) => e.stopPropagation()}>
            <MediaImage src={shot.src} alt={shot.label} className="max-h-[90vh] w-full object-cover" />
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
      <HeroBand image="/assets/sections/transport.jpg" kicker="Transport" title="Routes that families can actually follow." body="Dedicated buses serve each campus. Live GPS is not connected; the School Portal shows a labelled demo tracker." />
      <section className="bg-white px-5 py-16 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-2">
          <ul className="grid gap-3 text-sm">
            {["Morning and afternoon shifts", "Attendant on junior routes", "GPS demo inside the parent portal", "Depot at Gurugram and Main Campus"].map((line) => (
              <li key={line} className="flex items-center gap-2 rounded-2xl bg-[#f4f1ea] px-4 py-3">
                <CheckCircle2 size={16} className="text-[#0c6b45]" /> {line}
              </li>
            ))}
          </ul>
          <Link to="/login" className="inline-flex h-fit items-center gap-2 rounded-full bg-[#053321] px-5 py-3 text-sm font-semibold text-white">
            <Bus size={16} /> Open School Portal
          </Link>
        </div>
      </section>
    </PublicChrome>
  );
}

export function ContactPage() {
  return (
    <PublicChrome>
      <HeroBand image="/assets/sections/admissions.jpg" kicker="Contact" title="Admissions desk and campus offices." body="Demo contact details for this platform. Live offers are issued only through the School Portal." />
      <section className="bg-[#f4f1ea] px-5 py-16 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-6 lg:grid-cols-3">
          <article className="rounded-[24px] bg-white p-6 shadow-card">
            <MapPin className="text-[#0c6b45]" size={20} />
            <h2 className="mt-3 font-display text-2xl">Address</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Mathura Road, New Delhi — flagship campus, with seven sister campuses across Delhi-NCR. Demo locations are fictional.</p>
          </article>
          <article className="rounded-[24px] bg-white p-6 shadow-card">
            <Phone className="text-[#0c6b45]" size={20} />
            <h2 className="mt-3 font-display text-2xl">Admissions desk</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">011-4300-1000 · Mon–Fri, 8:30–15:30</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-600"><Clock3 size={14} /> Office hours follow the academic calendar.</p>
          </article>
          <article className="rounded-[24px] bg-white p-6 shadow-card">
            <Mail className="text-[#0c6b45]" size={20} />
            <h2 className="mt-3 font-display text-2xl">Email</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">admissions.demo@dps.local</p>
            <Link to="/login" className="mt-4 inline-block text-sm font-semibold">School Portal →</Link>
          </article>
        </div>
      </section>
    </PublicChrome>
  );
}
