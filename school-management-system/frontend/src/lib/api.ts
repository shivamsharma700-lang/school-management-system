const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type TokenResponse = {
  accessToken: string;
  refreshToken?: string;
  user?: unknown;
};

let refreshInFlight: Promise<boolean> | null = null;

function clearSession() {
  localStorage.removeItem("sms_access_token");
  localStorage.removeItem("sms_refresh_token");
  localStorage.removeItem("sms_user");
}

function redirectToLogin() {
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const refreshToken = localStorage.getItem("sms_refresh_token");
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const body = (await res.json()) as TokenResponse;
      if (!body.accessToken) return false;
      localStorage.setItem("sms_access_token", body.accessToken);
      if (body.refreshToken) localStorage.setItem("sms_refresh_token", body.refreshToken);
      if (body.user) localStorage.setItem("sms_user", JSON.stringify(body.user));
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

function isAuthPublicPath(path: string) {
  return (
    path.includes("/api/auth/login") ||
    path.includes("/api/auth/refresh") ||
    path.includes("/api/auth/logout") ||
    path.includes("/api/auth/forgot-password") ||
    path.includes("/api/auth/reset-password")
  );
}

export async function api<T>(path: string, options: RequestInit = {}, retried = false): Promise<T> {
  const token = localStorage.getItem("sms_access_token");
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && !isAuthPublicPath(path) && !retried) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return api<T>(path, options, true);
    }
    clearSession();
    redirectToLogin();
    throw new ApiError(401, "Session expired");
  }

  if (res.status === 401) {
    if (!isAuthPublicPath(path)) {
      clearSession();
      redirectToLogin();
    }
    throw new ApiError(401, "Unauthorized");
  }

  if (!res.ok) {
    let message = "Request failed";
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function post<T>(path: string, body?: unknown) {
  return api<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
}

export function put<T>(path: string, body: unknown) {
  return api<T>(path, { method: "PUT", body: JSON.stringify(body) });
}
