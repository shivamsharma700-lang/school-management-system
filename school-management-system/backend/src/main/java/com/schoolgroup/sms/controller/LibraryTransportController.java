package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.entity.BookCopy;
import com.schoolgroup.sms.entity.BookLoan;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.entity.StudentTransport;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.BookCopyRepository;
import com.schoolgroup.sms.repository.BookLoanRepository;
import com.schoolgroup.sms.repository.StudentTransportRepository;
import com.schoolgroup.sms.service.AccessService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class LibraryTransportController {

    private final AccessService access;
    private final BookCopyRepository copies;
    private final BookLoanRepository loans;
    private final StudentTransportRepository transports;
    private final com.schoolgroup.sms.repository.StudentRepository students;
    private final com.schoolgroup.sms.repository.UserAccountRepository users;

    public LibraryTransportController(AccessService access, BookCopyRepository copies, BookLoanRepository loans,
                                      StudentTransportRepository transports,
                                      com.schoolgroup.sms.repository.StudentRepository students,
                                      com.schoolgroup.sms.repository.UserAccountRepository users) {
        this.access = access;
        this.copies = copies;
        this.loans = loans;
        this.transports = transports;
        this.students = students;
        this.users = users;
    }

    @GetMapping("/library/loans")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> loans() {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.STUDENT, Role.PARENT, Role.ACCOUNTANT);
        UUID userId = access.current().getId();
        boolean ownOnly = access.current().getRole() == Role.STUDENT || access.current().getRole() == Role.PARENT;
        return loans.findAll().stream()
                .filter(l -> {
                    if (!ownOnly) {
                        return true;
                    }
                    try {
                        access.requireStudentAccess(l.getStudent().getId());
                        return true;
                    } catch (RuntimeException ex) {
                        return l.getStudent().getUser() != null && l.getStudent().getUser().getId().equals(userId);
                    }
                })
                .map(l -> {
                    Map<String, Object> row = new java.util.LinkedHashMap<>();
                    row.put("id", l.getId());
                    row.put("title", l.getCopy().getBook().getTitle());
                    row.put("copyCode", l.getCopy().getCopyCode());
                    row.put("student", l.getStudent().getFullName());
                    row.put("studentId", l.getStudent().getId());
                    row.put("status", l.getStatus());
                    row.put("dueDate", l.getDueDate() == null ? "" : l.getDueDate().toString());
                    row.put("issuedAt", l.getIssuedAt() == null ? "" : l.getIssuedAt().toString());
                    return row;
                })
                .toList();
    }

    @GetMapping("/library/copies")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> copies() {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.STUDENT);
        return copies.findAll().stream().map(c -> Map.<String, Object>of(
                "id", c.getId(),
                "copyCode", c.getCopyCode(),
                "title", c.getBook().getTitle(),
                "status", c.getStatus()
        )).toList();
    }

    @PostMapping("/library/issue")
    @Transactional
    public Map<String, Object> issue(@RequestParam UUID copyId, @RequestParam UUID studentId) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        BookCopy copy = copies.findById(copyId).orElseThrow(() -> ApiException.notFound("Copy not found"));
        if (!"AVAILABLE".equals(copy.getStatus())) {
            throw ApiException.conflict("Book copy is not available");
        }
        var student = access.requireStudentAccess(studentId);
        copy.setStatus("ISSUED");
        BookLoan loan = new BookLoan();
        loan.setCopy(copy);
        loan.setStudent(student);
        loan.setIssuedBy(users.findById(access.current().getId()).orElseThrow());
        loan.setIssuedAt(Instant.now());
        loan.setDueDate(LocalDate.now().plusDays(14));
        loan.setStatus("ISSUED");
        loans.save(loan);
        return Map.of("loanId", loan.getId(), "dueDate", loan.getDueDate().toString());
    }

    @PostMapping("/library/return")
    @Transactional
    public Map<String, String> giveBack(@RequestParam UUID loanId) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        BookLoan loan = loans.findById(loanId).orElseThrow(() -> ApiException.notFound("Loan not found"));
        loan.setStatus("RETURNED");
        loan.setReturnedAt(Instant.now());
        loan.getCopy().setStatus("AVAILABLE");
        return Map.of("status", "returned");
    }

    @GetMapping("/transport/my")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> myTransport(@RequestParam(required = false) UUID studentId) {
        UUID id = studentId;
        if (id == null && access.current().getRole() == Role.STUDENT) {
            id = students.findByUserId(access.current().getId()).orElseThrow(() -> ApiException.notFound("Student not found")).getId();
        }
        if (id == null) {
            throw ApiException.badRequest("studentId is required");
        }
        access.requireStudentAccess(id);
        UUID finalId = id;
        return transports.findAll().stream()
                .filter(t -> t.getStudent().getId().equals(finalId))
                .map(LibraryTransportController::toTransport)
                .toList();
    }

    private static Map<String, Object> toTransport(StudentTransport t) {
        return Map.of(
                "route", t.getRoute().getName(),
                "stop", t.getStop().getName(),
                "vehicle", t.getRoute().getVehicle() == null ? "" : t.getRoute().getVehicle().getRegistrationNumber(),
                "driver", t.getRoute().getDriver() == null ? "" : t.getRoute().getDriver().getFullName(),
                "status", t.getStatus()
        );
    }
}
