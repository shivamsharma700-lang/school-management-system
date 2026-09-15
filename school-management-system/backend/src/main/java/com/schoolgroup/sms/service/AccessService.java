package com.schoolgroup.sms.service;

import com.schoolgroup.sms.entity.Guardian;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.entity.Staff;
import com.schoolgroup.sms.entity.Student;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.GuardianRepository;
import com.schoolgroup.sms.repository.GuardianStudentRepository;
import com.schoolgroup.sms.repository.StaffRepository;
import com.schoolgroup.sms.repository.StudentRepository;
import com.schoolgroup.sms.repository.TeacherAssignmentRepository;
import com.schoolgroup.sms.security.AuthUser;
import com.schoolgroup.sms.security.PermissionMatrix;
import com.schoolgroup.sms.security.PermissionMatrix.Action;
import com.schoolgroup.sms.security.PermissionMatrix.Resource;
import com.schoolgroup.sms.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AccessService {

    private final StudentRepository students;
    private final GuardianRepository guardians;
    private final GuardianStudentRepository guardianStudents;
    private final StaffRepository staff;
    private final TeacherAssignmentRepository teacherAssignments;

    public AccessService(StudentRepository students,
                         GuardianRepository guardians,
                         GuardianStudentRepository guardianStudents,
                         StaffRepository staff,
                         TeacherAssignmentRepository teacherAssignments) {
        this.students = students;
        this.guardians = guardians;
        this.guardianStudents = guardianStudents;
        this.staff = staff;
        this.teacherAssignments = teacherAssignments;
    }

    public AuthUser current() {
        return SecurityUtils.currentUser();
    }

    public UUID requireBranch() {
        AuthUser user = current();
        if (user.getRole() == Role.SUPER_ADMIN) {
            return null;
        }
        if (user.getBranchId() == null) {
            throw ApiException.forbidden("No branch assigned");
        }
        return user.getBranchId();
    }

    public UUID resolveBranch(UUID requestedBranchId) {
        AuthUser user = current();
        if (user.getRole() == Role.SUPER_ADMIN) {
            return requestedBranchId;
        }
        UUID assigned = requireBranch();
        if (requestedBranchId != null && !requestedBranchId.equals(assigned)) {
            throw ApiException.forbidden("Cannot access another branch");
        }
        return assigned;
    }

    public void assertBranch(UUID resourceBranchId) {
        if (resourceBranchId == null) {
            return;
        }
        AuthUser user = current();
        if (user.getRole() == Role.SUPER_ADMIN) {
            return;
        }
        if (user.getBranchId() == null || !user.getBranchId().equals(resourceBranchId)) {
            throw ApiException.forbidden("Branch access denied");
        }
    }

    /**
     * Capability gate backed by {@link PermissionMatrix}.
     *
     * Prefer this over ad-hoc {@code assertRoles(...)} lists: the matrix is the
     * declared contract the RBAC suite asserts against, so a rule change is made
     * in one place instead of drifting across services. Row-level scoping
     * (branch, guardian link, teacher section) is still applied separately.
     */
    public void assertCan(Resource resource, Action action) {
        Role role = current().getRole();
        if (!PermissionMatrix.can(role, resource, action)) {
            throw ApiException.forbidden("Not permitted: " + action + " " + resource);
        }
    }

    public boolean can(Resource resource, Action action) {
        return PermissionMatrix.can(current().getRole(), resource, action);
    }

    public void assertRoles(Role... roles) {
        Role current = current().getRole();
        for (Role role : roles) {
            if (current == role) {
                return;
            }
        }
        throw ApiException.forbidden("Insufficient role");
    }

    public boolean isAdminLike() {
        Role role = current().getRole();
        return role == Role.SUPER_ADMIN || role == Role.BRANCH_ADMIN || role == Role.PRINCIPAL;
    }

    public Student requireStudentAccess(UUID studentId) {
        Student student = students.findById(studentId).orElseThrow(() -> ApiException.notFound("Student not found"));
        AuthUser user = current();
        switch (user.getRole()) {
            case SUPER_ADMIN -> {
                return student;
            }
            case BRANCH_ADMIN, PRINCIPAL, ACCOUNTANT -> {
                assertBranch(student.getBranch().getId());
                return student;
            }
            case TEACHER -> {
                assertBranch(student.getBranch().getId());
                assertTeacherAssignedToStudent(student);
                return student;
            }
            case PARENT -> {
                Guardian guardian = guardians.findByUserId(user.getId())
                        .orElseThrow(() -> ApiException.forbidden("Parent profile not found"));
                if (!guardianStudents.existsByGuardianIdAndStudentId(guardian.getId(), studentId)) {
                    throw ApiException.forbidden("Not linked to this student");
                }
                return student;
            }
            case STUDENT -> {
                Student own = students.findByUserId(user.getId())
                        .orElseThrow(() -> ApiException.forbidden("Student profile not found"));
                if (!own.getId().equals(studentId)) {
                    throw ApiException.forbidden("Cannot access another student");
                }
                return student;
            }
            default -> throw ApiException.forbidden("Access denied");
        }
    }

    public void assertTeacherSection(UUID sectionId, UUID academicYearId) {
        if (current().getRole() != Role.TEACHER) {
            return;
        }
        Staff teacher = requireStaff();
        if (sectionId == null) {
            throw ApiException.forbidden("Not assigned to this class section");
        }
        boolean assigned = academicYearId != null
                && teacherAssignments.existsByStaffIdAndSectionIdAndAcademicYearId(teacher.getId(), sectionId, academicYearId);
        if (!assigned) {
            assigned = teacherAssignments.findByStaffId(teacher.getId()).stream()
                    .anyMatch(a -> a.getSection() != null && sectionId.equals(a.getSection().getId()));
        }
        if (!assigned) {
            throw ApiException.forbidden("Not assigned to this class section");
        }
    }

    public void assertTeacherAssignedToStudent(Student student) {
        if (current().getRole() != Role.TEACHER) {
            return;
        }
        if (student.getSection() == null) {
            throw ApiException.forbidden("Student has no section assignment");
        }
        UUID yearId = student.getAcademicYear() == null ? null : student.getAcademicYear().getId();
        assertTeacherSection(student.getSection().getId(), yearId);
    }

    /** Section IDs the current teacher is assigned to (empty for non-teachers). */
    public java.util.Set<UUID> teacherAssignedSectionIds() {
        if (current().getRole() != Role.TEACHER) {
            return java.util.Set.of();
        }
        Staff teacher = requireStaff();
        return teacherAssignments.findByStaffId(teacher.getId()).stream()
                .filter(a -> a.getSection() != null)
                .map(a -> a.getSection().getId())
                .collect(java.util.stream.Collectors.toCollection(java.util.LinkedHashSet::new));
    }

    public Staff requireStaff() {
        return staff.findByUserId(current().getId())
                .orElseThrow(() -> ApiException.forbidden("Staff profile not found"));
    }

    public void assertOwnStaffOrAdmin(UUID staffId) {
        Role role = current().getRole();
        if (role == Role.SUPER_ADMIN || role == Role.BRANCH_ADMIN || role == Role.PRINCIPAL || role == Role.ACCOUNTANT) {
            return;
        }
        if (role == Role.TEACHER) {
            Staff self = requireStaff();
            if (!self.getId().equals(staffId)) {
                throw ApiException.forbidden("Teachers may only open their own staff profile");
            }
            return;
        }
        throw ApiException.forbidden("Access denied");
    }
}
