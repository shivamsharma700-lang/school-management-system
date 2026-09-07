import { useId, type ReactNode, SVGProps } from "react";

export type GlyphName =
  | "dashboard"
  | "campus"
  | "users"
  | "calendar"
  | "settings"
  | "audit"
  | "admissions"
  | "enquiry"
  | "document"
  | "exam"
  | "student"
  | "parent"
  | "teacher"
  | "staff"
  | "class"
  | "subject"
  | "timetable"
  | "homework"
  | "attendance"
  | "fees"
  | "library"
  | "bus"
  | "notice"
  | "leave"
  | "report"
  | "event"
  | "health"
  | "sports"
  | "lab"
  | "hostel"
  | "canteen"
  | "inventory";

export type GlyphTone = "brand" | "sidebar" | "light";

function Svg({ children, className, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={["h-full w-full", className].filter(Boolean).join(" ")} aria-hidden {...props}>
      {children}
    </svg>
  );
}

function Shell({ children, gid, tone }: { children: ReactNode; gid: string; tone: GlyphTone }) {
  /** Floating cream pedestals on every surface — dark tiles washed out on the sidebar. */
  const nav = tone === "sidebar";
  return (
    <>
      <defs>
        <linearGradient id={`${gid}-base`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="48%" stopColor="#f5faf7" />
          <stop offset="100%" stopColor="#d8ebe1" />
        </linearGradient>
        <linearGradient id={`${gid}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4dfa0" stopOpacity={nav ? 0.95 : 0.8} />
          <stop offset="50%" stopColor="#c5a059" stopOpacity={nav ? 0.75 : 0.5} />
          <stop offset="100%" stopColor="#7a5a22" stopOpacity={nav ? 0.55 : 0.32} />
        </linearGradient>
        <linearGradient id={`${gid}-forest`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#2fd48a" />
          <stop offset="45%" stopColor="#0f8f58" />
          <stop offset="100%" stopColor="#053321" />
        </linearGradient>
        <linearGradient id={`${gid}-forest-side`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a5c3a" />
          <stop offset="100%" stopColor="#03180f" />
        </linearGradient>
        <linearGradient id={`${gid}-gilt`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#ffe9b0" />
          <stop offset="40%" stopColor="#d4af61" />
          <stop offset="100%" stopColor="#8a6424" />
        </linearGradient>
        <linearGradient id={`${gid}-gilt-side`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8893a" />
          <stop offset="100%" stopColor="#5c4014" />
        </linearGradient>
        <linearGradient id={`${gid}-cream`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e4eee8" />
        </linearGradient>
        <linearGradient id={`${gid}-skin`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#f8d2b0" />
          <stop offset="100%" stopColor="#c88858" />
        </linearGradient>
        <linearGradient id={`${gid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9fd7ff" />
          <stop offset="100%" stopColor="#2a6fa8" />
        </linearGradient>
        <filter id={`${gid}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy={nav ? 3.5 : 3.2} stdDeviation={nav ? 2.8 : 2.4} floodColor="#000000" floodOpacity={nav ? 0.5 : 0.22} />
        </filter>
        <filter id={`${gid}-lift`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#04180f" floodOpacity="0.28" />
        </filter>
        <radialGradient id={`${gid}-glow`} cx="32%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="32" cy="57.5" rx={nav ? 16 : 17} ry="3.4" fill="#000" opacity={nav ? 0.42 : 0.14} />

      <g filter={`url(#${gid}-soft)`}>
        {/* Pedestal body */}
        <rect x="7" y="7" width="50" height="46" rx="15" fill={`url(#${gid}-base)`} />
        <rect x="7" y="7" width="50" height="46" rx="15" fill={`url(#${gid}-glow)`} />
        <rect x="7.6" y="7.6" width="48.8" height="44.8" rx="14.2" fill="none" stroke={`url(#${gid}-rim)`} strokeWidth="1.6" />
        {/* Top specular edge */}
        <path d="M14 15c5-7 31-7 36 0" stroke="#fff" strokeOpacity="0.75" strokeWidth="2.2" strokeLinecap="round" />
        {/* Inner shelf */}
        <rect x="12" y="12" width="40" height="36" rx="11" fill="rgba(5,51,33,0.03)" />
        <g filter={`url(#${gid}-lift)`} transform="translate(0,-1)">
          {children}
        </g>
      </g>
    </>
  );
}

/** Shared bevel helpers */
function Block({
  x,
  y,
  w,
  h,
  rx = 2.5,
  face,
  side,
  depth = 3,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  rx?: number;
  face: string;
  side: string;
  depth?: number;
}) {
  return (
    <>
      <rect x={x} y={y + depth} width={w} height={h} rx={rx} fill={side} />
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={face} />
      <path d={`M${x + 2} ${y + 2.2}h${w - 4}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round" />
    </>
  );
}

const MARKS: Record<GlyphName, (gid: string) => ReactNode> = {
  dashboard: (gid) => (
    <>
      <Block x={17} y={30} w={9} h={14} face={`url(#${gid}-cream)`} side={`url(#${gid}-forest-side)`} />
      <Block x={28} y={24} w={9} h={20} face={`url(#${gid}-forest)`} side={`url(#${gid}-forest-side)`} />
      <Block x={39} y={18} w={8} h={26} face={`url(#${gid}-gilt)`} side={`url(#${gid}-gilt-side)`} />
      <rect x={17} y={46} width={30} height={2.5} rx={1.2} fill="#053321" opacity="0.22" />
    </>
  ),
  campus: (gid) => (
    <>
      <path d="M14 42V30l18-12 18 12v12" fill={`url(#${gid}-forest-side)`} />
      <path d="M14 40V28l18-12 18 12v12" fill={`url(#${gid}-forest)`} />
      <path d="M14 28l18-12 18 12" fill={`url(#${gid}-gilt)`} />
      <path d="M20 28l12-8 12 8" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
      <rect x="28" y="32" width="8" height="12" rx="1.5" fill={`url(#${gid}-cream)`} />
      <rect x="20" y="31" width="5" height="5" rx="1" fill="#fff" opacity="0.55" />
      <rect x="39" y="31" width="5" height="5" rx="1" fill="#fff" opacity="0.55" />
    </>
  ),
  users: (gid) => (
    <>
      <circle cx="23" cy="23" r="6.5" fill={`url(#${gid}-skin)`} />
      <circle cx="41" cy="23" r="6.5" fill={`url(#${gid}-skin)`} />
      <ellipse cx="23" cy="20.5" rx="3" ry="1.4" fill="#fff" opacity="0.35" />
      <ellipse cx="41" cy="20.5" rx="3" ry="1.4" fill="#fff" opacity="0.35" />
      <path d="M12 44c1.5-9 8-13 20-13s18.5 4 20 13" fill={`url(#${gid}-forest-side)`} />
      <path d="M12 42c1.5-9 8-13 20-13s18.5 4 20 13" fill={`url(#${gid}-forest)`} />
      <path d="M22 42c1-5.5 5-8 10-8s9 2.5 10 8" fill={`url(#${gid}-gilt)`} />
    </>
  ),
  calendar: (gid) => (
    <>
      <rect x="15" y="22" width="34" height="26" rx="5" fill={`url(#${gid}-forest-side)`} />
      <rect x="15" y="20" width="34" height="26" rx="5" fill={`url(#${gid}-cream)`} />
      <rect x="15" y="20" width="34" height="9" rx="5" fill={`url(#${gid}-forest)`} />
      <rect x="15" y="25" width="34" height="4" fill={`url(#${gid}-forest)`} />
      <circle cx="24" cy="36" r="2.2" fill={`url(#${gid}-gilt)`} />
      <circle cx="32" cy="36" r="2.2" fill="#053321" opacity="0.28" />
      <circle cx="40" cy="36" r="2.2" fill="#053321" opacity="0.28" />
      <rect x="21" y="15" width="3.5" height="9" rx="1.7" fill={`url(#${gid}-gilt)`} />
      <rect x="39" y="15" width="3.5" height="9" rx="1.7" fill={`url(#${gid}-gilt)`} />
    </>
  ),
  settings: (gid) => (
    <>
      <circle cx="32" cy="33" r="13" fill={`url(#${gid}-forest-side)`} />
      <circle cx="32" cy="31" r="13" fill={`url(#${gid}-forest)`} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <rect key={deg} x="30" y="15" width="4" height="7" rx="2" fill={`url(#${gid}-gilt)`} transform={`rotate(${deg} 32 31)`} />
      ))}
      <circle cx="32" cy="31" r="6" fill={`url(#${gid}-cream)`} />
      <circle cx="32" cy="31" r="3" fill={`url(#${gid}-gilt)`} />
      <circle cx="30.5" cy="29.2" r="1.2" fill="#fff" opacity="0.45" />
    </>
  ),
  audit: (gid) => (
    <>
      <rect x="19" y="18" width="24" height="28" rx="3.5" fill={`url(#${gid}-forest-side)`} />
      <rect x="19" y="16" width="24" height="28" rx="3.5" fill={`url(#${gid}-cream)`} />
      <path d="M24 24h14M24 30h14M24 36h10" stroke="#053321" strokeWidth="2.1" strokeLinecap="round" opacity="0.4" />
      <circle cx="42" cy="40" r="8" fill={`url(#${gid}-forest-side)`} />
      <circle cx="42" cy="38.5" r="8" fill={`url(#${gid}-forest)`} />
      <path d="M38.5 38.5l2.4 2.4 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  admissions: (gid) => (
    <>
      <path d="M32 13l17 9v13c0 11-11 17-17 19-6-2-17-8-17-19V22z" fill={`url(#${gid}-forest-side)`} />
      <path d="M32 12l17 9v13c0 11-11 17-17 19-6-2-17-8-17-19V21z" fill={`url(#${gid}-forest)`} />
      <path d="M32 16l12.5 6.5v10c0 8.5-8 13.5-12.5 15-4.5-1.5-12.5-6.5-12.5-15v-10z" fill="#fff" opacity="0.14" />
      <rect x="29" y="28" width="6" height="13" rx="1.5" fill={`url(#${gid}-gilt)`} />
      <path d="M23 31h18l-9-8z" fill={`url(#${gid}-gilt)`} />
    </>
  ),
  enquiry: (gid) => (
    <>
      <path d="M13 22h31a5 5 0 015 5v11a5 5 0 01-5 5H29l-8 7v-7h-8a5 5 0 01-5-5V27a5 5 0 015-5z" fill={`url(#${gid}-forest-side)`} />
      <path d="M13 20h31a5 5 0 015 5v11a5 5 0 01-5 5H29l-8 7v-7h-8a5 5 0 01-5-5V25a5 5 0 015-5z" fill={`url(#${gid}-cream)`} />
      <circle cx="25" cy="31" r="2.3" fill={`url(#${gid}-forest)`} />
      <circle cx="32" cy="31" r="2.3" fill={`url(#${gid}-gilt)`} />
      <circle cx="39" cy="31" r="2.3" fill={`url(#${gid}-forest)`} />
    </>
  ),
  document: (gid) => (
    <>
      <path d="M19 16h17l11 11v21a3.5 3.5 0 01-3.5 3.5H19A3.5 3.5 0 0115.5 48V19.5A3.5 3.5 0 0119 16z" fill={`url(#${gid}-forest-side)`} />
      <path d="M19 14h17l11 11v21a3.5 3.5 0 01-3.5 3.5H19A3.5 3.5 0 0115.5 46V17.5A3.5 3.5 0 0119 14z" fill={`url(#${gid}-cream)`} />
      <path d="M36 14v11h11" fill={`url(#${gid}-gilt)`} />
      <path d="M23 32h16M23 38h12" stroke="#053321" strokeWidth="2.1" strokeLinecap="round" opacity="0.35" />
    </>
  ),
  exam: (gid) => (
    <>
      <rect x="17" y="16" width="30" height="34" rx="5" fill={`url(#${gid}-forest-side)`} />
      <rect x="17" y="14" width="30" height="34" rx="5" fill={`url(#${gid}-cream)`} />
      <path d="M24 27l5.5 5.5 11-12" stroke={`url(#${gid}-forest)`} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="24" y="40" width="16" height="3.5" rx="1.7" fill={`url(#${gid}-gilt)`} />
    </>
  ),
  student: (gid) => (
    <>
      <circle cx="32" cy="22" r="8.5" fill={`url(#${gid}-skin)`} />
      <ellipse cx="29" cy="19.5" rx="3.2" ry="1.5" fill="#fff" opacity="0.35" />
      <path d="M19 20c4.5-9 21-9 26 2" stroke="#2a1f16" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M18 48c1-10 7-14 14-14s13 4 14 14" fill={`url(#${gid}-forest-side)`} />
      <path d="M18 46c1-10 7-14 14-14s13 4 14 14" fill={`url(#${gid}-forest)`} />
      <rect x="26" y="36" width="12" height="3.2" rx="1.5" fill={`url(#${gid}-gilt)`} />
    </>
  ),
  parent: (gid) => (
    <>
      <circle cx="23" cy="21" r="7.5" fill={`url(#${gid}-skin)`} />
      <circle cx="43" cy="25" r="6" fill={`url(#${gid}-skin)`} />
      <ellipse cx="21" cy="18.5" rx="2.8" ry="1.3" fill="#fff" opacity="0.35" />
      <path d="M10 47c2-11 9-15 22-15 4 0 8 1.2 11.5 3.2 3.2-1.2 6.2-.2 9.5 2.2 3.5 8 3.5 9.6 3.5 9.6H10z" fill={`url(#${gid}-forest)`} />
    </>
  ),
  teacher: (gid) => (
    <>
      <circle cx="32" cy="20" r="8.5" fill={`url(#${gid}-skin)`} />
      <path d="M21 18c3.5-6 18-6 22 1.5" stroke="#2a1f16" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M16 48c1-11 8-15 16-15s15 4 16 15" fill={`url(#${gid}-cream)`} />
      <rect x="12" y="32" width="9" height="14" rx="3.5" fill={`url(#${gid}-gilt)`} />
      <rect x="26" y="36" width="12" height="3.2" rx="1.5" fill={`url(#${gid}-forest)`} />
    </>
  ),
  staff: (gid) => (
    <>
      <circle cx="32" cy="20" r="7.5" fill={`url(#${gid}-skin)`} />
      <path d="M16 46c1-10 8-14 16-14s15 4 16 14" fill={`url(#${gid}-forest-side)`} />
      <path d="M16 44c1-10 8-14 16-14s15 4 16 14" fill={`url(#${gid}-forest)`} />
      <path d="M23 37h18" stroke={`url(#${gid}-gilt)`} strokeWidth="3.2" strokeLinecap="round" />
    </>
  ),
  class: (gid) => (
    <>
      <rect x="11" y="26" width="42" height="20" rx="3.5" fill={`url(#${gid}-forest-side)`} />
      <rect x="11" y="24" width="42" height="20" rx="3.5" fill={`url(#${gid}-cream)`} />
      <rect x="14" y="27" width="36" height="12" rx="2" fill="#053321" opacity="0.78" />
      <path d="M16 29h32" stroke="#2fd48a" strokeOpacity="0.35" strokeWidth="1.5" />
      <rect x="26" y="42" width="12" height="6" fill={`url(#${gid}-gilt)`} />
      <rect x="19" y="17" width="26" height="5" rx="2.5" fill={`url(#${gid}-forest)`} />
    </>
  ),
  subject: (gid) => (
    <>
      <rect x="15" y="20" width="12" height="28" rx="2.5" transform="rotate(-14 21 34)" fill={`url(#${gid}-forest-side)`} />
      <rect x="15" y="18" width="12" height="28" rx="2.5" transform="rotate(-14 21 32)" fill={`url(#${gid}-forest)`} />
      <rect x="26" y="18" width="12" height="28" rx="2.5" transform="rotate(-6 32 32)" fill={`url(#${gid}-gilt-side)`} />
      <rect x="26" y="16" width="12" height="28" rx="2.5" transform="rotate(-6 32 30)" fill={`url(#${gid}-gilt)`} />
      <rect x="37" y="20" width="12" height="28" rx="2.5" fill={`url(#${gid}-forest-side)`} />
      <rect x="37" y="18" width="12" height="28" rx="2.5" fill={`url(#${gid}-cream)`} />
    </>
  ),
  timetable: (gid) => (
    <>
      <rect x="13" y="18" width="38" height="30" rx="5" fill={`url(#${gid}-forest-side)`} />
      <rect x="13" y="16" width="38" height="30" rx="5" fill={`url(#${gid}-cream)`} />
      <path d="M13 24h38M26 16v30M38 16v30" stroke="#053321" strokeWidth="1.7" opacity="0.22" />
      <rect x="16" y="27" width="8" height="5.5" rx="1.2" fill={`url(#${gid}-forest)`} />
      <rect x="28" y="33" width="8" height="5.5" rx="1.2" fill={`url(#${gid}-gilt)`} />
    </>
  ),
  homework: (gid) => (
    <>
      <rect x="15" y="16" width="30" height="34" rx="5" fill={`url(#${gid}-forest-side)`} />
      <rect x="15" y="14" width="30" height="34" rx="5" fill={`url(#${gid}-cream)`} />
      <path d="M22 24h16M22 30h16M22 36h12" stroke="#053321" strokeWidth="2.1" strokeLinecap="round" opacity="0.32" />
      <path d="M40 38l7 2.2-2.2 7-7-2.2z" fill={`url(#${gid}-gilt-side)`} />
      <path d="M40 36.5l7 2.2-2.2 7-7-2.2z" fill={`url(#${gid}-gilt)`} />
    </>
  ),
  attendance: (gid) => (
    <>
      <rect x="15" y="16" width="30" height="34" rx="5" fill={`url(#${gid}-forest-side)`} />
      <rect x="15" y="14" width="30" height="34" rx="5" fill={`url(#${gid}-cream)`} />
      <circle cx="32" cy="31" r="11" fill={`url(#${gid}-forest)`} opacity="0.12" />
      <path d="M23 31l5.5 5.5 11-13" stroke={`url(#${gid}-forest)`} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  fees: (gid) => (
    <>
      <circle cx="32" cy="33" r="16.5" fill={`url(#${gid}-gilt-side)`} />
      <circle cx="32" cy="31" r="16.5" fill={`url(#${gid}-gilt)`} />
      <circle cx="32" cy="31" r="11.5" fill={`url(#${gid}-cream)`} />
      <path
        d="M32 21.5v19M26.5 26c2.2-2.2 11-2.2 11 3.2s-11 3.2-11 7.5 8 4.2 11 2"
        stroke={`url(#${gid}-forest)`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <ellipse cx="27" cy="25" rx="4" ry="2" fill="#fff" opacity="0.35" />
    </>
  ),
  library: (gid) => (
    <>
      <Block x={13} y={18} w={10} h={26} face={`url(#${gid}-forest)`} side={`url(#${gid}-forest-side)`} depth={2.5} />
      <Block x={26} y={14} w={10} h={30} face={`url(#${gid}-gilt)`} side={`url(#${gid}-gilt-side)`} depth={2.5} />
      <Block x={39} y={20} w={10} h={24} face={`url(#${gid}-cream)`} side={`url(#${gid}-forest-side)`} depth={2.5} />
      <rect x="13" y="46" width="36" height={3} rx={1.5} fill="#053321" opacity="0.2" />
    </>
  ),
  bus: (gid) => (
    <>
      <rect x="9" y="24" width="46" height="20" rx="7" fill={`url(#${gid}-gilt-side)`} />
      <rect x="9" y="22" width="46" height="20" rx="7" fill={`url(#${gid}-gilt)`} />
      <rect x="13" y="26" width="13" height="8" rx="2" fill={`url(#${gid}-sky)`} />
      <rect x="28" y="26" width="13" height="8" rx="2" fill={`url(#${gid}-sky)`} />
      <rect x="9" y="36" width="46" height="5.5" fill={`url(#${gid}-forest)`} />
      <circle cx="20" cy="45" r="5" fill="#1a1a1a" />
      <circle cx="44" cy="45" r="5" fill="#1a1a1a" />
      <circle cx="20" cy="45" r="2" fill={`url(#${gid}-gilt)`} />
      <circle cx="44" cy="45" r="2" fill={`url(#${gid}-gilt)`} />
      <rect x="49" y="28" width="4.5" height="6" rx="1.2" fill={`url(#${gid}-forest)`} />
      <path d="M12 24h40" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.6" />
    </>
  ),
  notice: (gid) => (
    <>
      <path d="M17 18h23l11 11v22H17a4.5 4.5 0 01-4.5-4.5V22.5A4.5 4.5 0 0117 18z" fill={`url(#${gid}-forest-side)`} />
      <path d="M17 16h23l11 11v22H17a4.5 4.5 0 01-4.5-4.5V20.5A4.5 4.5 0 0117 16z" fill={`url(#${gid}-cream)`} />
      <path d="M40 16v11h11" fill={`url(#${gid}-gilt)`} />
      <circle cx="32" cy="34" r="4.5" fill={`url(#${gid}-forest)`} />
    </>
  ),
  leave: (gid) => (
    <>
      <rect x="15" y="20" width="34" height="28" rx="5" fill={`url(#${gid}-forest-side)`} />
      <rect x="15" y="18" width="34" height="28" rx="5" fill={`url(#${gid}-cream)`} />
      <path d="M32 24v14M32 38l-5.5-5.5M32 38l5.5-5.5" stroke={`url(#${gid}-forest)`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  report: (gid) => (
    <>
      <Block x={14} y={34} w={10} h={12} face={`url(#${gid}-cream)`} side={`url(#${gid}-forest-side)`} />
      <Block x={27} y={26} w={10} h={20} face={`url(#${gid}-gilt)`} side={`url(#${gid}-gilt-side)`} />
      <Block x={40} y={16} w={10} h={30} face={`url(#${gid}-forest)`} side={`url(#${gid}-forest-side)`} />
    </>
  ),
  event: (gid) => (
    <>
      <path d="M32 13l4.5 13h13.5l-11 8.2 4.2 13L32 39.8 21.8 47.2l4.2-13-11-8.2H28.5z" fill={`url(#${gid}-gilt-side)`} />
      <path d="M32 12l4.5 13h13.5l-11 8.2 4.2 13L32 38.8 21.8 46.2l4.2-13-11-8.2H28.5z" fill={`url(#${gid}-gilt)`} />
      <circle cx="32" cy="29" r="4.2" fill={`url(#${gid}-cream)`} />
    </>
  ),
  health: (gid) => (
    <>
      <path d="M32 48c-13-8.5-19-15-19-23.5a12 12 0 0121.5-8.5A12 12 0 0151 24.5c0 8.5-6 15-19 23.5z" fill={`url(#${gid}-forest-side)`} />
      <path d="M32 46c-13-8.5-19-15-19-23.5a12 12 0 0121.5-8.5A12 12 0 0151 22.5c0 8.5-6 15-19 23.5z" fill={`url(#${gid}-cream)`} />
      <path d="M32 22v15M24.5 29.5h15" stroke={`url(#${gid}-forest)`} strokeWidth="3.4" strokeLinecap="round" />
    </>
  ),
  sports: (gid) => (
    <>
      <circle cx="32" cy="32" r="15" fill={`url(#${gid}-forest-side)`} />
      <circle cx="32" cy="30" r="15" fill={`url(#${gid}-cream)`} />
      <circle cx="32" cy="30" r="15" fill="none" stroke={`url(#${gid}-forest)`} strokeWidth="2.2" />
      <path d="M17 30h30M32 15c-6.5 5.5-9.5 10-9.5 15s3 9.5 9.5 15c6.5-5.5 9.5-10 9.5-15s-3-9.5-9.5-15z" stroke="#053321" strokeWidth="1.7" opacity="0.3" />
      <path d="M21 20l22 20M43 20L21 40" stroke={`url(#${gid}-gilt)`} strokeWidth="2" />
    </>
  ),
  lab: (gid) => (
    <>
      <path d="M24 14h6.5v12.5L18 48h28L33.5 26.5V14H40" stroke={`url(#${gid}-forest-side)`} strokeWidth="4" fill="none" strokeLinejoin="round" />
      <path d="M24 13h6.5v12.5L18 47h28L33.5 25.5V13H40" stroke={`url(#${gid}-forest)`} strokeWidth="3.4" fill="none" strokeLinejoin="round" />
      <path d="M21 44h22" stroke={`url(#${gid}-gilt)`} strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="28" cy="38" r="2" fill={`url(#${gid}-sky)`} />
      <circle cx="36" cy="34" r="1.6" fill={`url(#${gid}-gilt)`} />
    </>
  ),
  hostel: (gid) => (
    <>
      <rect x="13" y="28" width="38" height="20" rx="2.5" fill={`url(#${gid}-forest-side)`} />
      <rect x="13" y="26" width="38" height="20" rx="2.5" fill={`url(#${gid}-cream)`} />
      <path d="M11 28l21-14 21 14" fill={`url(#${gid}-forest-side)`} />
      <path d="M11 26l21-14 21 14" fill={`url(#${gid}-forest)`} />
      <rect x="20" y="32" width="8" height="8" rx="1.5" fill={`url(#${gid}-gilt)`} />
      <rect x="36" y="32" width="8" height="8" rx="1.5" fill={`url(#${gid}-gilt)`} />
    </>
  ),
  canteen: (gid) => (
    <>
      <ellipse cx="32" cy="42" rx="19" ry="8.5" fill={`url(#${gid}-forest-side)`} />
      <ellipse cx="32" cy="40" rx="19" ry="8.5" fill={`url(#${gid}-cream)`} />
      <ellipse cx="32" cy="38" rx="14.5" ry="5.8" fill="#fff" opacity="0.5" />
      <path d="M17 24c3.5 11 26.5 11 30 0" stroke={`url(#${gid}-gilt-side)`} strokeWidth="3.6" strokeLinecap="round" fill="none" />
      <path d="M17 22.5c3.5 11 26.5 11 30 0" stroke={`url(#${gid}-gilt)`} strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <rect x="29" y="13" width="6" height="13" rx="2.5" fill={`url(#${gid}-forest)`} />
      <circle cx="24" cy="36" r="2.4" fill={`url(#${gid}-forest)`} />
      <circle cx="40" cy="36" r="2.4" fill={`url(#${gid}-gilt)`} />
    </>
  ),
  inventory: (gid) => (
    <>
      <rect x="13" y="24" width="38" height="24" rx="5" fill={`url(#${gid}-forest-side)`} />
      <rect x="13" y="22" width="38" height="24" rx="5" fill={`url(#${gid}-cream)`} />
      <rect x="13" y="22" width="38" height="10" fill={`url(#${gid}-forest)`} />
      <rect x="28" y="28" width="8" height="6" rx="1.5" fill={`url(#${gid}-gilt)`} />
      <path d="M16 24h32" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.5" />
    </>
  ),
};

export function SchoolGlyph({
  name,
  className,
  tone = "brand",
}: {
  name: GlyphName;
  className?: string;
  tone?: GlyphTone;
}) {
  const gid = `g-${name}-${useId().replace(/:/g, "")}`;
  return (
    <Svg className={className}>
      <Shell gid={gid} tone={tone}>
        {MARKS[name](gid)}
      </Shell>
    </Svg>
  );
}

const PATH_GLYPHS: Array<{ test: RegExp; name: GlyphName }> = [
  { test: /dashboard/, name: "dashboard" },
  { test: /branch/, name: "campus" },
  { test: /users|roles/, name: "users" },
  { test: /academic-year|years/, name: "calendar" },
  { test: /settings/, name: "settings" },
  { test: /audit/, name: "audit" },
  { test: /enquir/, name: "enquiry" },
  { test: /application|interview|admission/, name: "admissions" },
  { test: /entrance/, name: "exam" },
  { test: /guardian|parent|children|ptm|alumni/, name: "parent" },
  { test: /student|promotion|transfer|headcount|boys|girls/, name: "student" },
  { test: /teacher/, name: "teacher" },
  { test: /staff|hr|payroll/, name: "staff" },
  { test: /subject/, name: "subject" },
  { test: /timetable/, name: "timetable" },
  { test: /homework|study/, name: "homework" },
  { test: /exam|mark|result|report-card|grade/, name: "exam" },
  { test: /attendance/, name: "attendance" },
  { test: /library|loan|book/, name: "library" },
  { test: /fee|invoice|payment|receipt|finance|collection/, name: "fees" },
  { test: /transport|bus/, name: "bus" },
  { test: /notice|notification|complaint|communication/, name: "notice" },
  { test: /leave/, name: "leave" },
  { test: /report|analytic|records|visible|statuses/, name: "report" },
  { test: /event/, name: "event" },
  { test: /health/, name: "health" },
  { test: /sport/, name: "sports" },
  { test: /lab/, name: "lab" },
  { test: /class/, name: "class" },
  { test: /hostel/, name: "hostel" },
  { test: /canteen|cafeteria|menu|dining/, name: "canteen" },
  { test: /discipline/, name: "admissions" },
  { test: /inventory/, name: "inventory" },
  { test: /document/, name: "document" },
  { test: /campus/, name: "campus" },
];

export function glyphForPath(pathname?: string | null, title?: string | null): GlyphName {
  const blob = `${pathname ?? ""} ${title ?? ""}`.toLowerCase();
  return PATH_GLYPHS.find((row) => row.test.test(blob))?.name ?? "campus";
}
