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
        Staff teacher = staff.findByUserId(current().getId())
                .orElseThrow(() -> ApiException.forbidden("Teacher profile not found"));
        if (!teacherAssignments.existsByStaffIdAndSectionIdAndAcademicYearId(teacher.getId(), sectionId, academicYearId)) {
            throw ApiException.forbidden("Not assigned to this class section");
        }
    }

    public Staff requireStaff() {
        return staff.findByUserId(current().getId())
                .orElseThrow(() -> ApiException.forbidden("Staff profile not found"));
    }
}
