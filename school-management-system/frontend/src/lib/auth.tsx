import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { api } from "./api";

export type UserSummary = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  branchId: string | null;
  branchName: string | null;
};

type AuthState = {
  user: UserSummary | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(() => {
    const raw = localStorage.getItem("sms_user");
    return raw ? (JSON.parse(raw) as UserSummary) : null;
  });

  const value = useMemo<AuthState>(
    () => ({
      user,
      async login(username, password) {
        const res = await api<{ accessToken: string; refreshToken: string; user: UserSummary }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        });
        localStorage.setItem("sms_access_token", res.accessToken);
        localStorage.setItem("sms_refresh_token", res.refreshToken);
        localStorage.setItem("sms_user", JSON.stringify(res.user));
        setUser(res.user);
      },
      async logout() {
        const refreshToken = localStorage.getItem("sms_refresh_token");
        try {
          if (refreshToken) {
            await fetch(`${API_BASE}/api/auth/logout`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });
          }
        } catch {
          /* still clear local session */
        }
        localStorage.removeItem("sms_access_token");
        localStorage.removeItem("sms_refresh_token");
        localStorage.removeItem("sms_user");
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}
