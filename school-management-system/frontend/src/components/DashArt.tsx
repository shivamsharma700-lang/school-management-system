/** Restrained institutional icon marks — abstract geometry only, no avatars. */
import { useId, type ReactNode } from "react";
import { cn } from "./ui";

export type DashArtName =
  | "student"
  | "teacher"
  | "staff"
  | "campus"
  | "fees"
  | "attendance"
  | "add-student"
  | "admission"
  | "mark-attendance"
  | "collect-fee"
  | "report"
  | "notice"
  | "exam"
  | "results"
  | "homework"
  | "timetable"
  | "library"
  | "transport"
  | "bus"
  | "analytics"
  | "documents"
  | "settings"
  | "security"
  | "application";

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-full w-full", className)} fill="none" aria-hidden>
      {children}
    </svg>
  );
}

function SoftShadow({ gid }: { gid: string }) {
  return (
    <defs>
      <linearGradient id={`${gid}-g`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#26262E" />
        <stop offset="100%" stopColor="#15151A" />
      </linearGradient>
      <linearGradient id={`${gid}-gold`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFBE3D" />
        <stop offset="100%" stopColor="#9A6205" />
      </linearGradient>
      <linearGradient id={`${gid}-panel`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#F1EFEB" />
      </linearGradient>
    </defs>
  );
}

/** Soft square tile + abstract mark — one coherent family. */
function Tile({ gid, children }: { gid: string; children: ReactNode }) {
  return (
    <>
      <SoftShadow gid={gid} />
      <rect x="4" y="4" width="56" height="56" rx="10" fill={`url(#${gid}-panel)`} />
      <rect x="4" y="4" width="56" height="56" rx="10" stroke="#15151A" strokeOpacity="0.08" />
      {children}
    </>
  );
}

const ART: Record<DashArtName, (gid: string) => ReactNode> = {
  student: (gid) => (
    <Tile gid={gid}>
      <circle cx="32" cy="24" r="7" stroke={`url(#${gid}-g)`} strokeWidth="2.2" />
      <path d="M18 46c3-9 25-9 28 0" stroke={`url(#${gid}-g)`} strokeWidth="2.2" strokeLinecap="round" />
    </Tile>
  ),
  teacher: (gid) => (
    <Tile gid={gid}>
      <rect x="20" y="18" width="24" height="18" rx="2" stroke={`url(#${gid}-g)`} strokeWidth="2.2" />
      <path d="M24 42h16" stroke={`url(#${gid}-gold)`} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M28 26h8M28 32h5" stroke="#15151A" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
    </Tile>
  ),
  staff: (gid) => (
    <Tile gid={gid}>
      <rect x="22" y="20" width="20" height="24" rx="3" stroke={`url(#${gid}-g)`} strokeWidth="2.2" />
      <rect x="28" y="28" width="8" height="6" rx="1" fill={`url(#${gid}-gold)`} />
    </Tile>
  ),
  campus: (gid) => (
    <Tile gid={gid}>
      <path d="M16 42h32V28L32 18 16 28v14z" stroke={`url(#${gid}-g)`} strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="28" y="32" width="8" height="10" fill={`url(#${gid}-gold)`} />
    </Tile>
  ),
  fees: (gid) => (
    <Tile gid={gid}>
      <circle cx="32" cy="32" r="14" stroke={`url(#${gid}-gold)`} strokeWidth="2.2" />
      <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="700" fill="#15151A">
        ₹
      </text>
    </Tile>
  ),
  attendance: (gid) => (
    <Tile gid={gid}>
      <rect x="18" y="16" width="28" height="32" rx="3" stroke={`url(#${gid}-g)`} strokeWidth="2.2" />
      <path d="M26 34l4 4 8-9" stroke={`url(#${gid}-gold)`} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </Tile>
  ),
  "add-student": (gid) => (
    <Tile gid={gid}>
      <circle cx="28" cy="26" r="6" stroke={`url(#${gid}-g)`} strokeWidth="2.2" />
      <path d="M16 44c2-7 20-7 22 0" stroke={`url(#${gid}-g)`} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M44 28v12M38 34h12" stroke={`url(#${gid}-gold)`} strokeWidth="2.2" strokeLinecap="round" />
    </Tile>
  ),
  admission: (gid) => (
    <Tile gid={gid}>
      <rect x="20" y="14" width="24" height="34" rx="2" stroke={`url(#${gid}-g)`} strokeWidth="2.2" />
      <path d="M26 24h12M26 30h10M26 36h12" stroke="#15151A" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
      <circle cx="40" cy="44" r="6" fill={`url(#${gid}-gold)`} />
      <path d="M40 41v6M37 44h6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </Tile>
  ),
  application: (gid) => (
    <Tile gid={gid}>
      <rect x="18" y="14" width="22" height="30" rx="2" stroke={`url(#${gid}-g)`} strokeWidth="2.2" />
      <path d="M36 36l8-8 4 4-8 8-4-4z" fill={`url(#${gid}-gold)`} />
    </Tile>
  ),
  "mark-attendance": (gid) => (
    <Tile gid={gid}>
      <circle cx="32" cy="32" r="14" stroke={`url(#${gid}-g)`} strokeWidth="2.2" />
      <path d="M24 32l5 5 11-12" stroke={`url(#${gid}-gold)`} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </Tile>
  ),
  "collect-fee": (gid) => (
    <Tile gid={gid}>
      <rect x="16" y="24" width="32" height="20" rx="3" stroke={`url(#${gid}-g)`} strokeWidth="2.2" />
      <circle cx="32" cy="34" r="6" fill={`url(#${gid}-gold)`} />
      <text x="32" y="37" textAnchor="middle" fontSize="9" fontWeight="700" fill="#15151A">
        ₹
      </text>
    </Tile>
  ),
  report: (gid) => (
    <Tile gid={gid}>
      <rect x="28" y="34" width="6" height="12" fill={`url(#${gid}-g)`} />
      <rect x="38" y="26" width="6" height="20" fill={`url(#${gid}-gold)`} />
      <rect x="18" y="30" width="6" height="16" fill="#26262E" opacity="0.55" />
    </Tile>
  ),
  notice: (gid) => (
    <Tile gid={gid}>
      <path d="M20 40h24l-4-8V22H24v10l-4 8z" stroke={`url(#${gid}-g)`} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="32" cy="46" r="3" fill={`url(#${gid}-gold)`} />
    </Tile>
  ),
  exam: (gid) => (
    <Tile gid={gid}>
      <rect x="18" y="14" width="28" height="36" rx="2" stroke={`url(#${gid}-g)`} strokeWidth="2.2" />
      <rect x="18" y="14" width="28" height="10" fill={`url(#${gid}-g)`} />
      <path d="M24 34h16M24 40h12" stroke="#15151A" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
    </Tile>
  ),
  results: (gid) => (
    <Tile gid={gid}>
      <path d="M16 40 L26 30 L34 36 L48 18" stroke={`url(#${gid}-g)`} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="48" cy="18" r="3.5" fill={`url(#${gid}-gold)`} />
    </Tile>
  ),
  homework: (gid) => (
    <Tile gid={gid}>
      <rect x="20" y="14" width="24" height="34" rx="2" stroke={`url(#${gid}-g)`} strokeWidth="2.2" />
      <path d="M26 24h12M26 30h12M26 36h8" stroke="#15151A" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
    </Tile>
  ),
  timetable: (gid) => (
    <Tile gid={gid}>
      <rect x="16" y="18" width="32" height="30" rx="3" stroke={`url(#${gid}-g)`} strokeWidth="2.2" />
      <rect x="16" y="18" width="32" height="8" fill={`url(#${gid}-g)`} />
      <rect x="22" y="32" width="6" height="6" fill={`url(#${gid}-gold)`} />
      <rect x="32" y="32" width="6" height="6" fill="#26262E" opacity="0.25" />
      <rect x="42" y="32" width="6" height="6" fill="#26262E" opacity="0.25" />
    </Tile>
  ),
  library: (gid) => (
    <Tile gid={gid}>
      <rect x="16" y="20" width="8" height="26" fill={`url(#${gid}-g)`} />
      <rect x="28" y="16" width="8" height="30" fill={`url(#${gid}-gold)`} />
      <rect x="40" y="22" width="8" height="24" fill="#26262E" opacity="0.7" />
    </Tile>
  ),
  transport: (gid) => (
    <Tile gid={gid}>
      <rect x="14" y="26" width="36" height="14" rx="3" stroke={`url(#${gid}-g)`} strokeWidth="2.2" />
      <rect x="34" y="20" width="14" height="10" rx="2" fill={`url(#${gid}-gold)`} />
      <circle cx="22" cy="42" r="3.5" fill="#15151A" />
      <circle cx="42" cy="42" r="3.5" fill="#15151A" />
    </Tile>
  ),
  bus: (gid) => ART.transport(gid),
  analytics: (gid) => (
    <Tile gid={gid}>
      <rect x="18" y="34" width="7" height="12" fill={`url(#${gid}-g)`} />
      <rect x="28" y="26" width="7" height="20" fill={`url(#${gid}-gold)`} />
      <rect x="38" y="20" width="7" height="26" fill="#26262E" opacity="0.65" />
    </Tile>
  ),
  documents: (gid) => (
    <Tile gid={gid}>
      <rect x="24" y="18" width="22" height="28" rx="2" stroke="#15151A" strokeWidth="1.8" opacity="0.25" />
      <rect x="18" y="14" width="22" height="28" rx="2" stroke={`url(#${gid}-g)`} strokeWidth="2.2" fill={`url(#${gid}-panel)`} />
      <path d="M24 24h10M24 30h8" stroke="#15151A" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
    </Tile>
  ),
  settings: (gid) => (
    <Tile gid={gid}>
      <circle cx="32" cy="32" r="8" stroke={`url(#${gid}-g)`} strokeWidth="2.2" />
      <circle cx="32" cy="32" r="3" fill={`url(#${gid}-gold)`} />
      {[0, 60, 120, 180, 240, 300].map((d) => (
        <rect key={d} x="30" y="14" width="4" height="7" rx="1" fill={`url(#${gid}-g)`} transform={`rotate(${d} 32 32)`} />
      ))}
    </Tile>
  ),
  security: (gid) => (
    <Tile gid={gid}>
      <path
        d="M32 14l14 6v10c0 10-14 16-14 16s-14-6-14-16V20l14-6z"
        stroke={`url(#${gid}-g)`}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M28 32l3 3 6-7" stroke={`url(#${gid}-gold)`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Tile>
  ),
};

export function DashArt({ name, className }: { name: DashArtName; className?: string }) {
  const gid = useId().replace(/:/g, "");
  const draw = ART[name] ?? ART.campus;
  return <Frame className={className}>{draw(gid)}</Frame>;
}

export function dashArtForLabel(label: string): DashArtName {
  const t = label.toLowerCase();
  if (t.includes("teacher")) return "teacher";
  if (t.includes("staff")) return "staff";
  if (t.includes("branch") || t.includes("campus")) return "campus";
  if (t.includes("fee") || t.includes("payment") || t.includes("collect") || t.includes("invoice") || t.includes("receipt"))
    return t.includes("collect") || t.includes("record") ? "collect-fee" : "fees";
  if (t.includes("attend")) return t.includes("mark") || t.includes("take") ? "mark-attendance" : "attendance";
  if (t.includes("analytics") || t.includes("chart") || t.includes("insight")) return "analytics";
  if (t.includes("report")) return "report";
  if (t.includes("notice") || t.includes("notif") || t.includes("send")) return "notice";
  if (t.includes("admission") || t.includes("admit")) return "admission";
  if (t.includes("application") || t.includes("apply")) return "application";
  if (t.includes("exam")) return "exam";
  if (t.includes("result") || t.includes("mark")) return "results";
  if (t.includes("homework") || t.includes("assignment")) return "homework";
  if (t.includes("timetable") || t.includes("period") || t.includes("schedule") || t.includes("class")) return "timetable";
  if (t.includes("library") || t.includes("book")) return "library";
  if (t.includes("bus")) return "bus";
  if (t.includes("transport")) return "transport";
  if (t.includes("document") || t.includes("material")) return "documents";
  if (t.includes("setting")) return "settings";
  if (t.includes("security") || t.includes("audit") || t.includes("role")) return "security";
  if (t.includes("add student") || (t.includes("add") && t.includes("student"))) return "add-student";
  if (t.includes("student") || t.includes("parent") || t.includes("child")) return "student";
  return "campus";
}
