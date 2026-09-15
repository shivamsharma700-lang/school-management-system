import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "../lib/auth";
import { post } from "../lib/api";
import { Button, Input } from "../components/ui";
import { BrandMark } from "../components/brand";
import { DashArt, type DashArtName } from "../components/DashArt";
import { MediaImage } from "../components/media";
import { SCHOOL } from "../lib/schoolMedia";
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

const ROLE_ART: Record<keyof typeof ROLE_PREFILL, DashArtName> = {
  Admin: "security",
  Principal: "campus",
  Teacher: "teacher",
  Accountant: "fees",
  Parent: "student",
  Student: "student",
};

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
      username: localStorage.getItem("twhps_remember_user") || ROLE_PREFILL.Admin,
      password: "",
    },
  });

  useEffect(() => {
    form.setValue("username", ROLE_PREFILL[role]);
  }, [role, form]);


  return (
    <div className="relative h-full overflow-y-auto overflow-x-hidden bg-[#111114] text-white">
      <div className="absolute inset-0">
        <MediaImage src={SCHOOL.dashboardHero} alt="" position="center 40%" fit="cover" className="h-full w-full brightness-[0.55] contrast-[1.05]" loading="eager" />
        <div className="absolute inset-0 bg-[#111114]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111114] via-[#111114]/90 to-[#111114]/45" />
      </div>

      <header className="relative z-10 flex items-center justify-between gap-4 px-5 py-5 lg:px-12">
        <Link to="/" aria-label="Back to school website">
          <BrandMark size={42} light />
        </Link>
        <Link to="/" className="border border-white/20 px-4 py-2 text-xs font-semibold text-white/90 hover:bg-white/5">
          School website
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100%-88px)] max-w-[1080px] items-center gap-12 px-5 pb-16 pt-2 lg:grid-cols-[1fr_400px] lg:gap-16 lg:px-12">
        <div className="fade-up max-w-lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFBE3D]">Touch Wood High Public School</p>
          <h1 className="type-hero mt-4 font-display font-medium tracking-[-0.02em]">School Portal</h1>
          <p className="mt-5 text-[15px] leading-7 text-white/72">
            {SCHOOL_NAME}. {SCHOOL_TAGLINE}. Families, teachers and staff sign in for attendance, homework, fees and notices.
          </p>
        </div>

        <form
          className="fade-up w-full border border-white/10 bg-[#FFFFFF] p-7 text-ink-900 shadow-pop sm:p-8"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              if (remember) localStorage.setItem("twhps_remember_user", values.username);
              else localStorage.removeItem("twhps_remember_user");
              await login(values.username, values.password);
              navigate("/app/dashboard");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Login failed");
            }
          })}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A6205]">Demo accounts</p>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {(Object.keys(ROLE_PREFILL) as RoleKey[]).map((key) => {
              const on = role === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRole(key)}
                  className={
                    on
                      ? "flex flex-col items-center gap-1 border border-[#15151A] bg-[#15151A] px-1 py-2 text-[10px] font-semibold text-white"
                      : "flex flex-col items-center gap-1 border border-line bg-white px-1 py-2 text-[10px] font-semibold text-slate-600"
                  }
                >
                  <span className="h-8 w-8">
                    <DashArt name={ROLE_ART[key]} />
                  </span>
                  {key}
                </button>
              );
            })}
          </div>

          <h2 className="mt-5 font-display text-2xl font-medium">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to {SCHOOL_NAME}.</p>

          <label className="mt-5 block text-sm font-semibold text-ink-800">Email / Username</label>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input className="border-ink-900/10 bg-white pl-9" autoComplete="username" {...form.register("username")} />
          </div>

          <label className="mt-4 block text-sm font-semibold text-ink-800">Password</label>
          <div className="relative mt-2">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              className="border-ink-900/10 bg-white pl-9 pr-10"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...form.register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-ink-800">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <Link className="font-semibold text-forest-700 hover:underline" to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="mt-5 w-full rounded-none bg-[#15151A] py-3 hover:bg-[#26262E]">
            Sign in
          </Button>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-forest-700">
            <Lock size={12} /> Signed sessions · role-based access
          </p>
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
      <MediaImage src={SCHOOL.campus.entrance} alt="" position="center 40%" fit="cover" className="absolute inset-0 h-full w-full brightness-[0.5]" />
      <div className="absolute inset-0 bg-[#111114]/80" />
      <div className="relative w-full max-w-md border border-white/10 bg-[#FFFFFF] p-8 text-ink-900 shadow-pop">
        <BrandMark size={40} />
        <h1 className="type-module mt-5 font-display font-medium">Reset password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">If an account exists for this address, we will send reset instructions.</p>
        <Input className="mt-6 border-ink-900/10 bg-white" type="email" placeholder="you@touchwood.edu.in" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="mt-4">
          <Button
            className="rounded-none bg-[#15151A]"
            disabled={!email || sent}
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
        <Link className="mt-6 inline-block text-sm text-slate-500" to="/login">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
