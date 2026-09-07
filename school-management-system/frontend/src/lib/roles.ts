export const ALL_ROLES = [
  "SUPER_ADMIN",
  "BRANCH_ADMIN",
  "PRINCIPAL",
  "TEACHER",
  "ACCOUNTANT",
  "PARENT",
  "STUDENT",
] as const;

export type AppRole = (typeof ALL_ROLES)[number];

export function isSuper(role?: string | null) {
  return role === "SUPER_ADMIN";
}

export function isAdminLike(role?: string | null) {
  return role === "SUPER_ADMIN" || role === "BRANCH_ADMIN" || role === "PRINCIPAL";
}

export function canManageUsers(role?: string | null) {
  return role === "SUPER_ADMIN" || role === "BRANCH_ADMIN";
}

export function canSeeStaff(role?: string | null) {
  return isAdminLike(role) || role === "ACCOUNTANT";
}

export function canFinance(role?: string | null) {
  return isAdminLike(role) || role === "ACCOUNTANT";
}

export function canTeach(role?: string | null) {
  return isAdminLike(role) || role === "TEACHER";
}

export function canSeeStudents(role?: string | null) {
  return role !== "PARENT";
}

export function canAudit(role?: string | null) {
  return role === "SUPER_ADMIN" || role === "BRANCH_ADMIN";
}

export function canReports(role?: string | null) {
  return isAdminLike(role) || role === "ACCOUNTANT";
}

export function canLibraryAdmin(role?: string | null) {
  return isAdminLike(role);
}
