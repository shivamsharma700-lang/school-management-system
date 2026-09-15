import { useEffect, useRef, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Bell, ClipboardCheck, GraduationCap, IndianRupee, TrendingUp, Users } from "lucide-react";
import { Reveal } from "./ui";

/**
 * Product preview.
 *
 * A representative rendering of the real dashboard's information architecture —
 * the same KPIs, the same branch comparison, the same activity rail. Figures are
 * illustrative sample data, labelled as such, not claims about any school.
 */

const ATTENDANCE = [
  { d: "Mon", v: 93.1 }, { d: "Tue", v: 94.4 }, { d: "Wed", v: 92.8 },
  { d: "Thu", v: 95.2 }, { d: "Fri", v: 94.8 }, { d: "Sat", v: 91.6 },
];

const BRANCHES = [
  { name: "Main", v: 612 }, { name: "North", v: 548 }, { name: "South", v: 503 },
  { name: "East", v: 471 }, { name: "West", v: 455 }, { name: "Noida", v: 432 },
];

const KPIS = [
  { label: "Students", value: "4,242", hint: "On roll", icon: Users, tone: "#2b5ce6" },
  { label: "Attendance", value: "94.8%", hint: "Today", icon: ClipboardCheck, tone: "#1a7f4b" },
  { label: "Fees collected", value: "₹29.04 Cr", hint: "79% of billed", icon: IndianRupee, tone: "#b4780a" },
  { label: "Teachers", value: "96", hint: "Teaching staff", icon: GraduationCap, tone: "#4338ca" },
];

const ACTIVITY = [
  { title: "New admission · Zara Kulkarni", meta: "Class 2 · North Delhi", when: "10:24" },
  { title: "Fee payment received", meta: "₹44,500 · Arjun Sharma", when: "09:58" },
  { title: "Notice published", meta: "Annual Day · all parents", when: "09:31" },
  { title: "Term II results published", meta: "Class X · 6 subjects", when: "08:47" },
];

/** Animate charts only once the section is actually on screen. */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setSeen(true), io.disconnect()),
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

export function DashboardPreview() {
  const [ref, seen] = useInView<HTMLDivElement>();

  return (
    <Reveal>
      <div ref={ref} className="depth-scene">
        <div className="depth-card overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-white shadow-[var(--shadow-xl)]">
          {/* Window chrome */}
          <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3">
            <span className="flex gap-1.5" aria-hidden>
              {["#f45b5b", "#f5b53d", "#37c26a"].map((c) => (
                <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
              ))}
            </span>
            <p className="text-[0.8125rem] font-semibold text-[var(--text-muted)]">
              School Management Application · Administrator dashboard
            </p>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[2fr_1fr] lg:p-7">
            <div className="space-y-5">
              {/* KPI row */}
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {KPIS.map((k) => {
                  const Icon = k.icon;
                  return (
                    <div
                      key={k.label}
                      className="rounded-[var(--radius)] border border-[var(--border)] bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                          {k.label}
                        </p>
                        <Icon size={16} style={{ color: k.tone }} aria-hidden />
                      </div>
                      <p className="mt-2 text-xl font-extrabold tracking-tight xl:text-2xl">{k.value}</p>
                      <p className="mt-0.5 text-[0.8125rem] text-[var(--text-muted)]">{k.hint}</p>
                    </div>
                  );
                })}
              </div>

              {/* Attendance trend */}
              <div className="rounded-[var(--radius)] border border-[var(--border)] bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Attendance this week</h3>
                    <p className="text-[0.8125rem] text-[var(--text-muted)]">All campuses</p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#e8f7ee] px-3 py-1 text-[0.8125rem] font-bold text-[#1a7f4b]">
                    <TrendingUp size={14} aria-hidden /> +1.4%
                  </span>
                </div>
                <div className="mt-4 h-[180px]">
                  {seen ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ATTENDANCE} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2b5ce6" stopOpacity={0.32} />
                          <stop offset="100%" stopColor="#2b5ce6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7ecf5" />
                      <XAxis dataKey="d" tick={{ fontSize: 12, fill: "#6b7996" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[88, 98]} tick={{ fontSize: 12, fill: "#6b7996" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12, border: "1px solid #dfe5f0",
                          fontSize: 13, boxShadow: "0 10px 30px rgba(13,21,38,.12)",
                        }}
                        formatter={(v: number) => [`${v}%`, "Present"]}
                      />
                      <Area
                        type="monotone" dataKey="v" stroke="#2b5ce6" strokeWidth={2.5}
                        fill="url(#att)" animationDuration={900}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  ) : null}
                </div>
              </div>

              {/* Branch comparison */}
              <div className="rounded-[var(--radius)] border border-[var(--border)] bg-white p-5">
                <h3 className="font-bold">Students by campus</h3>
                <p className="text-[0.8125rem] text-[var(--text-muted)]">Current academic year</p>
                <div className="mt-4 h-[160px]">
                  {seen ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={BRANCHES} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7ecf5" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7996" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#6b7996" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: "rgba(43,92,230,.06)" }}
                        contentStyle={{
                          borderRadius: 12, border: "1px solid #dfe5f0",
                          fontSize: 13, boxShadow: "0 10px 30px rgba(13,21,38,.12)",
                        }}
                      />
                      <Bar dataKey="v" radius={[6, 6, 0, 0]} animationDuration={900}>
                        {BRANCHES.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? "#2b5ce6" : "#9db6f4"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Activity rail */}
            <div className="space-y-5">
              <div className="rounded-[var(--radius)] border border-[var(--border)] bg-white p-5">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-[var(--primary)]" aria-hidden />
                  <h3 className="font-bold">Recent activity</h3>
                </div>
                <ul className="mt-4 space-y-4">
                  {ACTIVITY.map((a) => (
                    <li key={a.title} className="flex gap-3">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden />
                      <div className="min-w-0">
                        <p className="text-[0.9375rem] font-semibold leading-snug">{a.title}</p>
                        <p className="text-[0.8125rem] text-[var(--text-muted)]">
                          {a.meta} · {a.when}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[var(--radius)] border border-[var(--border)] bg-gradient-to-br from-[var(--primary)] to-[var(--indigo)] p-5 text-white">
                <p className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-white/70">
                  Pending actions
                </p>
                <p className="mt-2 text-3xl font-extrabold">12</p>
                <p className="mt-1 text-[0.9375rem] text-white/80">
                  Leave approvals, refund requests and admission reviews awaiting a decision.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[0.8125rem] text-[var(--text-muted)]">
        Representative view of the administrator dashboard. Figures shown are sample data.
      </p>
    </Reveal>
  );
}
