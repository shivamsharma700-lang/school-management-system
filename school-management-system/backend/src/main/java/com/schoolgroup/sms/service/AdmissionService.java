package com.schoolgroup.sms.service;

import com.schoolgroup.sms.dto.AdmissionDtos;
import com.schoolgroup.sms.dto.SchoolDtos;
import com.schoolgroup.sms.entity.AdmissionApplication;
import com.schoolgroup.sms.entity.AdmissionEnquiry;
import com.schoolgroup.sms.entity.Branch;
import com.schoolgroup.sms.entity.Guardian;
import com.schoolgroup.sms.entity.GuardianStudent;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.entity.SchoolClass;
import com.schoolgroup.sms.entity.Section;
import com.schoolgroup.sms.entity.Student;
import com.schoolgroup.sms.entity.StudentDocument;
import com.schoolgroup.sms.entity.UserAccount;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.AcademicYearRepository;
import com.schoolgroup.sms.repository.AdmissionApplicationRepository;
import com.schoolgroup.sms.repository.AdmissionEnquiryRepository;
import com.schoolgroup.sms.repository.BranchRepository;
import com.schoolgroup.sms.repository.GuardianRepository;
import com.schoolgroup.sms.repository.GuardianStudentRepository;
import com.schoolgroup.sms.repository.SchoolClassRepository;
import com.schoolgroup.sms.repository.SectionRepository;
import com.schoolgroup.sms.repository.StudentDocumentRepository;
import com.schoolgroup.sms.repository.StudentRepository;
import com.schoolgroup.sms.repository.UserAccountRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class AdmissionService {

    private final AdmissionEnquiryRepository enquiries;
    private final AdmissionApplicationRepository applications;
    private final StudentDocumentRepository documents;
    private final BranchRepository branches;
    private final AcademicYearRepository years;
    private final SchoolClassRepository classes;
    private final SectionRepository sections;
    private final StudentRepository students;
    private final GuardianRepository guardians;
    private final GuardianStudentRepository links;
    private final UserAccountRepository users;
    private final FileStorageService files;
    private final StudentService studentService;
    private final AccessService access;
    private final AuditService audit;
    private final PasswordEncoder encoder;

    public AdmissionService(AdmissionEnquiryRepository enquiries, AdmissionApplicationRepository applications,
                            StudentDocumentRepository documents, BranchRepository branches,
                            AcademicYearRepository years, SchoolClassRepository classes, SectionRepository sections,
                            StudentRepository students, GuardianRepository guardians, GuardianStudentRepository links,
                            UserAccountRepository users, FileStorageService files, StudentService studentService,
                            AccessService access, AuditService audit, PasswordEncoder encoder) {
        this.enquiries = enquiries;
        this.applications = applications;
        this.documents = documents;
        this.branches = branches;
        this.years = years;
        this.classes = classes;
        this.sections = sections;
        this.students = students;
        this.guardians = guardians;
        this.links = links;
        this.users = users;
        this.files = files;
        this.studentService = studentService;
        this.access = access;
        this.audit = audit;
        this.encoder = encoder;
    }

    @Transactional(readOnly = true)
    public Page<AdmissionEnquiry> listEnquiries(String q, String status, int page, int size) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        UUID branchId = access.current().getRole() == Role.SUPER_ADMIN ? null : access.requireBranch();
        Specification<AdmissionEnquiry> spec = (root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            if (branchId != null) {
                preds.add(cb.equal(root.get("branch").get("id"), branchId));
            }
            if (StringUtils.hasText(status)) {
                preds.add(cb.equal(root.get("status"), status));
            }
            if (StringUtils.hasText(q)) {
                String like = "%" + q.toLowerCase(Locale.ROOT) + "%";
                preds.add(cb.or(
                        cb.like(cb.lower(root.get("studentName")), like),
                        cb.like(cb.lower(root.get("parentName")), like),
                        cb.like(cb.lower(root.get("mobile")), like)
                ));
            }
            return cb.and(preds.toArray(Predicate[]::new));
        };
        return enquiries.findAll(spec, PageRequest.of(page, size));
    }

    @Transactional
    public AdmissionEnquiry createEnquiry(AdmissionDtos.EnquiryRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        UUID branchId = access.resolveBranch(request.branchId());
        if (branchId == null) {
            throw ApiException.badRequest("branchId is required");
        }
        return saveEnquiry(request, branchId);
    }

    /** Website / public enquiry — no authenticated session required. */
    @Transactional
    public AdmissionEnquiry createPublicEnquiry(AdmissionDtos.EnquiryRequest request) {
        UUID branchId = request.branchId();
        if (branchId == null) {
            Branch first = branches.findAll().stream().findFirst()
                    .orElseThrow(() -> ApiException.badRequest("No campus configured for enquiries"));
            branchId = first.getId();
        } else if (!branches.existsById(branchId)) {
            throw ApiException.notFound("Branch not found");
        }
        AdmissionDtos.EnquiryRequest normalized = new AdmissionDtos.EnquiryRequest(
                branchId,
                request.academicYearId(),
                request.interestedClassId(),
                request.studentName(),
                request.parentName(),
                request.mobile(),
                request.email(),
                StringUtils.hasText(request.source()) ? request.source() : "WEBSITE",
                request.notes()
        );
        return saveEnquiry(normalized, branchId);
    }

    private AdmissionEnquiry saveEnquiry(AdmissionDtos.EnquiryRequest request, UUID branchId) {
        AdmissionEnquiry e = new AdmissionEnquiry();
        e.setBranch(branches.findById(branchId).orElseThrow(() -> ApiException.notFound("Branch not found")));
        if (request.academicYearId() != null) {
            e.setAcademicYear(years.findById(request.academicYearId()).orElseThrow(() -> ApiException.notFound("Year not found")));
        }
        if (request.interestedClassId() != null) {
            e.setInterestedClass(classes.findById(request.interestedClassId()).orElseThrow(() -> ApiException.notFound("Class not found")));
        }
        e.setStudentName(request.studentName());
        e.setParentName(request.parentName());
        e.setMobile(request.mobile());
        e.setEmail(request.email());
        e.setSource(request.source());
        e.setNotes(request.notes());
        e.setStatus("NEW");
        enquiries.save(e);
        audit.record("CREATE", "ADMISSION_ENQUIRY", e.getId().toString(), e.getStudentName());
        return e;
    }

    @Transactional
    public AdmissionEnquiry updateEnquiryStatus(UUID id, String status) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        AdmissionEnquiry e = enquiries.findById(id).orElseThrow(() -> ApiException.notFound("Enquiry not found"));
        access.assertBranch(e.getBranch().getId());
        e.setStatus(status);
        return e;
    }

    @Transactional(readOnly = true)
    public Page<AdmissionApplication> listApplications(String q, String status, int page, int size) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        UUID branchId = access.current().getRole() == Role.SUPER_ADMIN ? null : access.requireBranch();
        Specification<AdmissionApplication> spec = (root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            if (branchId != null) {
                preds.add(cb.equal(root.get("branch").get("id"), branchId));
            }
            if (StringUtils.hasText(status)) {
                preds.add(cb.equal(root.get("status"), status));
            }
            if (StringUtils.hasText(q)) {
                String like = "%" + q.toLowerCase(Locale.ROOT) + "%";
                preds.add(cb.or(
                        cb.like(cb.lower(root.get("studentName")), like),
                        cb.like(cb.lower(root.get("applicationNumber")), like),
                        cb.like(cb.lower(root.get("parentMobile")), like)
                ));
            }
            return cb.and(preds.toArray(Predicate[]::new));
        };
        return applications.findAll(spec, PageRequest.of(page, size));
    }

    @Transactional
    public AdmissionApplication createApplication(AdmissionDtos.ApplicationRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        UUID branchId = access.resolveBranch(request.branchId());
        if (branchId == null) {
            throw ApiException.badRequest("branchId is required");
        }
        Branch branch = branches.findById(branchId).orElseThrow(() -> ApiException.notFound("Branch not found"));
        AdmissionApplication app = new AdmissionApplication();
        app.setBranch(branch);
        app.setAcademicYear(years.findById(request.academicYearId()).orElseThrow(() -> ApiException.notFound("Year not found")));
        if (request.enquiryId() != null) {
            AdmissionEnquiry enquiry = enquiries.findById(request.enquiryId()).orElseThrow(() -> ApiException.notFound("Enquiry not found"));
            access.assertBranch(enquiry.getBranch().getId());
            app.setEnquiry(enquiry);
            enquiry.setStatus("CONVERTED");
        }
        if (request.classId() != null) {
            SchoolClass c = classes.findById(request.classId()).orElseThrow(() -> ApiException.notFound("Class not found"));
            access.assertBranch(c.getBranch().getId());
            app.setSchoolClass(c);
        }
        if (request.sectionId() != null) {
            app.setSection(sections.findById(request.sectionId()).orElseThrow(() -> ApiException.notFound("Section not found")));
        }
        String number = "APP-" + LocalDate.now().getYear() + "-" + String.format("%04d", applications.count() + 1);
        while (applications.existsByBranchIdAndApplicationNumber(branchId, number)) {
            number = number + "-" + UUID.randomUUID().toString().substring(0, 4);
        }
        app.setApplicationNumber(number);
        app.setStudentName(request.studentName());
        app.setDateOfBirth(request.dateOfBirth());
        app.setGender(request.gender());
        app.setParentName(request.parentName());
        app.setParentMobile(request.parentMobile());
        app.setParentEmail(request.parentEmail());
        app.setAddress(request.address());
        app.setStatus("SUBMITTED");
        applications.save(app);
        audit.record("CREATE", "ADMISSION_APPLICATION", app.getId().toString(), app.getApplicationNumber());
        return app;
    }

    @Transactional
    public AdmissionApplication updateApplication(UUID id, AdmissionDtos.ApplicationStatusRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        AdmissionApplication app = applications.findById(id).orElseThrow(() -> ApiException.notFound("Application not found"));
        access.assertBranch(app.getBranch().getId());
        String status = request.status().toUpperCase(Locale.ROOT);
        app.setStatus(status);
        if (request.reviewNotes() != null) {
            app.setReviewNotes(request.reviewNotes());
        }
        if (request.documentsVerified() != null) {
            app.setDocumentsVerified(request.documentsVerified());
        }
        if ("ENROLLED".equals(status)) {
            if (app.getEnrolledStudent() != null) {
                return app;
            }
            Student enrolled = enroll(app);
            app.setEnrolledStudent(enrolled);
            app.setStatus("ENROLLED");
        }
        audit.record("UPDATE", "ADMISSION_APPLICATION", id.toString(), app.getStatus());
        return app;
    }

    private Student enroll(AdmissionApplication app) {
        if (app.getSchoolClass() == null || app.getSection() == null) {
            throw ApiException.badRequest("Class and section required before enrollment");
        }
        String admission = "ADM-" + app.getApplicationNumber().replace("APP-", "");
        String code = "STU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        SchoolDtos.StudentRequest req = new SchoolDtos.StudentRequest(
                app.getBranch().getId(),
                app.getAcademicYear().getId(),
                app.getSchoolClass().getId(),
                app.getSection().getId(),
                admission,
                code,
                app.getStudentName(),
                app.getDateOfBirth(),
                app.getGender(),
                app.getParentMobile(),
                app.getParentEmail(),
                app.getAddress(),
                LocalDate.now(),
                "ACTIVE",
                null,
                "PARENT"
        );
        SchoolDtos.StudentResponse created = studentService.create(req);
        Student student = students.findById(created.id()).orElseThrow();
        student.setFatherName(app.getParentName());
        Guardian guardian = guardians.findFirstByMobile(app.getParentMobile())
                .orElseGet(() -> {
                    Guardian g = new Guardian();
                    g.setFullName(app.getParentName());
                    g.setMobile(app.getParentMobile());
                    g.setEmail(app.getParentEmail());
                    g.setAddress(app.getAddress());
                    g.setStatus("ACTIVE");
                    UserAccount account = new UserAccount();
                    account.setEmail(app.getParentEmail() != null && !app.getParentEmail().isBlank()
                            ? app.getParentEmail()
                            : app.getParentMobile().replaceAll("\\D", "") + "@parents.sms.local");
                    account.setUsername("parent." + app.getParentMobile().replaceAll("\\D", ""));
                    account.setPasswordHash(encoder.encode("Dev@School123!"));
                    account.setFullName(app.getParentName());
                    account.setMobile(app.getParentMobile());
                    account.setRole(Role.PARENT);
                    account.setBranch(app.getBranch());
                    account.setStatus("ACTIVE");
                    users.save(account);
                    g.setUser(account);
                    return guardians.save(g);
                });
        if (!links.existsByGuardianIdAndStudentId(guardian.getId(), student.getId())) {
            GuardianStudent link = new GuardianStudent();
            link.setGuardian(guardian);
            link.setStudent(student);
            link.setRelationship("PARENT");
            link.setPrimaryGuardian(true);
            links.save(link);
        }
        return student;
    }

    @Transactional(readOnly = true)
    public List<StudentDocument> listDocuments(UUID studentId) {
        access.requireStudentAccess(studentId);
        return documents.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    @Transactional
    public StudentDocument addDocument(UUID studentId, AdmissionDtos.StudentDocumentRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        Student student = access.requireStudentAccess(studentId);
        StudentDocument doc = new StudentDocument();
        doc.setStudent(student);
        doc.setFile(files.require(request.fileId()));
        doc.setDocType(request.docType());
        doc.setTitle(request.title());
        doc.setNotes(request.notes());
        documents.save(doc);
        return doc;
    }

    public AdmissionDtos.EnquiryResponse toEnquiry(AdmissionEnquiry e) {
        return new AdmissionDtos.EnquiryResponse(
                e.getId(), e.getBranch().getId(), e.getBranch().getName(),
                e.getAcademicYear() == null ? null : e.getAcademicYear().getId(),
                e.getInterestedClass() == null ? null : e.getInterestedClass().getId(),
                e.getStudentName(), e.getParentName(), e.getMobile(), e.getEmail(), e.getSource(), e.getNotes(), e.getStatus()
        );
    }

    public AdmissionDtos.ApplicationResponse toApplication(AdmissionApplication a) {
        return new AdmissionDtos.ApplicationResponse(
                a.getId(), a.getBranch().getId(), a.getBranch().getName(),
                a.getAcademicYear().getId(), a.getAcademicYear().getName(),
                a.getEnquiry() == null ? null : a.getEnquiry().getId(),
                a.getSchoolClass() == null ? null : a.getSchoolClass().getId(),
                a.getSection() == null ? null : a.getSection().getId(),
                a.getApplicationNumber(), a.getStudentName(), a.getDateOfBirth(), a.getGender(),
                a.getParentName(), a.getParentMobile(), a.getParentEmail(), a.getAddress(),
                a.isDocumentsVerified(), a.getStatus(), a.getReviewNotes(),
                a.getEnrolledStudent() == null ? null : a.getEnrolledStudent().getId()
        );
    }

    public AdmissionDtos.StudentDocumentResponse toDocument(StudentDocument d) {
        return new AdmissionDtos.StudentDocumentResponse(
                d.getId(), d.getStudent().getId(), d.getFile().getId(), d.getDocType(), d.getTitle(), d.getNotes(),
                d.getFile().getOriginalName()
        );
    }
}
