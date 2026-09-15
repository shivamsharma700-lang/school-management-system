import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "./ui";
import { FieldMedia } from "./media";

export function SiteKicker({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.22em]", light ? "text-gilt-400" : "text-forest-600")}>
      {children}
    </p>
  );
}

export function SiteSection({
  children,
  className,
  id,
  tone = "ivory",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "ivory" | "white" | "ink" | "forest";
}) {
  const tones = {
    ivory: "bg-canvas text-ink-900",
    white: "bg-white text-ink-900",
    ink: "bg-ink-950 text-white",
    forest: "bg-forest-800 text-white",
  };
  return (
    <section id={id} className={cn("px-4 py-[var(--space-section-y)] sm:px-5 lg:px-10", tones[tone], className)}>
      <div className="mx-auto max-w-[1100px]">{children}</div>
    </section>
  );
}

export function SiteHeading({
  title,
  body,
  light,
  align = "left",
}: {
  title: string;
  body?: string;
  light?: boolean;
  align?: "left" | "center";
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center")}>
      <h2
        className={cn(
          "type-section mt-3 max-w-2xl font-display font-medium tracking-[-0.02em]",
          light ? "text-white" : "text-ink-900"
        )}
      >
        {title}
      </h2>
      {body ? (
        <p
          className={cn(
            "mt-3 max-w-xl text-sm leading-6 sm:text-[15px] sm:leading-7",
            light ? "text-white/75" : "text-slate-600",
            align === "center" && "mx-auto"
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

export function SiteCta({
  to,
  children,
  variant = "primary",
}: {
  to: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "light" | "gilt";
}) {
  const styles = {
    primary: "bg-ink-900 text-white hover:bg-ink-800",
    secondary: "border border-ink-900/15 bg-white text-ink-900 hover:border-ink-900/30",
    ghost: "text-ink-900 underline-offset-4 hover:underline",
    light: "border border-white/35 text-white hover:bg-white/10",
    gilt: "bg-gilt-600 text-ink-950 hover:bg-gilt-500",
  };
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold transition",
        variant === "ghost" ? "" : "tracking-wide",
        styles[variant]
      )}
    >
      {children}
    </Link>
  );
}

export function FeatureIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="mb-4 inline-flex h-11 w-11 items-center justify-center border border-forest-600/20 bg-forest-50 text-forest-700">
      <Icon size={18} strokeWidth={1.6} />
    </span>
  );
}

export function SplitFeature({
  kicker,
  title,
  body,
  image,
  alt,
  reverse,
  actions,
  tone = "white",
}: {
  kicker: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  reverse?: boolean;
  actions?: ReactNode;
  tone?: "white" | "ivory";
}) {
  return (
    <SiteSection tone={tone}>
      <div className={cn("grid items-center gap-10 lg:grid-cols-2 lg:gap-16", reverse && "lg:[&>*:first-child]:order-2")}>
        <div>
          <SiteKicker>{kicker}</SiteKicker>
          <SiteHeading title={title} body={body} />
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        <div className="overflow-hidden">
          <FieldMedia src={image} alt={alt} frame="section" loading="lazy" />
        </div>
      </div>
    </SiteSection>
  );
}
