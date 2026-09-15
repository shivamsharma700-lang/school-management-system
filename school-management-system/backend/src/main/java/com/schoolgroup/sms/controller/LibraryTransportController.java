package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.entity.BookCopy;
import com.schoolgroup.sms.entity.BookLoan;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.entity.StudentTransport;
import com.schoolgroup.sms.entity.Trip;
import com.schoolgroup.sms.entity.TripLocation;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.BookCopyRepository;
import com.schoolgroup.sms.repository.BookLoanRepository;
import com.schoolgroup.sms.repository.StudentTransportRepository;
import com.schoolgroup.sms.repository.TripLocationRepository;
import com.schoolgroup.sms.service.AccessService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
    private final com.schoolgroup.sms.repository.TransportRouteRepository routes;
    private final com.schoolgroup.sms.repository.TripRepository trips;
    private final TripLocationRepository locations;
    private final com.schoolgroup.sms.repository.BookRepository books;
    private final com.schoolgroup.sms.repository.AuthorRepository authors;
    private final com.schoolgroup.sms.repository.BookCategoryRepository categories;
    private final com.schoolgroup.sms.repository.BranchRepository branches;

    public LibraryTransportController(AccessService access, BookCopyRepository copies, BookLoanRepository loans,
                                      StudentTransportRepository transports,
                                      com.schoolgroup.sms.repository.StudentRepository students,
                                      com.schoolgroup.sms.repository.UserAccountRepository users,
                                      com.schoolgroup.sms.repository.TransportRouteRepository routes,
                                      com.schoolgroup.sms.repository.TripRepository trips,
                                      TripLocationRepository locations,
                                      com.schoolgroup.sms.repository.BookRepository books,
                                      com.schoolgroup.sms.repository.AuthorRepository authors,
                                      com.schoolgroup.sms.repository.BookCategoryRepository categories,
                                      com.schoolgroup.sms.repository.BranchRepository branches) {
        this.access = access;
        this.copies = copies;
        this.loans = loans;
        this.transports = transports;
        this.students = students;
        this.users = users;
        this.routes = routes;
        this.trips = trips;
        this.locations = locations;
        this.books = books;
        this.authors = authors;
        this.categories = categories;
        this.branches = branches;
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

    @PostMapping("/library/books")
    @Transactional
    public Map<String, Object> createBook(@RequestBody Map<String, Object> body) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        String title = body.get("title") == null ? "" : String.valueOf(body.get("title")).trim();
        String authorName = body.get("author") == null ? "Unknown" : String.valueOf(body.get("author")).trim();
        String categoryName = body.get("category") == null ? "General" : String.valueOf(body.get("category")).trim();
        String copyCode = body.get("copyCode") == null ? "" : String.valueOf(body.get("copyCode")).trim();
        String isbn = body.get("isbn") == null ? null : String.valueOf(body.get("isbn")).trim();
        if (title.isBlank() || copyCode.isBlank()) {
            throw ApiException.badRequest("title and copyCode are required");
        }
        UUID branchId = access.resolveBranch(body.get("branchId") == null ? null : UUID.fromString(String.valueOf(body.get("branchId"))));
        if (branchId == null) {
            throw ApiException.badRequest("branchId is required");
        }
        var branch = branches.findById(branchId).orElseThrow(() -> ApiException.notFound("Branch not found"));
        var author = authors.findByName(authorName).orElseGet(() -> {
            var a = new com.schoolgroup.sms.entity.Author();
            a.setName(authorName);
            return authors.save(a);
        });
        var category = categories.findFirstByBranchIdAndNameIgnoreCase(branchId, categoryName).orElseGet(() -> {
            var c = new com.schoolgroup.sms.entity.BookCategory();
            c.setBranch(branch);
            c.setName(categoryName);
            return categories.save(c);
        });
        var book = new com.schoolgroup.sms.entity.Book();
        book.setBranch(branch);
        book.setAuthor(author);
        book.setCategory(category);
        book.setTitle(title);
        book.setIsbn(isbn == null || isbn.isBlank() ? null : isbn);
        books.save(book);
        BookCopy copy = new BookCopy();
        copy.setBook(book);
        copy.setCopyCode(copyCode);
        copy.setStatus("AVAILABLE");
        copies.save(copy);
        return Map.of(
                "id", copy.getId(),
                "bookId", book.getId(),
                "title", book.getTitle(),
                "copyCode", copy.getCopyCode(),
                "status", copy.getStatus()
        );
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

    @GetMapping("/transport/routes")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> transportRoutes() {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER,
                Role.ACCOUNTANT, Role.TRANSPORT);
        UUID branchId = access.current().getRole() == Role.SUPER_ADMIN ? null : access.requireBranch();
        return routes.findAll().stream()
                .filter(r -> branchId == null || r.getBranch().getId().equals(branchId))
                .map(r -> {
                    Map<String, Object> row = new java.util.LinkedHashMap<>();
                    row.put("id", r.getId());
                    row.put("name", r.getName());
                    row.put("status", r.getStatus());
                    row.put("vehicle", r.getVehicle() == null ? "" : r.getVehicle().getRegistrationNumber());
                    row.put("driver", r.getDriver() == null ? "" : r.getDriver().getFullName());
                    return row;
                })
                .toList();
    }

    @GetMapping("/transport/trips")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> transportTrips(@RequestParam(required = false) LocalDate date) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.ACCOUNTANT, Role.PARENT, Role.STUDENT);
        LocalDate d = date == null ? LocalDate.now() : date;
        UUID branchId = access.current().getRole() == Role.SUPER_ADMIN ? null : access.current().getBranchId();
        return trips.findAll().stream()
                .filter(t -> t.getTripDate().equals(d))
                .filter(t -> branchId == null || t.getRoute().getBranch().getId().equals(branchId))
                .map(t -> {
                    Map<String, Object> row = new java.util.LinkedHashMap<>();
                    row.put("id", t.getId());
                    row.put("route", t.getRoute().getName());
                    row.put("tripDate", t.getTripDate().toString());
                    row.put("tripType", t.getTripType());
                    row.put("status", t.getStatus());
                    row.put("hasTrackingToken", t.getTrackingTokenHash() != null && !t.getTrackingTokenHash().isBlank());
                    locations.findFirstByTripIdOrderByRecordedAtDesc(t.getId()).ifPresent(loc -> {
                        row.put("latitude", loc.getLatitude());
                        row.put("longitude", loc.getLongitude());
                        row.put("speedKmh", loc.getSpeedKmh() == null ? "" : loc.getSpeedKmh());
                        row.put("lastPingAt", loc.getRecordedAt().toString());
                    });
                    return row;
                })
                .toList();
    }

    @GetMapping("/transport/trips/{id}/locations")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> tripLocations(@PathVariable UUID id) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.ACCOUNTANT, Role.PARENT, Role.STUDENT);
        Trip trip = trips.findById(id).orElseThrow(() -> ApiException.notFound("Trip not found"));
        if (access.current().getRole() != Role.SUPER_ADMIN) {
            access.assertBranch(trip.getRoute().getBranch().getId());
        }
        return locations.findByTripIdOrderByRecordedAtDesc(id).stream().map(loc -> {
            Map<String, Object> row = new java.util.LinkedHashMap<>();
            row.put("id", loc.getId());
            row.put("tripId", trip.getId());
            row.put("latitude", loc.getLatitude());
            row.put("longitude", loc.getLongitude());
            row.put("speedKmh", loc.getSpeedKmh() == null ? "" : loc.getSpeedKmh());
            row.put("recordedAt", loc.getRecordedAt().toString());
            row.put("note", loc.getNote() == null ? "" : loc.getNote());
            return row;
        }).toList();
    }

    @PostMapping("/transport/trips/{id}/locations")
    @Transactional
    public Map<String, Object> pingLocation(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        Trip trip = trips.findById(id).orElseThrow(() -> ApiException.notFound("Trip not found"));
        access.assertBranch(trip.getRoute().getBranch().getId());
        if (body.get("latitude") == null || body.get("longitude") == null) {
            throw ApiException.badRequest("latitude and longitude are required");
        }
        TripLocation loc = new TripLocation();
        loc.setTrip(trip);
        loc.setLatitude(new java.math.BigDecimal(String.valueOf(body.get("latitude"))));
        loc.setLongitude(new java.math.BigDecimal(String.valueOf(body.get("longitude"))));
        if (body.get("speedKmh") != null && !String.valueOf(body.get("speedKmh")).isBlank()) {
            loc.setSpeedKmh(new java.math.BigDecimal(String.valueOf(body.get("speedKmh"))));
        }
        loc.setRecordedAt(Instant.now());
        loc.setNote(body.get("note") == null ? null : String.valueOf(body.get("note")));
        locations.save(loc);
        trip.setStatus("IN_PROGRESS");
        Map<String, Object> row = new java.util.LinkedHashMap<>();
        row.put("id", loc.getId());
        row.put("tripId", trip.getId());
        row.put("latitude", loc.getLatitude());
        row.put("longitude", loc.getLongitude());
        row.put("recordedAt", loc.getRecordedAt().toString());
        return row;
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
