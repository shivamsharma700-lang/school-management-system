import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Bus, CheckCircle2, Clock3, Mail, MapPin, Phone, Play, X } from "lucide-react";
import { PublicChrome } from "../components/PublicChrome";
import { MediaImage } from "../components/media";
import { VirtualTour } from "../components/VirtualTour";
import { LOGIN_HERO, TOUR_VIDEO, TOUR_VIDEO_FALLBACK } from "../lib/mediaCatalog";
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
          const p = Math.min(1, (now - start) / 1100);
          setN(Math.round(to * (1 - (1 - p) ** 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      },
      { root: root instanceof Element ? root : undefined, threshold: 0.2 }
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

function Kicker({ children, light }: { children: string; light?: boolean }) {
  return <p className={`stat-kicker ${light ? "text-gilt-400" : "text-gilt-600"}`}>{children}</p>;
}

export function HomePage() {
  const [tour, setTour] = useState(false);
  const [shot, setShot] = useState<(typeof GALLERY)[number] | null>(null);
  const [morePrincipal, setMorePrincipal] = useState(false);

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
    <PublicChrome overlay>
      <section className="relative -mt-[76px] min-h-[100svh] overflow-hidden text-white">
        <video className="hero-video" autoPlay muted loop playsInline poster={LOGIN_HERO}>
          <source src={TOUR_VIDEO} type="video/mp4" />
          <source src={TOUR_VIDEO_FALLBACK} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#07131c]/90 via-[#053321]/55 to-[#07131c]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07131c] via-transparent to-[#07131c]/35" />
        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1280px] flex-col justify-center px-5 pb-16 pt-28 lg:px-10">
          <p className="stat-kicker text-gilt-400">Delhi Public School · Nursery to Class 12</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.08] sm:text-6xl lg:text-7xl">
            A school where character is taught with the curriculum.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/80">
            Eight campuses across Delhi-NCR. Classrooms, laboratories, playing fields and a quiet insistence that every child is known.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/about" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#07131c]">
              Explore Our School
            </Link>
            <Link to="/admissions" className="inline-flex items-center gap-2 rounded-full bg-gilt-600 px-6 py-3 text-sm font-semibold text-[#07131c] premium-cta">
              Admissions Open
            </Link>
            <button type="button" onClick={() => setTour(true)} className="inline-flex items-center gap-2 rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white">
              <Play size={14} fill="currentColor" /> Virtual Tour
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f1ea] px-5 py-20 text-[#053321] lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Kicker>School identity</Kicker>
            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Learn. Lead. Serve — in that order, every day.</h2>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              Delhi Public School is a CBSE community from Nursery through Class 12. We exist to form young people who think clearly, work hard and treat others with dignity.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <article className="rounded-[24px] bg-white p-6 shadow-card">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gilt-600">Vision</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">A generation of students who leave us ready for university, work and citizenship — not merely for the next examination.</p>
              </article>
              <article className="rounded-[24px] bg-white p-6 shadow-card">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gilt-600">Mission</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">To teach with rigour, to coach with patience, and to keep every campus safe, green and ambitious.</p>
              </article>
            </div>
            <Link to="/about" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
              About the school <ArrowRight size={14} />
            </Link>
          </div>
          <MediaImage src="/assets/campuses/main.jpg" alt="Main campus quadrangle" className="h-[420px] w-full rounded-[28px] object-cover shadow-pop" />
        </div>
        <div className="mx-auto mt-10 grid max-w-[1280px] gap-4 md:grid-cols-2 xl:grid-cols-4">
          {VALUES.map((item, i) => (
            <article key={item.title} className="rounded-[24px] border border-[#053321]/8 bg-white p-6">
              <img src={["/assets/3d/books.svg", "/assets/3d/student.svg", "/assets/3d/teacher.svg", "/assets/3d/crest-orb.svg"][i]} alt="" className="h-11 w-11" />
              <h3 className="mt-4 font-display text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#07131c] px-5 py-16 text-white lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {[
            { to: 4240, suffix: "", label: "Students", hint: "Across eight campuses" },
            { to: 96, suffix: "", label: "Teachers", hint: "Subject specialists" },
            { to: 8, suffix: "", label: "Branches", hint: "Delhi-NCR" },
            { to: 15, suffix: "", label: "Academic programmes", hint: "Nursery to XII" },
            { to: 100, suffix: "+", label: "Achievements", hint: "Sport, arts, boards" },
            { to: 25, suffix: "+", label: "Years of excellence", hint: "Continuing tradition" },
          ].map((item) => (
            <div key={item.label} className="border-t border-white/15 pt-5">
              <p className="font-display text-4xl text-gilt-400">
                <CountUp to={item.to} suffix={item.suffix} />
              </p>
              <p className="mt-2 text-sm font-semibold">{item.label}</p>
              <p className="mt-1 text-xs text-white/55">{item.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-20 text-[#053321] lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <Kicker>Academics</Kicker>
          <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">One pathway, five chapters.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">From the first classroom to senior school, the same pastoral thread. CBSE throughout, with Science, Commerce and Humanities in Classes XI–XII.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {PROGRAMMES.map((p) => (
              <article key={p.title} className="img-zoom group overflow-hidden rounded-[24px] bg-[#f4f1ea] shadow-card">
                <MediaImage src={p.img} alt="" className="h-44 w-full object-cover" />
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gilt-600">{p.range}</p>
                  <h3 className="mt-2 font-display text-2xl">{p.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{p.body}</p>
                </div>
              </article>
            ))}
          </div>
          <Link to="/academics" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">
            Academic programmes <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="bg-[#f4f1ea] px-5 py-20 text-[#053321] lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <Kicker>Campus / Infrastructure</Kicker>
          <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">Places built for teaching, not for show.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Laboratories, libraries, grounds and quiet courtyards. Photographs are licensed stills used to illustrate our fictional Delhi-NCR campuses.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FACILITIES.map((f, i) => (
              <article key={f.title} className={`img-zoom relative overflow-hidden rounded-[24px] ${i === 0 || i === 6 ? "sm:col-span-2" : ""}`}>
                <MediaImage src={f.img} alt={f.title} className={i === 0 || i === 6 ? "h-72 w-full object-cover lg:h-[22rem]" : "h-56 w-full object-cover"} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07131c]/80 to-transparent" />
                <h3 className="absolute bottom-4 left-5 font-display text-2xl text-white">{f.title}</h3>
              </article>
            ))}
          </div>
          <Link to="/campus" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">
            Campus and infrastructure <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="bg-white px-5 py-20 text-[#053321] lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <Kicker>Student life</Kicker>
          <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">The hours after the last bell matter as much as the ones before it.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LIFE.map((item) => (
              <article key={item.title} className="img-zoom overflow-hidden rounded-[24px] bg-[#f4f1ea] shadow-card">
                <MediaImage src={item.img} alt="" className="h-40 w-full object-cover" />
                <div className="p-5">
                  <h3 className="font-display text-2xl">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
          <Link to="/student-life" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">
            Student life <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-24 text-white lg:px-10">
        <MediaImage src="/assets/sections/sports.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#07131c]/72" />
        <div className="relative z-10 mx-auto max-w-[1280px]">
          <Kicker light>Sports</Kicker>
          <h2 className="mt-3 max-w-xl font-display text-4xl sm:text-5xl">Fields, courts and a culture of fair play.</h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/80">Athletics, football, basketball, swimming and house matches. Coaches treat fitness as part of education, not a Saturday extra.</p>
          <Link to="/sports" className="mt-8 inline-flex rounded-full bg-gilt-600 px-5 py-3 text-sm font-semibold text-[#07131c]">
            Sports at DPS
          </Link>
        </div>
      </section>

      <section className="bg-[#f4f1ea] px-5 py-20 text-[#053321] lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Kicker>Events & news</Kicker>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl">This term, on campus.</h2>
            </div>
            <Link to="/events" className="text-sm font-semibold text-[#053321]">
              View all events <ArrowRight className="inline" size={14} />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {EVENTS.map((ev) => (
              <article key={ev.title} className="img-zoom overflow-hidden rounded-[24px] bg-white shadow-card">
                <MediaImage src={ev.img} alt="" className="h-40 w-full object-cover" />
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gilt-600">{ev.date} {ev.year}</p>
                  <h3 className="mt-2 font-display text-2xl">{ev.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{ev.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 text-[#053321] lg:px-10">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative">
            <MediaImage src="/assets/sections/principal.jpg" alt="Principal of Delhi Public School" className="h-[480px] w-full rounded-[28px] object-cover object-top shadow-pop" />
            <p className="mt-3 text-sm font-semibold">Dr. Kavita Sharma · Principal</p>
            <p className="text-xs text-slate-500">M.A., B.Ed., Ph.D. (Education)</p>
          </div>
          <div>
            <Kicker>Principal / Leadership</Kicker>
            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">A letter from the Principal’s desk.</h2>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              We open each year with a simple hope: that every child who walks through our gates feels expected, challenged and safe. Examinations matter. So do kindness, punctuality and the courage to try a harder question.
            </p>
            {morePrincipal ? (
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Our teachers are asked to know names, not just marks. Our families are asked to partner, not merely to drop and collect. If you are considering Delhi Public School, come and walk a campus. The buildings will speak; the children will speak more clearly.
              </p>
            ) : null}
            <button type="button" className="mt-6 text-sm font-semibold text-[#053321]" onClick={() => setMorePrincipal((v) => !v)}>
              {morePrincipal ? "Show less" : "Read more"}
            </button>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <article className="rounded-[22px] bg-[#f4f1ea] p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Chair of campus council</p>
                <p className="mt-2 font-display text-xl">Rohit Menon</p>
                <p className="text-sm text-slate-500">Stewardship of the eight NCR campuses.</p>
              </article>
              <article className="rounded-[22px] bg-[#f4f1ea] p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Dean of academics</p>
                <p className="mt-2 font-display text-xl">Nisha Banerjee</p>
                <p className="text-sm text-slate-500">Curriculum, examinations and teacher development.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#07131c] px-5 py-20 text-white lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <Kicker light>Achievements</Kicker>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">Board excellence, and the rest of a full school life.</h2>
          <p className="mt-3 text-xs text-gilt-400">Sample honour board — labelled demo scores, not live board data.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {TOPPERS.map((t) => (
              <article key={t.name} className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <p className="font-display text-3xl text-gilt-400">{t.score}</p>
                <p className="mt-3 font-semibold">{t.name}</p>
                <p className="text-sm text-white/70">{t.klass}</p>
                <p className="mt-2 text-xs text-white/45">{t.note}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {AWARDS.map((a) => (
              <article key={a.title} className="rounded-[22px] bg-white/5 p-5">
                <h3 className="font-display text-xl">{a.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{a.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f1ea] px-5 py-20 text-[#053321] lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <Kicker>Photo / video gallery</Kicker>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">Campus, classrooms, sport and celebration.</h2>
          <div className="mt-10 columns-1 gap-4 sm:columns-2 xl:columns-3">
            {GALLERY.map((g) => (
              <button
                key={g.src + g.label}
                type="button"
                className="img-zoom mb-4 block w-full break-inside-avoid overflow-hidden rounded-[22px]"
                onClick={() => setShot(g)}
              >
                <span className="relative block">
                  <MediaImage src={g.src} alt={g.label} className={g.span === "tall" ? "h-80 w-full object-cover" : g.span === "wide" ? "h-52 w-full object-cover" : "h-56 w-full object-cover"} />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07131c]/85 px-4 py-3 text-left font-display text-lg text-white">{g.label}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => setTour(true)} className="inline-flex items-center gap-2 rounded-full bg-[#053321] px-5 py-3 text-sm font-semibold text-white">
              <Play size={14} fill="currentColor" /> Take a Virtual Campus Tour
            </button>
            <Link to="/gallery" className="inline-flex items-center gap-2 rounded-full border border-[#053321]/20 px-5 py-3 text-sm font-semibold">
              Open gallery
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 text-[#053321] lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Kicker>Admissions</Kicker>
            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Admissions Open for 2026–27.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Registrations are invited for Nursery through Class VIII, and for limited meritorious places in senior classes. Offers are confirmed in the School Portal — never by informal message.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {STEPS.map((s) => (
                <article key={s.n} className="rounded-[22px] border border-[#053321]/10 p-5">
                  <p className="font-display text-2xl text-gilt-600">{s.n}</p>
                  <h3 className="mt-2 font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{s.body}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/admissions" className="rounded-full bg-[#053321] px-5 py-3 text-sm font-semibold text-white">
                Apply Now
              </Link>
              <Link to="/contact" className="rounded-full border border-[#053321]/20 px-5 py-3 text-sm font-semibold">
                Contact Admissions
              </Link>
              <Link to="/login" className="rounded-full px-5 py-3 text-sm font-semibold text-[#053321]">
                Fee information in the portal
              </Link>
            </div>
          </div>
          <form className="rounded-[28px] bg-[#f4f1ea] p-7 shadow-card" onSubmit={enquire}>
            <p className="font-display text-2xl">Start an enquiry</p>
            <p className="mt-1 text-sm text-slate-500">We will respond by email. This form does not create a live admission record.</p>
            <label className="mt-5 block text-sm font-medium">Parent name</label>
            <input name="name" className="mt-1 w-full rounded-xl border border-[#053321]/10 bg-white px-3 py-2.5 text-sm" />
            <label className="mt-4 block text-sm font-medium">Email</label>
            <input name="email" type="email" className="mt-1 w-full rounded-xl border border-[#053321]/10 bg-white px-3 py-2.5 text-sm" />
            <label className="mt-4 block text-sm font-medium">Class seeking</label>
            <input name="klass" placeholder="e.g. Nursery, VI, XI" className="mt-1 w-full rounded-xl border border-[#053321]/10 bg-white px-3 py-2.5 text-sm" />
            <button type="submit" className="mt-6 w-full rounded-full bg-[#053321] py-3 text-sm font-semibold text-white">
              Submit enquiry
            </button>
          </form>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-20 text-white lg:px-10">
        <MediaImage src="/assets/sections/transport.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#053321]/78" />
        <div className="relative z-10 mx-auto grid max-w-[1280px] items-center gap-8 lg:grid-cols-2">
          <div>
            <Kicker light>Transport</Kicker>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">Routes that families can actually follow.</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/80">
              Dedicated buses serve each campus. Live GPS is not connected; the School Portal shows a clearly labelled demo tracker for families who sign in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#053321]">
                <Bus size={16} /> Open School Portal
              </Link>
              <Link to="/transport" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white">
                Transport details
              </Link>
            </div>
          </div>
          <ul className="grid gap-3 text-sm">
            {["Morning and afternoon shifts", "Attendant on junior routes", "GPS demo inside the parent portal", "Depot at Gurugram and Main Campus"].map((line) => (
              <li key={line} className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3">
                <CheckCircle2 size={16} className="text-gilt-400" /> {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#f4f1ea] px-5 py-20 text-[#053321] lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-3">
          <article className="rounded-[24px] bg-white p-6 shadow-card">
            <MapPin className="text-[#0c6b45]" size={20} />
            <h3 className="mt-3 font-display text-2xl">Address</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Mathura Road, New Delhi — flagship campus, with seven sister campuses across Delhi-NCR. Demo locations are fictional.</p>
          </article>
          <article className="rounded-[24px] bg-white p-6 shadow-card">
            <Phone className="text-[#0c6b45]" size={20} />
            <h3 className="mt-3 font-display text-2xl">Admissions desk</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">011-4300-1000 · Mon–Fri, 8:30–15:30</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-600"><Clock3 size={14} /> Office hours follow the academic calendar.</p>
          </article>
          <article className="rounded-[24px] bg-white p-6 shadow-card">
            <Mail className="text-[#0c6b45]" size={20} />
            <h3 className="mt-3 font-display text-2xl">Email</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">admissions.demo@dps.local</p>
            <Link to="/contact" className="mt-4 inline-block text-sm font-semibold">Contact page →</Link>
          </article>
        </div>
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
