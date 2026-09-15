package com.schoolgroup.sms.service;

import com.schoolgroup.sms.dto.SchoolDtos;
import com.schoolgroup.sms.entity.AcademicYear;
import com.schoolgroup.sms.entity.Branch;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.entity.SchoolClass;
import com.schoolgroup.sms.entity.Section;
import com.schoolgroup.sms.entity.Subject;
import com.schoolgroup.sms.entity.TeacherAssignment;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.AcademicYearRepository;
import com.schoolgroup.sms.repository.BranchRepository;
import com.schoolgroup.sms.repository.SchoolClassRepository;
import com.schoolgroup.sms.repository.SectionRepository;
import com.schoolgroup.sms.repository.StudentRepository;
import com.schoolgroup.sms.repository.SubjectRepository;
import com.schoolgroup.sms.repository.TeacherAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CatalogService {

    private final BranchRepository branches;
    private final AcademicYearRepository years;
    private final SchoolClassRepository classes;
    private final SectionRepository sections;
    private final SubjectRepository subjects;
    private final StudentRepository students;
    private final TeacherAssignmentRepository teacherAssignments;
    private final AccessService access;
    private final AuditService audit;

    public CatalogService(BranchRepository branches, AcademicYearRepository years, SchoolClassRepository classes,
                          SectionRepository sections, SubjectRepository subjects, StudentRepository students,
                          TeacherAssignmentRepository teacherAssignments, AccessService access, AuditService audit) {
        this.branches = branches;
        this.years = years;
        this.classes = classes;
        this.sections = sections;
        this.subjects = subjects;
        this.students = students;
        this.teacherAssignments = teacherAssignments;
        this.access = access;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<Branch> listBranches() {
        if (access.current().getRole() == Role.SUPER_ADMIN) {
            return branches.findAll();
        }
        UUID branchId = access.requireBranch();
        return branches.findById(branchId).stream().toList();
    }

    @Transactional
    public Branch createBranch(SchoolDtos.BranchRequest request) {
        access.assertRoles(Role.SUPER_ADMIN);
        if (branches.existsByCode(request.code())) {
            throw ApiException.conflict("Branch code already exists");
        }
        Branch b = new Branch();
        apply(b, request);
        branches.save(b);
        audit.record("CREATE", "BRANCH", b.getId().toString(), b.getCode());
        return b;
    }

    @Transactional
    public Branch updateBranch(UUID id, SchoolDtos.BranchRequest request) {
        access.assertRoles(Role.SUPER_ADMIN);
        Branch b = branches.findById(id).orElseThrow(() -> ApiException.notFound("Branch not found"));
        apply(b, request);
        audit.record("UPDATE", "BRANCH", id.toString(), b.getCode());
        return b;
    }

    public List<AcademicYear> listYears() {
        return years.findAll();
    }

    @Transactional
    public AcademicYear createYear(SchoolDtos.AcademicYearRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        years.findByName(request.name()).ifPresent(y -> {
            throw ApiException.conflict("Academic year already exists");
        });
        AcademicYear year = new AcademicYear();
        year.setName(request.name());
        year.setStartDate(request.startDate());
        year.setEndDate(request.endDate());
        year.setStatus(request.status() == null ? "UPCOMING" : request.status());
        if ("ACTIVE".equalsIgnoreCase(year.getStatus())) {
            deactivateOtherYears(null);
        }
        years.save(year);
        audit.record("CREATE", "ACADEMIC_YEAR", year.getId().toString(), year.getName());
        return year;
    }

    @Transactional
    public AcademicYear updateYear(UUID id, SchoolDtos.AcademicYearRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        AcademicYear year = years.findById(id).orElseThrow(() -> ApiException.notFound("Academic year not found"));
        years.findByName(request.name()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw ApiException.conflict("Academic year already exists");
            }
        });
        year.setName(request.name());
        year.setStartDate(request.startDate());
        year.setEndDate(request.endDate());
        if (request.status() != null) {
            year.setStatus(request.status());
        }
        if ("ACTIVE".equalsIgnoreCase(year.getStatus())) {
            deactivateOtherYears(id);
        }
        audit.record("UPDATE", "ACADEMIC_YEAR", id.toString(), year.getName());
        return year;
    }

    private void deactivateOtherYears(UUID keepId) {
        for (AcademicYear y : years.findAll()) {
            if (keepId != null && y.getId().equals(keepId)) {
                continue;
            }
            if ("ACTIVE".equalsIgnoreCase(y.getStatus())) {
                y.setStatus("CLOSED");
            }
        }
    }

    @Transactional(readOnly = true)
    public List<SchoolClass> listClasses(UUID branchId) {
        UUID resolved = access.resolveBranch(branchId);
        if (resolved == null) {
            return classes.findAll();
        }
        return classes.findByBranchIdOrderByGradeLevelAsc(resolved);
    }

    @Transactional
    public SchoolClass createClass(SchoolDtos.ClassRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        UUID branchId = access.resolveBranch(request.branchId());
        if (branchId == null) {
            throw ApiException.badRequest("branchId is required");
        }
        if (classes.existsByBranchIdAndName(branchId, request.name())) {
            throw ApiException.conflict("Class already exists in this branch");
        }
        SchoolClass c = new SchoolClass();
        c.setBranch(branches.findById(branchId).orElseThrow(() -> ApiException.notFound("Branch not found")));
        c.setName(request.name());
        c.setGradeLevel(request.gradeLevel());
        c.setStatus(request.status() == null ? "ACTIVE" : request.status());
        classes.save(c);
        audit.record("CREATE", "CLASS", c.getId().toString(), c.getName());
        return c;
    }

    @Transactional
    public SchoolClass updateClass(UUID id, SchoolDtos.ClassRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        SchoolClass c = classes.findById(id).orElseThrow(() -> ApiException.notFound("Class not found"));
        access.assertBranch(c.getBranch().getId());
        if (request.name() != null && !request.name().isBlank()) {
            c.setName(request.name());
        }
        if (request.gradeLevel() != null) {
            c.setGradeLevel(request.gradeLevel());
        }
        if (request.status() != null) {
            c.setStatus(request.status());
        }
        audit.record("UPDATE", "CLASS", id.toString(), c.getName());
        return c;
    }

    @Transactional
    public Section createSection(UUID classId, SchoolDtos.SectionRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        SchoolClass c = classes.findById(classId).orElseThrow(() -> ApiException.notFound("Class not found"));
        access.assertBranch(c.getBranch().getId());
        if (sections.existsBySchoolClassIdAndName(classId, request.name())) {
            throw ApiException.conflict("Section already exists");
        }
        Section s = new Section();
        s.setSchoolClass(c);
        s.setName(request.name());
        s.setCapacity(request.capacity());
        s.setStatus(request.status() == null ? "ACTIVE" : request.status());
        sections.save(s);
        return s;
    }

    @Transactional
    public Section updateSection(UUID classId, UUID sectionId, SchoolDtos.SectionRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        SchoolClass c = classes.findById(classId).orElseThrow(() -> ApiException.notFound("Class not found"));
        access.assertBranch(c.getBranch().getId());
        Section s = sections.findById(sectionId).orElseThrow(() -> ApiException.notFound("Section not found"));
        if (!s.getSchoolClass().getId().equals(classId)) {
            throw ApiException.notFound("Section not found");
        }
        if (request.name() != null && !request.name().isBlank()) {
            s.setName(request.name());
        }
        if (request.capacity() != null) {
            s.setCapacity(request.capacity());
        }
        if (request.status() != null) {
            s.setStatus(request.status());
        }
        audit.record("UPDATE", "SECTION", sectionId.toString(), s.getName());
        return s;
    }

    public List<Section> listSections(UUID classId) {
        SchoolClass c = classes.findById(classId).orElseThrow(() -> ApiException.notFound("Class not found"));
        access.assertBranch(c.getBranch().getId());
        return sections.findBySchoolClassId(classId);
    }

    @Transactional(readOnly = true)
    public SchoolClass getClass(UUID classId) {
        SchoolClass c = classes.findById(classId).orElseThrow(() -> ApiException.notFound("Class not found"));
        access.assertBranch(c.getBranch().getId());
        return c;
    }

    @Transactional(readOnly = true)
    public SchoolDtos.SectionDetailResponse getSection(UUID classId, UUID sectionId) {
        SchoolClass c = getClass(classId);
        Section section = sections.findById(sectionId).orElseThrow(() -> ApiException.notFound("Section not found"));
        if (!section.getSchoolClass().getId().equals(classId)) {
            throw ApiException.notFound("Section not found");
        }
        long studentCount = students.count((root, query, cb) -> cb.and(
                cb.equal(root.get("section").get("id"), sectionId),
                cb.equal(root.get("status"), "ACTIVE")
        ));
        String teacherName = teacherAssignments.findFirstBySectionId(sectionId)
                .map(TeacherAssignment::getStaff)
                .map(staff -> staff.getUser().getFullName())
                .orElse(null);
        return new SchoolDtos.SectionDetailResponse(
                section.getId(),
                c.getId(),
                c.getName(),
                c.getGradeLevel(),
                c.getBranch().getId(),
                c.getBranch().getName(),
                section.getName(),
                section.getCapacity(),
                section.getStatus(),
                studentCount,
                teacherName
        );
    }

    @Transactional
    public Subject createSubject(SchoolDtos.SubjectRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        UUID branchId = access.resolveBranch(request.branchId());
        Subject s = new Subject();
        s.setBranch(branches.findById(branchId).orElseThrow(() -> ApiException.notFound("Branch not found")));
        s.setName(request.name());
        s.setCode(request.code());
        s.setStatus(request.status() == null ? "ACTIVE" : request.status());
        subjects.save(s);
        return s;
    }

    @Transactional
    public Subject updateSubject(UUID id, SchoolDtos.SubjectRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        Subject s = subjects.findById(id).orElseThrow(() -> ApiException.notFound("Subject not found"));
        access.assertBranch(s.getBranch().getId());
        if (request.name() != null && !request.name().isBlank()) {
            s.setName(request.name());
        }
        if (request.code() != null && !request.code().isBlank()) {
            s.setCode(request.code());
        }
        if (request.status() != null) {
            s.setStatus(request.status());
        }
        audit.record("UPDATE", "SUBJECT", id.toString(), s.getCode());
        return s;
    }

    public List<Subject> listSubjects(UUID branchId) {
        UUID resolved = access.resolveBranch(branchId);
        if (resolved == null) {
            return subjects.findAll();
        }
        return subjects.findAll().stream().filter(s -> s.getBranch().getId().equals(resolved)).toList();
    }

    public static SchoolDtos.BranchResponse toBranch(Branch b) {
        return new SchoolDtos.BranchResponse(b.getId(), b.getName(), b.getCode(), b.getAddress(), b.getPhone(),
                b.getEmail(), b.getStatus(), b.getCity(), b.getState(), b.getPincode(), b.getPrincipalName());
    }

    public static SchoolDtos.AcademicYearResponse toYear(AcademicYear y) {
        return new SchoolDtos.AcademicYearResponse(y.getId(), y.getName(), y.getStartDate(), y.getEndDate(), y.getStatus());
    }

    public static SchoolDtos.ClassResponse toClass(SchoolClass c) {
        return new SchoolDtos.ClassResponse(c.getId(), c.getBranch().getId(), c.getName(), c.getGradeLevel(), c.getStatus());
    }

    public static SchoolDtos.SectionResponse toSection(Section s) {
        return new SchoolDtos.SectionResponse(s.getId(), s.getSchoolClass().getId(), s.getName(), s.getCapacity(), s.getStatus());
    }

    public static SchoolDtos.SubjectResponse toSubject(Subject s) {
        return new SchoolDtos.SubjectResponse(s.getId(), s.getBranch().getId(), s.getName(), s.getCode(), s.getStatus());
    }

    private void apply(Branch b, SchoolDtos.BranchRequest request) {
        b.setName(request.name());
        b.setCode(request.code());
        b.setAddress(request.address());
        b.setPhone(request.phone());
        b.setEmail(request.email());
        b.setStatus(request.status() == null ? "ACTIVE" : request.status());
    }
}
