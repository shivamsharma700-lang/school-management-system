package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.dto.SchoolDtos;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.AcademicYearRepository;
import com.schoolgroup.sms.repository.ExamRepository;
import com.schoolgroup.sms.repository.ExamSubjectRepository;
import com.schoolgroup.sms.repository.FeeStructureRepository;
import com.schoolgroup.sms.repository.SchoolClassRepository;
import com.schoolgroup.sms.repository.SectionRepository;
import com.schoolgroup.sms.repository.StudentRepository;
import com.schoolgroup.sms.repository.SubjectRepository;
import com.schoolgroup.sms.service.AccessService;
import com.schoolgroup.sms.service.FeePaymentService;
import com.schoolgroup.sms.service.OperationsService;
import com.schoolgroup.sms.service.StudentService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bulk")
public class BulkImportController {

    public record CsvImportRequest(String csv, UUID branchId, UUID academicYearId, UUID feeStructureId, LocalDate dueDate) {
    }

    private final AccessService access;
    private final StudentService students;
    private final StudentRepository studentRepo;
    private final AcademicYearRepository years;
    private final SchoolClassRepository classes;
    private final SectionRepository sections;
    private final FeePaymentService fees;
    private final FeeStructureRepository feeStructures;
    private final ExamRepository exams;
    private final ExamSubjectRepository examSubjects;
    private final SubjectRepository subjects;
    private final OperationsService operations;

    public BulkImportController(AccessService access, StudentService students, StudentRepository studentRepo,
                                AcademicYearRepository years, SchoolClassRepository classes, SectionRepository sections,
                                FeePaymentService fees, FeeStructureRepository feeStructures, ExamRepository exams,
                                ExamSubjectRepository examSubjects, SubjectRepository subjects,
                                OperationsService operations) {
        this.access = access;
        this.students = students;
        this.studentRepo = studentRepo;
        this.years = years;
        this.classes = classes;
        this.sections = sections;
        this.fees = fees;
        this.feeStructures = feeStructures;
        this.exams = exams;
        this.examSubjects = examSubjects;
        this.subjects = subjects;
        this.operations = operations;
    }

    @PostMapping("/students")
    public Map<String, Object> importStudents(@RequestBody CsvImportRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        UUID branchId = access.resolveBranch(request.branchId());
        if (branchId == null) {
            throw ApiException.badRequest("branchId is required");
        }
        UUID yearId = request.academicYearId();
        if (yearId == null) {
            yearId = years.findFirstByStatus("ACTIVE").map(y -> y.getId())
                    .orElseThrow(() -> ApiException.badRequest("academicYearId is required (no ACTIVE year)"));
        }
        List<String[]> rows = parseCsv(request.csv());
        if (rows.isEmpty()) {
            throw ApiException.badRequest("CSV has no data rows");
        }
        boolean hasHeader = looksLikeHeader(rows.get(0));
        String[] headers = hasHeader ? rows.get(0) : new String[]{
                "admissionNumber", "studentCode", "fullName", "gender", "dateOfBirth", "class", "section", "mobile", "email", "address", "admissionDate"
        };
        int created = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();
        for (int i = hasHeader ? 1 : 0; i < rows.size(); i++) {
            String[] cols = rows.get(i);
            try {
                Map<String, String> m = rowMap(headers, cols);
                String admission = first(m, "admissionnumber", "admission", "admission_number");
                String code = first(m, "studentcode", "studentid", "student_code", "code");
                String name = first(m, "fullname", "fullname", "full_name", "studentname");
                if (admission.isBlank() || code.isBlank() || name.isBlank()) {
                    skipped++;
                    errors.add("Row " + (i + 1) + ": admissionNumber, studentCode and fullName required");
                    continue;
                }
                UUID classId = findClassId(branchId, first(m, "class", "classname", "class_name"));
                UUID sectionId = classId == null ? null : findSectionId(classId, first(m, "section", "sectionname", "section_name"));
                LocalDate dob = parseDate(first(m, "dateofbirth", "dob", "date_of_birth"), LocalDate.of(2012, 1, 1));
                LocalDate admitted = parseDate(first(m, "admissiondate", "admission_date"), LocalDate.now());
                String gender = first(m, "gender");
                if (gender.isBlank()) {
                    gender = "MALE";
                }
                students.create(new SchoolDtos.StudentRequest(
                        branchId,
                        yearId,
                        classId,
                        sectionId,
                        admission,
                        code,
                        name,
                        dob,
                        gender.toUpperCase(),
                        emptyToNull(first(m, "mobile", "phone", "contact")),
                        emptyToNull(first(m, "email")),
                        emptyToNull(first(m, "address")),
                        admitted,
                        "ACTIVE",
                        null,
                        null
                ));
                created++;
            } catch (Exception ex) {
                skipped++;
                errors.add("Row " + (i + 1) + ": " + ex.getMessage());
            }
        }
        return result(created, skipped, errors);
    }

    @PostMapping("/invoices")
    public Map<String, Object> importInvoices(@RequestBody CsvImportRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.ACCOUNTANT);
        if (request.feeStructureId() == null) {
            throw ApiException.badRequest("feeStructureId is required");
        }
        feeStructures.findById(request.feeStructureId()).orElseThrow(() -> ApiException.notFound("Fee structure not found"));
        LocalDate due = request.dueDate() == null ? LocalDate.now().plusDays(15) : request.dueDate();
        List<String[]> rows = parseCsv(request.csv());
        int created = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();
        boolean header = !rows.isEmpty() && looksLikeHeader(rows.get(0));
        for (int i = header ? 1 : 0; i < rows.size(); i++) {
            String[] cols = rows.get(i);
            try {
                String admission = cols.length > 0 ? cols[0].trim() : "";
                if (admission.isBlank()) {
                    skipped++;
                    continue;
                }
                var student = studentRepo.findAll().stream()
                        .filter(s -> admission.equalsIgnoreCase(s.getAdmissionNumber()) || admission.equalsIgnoreCase(s.getStudentCode()))
                        .findFirst()
                        .orElseThrow(() -> ApiException.notFound("Student not found: " + admission));
                access.assertBranch(student.getBranch().getId());
                fees.generateInvoice(student.getId(), request.feeStructureId(), due);
                created++;
            } catch (Exception ex) {
                skipped++;
                errors.add("Row " + (i + 1) + ": " + ex.getMessage());
            }
        }
        return result(created, skipped, errors);
    }

    @PostMapping("/marks")
    public Map<String, Object> importMarks(@RequestBody CsvImportRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER);
        List<String[]> rows = parseCsv(request.csv());
        int created = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();
        boolean header = !rows.isEmpty() && looksLikeHeader(rows.get(0));
        for (int i = header ? 1 : 0; i < rows.size(); i++) {
            String[] cols = rows.get(i);
            try {
                // admission,examName,subjectCode,marksObtained,maxMarks
                if (cols.length < 4) {
                    skipped++;
                    errors.add("Row " + (i + 1) + ": need admission,exam,subject,marks");
                    continue;
                }
                String admission = cols[0].trim();
                String examName = cols[1].trim();
                String subjectCode = cols[2].trim();
                BigDecimal obtained = new BigDecimal(cols[3].trim());
                var student = studentRepo.findAll().stream()
                        .filter(s -> admission.equalsIgnoreCase(s.getAdmissionNumber()) || admission.equalsIgnoreCase(s.getStudentCode()))
                        .findFirst()
                        .orElseThrow(() -> ApiException.notFound("Student not found"));
                var exam = exams.findAll().stream()
                        .filter(e -> examName.equalsIgnoreCase(e.getName()))
                        .findFirst()
                        .orElseThrow(() -> ApiException.notFound("Exam not found"));
                var subject = subjects.findAll().stream()
                        .filter(s -> subjectCode.equalsIgnoreCase(s.getCode()) || subjectCode.equalsIgnoreCase(s.getName()))
                        .findFirst()
                        .orElseThrow(() -> ApiException.notFound("Subject not found"));
                var examSubject = examSubjects.findAll().stream()
                        .filter(es -> es.getExam().getId().equals(exam.getId()) && es.getSubject().getId().equals(subject.getId()))
                        .findFirst()
                        .orElseThrow(() -> ApiException.notFound("Exam subject not linked"));
                operations.enterMarks(new SchoolDtos.MarkRequest(
                        examSubject.getId(),
                        student.getId(),
                        obtained,
                        null
                ));
                created++;
            } catch (Exception ex) {
                skipped++;
                errors.add("Row " + (i + 1) + ": " + ex.getMessage());
            }
        }
        return result(created, skipped, errors);
    }

    private UUID findClassId(UUID branchId, String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        return classes.findAll().stream()
                .filter(c -> c.getBranch().getId().equals(branchId) && name.equalsIgnoreCase(c.getName()))
                .map(c -> c.getId())
                .findFirst()
                .orElse(null);
    }

    private UUID findSectionId(UUID classId, String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        return sections.findBySchoolClassId(classId).stream()
                .filter(s -> name.equalsIgnoreCase(s.getName()))
                .map(s -> s.getId())
                .findFirst()
                .orElse(null);
    }

    private static Map<String, Object> result(int created, int skipped, List<String> errors) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("created", created);
        out.put("skipped", skipped);
        out.put("errors", errors.size() > 20 ? errors.subList(0, 20) : errors);
        out.put("errorCount", errors.size());
        out.put("transactionMode", "PARTIAL_SUCCESS");
        out.put("note", "Each valid row is committed independently. Failed rows are skipped; successful rows remain saved.");
        return out;
    }

    private static List<String[]> parseCsv(String csv) {
        if (csv == null || csv.isBlank()) {
            throw ApiException.badRequest("csv is required");
        }
        List<String[]> rows = new ArrayList<>();
        for (String line : csv.replace("\r\n", "\n").replace('\r', '\n').split("\n")) {
            if (line.isBlank()) {
                continue;
            }
            rows.add(splitCsvLine(line));
        }
        return rows;
    }

    private static String[] splitCsvLine(String line) {
        List<String> cols = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean quoted = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                quoted = !quoted;
            } else if (c == ',' && !quoted) {
                cols.add(cur.toString().trim());
                cur.setLength(0);
            } else {
                cur.append(c);
            }
        }
        cols.add(cur.toString().trim());
        return cols.toArray(String[]::new);
    }

    private static boolean looksLikeHeader(String[] cols) {
        String joined = String.join(",", cols).toLowerCase();
        return joined.contains("admission") || joined.contains("fullname") || joined.contains("exam");
    }

    private static String[] header(List<String[]> rows, boolean firstIsData) {
        if (!rows.isEmpty() && looksLikeHeader(rows.get(0))) {
            return rows.get(0);
        }
        return new String[]{"admissionNumber", "studentCode", "fullName", "gender", "dateOfBirth", "class", "section", "mobile", "email", "address", "admissionDate"};
    }

    private static Map<String, String> rowMap(String[] headers, String[] cols) {
        Map<String, String> map = new LinkedHashMap<>();
        for (int i = 0; i < headers.length && i < cols.length; i++) {
            map.put(headers[i].toLowerCase().replace(" ", "").replace("_", ""), cols[i]);
        }
        if (!map.containsKey("fullname") && cols.length >= 3) {
            map.putIfAbsent("admissionnumber", cols[0]);
            map.putIfAbsent("studentcode", cols[1]);
            map.putIfAbsent("fullname", cols[2]);
        }
        return map;
    }

    private static String first(Map<String, String> map, String... keys) {
        for (String k : keys) {
            String v = map.get(k.toLowerCase().replace(" ", "").replace("_", ""));
            if (v != null && !v.isBlank()) {
                return v.trim();
            }
        }
        return "";
    }

    private static String emptyToNull(String v) {
        return v == null || v.isBlank() ? null : v;
    }

    private static LocalDate parseDate(String raw, LocalDate fallback) {
        if (raw == null || raw.isBlank()) {
            return fallback;
        }
        try {
            return LocalDate.parse(raw.trim());
        } catch (Exception ex) {
            return fallback;
        }
    }
}
