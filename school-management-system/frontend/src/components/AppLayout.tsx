import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Suspense, useEffect, useMemo, useRef, useState, type WheelEvent } from "react";
import { Bell, ChevronDown, ChevronLeft, CircleHelp, LogOut, Maximize2, Menu, Search, Settings, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { Avatar, Badge, cn, Select, Skeleton } from "./ui";
import { BrandMark, SchoolCrest, DemoChip, PremiumIcon } from "./brand";
import { prettyRole, unwrapList } from "../lib/format";
import { canAccessPath, navForRole } from "../lib/nav";
import { DEMO_ONLY_PATHS, moduleStatusForPath } from "../lib/moduleRegistry";
import { ChildProvider, useChildScope } from "../lib/child";
import { DEMO_MODE, SCHOOL_NAME, demoBranches } from "../demo";
import { useLiveOrDemo } from "../demo/useLiveOrDemo";
import type { Branch, Student } from "../lib/types";

function RoleGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!canAccessPath(user?.role, location.pathname)) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return <>{children}</>;
}

function ModuleStatusBanner() {
  const location = useLocation();
  const entry = moduleStatusForPath(location.pathname);
  if (!entry || !DEMO_ONLY_PATHS.has(entry.path)) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
      <DemoChip show />
      <span>
        <strong>{entry.label}</strong> is a workspace preview — {entry.notes}
      </span>
    </div>
  );
}

function lockWheel(e: WheelEvent<HTMLElement>) {
  e.stopPropagation();
}

function SidebarInner({
  mode,
  collapsed,
  setCollapsed,
  onNavigate,
}: {
  mode: "desktop" | "mobile";
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onNavigate?: () => void;
}) {
  const { user } = useAuth();
  const groups = useMemo(() => navForRole(user?.role), [user?.role]);
  const location = useLocation();
  const compact = collapsed && mode === "desktop";
  const navRef = useRef<HTMLElement>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("twhps_nav_groups") || "{}") as Record<string, boolean>;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    el.scrollTop = Number(sessionStorage.getItem("twhps_nav_scroll") || 0);
    const onScroll = () => sessionStorage.setItem("twhps_nav_scroll", String(el.scrollTop));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      groups.forEach((g) => {
        if (g.items.some((i) => location.pathname === i.to || location.pathname.startsWith(i.to + "/"))) next[g.id] = true;
        if (next[g.id] === undefined) next[g.id] = true;
      });
      return next;
    });
  }, [location.pathname, groups]);

  const toggle = (id: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("twhps_nav_groups", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#15151A] text-slate-300">
      <div className={cn("flex shrink-0 items-center gap-3 border-b border-white/[0.08] px-4 py-5", compact && "justify-center px-2")}>
        {compact ? <SchoolCrest size={36} /> : <BrandMark size={40} light />}
      </div>
      <nav
        ref={navRef}
        className="sidebar-scroll min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-2.5 py-4"
        onWheel={lockWheel}
      >
        {groups.map((group) => {
          const expanded = compact ? true : openGroups[group.id] !== false;
          return (
            <div key={group.id} className="space-y-1">
              {!compact ? (
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 hover:text-gilt-400"
                  onClick={() => toggle(group.id)}
                  aria-expanded={expanded}
                >
                  {group.label}
                  <ChevronDown size={13} className={cn("opacity-70 transition", expanded ? "" : "-rotate-90")} />
                </button>
              ) : null}
              {expanded ? (
                <div className="grid gap-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to + item.label}
                      to={item.to}
                      title={compact ? item.label : undefined}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold tracking-[-0.01em] transition duration-200",
                          compact && "justify-center px-2",
                          isActive
                            ? "bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                            : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <PremiumIcon to={item.to} label={item.label} icon={item.icon} active={isActive} className={compact ? "h-9 w-9" : undefined} />
                          {!compact ? <span className="truncate">{item.label}</span> : <span className="sr-only">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
      {!compact ? (
        <div className="shrink-0 border-t border-white/[0.08] px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gilt-400/80">Building brighter futures</p>
        </div>
      ) : null}
      {mode === "desktop" ? (
        <button
          className="m-2.5 flex shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-200"
          onClick={() => {
            const next = !collapsed;
            setCollapsed(next);
            localStorage.setItem("sms_sidebar", next ? "1" : "0");
          }}
        >
          <ChevronLeft size={16} className={cn("transition", collapsed && "rotate-180")} />
          {!compact ? "Collapse" : <span className="sr-only">Expand</span>}
        </button>
      ) : null}
    </div>
  );
}

function ChildSwitcher() {
  const { user } = useAuth();
  const scope = useChildScope();
  if (user?.role !== "PARENT" || scope.children.length < 1) return null;
  return (
    <Select
      className="hidden max-w-[200px] sm:block"
      aria-label="Select child"
      value={scope.selected?.id ?? ""}
      onChange={(e) => scope.setSelectedId(e.target.value)}
    >
      {scope.children.map((c) => (
        <option key={c.id} value={c.id}>
          {c.fullName} · {c.className}
        </option>
      ))}
    </Select>
  );
}

function Shell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sms_sidebar") === "1");
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [branchFilter, setBranchFilter] = useState(() => sessionStorage.getItem("twhps_branch_ui") || "");
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const unread = useQuery({
    queryKey: ["unread"],
    queryFn: () => api<{ count: number }>("/api/notifications/unread-count"),
  });
  const branchesQ = useQuery({ queryKey: ["branches"], queryFn: () => api<Branch[]>("/api/branches") });
  const branches = useLiveOrDemo(branchesQ, demoBranches);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const canSearch = user?.role !== "ACCOUNTANT";
  const search = useQuery({
    queryKey: ["global-search", debounced],
    enabled: canSearch && debounced.length >= 2,
    queryFn: () => api<{ items: Student[] }>(`/api/students?q=${encodeURIComponent(debounced)}&size=6`),
  });
  const scopedUser = user?.role !== "SUPER_ADMIN";

  return (
    <div
      className="app-shell bg-canvas lg:grid"
      style={{ gridTemplateColumns: collapsed ? "84px minmax(0,1fr)" : "272px minmax(0,1fr)", gridTemplateRows: "100%" }}
    >
      <aside className="hidden h-full min-h-0 overflow-hidden lg:block">
        <SidebarInner mode="desktop" collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-ink-950/50" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[280px] overflow-hidden">
            <SidebarInner mode="mobile" collapsed={false} setCollapsed={setCollapsed} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}
      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
        <header className="z-20 flex h-14 shrink-0 items-center gap-2 border-b border-line/80 bg-white/90 px-3 shadow-soft backdrop-blur-md sm:h-[64px] sm:gap-3 sm:px-5">
          <button className="rounded-xl p-2 text-ink-900 transition hover:bg-ivory-200 lg:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="relative min-w-0 flex-1">
            {canSearch ? (
              <>
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 sm:left-3.5" size={16} />
                <input
                  ref={searchRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search students…"
                  className="w-full rounded-xl border border-line bg-white py-2 pl-9 pr-3 text-sm font-medium text-ink-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-forest-600 focus:shadow-[0_0_0_4px_rgba(22,107,79,0.08)] sm:rounded-2xl sm:py-2.5 sm:pl-10"
                  aria-label="Global search"
                />
                {debounced.length >= 2 ? (
                  <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-line bg-white shadow-pop">
                    {(search.data?.items ?? []).length === 0 ? (
                      <p className="px-4 py-3 text-sm text-slate-500">No matching students.</p>
                    ) : (
                      unwrapList<Student>(search.data).map((s) => (
                        <button
                          key={s.id}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-ivory-100"
                          onClick={() => {
                            setQ("");
                            setDebounced("");
                            navigate(`/app/students/${s.id}`);
                          }}
                        >
                          <Avatar name={s.fullName} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{s.fullName}</span>
                            <span className="text-xs text-slate-500">{s.admissionNumber} · {s.className}</span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="hidden text-sm text-slate-500 sm:block">Finance · {SCHOOL_NAME}</p>
            )}
          </div>
          {scopedUser ? (
            <span className="hidden rounded-xl border border-line px-3 py-2 text-sm text-slate-600 lg:inline">{user?.branchName ?? "Campus"}</span>
          ) : (
            <Select
              className="hidden max-w-[180px] lg:block"
              aria-label="Branch selector"
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                sessionStorage.setItem("twhps_branch_ui", e.target.value);
                window.dispatchEvent(new CustomEvent("school-branch", { detail: e.target.value }));
              }}
            >
              <option value="">All Branches</option>
              {(branches.data ?? []).map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
          )}
          <ChildSwitcher />
          <DemoChip show={DEMO_MODE} />
          <button className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100" onClick={() => navigate("/app/notifications")} aria-label="Notifications">
            <Bell size={18} />
            {(unread.data?.count) ? <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread.data.count}</span> : null}
          </button>
          <button className="hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 sm:inline" aria-label="Help" onClick={() => setHelpOpen((v) => !v)}>
            <CircleHelp size={18} />
          </button>
          <button
            className="hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 sm:inline"
            aria-label="Fullscreen"
            onClick={() => {
              if (document.fullscreenElement) void document.exitFullscreen();
              else void document.documentElement.requestFullscreen();
            }}
          >
            <Maximize2 size={18} />
          </button>
          <div className="relative" ref={menuRef}>
            <button className="flex items-center gap-3 rounded-2xl py-1 pl-1 pr-2 hover:bg-slate-50" onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={menuOpen}>
              <Avatar name={user?.fullName} />
              <div className="hidden text-left sm:block">
                <div className="text-sm font-semibold leading-tight">{user?.fullName}</div>
                <div className="text-xs text-slate-500">{prettyRole(user?.role)}</div>
              </div>
            </button>
            {menuOpen ? (
              <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-pop" role="menu">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <div className="mt-2"><Badge tone="info">{prettyRole(user?.role)}</Badge></div>
                  <p className="mt-2 text-xs text-slate-400">{user?.branchName ?? "All campuses"}</p>
                </div>
                <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-slate-50" onClick={() => { setMenuOpen(false); navigate("/app/settings"); }}>
                  <Settings size={16} /> Settings
                </button>
                <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50" onClick={() => { void logout().then(() => navigate("/login")); }}>
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            ) : null}
          </div>
        </header>
        {helpOpen ? (
          <div className="border-b border-line bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
            Keyboard: Ctrl+K search · sidebar and content scroll independently. Close with the help icon.
          </div>
        ) : null}
        <main className="portal-surface main-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden" onWheel={lockWheel}>
          <div className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6">
            <Suspense fallback={<div className="grid gap-4"><Skeleton className="h-16" /><Skeleton className="h-64" /></div>}>
              <RoleGate>
                <ModuleStatusBanner />
                <Outlet />
              </RoleGate>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <ChildProvider>
      <Shell />
    </ChildProvider>
  );
}
