import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

/* -------------------------------------------------------------------- Button */

type ButtonVariant = "primary" | "secondary" | "ghost" | "light";
type ButtonSize = "md" | "lg";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition duration-200 ease-out focus-visible:outline-none " +
  "disabled:cursor-not-allowed disabled:opacity-55 " +
  "active:translate-y-px [&_svg]:transition-transform [&:hover_svg.arrow]:translate-x-0.5";

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-white shadow-[var(--shadow-primary)] " +
    "hover:bg-[var(--primary-dark)] hover:-translate-y-0.5",
  secondary:
    "border border-[var(--border-strong)] bg-white text-[var(--text-primary)] " +
    "hover:border-[var(--primary)] hover:text-[var(--primary-dark)] hover:-translate-y-0.5",
  ghost:
    "text-[var(--text-secondary)] hover:bg-[var(--surface-tint)] hover:text-[var(--text-primary)]",
  // For dark/photographic grounds.
  light:
    "border border-white/25 bg-white/10 text-white backdrop-blur-md " +
    "hover:bg-white/20 hover:-translate-y-0.5",
};

const BUTTON_SIZE: Record<ButtonSize, string> = {
  md: "px-5 py-2.5 text-[0.9375rem]",
  lg: "px-7 py-3.5 text-base",
};

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>
>(function Button({ variant = "primary", size = "md", className, children, ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={cn(BUTTON_BASE, BUTTON_VARIANT[variant], BUTTON_SIZE[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
});

export function ButtonLink({
  to,
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps & { to?: string; href?: string } & Record<string, unknown>) {
  const classes = cn(BUTTON_BASE, BUTTON_VARIANT[variant], BUTTON_SIZE[size], className);
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to ?? "#"} className={classes} {...rest}>
      {children}
    </Link>
  );
}

/* --------------------------------------------------------------------- Badge */

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "onDark";
  className?: string;
}) {
  const tones = {
    default:
      "border-[var(--border)] bg-[var(--surface-tint)] text-[var(--primary-dark)]",
    accent: "border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[#7a5206]",
    onDark: "border-white/20 bg-white/10 text-white backdrop-blur-md",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.8125rem] font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------- Eyebrow */

export function Eyebrow({
  children,
  onDark = false,
  className,
}: {
  children: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[0.8125rem] font-bold uppercase tracking-[0.16em]",
        onDark ? "text-[var(--accent)]" : "text-[var(--primary)]",
        className
      )}
    >
      {children}
    </p>
  );
}

/* ----------------------------------------------------------- SectionHeader */

export function SectionHeader({
  eyebrow,
  title,
  body,
  align = "left",
  onDark = false,
  className,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
  onDark?: boolean;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "mx-auto max-w-3xl text-center items-center",
        Boolean(action) && "md:flex-row md:items-end md:justify-between md:gap-10",
        className
      )}
    >
      <div className={cn("flex flex-col gap-3", align === "center" && "items-center")}>
        {eyebrow ? <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow> : null}
        <h2
          className="font-bold"
          style={{ fontSize: "var(--fs-h2)" }}
        >
          {title}
        </h2>
        {body ? (
          <p
            className={cn(
              "max-w-2xl",
              onDark ? "text-[var(--text-on-dark-soft)]" : "text-[var(--text-secondary)]"
            )}
            style={{ fontSize: "var(--fs-lead)", lineHeight: 1.6 }}
          >
            {body}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------- GlassCard */

export function GlassCard({
  children,
  className,
  tone = "light",
  float,
}: {
  children: ReactNode;
  className?: string;
  tone?: "light" | "dark";
  /** Stagger for the idle float animation, in ms. */
  float?: number;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] p-4",
        tone === "light" ? "glass-light text-[var(--text-primary)]" : "glass text-white",
        float !== undefined && "floaty",
        className
      )}
      style={float !== undefined ? ({ "--delay": `${float}ms` } as never) : undefined}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------- Card */

export function Card({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-sm)]",
        interactive && "lift",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------- Reveal */

/**
 * Entrance wrapper. The offset is applied by CSS only when the shell has set
 * `data-anim="on"`, so content is never hidden if JS does not run.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  return (
    <Tag className={cn("reveal", className)} style={{ "--delay": `${delay}ms` } as never}>
      {children}
    </Tag>
  );
}
