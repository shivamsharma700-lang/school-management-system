package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.dto.PageResponse;
import com.schoolgroup.sms.entity.Guardian;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.entity.Staff;
import com.schoolgroup.sms.entity.UserAccount;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.AuditLogRepository;
import com.schoolgroup.sms.repository.InvoiceRepository;
import com.schoolgroup.sms.repository.StaffRepository;
import com.schoolgroup.sms.repository.StudentRepository;
import com.schoolgroup.sms.repository.UserAccountRepository;
import com.schoolgroup.sms.security.SecurityUtils;
import com.schoolgroup.sms.repository.PaymentRepository;
import com.schoolgroup.sms.service.AccessService;
import com.schoolgroup.sms.service.NotificationService;
import jakarta.persistence.criteria.Predicate;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AdminController {

    public record CreateUserRequest(
            @NotBlank String fullName,
            @NotBlank @Email String email,
            @NotBlank String username,
            @NotBlank String password,
            @NotBlank String role,
            UUID branchId,
            String mobile
    ) {
    }

    private final AccessService access;
    private final UserAccountRepository users;
    private final StudentRepository students;
    private final StaffRepository staff;
    private final InvoiceRepository invoices;
    private final AuditLogRepository auditLogs;
    private final PasswordEncoder encoder;
    private final com.schoolgroup.sms.repository.BranchRepository branches;
    private final com.schoolgroup.sms.repository.GuardianRepository guardians;
    private final com.schoolgroup.sms.repository.BookLoanRepository loans;
    private final com.schoolgroup.sms.repository.LeaveRequestRepository leaves;
    private final com.schoolgroup.sms.repository.StudentAttendanceRepository attendance;
    private final com.schoolgroup.sms.repository.NoticeRepository notices;
    private final com.schoolgroup.sms.service.ProfileWorkspaceService workspace;
    private final NotificationService notifications;
    private final PaymentRepository payments;

    public AdminController(AccessService access, UserAccountRepository users, StudentRepository students,
                           StaffRepository staff, InvoiceRepository invoices, AuditLogRepository auditLogs,
                           PasswordEncoder encoder, com.schoolgroup.sms.repository.BranchRepository branches,
                           com.schoolgroup.sms.repository.GuardianRepository guardians,
                           com.schoolgroup.sms.repository.BookLoanRepository loans,
                           com.schoolgroup.sms.repository.LeaveRequestRepository leaves,
                           com.schoolgroup.sms.repository.StudentAttendanceRepository attendance,
                           com.schoolgroup.sms.repository.NoticeRepository notices,
                           com.schoolgroup.sms.service.ProfileWorkspaceService workspace,
                           NotificationService notifications, PaymentRepository payments) {
        this.access = access;
        this.users = users;
        this.students = students;
        this.staff = staff;
        this.invoices = invoices;
        this.auditLogs = auditLogs;
        this.encoder = encoder;
        this.branches = branches;
        this.guardians = guardians;
        this.loans = loans;
        this.leaves = leaves;
        this.attendance = attendance;
        this.notices = notices;
        this.workspace = workspace;
        this.notifications = notifications;
        this.payments = payments;
    }

    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public Map<String, Object> dashboard() {
        UUID branchId = access.current().getRole() == Role.SUPER_ADMIN ? null : access.requireBranch();
        long studentCount = branchId == null ? students.count() : students.countByBranchIdAndStatus(branchId, "ACTIVE");
        long teacherCount = branchId == null ? staff.countByStaffType("TEACHER") : staff.countByBranchIdAndStaffType(branchId, "TEACHER");
        long staffCount = branchId == null ? staff.count() : staff.countByBranchId(branchId);
        long pendingFees = branchId == null
                ? invoices.countByStatus("PENDING")
                : invoices.countByBranchIdAndStatus(branchId, "PENDING");
        java.math.BigDecimal collected = branchId == null ? invoices.sumPaidAmount() : invoices.sumPaidAmountByBranchId(branchId);
        java.math.BigDecimal feeTotal = branchId == null ? invoices.sumTotalAmount() : invoices.sumTotalAmountByBranchId(branchId);
        var latest = branchId == null ? attendance.findLatestDate() : attendance.findLatestDateByBranchId(branchId);
        java.time.LocalDate attDate = latest.orElse(null);
        long marked = attDate == null ? 0
                : branchId == null ? attendance.countByAttendanceDate(attDate)
                : attendance.countByAttendanceDateAndBranchId(attDate, branchId);
        long present = attDate == null ? 0
                : branchId == null ? attendance.countByAttendanceDateAndStatusIn(attDate, java.util.List.of("PRESENT", "LATE"))
                : attendance.countByAttendanceDateAndBranchIdAndStatusIn(attDate, branchId, java.util.List.of("PRESENT", "LATE"));
        java.math.BigDecimal attPct = marked == 0 ? java.math.BigDecimal.ZERO
                : java.math.BigDecimal.valueOf(present * 100.0 / marked).setScale(1, java.math.RoundingMode.HALF_UP);
        java.time.ZoneId zone = java.time.ZoneId.of("Asia/Kolkata");
        java.time.Instant dayStart = java.time.LocalDate.now(zone).atStartOfDay(zone).toInstant();
        java.time.Instant dayEnd = dayStart.plus(1, java.time.temporal.ChronoUnit.DAYS);
        java.math.BigDecimal todayCollected = branchId == null
                ? payments.sumSuccessBetween(dayStart, dayEnd)
                : payments.sumSuccessBetweenByBranch(branchId, dayStart, dayEnd);
        java.time.LocalDate today = java.time.LocalDate.now(zone);
        long overdue = branchId == null ? invoices.countOverdue(today) : invoices.countOverdueByBranch(branchId, today);
        java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
        row.put("students", studentCount);
        row.put("teachers", teacherCount);
        row.put("staff", staffCount);
        row.put("staffMembers", Math.max(0, staffCount - teacherCount));
        row.put("pendingInvoices", pendingFees);
        row.put("feeCollected", collected);
        row.put("feeTotal", feeTotal);
        row.put("todayCollected", todayCollected);
        row.put("overdueInvoices", overdue);
        row.put("attendanceDate", attDate == null ? "" : attDate.toString());
        row.put("attendancePresent", present);
        row.put("attendanceMarked", marked);
        row.put("attendancePercent", attPct);
        row.put("unreadNotifications", notifications.unreadCount());
        row.put("role", access.current().getRole().name());
        row.put("branches", branchId == null ? branches.count() : 1);
        return row;
    }

    @GetMapping("/dashboard/analytics")
    @Transactional(readOnly = true)
    public Map<String, Object> analytics() {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.ACCOUNTANT);
        UUID branchId = access.current().getRole() == Role.SUPER_ADMIN ? null : access.requireBranch();
        java.util.List<Map<String, Object>> enrollment = students.countGroupedByClass().stream()
                .map(r -> Map.<String, Object>of("name", String.valueOf(r[0]), "value", ((Number) r[2]).longValue()))
                .toList();
        if (branchId != null) {
            enrollment = students.findAllByBranchId(branchId).stream()
                    .filter(s -> s.getSchoolClass() != null)
                    .collect(java.util.stream.Collectors.groupingBy(s -> s.getSchoolClass().getName(), java.util.LinkedHashMap::new, java.util.stream.Collectors.counting()))
                    .entrySet().stream()
                    .map(e -> Map.<String, Object>of("name", e.getKey(), "value", e.getValue()))
                    .toList();
        }
        var latest = branchId == null ? attendance.findLatestDate() : attendance.findLatestDateByBranchId(branchId);
        java.util.List<Map<String, Object>> mix = new java.util.ArrayList<>();
        latest.ifPresent(date -> attendance.countByStatusOnDate(date).forEach(r ->
                mix.add(Map.of("name", String.valueOf(r[0]), "value", ((Number) r[1]).longValue()))));
        java.util.List<Map<String, Object>> branchRows = students.countGroupedByBranch().stream()
                .map(r -> Map.<String, Object>of("name", String.valueOf(r[0]), "value", ((Number) r[1]).longValue()))
                .toList();
        java.util.List<Map<String, Object>> admissions = students.findTop8ByOrderByAdmissionDateDesc().stream()
                .filter(s -> branchId == null || s.getBranch().getId().equals(branchId))
                .map(s -> {
                    java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
                    row.put("id", s.getId());
                    row.put("name", s.getFullName());
                    row.put("className", s.getSchoolClass() == null ? "" : s.getSchoolClass().getName());
                    row.put("campus", s.getBranch().getName());
                    row.put("when", s.getAdmissionDate() == null ? "" : s.getAdmissionDate().toString());
                    return row;
                }).toList();
        java.util.List<Map<String, Object>> payments = invoices.findTop8ByStatusInOrderByIssueDateDesc(java.util.List.of("PAID", "PARTIAL")).stream()
                .filter(i -> branchId == null || i.getBranch().getId().equals(branchId))
                .map(i -> {
                    java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
                    row.put("id", i.getId());
                    row.put("name", i.getStudent().getFullName());
                    row.put("amount", i.getPaidAmount());
                    row.put("when", i.getIssueDate() == null ? "" : i.getIssueDate().toString());
                    row.put("status", i.getStatus());
                    return row;
                }).toList();
        java.util.List<Map<String, Object>> noticeRows = notices.findAll().stream()
                .filter(n -> branchId == null || n.getBranch() == null || n.getBranch().getId().equals(branchId))
                .limit(6)
                .map(n -> Map.<String, Object>of("id", n.getId(), "title", n.getTitle(), "when", n.getCreatedAt().toString()))
                .toList();
        return Map.of(
                "enrollmentByClass", enrollment,
                "attendanceMix", mix,
                "branchComparison", branchRows,
                "recentAdmissions", admissions,
                "recentPayments", payments,
                "recentNotices", noticeRows
        );
    }

    @GetMapping("/users")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> users() {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN);
        return users.findAll().stream()
                .filter(u -> access.current().getRole() == Role.SUPER_ADMIN
                        || (u.getBranch() != null && u.getBranch().getId().equals(access.current().getBranchId())))
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "fullName", u.getFullName(),
                        "email", u.getEmail(),
                        "role", u.getRole().name(),
                        "status", u.getStatus(),
                        "branchId", u.getBranch() == null ? "" : u.getBranch().getId().toString()
                )).toList();
    }

    @PostMapping("/users")
    @Transactional
    public Map<String, Object> createUser(@RequestBody CreateUserRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN);
        if (users.existsByEmailIgnoreCase(request.email())) {
            throw ApiException.conflict("Email already exists");
        }
        UserAccount user = new UserAccount();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setUsername(request.username());
        user.setPasswordHash(encoder.encode(request.password()));
        user.setRole(Role.valueOf(request.role()));
        user.setMobile(request.mobile());
        user.setStatus("ACTIVE");
        UUID branchId = access.resolveBranch(request.branchId());
        if (branchId != null) {
            user.setBranch(branches.findById(branchId).orElseThrow(() -> ApiException.notFound("Branch not found")));
        }
        users.save(user);
        return Map.of("id", user.getId(), "email", user.getEmail(), "role", user.getRole().name());
    }

    @GetMapping("/staff")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> staff() {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.ACCOUNTANT, Role.TEACHER);
        return staff.findAll().stream()
                .filter(s -> access.current().getRole() == Role.SUPER_ADMIN
                        || s.getBranch().getId().equals(access.current().getBranchId()))
                .map(s -> {
                    java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
                    row.put("id", s.getId());
                    row.put("fullName", s.getUser().getFullName());
                    row.put("email", s.getUser().getEmail());
                    row.put("employeeCode", s.getEmployeeCode());
                    row.put("designation", s.getDesignation());
                    row.put("staffType", s.getStaffType());
                    row.put("status", s.getStatus());
                    row.put("qualification", s.getQualification() == null ? "" : s.getQualification());
                    row.put("joiningDate", s.getJoiningDate() == null ? "" : s.getJoiningDate().toString());
                    row.put("branchId", s.getBranch().getId().toString());
                    row.put("branchName", s.getBranch().getName());
                    return row;
                }).toList();
    }

    @GetMapping("/staff/{id}")
    @Transactional(readOnly = true)
    public Map<String, Object> staffById(@PathVariable UUID id) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.ACCOUNTANT);
        Staff s = staff.findById(id).orElseThrow(() -> ApiException.notFound("Staff not found"));
        access.assertBranch(s.getBranch().getId());
        java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
        row.put("id", s.getId());
        row.put("fullName", s.getUser().getFullName());
        row.put("email", s.getUser().getEmail());
        row.put("employeeCode", s.getEmployeeCode());
        row.put("designation", s.getDesignation());
        row.put("staffType", s.getStaffType());
        row.put("qualification", s.getQualification() == null ? "" : s.getQualification());
        row.put("joiningDate", s.getJoiningDate().toString());
        row.put("status", s.getStatus());
        row.put("branchId", s.getBranch().getId().toString());
        row.put("branchName", s.getBranch().getName());
        return row;
    }

    @GetMapping("/staff/{id}/workspace")
    @Transactional(readOnly = true)
    public Map<String, Object> staffWorkspace(@PathVariable UUID id) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.ACCOUNTANT);
        return workspace.staffWorkspace(id);
    }

    @GetMapping("/guardians")
    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> guardians(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER);
        Specification<Guardian> spec = (root, query, cb) -> {
            List<Predicate> predicates = new java.util.ArrayList<>();
            if (StringUtils.hasText(q)) {
                String like = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), like),
                        cb.like(cb.lower(root.get("mobile")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("email"), "")), like)
                ));
            }
            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(Predicate[]::new));
        };
        var result = guardians.findAll(spec, PageRequest.of(page, Math.min(Math.max(size, 1), 100), Sort.by("fullName")));
        return new PageResponse<>(result.map(g -> Map.<String, Object>of(
                "id", g.getId(),
                "fullName", g.getFullName(),
                "mobile", g.getMobile(),
                "email", g.getEmail() == null ? "" : g.getEmail(),
                "status", g.getStatus()
        )).toList(), result.getTotalElements(), page, size);
    }

    @GetMapping("/audit-logs")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> audit(@RequestParam(defaultValue = "0") int page) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN);
        return auditLogs.findAll(PageRequest.of(page, 50, Sort.by("createdAt").descending())).stream()
                .map(a -> {
                    java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
                    row.put("id", a.getId());
                    row.put("action", a.getAction());
                    row.put("entityType", a.getEntityType());
                    row.put("entityId", a.getEntityId() == null ? "" : a.getEntityId());
                    row.put("role", a.getRole() == null ? "" : a.getRole());
                    row.put("createdAt", a.getCreatedAt().toString());
                    row.put("userName", a.getUser() == null ? "" : a.getUser().getFullName());
                    row.put("branchName", a.getBranch() == null ? "" : a.getBranch().getName());
                    row.put("details", a.getMetadata() == null ? "" : a.getMetadata());
                    return row;
                }).toList();
    }

    @GetMapping("/reports/summary")
    @Transactional(readOnly = true)
    public Map<String, Object> reports() {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.ACCOUNTANT);
        UUID branchId = access.current().getRole() == Role.SUPER_ADMIN ? null : access.requireBranch();
        long studentCount = branchId == null ? students.count() : students.countByBranchIdAndStatus(branchId, "ACTIVE");
        return Map.of(
                "students", studentCount,
                "overdueLoans", loans.findAll().stream().filter(l -> "OVERDUE".equals(l.getStatus()) || "ISSUED".equals(l.getStatus())).count(),
                "pendingLeave", leaves.findAll().stream().filter(l -> "PENDING".equals(l.getStatus())).count(),
                "generatedAt", java.time.Instant.now().toString()
        );
    }

    @GetMapping("/settings")
    public Map<String, Object> settings() {
        var user = SecurityUtils.currentUser();
        return Map.of("app", "Delhi Public School", "role", user.getRole().name(), "branchScoped", user.getRole() != Role.SUPER_ADMIN);
    }
}
