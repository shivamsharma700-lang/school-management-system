package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.entity.PayrollEntry;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.entity.StudyPaper;
import com.schoolgroup.sms.entity.UserAccount;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.BranchRepository;
import com.schoolgroup.sms.repository.PayrollEntryRepository;
import com.schoolgroup.sms.repository.StaffRepository;
import com.schoolgroup.sms.repository.StudyPaperRepository;
import com.schoolgroup.sms.repository.UserAccountRepository;
import com.schoolgroup.sms.service.AccessService;
import com.schoolgroup.sms.service.AuditService;
import com.schoolgroup.sms.service.NotificationService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PayrollStudyController {

    public record PayrollRequest(
            UUID branchId,
            @NotNull UUID staffId,
            @NotBlank String payMonth,
            @NotNull BigDecimal grossAmount,
            @NotNull BigDecimal netAmount,
            String status,
            String notes
    ) {
    }

    public record StudyPaperRequest(
            UUID branchId,
            @NotBlank String title,
            String subjectName,
            String className,
            String sectionName,
            String examName,
            String paperType,
            UUID fileId,
            String status,
            String description
    ) {
    }

    public record ReviewRequest(String notes) {
    }

    private static final Set<String> PAPER_STATUSES = Set.of("DRAFT", "SUBMITTED", "APPROVED", "PUBLISHED", "REJECTED");

    private final AccessService access;
    private final PayrollEntryRepository payroll;
    private final StudyPaperRepository papers;
    private final BranchRepository branches;
    private final StaffRepository staff;
    private final UserAccountRepository users;
    private final AuditService audit;
    private final NotificationService notifications;

    public PayrollStudyController(AccessService access, PayrollEntryRepository payroll, StudyPaperRepository papers,
                                  BranchRepository branches, StaffRepository staff, UserAccountRepository users,
                                  AuditService audit, NotificationService notifications) {
        this.access = access;
        this.payroll = payroll;
        this.papers = papers;
        this.branches = branches;
        this.staff = staff;
        this.users = users;
        this.audit = audit;
        this.notifications = notifications;
    }

    @GetMapping("/payroll")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listPayroll() {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.ACCOUNTANT);
        UUID branchId = access.current().getRole() == Role.SUPER_ADMIN ? null : access.requireBranch();
        List<PayrollEntry> rows = branchId == null ? payroll.findAllByOrderByPayMonthDesc() : payroll.findByBranchIdOrderByPayMonthDesc(branchId);
        return rows.stream().map(this::toPayroll).toList();
    }

    @PostMapping("/payroll")
    @Transactional
    public Map<String, Object> createPayroll(@RequestBody PayrollRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.ACCOUNTANT);
        var staffRow = staff.findById(request.staffId()).orElseThrow(() -> ApiException.notFound("Staff not found"));
        access.assertBranch(staffRow.getBranch().getId());
        UUID branchId = access.resolveBranch(request.branchId() != null ? request.branchId() : staffRow.getBranch().getId());
        PayrollEntry entry = new PayrollEntry();
        entry.setBranch(branches.findById(branchId).orElseThrow(() -> ApiException.notFound("Branch not found")));
        entry.setStaff(staffRow);
        entry.setPayMonth(request.payMonth());
        entry.setGrossAmount(request.grossAmount());
        entry.setNetAmount(request.netAmount());
        entry.setStatus(request.status() == null || request.status().isBlank() ? "DRAFT" : request.status());
        entry.setNotes(request.notes());
        payroll.save(entry);
        audit.record("CREATE", "PAYROLL", entry.getId().toString(), staffRow.getUser().getFullName() + " " + entry.getPayMonth());
        return toPayroll(entry);
    }

    @PutMapping("/payroll/{id}")
    @Transactional
    public Map<String, Object> updatePayroll(@PathVariable UUID id, @RequestBody PayrollRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.ACCOUNTANT);
        PayrollEntry entry = payroll.findById(id).orElseThrow(() -> ApiException.notFound("Payroll entry not found"));
        access.assertBranch(entry.getBranch().getId());
        if (request.staffId() != null) {
            entry.setStaff(staff.findById(request.staffId()).orElseThrow(() -> ApiException.notFound("Staff not found")));
        }
        entry.setPayMonth(request.payMonth());
        entry.setGrossAmount(request.grossAmount());
        entry.setNetAmount(request.netAmount());
        if (request.status() != null && !request.status().isBlank()) {
            entry.setStatus(request.status());
        }
        entry.setNotes(request.notes());
        audit.record("UPDATE", "PAYROLL", id.toString(), entry.getPayMonth());
        return toPayroll(entry);
    }

    @GetMapping("/study-papers")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listPapers() {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.STUDENT, Role.PARENT);
        UUID branchId = access.current().getRole() == Role.SUPER_ADMIN ? null : access.current().getBranchId();
        Role role = access.current().getRole();
        boolean publishedOnly = role == Role.PARENT || role == Role.STUDENT;
        List<StudyPaper> rows = branchId == null
                ? papers.findAllByOrderByCreatedAtDesc()
                : papers.findByBranchIdOrderByCreatedAtDesc(branchId);
        return rows.stream()
                .filter(p -> !publishedOnly || "PUBLISHED".equals(p.getStatus()))
                .filter(p -> role != Role.TEACHER || canTeacherSee(p))
                .map(this::toPaper)
                .toList();
    }

    @PostMapping("/study-papers")
    @Transactional
    public Map<String, Object> createPaper(@RequestBody StudyPaperRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER);
        UUID branchId = access.resolveBranch(request.branchId());
        if (branchId == null) {
            throw ApiException.badRequest("branchId is required");
        }
        UserAccount creator = users.findById(access.current().getId()).orElseThrow();
        String status = normalizeStatus(request.status(), access.current().getRole() == Role.TEACHER ? "DRAFT" : "DRAFT");
        if (access.current().getRole() == Role.TEACHER && !Set.of("DRAFT", "SUBMITTED").contains(status)) {
            throw ApiException.badRequest("Teachers can only create DRAFT or SUBMITTED papers");
        }
        StudyPaper paper = new StudyPaper();
        paper.setBranch(branches.findById(branchId).orElseThrow(() -> ApiException.notFound("Branch not found")));
        paper.setTitle(request.title());
        paper.setSubjectName(request.subjectName());
        paper.setClassName(request.className());
        paper.setSectionName(request.sectionName());
        paper.setExamName(request.examName());
        paper.setPaperType(request.paperType() == null || request.paperType().isBlank() ? "WORKSHEET" : request.paperType());
        paper.setFileId(request.fileId());
        paper.setStatus(status);
        paper.setDescription(request.description());
        paper.setCreatedBy(creator);
        papers.save(paper);
        audit.record("CREATE", "STUDY_PAPER", paper.getId().toString(), paper.getTitle() + " [" + status + "]");
        return toPaper(paper);
    }

    @PutMapping("/study-papers/{id}/submit")
    @Transactional
    public Map<String, Object> submitPaper(@PathVariable UUID id) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER);
        StudyPaper paper = requirePaper(id);
        assertPaperOwnerOrAdmin(paper);
        if (!Set.of("DRAFT", "REJECTED").contains(paper.getStatus())) {
            throw ApiException.badRequest("Only DRAFT or REJECTED papers can be submitted");
        }
        paper.setStatus("SUBMITTED");
        paper.setReviewNotes(null);
        audit.record("SUBMIT", "STUDY_PAPER", paper.getId().toString(), paper.getTitle());
        return toPaper(paper);
    }

    @PutMapping("/study-papers/{id}/approve")
    @Transactional
    public Map<String, Object> approvePaper(@PathVariable UUID id, @RequestBody(required = false) ReviewRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        StudyPaper paper = requirePaper(id);
        if (!"SUBMITTED".equals(paper.getStatus()) && !"APPROVED".equals(paper.getStatus())) {
            throw ApiException.badRequest("Only SUBMITTED papers can be approved");
        }
        UserAccount reviewer = users.findById(access.current().getId()).orElseThrow();
        paper.setStatus("APPROVED");
        paper.setReviewedBy(reviewer);
        if (request != null && request.notes() != null) {
            paper.setReviewNotes(request.notes());
        }
        audit.record("APPROVE", "STUDY_PAPER", paper.getId().toString(), paper.getTitle());
        notifyCreator(paper, "Question paper approved", paper.getTitle() + " was approved");
        return toPaper(paper);
    }

    @PutMapping("/study-papers/{id}/reject")
    @Transactional
    public Map<String, Object> rejectPaper(@PathVariable UUID id, @RequestBody(required = false) ReviewRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        StudyPaper paper = requirePaper(id);
        if (!"SUBMITTED".equals(paper.getStatus())) {
            throw ApiException.badRequest("Only SUBMITTED papers can be rejected");
        }
        UserAccount reviewer = users.findById(access.current().getId()).orElseThrow();
        paper.setStatus("REJECTED");
        paper.setReviewedBy(reviewer);
        paper.setReviewNotes(request == null ? null : request.notes());
        audit.record("REJECT", "STUDY_PAPER", paper.getId().toString(), paper.getTitle());
        notifyCreator(paper, "Question paper needs revision",
                paper.getTitle() + (paper.getReviewNotes() == null ? "" : ": " + paper.getReviewNotes()));
        return toPaper(paper);
    }

    @PutMapping("/study-papers/{id}/publish")
    @Transactional
    public Map<String, Object> publishPaper(@PathVariable UUID id) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        StudyPaper paper = requirePaper(id);
        if (!Set.of("APPROVED", "SUBMITTED").contains(paper.getStatus())) {
            throw ApiException.badRequest("Paper must be APPROVED (or SUBMITTED) before publish");
        }
        UserAccount reviewer = users.findById(access.current().getId()).orElseThrow();
        paper.setStatus("PUBLISHED");
        paper.setReviewedBy(reviewer);
        audit.record("PUBLISH", "STUDY_PAPER", paper.getId().toString(), paper.getTitle());
        notifyCreator(paper, "Question paper published", paper.getTitle() + " is now visible to students/parents");
        return toPaper(paper);
    }

    private boolean canTeacherSee(StudyPaper paper) {
        if ("PUBLISHED".equals(paper.getStatus()) || "APPROVED".equals(paper.getStatus()) || "SUBMITTED".equals(paper.getStatus())) {
            return true;
        }
        UUID uid = access.current().getId();
        return paper.getCreatedBy() != null && paper.getCreatedBy().getId().equals(uid);
    }

    private StudyPaper requirePaper(UUID id) {
        StudyPaper paper = papers.findById(id).orElseThrow(() -> ApiException.notFound("Study paper not found"));
        access.assertBranch(paper.getBranch().getId());
        return paper;
    }

    private void assertPaperOwnerOrAdmin(StudyPaper paper) {
        Role role = access.current().getRole();
        if (role == Role.TEACHER) {
            UUID uid = access.current().getId();
            if (paper.getCreatedBy() == null || !paper.getCreatedBy().getId().equals(uid)) {
                throw ApiException.forbidden("You can only submit your own papers");
            }
        }
    }

    private String normalizeStatus(String raw, String fallback) {
        String status = raw == null || raw.isBlank() ? fallback : raw.trim().toUpperCase(Locale.ROOT);
        if (!PAPER_STATUSES.contains(status)) {
            throw ApiException.badRequest("Invalid paper status");
        }
        return status;
    }

    private void notifyCreator(StudyPaper paper, String title, String body) {
        if (paper.getCreatedBy() != null) {
            notifications.notifyUser(paper.getCreatedBy(), paper.getBranch(), "STUDY_PAPER", title, body,
                    "STUDY_PAPER", paper.getId());
        }
    }

    private Map<String, Object> toPayroll(PayrollEntry entry) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", entry.getId());
        row.put("branchId", entry.getBranch().getId());
        row.put("branchName", entry.getBranch().getName());
        row.put("staffId", entry.getStaff().getId());
        row.put("staffName", entry.getStaff().getUser().getFullName());
        row.put("employeeCode", entry.getStaff().getEmployeeCode());
        row.put("department", entry.getStaff().getDesignation());
        row.put("payMonth", entry.getPayMonth());
        row.put("grossAmount", entry.getGrossAmount());
        row.put("netAmount", entry.getNetAmount());
        row.put("amount", entry.getNetAmount());
        row.put("status", entry.getStatus());
        row.put("notes", entry.getNotes() == null ? "" : entry.getNotes());
        return row;
    }

    private Map<String, Object> toPaper(StudyPaper paper) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", paper.getId());
        row.put("branchId", paper.getBranch().getId());
        row.put("branchName", paper.getBranch().getName());
        row.put("title", paper.getTitle());
        row.put("subjectName", paper.getSubjectName() == null ? "" : paper.getSubjectName());
        row.put("className", paper.getClassName() == null ? "" : paper.getClassName());
        row.put("sectionName", paper.getSectionName() == null ? "" : paper.getSectionName());
        row.put("examName", paper.getExamName() == null ? "" : paper.getExamName());
        row.put("paperType", paper.getPaperType());
        row.put("fileId", paper.getFileId() == null ? "" : paper.getFileId().toString());
        row.put("status", paper.getStatus());
        row.put("description", paper.getDescription() == null ? "" : paper.getDescription());
        row.put("reviewNotes", paper.getReviewNotes() == null ? "" : paper.getReviewNotes());
        row.put("createdByName", paper.getCreatedBy() == null ? "" : paper.getCreatedBy().getFullName());
        row.put("reviewedByName", paper.getReviewedBy() == null ? "" : paper.getReviewedBy().getFullName());
        return row;
    }
}
