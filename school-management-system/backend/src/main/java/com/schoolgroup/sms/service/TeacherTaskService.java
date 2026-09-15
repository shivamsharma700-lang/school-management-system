package com.schoolgroup.sms.service;

import com.schoolgroup.sms.entity.Branch;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.entity.SchoolClass;
import com.schoolgroup.sms.entity.Section;
import com.schoolgroup.sms.entity.Staff;
import com.schoolgroup.sms.entity.Subject;
import com.schoolgroup.sms.entity.TeacherTask;
import com.schoolgroup.sms.entity.UserAccount;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.BranchRepository;
import com.schoolgroup.sms.repository.SchoolClassRepository;
import com.schoolgroup.sms.repository.SectionRepository;
import com.schoolgroup.sms.repository.StaffRepository;
import com.schoolgroup.sms.repository.SubjectRepository;
import com.schoolgroup.sms.repository.TeacherTaskRepository;
import com.schoolgroup.sms.repository.UserAccountRepository;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class TeacherTaskService {

    public record CreateRequest(
            UUID branchId,
            @NotNull UUID assigneeStaffId,
            @NotBlank String title,
            @NotBlank String description,
            String priority,
            @NotNull LocalDate dueDate,
            UUID classId,
            UUID sectionId,
            UUID subjectId,
            UUID attachmentFileId
    ) {
    }

    public record StatusRequest(@NotBlank String status) {
    }

    private static final Set<String> STATUSES = Set.of("TODO", "IN_PROGRESS", "COMPLETED");
    private static final Set<String> PRIORITIES = Set.of("LOW", "MEDIUM", "HIGH");

    private final AccessService access;
    private final TeacherTaskRepository tasks;
    private final StaffRepository staff;
    private final BranchRepository branches;
    private final SchoolClassRepository classes;
    private final SectionRepository sections;
    private final SubjectRepository subjects;
    private final UserAccountRepository users;
    private final NotificationService notifications;
    private final AuditService audit;

    public TeacherTaskService(AccessService access, TeacherTaskRepository tasks, StaffRepository staff,
                              BranchRepository branches, SchoolClassRepository classes, SectionRepository sections,
                              SubjectRepository subjects, UserAccountRepository users,
                              NotificationService notifications, AuditService audit) {
        this.access = access;
        this.tasks = tasks;
        this.staff = staff;
        this.branches = branches;
        this.classes = classes;
        this.sections = sections;
        this.subjects = subjects;
        this.users = users;
        this.notifications = notifications;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(String status, String priority) {
        Role role = access.current().getRole();
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER);
        List<TeacherTask> rows;
        if (role == Role.TEACHER) {
            Staff me = access.requireStaff();
            rows = tasks.findByAssigneeIdOrderByDueDateAscCreatedAtDesc(me.getId());
        } else if (role == Role.SUPER_ADMIN) {
            rows = tasks.findAllByOrderByDueDateAscCreatedAtDesc();
        } else {
            rows = tasks.findByBranchIdOrderByDueDateAscCreatedAtDesc(access.requireBranch());
        }
        return rows.stream()
                .filter(t -> status == null || status.isBlank() || status.equalsIgnoreCase(t.getStatus()))
                .filter(t -> priority == null || priority.isBlank() || priority.equalsIgnoreCase(t.getPriority()))
                .map(this::toMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> summary() {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER);
        List<Map<String, Object>> all = list(null, null);
        LocalDate today = LocalDate.now();
        long todo = all.stream().filter(r -> "TODO".equals(r.get("status"))).count();
        long inProgress = all.stream().filter(r -> "IN_PROGRESS".equals(r.get("status"))).count();
        long completed = all.stream().filter(r -> "COMPLETED".equals(r.get("status"))).count();
        long overdue = all.stream()
                .filter(r -> !"COMPLETED".equals(r.get("status")))
                .filter(r -> {
                    Object due = r.get("dueDate");
                    return due != null && LocalDate.parse(String.valueOf(due)).isBefore(today);
                })
                .count();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("todo", todo);
        out.put("inProgress", inProgress);
        out.put("completed", completed);
        out.put("overdue", overdue);
        out.put("total", all.size());
        return out;
    }

    @Transactional
    public Map<String, Object> create(CreateRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        Staff assignee = staff.findById(request.assigneeStaffId())
                .orElseThrow(() -> ApiException.notFound("Staff not found"));
        access.assertBranch(assignee.getBranch().getId());
        UUID branchId = access.resolveBranch(request.branchId() != null ? request.branchId() : assignee.getBranch().getId());
        Branch branch = branches.findById(branchId).orElseThrow(() -> ApiException.notFound("Branch not found"));
        UserAccount assigner = users.findById(access.current().getId()).orElseThrow();

        String priority = request.priority() == null || request.priority().isBlank() ? "MEDIUM" : request.priority().toUpperCase();
        if (!PRIORITIES.contains(priority)) {
            throw ApiException.badRequest("priority must be LOW, MEDIUM or HIGH");
        }

        TeacherTask task = new TeacherTask();
        task.setBranch(branch);
        task.setAssignedBy(assigner);
        task.setAssignee(assignee);
        task.setTitle(request.title().trim());
        task.setDescription(request.description().trim());
        task.setPriority(priority);
        task.setStatus("TODO");
        task.setDueDate(request.dueDate());
        task.setAttachmentFileId(request.attachmentFileId());
        if (request.classId() != null) {
            SchoolClass sc = classes.findById(request.classId()).orElseThrow(() -> ApiException.notFound("Class not found"));
            access.assertBranch(sc.getBranch().getId());
            task.setSchoolClass(sc);
        }
        if (request.sectionId() != null) {
            Section section = sections.findById(request.sectionId()).orElseThrow(() -> ApiException.notFound("Section not found"));
            access.assertBranch(section.getSchoolClass().getBranch().getId());
            task.setSection(section);
        }
        if (request.subjectId() != null) {
            Subject subject = subjects.findById(request.subjectId()).orElseThrow(() -> ApiException.notFound("Subject not found"));
            access.assertBranch(subject.getBranch().getId());
            task.setSubject(subject);
        }
        tasks.save(task);
        audit.record("CREATE", "TEACHER_TASK", task.getId().toString(), task.getTitle() + " → " + assignee.getUser().getFullName());
        notifications.notifyUser(assignee.getUser(), branch, "TASK",
                "New task assigned", task.getTitle() + " · due " + task.getDueDate(),
                "TEACHER_TASK", task.getId());
        return toMap(task);
    }

    @Transactional
    public Map<String, Object> updateStatus(UUID id, StatusRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER);
        TeacherTask task = tasks.findById(id).orElseThrow(() -> ApiException.notFound("Task not found"));
        access.assertBranch(task.getBranch().getId());
        Role role = access.current().getRole();
        if (role == Role.TEACHER) {
            Staff me = access.requireStaff();
            if (!me.getId().equals(task.getAssignee().getId())) {
                throw ApiException.forbidden("You can only update your own tasks");
            }
        }
        String status = request.status().trim().toUpperCase();
        if (!STATUSES.contains(status)) {
            throw ApiException.badRequest("status must be TODO, IN_PROGRESS or COMPLETED");
        }
        task.setStatus(status);
        task.setCompletedAt("COMPLETED".equals(status) ? Instant.now() : null);
        audit.record("UPDATE", "TEACHER_TASK", task.getId().toString(), task.getTitle() + " → " + status);
        if ("COMPLETED".equals(status)) {
            notifications.notifyUser(task.getAssignedBy(), task.getBranch(), "TASK",
                    "Task completed", task.getAssignee().getUser().getFullName() + ": " + task.getTitle(),
                    "TEACHER_TASK", task.getId());
        }
        return toMap(task);
    }

    private Map<String, Object> toMap(TeacherTask task) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", task.getId());
        row.put("branchId", task.getBranch().getId());
        row.put("branchName", task.getBranch().getName());
        row.put("title", task.getTitle());
        row.put("description", task.getDescription());
        row.put("priority", task.getPriority());
        row.put("status", task.getStatus());
        row.put("dueDate", task.getDueDate().toString());
        row.put("overdue", !"COMPLETED".equals(task.getStatus()) && task.getDueDate().isBefore(LocalDate.now()));
        row.put("assigneeStaffId", task.getAssignee().getId());
        row.put("assigneeName", task.getAssignee().getUser().getFullName());
        row.put("assignedByUserId", task.getAssignedBy().getId());
        row.put("assignedByName", task.getAssignedBy().getFullName());
        row.put("classId", task.getSchoolClass() == null ? "" : task.getSchoolClass().getId().toString());
        row.put("className", task.getSchoolClass() == null ? "" : task.getSchoolClass().getName());
        row.put("sectionId", task.getSection() == null ? "" : task.getSection().getId().toString());
        row.put("sectionName", task.getSection() == null ? "" : task.getSection().getName());
        row.put("subjectId", task.getSubject() == null ? "" : task.getSubject().getId().toString());
        row.put("subjectName", task.getSubject() == null ? "" : task.getSubject().getName());
        row.put("attachmentFileId", task.getAttachmentFileId() == null ? "" : task.getAttachmentFileId().toString());
        row.put("completedAt", task.getCompletedAt() == null ? "" : task.getCompletedAt().toString());
        row.put("createdAt", task.getCreatedAt() == null ? "" : task.getCreatedAt().toString());
        return row;
    }
}
