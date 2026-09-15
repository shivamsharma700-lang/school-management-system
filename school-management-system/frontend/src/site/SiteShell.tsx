import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowRight, GraduationCap, Menu, X } from "lucide-react";
import { ButtonLink, cn } from "./ui";
import { PRODUCT } from "./content";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/features", label: "Features" },
  { to: "/modules", label: "Modules" },
  { to: "/solutions", label: "Solutions" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

function Wordmark({ onDark }: { onDark: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl shadow-[var(--shadow-primary)]",
          "bg-gradient-to-br from-[var(--primary)] to-[var(--indigo)]"
        )}
      >
        <GraduationCap size={21} className="text-white" strokeWidth={2.1} aria-hidden />
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block whitespace-nowrap text-[0.9375rem] font-extrabold tracking-[-0.01em]",
            onDark ? "text-white" : "text-[var(--text-primary)]"
          )}
        >
          {/* The full product name wraps to two lines on a phone and collides
              with the hero; the short form carries the same meaning there. */}
          <span className="sm:hidden">{PRODUCT.shortName}</span>
          <span className="hidden sm:inline">{PRODUCT.name}</span>
        </span>
        <span
          className={cn(
            "block text-[0.6875rem] font-semibold uppercase tracking-[0.13em]",
            onDark ? "text-white/60" : "text-[var(--text-muted)]"
          )}
        >
          {PRODUCT.vendorShort}
        </span>
      </span>
    </span>
  );
}

/**
 * Public marketing shell.
 *
 * `overlay` lets a page's hero sit under a transparent bar; the bar turns solid
 * on scroll. The portal shell is untouched — this only wraps public routes.
 */
export function SiteShell({ children, overlay = false }: { children: ReactNode; overlay?: boolean }) {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 20);
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu and return to the top on navigation.
  useEffect(() => {
    setMenu(false);
    pageRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  // Lock background scroll while the mobile sheet is open.
  useEffect(() => {
    if (!menu) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const transparent = overlay && !scrolled;

  return (
    <div
      ref={pageRef}
      className="site-theme public-page h-full overflow-y-auto overflow-x-hidden"
      data-anim="on"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[var(--primary)] focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      {/*
        Sticky reserves layout space, which pushed the hero down and left the
        white wordmark on a white bar. Overlay pages get a bar that genuinely
        floats above the hero; it becomes solid once the page scrolls.
      */}
      <header
        className={cn(
          "z-50 transition-[background-color,box-shadow,border-color] duration-300",
          overlay ? "fixed inset-x-0 top-0" : "sticky top-0",
          transparent
            ? "border-b border-transparent bg-transparent"
            : "border-b border-[var(--border)] bg-white/85 shadow-[var(--shadow-sm)] backdrop-blur-xl"
        )}
      >
        <div className="site-shell flex items-center justify-between gap-4 py-3">
          <Link to="/" aria-label={`${PRODUCT.name} home`}>
            <Wordmark onDark={transparent} />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={"end" in item ? item.end : undefined}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap rounded-full px-3 py-2 font-semibold transition",
                    "text-[var(--fs-nav)]",
                    transparent
                      ? isActive
                        ? "bg-white/15 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                      : isActive
                        ? "bg-[var(--surface-tint)] text-[var(--primary-dark)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-tint)] hover:text-[var(--text-primary)]"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className={cn(
                "hidden whitespace-nowrap rounded-full px-3 py-2 text-[var(--fs-nav)] font-semibold transition xl:inline-flex",
                transparent
                  ? "text-white/85 hover:bg-white/10 hover:text-white"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-tint)] hover:text-[var(--text-primary)]"
              )}
            >
              Sign in
            </Link>
            <ButtonLink to="/contact" className="hidden whitespace-nowrap sm:inline-flex">
              Request a Demo
              <ArrowRight size={16} className="arrow" aria-hidden />
            </ButtonLink>
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              aria-expanded={menu}
              aria-controls="site-mobile-nav"
              aria-label={menu ? "Close menu" : "Open menu"}
              className={cn(
                "grid h-11 w-11 place-items-center rounded-xl border transition lg:hidden",
                transparent
                  ? "border-white/25 bg-white/10 text-white"
                  : "border-[var(--border)] bg-white text-[var(--text-primary)]"
              )}
            >
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet: a real layout, not a squeezed desktop bar. */}
      {menu ? (
        <div
          id="site-mobile-nav"
          className="fixed inset-0 z-40 bg-[var(--navy-950)]/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMenu(false)}
        >
          <nav
            className="absolute inset-x-0 top-[68px] mx-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-xl)]"
            aria-label="Mobile"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={"end" in item ? item.end : undefined}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-semibold transition",
                    isActive
                      ? "bg-[var(--surface-tint)] text-[var(--primary-dark)]"
                      : "text-[var(--text-primary)] hover:bg-[var(--surface)]"
                  )
                }
              >
                {item.label}
                <ArrowRight size={16} className="text-[var(--text-muted)]" aria-hidden />
              </NavLink>
            ))}
            <div className="mt-2 grid gap-2 border-t border-[var(--border)] pt-3">
              <ButtonLink to="/contact" size="lg" className="w-full">
                Request a Demo
              </ButtonLink>
              <ButtonLink to="/login" variant="secondary" size="lg" className="w-full">
                Sign in to the portal
              </ButtonLink>
            </div>
          </nav>
        </div>
      ) : null}

      <main id="main">{children}</main>

      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  const columns = [
    {
      title: "Platform",
      links: [
        { to: "/features", label: "Features" },
        { to: "/modules", label: "Modules" },
        { to: "/solutions", label: "Solutions" },
        { to: "/login", label: "Sign in" },
      ],
    },
    {
      title: "Company",
      links: [
        { to: "/about", label: "About" },
        { to: "/contact", label: "Contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { to: "/privacy", label: "Privacy Policy" },
        { to: "/terms", label: "Terms of Use" },
      ],
    },
  ];

  return (
    <footer className="site-dark">
      <div className="site-shell py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_2fr]">
          <div className="max-w-sm">
            <span className="flex items-center gap-2.5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--indigo)]">
                <GraduationCap size={22} className="text-white" strokeWidth={2.1} aria-hidden />
              </span>
              <span className="text-base font-extrabold text-white">{PRODUCT.name}</span>
            </span>
            <p className="mt-5 text-[var(--text-on-dark-soft)]">{PRODUCT.footerBlurb}</p>
            <p className="mt-6 text-sm font-semibold text-white/55">
              An Application by {PRODUCT.vendor}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="text-[var(--text-on-dark-soft)] transition hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[var(--border-on-dark)] pt-7 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {PRODUCT.vendor}. All rights reserved.
          </p>
          <p>Built for schools across India.</p>
        </div>
      </div>
    </footer>
  );
}
