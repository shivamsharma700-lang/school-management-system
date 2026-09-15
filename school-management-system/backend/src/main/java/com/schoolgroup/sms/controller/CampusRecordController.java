package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.entity.CampusRecord;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.BranchRepository;
import com.schoolgroup.sms.repository.CampusRecordRepository;
import com.schoolgroup.sms.repository.StaffRepository;
import com.schoolgroup.sms.repository.StudentRepository;
import com.schoolgroup.sms.service.AccessService;
import com.schoolgroup.sms.service.AuditService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/campus-records")
public class CampusRecordController {

    private static final Set<String> TYPES = Set.of(
            "ENTRANCE_TEST", "INTERVIEW", "PROMOTION", "TRANSFER",
            "HEALTH", "DISCIPLINE", "SPORTS", "LAB", "PTM", "ALUMNI"
    );

    public record CampusRecordRequest(
            UUID branchId,
            UUID studentId,
            UUID staffId,
            @NotBlank String moduleType,
            @NotBlank String title,
            String category,
            String status,
            Instant scheduledAt,
            String location,
            String referenceCode,
            String details,
            String metaJson
    ) {
    }

    private final AccessService access;
    private final CampusRecordRepository records;
    private final BranchRepository branches;
    private final StudentRepository students;
    private final StaffRepository staff;
    private final AuditService audit;

    public CampusRecordController(AccessService access, CampusRecordRepository records, BranchRepository branches,
                                  StudentRepository students, StaffRepository staff, AuditService audit) {
        this.access = access;
        this.records = records;
        this.branches = branches;
        this.students = students;
        this.staff = staff;
        this.audit = audit;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(@RequestParam String type) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.ACCOUNTANT, Role.PARENT, Role.STUDENT);
        String moduleType = normalize(type);
        UUID branchId = access.current().getRole() == Role.SUPER_ADMIN ? null : access.requireBranch();
        List<CampusRecord> rows = branchId == null
                ? records.findByModuleTypeOrderByUpdatedAtDesc(moduleType)
                : records.findByModuleTypeAndBranchIdOrderByUpdatedAtDesc(moduleType, branchId);
        Role role = access.current().getRole();
        if (role == Role.PARENT || role == Role.STUDENT) {
            return rows.stream()
                    .filter(r -> r.getStudent() != null)
                    .filter(r -> {
                        try {
                            access.requireStudentAccess(r.getStudent().getId());
                            return true;
                        } catch (RuntimeException ex) {
                            return false;
                        }
                    })
                    .map(this::toRow)
                    .toList();
        }
        return rows.stream().map(this::toRow).toList();
    }

    @PostMapping
    @Transactional
    public Map<String, Object> create(@RequestBody CampusRecordRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER);
        String moduleType = normalize(request.moduleType());
        UUID branchId = access.resolveBranch(request.branchId());
        if (branchId == null) {
            throw ApiException.badRequest("branchId is required");
        }
        CampusRecord row = new CampusRecord();
        row.setBranch(branches.findById(branchId).orElseThrow(() -> ApiException.notFound("Branch not found")));
        row.setModuleType(moduleType);
        apply(row, request);
        records.save(row);
        audit.record("CREATE", moduleType, row.getId().toString(), row.getTitle());
        return toRow(row);
    }

    @PutMapping("/{id}")
    @Transactional
    public Map<String, Object> update(@PathVariable UUID id, @RequestBody CampusRecordRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER);
        CampusRecord row = records.findById(id).orElseThrow(() -> ApiException.notFound("Record not found"));
        access.assertBranch(row.getBranch().getId());
        apply(row, request);
        audit.record("UPDATE", row.getModuleType(), id.toString(), row.getTitle());
        return toRow(row);
    }

    private void apply(CampusRecord row, CampusRecordRequest request) {
        row.setTitle(request.title());
        row.setCategory(request.category());
        if (request.status() != null && !request.status().isBlank()) {
            row.setStatus(request.status());
        } else if (row.getStatus() == null) {
            row.setStatus("OPEN");
        }
        row.setScheduledAt(request.scheduledAt());
        row.setLocation(request.location());
        row.setReferenceCode(request.referenceCode());
        row.setDetails(request.details());
        row.setMetaJson(request.metaJson());
        if (request.studentId() != null) {
            var student = access.requireStudentAccess(request.studentId());
            row.setStudent(student);
            if (student.getBranch() != null) {
                access.assertBranch(student.getBranch().getId());
            }
        } else if ("HEALTH".equals(row.getModuleType()) || "DISCIPLINE".equals(row.getModuleType())) {
            throw ApiException.badRequest("studentId is required for " + row.getModuleType());
        }
        if (request.staffId() != null) {
            row.setStaff(staff.findById(request.staffId()).orElseThrow(() -> ApiException.notFound("Staff not found")));
        }
    }

    private String normalize(String type) {
        if (type == null || type.isBlank()) {
            throw ApiException.badRequest("type is required");
        }
        String value = type.trim().toUpperCase(Locale.ROOT).replace('-', '_');
        if ("TC".equals(value) || "TRANSFERS".equals(value)) {
            value = "TRANSFER";
        }
        if ("ENTRANCE_TESTS".equals(value)) {
            value = "ENTRANCE_TEST";
        }
        if ("INTERVIEWS".equals(value)) {
            value = "INTERVIEW";
        }
        if ("PROMOTIONS".equals(value)) {
            value = "PROMOTION";
        }
        if ("LABS".equals(value)) {
            value = "LAB";
        }
        if (!TYPES.contains(value)) {
            throw ApiException.badRequest("Unsupported module type: " + type);
        }
        return value;
    }

    private Map<String, Object> toRow(CampusRecord row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("branchId", row.getBranch().getId());
        map.put("branchName", row.getBranch().getName());
        map.put("moduleType", row.getModuleType());
        map.put("title", row.getTitle());
        map.put("category", row.getCategory() == null ? "" : row.getCategory());
        map.put("status", row.getStatus());
        map.put("scheduledAt", row.getScheduledAt() == null ? "" : row.getScheduledAt().toString());
        map.put("location", row.getLocation() == null ? "" : row.getLocation());
        map.put("referenceCode", row.getReferenceCode() == null ? "" : row.getReferenceCode());
        map.put("details", row.getDetails() == null ? "" : row.getDetails());
        map.put("metaJson", row.getMetaJson() == null ? "" : row.getMetaJson());
        map.put("studentId", row.getStudent() == null ? "" : row.getStudent().getId().toString());
        map.put("studentName", row.getStudent() == null ? "" : row.getStudent().getFullName());
        map.put("staffId", row.getStaff() == null ? "" : row.getStaff().getId().toString());
        map.put("staffName", row.getStaff() == null || row.getStaff().getUser() == null ? "" : row.getStaff().getUser().getFullName());
        map.put("updatedAt", row.getUpdatedAt().toString());
        return map;
    }
}
