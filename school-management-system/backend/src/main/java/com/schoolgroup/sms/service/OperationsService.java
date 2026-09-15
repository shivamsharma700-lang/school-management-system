package com.schoolgroup.sms.service;

import com.schoolgroup.sms.dto.SchoolDtos;
import com.schoolgroup.sms.entity.AcademicYear;
import com.schoolgroup.sms.entity.Complaint;
import com.schoolgroup.sms.entity.ComplaintComment;
import com.schoolgroup.sms.entity.Exam;
import com.schoolgroup.sms.entity.ExamSubject;
import com.schoolgroup.sms.entity.Homework;
import com.schoolgroup.sms.entity.HomeworkSubmission;
import com.schoolgroup.sms.entity.LeaveRequest;
import com.schoolgroup.sms.entity.Mark;
import com.schoolgroup.sms.entity.Notice;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.security.PermissionMatrix.Action;
import com.schoolgroup.sms.security.PermissionMatrix.Resource;
import com.schoolgroup.sms.entity.Section;
import com.schoolgroup.sms.entity.Staff;
import com.schoolgroup.sms.entity.StaffAttendance;
import com.schoolgroup.sms.entity.Student;
import com.schoolgroup.sms.entity.StudentAttendance;
import com.schoolgroup.sms.entity.TimetableSlot;
import com.schoolgroup.sms.entity.UserAccount;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.AcademicYearRepository;
import com.schoolgroup.sms.repository.ComplaintCommentRepository;
import com.schoolgroup.sms.repository.ComplaintRepository;
import com.schoolgroup.sms.repository.ExamRepository;
import com.schoolgroup.sms.repository.ExamSubjectRepository;
import com.schoolgroup.sms.repository.HomeworkRepository;
import com.schoolgroup.sms.repository.HomeworkSubmissionRepository;
import com.schoolgroup.sms.repository.LeaveRequestRepository;
import com.schoolgroup.sms.repository.MarkRepository;
import com.schoolgroup.sms.repository.NoticeRepository;
import com.schoolgroup.sms.repository.SectionRepository;
import com.schoolgroup.sms.repository.StaffAttendanceRepository;
import com.schoolgroup.sms.repository.StaffRepository;
import com.schoolgroup.sms.repository.StudentAttendanceRepository;
import com.schoolgroup.sms.repository.StudentRepository;
import com.schoolgroup.sms.repository.SubjectRepository;
import com.schoolgroup.sms.repository.TimetableSlotRepository;
import com.schoolgroup.sms.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OperationsService {

    private final AccessService access;
    private final AuditService audit;
    private final NotificationService notifications;
    private final StudentAttendanceRepository attendance;
    private final StudentRepository students;
    private final SectionRepository sections;
    private final AcademicYearRepository years;
    private final UserAccountRepository users;
    private final TimetableSlotRepository timetable;
    private final StaffRepository staff;
    private final StaffAttendanceRepository staffAttendance;
    private final SubjectRepository subjects;
    private final HomeworkRepository homework;
    private final HomeworkSubmissionRepository submissions;
    private final ExamRepository exams;
    private final ExamSubjectRepository examSubjects;
    private final MarkRepository marks;
    private final LeaveRequestRepository leaves;
    private final NoticeRepository notices;
    private final ComplaintRepository complaints;
    private final ComplaintCommentRepository comments;

    public OperationsService(AccessService access, AuditService audit, NotificationService notifications,
                             StudentAttendanceRepository attendance, StudentRepository students,
                             SectionRepository sections, AcademicYearRepository years, UserAccountRepository users,
                             TimetableSlotRepository timetable, StaffRepository staff, StaffAttendanceRepository staffAttendance,
                             SubjectRepository subjects,
                             HomeworkRepository homework, HomeworkSubmissionRepository submissions,
                             ExamRepository exams, ExamSubjectRepository examSubjects, MarkRepository marks,
                             LeaveRequestRepository leaves, NoticeRepository notices, ComplaintRepository complaints,
                             ComplaintCommentRepository comments) {
        this.access = access;
        this.audit = audit;
        this.notifications = notifications;
        this.attendance = attendance;
        this.students = students;
        this.sections = sections;
        this.years = years;
        this.users = users;
        this.timetable = timetable;
        this.staff = staff;
        this.staffAttendance = staffAttendance;
        this.subjects = subjects;
        this.homework = homework;
        this.submissions = submissions;
        this.exams = exams;
        this.examSubjects = examSubjects;
        this.marks = marks;
        this.leaves = leaves;
        this.notices = notices;
        this.complaints = complaints;
        this.comments = comments;
    }

    @Transactional
    public void submitAttendance(SchoolDtos.AttendanceSubmitRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER);
        Section section = sections.findById(request.sectionId()).orElseThrow(() -> ApiException.notFound("Section not found"));
        access.assertBranch(section.getSchoolClass().getBranch().getId());
        AcademicYear year = years.findById(request.academicYearId()).orElseThrow(() -> ApiException.notFound("Year not found"));
        access.assertTeacherSection(section.getId(), year.getId());
        String session = request.session() == null ? "FULL_DAY" : request.session();
        UserAccount marker = users.findById(access.current().getId()).orElseThrow();
        for (SchoolDtos.AttendanceItem item : request.entries()) {
            Student student = access.requireStudentAccess(item.studentId());
            if (attendance.existsByStudentIdAndAttendanceDateAndSession(student.getId(), request.date(), session)) {
                throw ApiException.conflict("Attendance already marked for " + student.getFullName());
            }
            StudentAttendance row = new StudentAttendance();
            row.setStudent(student);
            row.setBranch(student.getBranch());
            row.setAcademicYear(year);
            row.setSchoolClass(section.getSchoolClass());
            row.setSection(section);
            row.setAttendanceDate(request.date());
            row.setSession(session);
            row.setStatus(item.status());
            row.setRemarks(item.remarks());
            row.setMarkedBy(marker);
            attendance.save(row);
            if (student.getUser() != null && !"PRESENT".equals(item.status())) {
                notifications.notifyUser(student.getUser(), student.getBranch(), "ATTENDANCE",
                        "Attendance update", student.getFullName() + " marked " + item.status(),
                        "ATTENDANCE", row.getId());
            }
        }
        audit.record("CREATE", "ATTENDANCE", section.getId().toString(), request.date().toString());
    }

    public Map<String, Object> attendanceSummary(UUID studentId, LocalDate from, LocalDate to) {
        Student student = access.requireStudentAccess(studentId);
        List<StudentAttendance> rows = from == null && to == null
                ? attendance.findByStudentIdOrderByAttendanceDateDesc(student.getId())
                : attendance.findByStudentIdAndAttendanceDateBetween(
                student.getId(), from == null ? LocalDate.now().minusYears(2) : from,
                to == null ? LocalDate.now() : to);
        long total = rows.size();
        long present = rows.stream().filter(r -> "PRESENT".equals(r.getStatus()) || "LATE".equals(r.getStatus())).count();
        long late = rows.stream().filter(r -> "LATE".equals(r.getStatus())).count();
        long absent = rows.stream().filter(r -> "ABSENT".equals(r.getStatus())).count();
        BigDecimal pct = total == 0 ? BigDecimal.ZERO :
                BigDecimal.valueOf(present * 100.0 / total).setScale(2, RoundingMode.HALF_UP);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("studentId", student.getId());
        out.put("total", total);
        out.put("present", present);
        out.put("late", late);
        out.put("absent", absent);
        out.put("percentage", pct);
        out.put("records", rows.size());
        out.put("history", rows.stream().limit(60).map(r -> {
            Map<String, Object> h = new LinkedHashMap<>();
            h.put("id", r.getId());
            h.put("date", r.getAttendanceDate().toString());
            h.put("session", r.getSession());
            h.put("status", r.getStatus());
            h.put("remarks", r.getRemarks() == null ? "" : r.getRemarks());
            return h;
        }).toList());
        LocalDate now = LocalDate.now();
        List<StudentAttendance> monthRows = attendance.findByStudentIdAndAttendanceDateBetween(
                student.getId(), now.withDayOfMonth(1), now);
        long monthTotal = monthRows.size();
        long monthPresent = monthRows.stream().filter(r -> "PRESENT".equals(r.getStatus()) || "LATE".equals(r.getStatus())).count();
        out.put("monthlyPercentage", monthTotal == 0 ? BigDecimal.ZERO :
                BigDecimal.valueOf(monthPresent * 100.0 / monthTotal).setScale(2, RoundingMode.HALF_UP));
        List<StudentAttendance> yearRows = attendance.findByStudentIdAndAttendanceDateBetween(
                student.getId(), now.withDayOfYear(1), now);
        long yearTotal = yearRows.size();
        long yearPresent = yearRows.stream().filter(r -> "PRESENT".equals(r.getStatus()) || "LATE".equals(r.getStatus())).count();
        out.put("yearlyPercentage", yearTotal == 0 ? BigDecimal.ZERO :
                BigDecimal.valueOf(yearPresent * 100.0 / yearTotal).setScale(2, RoundingMode.HALF_UP));
        String todayStatus = rows.stream()
                .filter(r -> now.equals(r.getAttendanceDate()))
                .map(StudentAttendance::getStatus)
                .findFirst()
                .orElse("");
        out.put("today", todayStatus);
        return out;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> attendanceReport(UUID sectionId, LocalDate date, String session) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.ACCOUNTANT);
        Section section = sections.findById(sectionId).orElseThrow(() -> ApiException.notFound("Section not found"));
        access.assertBranch(section.getSchoolClass().getBranch().getId());
        LocalDate d = date == null ? LocalDate.now() : date;
        String sess = session == null ? "FULL_DAY" : session;
        List<StudentAttendance> rows = attendance.findBySectionIdAndAttendanceDateAndSession(sectionId, d, sess);
        long present = rows.stream().filter(r -> "PRESENT".equals(r.getStatus()) || "LATE".equals(r.getStatus())).count();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("sectionId", sectionId);
        out.put("className", section.getSchoolClass().getName());
        out.put("sectionName", section.getName());
        out.put("date", d.toString());
        out.put("session", sess);
        out.put("marked", rows.size());
        out.put("present", present);
        out.put("absent", rows.stream().filter(r -> "ABSENT".equals(r.getStatus())).count());
        out.put("late", rows.stream().filter(r -> "LATE".equals(r.getStatus())).count());
        out.put("percentage", rows.isEmpty() ? BigDecimal.ZERO :
                BigDecimal.valueOf(present * 100.0 / rows.size()).setScale(2, RoundingMode.HALF_UP));
        out.put("entries", rows.stream().map(r -> {
            Map<String, Object> e = new LinkedHashMap<>();
            e.put("studentId", r.getStudent().getId());
            e.put("studentName", r.getStudent().getFullName());
            e.put("status", r.getStatus());
            e.put("remarks", r.getRemarks() == null ? "" : r.getRemarks());
            return e;
        }).toList());
        return out;
    }

    @Transactional
    public void submitStaffAttendance(List<Map<String, Object>> entries, LocalDate date) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        LocalDate d = date == null ? LocalDate.now() : date;
        UserAccount marker = users.findById(access.current().getId()).orElseThrow();
        for (Map<String, Object> entry : entries) {
            UUID staffId = UUID.fromString(String.valueOf(entry.get("staffId")));
            String status = String.valueOf(entry.getOrDefault("status", "PRESENT"));
            Staff member = staff.findById(staffId).orElseThrow(() -> ApiException.notFound("Staff not found"));
            access.assertBranch(member.getBranch().getId());
            if (staffAttendance.existsByStaffIdAndAttendanceDate(staffId, d)) {
                throw ApiException.conflict("Attendance already marked for " + member.getUser().getFullName());
            }
            StaffAttendance row = new StaffAttendance();
            row.setStaff(member);
            row.setBranch(member.getBranch());
            row.setAttendanceDate(d);
            row.setStatus(status);
            row.setRemarks(entry.get("remarks") == null ? null : String.valueOf(entry.get("remarks")));
            row.setMarkedBy(marker);
            staffAttendance.save(row);
        }
        audit.record("CREATE", "STAFF_ATTENDANCE", d.toString(), String.valueOf(entries.size()));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listStaffAttendance(LocalDate date) {
        Role role = access.current().getRole();
        if (role == Role.TEACHER) {
            Staff me = access.requireStaff();
            return staffAttendance.findByStaffIdOrderByAttendanceDateDesc(me.getId()).stream()
                    .limit(60)
                    .map(this::toStaffAttendanceRow)
                    .toList();
        }
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.ACCOUNTANT);
        LocalDate d = date == null ? LocalDate.now() : date;
        UUID branchId = role == Role.SUPER_ADMIN ? null : access.requireBranch();
        return staffAttendance.findByAttendanceDateOrderByCreatedAtDesc(d).stream()
                .filter(r -> branchId == null || r.getBranch().getId().equals(branchId))
                .map(this::toStaffAttendanceRow)
                .toList();
    }

    private Map<String, Object> toStaffAttendanceRow(StaffAttendance r) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", r.getId());
        row.put("staffId", r.getStaff().getId());
        row.put("name", r.getStaff().getUser().getFullName());
        row.put("employeeCode", r.getStaff().getEmployeeCode());
        row.put("date", r.getAttendanceDate().toString());
        row.put("status", r.getStatus());
        row.put("remarks", r.getRemarks() == null ? "" : r.getRemarks());
        return row;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> staffAttendanceSummary(LocalDate from, LocalDate to, UUID staffId) {
        Role role = access.current().getRole();
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.ACCOUNTANT, Role.TEACHER);
        LocalDate start = from == null ? LocalDate.now().withDayOfMonth(1) : from;
        LocalDate end = to == null ? LocalDate.now() : to;
        if (end.isBefore(start)) {
            throw ApiException.badRequest("to date must be on or after from date");
        }
        UUID branchId = role == Role.SUPER_ADMIN ? null : access.requireBranch();
        UUID onlyStaff = null;
        if (role == Role.TEACHER) {
            onlyStaff = access.requireStaff().getId();
        } else if (staffId != null) {
            onlyStaff = staffId;
        }
        UUID finalOnly = onlyStaff;
        List<StaffAttendance> rows = staffAttendance.findAll().stream()
                .filter(r -> !r.getAttendanceDate().isBefore(start) && !r.getAttendanceDate().isAfter(end))
                .filter(r -> branchId == null || r.getBranch().getId().equals(branchId))
                .filter(r -> finalOnly == null || r.getStaff().getId().equals(finalOnly))
                .toList();
        Map<UUID, List<StaffAttendance>> byStaff = rows.stream()
                .collect(java.util.stream.Collectors.groupingBy(r -> r.getStaff().getId()));
        List<Map<String, Object>> staffRows = new java.util.ArrayList<>();
        byStaff.forEach((id, list) -> {
            long present = list.stream().filter(r -> "PRESENT".equals(r.getStatus()) || "LATE".equals(r.getStatus())).count();
            long absent = list.stream().filter(r -> "ABSENT".equals(r.getStatus())).count();
            long late = list.stream().filter(r -> "LATE".equals(r.getStatus())).count();
            long leave = list.stream().filter(r -> "LEAVE".equals(r.getStatus())).count();
            long total = list.size();
            java.math.BigDecimal pct = total == 0 ? java.math.BigDecimal.ZERO
                    : java.math.BigDecimal.valueOf(present * 100.0 / total).setScale(1, java.math.RoundingMode.HALF_UP);
            Staff member = list.get(0).getStaff();
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("staffId", id);
            row.put("name", member.getUser().getFullName());
            row.put("employeeCode", member.getEmployeeCode());
            row.put("present", present);
            row.put("absent", absent);
            row.put("late", late);
            row.put("leave", leave);
            row.put("total", total);
            row.put("percentage", pct);
            staffRows.add(row);
        });
        staffRows.sort(java.util.Comparator.comparing(r -> String.valueOf(r.get("name"))));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("from", start.toString());
        out.put("to", end.toString());
        out.put("staff", staffRows);
        out.put("markedDays", rows.stream().map(StaffAttendance::getAttendanceDate).distinct().count());
        return out;
    }

    @Transactional
    public Exam publishExam(UUID examId) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        Exam exam = exams.findById(examId).orElseThrow(() -> ApiException.notFound("Exam not found"));
        access.assertBranch(exam.getBranch().getId());
        exam.setStatus("PUBLISHED");
        audit.record("UPDATE", "EXAM", examId.toString(), "PUBLISHED");
        return exam;
    }

    public List<TimetableSlot> timetableForSection(UUID sectionId, UUID academicYearId) {
        Section section = sections.findById(sectionId).orElseThrow(() -> ApiException.notFound("Section not found"));
        access.assertBranch(section.getSchoolClass().getBranch().getId());
        return timetable.findBySectionIdAndAcademicYearId(section.getId(), academicYearId);
    }

    public List<Map<String, Object>> listMarks(UUID studentId) {
        Student student = access.requireStudentAccess(studentId);
        return marks.findByStudentId(student.getId()).stream().map(m -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", m.getId());
            row.put("exam", m.getExamSubject().getExam().getName());
            row.put("subject", m.getExamSubject().getSubject().getName());
            row.put("marksObtained", m.getMarksObtained());
            row.put("maxMarks", m.getExamSubject().getMaxMarks());
            row.put("grade", m.getGrade());
            return row;
        }).toList();
    }

    @Transactional
    public TimetableSlot createSlot(SchoolDtos.TimetableRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        Section section = sections.findById(request.sectionId()).orElseThrow(() -> ApiException.notFound("Section not found"));
        access.assertBranch(section.getSchoolClass().getBranch().getId());
        AcademicYear year = years.findById(request.academicYearId()).orElseThrow(() -> ApiException.notFound("Year not found"));
        Staff teacher = staff.findById(request.staffId()).orElseThrow(() -> ApiException.notFound("Teacher not found"));
        LocalTime start = LocalTime.parse(request.startTime());
        LocalTime end = LocalTime.parse(request.endTime());
        if (!end.isAfter(start)) {
            throw ApiException.badRequest("End time must be after start time");
        }
        if (timetable.existsBySectionIdAndAcademicYearIdAndDayOfWeekAndStartTime(section.getId(), year.getId(), request.dayOfWeek(), start)) {
            throw ApiException.conflict("Class/section already has a period at this time");
        }
        if (timetable.existsByStaffIdAndAcademicYearIdAndDayOfWeekAndStartTime(teacher.getId(), year.getId(), request.dayOfWeek(), start)) {
            throw ApiException.conflict("Teacher already assigned at this time");
        }
        TimetableSlot slot = new TimetableSlot();
        slot.setBranch(section.getSchoolClass().getBranch());
        slot.setAcademicYear(year);
        slot.setSchoolClass(section.getSchoolClass());
        slot.setSection(section);
        slot.setSubject(subjects.findById(request.subjectId()).orElseThrow(() -> ApiException.notFound("Subject not found")));
        slot.setStaff(teacher);
        slot.setDayOfWeek(request.dayOfWeek());
        slot.setStartTime(start);
        slot.setEndTime(end);
        slot.setRoom(request.room());
        timetable.save(slot);
        return slot;
    }

    public List<TimetableSlot> myTimetable(UUID academicYearId) {
        AcademicYear year = years.findById(academicYearId).orElseThrow(() -> ApiException.notFound("Year not found"));
        return switch (access.current().getRole()) {
            case TEACHER -> {
                Staff teacher = access.requireStaff();
                yield timetable.findByStaffIdAndAcademicYearId(teacher.getId(), year.getId());
            }
            case STUDENT -> {
                Student student = students.findByUserId(access.current().getId())
                        .orElseThrow(() -> ApiException.forbidden("Student profile not found"));
                if (student.getSection() == null) {
                    yield List.of();
                }
                yield timetable.findBySectionIdAndAcademicYearId(student.getSection().getId(), year.getId());
            }
            case PARENT -> {
                var guardianStudents = students.findByUserId(access.current().getId());
                yield List.of();
            }
            default -> timetable.findAll().stream()
                    .filter(s -> s.getAcademicYear().getId().equals(year.getId()))
                    .filter(s -> access.current().getRole() == Role.SUPER_ADMIN
                            || s.getBranch().getId().equals(access.current().getBranchId()))
                    .toList();
        };
    }

    public List<TimetableSlot> timetableForStudent(UUID studentId, UUID academicYearId) {
        Student student = access.requireStudentAccess(studentId);
        if (student.getSection() == null) {
            return List.of();
        }
        return timetable.findBySectionIdAndAcademicYearId(student.getSection().getId(), academicYearId);
    }

    @Transactional
    public Homework createHomework(SchoolDtos.HomeworkRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER);
        Section section = sections.findById(request.sectionId()).orElseThrow(() -> ApiException.notFound("Section not found"));
        access.assertBranch(section.getSchoolClass().getBranch().getId());
        AcademicYear year = years.findById(request.academicYearId() != null
                        ? request.academicYearId()
                        : years.findFirstByStatus("ACTIVE").map(AcademicYear::getId).orElseThrow(() -> ApiException.notFound("Academic year not found")))
                .orElseThrow(() -> ApiException.notFound("Year not found"));
        access.assertTeacherSection(section.getId(), year.getId());
        Homework hw = new Homework();
        hw.setBranch(section.getSchoolClass().getBranch());
        hw.setAcademicYear(year);
        hw.setSchoolClass(section.getSchoolClass());
        hw.setSection(section);
        hw.setSubject(subjects.findById(request.subjectId()).orElseThrow(() -> ApiException.notFound("Subject not found")));
        hw.setStaff(access.current().getRole() == Role.TEACHER ? access.requireStaff()
                : staff.findAll().stream().findFirst().orElseThrow(() -> ApiException.badRequest("No staff available")));
        hw.setTitle(request.title());
        hw.setDescription(request.description());
        hw.setDueDate(request.dueDate());
        hw.setAttachmentFileId(request.attachmentFileId());
        homework.save(hw);
        students.findBySectionIdAndStatus(section.getId(), "ACTIVE").forEach(st -> {
            if (st.getUser() != null) {
                notifications.notifyUser(st.getUser(), st.getBranch(), "HOMEWORK", hw.getTitle(),
                        "New homework due " + hw.getDueDate(), "HOMEWORK", hw.getId());
            }
        });
        return hw;
    }

    public List<Map<String, Object>> listHomework(UUID sectionId, UUID studentId) {
        access.assertCan(Resource.HOMEWORK, Action.VIEW);
        List<Homework> rows;
        if (studentId != null) {
            Student student = access.requireStudentAccess(studentId);
            if (student.getSection() == null) {
                return List.of();
            }
            rows = homework.findBySectionId(student.getSection().getId());
        } else if (sectionId != null) {
            Section section = sections.findById(sectionId).orElseThrow(() -> ApiException.notFound("Section not found"));
            access.assertBranch(section.getSchoolClass().getBranch().getId());
            rows = homework.findBySectionId(sectionId);
        } else if (access.current().getRole() == Role.STUDENT) {
            Student student = students.findByUserId(access.current().getId()).orElseThrow(() -> ApiException.forbidden("Student profile not found"));
            if (student.getSection() == null) {
                return List.of();
            }
            rows = homework.findBySectionId(student.getSection().getId());
        } else if (access.current().getRole() == Role.TEACHER) {
            Staff me = access.requireStaff();
            rows = homework.findByStaffId(me.getId());
        } else if (access.current().getRole() == Role.SUPER_ADMIN) {
            rows = homework.findAll();
        } else {
            UUID branchId = access.requireBranch();
            rows = homework.findAll().stream()
                    .filter(h -> h.getBranch().getId().equals(branchId))
                    .toList();
        }
        return rows.stream().map(this::homeworkApiRow).toList();
    }

    private Map<String, Object> homeworkApiRow(Homework h) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", h.getId());
        row.put("title", h.getTitle());
        row.put("description", h.getDescription());
        row.put("dueDate", h.getDueDate() == null ? "" : h.getDueDate().toString());
        row.put("subject", h.getSubject() == null ? "" : h.getSubject().getName());
        row.put("subjectId", h.getSubject() == null ? "" : h.getSubject().getId().toString());
        row.put("teacher", h.getStaff() == null || h.getStaff().getUser() == null ? "" : h.getStaff().getUser().getFullName());
        row.put("classId", h.getSchoolClass() == null ? "" : h.getSchoolClass().getId().toString());
        row.put("className", h.getSchoolClass() == null ? "" : h.getSchoolClass().getName());
        row.put("sectionId", h.getSection() == null ? "" : h.getSection().getId().toString());
        row.put("sectionName", h.getSection() == null ? "" : h.getSection().getName());
        row.put("status", h.getDueDate() != null && h.getDueDate().isBefore(LocalDate.now()) ? "OVERDUE" : "OPEN");
        row.put("attachmentFileId", h.getAttachmentFileId() == null ? "" : h.getAttachmentFileId().toString());
        return row;
    }

    @Transactional
    public HomeworkSubmission submitHomework(UUID homeworkId) {
        Homework hw = homework.findById(homeworkId).orElseThrow(() -> ApiException.notFound("Homework not found"));
        Student student = students.findByUserId(access.current().getId())
                .orElseThrow(() -> ApiException.forbidden("Only students can submit homework"));
        access.requireStudentAccess(student.getId());
        HomeworkSubmission sub = new HomeworkSubmission();
        sub.setHomework(hw);
        sub.setStudent(student);
        sub.setStatus(LocalDate.now().isAfter(hw.getDueDate()) ? "LATE" : "SUBMITTED");
        sub.setSubmittedAt(Instant.now());
        submissions.save(sub);
        return sub;
    }

    @Transactional
    public Exam createExam(SchoolDtos.ExamRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER);
        UUID branchId = access.resolveBranch(request.branchId());
        Exam exam = new Exam();
        exam.setBranch(sections.findAll().stream()
                .map(s -> s.getSchoolClass().getBranch())
                .filter(b -> b.getId().equals(branchId) || branchId == null)
                .findFirst().orElseThrow(() -> ApiException.notFound("Branch not found")));
        exam.setAcademicYear(years.findById(request.academicYearId()).orElseThrow(() -> ApiException.notFound("Year not found")));
        exam.setName(request.name());
        exam.setExamType(request.examType());
        exam.setStartDate(request.startDate());
        exam.setEndDate(request.endDate());
        exam.setStatus("SCHEDULED");
        exams.save(exam);
        return exam;
    }

    @Transactional
    public Mark enterMarks(SchoolDtos.MarkRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.TEACHER);
        ExamSubject subject = examSubjects.findById(request.examSubjectId())
                .orElseThrow(() -> ApiException.notFound("Exam subject not found"));
        access.assertBranch(subject.getExam().getBranch().getId());
        Student student = access.requireStudentAccess(request.studentId());
        if (student.getSection() != null) {
            UUID yearId = subject.getExam().getAcademicYear() == null ? null : subject.getExam().getAcademicYear().getId();
            access.assertTeacherSection(student.getSection().getId(), yearId);
        }
        if (request.marksObtained().compareTo(subject.getMaxMarks()) > 0 || request.marksObtained().signum() < 0) {
            throw ApiException.badRequest("Marks must be between 0 and maximum");
        }
        var existing = marks.findByExamSubjectIdAndStudentId(subject.getId(), student.getId());
        Mark mark = existing.orElseGet(Mark::new);
        boolean creating = existing.isEmpty();
        mark.setExamSubject(subject);
        mark.setStudent(student);
        mark.setMarksObtained(request.marksObtained());
        mark.setGrade(grade(request.marksObtained(), subject.getMaxMarks()));
        mark.setRemarks(request.remarks());
        mark.setEnteredBy(users.findById(access.current().getId()).orElseThrow());
        marks.save(mark);
        audit.record(creating ? "CREATE" : "UPDATE", "MARK", mark.getId().toString(),
                subject.getSubject().getName() + "=" + mark.getMarksObtained() + " (student " + student.getAdmissionNumber() + ")");
        if (student.getUser() != null && "PUBLISHED".equals(subject.getExam().getStatus())) {
            notifications.notifyUser(student.getUser(), student.getBranch(), "RESULT",
                    "Marks published", subject.getSubject().getName() + ": " + mark.getMarksObtained(),
                    "MARK", mark.getId());
        }
        return mark;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listExams() {
        access.assertCan(Resource.EXAM, Action.VIEW);
        UUID branchId = access.current().getRole() == Role.SUPER_ADMIN ? null : access.requireBranch();
        Role role = access.current().getRole();
        boolean publishedOnly = role == Role.PARENT || role == Role.STUDENT;
        return exams.findAll().stream()
                .filter(e -> branchId == null || e.getBranch().getId().equals(branchId))
                .filter(e -> !publishedOnly || "PUBLISHED".equals(e.getStatus()))
                .sorted(Comparator.comparing(Exam::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(e -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", e.getId());
                    row.put("name", e.getName());
                    row.put("examType", e.getExamType());
                    row.put("startDate", e.getStartDate().toString());
                    row.put("endDate", e.getEndDate().toString());
                    row.put("status", e.getStatus());
                    row.put("academicYearId", e.getAcademicYear().getId());
                    row.put("academicYear", e.getAcademicYear().getName());
                    row.put("branchId", e.getBranch().getId());
                    return row;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listExamSubjects(UUID examId) {
        Exam exam = exams.findById(examId).orElseThrow(() -> ApiException.notFound("Exam not found"));
        access.assertBranch(exam.getBranch().getId());
        return examSubjects.findAll().stream()
                .filter(s -> s.getExam().getId().equals(examId))
                .map(s -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", s.getId());
                    row.put("examId", examId);
                    row.put("subject", s.getSubject().getName());
                    row.put("className", s.getSchoolClass().getName());
                    row.put("maxMarks", s.getMaxMarks());
                    row.put("passingMarks", s.getPassingMarks());
                    row.put("examDate", s.getExamDate() == null ? "" : s.getExamDate().toString());
                    return row;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listLeave() {
        Role role = access.current().getRole();
        UUID userId = access.current().getId();
        UUID branchId = access.current().getBranchId();
        return leaves.findAll().stream()
                .filter(l -> switch (role) {
                    case SUPER_ADMIN -> true;
                    case BRANCH_ADMIN, PRINCIPAL -> l.getBranch() != null && l.getBranch().getId().equals(branchId);
                    default -> l.getRequester() != null && l.getRequester().getId().equals(userId);
                })
                .sorted(Comparator.comparing(LeaveRequest::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(l -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", l.getId());
                    row.put("leaveType", l.getLeaveType());
                    row.put("startDate", l.getStartDate().toString());
                    row.put("endDate", l.getEndDate().toString());
                    row.put("reason", l.getReason());
                    row.put("status", l.getStatus());
                    row.put("requester", l.getRequester() == null ? "" : l.getRequester().getFullName());
                    row.put("student", l.getStudent() == null ? "" : l.getStudent().getFullName());
                    row.put("reviewNote", l.getReviewNote() == null ? "" : l.getReviewNote());
                    row.put("createdAt", l.getCreatedAt() == null ? "" : l.getCreatedAt().toString());
                    return row;
                })
                .toList();
    }

    public Map<String, Object> reportCard(UUID studentId, UUID examId) {
        Student student = access.requireStudentAccess(studentId);
        Exam exam = exams.findById(examId).orElseThrow(() -> ApiException.notFound("Exam not found"));
        Role role = access.current().getRole();
        if ((role == Role.PARENT || role == Role.STUDENT) && !"PUBLISHED".equals(exam.getStatus())) {
            throw ApiException.forbidden("Results are not published yet");
        }
        List<Mark> studentMarks = marks.findByStudentId(student.getId()).stream()
                .filter(m -> m.getExamSubject().getExam().getId().equals(examId))
                .toList();
        BigDecimal total = studentMarks.stream().map(Mark::getMarksObtained).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal max = studentMarks.stream().map(m -> m.getExamSubject().getMaxMarks()).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal pct = max.signum() == 0 ? BigDecimal.ZERO : total.multiply(BigDecimal.valueOf(100)).divide(max, 2, RoundingMode.HALF_UP);
        return Map.of("student", student.getFullName(), "total", total, "max", max, "percentage", pct,
                "grade", grade(total, max), "subjects", studentMarks.size(), "examStatus", exam.getStatus());
    }

    @Transactional
    public LeaveRequest createLeave(SchoolDtos.LeaveCreateRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw ApiException.badRequest("Invalid leave dates");
        }
        UserAccount requester = users.findById(access.current().getId()).orElseThrow();
        if (leaves.countOverlapping(requester.getId(), request.startDate(), request.endDate()) > 0) {
            throw ApiException.conflict("Overlapping leave request exists");
        }
        LeaveRequest leave = new LeaveRequest();
        leave.setRequester(requester);
        leave.setLeaveType(request.leaveType());
        leave.setStartDate(request.startDate());
        leave.setEndDate(request.endDate());
        leave.setReason(request.reason());
        leave.setStatus("PENDING");
        if (access.current().getRole() == Role.STUDENT || access.current().getRole() == Role.PARENT) {
            UUID studentId = request.studentId();
            if (studentId == null && access.current().getRole() == Role.STUDENT) {
                studentId = students.findByUserId(requester.getId()).orElseThrow().getId();
            }
            if (studentId == null) {
                throw ApiException.badRequest("studentId is required");
            }
            Student student = access.requireStudentAccess(studentId);
            leave.setStudent(student);
            leave.setBranch(student.getBranch());
        } else {
            Staff teacher = access.requireStaff();
            leave.setStaff(teacher);
            leave.setBranch(teacher.getBranch());
        }
        leaves.save(leave);
        notifications.notifyUser(requester, leave.getBranch(), "LEAVE", "Leave submitted",
                "Your leave request is pending review", "LEAVE", leave.getId());
        return leave;
    }

    @Transactional
    public LeaveRequest reviewLeave(UUID id, boolean approved, String note) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        LeaveRequest leave = leaves.findById(id).orElseThrow(() -> ApiException.notFound("Leave not found"));
        access.assertBranch(leave.getBranch().getId());
        leave.setStatus(approved ? "APPROVED" : "REJECTED");
        leave.setReviewer(users.findById(access.current().getId()).orElseThrow());
        leave.setReviewNote(note);
        notifications.notifyUser(leave.getRequester(), leave.getBranch(), "LEAVE",
                "Leave " + leave.getStatus().toLowerCase(),
                note == null ? "Your leave was " + leave.getStatus().toLowerCase() : note,
                "LEAVE", leave.getId());
        return leave;
    }

    @Transactional
    public Notice createNotice(SchoolDtos.NoticeRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        Notice notice = new Notice();
        notice.setTitle(request.title());
        notice.setBody(request.body());
        notice.setAudienceType(request.audienceType());
        notice.setRoleTarget(request.roleTarget());
        notice.setPublished(true);
        notice.setCreatedBy(users.findById(access.current().getId()).orElseThrow());
        if (!"SCHOOL".equals(request.audienceType())) {
            UUID branchId = access.resolveBranch(request.branchId());
            if (branchId != null) {
                notice.setBranch(staff.findAll().stream().map(Staff::getBranch)
                        .filter(b -> b.getId().equals(branchId)).findFirst()
                        .orElseGet(() -> sections.findAll().stream().map(s -> s.getSchoolClass().getBranch())
                                .filter(b -> b.getId().equals(branchId)).findFirst().orElse(null)));
            }
        }
        if (request.sectionId() != null) {
            notice.setSection(sections.findById(request.sectionId()).orElseThrow());
        }
        notices.save(notice);
        return notice;
    }

    public List<Notice> visibleNotices() {
        return notices.findAll().stream().filter(this::visible).toList();
    }

    @Transactional
    public Complaint createComplaint(SchoolDtos.ComplaintRequest request) {
        UserAccount author = users.findById(access.current().getId()).orElseThrow();
        Complaint c = new Complaint();
        c.setCreatedBy(author);
        c.setCategory(request.category());
        c.setTitle(request.title());
        c.setDescription(request.description());
        c.setStatus("OPEN");
        if (request.studentId() != null) {
            Student student = access.requireStudentAccess(request.studentId());
            c.setStudent(student);
            c.setBranch(student.getBranch());
        } else if (access.current().getBranchId() != null) {
            c.setBranch(staff.findByUserId(author.getId()).map(Staff::getBranch)
                    .orElseThrow(() -> ApiException.badRequest("Branch could not be resolved")));
        } else {
            throw ApiException.badRequest("Unable to resolve branch for complaint");
        }
        complaints.save(c);
        return c;
    }

    public List<Complaint> myComplaints() {
        if (access.isAdminLike()) {
            UUID branchId = access.current().getBranchId();
            return complaints.findAll().stream()
                    .filter(c -> access.current().getRole() == Role.SUPER_ADMIN || c.getBranch().getId().equals(branchId))
                    .toList();
        }
        UUID userId = access.current().getId();
        return complaints.findAll().stream().filter(c -> c.getCreatedBy().getId().equals(userId)).toList();
    }

    @Transactional
    public ComplaintComment addComplaintComment(UUID complaintId, String body) {
        Complaint c = complaints.findById(complaintId).orElseThrow(() -> ApiException.notFound("Complaint not found"));
        if (!access.isAdminLike() && !c.getCreatedBy().getId().equals(access.current().getId())) {
            throw ApiException.forbidden("Not allowed to comment");
        }
        access.assertBranch(c.getBranch().getId());
        ComplaintComment comment = new ComplaintComment();
        comment.setComplaint(c);
        comment.setAuthor(users.findById(access.current().getId()).orElseThrow());
        comment.setBody(body);
        comments.save(comment);
        return comment;
    }

    private boolean visible(Notice notice) {
        var user = access.current();
        if (!notice.isPublished()) {
            return false;
        }
        return switch (notice.getAudienceType()) {
            case "SCHOOL" -> true;
            case "BRANCH" -> user.getRole() == Role.SUPER_ADMIN
                    || (notice.getBranch() != null && notice.getBranch().getId().equals(user.getBranchId()));
            case "ROLE" -> notice.getRoleTarget() != null && notice.getRoleTarget().equals(user.getRole().name());
            case "SECTION", "CLASS" -> user.getRole() == Role.SUPER_ADMIN || user.getRole() == Role.BRANCH_ADMIN
                    || user.getRole() == Role.PRINCIPAL || user.getRole() == Role.TEACHER
                    || user.getRole() == Role.STUDENT || user.getRole() == Role.PARENT;
            default -> false;
        };
    }

    private String grade(BigDecimal obtained, BigDecimal max) {
        if (max.signum() == 0) {
            return "NA";
        }
        BigDecimal pct = obtained.multiply(BigDecimal.valueOf(100)).divide(max, 2, RoundingMode.HALF_UP);
        if (pct.compareTo(BigDecimal.valueOf(90)) >= 0) return "A+";
        if (pct.compareTo(BigDecimal.valueOf(80)) >= 0) return "A";
        if (pct.compareTo(BigDecimal.valueOf(70)) >= 0) return "B";
        if (pct.compareTo(BigDecimal.valueOf(60)) >= 0) return "C";
        if (pct.compareTo(BigDecimal.valueOf(50)) >= 0) return "D";
        return "F";
    }
}
