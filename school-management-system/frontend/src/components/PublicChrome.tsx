import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";
import { BrandMark } from "./brand";
import { NAV, PROGRAMMES } from "../pages/homeContent";
import { SCHOOL_NAME, SCHOOL_TAGLINE } from "../demo/config";

export function PublicChrome({ children, overlay }: { children: ReactNode; overlay?: boolean }) {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 24);
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !overlay || scrolled;

  return (
    <div ref={pageRef} className="public-page bg-canvas text-ink-900">
      <header
        className={`sticky top-0 z-40 transition duration-300 ${
          solid
            ? "border-b border-ink-900/8 bg-ink-950/95 text-white shadow-sm backdrop-blur-md"
            : "bg-transparent text-white"
        }`}
      >
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 py-3.5 sm:px-5 lg:px-10">
          <Link to="/" className="min-w-0 flex-1 text-left lg:flex-none" aria-label="Touch Wood High Public School home" onClick={() => setMenu(false)}>
            <BrandMark size={36} light />
          </Link>
          <nav className="hidden items-center gap-0.5 text-[13px] font-medium tracking-wide text-white/80 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap px-2.5 py-2 transition hover:text-white ${isActive ? "text-[#FFBE3D]" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden whitespace-nowrap bg-[#F0A500] px-4 py-2 text-[12px] font-semibold text-[#15151A] transition hover:bg-[#FFBE3D] sm:inline-block">
              School Portal
            </Link>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center bg-white/10 text-white lg:hidden"
              onClick={() => setMenu((v) => !v)}
              aria-label="Open menu"
            >
              {menu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {menu ? (
          <div className="max-h-[70vh] overflow-y-auto border-t border-white/10 bg-[#15151A] px-5 py-4 lg:hidden">
            <div className="grid gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="px-3 py-2.5 text-left text-sm text-white/90"
                  onClick={() => setMenu(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ) : null}
      </header>
      {children}
      <footer className="bg-ink-950 px-5 py-16 text-white/70 lg:px-10">
        <div className="mx-auto grid max-w-[1180px] gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandMark size={36} light />
            <p className="mt-5 max-w-xs text-sm leading-7">
              {SCHOOL_NAME}. {SCHOOL_TAGLINE}. CBSE co-educational day school from Nursery to Class XII across Delhi-NCR.
            </p>
            <p className="mt-5 text-sm">Mathura Road, New Delhi</p>
            <p className="text-sm">011-4300-1000 · Mon–Fri 8:30–15:30</p>
            <p className="text-sm">admissions.demo@touchwood.local</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gilt-400">Explore</p>
            <div className="mt-4 grid gap-2.5 text-sm">
              <Link to="/about" className="hover:text-white">About</Link>
              <Link to="/campus" className="hover:text-white">Campus</Link>
              <Link to="/student-life" className="hover:text-white">Student life</Link>
              <Link to="/sports" className="hover:text-white">Sports</Link>
              <Link to="/events" className="hover:text-white">Events</Link>
              <Link to="/gallery" className="hover:text-white">Gallery</Link>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gilt-400">Academics</p>
            <div className="mt-4 grid gap-2.5 text-sm">
              {PROGRAMMES.map((p) => (
                <Link key={p.title} to="/academics" className="hover:text-white">
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gilt-400">Admissions</p>
            <div className="mt-4 grid gap-2.5 text-sm">
              <Link to="/admissions" className="hover:text-white">Apply now</Link>
              <Link to="/transport" className="hover:text-white">Transport</Link>
              <Link to="/contact" className="hover:text-white">Contact</Link>
              <Link to="/login" className="text-gilt-400 hover:text-gilt-300">
                School Portal
              </Link>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Facebook", "Instagram", "YouTube"].map((net) => (
                  <button
                    key={net}
                    type="button"
                    className="rounded-full border border-white/15 px-3 py-1 text-[11px] hover:border-white/35"
                    onClick={() => toast.message("Social profiles are not published on this demo.")}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-[1180px] border-t border-white/10 pt-6 text-[11px] text-white/40">
          © 2026 Touch Wood High Public School. All rights reserved. Demo campuses and honour-board scores are fictional and isolated from production records.
        </p>
      </footer>
    </div>
  );
}
