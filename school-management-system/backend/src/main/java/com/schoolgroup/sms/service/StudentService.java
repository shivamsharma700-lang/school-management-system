package com.schoolgroup.sms.service;

import com.schoolgroup.sms.dto.PageResponse;
import com.schoolgroup.sms.dto.SchoolDtos;
import com.schoolgroup.sms.entity.AcademicYear;
import com.schoolgroup.sms.entity.Branch;
import com.schoolgroup.sms.entity.Enrollment;
import com.schoolgroup.sms.entity.Guardian;
import com.schoolgroup.sms.entity.GuardianStudent;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.entity.SchoolClass;
import com.schoolgroup.sms.entity.Section;
import com.schoolgroup.sms.entity.Student;
import com.schoolgroup.sms.entity.UserAccount;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.AcademicYearRepository;
import com.schoolgroup.sms.repository.BranchRepository;
import com.schoolgroup.sms.repository.EnrollmentRepository;
import com.schoolgroup.sms.repository.GuardianRepository;
import com.schoolgroup.sms.repository.GuardianStudentRepository;
import com.schoolgroup.sms.repository.SchoolClassRepository;
import com.schoolgroup.sms.repository.SectionRepository;
import com.schoolgroup.sms.repository.StudentRepository;
import com.schoolgroup.sms.repository.UserAccountRepository;
import com.schoolgroup.sms.security.AuthUser;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class StudentService {

    private final StudentRepository students;
    private final BranchRepository branches;
    private final AcademicYearRepository years;
    private final SchoolClassRepository classes;
    private final SectionRepository sections;
    private final EnrollmentRepository enrollments;
    private final GuardianRepository guardians;
    private final GuardianStudentRepository links;
    private final UserAccountRepository users;
    private final PasswordEncoder encoder;
    private final AccessService access;
    private final AuditService audit;

    public StudentService(StudentRepository students, BranchRepository branches, AcademicYearRepository years,
                          SchoolClassRepository classes, SectionRepository sections, EnrollmentRepository enrollments,
                          GuardianRepository guardians, GuardianStudentRepository links, UserAccountRepository users,
                          PasswordEncoder encoder, AccessService access, AuditService audit) {
        this.students = students;
        this.branches = branches;
        this.years = years;
        this.classes = classes;
        this.sections = sections;
        this.enrollments = enrollments;
        this.guardians = guardians;
        this.links = links;
        this.users = users;
        this.encoder = encoder;
        this.access = access;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public PageResponse<SchoolDtos.StudentResponse> search(String q, UUID branchId, UUID classId, UUID sectionId,
                                                           String status, String gender, UUID academicYearId,
                                                           int page, int size) {
        Specification<Student> spec = buildSpec(q, branchId, classId, sectionId, status, gender, academicYearId);
        Page<Student> result = students.findAll(spec, PageRequest.of(page, Math.min(Math.max(size, 1), 100)));
        return new PageResponse<>(result.map(this::toResponse).toList(), result.getTotalElements(), page, size);
    }

    @Transactional(readOnly = true)
    public SchoolDtos.StudentSummary summary(String q, UUID branchId, UUID classId, UUID sectionId,
                                             String status, String gender, UUID academicYearId) {
        Specification<Student> spec = buildSpec(q, branchId, classId, sectionId, status, gender, academicYearId);
        long total = students.count(spec);
        long boys = students.count(spec.and((root, query, cb) -> cb.equal(root.get("gender"), "MALE")));
        long girls = students.count(spec.and((root, query, cb) -> cb.equal(root.get("gender"), "FEMALE")));
        long active = students.count(spec.and((root, query, cb) -> cb.equal(root.get("status"), "ACTIVE")));
        UUID resolved = access.resolveBranch(branchId);
        AuthUser user = access.current();
        long classCount;
        long branchCount;
        if (user.getRole() == Role.PARENT || user.getRole() == Role.STUDENT) {
            classCount = 1;
            branchCount = 1;
        } else if (resolved != null) {
            classCount = classes.findByBranchIdOrderByGradeLevelAsc(resolved).size();
            branchCount = 1;
        } else {
            classCount = classes.count();
            branchCount = branches.count();
        }
        return new SchoolDtos.StudentSummary(total, boys, girls, classCount, branchCount, active);
    }

    private Specification<Student> buildSpec(String q, UUID branchId, UUID classId, UUID sectionId,
                                             String status, String gender, UUID academicYearId) {
        UUID resolved = access.resolveBranch(branchId);
        AuthUser user = access.current();
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (user.getRole() == Role.PARENT) {
                Guardian g = guardians.findByUserId(user.getId()).orElseThrow(() -> ApiException.forbidden("Parent profile not found"));
                var studentIds = links.findByGuardianId(g.getId()).stream().map(l -> l.getStudent().getId()).toList();
                if (studentIds.isEmpty()) {
                    predicates.add(cb.disjunction());
                } else {
                    predicates.add(root.get("id").in(studentIds));
                }
            } else if (user.getRole() == Role.STUDENT) {
                students.findByUserId(user.getId()).ifPresent(own -> predicates.add(cb.equal(root.get("id"), own.getId())));
            } else if (resolved != null) {
                predicates.add(cb.equal(root.get("branch").get("id"), resolved));
            }
            if (classId != null) {
                predicates.add(cb.equal(root.get("schoolClass").get("id"), classId));
            }
            if (sectionId != null) {
                predicates.add(cb.equal(root.get("section").get("id"), sectionId));
            }
            if (StringUtils.hasText(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (StringUtils.hasText(gender)) {
                predicates.add(cb.equal(root.get("gender"), gender));
            }
            if (academicYearId != null) {
                predicates.add(cb.equal(root.get("academicYear").get("id"), academicYearId));
            }
            if (StringUtils.hasText(q)) {
                String like = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), like),
                        cb.like(cb.lower(root.get("admissionNumber")), like),
                        cb.like(cb.lower(root.get("studentCode")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("fatherName"), "")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("mobile"), "")), like)
                ));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    @Transactional(readOnly = true)
    public SchoolDtos.StudentResponse get(UUID id) {
        return toResponse(access.requireStudentAccess(id));
    }

    @Transactional
    public SchoolDtos.StudentResponse create(SchoolDtos.StudentRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        UUID branchId = access.resolveBranch(request.branchId());
        if (students.existsByBranchIdAndAdmissionNumber(branchId, request.admissionNumber())) {
            throw ApiException.conflict("Admission number already exists in this branch");
        }
        if (students.existsByBranchIdAndStudentCode(branchId, request.studentCode())) {
            throw ApiException.conflict("Student ID already exists in this branch");
        }
        Branch branch = branches.findById(branchId).orElseThrow(() -> ApiException.notFound("Branch not found"));
        AcademicYear year = years.findById(request.academicYearId()).orElseThrow(() -> ApiException.notFound("Academic year not found"));
        Student student = new Student();
        student.setBranch(branch);
        student.setAcademicYear(year);
        apply(student, request);
        if (request.email() != null && !request.email().isBlank()) {
            UserAccount account = new UserAccount();
            account.setEmail(request.email());
            account.setUsername(request.studentCode().toLowerCase());
            account.setPasswordHash(encoder.encode("Dev@School123!"));
            account.setFullName(request.fullName());
            account.setMobile(request.mobile());
            account.setRole(Role.STUDENT);
            account.setBranch(branch);
            account.setStatus("ACTIVE");
            users.save(account);
            student.setUser(account);
        }
        students.save(student);
        if (request.classId() != null && request.sectionId() != null) {
            Enrollment e = new Enrollment();
            e.setStudent(student);
            e.setAcademicYear(year);
            e.setSchoolClass(student.getSchoolClass());
            e.setSection(student.getSection());
            e.setStatus("ENROLLED");
            enrollments.save(e);
        }
        if (request.guardianId() != null) {
            Guardian guardian = guardians.findById(request.guardianId()).orElseThrow(() -> ApiException.notFound("Guardian not found"));
            GuardianStudent link = new GuardianStudent();
            link.setGuardian(guardian);
            link.setStudent(student);
            link.setRelationship(request.guardianRelationship() == null ? "GUARDIAN" : request.guardianRelationship());
            link.setPrimaryGuardian(true);
            links.save(link);
        }
        audit.record("CREATE", "STUDENT", student.getId().toString(), student.getAdmissionNumber());
        return toResponse(student);
    }

    @Transactional
    public SchoolDtos.StudentResponse update(UUID id, SchoolDtos.StudentRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        Student student = students.findById(id).orElseThrow(() -> ApiException.notFound("Student not found"));
        access.assertBranch(student.getBranch().getId());
        apply(student, request);
        audit.record("UPDATE", "STUDENT", id.toString(), student.getAdmissionNumber());
        return toResponse(student);
    }

    public SchoolDtos.StudentResponse toResponse(Student s) {
        return new SchoolDtos.StudentResponse(
                s.getId(),
                s.getBranch().getId(),
                s.getBranch().getName(),
                s.getAcademicYear().getId(),
                s.getAcademicYear().getName(),
                s.getSchoolClass() == null ? null : s.getSchoolClass().getId(),
                s.getSchoolClass() == null ? null : s.getSchoolClass().getName(),
                s.getSection() == null ? null : s.getSection().getId(),
                s.getSection() == null ? null : s.getSection().getName(),
                s.getAdmissionNumber(),
                s.getStudentCode(),
                s.getFullName(),
                s.getDateOfBirth(),
                s.getGender(),
                s.getMobile(),
                s.getEmail(),
                s.getAddress(),
                s.getAdmissionDate(),
                s.getStatus(),
                s.getFatherName(),
                s.getMotherName(),
                s.getBloodGroup(),
                s.getCity(),
                s.getState(),
                s.getPincode(),
                s.getEmergencyContact(),
                s.getRollNumber()
        );
    }

    private void apply(Student student, SchoolDtos.StudentRequest request) {
        if (request.classId() != null) {
            SchoolClass c = classes.findById(request.classId()).orElseThrow(() -> ApiException.notFound("Class not found"));
            access.assertBranch(c.getBranch().getId());
            student.setSchoolClass(c);
        }
        if (request.sectionId() != null) {
            Section section = sections.findById(request.sectionId()).orElseThrow(() -> ApiException.notFound("Section not found"));
            student.setSection(section);
        }
        student.setAdmissionNumber(request.admissionNumber());
        student.setStudentCode(request.studentCode());
        student.setFullName(request.fullName());
        student.setDateOfBirth(request.dateOfBirth());
        student.setGender(request.gender());
        student.setMobile(request.mobile());
        student.setEmail(request.email());
        student.setAddress(request.address());
        student.setAdmissionDate(request.admissionDate());
        student.setStatus(request.status() == null ? "ACTIVE" : request.status());
    }
}
