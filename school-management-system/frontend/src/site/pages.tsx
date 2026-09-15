import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Building2, Check, Mail, MapPin, Phone, Users } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "./SiteShell";
import { Hero } from "./Hero";
import { DashboardPreview } from "./DashboardPreview";
import {
  CTASection, CapabilityStats, FeatureGrid, ImageStories, ModuleGrid, PageHero,
  StorySection, Testimonials, TrustSection,
} from "./sections";
import { Badge, Button, ButtonLink, Card, Reveal, SectionHeader } from "./ui";
import { FEATURES, MODULES, PRODUCT, TOTAL_MODULE_SCREENS } from "./content";
import { SCHOOL } from "../lib/schoolMedia";
import { MediaImage } from "../components/media";
import { post } from "../lib/api";

/** Sets document title + meta description per page. */
function useSeo(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    const set = (name: string, content: string, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.head.querySelector<HTMLMetaElement>(sel);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(prop ? "property" : "name", name);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    set("description", description);
    set("og:title", title, true);
    set("og:description", description, true);
    set("og:type", "website", true);
  }, [title, description]);
}

/* ==================================================================== HOME */

export function SiteHomePage() {
  useSeo(
    "School Management Application — School ERP for Indian Schools | Softcubical",
    "A unified school management application for Indian schools: admissions, students, attendance, examinations, fees, transport, library and communication, with role-based access across every campus."
  );

  return (
    <SiteShell overlay>
      <Hero />

      {/* Capability band */}
      <section className="site-dark border-t border-[var(--border-on-dark)]">
        <div className="site-shell py-16 lg:py-20">
          <CapabilityStats />
        </div>
      </section>

      {/* Story */}
      <section className="site-section bg-[var(--surface)]">
        <div className="site-shell">
          <SectionHeader
            align="center"
            eyebrow="Why schools move"
            title="From scattered registers to one source of truth"
            body="Most schools do not lack data — they lack one place to put it. This is the path from fragmented records to a connected school."
          />
          <StorySection />
        </div>
      </section>

      {/* Features */}
      <section className="site-section">
        <div className="site-shell">
          <SectionHeader
            eyebrow="Platform"
            title="Everything a school runs on, in one application"
            body="Each area is a working module backed by live APIs — not a roadmap item."
            action={
              <ButtonLink to="/features" variant="secondary">
                All features
                <ArrowRight size={16} className="arrow" aria-hidden />
              </ButtonLink>
            }
          />
          <FeatureGrid />
        </div>
      </section>

      {/* Product preview */}
      <section className="site-section bg-[var(--surface)]">
        <div className="site-shell">
          <SectionHeader
            align="center"
            eyebrow="The product"
            title="A dashboard that answers the day's questions"
            body="Every role signs in to its own command centre — attendance and collections for administrators, today's classes for teachers, children and dues for parents."
          />
          <div className="mt-14">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Image stories */}
      <section className="site-section">
        <div className="site-shell">
          <ImageStories />
        </div>
      </section>

      {/* Modules */}
      <section className="site-section bg-[var(--surface)]">
        <div className="site-shell">
          <SectionHeader
            eyebrow="Modules"
            title={`${TOTAL_MODULE_SCREENS} working screens across 12 modules`}
            body="Admissions to alumni, with the same records shared across every module."
            action={
              <ButtonLink to="/modules" variant="secondary">
                Explore modules
                <ArrowRight size={16} className="arrow" aria-hidden />
              </ButtonLink>
            }
          />
          <ModuleGrid modules={MODULES.slice(0, 8)} />
        </div>
      </section>

      {/* Trust */}
      <section className="site-dark site-section">
        <div className="site-shell">
          <SectionHeader
            onDark
            eyebrow="Built for school data"
            title="Access control that holds up under inspection"
            body="Student records, medical notes and fee histories are sensitive. Permissions are enforced by the server and verified by an automated suite — not by hiding buttons."
          />
          <TrustSection />
        </div>
      </section>

      {/* Testimonials — intentionally unfabricated */}
      <section className="site-section">
        <div className="site-shell">
          <SectionHeader align="center" eyebrow="Schools" title="What schools say" />
          <div className="mt-12">
            <Testimonials />
          </div>
        </div>
      </section>

      <CTASection secondary={{ to: "/modules", label: "Browse modules" }} />
    </SiteShell>
  );
}

/* ================================================================ FEATURES */

export function SiteFeaturesPage() {
  useSeo(
    "Features — School Management Application | Softcubical",
    "Student lifecycle, academics and examinations, attendance, fees and finance, transport, communication, multi-branch control, insight and audit."
  );

  return (
    <SiteShell>
      <PageHero
        eyebrow="Features"
        title="The complete school, covered end to end"
        body="Eight capability areas that share one set of records, so a mark entered by a teacher reaches the report card, the parent portal and the school's reporting without being typed twice."
        image={SCHOOL.classroomsLesson}
      />

      <section className="site-section">
        <div className="site-shell">
          <FeatureGrid />
        </div>
      </section>

      <section className="site-section bg-[var(--surface)]">
        <div className="site-shell">
          <SectionHeader
            align="center"
            eyebrow="In practice"
            title="Designed around the school day"
            body="The platform follows the rhythm of an Indian school — assembly, periods, homework, examinations, fee cycles and the bus run home."
          />
          <div className="mt-14">
            <ImageStories />
          </div>
        </div>
      </section>

      <CTASection />
    </SiteShell>
  );
}

/* ================================================================= MODULES */

export function SiteModulesPage() {
  useSeo(
    "Modules — School Management Application | Softcubical",
    "Students, admissions, attendance, academics, fees and payments, staff and HR, transport, library, communication, campus operations, reporting and administration."
  );

  return (
    <SiteShell>
      <PageHero
        eyebrow="Modules"
        title="Twelve modules. One school record."
        body={`${TOTAL_MODULE_SCREENS} working screens, each backed by a live API. Modules share the same students, staff, classes and academic year — so nothing is entered twice.`}
        image={SCHOOL.campus.aerial}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Badge tone="onDark">Multi-branch</Badge>
          <Badge tone="onDark">Role-based access</Badge>
          <Badge tone="onDark">Audit trail</Badge>
        </div>
      </PageHero>

      <section className="site-section">
        <div className="site-shell">
          <ModuleGrid />
        </div>
      </section>

      <section className="site-section bg-[var(--surface)]">
        <div className="site-shell">
          <SectionHeader
            align="center"
            eyebrow="Inside the product"
            title="The administrator's view"
          />
          <div className="mt-14">
            <DashboardPreview />
          </div>
        </div>
      </section>

      <CTASection />
    </SiteShell>
  );
}

/* =============================================================== SOLUTIONS */

const ROLE_SOLUTIONS = [
  {
    role: "School leadership",
    body: "Branch comparison, enrolment, collections and academic performance across every campus, with an audit trail behind sensitive actions.",
    points: ["All branches in one view", "Pending approvals queue", "Audit log of changes"],
    image: SCHOOL.campus.wide,
  },
  {
    role: "Principals",
    body: "Academic oversight for one campus: attendance, teacher attendance, examinations, results, admissions and complaints.",
    points: ["Academic performance", "Teacher attendance", "Approvals and alerts"],
    image: SCHOOL.leadership,
  },
  {
    role: "Teachers",
    body: "Today's classes, attendance marking, homework and study material upload, marks entry and their own timetable.",
    points: ["Mark attendance in seconds", "Set and collect homework", "Enter marks where authorised"],
    image: SCHOOL.teachers,
  },
  {
    role: "Accountants",
    body: "Fee structures, invoices, payments, receipts and dues — with discounts, late fees and approval-gated refunds.",
    points: ["Today's collection", "Outstanding dues", "Refunds need admin approval"],
    image: SCHOOL.achievements,
  },
  {
    role: "Parents",
    body: "Only their own children: attendance, homework, results, fees, bus location, notices and parent–teacher meetings.",
    points: ["Child switcher", "Fees and receipts", "Live bus tracking"],
    image: SCHOOL.studentsGroup,
  },
  {
    role: "Transport staff",
    body: "Vehicles, drivers, routes, stops, student assignment and daily trips — with no academic or financial access at all.",
    points: ["Fleet and compliance records", "Route crewing", "Boarding and drop status"],
    image: SCHOOL.transportFleet,
  },
];

export function SiteSolutionsPage() {
  useSeo(
    "Solutions by role — School Management Application | Softcubical",
    "Purpose-built views for school leadership, principals, teachers, accountants, parents, students and transport staff, each with server-enforced permissions."
  );

  return (
    <SiteShell>
      <PageHero
        eyebrow="Solutions"
        title="Every role sees exactly its own school"
        body="Eight role types, each with its own dashboard and its own permissions. A parent cannot reach another child's record, and a branch user cannot reach another campus."
        image={SCHOOL.studentsUniform}
      />

      <section className="site-section">
        <div className="site-shell space-y-20 lg:space-y-24">
          {ROLE_SOLUTIONS.map((s, i) => (
            <Reveal key={s.role} delay={i * 40}>
              <div
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)]">
                  <div className="aspect-[16/10]">
                    <MediaImage
                      src={s.image}
                      alt=""
                      position="center 40%"
                      className="h-full w-full"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
                <div>
                  <Badge>{s.role}</Badge>
                  <h2 className="mt-4 font-bold" style={{ fontSize: "var(--fs-h3)" }}>
                    {s.body}
                  </h2>
                  <ul className="mt-6 space-y-3">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-[var(--text-secondary)]">
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--surface-tint)]">
                          <Check size={13} className="text-[var(--primary)]" aria-hidden />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="site-dark site-section">
        <div className="site-shell">
          <SectionHeader
            onDark
            align="center"
            eyebrow="Access control"
            title="Permissions the server actually enforces"
            body="Role rules are declared in one place and checked on every request, then verified by an automated permission suite covering cross-branch and cross-student access."
          />
          <div className="mt-14">
            <TrustSection />
          </div>
        </div>
      </section>

      <CTASection />
    </SiteShell>
  );
}

/* =================================================================== ABOUT */

export function SiteAboutPage() {
  useSeo(
    "About — School Management Application by Softcubical Technologies",
    "The School Management Application is built by Softcubical Technologies Pvt. Ltd. for Indian schools: one platform for academics, administration, finance and communication."
  );

  return (
    <SiteShell>
      <PageHero
        eyebrow="About"
        title="Built for how Indian schools actually work"
        body="An application by Softcubical Technologies Pvt. Ltd., designed around CBSE academic cycles, Indian fee structures, multi-campus school groups and the daily bus run."
        image={SCHOOL.campus.entrance}
      />

      <section className="site-section">
        <div className="site-shell grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal>
            <SectionHeader
              eyebrow="Our approach"
              title="Software that matches the school, not the other way round"
              body="Schools already have working routines. The platform digitises those routines — the attendance register, the fee receipt, the report card, the notice board — rather than asking a school to change how it runs."
            />
            <div className="mt-8 space-y-5 text-[var(--text-secondary)]">
              <p>
                Every module shares one set of records. A student admitted through the
                admissions module is the same student a teacher marks present, an
                accountant invoices, and a parent follows on the bus route.
              </p>
              <p>
                Access is decided by role and by branch on the server, so a
                multi-campus group can run all its schools from one account without
                campuses seeing each other's data.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)]">
              <div className="aspect-[4/5]">
                <MediaImage
                  src={SCHOOL.studentsClassroom}
                  alt="A teacher leading a lesson in an Indian classroom"
                  position="center 40%"
                  className="h-full w-full"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="site-dark site-section">
        <div className="site-shell">
          <SectionHeader
            onDark
            align="center"
            eyebrow="The platform"
            title="What the application delivers"
          />
          <div className="mt-14">
            <CapabilityStats />
          </div>
        </div>
      </section>

      <section className="site-section">
        <div className="site-shell">
          <SectionHeader align="center" eyebrow="Company" title={`An application by ${PRODUCT.vendor}`} />
          <div className="mx-auto mt-10 max-w-2xl text-center text-[var(--text-secondary)]">
            <p style={{ fontSize: "var(--fs-lead)" }}>
              Softcubical Technologies builds software for education. The School
              Management Application is our platform for schools that want their
              academics, administration, finance and communication in one system.
            </p>
            <ButtonLink to="/contact" size="lg" className="mt-9">
              Talk to the team
              <ArrowRight size={18} className="arrow" aria-hidden />
            </ButtonLink>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

/* ================================================================= CONTACT */

export function SiteContactPage() {
  useSeo(
    "Request a demo — School Management Application | Softcubical",
    "Request a demonstration of the School Management Application for your school or school group."
  );

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setSending(true);
    try {
      // Reuses the existing public admissions-enquiry endpoint, which is the
      // only unauthenticated write the API exposes. No new backend surface.
      await post("/api/public/admissions/enquiries", {
        parentName: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        phone: String(data.get("phone") || ""),
        studentName: String(data.get("school") || ""),
        message: String(data.get("message") || ""),
      });
      setSent(true);
      form.reset();
      toast.success("Thank you — we will be in touch shortly.");
    } catch {
      toast.error("We could not send that just now. Please email us instead.");
    } finally {
      setSending(false);
    }
  }

  return (
    <SiteShell>
      <PageHero
        eyebrow="Contact"
        title="Request a demo"
        body="Tell us about your school and we will walk you through the platform with your own workflows — admissions, attendance, examinations and fees."
        image={SCHOOL.campus.dusk}
      />

      <section className="site-section">
        <div className="site-shell grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal>
            <SectionHeader eyebrow="Get in touch" title="We would like to hear about your school" />
            <ul className="mt-8 space-y-5">
              {[
                { icon: Building2, label: "Softcubical Technologies Pvt. Ltd.", detail: "School Management Application" },
                { icon: Users, label: "Single campus or a school group", detail: "The platform scales to both" },
                { icon: MapPin, label: "Built for Indian schools", detail: "CBSE cycles, Indian fee structures" },
              ].map(({ icon: Icon, label, detail }) => (
                <li key={label} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--surface-tint)]">
                    <Icon size={20} className="text-[var(--primary)]" aria-hidden />
                  </span>
                  <div>
                    <p className="font-bold">{label}</p>
                    <p className="text-[0.9375rem] text-[var(--text-secondary)]">{detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <Card className="p-7 sm:p-9">
              {sent ? (
                <div className="py-10 text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8f7ee]">
                    <Check size={26} className="text-[#1a7f4b]" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-[var(--fs-h3)] font-bold">Request received</h3>
                  <p className="mt-2 text-[var(--text-secondary)]">
                    Thank you. We will get back to you shortly.
                  </p>
                  <Button variant="secondary" className="mt-7" onClick={() => setSent(false)}>
                    Send another request
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="grid gap-5">
                  <h3 className="text-[var(--fs-h3)] font-bold">Request a demo</h3>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Your name" name="name" required autoComplete="name" />
                    <Field label="School name" name="school" required autoComplete="organization" />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Email" name="email" type="email" required autoComplete="email" icon={Mail} />
                    <Field label="Phone" name="phone" type="tel" required autoComplete="tel" icon={Phone} />
                  </div>
                  <label className="grid gap-2">
                    <span className="text-[0.9375rem] font-semibold">What would you like to see?</span>
                    <textarea
                      name="message"
                      rows={4}
                      className="w-full rounded-[var(--radius)] border border-[var(--border-strong)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--primary)]"
                      placeholder="Number of campuses, current system, areas of interest…"
                    />
                  </label>
                  <Button type="submit" size="lg" disabled={sending} className="w-full">
                    {sending ? "Sending…" : "Request a Demo"}
                    {!sending ? <ArrowRight size={18} className="arrow" aria-hidden /> : null}
                  </Button>
                  <p className="text-[0.8125rem] text-[var(--text-muted)]">
                    We use your details only to respond to this request.
                  </p>
                </form>
              )}
            </Card>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  icon: Icon,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  icon?: typeof Mail;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.9375rem] font-semibold">
        {label}
        {required ? <span className="text-[var(--primary)]"> *</span> : null}
      </span>
      <span className="relative block">
        {Icon ? (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden
          />
        ) : null}
        <input
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          className={`w-full rounded-[var(--radius)] border border-[var(--border-strong)] bg-white py-3 text-base outline-none transition focus:border-[var(--primary)] ${
            Icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </span>
    </label>
  );
}
