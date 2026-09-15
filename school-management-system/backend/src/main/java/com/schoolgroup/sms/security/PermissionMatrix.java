package com.schoolgroup.sms.security;

import com.schoolgroup.sms.entity.Role;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Single source of truth for role capability.
 *
 * Services keep enforcing access through {@link com.schoolgroup.sms.service.AccessService}
 * (branch scoping, parent-child linkage, teacher-section assignment); this matrix
 * declares the coarse role capability those checks sit on top of, so the rules can
 * be asserted by tests and mirrored by the client instead of living only as
 * scattered {@code assertRoles(...)} argument lists.
 *
 * Nothing here grants access on its own — it is the allow-list a capability check
 * consults. Row-level scoping is always applied in addition.
 */
public final class PermissionMatrix {

    private PermissionMatrix() {
    }

    /** A protected area of the product. */
    public enum Resource {
        BRANCH,
        USER,
        ACADEMIC_YEAR,
        CLASS_SECTION,
        SUBJECT,
        STUDENT,
        STAFF,
        GUARDIAN,
        ATTENDANCE,
        STAFF_ATTENDANCE,
        TIMETABLE,
        HOMEWORK,
        STUDY_MATERIAL,
        EXAM,
        MARKS,
        REPORT_CARD,
        FEE_STRUCTURE,
        INVOICE,
        PAYMENT,
        DISCOUNT,
        REFUND,
        PAYROLL,
        NOTICE,
        COMPLAINT,
        LEAVE,
        EVENT,
        LIBRARY,
        INVENTORY,
        ADMISSION,
        TRANSPORT_FLEET,
        TRANSPORT_TRACKING,
        REPORT,
        AUDIT,
        SETTINGS
    }

    /** What may be done to a resource. */
    public enum Action {
        VIEW,
        CREATE,
        EDIT,
        DELETE,
        APPROVE,
        ISSUE
    }

    private static final Map<Role, Map<Resource, Set<Action>>> MATRIX = new EnumMap<>(Role.class);

    private static void grant(Role role, Resource resource, Action... actions) {
        MATRIX.computeIfAbsent(role, r -> new EnumMap<>(Resource.class))
                .computeIfAbsent(resource, r -> EnumSet.noneOf(Action.class))
                .addAll(Set.of(actions));
    }

    private static final Action[] ALL = Action.values();
    private static final Action[] READ = {Action.VIEW};
    private static final Action[] WRITE = {Action.VIEW, Action.CREATE, Action.EDIT};

    static {
        // ---- SUPER_ADMIN: every resource, every action, across all branches.
        for (Resource resource : Resource.values()) {
            grant(Role.SUPER_ADMIN, resource, ALL);
        }

        // ---- BRANCH_ADMIN: full operations, scoped to the assigned branch.
        // Cannot create branches or academic years (school-level master data),
        // and cannot read the audit trail.
        grant(Role.BRANCH_ADMIN, Resource.BRANCH, READ);
        grant(Role.BRANCH_ADMIN, Resource.ACADEMIC_YEAR, READ);
        grant(Role.BRANCH_ADMIN, Resource.USER, Action.VIEW, Action.CREATE, Action.EDIT);
        for (Resource resource : new Resource[]{
                Resource.CLASS_SECTION, Resource.SUBJECT, Resource.STUDENT, Resource.STAFF,
                Resource.GUARDIAN, Resource.ATTENDANCE, Resource.STAFF_ATTENDANCE, Resource.TIMETABLE,
                Resource.HOMEWORK, Resource.STUDY_MATERIAL, Resource.EXAM, Resource.MARKS,
                Resource.REPORT_CARD, Resource.NOTICE, Resource.COMPLAINT, Resource.LEAVE,
                Resource.EVENT, Resource.LIBRARY, Resource.INVENTORY, Resource.ADMISSION,
                Resource.TRANSPORT_FLEET, Resource.TRANSPORT_TRACKING}) {
            grant(Role.BRANCH_ADMIN, resource, ALL);
        }
        grant(Role.BRANCH_ADMIN, Resource.FEE_STRUCTURE, READ);
        grant(Role.BRANCH_ADMIN, Resource.INVOICE, READ);
        grant(Role.BRANCH_ADMIN, Resource.PAYMENT, READ);
        grant(Role.BRANCH_ADMIN, Resource.REPORT, READ);
        grant(Role.BRANCH_ADMIN, Resource.SETTINGS, Action.VIEW, Action.EDIT);

        // ---- PRINCIPAL: academic and pastoral oversight of one branch.
        // Reads finance but never edits it; approves academic workflows.
        for (Resource resource : new Resource[]{
                Resource.ATTENDANCE, Resource.STAFF_ATTENDANCE, Resource.TIMETABLE, Resource.HOMEWORK,
                Resource.STUDY_MATERIAL, Resource.EXAM, Resource.MARKS, Resource.REPORT_CARD,
                Resource.NOTICE, Resource.COMPLAINT, Resource.LEAVE, Resource.EVENT, Resource.ADMISSION}) {
            grant(Role.PRINCIPAL, resource, ALL);
        }
        grant(Role.PRINCIPAL, Resource.STUDENT, WRITE);
        grant(Role.PRINCIPAL, Resource.STAFF, READ);
        grant(Role.PRINCIPAL, Resource.GUARDIAN, READ);
        grant(Role.PRINCIPAL, Resource.CLASS_SECTION, READ);
        grant(Role.PRINCIPAL, Resource.SUBJECT, READ);
        grant(Role.PRINCIPAL, Resource.BRANCH, READ);
        grant(Role.PRINCIPAL, Resource.ACADEMIC_YEAR, READ);
        grant(Role.PRINCIPAL, Resource.LIBRARY, READ);
        grant(Role.PRINCIPAL, Resource.INVOICE, READ);
        grant(Role.PRINCIPAL, Resource.FEE_STRUCTURE, READ);
        grant(Role.PRINCIPAL, Resource.REPORT, READ);
        grant(Role.PRINCIPAL, Resource.TRANSPORT_TRACKING, READ);
        grant(Role.PRINCIPAL, Resource.SETTINGS, READ);

        // ---- TEACHER: only their assigned classes/sections (enforced per-row).
        grant(Role.TEACHER, Resource.ATTENDANCE, WRITE);
        grant(Role.TEACHER, Resource.HOMEWORK, Action.VIEW, Action.CREATE, Action.EDIT, Action.DELETE);
        grant(Role.TEACHER, Resource.STUDY_MATERIAL, Action.VIEW, Action.CREATE, Action.EDIT, Action.DELETE);
        grant(Role.TEACHER, Resource.MARKS, WRITE);
        grant(Role.TEACHER, Resource.EXAM, READ);
        grant(Role.TEACHER, Resource.REPORT_CARD, READ);
        grant(Role.TEACHER, Resource.TIMETABLE, READ);
        grant(Role.TEACHER, Resource.STUDENT, READ);
        grant(Role.TEACHER, Resource.STAFF, READ);
        grant(Role.TEACHER, Resource.CLASS_SECTION, READ);
        grant(Role.TEACHER, Resource.SUBJECT, READ);
        grant(Role.TEACHER, Resource.COMPLAINT, Action.VIEW, Action.CREATE);
        grant(Role.TEACHER, Resource.LEAVE, Action.VIEW, Action.CREATE);
        grant(Role.TEACHER, Resource.EVENT, READ);
        grant(Role.TEACHER, Resource.LIBRARY, READ);
        // "Post relevant notices where authorized" — scoped to their own sections.
        grant(Role.TEACHER, Resource.NOTICE, Action.VIEW, Action.CREATE);

        // ---- ACCOUNTANT: finance only. Explicitly no academic writes.
        grant(Role.ACCOUNTANT, Resource.FEE_STRUCTURE, ALL);
        grant(Role.ACCOUNTANT, Resource.INVOICE, ALL);
        grant(Role.ACCOUNTANT, Resource.PAYMENT, ALL);
        grant(Role.ACCOUNTANT, Resource.DISCOUNT, ALL);
        grant(Role.ACCOUNTANT, Resource.REFUND, Action.VIEW, Action.CREATE);
        grant(Role.ACCOUNTANT, Resource.PAYROLL, WRITE);
        grant(Role.ACCOUNTANT, Resource.REPORT, READ);
        grant(Role.ACCOUNTANT, Resource.STUDENT, READ);
        grant(Role.ACCOUNTANT, Resource.STAFF, READ);
        grant(Role.ACCOUNTANT, Resource.GUARDIAN, READ);
        grant(Role.ACCOUNTANT, Resource.BRANCH, READ);
        grant(Role.ACCOUNTANT, Resource.SETTINGS, READ);

        // ---- PARENT: read-only over linked children (linkage enforced per-row).
        for (Resource resource : new Resource[]{
                Resource.STUDENT, Resource.ATTENDANCE, Resource.TIMETABLE, Resource.HOMEWORK,
                Resource.STUDY_MATERIAL, Resource.EXAM, Resource.MARKS, Resource.REPORT_CARD,
                Resource.INVOICE, Resource.PAYMENT, Resource.NOTICE, Resource.EVENT,
                Resource.LIBRARY, Resource.TRANSPORT_TRACKING}) {
            grant(Role.PARENT, resource, READ);
        }
        grant(Role.PARENT, Resource.COMPLAINT, Action.VIEW, Action.CREATE);
        grant(Role.PARENT, Resource.LEAVE, Action.VIEW, Action.CREATE);

        // ---- STUDENT: read-only over their own record.
        for (Resource resource : new Resource[]{
                Resource.ATTENDANCE, Resource.TIMETABLE, Resource.HOMEWORK, Resource.STUDY_MATERIAL,
                Resource.EXAM, Resource.MARKS, Resource.REPORT_CARD, Resource.NOTICE,
                Resource.EVENT, Resource.LIBRARY, Resource.TRANSPORT_TRACKING}) {
            grant(Role.STUDENT, resource, READ);
        }
        grant(Role.STUDENT, Resource.HOMEWORK, Action.VIEW, Action.CREATE); // submissions
        grant(Role.STUDENT, Resource.LEAVE, Action.VIEW, Action.CREATE);

        // ---- TRANSPORT: fleet only. No academic or financial reach at all.
        grant(Role.TRANSPORT, Resource.TRANSPORT_FLEET, ALL);
        grant(Role.TRANSPORT, Resource.TRANSPORT_TRACKING, ALL);
        grant(Role.TRANSPORT, Resource.NOTICE, READ);
        grant(Role.TRANSPORT, Resource.LEAVE, Action.VIEW, Action.CREATE);
        grant(Role.TRANSPORT, Resource.BRANCH, READ);
        // Needs to see which students ride which route — nothing more.
        grant(Role.TRANSPORT, Resource.STUDENT, READ);
    }

    public static boolean can(Role role, Resource resource, Action action) {
        if (role == null) {
            return false;
        }
        Set<Action> allowed = MATRIX.getOrDefault(role, Map.of()).get(resource);
        return allowed != null && allowed.contains(action);
    }

    public static Set<Action> actions(Role role, Resource resource) {
        return MATRIX.getOrDefault(role, Map.of()).getOrDefault(resource, Set.of());
    }

    public static Map<Resource, Set<Action>> forRole(Role role) {
        return Map.copyOf(MATRIX.getOrDefault(role, Map.of()));
    }
}
