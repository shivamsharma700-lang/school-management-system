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
    <div ref={pageRef} className="public-page bg-[#f4f1ea] text-slate-800">
      <header
        className={`sticky top-0 z-40 text-white transition ${
          solid ? "border-b border-white/10 bg-[#07131c]/95 shadow-sm backdrop-blur-md" : "bg-[#07131c]/35 backdrop-blur-[2px]"
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-3 lg:px-10">
          <Link to="/" className="text-left" aria-label="Delhi Public School home" onClick={() => setMenu(false)}>
            <BrandMark size={42} light />
          </Link>
          <nav className="hidden items-center gap-4 text-[12px] font-semibold text-white/85 xl:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => `transition hover:text-gilt-400 ${isActive ? "text-gilt-400" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-full bg-gilt-600 px-3 py-2 text-[11px] font-semibold text-[#07131c] sm:px-4 sm:text-xs">
              Login / School Portal
            </Link>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white xl:hidden" onClick={() => setMenu((v) => !v)} aria-label="Open menu">
              {menu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {menu ? (
          <div className="border-t border-white/10 bg-[#07131c] px-5 py-4 xl:hidden">
            <div className="grid gap-2">
              {NAV.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === "/"} className="rounded-xl px-3 py-2 text-left text-sm text-white/90" onClick={() => setMenu(false)}>
                  {item.label}
                </NavLink>
              ))}
              <Link to="/login" className="mt-2 rounded-full bg-gilt-600 px-4 py-2.5 text-center text-sm font-semibold text-[#07131c]" onClick={() => setMenu(false)}>
                Login / School Portal
              </Link>
            </div>
          </div>
        ) : null}
      </header>
      {children}
      <footer className="bg-[#07131c] px-5 py-14 text-white/75 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandMark size={40} light />
            <p className="mt-4 max-w-xs text-sm leading-6">
              {SCHOOL_NAME}. {SCHOOL_TAGLINE}. A CBSE school group for Nursery to Class 12.
            </p>
            <p className="mt-4 text-sm text-white/70">Mathura Road, New Delhi</p>
            <p className="text-sm text-white/70">011-4300-1000</p>
            <p className="text-sm text-white/70">admissions.demo@dps.local</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gilt-400">Quick links</p>
            <div className="mt-3 grid gap-2 text-sm">
              <Link to="/about">About</Link>
              <Link to="/campus">Campus</Link>
              <Link to="/events">Events</Link>
              <Link to="/gallery">Gallery</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gilt-400">Academics</p>
            <div className="mt-3 grid gap-2 text-sm">
              {PROGRAMMES.map((p) => (
                <Link key={p.title} to="/academics">
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gilt-400">Admissions</p>
            <div className="mt-3 grid gap-2 text-sm">
              <Link to="/admissions">Apply now</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/login" className="text-gilt-400">
                Login / Portal
              </Link>
              <div className="mt-3 flex gap-2">
                {["Facebook", "Instagram", "YouTube"].map((net) => (
                  <button key={net} type="button" className="rounded-full border border-white/20 px-3 py-1 text-[11px]" onClick={() => toast.message("Social profiles are not published on this demo.")}>
                    {net}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-[1280px] border-t border-white/10 pt-5 text-[11px] text-white/45">
          © 2026 Delhi Public School. All rights reserved. Demo campuses and honour-board scores are fictional and isolated from production records.
        </p>
      </footer>
    </div>
  );
}
