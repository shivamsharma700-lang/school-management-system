import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { MediaImage } from "../components/media";
import {
  CAPABILITIES, FEATURES, IMAGE_STORIES, MODULES, PRODUCT, STORY, TRUST,
  type Feature, type ModuleCardData,
} from "./content";
import { Badge, Button, ButtonLink, Card, Eyebrow, Reveal, SectionHeader, cn } from "./ui";

/* ------------------------------------------------------------- FeatureCard */

export function FeatureCard({ feature, index = 0 }: { feature: Feature; index?: number }) {
  const Icon = feature.icon;
  return (
    <Reveal delay={index * 60} as="article" className="h-full">
      <Card interactive className="flex h-full flex-col">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[var(--surface-tint)] to-white ring-1 ring-[var(--border)]">
          <Icon size={22} className="text-[var(--primary)]" strokeWidth={1.9} aria-hidden />
        </span>
        <h3 className="mt-5 text-[var(--fs-h3)] font-bold">{feature.title}</h3>
        <p className="mt-2.5 text-[var(--text-secondary)]">{feature.body}</p>
        <ul className="mt-5 space-y-2 border-t border-[var(--border)] pt-5">
          {feature.points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-[0.9375rem] text-[var(--text-secondary)]">
              <Check size={16} className="mt-1 shrink-0 text-[var(--primary)]" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      </Card>
    </Reveal>
  );
}

export function FeatureGrid({ features = FEATURES }: { features?: Feature[] }) {
  return (
    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {features.map((f, i) => (
        <FeatureCard key={f.title} feature={f} index={i} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------- ModuleCard */

export function ModuleCard({ module, index = 0 }: { module: ModuleCardData; index?: number }) {
  const Icon = module.icon;
  return (
    <Reveal delay={index * 50} as="article" className="h-full">
      <Link
        to="/modules"
        className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)] lift"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <MediaImage
            src={module.image}
            alt=""
            position="center 45%"
            className="h-full w-full transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-950)]/80 via-[var(--navy-950)]/15 to-transparent" />
          <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/95 shadow-[var(--shadow)] backdrop-blur">
            <Icon size={19} className="text-[var(--primary)]" strokeWidth={1.9} aria-hidden />
          </span>
          <h3 className="absolute bottom-3 left-4 right-4 text-lg font-bold text-white drop-shadow-sm">
            {module.name}
          </h3>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-[0.9375rem] text-[var(--text-secondary)]">{module.body}</p>
          <p className="mt-4 flex items-center gap-1.5 text-[0.8125rem] font-bold text-[var(--primary)]">
            {module.screens} screen{module.screens === 1 ? "" : "s"}
            <ArrowRight size={14} className="arrow transition-transform group-hover:translate-x-0.5" aria-hidden />
          </p>
        </div>
      </Link>
    </Reveal>
  );
}

export function ModuleGrid({ modules = MODULES }: { modules?: ModuleCardData[] }) {
  return (
    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {modules.map((m, i) => (
        <ModuleCard key={m.name} module={m} index={i} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ ImageSection */

export function ImageSection({
  eyebrow,
  title,
  body,
  image,
  to,
  reverse = false,
  index = 0,
}: {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  to?: string;
  reverse?: boolean;
  index?: number;
}) {
  return (
    <Reveal delay={index * 40} as="section">
      <div
        className={cn(
          "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
          reverse && "lg:[&>*:first-child]:order-2"
        )}
      >
        <div className="relative">
          <div className="overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)]">
            <div className="aspect-[4/3]">
              <MediaImage
                src={image}
                alt=""
                position="center 45%"
                className="h-full w-full"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
          {/* Depth accent, purely decorative */}
          <div
            className="pointer-events-none absolute -bottom-5 -right-5 -z-10 h-40 w-40 rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--primary)] to-[var(--indigo)] opacity-20 blur-2xl"
            aria-hidden
          />
        </div>

        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-3 font-bold" style={{ fontSize: "var(--fs-h2)" }}>
            {title}
          </h2>
          <p
            className="mt-5 text-[var(--text-secondary)]"
            style={{ fontSize: "var(--fs-lead)", lineHeight: 1.6 }}
          >
            {body}
          </p>
          {to ? (
            <ButtonLink to={to} variant="secondary" className="mt-8">
              Learn more
              <ArrowRight size={16} className="arrow" aria-hidden />
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}

export function ImageStories() {
  return (
    <div className="space-y-20 lg:space-y-28">
      {IMAGE_STORIES.map((s, i) => (
        <ImageSection key={s.title} {...s} reverse={i % 2 === 1} index={i} />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------- StatsSection */

export function CapabilityStats() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {CAPABILITIES.map((c, i) => (
        <Reveal key={c.label} delay={i * 70}>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-on-dark)] bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-4xl font-extrabold tracking-tight text-[var(--accent)]">{c.value}</p>
            <p className="mt-2 text-base font-bold text-white">{c.label}</p>
            <p className="mt-1.5 text-[0.9375rem] text-[var(--text-on-dark-soft)]">{c.detail}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ StorySection */

export function StorySection() {
  return (
    <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
      {STORY.map((s, i) => (
        <Reveal key={s.step} delay={i * 70} as="li" className="h-full">
          <div className="relative flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] lift">
            <span className="text-[0.8125rem] font-extrabold tracking-[0.12em] text-[var(--primary)]">
              {s.step}
            </span>
            <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
            <p className="mt-2.5 text-[0.9375rem] text-[var(--text-secondary)]">{s.body}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------ TrustSection */

export function TrustSection() {
  return (
    <div className="mt-14 grid gap-5 sm:grid-cols-2">
      {TRUST.map((t, i) => {
        const Icon = t.icon;
        return (
          <Reveal key={t.title} delay={i * 70}>
            <div className="flex h-full gap-5 rounded-[var(--radius-lg)] border border-[var(--border-on-dark)] bg-white/5 p-6 backdrop-blur-sm">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10">
                <Icon size={22} className="text-[var(--accent)]" strokeWidth={1.9} aria-hidden />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">{t.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-[var(--text-on-dark-soft)]">{t.body}</p>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------- Testimonials
 *
 * Deliberately empty of content. The brief forbids fabricating names, schools
 * or quotes, and the project has no verified testimonials, so this renders a
 * neutral invitation and accepts real data the moment it exists.
 */

export type Testimonial = { quote: string; name: string; role: string; school: string };

export function Testimonials({ items = [] as Testimonial[] }: { items?: Testimonial[] }) {
  if (items.length === 0) {
    return (
      <Reveal>
        <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-10 text-center">
          <Badge>Coming soon</Badge>
          <h3 className="mt-4 text-[var(--fs-h3)] font-bold">Customer stories</h3>
          <p className="mx-auto mt-3 max-w-xl text-[var(--text-secondary)]">
            We publish testimonials only from schools that have agreed to be named.
            If your school uses the platform and would like to share its experience,
            we would be glad to hear from you.
          </p>
          <ButtonLink to="/contact" variant="secondary" className="mt-6">
            Share your story
          </ButtonLink>
        </div>
      </Reveal>
    );
  }

  return (
    <div className="mt-14 grid gap-5 md:grid-cols-3">
      {items.map((t, i) => (
        <Reveal key={t.name} delay={i * 70}>
          <figure className="flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <blockquote className="flex-1 text-[var(--text-secondary)]">“{t.quote}”</blockquote>
            <figcaption className="mt-5 border-t border-[var(--border)] pt-4">
              <p className="font-bold">{t.name}</p>
              <p className="text-[0.875rem] text-[var(--text-muted)]">
                {t.role} · {t.school}
              </p>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------- CTASection */

export function CTASection({
  title = "See the platform on your own school's data",
  body = "We will walk through admissions, attendance, examinations and fees with your workflows, and answer questions about migration from your current system.",
  primary = { to: "/contact", label: "Request a Demo" },
  secondary,
}: {
  title?: string;
  body?: string;
  primary?: { to: string; label: string };
  secondary?: { to: string; label: string };
}) {
  return (
    <section className="site-section">
      <div className="site-shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] px-8 py-14 text-center shadow-[var(--shadow-xl)] sm:px-14">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--primary)] via-[var(--primary-dark)] to-[var(--indigo)]" />
            <div
              className="absolute inset-0 -z-10 opacity-25"
              style={{
                backgroundImage:
                  "radial-gradient(600px 240px at 20% 0%, rgba(255,255,255,0.45), transparent 60%)",
              }}
              aria-hidden
            />
            <h2 className="mx-auto max-w-2xl font-bold text-white" style={{ fontSize: "var(--fs-h2)" }}>
              {title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-white/85" style={{ fontSize: "var(--fs-lead)" }}>
              {body}
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink
                to={primary.to}
                size="lg"
                className="bg-white text-[var(--primary-dark)] shadow-none hover:bg-white/90"
              >
                {primary.label}
                <ArrowRight size={18} className="arrow" aria-hidden />
              </ButtonLink>
              {secondary ? (
                <ButtonLink to={secondary.to} variant="light" size="lg">
                  {secondary.label}
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- PageHeader */

export function PageHero({
  eyebrow,
  title,
  body,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  image: string;
  children?: ReactNode;
}) {
  return (
    <section className="site-dark relative overflow-hidden">
      <div className="absolute inset-0">
        <MediaImage src={image} alt="" position="center 45%" className="h-full w-full" loading="eager" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy-950)] via-[var(--navy-950)]/90 to-[var(--navy-950)]/60" />
      </div>
      <div className="site-shell relative z-10 py-20 lg:py-28">
        <Reveal>
          <Badge tone="onDark" className="uppercase tracking-[0.14em]">
            {eyebrow}
          </Badge>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 max-w-3xl font-extrabold text-white" style={{ fontSize: "var(--fs-hero)", lineHeight: 1.06 }}>
            {title}
          </h1>
        </Reveal>
        {body ? (
          <Reveal delay={160}>
            <p
              className="mt-6 max-w-2xl text-[var(--text-on-dark-soft)]"
              style={{ fontSize: "var(--fs-lead)", lineHeight: 1.6 }}
            >
              {body}
            </p>
          </Reveal>
        ) : null}
        {children ? <Reveal delay={240}>{children}</Reveal> : null}
      </div>
    </section>
  );
}

export { SectionHeader, Button, ButtonLink, Badge, Card, Eyebrow, Reveal, PRODUCT };
