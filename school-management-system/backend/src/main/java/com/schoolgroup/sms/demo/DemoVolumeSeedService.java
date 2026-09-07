package com.schoolgroup.sms.demo;

import com.schoolgroup.sms.entity.AcademicYear;
import com.schoolgroup.sms.entity.Branch;
import com.schoolgroup.sms.entity.Enrollment;
import com.schoolgroup.sms.entity.FeeStructure;
import com.schoolgroup.sms.entity.Guardian;
import com.schoolgroup.sms.entity.GuardianStudent;
import com.schoolgroup.sms.entity.Homework;
import com.schoolgroup.sms.entity.Invoice;
import com.schoolgroup.sms.entity.Notice;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.entity.SchoolClass;
import com.schoolgroup.sms.entity.Section;
import com.schoolgroup.sms.entity.Staff;
import com.schoolgroup.sms.entity.Student;
import com.schoolgroup.sms.entity.StudentAttendance;
import com.schoolgroup.sms.entity.Subject;
import com.schoolgroup.sms.entity.TeacherAssignment;
import com.schoolgroup.sms.entity.TimetableSlot;
import com.schoolgroup.sms.entity.UserAccount;
import com.schoolgroup.sms.repository.AcademicYearRepository;
import com.schoolgroup.sms.repository.BranchRepository;
import com.schoolgroup.sms.repository.FeeStructureRepository;
import com.schoolgroup.sms.repository.HomeworkRepository;
import com.schoolgroup.sms.repository.NoticeRepository;
import com.schoolgroup.sms.repository.SchoolClassRepository;
import com.schoolgroup.sms.repository.SectionRepository;
import com.schoolgroup.sms.repository.StaffRepository;
import com.schoolgroup.sms.repository.StudentRepository;
import com.schoolgroup.sms.repository.SubjectRepository;
import com.schoolgroup.sms.repository.TeacherAssignmentRepository;
import com.schoolgroup.sms.repository.TimetableSlotRepository;
import com.schoolgroup.sms.repository.UserAccountRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class DemoVolumeSeedService {

    private static final Logger log = LoggerFactory.getLogger(DemoVolumeSeedService.class);

    @PersistenceContext
    private EntityManager em;

    private final BranchRepository branches;
    private final AcademicYearRepository years;
    private final SchoolClassRepository classes;
    private final SectionRepository sections;
    private final SubjectRepository subjects;
    private final StaffRepository staff;
    private final UserAccountRepository users;
    private final StudentRepository students;
    private final TeacherAssignmentRepository assignments;
    private final FeeStructureRepository feeStructures;
    private final HomeworkRepository homework;
    private final TimetableSlotRepository timetable;
    private final NoticeRepository notices;

    public DemoVolumeSeedService(BranchRepository branches, AcademicYearRepository years, SchoolClassRepository classes,
                                 SectionRepository sections, SubjectRepository subjects, StaffRepository staff,
                                 UserAccountRepository users, StudentRepository students,
                                 TeacherAssignmentRepository assignments, FeeStructureRepository feeStructures,
                                 HomeworkRepository homework, TimetableSlotRepository timetable, NoticeRepository notices) {
        this.branches = branches;
        this.years = years;
        this.classes = classes;
        this.sections = sections;
        this.subjects = subjects;
        this.staff = staff;
        this.users = users;
        this.students = students;
        this.assignments = assignments;
        this.feeStructures = feeStructures;
        this.homework = homework;
        this.timetable = timetable;
        this.notices = notices;
    }

    @Transactional(timeout = 360)
    public int seedBranch(UUID branchId, String passwordHash) {
        Branch branch = branches.findById(branchId).orElseThrow();
        relabel(branch);
        AcademicYear year = years.findFirstByStatus("ACTIVE").orElseGet(() -> years.findAll().get(0));
        UserAccount marker = users.findByEmailIgnoreCase("super.admin@sms.local").orElseThrow();

        List<Subject> subjectList = ensureSubjects(branch);
        List<SchoolClass> classList = ensureClasses(branch);
        List<Staff> teachers = ensureTeachers(branch, passwordHash);
        ensureAssignments(year, classList, teachers, subjectList);
        ensureFeeStructures(branch, year, classList);

        int created = fillStudents(branch, year, classList, teachers, marker);
        ensureHomework(branch, year, classList, teachers, subjectList);
        ensureTimetable(branch, year, classList, teachers, subjectList);
        ensureNotices(branch, marker);
        em.flush();
        return created;
    }

    private void relabel(Branch branch) {
        for (String[] row : DemoCampuses.BRANCHES) {
            if (row[0].equals(branch.getCode())) {
                branch.setName(row[1]);
                branch.setAddress(row[2]);
                branch.setCity(row[3]);
                branch.setState(row[4]);
                branch.setPincode(row[5]);
                branch.setPhone(row[6]);
                branch.setEmail(row[7]);
                branch.setPrincipalName(row[8]);
                branch.setStatus("ACTIVE");
                return;
            }
        }
    }

    private List<Subject> ensureSubjects(Branch branch) {
        List<Subject> list = new ArrayList<>();
        for (String[] def : DemoCampuses.SUBJECTS) {
            Subject s = subjects.findByBranchIdAndCode(branch.getId(), def[1]).orElse(null);
            if (s == null) {
                s = new Subject();
                s.setBranch(branch);
                s.setName(def[0]);
                s.setCode(def[1]);
                s.setStatus("ACTIVE");
                subjects.save(s);
            }
            list.add(s);
        }
        return list;
    }

    private List<SchoolClass> ensureClasses(Branch branch) {
        List<SchoolClass> list = new ArrayList<>();
        for (int i = 0; i < DemoCampuses.CLASS_NAMES.length; i++) {
            String name = DemoCampuses.CLASS_NAMES[i];
            int grade = DemoCampuses.GRADE_LEVELS[i];
            SchoolClass c = classes.findFirstByBranchIdAndGradeLevel(branch.getId(), grade).orElse(null);
            if (c == null && classes.existsByBranchIdAndName(branch.getId(), name)) {
                c = classes.findByBranchIdOrderByGradeLevelAsc(branch.getId()).stream()
                        .filter(x -> name.equals(x.getName())).findFirst().orElse(null);
            }
            if (c == null) {
                c = new SchoolClass();
                c.setBranch(branch);
                c.setName(name);
                c.setGradeLevel(grade);
                c.setStatus("ACTIVE");
                classes.save(c);
            } else if (!name.equals(c.getName()) && !classes.existsByBranchIdAndName(branch.getId(), name)) {
                c.setName(name);
            }
            for (String sectionName : DemoCampuses.SECTION_SETS[i]) {
                if (!sections.existsBySchoolClassIdAndName(c.getId(), sectionName)) {
                    Section section = new Section();
                    section.setSchoolClass(c);
                    section.setName(sectionName);
                    section.setCapacity(40);
                    section.setStatus("ACTIVE");
                    sections.save(section);
                }
            }
            list.add(c);
        }
        return list;
    }

    private List<Staff> ensureTeachers(Branch branch, String passwordHash) {
        List<Staff> existing = staff.findByBranchIdAndStaffType(branch.getId(), "TEACHER");
        List<Staff> teachers = new ArrayList<>(existing);
        int seq = existing.size() + 1;
        while (teachers.size() < 12) {
            String email = "teacher." + branch.getCode().toLowerCase() + "." + seq + "@sms.local";
            if (users.existsByEmailIgnoreCase(email)) {
                seq++;
                continue;
            }
            String first = DemoCampuses.TEACHER_FIRST[(seq - 1) % DemoCampuses.TEACHER_FIRST.length];
            String last = DemoCampuses.LAST[(seq + 3) % DemoCampuses.LAST.length];
            String subject = DemoCampuses.SUBJECTS[(seq - 1) % DemoCampuses.SUBJECTS.length][0];
            UserAccount account = new UserAccount();
            account.setEmail(email);
            account.setUsername("t." + branch.getCode().toLowerCase() + "." + seq);
            account.setPasswordHash(passwordHash);
            account.setFullName(first + " " + last);
            account.setMobile("98100" + String.format("%05d", Math.abs(branch.getCode().hashCode() + seq) % 90000));
            account.setRole(Role.TEACHER);
            account.setBranch(branch);
            account.setStatus("ACTIVE");
            users.save(account);
            Staff row = new Staff();
            row.setUser(account);
            row.setBranch(branch);
            row.setEmployeeCode("TCH-" + branch.getCode() + "-" + String.format("%02d", seq));
            row.setDesignation(subject + " Teacher");
            row.setStaffType("TEACHER");
            row.setQualification("M.A. / B.Ed");
            row.setJoiningDate(LocalDate.of(2018, 6, 1).plusMonths(seq));
            row.setStatus("ACTIVE");
            staff.save(row);
            teachers.add(row);
            seq++;
        }
        return teachers;
    }

    private void ensureAssignments(AcademicYear year, List<SchoolClass> classList, List<Staff> teachers, List<Subject> subjectList) {
        for (int i = 0; i < classList.size(); i++) {
            SchoolClass c = classList.get(i);
            List<Section> secs = sections.findBySchoolClassId(c.getId());
            if (secs.isEmpty() || teachers.isEmpty()) {
                continue;
            }
            Staff teacher = teachers.get(i % teachers.size());
            Subject subject = subjectList.get(i % subjectList.size());
            Section section = secs.get(0);
            if (!assignments.existsByStaffIdAndSectionIdAndSubjectIdAndAcademicYearId(
                    teacher.getId(), section.getId(), subject.getId(), year.getId())) {
                TeacherAssignment a = new TeacherAssignment();
                a.setStaff(teacher);
                a.setSchoolClass(c);
                a.setSection(section);
                a.setSubject(subject);
                a.setAcademicYear(year);
                assignments.save(a);
            }
        }
    }

    private void ensureFeeStructures(Branch branch, AcademicYear year, List<SchoolClass> classList) {
        for (SchoolClass c : classList) {
            boolean exists = feeStructures.existsByBranchIdAndName(branch.getId(), "Demo annual · " + c.getName());
            if (exists) {
                continue;
            }
            FeeStructure fs = new FeeStructure();
            fs.setBranch(branch);
            fs.setAcademicYear(year);
            fs.setSchoolClass(c);
            fs.setName("Demo annual · " + c.getName());
            fs.setStatus("ACTIVE");
            feeStructures.save(fs);
        }
    }

    private int fillStudents(Branch branch, AcademicYear year, List<SchoolClass> classList, List<Staff> teachers,
                             UserAccount marker) {
        long have = students.countByBranchId(branch.getId());
        int remaining = (int) Math.max(0, DemoCampuses.STUDENTS_PER_BRANCH - have);
        if (remaining == 0) {
            return 0;
        }
        int created = 0;
        int serial = (int) have + 1;
        int pending = remaining;
        for (int ci = 0; ci < classList.size() && pending > 0; ci++) {
            SchoolClass schoolClass = classList.get(ci);
            List<Section> secs = sections.findBySchoolClassId(schoolClass.getId());
            if (secs.isEmpty()) {
                continue;
            }
            int quota = Math.min(pending, DemoCampuses.CLASS_QUOTAS[ci]);
            int[] perSection = split(quota, secs.size());
            int grade = schoolClass.getGradeLevel();
            for (int si = 0; si < secs.size() && pending > 0; si++) {
                Section section = secs.get(si);
                int n = Math.min(pending, perSection[si]);
                for (int k = 0; k < n; k++) {
                    boolean male = serial % 2 == 0;
                    String first = male
                            ? DemoCampuses.BOYS[serial % DemoCampuses.BOYS.length]
                            : DemoCampuses.GIRLS[serial % DemoCampuses.GIRLS.length];
                    String last = DemoCampuses.LAST[serial % DemoCampuses.LAST.length];
                    String fullName = first + " " + last;
                    int age = grade <= 0 ? 3 - grade : grade + 5;
                    Student student = new Student();
                    student.setBranch(branch);
                    student.setAcademicYear(year);
                    student.setSchoolClass(schoolClass);
                    student.setSection(section);
                    student.setAdmissionNumber(branch.getCode() + "-D-" + String.format("%04d", serial));
                    student.setStudentCode("STU-" + branch.getCode() + "-" + String.format("%04d", serial));
                    student.setFullName(fullName);
                    student.setDateOfBirth(LocalDate.of(2025 - age, (serial % 12) + 1, (serial % 27) + 1));
                    student.setGender(male ? "MALE" : "FEMALE");
                    student.setMobile("98" + String.format("%08d", 10000000 + (Math.abs(branch.getCode().hashCode()) + serial) % 80000000));
                    student.setEmail("student." + branch.getCode().toLowerCase() + "." + serial + "@dps.demo");
                    student.setAddress(branch.getAddress());
                    student.setCity(branch.getCity());
                    student.setState(branch.getState());
                    student.setPincode(branch.getPincode());
                    student.setFatherName((male ? "Rajesh " : "Sanjay ") + last);
                    student.setMotherName((male ? "Priya " : "Anita ") + last);
                    student.setBloodGroup(DemoCampuses.BLOOD[serial % DemoCampuses.BLOOD.length]);
                    student.setEmergencyContact("99" + String.format("%08d", 20000000 + serial % 70000000));
                    student.setRollNumber(String.valueOf(k + 1));
                    student.setAdmissionDate(LocalDate.of(2025, 4, 1).plusDays(serial % 20));
                    student.setStatus("ACTIVE");
                    em.persist(student);

                    Guardian guardian = new Guardian();
                    guardian.setFullName(student.getFatherName());
                    guardian.setMobile(student.getEmergencyContact());
                    guardian.setEmail("parent." + branch.getCode().toLowerCase() + "." + serial + "@dps.demo");
                    guardian.setAddress(student.getAddress());
                    guardian.setOccupation("Professional");
                    guardian.setStatus("ACTIVE");
                    em.persist(guardian);

                    GuardianStudent link = new GuardianStudent();
                    link.setGuardian(guardian);
                    link.setStudent(student);
                    link.setRelationship("FATHER");
                    link.setPrimaryGuardian(true);
                    em.persist(link);

                    Enrollment enrollment = new Enrollment();
                    enrollment.setStudent(student);
                    enrollment.setAcademicYear(year);
                    enrollment.setSchoolClass(schoolClass);
                    enrollment.setSection(section);
                    enrollment.setStatus("ENROLLED");
                    em.persist(enrollment);

                    Invoice invoice = new Invoice();
                    invoice.setStudent(student);
                    invoice.setBranch(branch);
                    invoice.setAcademicYear(year);
                    invoice.setInvoiceNumber("INV-" + branch.getCode() + "-" + String.format("%05d", serial));
                    invoice.setIssueDate(LocalDate.of(2025, 4, 5));
                    invoice.setDueDate(LocalDate.of(2025, 4, 30));
                    invoice.setBaseAmount(new BigDecimal("85000"));
                    invoice.setDiscountAmount(new BigDecimal("2000"));
                    invoice.setLateFeeAmount(BigDecimal.ZERO);
                    invoice.setOtherAmount(new BigDecimal("3500"));
                    BigDecimal total = new BigDecimal("86500");
                    invoice.setTotalAmount(total);
                    int bucket = serial % 10;
                    if (bucket < 7) {
                        invoice.setPaidAmount(total);
                        invoice.setStatus("PAID");
                    } else if (bucket < 9) {
                        invoice.setPaidAmount(new BigDecimal("40000"));
                        invoice.setStatus("PARTIAL");
                    } else {
                        invoice.setPaidAmount(BigDecimal.ZERO);
                        invoice.setStatus("PENDING");
                    }
                    em.persist(invoice);

                    LocalDate[] days = {LocalDate.of(2025, 9, 1), LocalDate.of(2025, 9, 2), LocalDate.of(2025, 9, 3)};
                    for (int d = 0; d < days.length; d++) {
                        StudentAttendance att = new StudentAttendance();
                        att.setStudent(student);
                        att.setBranch(branch);
                        att.setAcademicYear(year);
                        att.setSchoolClass(schoolClass);
                        att.setSection(section);
                        att.setAttendanceDate(days[d]);
                        att.setSession("FULL_DAY");
                        att.setStatus(d == 2 && serial % 17 == 0 ? "ABSENT" : serial % 23 == 0 ? "LATE" : "PRESENT");
                        att.setMarkedBy(marker);
                        em.persist(att);
                    }

                    serial++;
                    created++;
                    pending--;
                    if (created % 40 == 0) {
                        em.flush();
                    }
                }
            }
        }
        em.flush();
        log.info("Demo volume: created {} students for {}", created, branch.getName());
        return created;
    }

    private void ensureHomework(Branch branch, AcademicYear year, List<SchoolClass> classList, List<Staff> teachers,
                                List<Subject> subjectList) {
        if (teachers.isEmpty() || subjectList.isEmpty() || homework.countByBranchId(branch.getId()) > 0) {
            return;
        }
        for (int i = 0; i < classList.size(); i++) {
            SchoolClass c = classList.get(i);
            List<Section> secs = sections.findBySchoolClassId(c.getId());
            if (secs.isEmpty()) {
                continue;
            }
            Homework h = new Homework();
            h.setBranch(branch);
            h.setAcademicYear(year);
            h.setSchoolClass(c);
            h.setSection(secs.get(0));
            h.setSubject(subjectList.get(i % subjectList.size()));
            h.setStaff(teachers.get(i % teachers.size()));
            h.setTitle(subjectList.get(i % subjectList.size()).getName() + " practice · " + c.getName());
            h.setDescription("Complete the assigned worksheet and submit before the due date. Demo homework record.");
            h.setDueDate(LocalDate.of(2025, 9, 20));
            homework.save(h);
        }
    }

    private void ensureTimetable(Branch branch, AcademicYear year, List<SchoolClass> classList, List<Staff> teachers,
                                 List<Subject> subjectList) {
        if (teachers.isEmpty() || subjectList.isEmpty()) {
            return;
        }
        LocalTime[] starts = {LocalTime.of(8, 0), LocalTime.of(8, 45)};
        LocalTime[] ends = {LocalTime.of(8, 45), LocalTime.of(9, 30)};
        int teacherCursor = 0;
        for (SchoolClass c : classList) {
            List<Section> secs = sections.findBySchoolClassId(c.getId());
            if (secs.isEmpty()) {
                continue;
            }
            Section section = secs.get(0);
            for (int day = 1; day <= 5; day++) {
                for (int p = 0; p < starts.length; p++) {
                    Staff teacher = teachers.get(teacherCursor % teachers.size());
                    teacherCursor++;
                    if (timetable.existsBySectionIdAndAcademicYearIdAndDayOfWeekAndStartTime(
                            section.getId(), year.getId(), day, starts[p])) {
                        continue;
                    }
                    if (timetable.existsByStaffIdAndAcademicYearIdAndDayOfWeekAndStartTime(
                            teacher.getId(), year.getId(), day, starts[p])) {
                        continue;
                    }
                    TimetableSlot slot = new TimetableSlot();
                    slot.setBranch(branch);
                    slot.setAcademicYear(year);
                    slot.setSchoolClass(c);
                    slot.setSection(section);
                    slot.setSubject(subjectList.get((day + p) % subjectList.size()));
                    slot.setStaff(teacher);
                    slot.setDayOfWeek(day);
                    slot.setStartTime(starts[p]);
                    slot.setEndTime(ends[p]);
                    slot.setRoom("R-" + (10 + day));
                    timetable.save(slot);
                }
            }
        }
    }

    private void ensureNotices(Branch branch, UserAccount createdBy) {
        String title = "Welcome to " + branch.getName() + " (demo)";
        boolean exists = notices.findAll().stream().anyMatch(n -> title.equals(n.getTitle()));
        if (exists) {
            return;
        }
        Notice n = new Notice();
        n.setBranch(branch);
        n.setTitle(title);
        n.setBody("This is a DEMO announcement for the fictional campus directory. Academic year 2025-26 is in session.");
        n.setAudienceType("BRANCH");
        n.setPublished(true);
        n.setCreatedBy(createdBy);
        notices.save(n);
    }

    private static int[] split(int total, int parts) {
        int[] out = new int[parts];
        int base = total / parts;
        int rem = total % parts;
        for (int i = 0; i < parts; i++) {
            out[i] = base + (i < rem ? 1 : 0);
        }
        return out;
    }
}
