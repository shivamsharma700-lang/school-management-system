package com.schoolgroup.sms.service;

import com.schoolgroup.sms.config.AppProperties;
import com.schoolgroup.sms.entity.AcademicYear;
import com.schoolgroup.sms.entity.Author;
import com.schoolgroup.sms.entity.Book;
import com.schoolgroup.sms.entity.BookCategory;
import com.schoolgroup.sms.entity.BookCopy;
import com.schoolgroup.sms.entity.Branch;
import com.schoolgroup.sms.entity.Driver;
import com.schoolgroup.sms.entity.Enrollment;
import com.schoolgroup.sms.entity.Exam;
import com.schoolgroup.sms.entity.ExamSubject;
import com.schoolgroup.sms.entity.FeeComponent;
import com.schoolgroup.sms.entity.FeeStructure;
import com.schoolgroup.sms.entity.Guardian;
import com.schoolgroup.sms.entity.GuardianStudent;
import com.schoolgroup.sms.entity.Invoice;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.entity.RouteStop;
import com.schoolgroup.sms.entity.SchoolClass;
import com.schoolgroup.sms.entity.Section;
import com.schoolgroup.sms.entity.Staff;
import com.schoolgroup.sms.entity.Student;
import com.schoolgroup.sms.entity.StudentTransport;
import com.schoolgroup.sms.entity.Subject;
import com.schoolgroup.sms.entity.TeacherAssignment;
import com.schoolgroup.sms.entity.TransportRoute;
import com.schoolgroup.sms.entity.UserAccount;
import com.schoolgroup.sms.entity.Vehicle;
import com.schoolgroup.sms.repository.AcademicYearRepository;
import com.schoolgroup.sms.repository.AuthorRepository;
import com.schoolgroup.sms.repository.BookCategoryRepository;
import com.schoolgroup.sms.repository.BookCopyRepository;
import com.schoolgroup.sms.repository.BookRepository;
import com.schoolgroup.sms.repository.BranchRepository;
import com.schoolgroup.sms.repository.DriverRepository;
import com.schoolgroup.sms.repository.EnrollmentRepository;
import com.schoolgroup.sms.repository.ExamRepository;
import com.schoolgroup.sms.repository.ExamSubjectRepository;
import com.schoolgroup.sms.repository.FeeComponentRepository;
import com.schoolgroup.sms.repository.FeeStructureRepository;
import com.schoolgroup.sms.repository.GuardianRepository;
import com.schoolgroup.sms.repository.GuardianStudentRepository;
import com.schoolgroup.sms.repository.InvoiceRepository;
import com.schoolgroup.sms.repository.RouteStopRepository;
import com.schoolgroup.sms.repository.SchoolClassRepository;
import com.schoolgroup.sms.repository.SectionRepository;
import com.schoolgroup.sms.repository.StaffRepository;
import com.schoolgroup.sms.repository.StudentRepository;
import com.schoolgroup.sms.repository.StudentTransportRepository;
import com.schoolgroup.sms.repository.SubjectRepository;
import com.schoolgroup.sms.repository.TeacherAssignmentRepository;
import com.schoolgroup.sms.repository.TransportRouteRepository;
import com.schoolgroup.sms.repository.UserAccountRepository;
import com.schoolgroup.sms.repository.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
@Order(1)
public class DevDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);
    public static final String DEV_PASSWORD = "Dev@School123!";

    private final AppProperties properties;
    private final PasswordEncoder encoder;
    private final BranchRepository branches;
    private final AcademicYearRepository years;
    private final UserAccountRepository users;
    private final SchoolClassRepository classes;
    private final SectionRepository sections;
    private final SubjectRepository subjects;
    private final StaffRepository staff;
    private final TeacherAssignmentRepository assignments;
    private final StudentRepository students;
    private final GuardianRepository guardians;
    private final GuardianStudentRepository links;
    private final EnrollmentRepository enrollments;
    private final FeeStructureRepository feeStructures;
    private final FeeComponentRepository feeComponents;
    private final InvoiceRepository invoices;
    private final ExamRepository exams;
    private final ExamSubjectRepository examSubjects;
    private final VehicleRepository vehicles;
    private final DriverRepository drivers;
    private final TransportRouteRepository routes;
    private final RouteStopRepository stops;
    private final StudentTransportRepository studentTransports;
    private final BookCategoryRepository bookCategories;
    private final AuthorRepository authors;
    private final BookRepository books;
    private final BookCopyRepository copies;

    public DevDataSeeder(AppProperties properties, PasswordEncoder encoder, BranchRepository branches,
                         AcademicYearRepository years, UserAccountRepository users, SchoolClassRepository classes,
                         SectionRepository sections, SubjectRepository subjects, StaffRepository staff,
                         TeacherAssignmentRepository assignments, StudentRepository students,
                         GuardianRepository guardians, GuardianStudentRepository links, EnrollmentRepository enrollments,
                         FeeStructureRepository feeStructures, FeeComponentRepository feeComponents,
                         InvoiceRepository invoices, ExamRepository exams, ExamSubjectRepository examSubjects,
                         VehicleRepository vehicles, DriverRepository drivers, TransportRouteRepository routes,
                         RouteStopRepository stops, StudentTransportRepository studentTransports,
                         BookCategoryRepository bookCategories, AuthorRepository authors, BookRepository books,
                         BookCopyRepository copies) {
        this.properties = properties;
        this.encoder = encoder;
        this.branches = branches;
        this.years = years;
        this.users = users;
        this.classes = classes;
        this.sections = sections;
        this.subjects = subjects;
        this.staff = staff;
        this.assignments = assignments;
        this.students = students;
        this.guardians = guardians;
        this.links = links;
        this.enrollments = enrollments;
        this.feeStructures = feeStructures;
        this.feeComponents = feeComponents;
        this.invoices = invoices;
        this.exams = exams;
        this.examSubjects = examSubjects;
        this.vehicles = vehicles;
        this.drivers = drivers;
        this.routes = routes;
        this.stops = stops;
        this.studentTransports = studentTransports;
        this.bookCategories = bookCategories;
        this.authors = authors;
        this.books = books;
        this.copies = copies;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!properties.getSeed().isEnabled() || users.count() > 0) {
            return;
        }
        log.warn("Seeding DEVELOPMENT DATA only. Do not use these accounts in production.");
        String[][] branchDefs = {
                {"DPS North Delhi", "NTH", "Model Town, North Delhi"},
                {"DPS South Delhi", "STH", "Saket, South Delhi"},
                {"DPS East Delhi", "EST", "Preet Vihar, East Delhi"},
                {"DPS West Delhi", "WST", "Janakpuri, West Delhi"},
                {"DPS Main Campus", "CTR", "Mathura Road, New Delhi"},
                {"DPS Noida", "LKV", "Sector 27, Noida"},
                {"DPS Greater Noida", "HLS", "Knowledge Park, Greater Noida"},
                {"DPS Gurgaon", "RVR", "Sushant Lok, Gurugram"}
        };
        Branch primary = null;
        for (String[] def : branchDefs) {
            Branch b = new Branch();
            b.setName(def[0]);
            b.setCode(def[1]);
            b.setAddress(def[2]);
            b.setPhone("011-4000-" + def[1].hashCode() % 9000);
            b.setEmail(def[1].toLowerCase() + "@dps.local");
            b.setStatus("ACTIVE");
            b.setCity("Delhi");
            b.setState("Delhi");
            b.setPincode("110001");
            b.setPrincipalName("Principal " + def[1]);
            branches.save(b);
            if (primary == null) {
                primary = b;
            }
        }

        AcademicYear y1 = year("2025-26", LocalDate.of(2025, 4, 1), LocalDate.of(2026, 3, 31), "ACTIVE");
        year("2026-27", LocalDate.of(2026, 4, 1), LocalDate.of(2027, 3, 31), "UPCOMING");
        year("2027-28", LocalDate.of(2027, 4, 1), LocalDate.of(2028, 3, 31), "UPCOMING");

        UserAccount superAdmin = user("super.admin@sms.local", "superadmin", "Super Admin", Role.SUPER_ADMIN, null);
        UserAccount branchAdmin = user("branch.admin@sms.local", "branchadmin", "North Branch Admin", Role.BRANCH_ADMIN, primary);
        UserAccount principal = user("principal@sms.local", "principal", "North Principal", Role.PRINCIPAL, primary);
        UserAccount teacherUser = user("teacher@sms.local", "teacher", "Aisha Khan", Role.TEACHER, primary);
        UserAccount accountant = user("accountant@sms.local", "accountant", "Rahul Mehta", Role.ACCOUNTANT, primary);
        UserAccount parentUser = user("parent@sms.local", "parent", "Priya Sharma", Role.PARENT, primary);
        UserAccount studentUser = user("student@sms.local", "student", "Arjun Sharma", Role.STUDENT, primary);

        SchoolClass grade5 = schoolClass(primary, "Grade 5", 5);
        Section sectionA = section(grade5, "A");
        Subject maths = subject(primary, "Mathematics", "MATH");
        Subject english = subject(primary, "English", "ENG");
        Subject science = subject(primary, "Science", "SCI");

        Staff teacher = staff(teacherUser, primary, "TCH-1001", "Senior Teacher", "TEACHER");
        staff(principal, primary, "PRN-1001", "Principal", "PRINCIPAL");
        staff(accountant, primary, "ACC-1001", "Accountant", "ACCOUNTANT");
        staff(branchAdmin, primary, "ADM-1001", "Branch Admin", "ADMIN");

        TeacherAssignment assignment = new TeacherAssignment();
        assignment.setStaff(teacher);
        assignment.setSchoolClass(grade5);
        assignment.setSection(sectionA);
        assignment.setSubject(maths);
        assignment.setAcademicYear(y1);
        assignments.save(assignment);

        Guardian guardian = new Guardian();
        guardian.setUser(parentUser);
        guardian.setFullName(parentUser.getFullName());
        guardian.setMobile("9876500001");
        guardian.setEmail(parentUser.getEmail());
        guardian.setAddress("North Campus housing");
        guardian.setOccupation("Designer");
        guardian.setStatus("ACTIVE");
        guardians.save(guardian);

        Student student = new Student();
        student.setUser(studentUser);
        student.setBranch(primary);
        student.setAcademicYear(y1);
        student.setSchoolClass(grade5);
        student.setSection(sectionA);
        student.setAdmissionNumber("NTH-2025-0001");
        student.setStudentCode("STU-1001");
        student.setFullName("Arjun Sharma");
        student.setDateOfBirth(LocalDate.of(2014, 6, 12));
        student.setGender("MALE");
        student.setMobile("9876500002");
        student.setEmail(studentUser.getEmail());
        student.setAddress("North Campus housing");
        student.setFatherName("Sanjay Sharma");
        student.setMotherName("Priya Sharma");
        student.setBloodGroup("O+");
        student.setCity("Delhi");
        student.setState("Delhi");
        student.setPincode("110009");
        student.setEmergencyContact("9876500001");
        student.setRollNumber("1");
        student.setAdmissionDate(LocalDate.of(2025, 4, 3));
        student.setStatus("ACTIVE");
        students.save(student);

        GuardianStudent gs = new GuardianStudent();
        gs.setGuardian(guardian);
        gs.setStudent(student);
        gs.setRelationship("MOTHER");
        gs.setPrimaryGuardian(true);
        links.save(gs);

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setAcademicYear(y1);
        enrollment.setSchoolClass(grade5);
        enrollment.setSection(sectionA);
        enrollment.setStatus("ENROLLED");
        enrollments.save(enrollment);

        Student sibling = new Student();
        sibling.setBranch(primary);
        sibling.setAcademicYear(y1);
        sibling.setSchoolClass(grade5);
        sibling.setSection(sectionA);
        sibling.setAdmissionNumber("NTH-2025-0002");
        sibling.setStudentCode("STU-1002");
        sibling.setFullName("Ananya Sharma");
        sibling.setDateOfBirth(LocalDate.of(2014, 8, 20));
        sibling.setGender("FEMALE");
        sibling.setAdmissionDate(LocalDate.of(2025, 4, 3));
        sibling.setFatherName("Sanjay Sharma");
        sibling.setMotherName("Priya Sharma");
        sibling.setCity("Delhi");
        sibling.setState("Delhi");
        sibling.setStatus("ACTIVE");
        students.save(sibling);
        GuardianStudent gs2 = new GuardianStudent();
        gs2.setGuardian(guardian);
        gs2.setStudent(sibling);
        gs2.setRelationship("MOTHER");
        gs2.setPrimaryGuardian(true);
        links.save(gs2);

        FeeStructure fee = new FeeStructure();
        fee.setBranch(primary);
        fee.setAcademicYear(y1);
        fee.setSchoolClass(grade5);
        fee.setName("Grade 5 Term 1");
        fee.setStatus("ACTIVE");
        feeStructures.save(fee);
        feeComponent(fee, "Tuition", "BASE", "45000");
        feeComponent(fee, "Sibling discount", "DISCOUNT", "2000");
        feeComponent(fee, "Late fee", "LATE_FEE", "500");
        feeComponent(fee, "Activity", "OTHER", "1500");

        Invoice invoice = new Invoice();
        invoice.setStudent(student);
        invoice.setBranch(primary);
        invoice.setAcademicYear(y1);
        invoice.setFeeStructure(fee);
        invoice.setInvoiceNumber("INV-DEV-0001");
        invoice.setIssueDate(LocalDate.of(2025, 4, 5));
        invoice.setDueDate(LocalDate.of(2025, 4, 30));
        invoice.setBaseAmount(new BigDecimal("45000"));
        invoice.setDiscountAmount(new BigDecimal("2000"));
        invoice.setLateFeeAmount(BigDecimal.ZERO);
        invoice.setOtherAmount(new BigDecimal("1500"));
        invoice.setTotalAmount(new BigDecimal("44500"));
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setStatus("PENDING");
        invoices.save(invoice);

        Exam exam = new Exam();
        exam.setBranch(primary);
        exam.setAcademicYear(y1);
        exam.setName("Term 1 Assessment");
        exam.setExamType("TERM");
        exam.setStartDate(LocalDate.of(2025, 9, 10));
        exam.setEndDate(LocalDate.of(2025, 9, 20));
        exam.setStatus("SCHEDULED");
        exams.save(exam);
        ExamSubject es = new ExamSubject();
        es.setExam(exam);
        es.setSchoolClass(grade5);
        es.setSubject(maths);
        es.setMaxMarks(new BigDecimal("100"));
        es.setPassingMarks(new BigDecimal("35"));
        es.setExamDate(LocalDate.of(2025, 9, 12));
        es.setStartTime(LocalTime.of(10, 0));
        es.setEndTime(LocalTime.of(12, 0));
        examSubjects.save(es);

        Vehicle vehicle = new Vehicle();
        vehicle.setBranch(primary);
        vehicle.setRegistrationNumber("DL-01-AB-1001");
        vehicle.setVehicleType("BUS");
        vehicle.setCapacity(32);
        vehicle.setStatus("ACTIVE");
        vehicles.save(vehicle);
        Driver driver = new Driver();
        driver.setBranch(primary);
        driver.setFullName("Suresh Yadav");
        driver.setLicenseNumber("DL-LIC-7788");
        driver.setMobile("9876500099");
        driver.setStatus("ACTIVE");
        drivers.save(driver);
        TransportRoute route = new TransportRoute();
        route.setBranch(primary);
        route.setName("North Route 1");
        route.setVehicle(vehicle);
        route.setDriver(driver);
        route.setStatus("ACTIVE");
        routes.save(route);
        RouteStop stop = new RouteStop();
        stop.setRoute(route);
        stop.setName("Lake Gate");
        stop.setSequenceNo(1);
        stop.setArrivalTime(LocalTime.of(7, 20));
        stops.save(stop);
        StudentTransport st = new StudentTransport();
        st.setStudent(student);
        st.setRoute(route);
        st.setStop(stop);
        st.setAcademicYear(y1);
        st.setStatus("ACTIVE");
        studentTransports.save(st);

        Branch east = branches.findByCode("EST").orElseThrow();
        SchoolClass eastClass = schoolClass(east, "Grade 5", 5);
        Section eastSection = section(eastClass, "A");
        Student outsider = new Student();
        outsider.setBranch(east);
        outsider.setAcademicYear(y1);
        outsider.setSchoolClass(eastClass);
        outsider.setSection(eastSection);
        outsider.setAdmissionNumber("EST-2025-0001");
        outsider.setStudentCode("STU-EAST-1");
        outsider.setFullName("Other Child");
        outsider.setDateOfBirth(LocalDate.of(2014, 1, 1));
        outsider.setGender("MALE");
        outsider.setAdmissionDate(LocalDate.of(2025, 4, 3));
        outsider.setStatus("ACTIVE");
        students.save(outsider);

        BookCategory cat = new BookCategory();
        cat.setBranch(primary);
        cat.setName("Science");
        bookCategories.save(cat);
        Author author = new Author();
        author.setName("Development Author");
        authors.save(author);
        Book book = new Book();
        book.setBranch(primary);
        book.setCategory(cat);
        book.setAuthor(author);
        book.setTitle("Exploring Mathematics");
        book.setIsbn("9780000000001");
        books.save(book);
        BookCopy copy = new BookCopy();
        copy.setBook(book);
        copy.setCopyCode("BK-NTH-0001");
        copy.setStatus("AVAILABLE");
        copies.save(copy);

        log.warn("Development users ready. Password for all seeded accounts: {}", DEV_PASSWORD);
        log.warn("Seeded users: {}", List.of(superAdmin.getEmail(), branchAdmin.getEmail(), principal.getEmail(),
                teacherUser.getEmail(), accountant.getEmail(), parentUser.getEmail(), studentUser.getEmail()));
    }

    private AcademicYear year(String name, LocalDate start, LocalDate end, String status) {
        AcademicYear y = new AcademicYear();
        y.setName(name);
        y.setStartDate(start);
        y.setEndDate(end);
        y.setStatus(status);
        return years.save(y);
    }

    private UserAccount user(String email, String username, String name, Role role, Branch branch) {
        UserAccount u = new UserAccount();
        u.setEmail(email);
        u.setUsername(username);
        u.setPasswordHash(encoder.encode(DEV_PASSWORD));
        u.setFullName(name);
        u.setMobile("9999900000");
        u.setRole(role);
        u.setBranch(branch);
        u.setStatus("ACTIVE");
        return users.save(u);
    }

    private SchoolClass schoolClass(Branch branch, String name, int grade) {
        SchoolClass c = new SchoolClass();
        c.setBranch(branch);
        c.setName(name);
        c.setGradeLevel(grade);
        c.setStatus("ACTIVE");
        return classes.save(c);
    }

    private Section section(SchoolClass c, String name) {
        Section s = new Section();
        s.setSchoolClass(c);
        s.setName(name);
        s.setCapacity(40);
        s.setStatus("ACTIVE");
        return sections.save(s);
    }

    private Subject subject(Branch branch, String name, String code) {
        Subject s = new Subject();
        s.setBranch(branch);
        s.setName(name);
        s.setCode(code);
        s.setStatus("ACTIVE");
        return subjects.save(s);
    }

    private Staff staff(UserAccount user, Branch branch, String code, String designation, String type) {
        Staff s = new Staff();
        s.setUser(user);
        s.setBranch(branch);
        s.setEmployeeCode(code);
        s.setDesignation(designation);
        s.setStaffType(type);
        s.setQualification("Post Graduate");
        s.setJoiningDate(LocalDate.of(2022, 6, 1));
        s.setStatus("ACTIVE");
        return staff.save(s);
    }

    private void feeComponent(FeeStructure structure, String name, String type, String amount) {
        FeeComponent c = new FeeComponent();
        c.setFeeStructure(structure);
        c.setName(name);
        c.setComponentType(type);
        c.setAmount(new BigDecimal(amount));
        feeComponents.save(c);
    }
}
