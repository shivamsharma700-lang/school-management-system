import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Crown,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  School,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { post } from "../lib/api";
import { Button, Input } from "../components/ui";
import { BrandMark } from "../components/brand";
import { LOGIN_HERO, TOUR_VIDEO, TOUR_VIDEO_FALLBACK } from "../lib/mediaCatalog";
import { SCHOOL_NAME, SCHOOL_TAGLINE } from "../demo/config";

const schema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

const ROLE_PREFILL = {
  Admin: "super.admin@sms.local",
  Principal: "principal@sms.local",
  Teacher: "teacher@sms.local",
  Accountant: "accountant@sms.local",
  Parent: "parent@sms.local",
  Student: "student@sms.local",
} as const;

const ROLE_ICON = {
  Admin: Crown,
  Principal: School,
  Teacher: GraduationCap,
  Accountant: Wallet,
  Parent: Users,
  Student: UserRound,
} as const;

type RoleKey = keyof typeof ROLE_PREFILL;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<RoleKey>("Admin");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: localStorage.getItem("dps_remember_user") || ROLE_PREFILL.Admin,
      password: "",
    },
  });

  useEffect(() => {
    form.setValue("username", ROLE_PREFILL[role]);
  }, [role, form]);

  const sso = () => toast.message("SSO is not configured. Sign in with email and password.");

  return (
    <div className="relative h-full overflow-y-auto overflow-x-hidden bg-[#07131c] text-white">
      <div className="absolute inset-0">
        <video className="hero-video" autoPlay muted loop playsInline poster={LOGIN_HERO}>
          <source src={TOUR_VIDEO} type="video/mp4" />
          <source src={TOUR_VIDEO_FALLBACK} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#07131c]/94 via-[#053321]/70 to-[#07131c]/35" />
      </div>

      <header className="relative z-10 flex items-center justify-between gap-4 px-5 py-5 lg:px-12">
        <Link to="/" aria-label="Back to school website">
          <BrandMark size={44} light />
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admissions" className="hidden rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white/90 sm:inline">
            Admissions
          </Link>
          <Link to="/" className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white/90">
            School website
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-[1120px] items-center gap-10 px-5 pb-16 pt-2 lg:grid-cols-[1.05fr_440px] lg:px-12">
        <div className="fade-up">
          <p className="stat-kicker text-gilt-400">School Portal</p>
          <h1 className="mt-4 max-w-xl font-display text-4xl leading-tight sm:text-5xl">
            Families, teachers and staff sign in here.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/75">
            {SCHOOL_NAME}. {SCHOOL_TAGLINE}. Attendance, homework, fees and notices live behind this door. Visitors stay on the public website.
          </p>
          <ul className="mt-8 hidden max-w-md grid-cols-2 gap-3 text-sm text-white/80 sm:grid">
            <li className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">Live class registers</li>
            <li className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">Fee invoices & receipts</li>
            <li className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">Homework and exams</li>
            <li className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">Campus notices</li>
          </ul>
        </div>

        <form
          className="glass-panel fade-up-delay mx-auto w-full max-w-[440px] rounded-[28px] p-7 text-slate-900"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              if (remember) localStorage.setItem("dps_remember_user", values.username);
              else localStorage.removeItem("dps_remember_user");
              await login(values.username, values.password);
              navigate("/app/dashboard");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Login failed");
            }
          })}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gilt-600">Demo campus accounts</p>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {(Object.keys(ROLE_PREFILL) as RoleKey[]).map((key) => {
              const Icon = ROLE_ICON[key];
              const on = role === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRole(key)}
                  className={
                    on
                      ? "flex flex-col items-center gap-1 rounded-2xl bg-[#053321] px-1 py-2.5 text-[10px] font-semibold text-white shadow-md"
                      : "flex flex-col items-center gap-1 rounded-2xl bg-white/50 px-1 py-2.5 text-[10px] font-semibold text-slate-600"
                  }
                >
                  <Icon size={15} className={on ? "text-gilt-400" : "text-slate-500"} />
                  {key}
                </button>
              );
            })}
          </div>
          <h2 className="mt-5 font-display text-3xl text-[#053321]">Welcome Back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to {SCHOOL_NAME}.</p>
          <label className="mt-5 block text-sm font-medium">Email / Username</label>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input className="border-white/70 bg-white/70 pl-9" autoComplete="username" {...form.register("username")} />
          </div>
          <label className="mt-4 block text-sm font-medium">Password</label>
          <div className="relative mt-2">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input className="border-white/70 bg-white/70 pl-9 pr-10" type={showPassword ? "text" : "password"} autoComplete="current-password" {...form.register("password")} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-[#053321]">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <Link className="font-medium text-sky-700 hover:underline" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="mt-5 w-full rounded-2xl bg-[#053321] py-3 hover:bg-[#0b4a32]">
            Sign In →
          </Button>
          <p className="mt-5 text-center text-[11px] uppercase tracking-[0.18em] text-slate-400">or continue with</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              ["Google", "G"],
              ["Microsoft", "M"],
              ["SSO", "S"],
            ].map(([label, mark]) => (
              <button key={label} type="button" onClick={sso} className="rounded-xl border border-white/70 bg-white/70 py-2 text-xs font-semibold text-slate-700">
                <span className="mr-1 font-bold text-[#053321]">{mark}</span>
                {label}
              </button>
            ))}
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#0c6b45]">
            <Lock size={12} /> Signed sessions · role-based access.
          </p>
          <Link to="/" className="mt-4 block text-center text-sm font-medium text-[#053321] hover:underline">
            Not staff or family? View the school website
          </Link>
        </form>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden p-6">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster={LOGIN_HERO}>
        <source src={TOUR_VIDEO} type="video/mp4" />
        <source src={TOUR_VIDEO_FALLBACK} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#04180f]/70" />
      <div className="glass-panel relative w-full max-w-md rounded-3xl p-8 text-slate-900">
        <BrandMark size={40} />
        <h1 className="mt-5 font-display text-3xl text-[#053321]">Reset password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">If the account exists, a hashed reset token is stored on the server.</p>
        <Input className="mt-6" type="email" placeholder="you@dps.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="mt-4">
          <Button
            disabled={!email || sent}
            className="bg-[#053321]"
            onClick={async () => {
              try {
                await post("/api/auth/forgot-password", { email });
                setSent(true);
                toast.success("If the account exists, a reset was created.");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not start reset");
              }
            }}
          >
            Send reset
          </Button>
        </div>
        <Link className="mt-6 inline-block text-sm text-slate-500" to="/login">Back to sign in</Link>
      </div>
    </div>
  );
}
