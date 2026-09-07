package com.schoolgroup.sms.demo;

import com.schoolgroup.sms.entity.AcademicYear;
import com.schoolgroup.sms.entity.Author;
import com.schoolgroup.sms.entity.Book;
import com.schoolgroup.sms.entity.BookCategory;
import com.schoolgroup.sms.entity.BookCopy;
import com.schoolgroup.sms.entity.BookLoan;
import com.schoolgroup.sms.entity.Branch;
import com.schoolgroup.sms.entity.Driver;
import com.schoolgroup.sms.entity.Exam;
import com.schoolgroup.sms.entity.ExamSubject;
import com.schoolgroup.sms.entity.LeaveRequest;
import com.schoolgroup.sms.entity.Mark;
import com.schoolgroup.sms.entity.RouteStop;
import com.schoolgroup.sms.entity.Staff;
import com.schoolgroup.sms.entity.Student;
import com.schoolgroup.sms.entity.StudentAttendance;
import com.schoolgroup.sms.entity.StudentTransport;
import com.schoolgroup.sms.entity.Subject;
import com.schoolgroup.sms.entity.TransportRoute;
import com.schoolgroup.sms.entity.UserAccount;
import com.schoolgroup.sms.entity.Vehicle;
import com.schoolgroup.sms.repository.AcademicYearRepository;
import com.schoolgroup.sms.repository.AuthorRepository;
import com.schoolgroup.sms.repository.BookCategoryRepository;
import com.schoolgroup.sms.repository.BookCopyRepository;
import com.schoolgroup.sms.repository.BookLoanRepository;
import com.schoolgroup.sms.repository.BookRepository;
import com.schoolgroup.sms.repository.BranchRepository;
import com.schoolgroup.sms.repository.DriverRepository;
import com.schoolgroup.sms.repository.ExamRepository;
import com.schoolgroup.sms.repository.ExamSubjectRepository;
import com.schoolgroup.sms.repository.LeaveRequestRepository;
import com.schoolgroup.sms.repository.MarkRepository;
import com.schoolgroup.sms.repository.RouteStopRepository;
import com.schoolgroup.sms.repository.StaffRepository;
import com.schoolgroup.sms.repository.StudentAttendanceRepository;
import com.schoolgroup.sms.repository.StudentRepository;
import com.schoolgroup.sms.repository.StudentTransportRepository;
import com.schoolgroup.sms.repository.SubjectRepository;
import com.schoolgroup.sms.repository.TransportRouteRepository;
import com.schoolgroup.sms.repository.UserAccountRepository;
import com.schoolgroup.sms.repository.VehicleRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class DemoEnrichmentService {

    private static final Logger log = LoggerFactory.getLogger(DemoEnrichmentService.class);
    private static final String EXAM_NAME = "Demo Mid-Term 2025-26";

    @PersistenceContext
    private EntityManager em;

    private final BranchRepository branches;
    private final AcademicYearRepository years;
    private final StudentRepository students;
    private final StaffRepository staff;
    private final SubjectRepository subjects;
    private final UserAccountRepository users;
    private final StudentAttendanceRepository attendance;
    private final ExamRepository exams;
    private final ExamSubjectRepository examSubjects;
    private final MarkRepository marks;
    private final VehicleRepository vehicles;
    private final DriverRepository drivers;
    private final TransportRouteRepository routes;
    private final RouteStopRepository stops;
    private final StudentTransportRepository transports;
    private final BookCategoryRepository categories;
    private final AuthorRepository authors;
    private final BookRepository books;
    private final BookCopyRepository copies;
    private final BookLoanRepository loans;
    private final LeaveRequestRepository leaves;

    public DemoEnrichmentService(BranchRepository branches, AcademicYearRepository years, StudentRepository students,
                                 StaffRepository staff, SubjectRepository subjects, UserAccountRepository users,
                                 StudentAttendanceRepository attendance, ExamRepository exams,
                                 ExamSubjectRepository examSubjects, MarkRepository marks, VehicleRepository vehicles,
                                 DriverRepository drivers, TransportRouteRepository routes, RouteStopRepository stops,
                                 StudentTransportRepository transports, BookCategoryRepository categories,
                                 AuthorRepository authors, BookRepository books, BookCopyRepository copies,
                                 BookLoanRepository loans, LeaveRequestRepository leaves) {
        this.branches = branches;
        this.years = years;
        this.students = students;
        this.staff = staff;
        this.subjects = subjects;
        this.users = users;
        this.attendance = attendance;
        this.exams = exams;
        this.examSubjects = examSubjects;
        this.marks = marks;
        this.vehicles = vehicles;
        this.drivers = drivers;
        this.routes = routes;
        this.stops = stops;
        this.transports = transports;
        this.categories = categories;
        this.authors = authors;
        this.books = books;
        this.copies = copies;
        this.loans = loans;
        this.leaves = leaves;
    }

    @Transactional(timeout = 360)
    public void enrichAll() {
        AcademicYear year = years.findFirstByStatus("ACTIVE").orElseGet(() -> years.findAll().get(0));
        UserAccount marker = users.findByEmailIgnoreCase("super.admin@sms.local").orElseThrow();
        List<LocalDate> recentDays = recentWeekdays(3);
        for (Branch branch : branches.findAll()) {
            enrichBranch(branch, year, marker, recentDays);
        }
        log.warn("Demo enrichment complete for {} campuses.", branches.count());
    }

    private void enrichBranch(Branch branch, AcademicYear year, UserAccount marker, List<LocalDate> recentDays) {
        List<Student> roster = students.findAllByBranchId(branch.getId());
        if (roster.isEmpty()) {
            return;
        }
        seedRecentAttendance(roster, year, marker, recentDays);
        Exam exam = ensureExam(branch, year, roster);
        ensureTransport(branch, year, roster);
        ensureLibrary(branch, marker, roster);
        ensureLeave(branch, roster, marker);
        em.flush();
        log.info("Enriched demo campus {}", branch.getName());
        if (exam != null) {
            // keep compiler happy if exam already existed
        }
    }

    private void seedRecentAttendance(List<Student> roster, AcademicYear year, UserAccount marker, List<LocalDate> days) {
        int created = 0;
        for (LocalDate day : days) {
            long already = attendance.countByAttendanceDateAndBranchId(day, roster.get(0).getBranch().getId());
            if (already >= 400) {
                continue;
            }
            boolean checkExisting = already > 0;
            for (Student student : roster) {
                if (student.getSchoolClass() == null || student.getSection() == null) {
                    continue;
                }
                if (checkExisting && attendance.existsByStudentIdAndAttendanceDateAndSession(student.getId(), day, "FULL_DAY")) {
                    continue;
                }
                int hash = Math.abs(student.getAdmissionNumber().hashCode() + day.getDayOfYear());
                StudentAttendance row = new StudentAttendance();
                row.setStudent(student);
                row.setBranch(student.getBranch());
                row.setAcademicYear(year);
                row.setSchoolClass(student.getSchoolClass());
                row.setSection(student.getSection());
                row.setAttendanceDate(day);
                row.setSession("FULL_DAY");
                row.setStatus(hash % 19 == 0 ? "ABSENT" : hash % 29 == 0 ? "LATE" : "PRESENT");
                row.setMarkedBy(marker);
                em.persist(row);
                created++;
                if (created % 40 == 0) {
                    em.flush();
                }
            }
        }
        em.flush();
    }

    private Exam ensureExam(Branch branch, AcademicYear year, List<Student> roster) {
        if (exams.existsByBranchIdAndName(branch.getId(), EXAM_NAME)) {
            return null;
        }
        Exam exam = new Exam();
        exam.setBranch(branch);
        exam.setAcademicYear(year);
        exam.setName(EXAM_NAME);
        exam.setExamType("TERM");
        exam.setStartDate(LocalDate.of(2025, 9, 8));
        exam.setEndDate(LocalDate.of(2025, 9, 18));
        exam.setStatus("PUBLISHED");
        exams.save(exam);
        List<Subject> subjectList = subjects.findByBranchId(branch.getId()).stream().limit(2).toList();
        List<ExamSubject> papers = new ArrayList<>();
        int i = 0;
        for (Subject subject : subjectList) {
            var classRef = roster.stream().map(Student::getSchoolClass).filter(c -> c != null).findFirst().orElse(null);
            if (classRef == null) {
                continue;
            }
            ExamSubject paper = new ExamSubject();
            paper.setExam(exam);
            paper.setSchoolClass(classRef);
            paper.setSubject(subject);
            paper.setMaxMarks(new BigDecimal("100"));
            paper.setPassingMarks(new BigDecimal("35"));
            paper.setExamDate(LocalDate.of(2025, 9, 10).plusDays(i));
            paper.setStartTime(LocalTime.of(10, 0));
            paper.setEndTime(LocalTime.of(12, 0));
            examSubjects.save(paper);
            papers.add(paper);
            i++;
        }
        UserAccount enteredBy = users.findByEmailIgnoreCase("super.admin@sms.local").orElseThrow();
        int marked = 0;
        for (Student student : roster) {
            if (marked >= 16) {
                break;
            }
            for (ExamSubject paper : papers) {
                if (marks.existsByExamSubjectIdAndStudentId(paper.getId(), student.getId())) {
                    continue;
                }
                int score = 62 + Math.abs(student.getAdmissionNumber().hashCode()) % 36;
                Mark mark = new Mark();
                mark.setExamSubject(paper);
                mark.setStudent(student);
                mark.setMarksObtained(new BigDecimal(score));
                mark.setGrade(score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : "C");
                mark.setRemarks("Demo term mark");
                mark.setEnteredBy(enteredBy);
                marks.save(mark);
            }
            marked++;
        }
        return exam;
    }

    private void ensureTransport(Branch branch, AcademicYear year, List<Student> roster) {
        String reg = "DL-DEMO-" + branch.getCode() + "-01";
        Vehicle vehicle;
        if (vehicles.existsByRegistrationNumber(reg)) {
            vehicle = vehicles.findAll().stream()
                    .filter(v -> reg.equals(v.getRegistrationNumber()))
                    .findFirst().orElse(null);
        } else {
            vehicle = new Vehicle();
            vehicle.setBranch(branch);
            vehicle.setRegistrationNumber(reg);
            vehicle.setVehicleType("BUS");
            vehicle.setCapacity(40);
            vehicle.setStatus("ACTIVE");
            vehicles.save(vehicle);
        }
        String license = "DL-LIC-DEMO-" + branch.getCode();
        Driver driver;
        if (drivers.existsByLicenseNumber(license)) {
            driver = drivers.findAll().stream().filter(d -> license.equals(d.getLicenseNumber())).findFirst().orElse(null);
        } else {
            driver = new Driver();
            driver.setBranch(branch);
            driver.setFullName("Rakesh " + branch.getCode());
            driver.setLicenseNumber(license);
            driver.setMobile("98111" + String.format("%05d", Math.abs(branch.getCode().hashCode()) % 90000));
            driver.setStatus("ACTIVE");
            drivers.save(driver);
        }
        TransportRoute route = routes.findAll().stream()
                .filter(r -> r.getBranch().getId().equals(branch.getId()) && r.getName().startsWith("Demo "))
                .findFirst().orElse(null);
        if (route == null && vehicle != null && driver != null) {
            route = new TransportRoute();
            route.setBranch(branch);
            route.setName("Demo " + branch.getCode() + " Ring");
            route.setVehicle(vehicle);
            route.setDriver(driver);
            route.setStatus("ACTIVE");
            routes.save(route);
            String[] stopNames = {"Campus Gate", "Metro Circle", "Sector Market"};
            for (int i = 0; i < stopNames.length; i++) {
                RouteStop stop = new RouteStop();
                stop.setRoute(route);
                stop.setName(stopNames[i]);
                stop.setSequenceNo(i + 1);
                stop.setArrivalTime(LocalTime.of(7, 10).plusMinutes(i * 12L));
                stops.save(stop);
            }
        }
        if (route == null) {
            return;
        }
        final UUID routeId = route.getId();
        List<RouteStop> routeStops = stops.findAll().stream().filter(s -> s.getRoute().getId().equals(routeId)).toList();
        if (routeStops.isEmpty()) {
            return;
        }
        int assigned = 0;
        for (Student student : roster) {
            if (assigned >= 40) {
                break;
            }
            if (transports.existsByStudentId(student.getId())) {
                assigned++;
                continue;
            }
            StudentTransport st = new StudentTransport();
            st.setStudent(student);
            st.setRoute(route);
            st.setStop(routeStops.get(assigned % routeStops.size()));
            st.setAcademicYear(year);
            st.setStatus("ACTIVE");
            transports.save(st);
            assigned++;
        }
    }

    private void ensureLibrary(Branch branch, UserAccount issuedBy, List<Student> roster) {
        String copyCode = "BK-DEMO-" + branch.getCode() + "-01";
        if (copies.findByCopyCode(copyCode).isEmpty()) {
            Author author = authors.findByName("Demo Campus Author").orElseGet(() -> {
                Author a = new Author();
                a.setName("Demo Campus Author");
                return authors.save(a);
            });
            BookCategory cat = new BookCategory();
            cat.setBranch(branch);
            cat.setName("Demo Readers");
            categories.save(cat);
            Book book = new Book();
            book.setBranch(branch);
            book.setCategory(cat);
            book.setAuthor(author);
            book.setTitle("Young Explorers · " + branch.getCode());
            book.setIsbn("9780000" + String.format("%06d", Math.abs(branch.getCode().hashCode()) % 1000000));
            books.save(book);
            BookCopy copy = new BookCopy();
            copy.setBook(book);
            copy.setCopyCode(copyCode);
            copy.setStatus("ISSUED");
            copies.save(copy);
            Student first = roster.get(0);
            BookLoan loan = new BookLoan();
            loan.setCopy(copy);
            loan.setStudent(first);
            loan.setIssuedBy(issuedBy);
            loan.setIssuedAt(Instant.now().minusSeconds(86400));
            loan.setDueDate(LocalDate.now().plusDays(10));
            loan.setStatus("ISSUED");
            loans.save(loan);
        }
    }

    private void ensureLeave(Branch branch, List<Student> roster, UserAccount admin) {
        String reason = "DEMO enrichment leave · " + branch.getCode();
        boolean exists = leaves.findAll().stream().anyMatch(l -> reason.equals(l.getReason()));
        if (exists) {
            return;
        }
        List<Staff> teachers = staff.findByBranchIdAndStaffType(branch.getId(), "TEACHER");
        if (!teachers.isEmpty()) {
            Staff teacher = teachers.get(0);
            LeaveRequest staffLeave = new LeaveRequest();
            staffLeave.setBranch(branch);
            staffLeave.setRequester(teacher.getUser());
            staffLeave.setStaff(teacher);
            staffLeave.setLeaveType("CASUAL");
            staffLeave.setStartDate(LocalDate.now().plusDays(3));
            staffLeave.setEndDate(LocalDate.now().plusDays(3));
            staffLeave.setReason(reason);
            staffLeave.setStatus("PENDING");
            leaves.save(staffLeave);
        }
        Student student = roster.get(0);
        LeaveRequest studentLeave = new LeaveRequest();
        studentLeave.setBranch(branch);
        studentLeave.setRequester(admin);
        studentLeave.setStudent(student);
        studentLeave.setLeaveType("SICK");
        studentLeave.setStartDate(LocalDate.now().minusDays(2));
        studentLeave.setEndDate(LocalDate.now().minusDays(2));
        studentLeave.setReason(reason + " student");
        studentLeave.setStatus("APPROVED");
        leaves.save(studentLeave);
    }

    private static List<LocalDate> recentWeekdays(int count) {
        List<LocalDate> days = new ArrayList<>();
        LocalDate cursor = LocalDate.now();
        while (days.size() < count) {
            DayOfWeek dow = cursor.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                days.add(cursor);
            }
            cursor = cursor.minusDays(1);
        }
        return days;
    }
}
