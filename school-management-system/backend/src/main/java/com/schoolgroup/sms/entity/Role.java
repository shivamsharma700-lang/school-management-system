package com.schoolgroup.sms.entity;

public enum Role {
    SUPER_ADMIN,
    BRANCH_ADMIN,
    PRINCIPAL,
    TEACHER,
    ACCOUNTANT,
    PARENT,
    STUDENT,
    /** Fleet operator: vehicles, drivers, routes, stops, trips, boarding. No academic or financial access. */
    TRANSPORT
}
