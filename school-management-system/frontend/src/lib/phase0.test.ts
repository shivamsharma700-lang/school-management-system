import { describe, expect, it } from "vitest";
import { canAccessPath } from "../lib/nav";
import { DEMO_MODE } from "../demo/config";
import { DEMO_ONLY_PATHS, MODULE_REGISTRY } from "../lib/moduleRegistry";

describe("Phase 0 foundation", () => {
  it("DEMO_MODE defaults off", () => {
    expect(DEMO_MODE).toBe(false);
  });

  it("enforces route RBAC by role", () => {
    expect(canAccessPath("TEACHER", "/app/students")).toBe(true);
    expect(canAccessPath("TEACHER", "/app/students/abc")).toBe(true);
    expect(canAccessPath("TEACHER", "/app/fees")).toBe(false);
    expect(canAccessPath("ACCOUNTANT", "/app/payments")).toBe(true);
    expect(canAccessPath("ACCOUNTANT", "/app/attendance")).toBe(false);
    expect(canAccessPath("PARENT", "/app/children")).toBe(true);
    expect(canAccessPath("STUDENT", "/app/users")).toBe(false);
  });

  it("registers live modules and keeps website content as static", () => {
    expect(DEMO_ONLY_PATHS.has("/app/events")).toBe(false);
    expect(DEMO_ONLY_PATHS.has("/app/inventory")).toBe(false);
    expect(DEMO_ONLY_PATHS.has("/app/health")).toBe(false);
    expect(DEMO_ONLY_PATHS.has("/app/website-content")).toBe(true);
    expect(MODULE_REGISTRY.some((m) => m.path === "/app/students" && m.status === "LIVE_API")).toBe(true);
    expect(MODULE_REGISTRY.some((m) => m.path === "/app/admissions" && m.status === "LIVE_API")).toBe(true);
    expect(MODULE_REGISTRY.some((m) => m.path === "/app/hr" && m.status === "LIVE_API")).toBe(true);
    expect(MODULE_REGISTRY.some((m) => m.path === "/app/bus-tracking" && m.status === "LIVE_API")).toBe(true);
  });
});
