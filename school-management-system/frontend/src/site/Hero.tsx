import { ArrowRight, BellRing, CheckCircle2, IndianRupee, PlayCircle, TrendingUp } from "lucide-react";
import { MediaImage } from "../components/media";
import { SCHOOL } from "../lib/schoolMedia";
import { AUDIENCES, PRODUCT } from "./content";
import { Badge, ButtonLink, GlassCard, Reveal } from "./ui";

/**
 * Hero: Indian school photography as the ground, with the product's own surfaces
 * floating above it in perspective.
 *
 * The 3D here is CSS transforms on real DOM, not WebGL — it composites on the
 * GPU, stays crisp at every density, works without a graphics context and costs
 * nothing on mobile, where the stack flattens to a single readable card.
 */
export function Hero() {
  return (
    <section className="site-dark relative overflow-hidden">
      {/* Photographic ground */}
      <div className="absolute inset-0">
        <MediaImage
          src={SCHOOL.campus.hero}
          alt=""
          position="center 42%"
          className="h-full w-full"
          loading="eager"
          sizes="100vw"
        />
        {/* Two scrims: a horizontal one to protect the copy column, a vertical
            one to seat the composition. Both use valid opacity steps. */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy-950)] via-[var(--navy-950)]/85 to-[var(--navy-950)]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-950)] via-transparent to-[var(--navy-950)]/70" />
      </div>

      <div className="site-shell relative z-10 grid items-center gap-14 pb-20 pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28 lg:pt-24">
        {/* ------------------------------------------------------------ copy */}
        <div>
          <Reveal delay={0}>
            <Badge tone="onDark" className="uppercase tracking-[0.14em]">
              {PRODUCT.eyebrow}
            </Badge>
          </Reveal>

          <Reveal delay={80}>
            <h1
              className="mt-6 font-extrabold text-white"
              style={{ fontSize: "var(--fs-hero)", lineHeight: 1.04 }}
            >
              Empowering Schools With{" "}
              <span className="bg-gradient-to-r from-[var(--accent)] to-[#ffd489] bg-clip-text text-transparent">
                Smarter Management
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p
              className="mt-6 max-w-xl text-[var(--text-on-dark-soft)]"
              style={{ fontSize: "var(--fs-lead)", lineHeight: 1.6 }}
            >
              {PRODUCT.subhead}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3" aria-label="Who the platform connects">
              {AUDIENCES.map(({ label, icon: Icon }) => (
                <li key={label} className="flex items-center gap-2 text-[0.9375rem] font-semibold text-white/85">
                  <Icon size={17} className="text-[var(--accent)]" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink to="/contact" size="lg">
                Request a Demo
                <ArrowRight size={18} className="arrow" aria-hidden />
              </ButtonLink>
              <ButtonLink to="/features" variant="light" size="lg">
                <PlayCircle size={18} aria-hidden />
                Explore Platform
              </ButtonLink>
            </div>
          </Reveal>
        </div>

        {/* --------------------------------------------------- product stack */}
        <Reveal delay={260} className="depth-scene hidden lg:block">
          <div className="depth-card relative mx-auto aspect-[4/3.4] w-full max-w-[520px]">
            {/* Anchor: a real screen from the product's visual language */}
            <GlassCard tone="light" className="absolute inset-x-0 top-10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Attendance today
                  </p>
                  <p className="mt-1 text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                    94.8%
                  </p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--surface-tint)]">
                  <CheckCircle2 size={22} className="text-[var(--primary)]" aria-hidden />
                </span>
              </div>
              {/* Simple, honest bar strip — not a fake chart library render */}
              <div className="mt-5 flex items-end gap-1.5" aria-hidden>
                {[62, 78, 55, 88, 72, 95, 84, 91, 68, 80, 94, 76].map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-[var(--primary)] to-[var(--primary-light)]"
                    style={{ height: `${h * 0.5}px`, opacity: 0.35 + (h / 100) * 0.65 }}
                  />
                ))}
              </div>
              <p className="mt-3 text-[0.8125rem] text-[var(--text-secondary)]">
                Class-wise marking across 8 campuses
              </p>
            </GlassCard>

            {/* Fee card, pushed forward */}
            <GlassCard
              tone="light"
              float={0}
              className="absolute -left-8 bottom-8 w-[248px] p-4 shadow-[var(--shadow-xl)]"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f7ee]">
                  <IndianRupee size={17} className="text-[#1a7f4b]" aria-hidden />
                </span>
                <p className="text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Fees collected
                </p>
              </div>
              <p className="mt-3 text-2xl font-extrabold text-[var(--text-primary)]">₹29.04 Cr</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-tint)]">
                <span className="block h-full w-[79%] rounded-full bg-gradient-to-r from-[#1a7f4b] to-[#38b26b]" />
              </div>
              <p className="mt-2 text-[0.8125rem] text-[var(--text-secondary)]">79% of billed</p>
            </GlassCard>

            {/* Performance card */}
            <GlassCard
              tone="light"
              float={900}
              className="absolute -right-6 top-0 w-[216px] p-4 shadow-[var(--shadow-xl)]"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--surface-tint)]">
                  <TrendingUp size={17} className="text-[var(--indigo)]" aria-hidden />
                </span>
                <p className="text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Performance
                </p>
              </div>
              <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">Class X · Term II</p>
              <div className="mt-3 space-y-2" aria-hidden>
                {[["Science", 88], ["Maths", 81], ["English", 92]].map(([s, v]) => (
                  <div key={s as string} className="flex items-center gap-2">
                    <span className="w-16 text-[0.75rem] text-[var(--text-secondary)]">{s}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-tint)]">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--indigo)]"
                        style={{ width: `${v}%` }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Notification pill, closest to the viewer */}
            <GlassCard
              tone="dark"
              float={1800}
              className="absolute -right-2 bottom-0 flex w-[232px] items-center gap-3 p-3.5"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent)]/20">
                <BellRing size={17} className="text-[var(--accent)]" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[0.8125rem] font-bold text-white">Notice published</p>
                <p className="truncate text-[0.75rem] text-white/65">Sent to all parents</p>
              </div>
            </GlassCard>
          </div>
        </Reveal>

        {/* Mobile: one honest card rather than a squashed 3D stack */}
        <Reveal delay={260} className="lg:hidden">
          <GlassCard tone="light" className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Attendance today
                </p>
                <p className="mt-1 text-3xl font-extrabold text-[var(--text-primary)]">94.8%</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--surface-tint)]">
                <CheckCircle2 size={22} className="text-[var(--primary)]" aria-hidden />
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[var(--surface)] p-3">
                <p className="text-[0.75rem] font-semibold text-[var(--text-muted)]">Fees collected</p>
                <p className="mt-0.5 text-lg font-extrabold text-[var(--text-primary)]">₹29.04 Cr</p>
              </div>
              <div className="rounded-xl bg-[var(--surface)] p-3">
                <p className="text-[0.75rem] font-semibold text-[var(--text-muted)]">Campuses</p>
                <p className="mt-0.5 text-lg font-extrabold text-[var(--text-primary)]">8</p>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
